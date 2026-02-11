import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getValidTokenForUser, buildAuthorizationUrl } from '../services/canvasOAuth.service';

/**
 * GET /api/oauth/token/validate?userId=xxx
 * Verifica si el usuario tiene un token válido:
 * - Si hay refresh_token en BD → renueva y devuelve access_token
 * - Si no hay → devuelve la URL de autorización para que el frontend redirija
 */
async function tokenValidate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('userId');

    if (!userId) {
      return {
        status: 400,
        jsonBody: { error: 'Se requiere userId como query parameter' },
      };
    }

    context.log(`Validando token para usuario: ${userId}`);

    // Intentar obtener token válido (busca en BD → refresh si existe)
    const tokenData = await getValidTokenForUser(userId);

    if (tokenData) {
      // Token válido obtenido
      context.log(`Token renovado exitosamente para usuario: ${userId}`);
      return {
        status: 200,
        jsonBody: {
          authenticated: true,
          accessToken: tokenData.access_token,
          expiresIn: tokenData.expires_in,
          user: tokenData.user,
        },
      };
    }

    // No hay token → necesita autorización
    context.log(`No hay token para usuario: ${userId}, requiere autorización`);
    const authUrl = buildAuthorizationUrl(userId);

    return {
      status: 200,
      jsonBody: {
        authenticated: false,
        authorizationUrl: authUrl,
      },
    };
  } catch (error: any) {
    context.error('Error en token/validate:', error.message);
    return {
      status: 500,
      jsonBody: { error: 'Error al validar token', detail: error.message },
    };
  }
}

app.http('tokenValidate', {
  methods: ['GET'],
  route: 'oauth/token/validate',
  authLevel: 'anonymous',
  handler: tokenValidate,
});
