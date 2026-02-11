import { CanvasTokenResponse, getCanvasConfig } from '../models/types';
import { saveRefreshToken, getRefreshToken } from './tokenStorage.service';

/**
 * Construye la URL de autorización de Canvas OAuth2
 * El usuario será redirigido aquí para autorizar la app
 */
export function buildAuthorizationUrl(state?: string): string {
  const config = getCanvasConfig();
  const scopesString = config.scopes.join(' ');

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: scopesString,
    state: state || crypto.randomUUID(),
  });

  return `${config.apiBaseUrl}/login/oauth2/auth?${params.toString()}`;
}

/**
 * Intercambia el código de autorización por access_token + refresh_token
 * Se llama después del callback de Canvas
 */
export async function exchangeCodeForToken(code: string): Promise<CanvasTokenResponse> {
  const config = getCanvasConfig();

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code,
  });

  const response = await fetch(`${config.apiBaseUrl}/login/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al obtener token de Canvas: ${response.status} - ${errorText}`);
  }

  const tokenData: CanvasTokenResponse = await response.json();

  // Guardar refresh_token en Table Storage
  if (tokenData.refresh_token && tokenData.user) {
    await saveRefreshToken(tokenData.user.id.toString(), tokenData.refresh_token);
  }

  return tokenData;
}

/**
 * Renueva el access_token usando un refresh_token
 * Canvas no rota el refresh_token, así que el mismo sigue siendo válido
 */
export async function refreshAccessToken(refreshToken: string): Promise<CanvasTokenResponse> {
  const config = getCanvasConfig();

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${config.apiBaseUrl}/login/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al renovar token: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Obtiene un token válido para un usuario:
 * 1. Busca refresh_token en Table Storage
 * 2. Si existe, renueva el access_token
 * 3. Si no existe, retorna null (necesita autorización)
 */
export async function getValidTokenForUser(userId: string): Promise<CanvasTokenResponse | null> {
  const storedRefreshToken = await getRefreshToken(userId);

  if (!storedRefreshToken) {
    return null; // No hay token, necesita autorización
  }

  try {
    const newToken = await refreshAccessToken(storedRefreshToken);
    return newToken;
  } catch (error) {
    // Si falla el refresh, el token fue revocado → necesita re-autorización
    return null;
  }
}
