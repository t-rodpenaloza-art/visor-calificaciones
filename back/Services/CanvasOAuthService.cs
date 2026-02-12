using System.Net.Http.Json;
using System.Web;
using BackDotnet.Models;

namespace BackDotnet.Services;

public interface ICanvasOAuthService
{
    string BuildAuthorizationUrl(string? state = null);
    Task<CanvasTokenResponse> ExchangeCodeForTokenAsync(string code);
    Task<CanvasTokenResponse> RefreshAccessTokenAsync(string refreshToken);
    Task<CanvasTokenResponse?> GetValidTokenForUserAsync(string userId);
}

public class CanvasOAuthService : ICanvasOAuthService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ITokenStorageService _tokenStorage;

    public CanvasOAuthService(IHttpClientFactory httpClientFactory, ITokenStorageService tokenStorage)
    {
        _httpClientFactory = httpClientFactory;
        _tokenStorage = tokenStorage;
    }

    /// <summary>
    /// Construye la URL de autorización de Canvas OAuth2
    /// </summary>
    public string BuildAuthorizationUrl(string? state = null)
    {
        var config = CanvasConfig.FromEnvironment();

        var query = HttpUtility.ParseQueryString(string.Empty);
        query["client_id"] = config.ClientId;
        query["response_type"] = "code";
        query["redirect_uri"] = config.RedirectUri;
        query["state"] = state ?? Guid.NewGuid().ToString();

        // Solo agregar scope si hay scopes configurados válidos
        var scopesString = string.Join(" ", config.Scopes.Where(s => !string.IsNullOrWhiteSpace(s)));
        if (!string.IsNullOrEmpty(scopesString))
        {
            query["scope"] = scopesString;
        }

        return $"{config.ApiBaseUrl}/login/oauth2/auth?{query}";
    }

    /// <summary>
    /// Intercambia el código de autorización por access_token + refresh_token
    /// </summary>
    public async Task<CanvasTokenResponse> ExchangeCodeForTokenAsync(string code)
    {
        var config = CanvasConfig.FromEnvironment();
        var client = _httpClientFactory.CreateClient("Canvas");

        var body = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["client_id"] = config.ClientId,
            ["client_secret"] = config.ClientSecret,
            ["redirect_uri"] = config.RedirectUri,
            ["code"] = code,
        });

        var response = await client.PostAsync($"{config.ApiBaseUrl}/login/oauth2/token", body);

        if (!response.IsSuccessStatusCode)
        {
            var errorText = await response.Content.ReadAsStringAsync();
            throw new Exception($"Error al obtener token de Canvas: {(int)response.StatusCode} - {errorText}");
        }

        var tokenData = await response.Content.ReadFromJsonAsync<CanvasTokenResponse>()
            ?? throw new Exception("Respuesta vacía de Canvas al obtener token");

        // Guardar refresh_token en Table Storage
        if (!string.IsNullOrEmpty(tokenData.RefreshToken) && tokenData.User != null)
        {
            await _tokenStorage.SaveRefreshTokenAsync(tokenData.User.Id.ToString(), tokenData.RefreshToken);
        }

        return tokenData;
    }

    /// <summary>
    /// Renueva el access_token usando un refresh_token
    /// </summary>
    public async Task<CanvasTokenResponse> RefreshAccessTokenAsync(string refreshToken)
    {
        var config = CanvasConfig.FromEnvironment();
        var client = _httpClientFactory.CreateClient("Canvas");

        var body = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["client_id"] = config.ClientId,
            ["client_secret"] = config.ClientSecret,
            ["refresh_token"] = refreshToken,
        });

        var response = await client.PostAsync($"{config.ApiBaseUrl}/login/oauth2/token", body);

        if (!response.IsSuccessStatusCode)
        {
            var errorText = await response.Content.ReadAsStringAsync();
            throw new Exception($"Error al renovar token: {(int)response.StatusCode} - {errorText}");
        }

        return await response.Content.ReadFromJsonAsync<CanvasTokenResponse>()
            ?? throw new Exception("Respuesta vacía de Canvas al renovar token");
    }

    /// <summary>
    /// Obtiene un token válido para un usuario:
    /// 1. Busca refresh_token en Table Storage
    /// 2. Si existe, renueva el access_token
    /// 3. Si no existe, retorna null (necesita autorización)
    /// </summary>
    public async Task<CanvasTokenResponse?> GetValidTokenForUserAsync(string userId)
    {
        var storedRefreshToken = await _tokenStorage.GetRefreshTokenAsync(userId);

        if (string.IsNullOrEmpty(storedRefreshToken))
        {
            return null;
        }

        try
        {
            return await RefreshAccessTokenAsync(storedRefreshToken);
        }
        catch
        {
            // Si falla el refresh, el token fue revocado → necesita re-autorización
            return null;
        }
    }
}
