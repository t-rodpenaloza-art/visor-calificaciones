import { TableClient, TableServiceClient } from '@azure/data-tables';
import { StoredToken } from '../models/types';

const TABLE_NAME = 'CanvasTokens';
const PARTITION_KEY = 'canvas-tokens';

let tableClient: TableClient | null = null;

async function getTableClient(): Promise<TableClient> {
  if (tableClient) return tableClient;

  const connectionString = process.env.TABLE_STORAGE_CONNECTION || 'UseDevelopmentStorage=true';
  const serviceClient = TableServiceClient.fromConnectionString(connectionString);

  // Crear la tabla si no existe
  try {
    await serviceClient.createTable(TABLE_NAME);
  } catch (error: any) {
    // Ignora si ya existe (409 Conflict)
    if (error.statusCode !== 409) throw error;
  }

  tableClient = TableClient.fromConnectionString(connectionString, TABLE_NAME);
  return tableClient;
}

/**
 * Guarda o actualiza el refresh token de un usuario
 */
export async function saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
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
export async function getRefreshToken(userId: string): Promise<string | null> {
  const client = await getTableClient();

  try {
    const entity = await client.getEntity<StoredToken>(PARTITION_KEY, userId);
    return entity.refreshToken || null;
  } catch (error: any) {
    // 404 = no existe el token para este usuario
    if (error.statusCode === 404) return null;
    throw error;
  }
}

/**
 * Elimina el refresh token de un usuario (logout o revocación)
 */
export async function deleteRefreshToken(userId: string): Promise<void> {
  const client = await getTableClient();

  try {
    await client.deleteEntity(PARTITION_KEY, userId);
  } catch (error: any) {
    if (error.statusCode !== 404) throw error;
  }
}
