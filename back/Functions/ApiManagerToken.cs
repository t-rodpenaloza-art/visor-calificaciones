using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using BackDotnet.Services;

namespace BackDotnet.Functions;

public class ApiManagerToken
{
    private readonly ApiManagerService _apiManagerService;
    private readonly ILogger<ApiManagerToken> _logger;

    public ApiManagerToken(ApiManagerService apiManagerService, ILogger<ApiManagerToken> logger)
    {
        _apiManagerService = apiManagerService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene el OAuth token del API Manager (client_credentials).
    /// GET /api/auth/apimanager/token
    /// 
    /// Este token autentica la APLICACIÓN (habilitador) ante el API Manager.
    /// Se cachea automáticamente y se renueva cuando expira.
    /// 
    /// Response: { "authenticated": true, "tokenType": "Bearer", "expiresIn": 3599 }
    /// NOTA: NO se devuelve el token al frontend por seguridad.
    /// </summary>
    [Function("ApiManagerToken")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/apimanager/token")] HttpRequestData req)
    {
        try
        {
            var token = await _apiManagerService.GetOAuthTokenAsync();

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                authenticated = true,
                tokenType = "Bearer",
                message = "OAuth token obtenido y cacheado en el backend. Usar el proxy /api/apimanager/{path} para llamar a las APIs."
            });
            return response;
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Credenciales no configuradas");
            var response = req.CreateResponse(HttpStatusCode.ServiceUnavailable);
            await response.WriteAsJsonAsync(new
            {
                authenticated = false,
                error = ex.Message,
                action = "Configurar APIM_CLIENT_ID, APIM_CLIENT_SECRET y APIM_SCOPE en las variables de entorno"
            });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo OAuth token del API Manager");
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(new
            {
                authenticated = false,
                error = ex.Message
            });
            return response;
        }
    }
}
