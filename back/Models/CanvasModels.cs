using System.Text.Json.Serialization;
using Azure;
using Azure.Data.Tables;

namespace BackDotnet.Models;

/// <summary>
/// Respuesta del token endpoint de Canvas
/// </summary>
public class CanvasTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = string.Empty;

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("user")]
    public CanvasUser? User { get; set; }
}

public class CanvasUser
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Token almacenado en Table Storage
/// </summary>
public class StoredTokenEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "canvas-tokens";
    public string RowKey { get; set; } = string.Empty; // userId
    public string RefreshToken { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
}

/// <summary>
/// Respuesta al frontend cuando el token es válido
/// </summary>
public class TokenValidationResponse
{
    public bool Authenticated { get; set; }
    public string? AccessToken { get; set; }
    public int? ExpiresIn { get; set; }
    public CanvasUser? User { get; set; }
    public string? AuthorizationUrl { get; set; }
}

/// <summary>
/// Configuración de Canvas desde environment variables
/// </summary>
public class CanvasConfig
{
    public string ApiBaseUrl { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
    public string[] Scopes { get; set; } = Array.Empty<string>();
    public string FrontendUrl { get; set; } = string.Empty;

    public static CanvasConfig FromEnvironment()
    {
        return new CanvasConfig
        {
            ApiBaseUrl = Environment.GetEnvironmentVariable("CANVAS_API_BASE_URL") ?? string.Empty,
            ClientId = Environment.GetEnvironmentVariable("CANVAS_CLIENT_ID") ?? string.Empty,
            ClientSecret = Environment.GetEnvironmentVariable("CANVAS_CLIENT_SECRET") ?? string.Empty,
            RedirectUri = Environment.GetEnvironmentVariable("CANVAS_REDIRECT_URI") ?? string.Empty,
            Scopes = (Environment.GetEnvironmentVariable("CANVAS_SCOPES") ?? string.Empty)
                .Split(' ', StringSplitOptions.RemoveEmptyEntries),
            FrontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:4201",
        };
    }
}
