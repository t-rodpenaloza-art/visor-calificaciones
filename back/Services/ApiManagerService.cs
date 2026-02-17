using System.Text.Json;
using BackDotnet.Models;
using Microsoft.Extensions.Logging;

namespace BackDotnet.Services;

/// <summary>
/// Servicio para autenticación y proxy contra el API Manager del Tec (Azure APIM)
/// 
/// Flujo completo:
/// 1. Obtener OAuth token (client_credentials) → autentica la APLICACIÓN
/// 2. Obtener JWT de usuario → identifica al USUARIO en la sesión
/// 3. Llamar a la API con ambos tokens en los headers
/// </summary>
public class ApiManagerService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ApiManagerService> _logger;

    // Cache del OAuth token (es por aplicación, no por usuario)
    private static string? _cachedOAuthToken;
    private static DateTime _oAuthTokenExpiresAt = DateTime.MinValue;
    private static readonly SemaphoreSlim _tokenLock = new(1, 1);

    // Cache de JWT tokens por usuario (key: issClaim)
    private static readonly Dictionary<string, (string Token, DateTime ExpiresAt)> _jwtCache = new();
    private static readonly SemaphoreSlim _jwtLock = new(1, 1);

    public ApiManagerService(IHttpClientFactory httpClientFactory, ILogger<ApiManagerService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    // ================================================================
    // PASO 1: OAuth Token (client_credentials)
    // Autentica la aplicación (habilitador) ante Microsoft Entra ID
    // ================================================================

    /// <summary>
    /// Obtiene un OAuth token válido, usando cache si aún no expira.
    /// POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
    /// Body: client_id, client_secret, scope, grant_type=client_credentials
    /// </summary>
    public async Task<string> GetOAuthTokenAsync()
    {
        // Si el token cacheado aún es válido (con 5 min de margen), reutilizar
        if (_cachedOAuthToken != null && DateTime.UtcNow < _oAuthTokenExpiresAt.AddMinutes(-5))
        {
            _logger.LogInformation("Usando OAuth token cacheado (expira en {Minutes} min)",
                (_oAuthTokenExpiresAt - DateTime.UtcNow).TotalMinutes);
            return _cachedOAuthToken;
        }

        await _tokenLock.WaitAsync();
        try
        {
            // Doble check después del lock
            if (_cachedOAuthToken != null && DateTime.UtcNow < _oAuthTokenExpiresAt.AddMinutes(-5))
                return _cachedOAuthToken;

            var config = ApiManagerConfig.FromEnvironment();

            if (string.IsNullOrEmpty(config.ClientId) || string.IsNullOrEmpty(config.ClientSecret))
                throw new InvalidOperationException(
                    "APIM_CLIENT_ID y APIM_CLIENT_SECRET no están configurados. " +
                    "Solicitar credenciales al equipo de API Manager (shg@tec.mx).");

            var client = _httpClientFactory.CreateClient();

            var formData = new Dictionary<string, string>
            {
                { "client_id", config.ClientId },
                { "client_secret", config.ClientSecret },
                { "scope", config.Scope },
                { "grant_type", "client_credentials" }
            };

            _logger.LogInformation("Solicitando OAuth token a Microsoft Entra ID...");

            var response = await client.PostAsync(
                config.OAuthTokenUrl,
                new FormUrlEncodedContent(formData));

            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Error obteniendo OAuth token: {Status} - {Body}",
                    response.StatusCode, responseBody);
                throw new HttpRequestException(
                    $"Error obteniendo OAuth token: {response.StatusCode} - {responseBody}");
            }

            var tokenResponse = JsonSerializer.Deserialize<OAuthTokenResponse>(responseBody);

            if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.access_token))
                throw new InvalidOperationException("Respuesta de OAuth token vacía o inválida");

            // Cachear el token
            _cachedOAuthToken = tokenResponse.access_token;
            _oAuthTokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.expires_in);

            _logger.LogInformation("OAuth token obtenido exitosamente (expira en {Seconds}s)",
                tokenResponse.expires_in);

            return _cachedOAuthToken;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    // ================================================================
    // PASO 2: JWT de Usuario
    // Identifica al usuario que está usando la aplicación
    // ================================================================

    /// <summary>
    /// Genera un JWT de usuario llamando al endpoint del API Manager.
    /// POST https://apigateway-qa.tec.mx/ti/seguridad/jwt/token
    /// Headers: Authorization (Bearer OAuth), iss-claim, aud-claim, sub-claim, tec-id-persona
    /// </summary>
    public async Task<string> GetJwtTokenAsync(UserClaimsRequest userClaims)
    {
        // Verificar cache de JWT para este usuario
        var cacheKey = userClaims.IssClaim.ToLower();

        await _jwtLock.WaitAsync();
        try
        {
            if (_jwtCache.TryGetValue(cacheKey, out var cached) &&
                DateTime.UtcNow < cached.ExpiresAt.AddMinutes(-5))
            {
                _logger.LogInformation("Usando JWT cacheado para {User} (expira en {Minutes} min)",
                    cacheKey, (cached.ExpiresAt - DateTime.UtcNow).TotalMinutes);
                return cached.Token;
            }
        }
        finally
        {
            _jwtLock.Release();
        }

        var config = ApiManagerConfig.FromEnvironment();

        // Primero necesitamos el OAuth token
        var oauthToken = await GetOAuthTokenAsync();

        var client = _httpClientFactory.CreateClient();

        var request = new HttpRequestMessage(HttpMethod.Post, config.JwtTokenUrl);
        request.Headers.Add("Authorization", $"Bearer {oauthToken}");
        request.Headers.Add("iss-claim", userClaims.IssClaim);
        request.Headers.Add("aud-claim", userClaims.AudClaim);
        request.Headers.Add("sub-claim", userClaims.SubClaim);

        if (!string.IsNullOrEmpty(userClaims.TecIdPersona))
            request.Headers.Add("tec-id-persona", userClaims.TecIdPersona);

        _logger.LogInformation("Solicitando JWT para usuario {User}...", userClaims.IssClaim);

        var response = await client.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Error obteniendo JWT: {Status} - {Body}",
                response.StatusCode, responseBody);
            throw new HttpRequestException(
                $"Error obteniendo JWT: {response.StatusCode} - {responseBody}");
        }

        var jwtResponse = JsonSerializer.Deserialize<JwtTokenResponse>(responseBody);

        if (jwtResponse?.meta?.token == null)
            throw new InvalidOperationException("Respuesta de JWT vacía o inválida");

        var jwtToken = jwtResponse.meta.token;

        // Cachear el JWT (1 hora por defecto)
        await _jwtLock.WaitAsync();
        try
        {
            _jwtCache[cacheKey] = (jwtToken, DateTime.UtcNow.AddHours(1));
        }
        finally
        {
            _jwtLock.Release();
        }

        _logger.LogInformation("JWT obtenido exitosamente para {User}", userClaims.IssClaim);

        return jwtToken;
    }

    // ================================================================
    // PASO 3: Proxy a las APIs del Tec
    // Llama a las APIs con ambos tokens (OAuth + JWT)
    // ================================================================

    /// <summary>
    /// Hace una petición al API Manager con ambos tokens.
    /// Headers enviados: Authorization (Bearer OAuth), X-Auth-JWT, Accept
    /// </summary>
    public async Task<(HttpResponseMessage Response, string Body)> CallApiAsync(
        string path,
        string method = "GET",
        UserClaimsRequest? userClaims = null,
        string? requestBody = null)
    {
        var config = ApiManagerConfig.FromEnvironment();

        // Obtener tokens
        var oauthToken = await GetOAuthTokenAsync();
        string? jwtToken = null;

        if (userClaims != null)
        {
            jwtToken = await GetJwtTokenAsync(userClaims);
        }

        var client = _httpClientFactory.CreateClient();
        var url = $"{config.ApiGatewayBaseUrl}/{path.TrimStart('/')}";

        var request = new HttpRequestMessage(new HttpMethod(method), url);
        request.Headers.Add("Authorization", $"Bearer {oauthToken}");
        request.Headers.Add("Accept", "application/vnd.api+json");

        if (jwtToken != null)
            request.Headers.Add("X-Auth-JWT", jwtToken);

        if (requestBody != null)
        {
            request.Content = new StringContent(
                requestBody, System.Text.Encoding.UTF8, "application/json");
        }

        _logger.LogInformation("API Manager request: {Method} {Url}", method, url);

        var response = await client.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();

        // Si el token expiró (401 con TokenExpired), renovar y reintentar
        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized &&
            body.Contains("TokenExpired"))
        {
            _logger.LogWarning("OAuth token expirado, renovando...");
            InvalidateOAuthCache();

            if (userClaims != null)
                InvalidateJwtCache(userClaims.IssClaim);

            // Reintentar con tokens nuevos
            oauthToken = await GetOAuthTokenAsync();

            var retryRequest = new HttpRequestMessage(new HttpMethod(method), url);
            retryRequest.Headers.Add("Authorization", $"Bearer {oauthToken}");
            retryRequest.Headers.Add("Accept", "application/vnd.api+json");

            if (userClaims != null)
            {
                jwtToken = await GetJwtTokenAsync(userClaims);
                retryRequest.Headers.Add("X-Auth-JWT", jwtToken);
            }

            if (requestBody != null)
            {
                retryRequest.Content = new StringContent(
                    requestBody, System.Text.Encoding.UTF8, "application/json");
            }

            response = await client.SendAsync(retryRequest);
            body = await response.Content.ReadAsStringAsync();
        }

        _logger.LogInformation("API Manager response: {Status}", response.StatusCode);

        return (response, body);
    }

    /// <summary>
    /// Invalida el cache del OAuth token
    /// </summary>
    public static void InvalidateOAuthCache()
    {
        _cachedOAuthToken = null;
        _oAuthTokenExpiresAt = DateTime.MinValue;
    }

    /// <summary>
    /// Invalida el cache de JWT de un usuario específico
    /// </summary>
    public static void InvalidateJwtCache(string issClaim)
    {
        _jwtCache.Remove(issClaim.ToLower());
    }
}
