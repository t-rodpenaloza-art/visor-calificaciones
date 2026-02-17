namespace BackDotnet.Models;

/// <summary>
/// Configuración del API Manager del Tec
/// </summary>
public class ApiManagerConfig
{
    /// <summary>
    /// Endpoint de Microsoft Entra ID para obtener OAuth token (client_credentials)
    /// Mismo para PPRD y PROD
    /// </summary>
    public string OAuthTokenUrl { get; set; } = string.Empty;

    /// <summary>
    /// client_id del habilitador registrado en API Manager
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// client_secret correspondiente al client_id
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// Scope: api://{username}/.default
    /// </summary>
    public string Scope { get; set; } = string.Empty;

    /// <summary>
    /// URL base del API Gateway (PPRD: https://apigateway-qa.tec.mx, PROD: https://apigateway.tec.mx)
    /// </summary>
    public string ApiGatewayBaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// Endpoint para generar JWT de usuario
    /// PPRD: https://apigateway-qa.tec.mx/ti/seguridad/jwt/token
    /// PROD: https://apigateway.tec.mx/ti/seguridad/jwt/token
    /// </summary>
    public string JwtTokenUrl { get; set; } = string.Empty;

    public static ApiManagerConfig FromEnvironment()
    {
        return new ApiManagerConfig
        {
            OAuthTokenUrl = Environment.GetEnvironmentVariable("APIM_OAUTH_TOKEN_URL")
                ?? "https://login.microsoftonline.com/c65a3ea6-0f7c-400b-8934-5a6dc1705645/oauth2/v2.0/token",
            ClientId = Environment.GetEnvironmentVariable("APIM_CLIENT_ID") ?? string.Empty,
            ClientSecret = Environment.GetEnvironmentVariable("APIM_CLIENT_SECRET") ?? string.Empty,
            Scope = Environment.GetEnvironmentVariable("APIM_SCOPE") ?? string.Empty,
            ApiGatewayBaseUrl = Environment.GetEnvironmentVariable("APIM_GATEWAY_BASE_URL")
                ?? "https://apigateway-qa.tec.mx",
            JwtTokenUrl = Environment.GetEnvironmentVariable("APIM_JWT_TOKEN_URL")
                ?? "https://apigateway-qa.tec.mx/ti/seguridad/jwt/token"
        };
    }
}

/// <summary>
/// Respuesta del endpoint OAuth de Microsoft Entra ID
/// </summary>
public class OAuthTokenResponse
{
    public string token_type { get; set; } = string.Empty;
    public int expires_in { get; set; }
    public int ext_expires_in { get; set; }
    public string access_token { get; set; } = string.Empty;
}

/// <summary>
/// Respuesta del endpoint JWT del API Manager
/// </summary>
public class JwtTokenResponse
{
    public JwtMeta? meta { get; set; }
    public JsonApiVersion? jsonapi { get; set; }
    public JsonApiLinks? links { get; set; }
}

public class JwtMeta
{
    public string token { get; set; } = string.Empty;
}

public class JsonApiVersion
{
    public string version { get; set; } = string.Empty;
}

public class JsonApiLinks
{
    public string self { get; set; } = string.Empty;
}

/// <summary>
/// Datos del usuario necesarios para generar el JWT
/// </summary>
public class UserClaimsRequest
{
    /// <summary>
    /// Identificador de afiliación (ej: A01234567, L03532317)
    /// </summary>
    public string IssClaim { get; set; } = string.Empty;

    /// <summary>
    /// Correo electrónico del usuario (ej: a01234567@tec.mx)
    /// </summary>
    public string AudClaim { get; set; } = string.Empty;

    /// <summary>
    /// Rol del usuario (ej: "self", "Colaborador")
    /// </summary>
    public string SubClaim { get; set; } = "self";

    /// <summary>
    /// Identificador de persona (opcional, ej: @01234567)
    /// </summary>
    public string? TecIdPersona { get; set; }
}
