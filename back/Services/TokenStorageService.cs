using Azure;
using Azure.Data.Tables;
using BackDotnet.Models;

namespace BackDotnet.Services;

public interface ITokenStorageService
{
    Task SaveRefreshTokenAsync(string userId, string refreshToken);
    Task<string?> GetRefreshTokenAsync(string userId);
    Task DeleteRefreshTokenAsync(string userId);
}

public class TokenStorageService : ITokenStorageService
{
    private const string TableName = "CanvasTokens";
    private const string PartitionKey = "canvas-tokens";
    private TableClient? _tableClient;

    private async Task<TableClient> GetTableClientAsync()
    {
        if (_tableClient != null) return _tableClient;

        var connectionString = Environment.GetEnvironmentVariable("TABLE_STORAGE_CONNECTION")
            ?? "UseDevelopmentStorage=true";

        var serviceClient = new TableServiceClient(connectionString);

        // Crear la tabla si no existe
        await serviceClient.CreateTableIfNotExistsAsync(TableName);

        _tableClient = new TableClient(connectionString, TableName);
        return _tableClient;
    }

    /// <summary>
    /// Guarda o actualiza el refresh token de un usuario
    /// </summary>
    public async Task SaveRefreshTokenAsync(string userId, string refreshToken)
    {
        var client = await GetTableClientAsync();
        var now = DateTime.UtcNow.ToString("o");

        var entity = new StoredTokenEntity
        {
            PartitionKey = PartitionKey,
            RowKey = userId,
            RefreshToken = refreshToken,
            CreatedAt = now,
            UpdatedAt = now,
        };

        await client.UpsertEntityAsync(entity, TableUpdateMode.Merge);
    }

    /// <summary>
    /// Obtiene el refresh token almacenado de un usuario
    /// </summary>
    public async Task<string?> GetRefreshTokenAsync(string userId)
    {
        var client = await GetTableClientAsync();

        try
        {
            var entity = await client.GetEntityAsync<StoredTokenEntity>(PartitionKey, userId);
            return entity?.Value?.RefreshToken;
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    /// <summary>
    /// Elimina el refresh token de un usuario (logout o revocación)
    /// </summary>
    public async Task DeleteRefreshTokenAsync(string userId)
    {
        var client = await GetTableClientAsync();

        try
        {
            await client.DeleteEntityAsync(PartitionKey, userId);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            // No existe, ignorar
        }
    }
}
