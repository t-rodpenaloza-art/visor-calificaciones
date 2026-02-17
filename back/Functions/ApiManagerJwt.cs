using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using BackDotnet.Models;
using BackDotnet.Services;

namespace BackDotnet.Functions;

public class ApiManagerJwt
{
    private readonly ApiManagerService _apiManagerService;
    private readonly ILogger<ApiManagerJwt> _logger;

    public ApiManagerJwt(ApiManagerService apiManagerService, ILogger<ApiManagerJwt> logger)
    {
        _apiManagerService = apiManagerService;
        _logger = logger;
    }

    /// <summary>
    /// Genera un JWT de usuario para el API Manager.
    /// GET /api/auth/apimanager/jwt?issClaim=L03532317&audClaim=t-rodpenaloza@tec.mx&subClaim=self
    /// 
    /// Este token identifica al USUARIO y se envía como X-Auth-JWT en las llamadas a APIs.
    /// Requiere primero un OAuth token válido (se obtiene automáticamente).
    /// 
    /// Parámetros:
    ///   - issClaim (requerido): Identificador de afiliación (ej: A01234567, L03532317)
    ///   - audClaim (requerido): Correo electrónico (ej: a01234567@tec.mx)
    ///   - subClaim (opcional): Rol del usuario (default: "self")
    ///   - tecIdPersona (opcional): Identificador de persona (ej: @01234567)
    /// 
    /// Response: { "authenticated": true, "jwt": "eyJ..." }
    /// </summary>
    [Function("ApiManagerJwt")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/apimanager/jwt")] HttpRequestData req)
    {
        try
        {
            var issClaim = req.Query["issClaim"];
            var audClaim = req.Query["audClaim"];
            var subClaim = req.Query["subClaim"] ?? "self";
            var tecIdPersona = req.Query["tecIdPersona"];

            if (string.IsNullOrEmpty(issClaim) || string.IsNullOrEmpty(audClaim))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(new
                {
                    error = "Se requieren los parámetros issClaim y audClaim",
                    ejemplo = "/api/auth/apimanager/jwt?issClaim=L03532317&audClaim=t-rodpenaloza@tec.mx"
                });
                return badResponse;
            }

            var userClaims = new UserClaimsRequest
            {
                IssClaim = issClaim,
                AudClaim = audClaim,
                SubClaim = subClaim,
                TecIdPersona = tecIdPersona
            };

            var jwtToken = await _apiManagerService.GetJwtTokenAsync(userClaims);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                authenticated = true,
                jwt = jwtToken,
                user = issClaim,
                message = "JWT generado. También se puede usar directamente el proxy /api/apimanager/{path} que obtiene ambos tokens automáticamente."
            });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generando JWT del API Manager");
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
