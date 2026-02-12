using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using BackDotnet.Services;

namespace BackDotnet.Functions;

public class OAuthAuthorize
{
    private readonly ICanvasOAuthService _oauthService;
    private readonly ILogger<OAuthAuthorize> _logger;

    public OAuthAuthorize(ICanvasOAuthService oauthService, ILogger<OAuthAuthorize> logger)
    {
        _oauthService = oauthService;
        _logger = logger;
    }

    [Function("OAuthAuthorize")]
    public HttpResponseData Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "oauth/authorize")] HttpRequestData req)
    {
        try
        {
            var userId = req.Query["userId"] ?? string.Empty;
            var authUrl = _oauthService.BuildAuthorizationUrl(userId);

            _logger.LogInformation("Redirigiendo a Canvas OAuth para usuario: {UserId}", userId);

            var response = req.CreateResponse(System.Net.HttpStatusCode.Redirect);
            response.Headers.Add("Location", authUrl);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en oauth/authorize");
            var response = req.CreateResponse(System.Net.HttpStatusCode.InternalServerError);
            response.WriteAsJsonAsync(new { error = "Error al construir URL de autorización", detail = ex.Message });
            return response;
        }
    }
}
