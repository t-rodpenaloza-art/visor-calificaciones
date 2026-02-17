using System.Web;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using BackDotnet.Models;
using BackDotnet.Services;

namespace BackDotnet.Functions;

public class OAuthCallback
{
    private readonly ICanvasOAuthService _oauthService;
    private readonly ILogger<OAuthCallback> _logger;

    public OAuthCallback(ICanvasOAuthService oauthService, ILogger<OAuthCallback> logger)
    {
        _oauthService = oauthService;
        _logger = logger;
    }

    [Function("OAuthCallback")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "oauth/callback")] HttpRequestData req)
    {
        var config = CanvasConfig.FromEnvironment();

        try
        {
            var code = req.Query["code"];
            var error = req.Query["error"];
            var state = req.Query["state"]; // userId que enviamos

            // Si Canvas devuelve error (usuario denegó acceso)
            if (!string.IsNullOrEmpty(error))
            {
                _logger.LogWarning("Usuario denegó acceso a Canvas: {Error}", error);
                var errorResponse = req.CreateResponse(System.Net.HttpStatusCode.Redirect);
                errorResponse.Headers.Add("Location", $"{config.FrontendUrl}/seguimiento?error=canvas_denied");
                return errorResponse;
            }

            if (string.IsNullOrEmpty(code))
            {
                var badResponse = req.CreateResponse(System.Net.HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(new { error = "No se recibió código de autorización" });
                return badResponse;
            }

            _logger.LogInformation("Intercambiando código por token para usuario: {State}", state);

            // Intercambiar código por tokens
            var tokenData = await _oauthService.ExchangeCodeForTokenAsync(code);

            _logger.LogInformation("Token obtenido exitosamente para usuario Canvas ID: {UserId}", tokenData.User?.Id);
            //Solo para demo, eliminar o comentar para produccion
            _logger.LogInformation("Refresh Token: {RefreshToken}", tokenData.RefreshToken);
            _logger.LogInformation("Access Token: {AccessToken}", tokenData.AccessToken);

            // Redirigir al frontend con el access_token como query param
            var redirectUrl = $"{config.FrontendUrl}/seguimiento" +
                $"?access_token={HttpUtility.UrlEncode(tokenData.AccessToken)}" +
                $"&expires_in={tokenData.ExpiresIn}";

            if (tokenData.User != null)
            {
                redirectUrl += $"&user_id={tokenData.User.Id}" +
                    $"&user_name={HttpUtility.UrlEncode(tokenData.User.Name)}";
            }

            var response = req.CreateResponse(System.Net.HttpStatusCode.Redirect);
            response.Headers.Add("Location", redirectUrl);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en oauth/callback");
            var errorDetail = HttpUtility.UrlEncode(ex.Message ?? "unknown");
            var response = req.CreateResponse(System.Net.HttpStatusCode.Redirect);
            response.Headers.Add("Location",
                $"{config.FrontendUrl}/seguimiento?error=token_exchange_failed&detail={errorDetail}");
            return response;
        }
    }
}
