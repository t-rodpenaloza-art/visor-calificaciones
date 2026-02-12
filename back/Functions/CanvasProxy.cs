using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using BackDotnet.Models;

namespace BackDotnet.Functions;

public class CanvasProxy
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CanvasProxy> _logger;

    public CanvasProxy(IHttpClientFactory httpClientFactory, ILogger<CanvasProxy> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [Function("CanvasProxy")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", "put", "delete", Route = "canvas/{*path}")] HttpRequestData req,
        string path)
    {
        var config = CanvasConfig.FromEnvironment();

        try
        {
            // Obtener el token del header Authorization
            var authHeader = req.Headers.TryGetValues("Authorization", out var authValues)
                ? authValues.FirstOrDefault()
                : null;

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorizedResponse.WriteAsJsonAsync(new
                {
                    error = "Se requiere header Authorization: Bearer <token>"
                });
                return unauthorizedResponse;
            }

            var accessToken = authHeader.Replace("Bearer ", "");
            var allPages = req.Query["_allPages"] == "true";

            // Construir URL de Canvas
            var canvasPath = $"/api/v1/{path}";
            var queryString = BuildQueryString(req.Url, excludeKey: "_allPages");
            var canvasUrl = $"{config.ApiBaseUrl}{canvasPath}{queryString}";

            // Si se solicita paginación automática
            if (allPages && req.Method == "GET")
            {
                return await FetchAllPagesAsync(req, canvasUrl, accessToken);
            }

            // Petición simple
            var (canvasResponse, responseBody) = await FetchFromCanvasAsync(canvasUrl, req.Method, accessToken,
                req.Method != "GET" ? await req.ReadAsStringAsync() : null);

            // Log de rate limiting
            LogRateLimiting(canvasResponse);

            var response = req.CreateResponse((HttpStatusCode)canvasResponse.StatusCode);
            response.Headers.Add("Content-Type",
                canvasResponse.Content.Headers.ContentType?.ToString() ?? "application/json");

            if (canvasResponse.Headers.TryGetValues("X-Rate-Limit-Remaining", out var rateLimitValues))
                response.Headers.Add("X-Rate-Limit-Remaining", rateLimitValues.First());
            if (canvasResponse.Headers.TryGetValues("X-Request-Cost", out var costValues))
                response.Headers.Add("X-Request-Cost", costValues.First());

            await response.WriteStringAsync(responseBody);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en canvas proxy");
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(new { error = "Error al comunicarse con Canvas", detail = ex.Message });
            return response;
        }
    }

    /// <summary>
    /// Obtiene todas las páginas de un endpoint paginado de Canvas
    /// </summary>
    private async Task<HttpResponseData> FetchAllPagesAsync(
        HttpRequestData req, string initialUrl, string accessToken)
    {
        var allResults = new List<JsonElement>();
        string? nextUrl = initialUrl;
        var pageCount = 0;
        const int maxPages = 50;

        while (nextUrl != null && pageCount < maxPages)
        {
            pageCount++;

            var (canvasResponse, responseBody) = await FetchFromCanvasAsync(nextUrl, "GET", accessToken);

            // Verificar rate limiting
            if (canvasResponse.Headers.TryGetValues("X-Rate-Limit-Remaining", out var rateLimitValues))
            {
                if (double.TryParse(rateLimitValues.First(), out var remaining) && remaining < 50)
                {
                    _logger.LogWarning(
                        "Rate limit muy bajo ({Remaining}), deteniendo paginación en página {Page}",
                        remaining, pageCount);
                    break;
                }
            }

            if (!canvasResponse.IsSuccessStatusCode)
            {
                var errorResponse = req.CreateResponse((HttpStatusCode)canvasResponse.StatusCode);
                await errorResponse.WriteStringAsync(responseBody);
                return errorResponse;
            }

            var pageData = JsonSerializer.Deserialize<JsonElement>(responseBody);
            if (pageData.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in pageData.EnumerateArray())
                {
                    allResults.Add(item);
                }
            }
            else
            {
                allResults.Add(pageData);
            }

            // Buscar la URL de la siguiente página en el header Link
            nextUrl = ParseLinkHeader(canvasResponse);

            _logger.LogInformation("Página {Page} obtenida: items acumulados {Total}", pageCount, allResults.Count);
        }

        _logger.LogInformation("Paginación completa: {Pages} páginas, {Total} items totales", pageCount, allResults.Count);

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(allResults);
        return response;
    }

    /// <summary>
    /// Extrae la URL "next" del header Link de Canvas
    /// </summary>
    private static string? ParseLinkHeader(HttpResponseMessage response)
    {
        if (!response.Headers.TryGetValues("Link", out var linkValues))
            return null;

        var linkHeader = linkValues.FirstOrDefault();
        if (string.IsNullOrEmpty(linkHeader))
            return null;

        var match = Regex.Match(linkHeader, @"<([^>]+)>;\s*rel=""next""");
        return match.Success ? match.Groups[1].Value : null;
    }

    /// <summary>
    /// Wrapper de fetch con retry para rate limiting (429/403)
    /// </summary>
    private async Task<(HttpResponseMessage Response, string Body)> FetchFromCanvasAsync(
        string url, string method, string accessToken, string? requestBody = null, int retries = 3)
    {
        var client = _httpClientFactory.CreateClient("Canvas");

        var request = new HttpRequestMessage(new HttpMethod(method), url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        if (requestBody != null)
        {
            request.Content = new StringContent(requestBody, System.Text.Encoding.UTF8, "application/json");
        }

        var response = await client.SendAsync(request);

        // Si Canvas nos throttlea, esperar y reintentar
        if ((response.StatusCode == HttpStatusCode.Forbidden ||
             response.StatusCode == HttpStatusCode.TooManyRequests) && retries > 0)
        {
            var waitTime = 1000 * (4 - retries);
            await Task.Delay(waitTime);
            return await FetchFromCanvasAsync(url, method, accessToken, requestBody, retries - 1);
        }

        var body = await response.Content.ReadAsStringAsync();
        return (response, body);
    }

    /// <summary>
    /// Construye query string excluyendo parámetros internos
    /// </summary>
    private static string BuildQueryString(Uri uri, string excludeKey)
    {
        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
        query.Remove(excludeKey);
        var result = query.ToString();
        return string.IsNullOrEmpty(result) ? string.Empty : $"?{result}";
    }

    private void LogRateLimiting(HttpResponseMessage response)
    {
        if (response.Headers.TryGetValues("X-Rate-Limit-Remaining", out var rateLimitValues))
        {
            var remaining = rateLimitValues.First();
            response.Headers.TryGetValues("X-Request-Cost", out var costValues);
            var cost = costValues?.FirstOrDefault() ?? "N/A";

            _logger.LogInformation("Canvas Rate Limit: remaining={Remaining}, cost={Cost}", remaining, cost);

            if (double.TryParse(remaining, out var remainingNum) && remainingNum < 100)
            {
                _logger.LogWarning("⚠️ Rate limit bajo: {Remaining} unidades restantes", remaining);
            }
        }
    }
}
