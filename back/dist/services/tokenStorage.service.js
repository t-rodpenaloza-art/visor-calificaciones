"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRefreshToken = saveRefreshToken;
exports.getRefreshToken = getRefreshToken;
exports.deleteRefreshToken = deleteRefreshToken;
const data_tables_1 = require("@azure/data-tables");
const TABLE_NAME = 'CanvasTokens';
const PARTITION_KEY = 'canvas-tokens';
let tableClient = null;
async function getTableClient() {
    if (tableClient)
        return tableClient;
    const connectionString = process.env.TABLE_STORAGE_CONNECTION || 'UseDevelopmentStorage=true';
    const serviceClient = data_tables_1.TableServiceClient.fromConnectionString(connectionString);
    // Crear la tabla si no existe
    try {
        await serviceClient.createTable(TABLE_NAME);
    }
    catch (error) {
        // Ignora si ya existe (409 Conflict)
        if (error.statusCode !== 409)
            throw error;
    }
    tableClient = data_tables_1.TableClient.fromConnectionString(connectionString, TABLE_NAME);
    return tableClient;
}
/**
 * Guarda o actualiza el refresh token de un usuario
 */
async function saveRefreshToken(userId, refreshToken) {
    const client = await getTableClient();
    const now = new Date().toISOString();
    const entity = {
        partitionKey: PARTITION_KEY,
        rowKey: userId,
        refreshToken,
        createdAt: now,
        updatedAt: now,
    };
    await client.upsertEntity(entity, 'Merge');
}
/**
 * Obtiene el refresh token almacenado de un usuario
 */
async function getRefreshToken(userId) {
    const client = await getTableClient();
    try {
        const entity = await client.getEntity(PARTITION_KEY, userId);
        return entity.refreshToken || null;
    }
    catch (error) {
        // 404 = no existe el token para este usuario
        if (error.statusCode === 404)
            return null;
        throw error;
    }
}
/**
 * Elimina el refresh token de un usuario (logout o revocación)
 */
async function deleteRefreshToken(userId) {
    const client = await getTableClient();
    try {
        await client.deleteEntity(PARTITION_KEY, userId);
    }
    catch (error) {
        if (error.statusCode !== 404)
            throw error;
    }
}
//# sourceMappingURL=tokenStorage.service.js.map