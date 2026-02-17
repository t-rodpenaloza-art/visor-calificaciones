using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using BackDotnet.Models;
using BackDotnet.Services;

namespace BackDotnet.Functions;

public class ApiManagerProxy
{
    private readonly ApiManagerService _apiManagerService;
    private readonly ILogger<ApiManagerProxy> _logger;

    public ApiManagerProxy(ApiManagerService apiManagerService, ILogger<ApiManagerProxy> logger)
    {
        _apiManagerService = apiManagerService;
        _logger = logger;
    }

    /// <summary>
    /// Proxy genérico al API Manager del Tec.
    /// GET/POST /api/apimanager/{path}
    /// 
    /// El frontend manda la ruta y opcionalmente los claims del usuario.
    /// El backend obtiene automáticamente el OAuth token y JWT, y hace la llamada.
    /// 
    /// Headers opcionales del frontend:
    ///   - X-Iss-Claim: Identificador de afiliación (ej: L03532317)
    ///   - X-Aud-Claim: Correo del usuario (ej: t-rodpenaloza@tec.mx)
    ///   - X-Sub-Claim: Rol del usuario (default: "self")
    ///   - X-Tec-Id-Persona: Identificador de persona (opcional)
    /// 
    /// Si no se envían claims, se hace la llamada solo con OAuth (sin JWT).
    /// Algunas APIs no requieren JWT.
    /// 
    /// Ejemplo desde el frontend:
    ///   GET /api/apimanager/tec/alumnos?nombre=Juan&ejercicio-academico=202611
    ///   Headers: X-Iss-Claim: L03532317, X-Aud-Claim: t-rodpenaloza@tec.mx
    ///   
    ///   → Backend llama: GET https://apigateway-qa.tec.mx/tec/alumnos?nombre=Juan&ejercicio-academico=202611
    ///     con headers: Authorization: Bearer {oauth}, X-Auth-JWT: {jwt}, Accept: application/vnd.api+json
    /// </summary>
    [Function("ApiManagerProxy")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", "put", "delete",
            Route = "apimanager/{*path}")] HttpRequestData req,
        string path)
    {
        try
        {
            // Extraer claims del usuario de los headers (si los envía el frontend)
            UserClaimsRequest? userClaims = null;

            var issClaim = GetHeaderValue(req, "X-Iss-Claim");
            var audClaim = GetHeaderValue(req, "X-Aud-Claim");

            if (!string.IsNullOrEmpty(issClaim) && !string.IsNullOrEmpty(audClaim))
            {
                userClaims = new UserClaimsRequest
                {
                    IssClaim = issClaim,
                    AudClaim = audClaim,
                    SubClaim = GetHeaderValue(req, "X-Sub-Claim") ?? "self",
                    TecIdPersona = GetHeaderValue(req, "X-Tec-Id-Persona")
                };
            }

            // Construir la ruta completa con query string
            var queryString = req.Url.Query;
            var fullPath = $"{path}{queryString}";

            // Leer body si no es GET
            string? requestBody = null;
            if (req.Method != "GET")
            {
                requestBody = await req.ReadAsStringAsync();
            }

            // Llamar al API Manager
            var (apiResponse, responseBody) = await _apiManagerService.CallApiAsync(
                fullPath, req.Method, userClaims, requestBody);

            // Construir respuesta
            var response = req.CreateResponse((HttpStatusCode)apiResponse.StatusCode);

            var contentType = apiResponse.Content.Headers.ContentType?.ToString()
                ?? "application/vnd.api+json";
            response.Headers.Add("Content-Type", contentType);

            await response.WriteStringAsync(responseBody);

            return response;
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Credenciales no configuradas para API Manager");
            var response = req.CreateResponse(HttpStatusCode.ServiceUnavailable);
            await response.WriteAsJsonAsync(new
            {
                error = "API Manager no configurado",
                detail = ex.Message,
                action = "Configurar APIM_CLIENT_ID, APIM_CLIENT_SECRET y APIM_SCOPE"
            });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en API Manager proxy: {Path}", path);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(new
            {
                error = "Error al comunicarse con API Manager",
                detail = ex.Message
            });
            return response;
        }
    }

    private static string? GetHeaderValue(HttpRequestData req, string headerName)
    {
        return req.Headers.TryGetValues(headerName, out var values)
            ? values.FirstOrDefault()
            : null;
    }
}
