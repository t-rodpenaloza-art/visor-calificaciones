import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { buildAuthorizationUrl } from '../services/canvasOAuth.service';

/**
 * GET /api/oauth/authorize
 * Redirige al usuario a la página de autorización de Canvas
 */
async function oauthAuthorize(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // El userId puede venir como query param para tracking
    const userId = request.query.get('userId') || '';
    const authUrl = buildAuthorizationUrl(userId);

    context.log(`Redirigiendo a Canvas OAuth para usuario: ${userId}`);

    return {
      status: 302,
      headers: { Location: authUrl },
    };
  } catch (error: any) {
    context.error('Error en oauth/authorize:', error.message);
    return {
      status: 500,
      jsonBody: { error: 'Error al construir URL de autorización', detail: error.message },
    };
  }
}

app.http('oauthAuthorize', {
  methods: ['GET'],
  route: 'oauth/authorize',
  authLevel: 'anonymous',
  handler: oauthAuthorize,
});
