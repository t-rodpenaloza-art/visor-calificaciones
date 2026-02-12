using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using BackDotnet.Models;
using BackDotnet.Services;

namespace BackDotnet.Functions;

public class TokenValidate
{
    private readonly ICanvasOAuthService _oauthService;
    private readonly ILogger<TokenValidate> _logger;

    public TokenValidate(ICanvasOAuthService oauthService, ILogger<TokenValidate> logger)
    {
        _oauthService = oauthService;
        _logger = logger;
    }

    [Function("TokenValidate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "oauth/token/validate")] HttpRequestData req)
    {
        try
        {
            var userId = req.Query["userId"];

            if (string.IsNullOrEmpty(userId))
            {
                var badResponse = req.CreateResponse(System.Net.HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(new { error = "Se requiere userId como query parameter" });
                return badResponse;
            }

            _logger.LogInformation("Validando token para usuario: {UserId}", userId);

            // Intentar obtener token válido (busca en BD → refresh si existe)
            var tokenData = await _oauthService.GetValidTokenForUserAsync(userId);

            var response = req.CreateResponse(System.Net.HttpStatusCode.OK);

            if (tokenData != null)
            {
                _logger.LogInformation("Token renovado exitosamente para usuario: {UserId}", userId);
                await response.WriteAsJsonAsync(new TokenValidationResponse
                {
                    Authenticated = true,
                    AccessToken = tokenData.AccessToken,
                    ExpiresIn = tokenData.ExpiresIn,
                    User = tokenData.User,
                });
            }
            else
            {
                _logger.LogInformation("No hay token para usuario: {UserId}, requiere autorización", userId);
                var authUrl = _oauthService.BuildAuthorizationUrl(userId);
                await response.WriteAsJsonAsync(new TokenValidationResponse
                {
                    Authenticated = false,
                    AuthorizationUrl = authUrl,
                });
            }

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en token/validate");
            var response = req.CreateResponse(System.Net.HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(new { error = "Error al validar token", detail = ex.Message });
            return response;
        }
    }
}
