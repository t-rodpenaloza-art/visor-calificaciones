import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { exchangeCodeForToken } from '../services/canvasOAuth.service';
import { getCanvasConfig } from '../models/types';

/**
 * GET /api/oauth/callback
 * Canvas redirige aquí después de que el usuario autoriza.
 * Recibe el ?code=xxx y lo intercambia por access_token + refresh_token
 */
async function oauthCallback(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const config = getCanvasConfig();

  try {
    const code = request.query.get('code');
    const error = request.query.get('error');
    const state = request.query.get('state'); // userId que enviamos

    // Si Canvas devuelve error (usuario denegó acceso)
    if (error) {
      context.warn(`Usuario denegó acceso a Canvas: ${error}`);
      return {
        status: 302,
        headers: { Location: `${config.frontendUrl}/error?reason=canvas_denied` },
      };
    }

    if (!code) {
      return {
        status: 400,
        jsonBody: { error: 'No se recibió código de autorización' },
      };
    }

    context.log(`Intercambiando código por token para usuario: ${state}`);

    // Intercambiar código por tokens
    const tokenData = await exchangeCodeForToken(code);

    context.log(`Token obtenido exitosamente para usuario Canvas ID: ${tokenData.user?.id}`);

    // Redirigir al frontend con el access_token como query param
    // NOTA: En producción, considera usar cookies httpOnly o session storage del backend
    const redirectUrl = new URL(`${config.frontendUrl}/seguimiento`);
    redirectUrl.searchParams.set('access_token', tokenData.access_token);
    redirectUrl.searchParams.set('expires_in', tokenData.expires_in.toString());
    if (tokenData.user) {
      redirectUrl.searchParams.set('user_id', tokenData.user.id.toString());
      redirectUrl.searchParams.set('user_name', tokenData.user.name);
    }

    return {
      status: 302,
      headers: { Location: redirectUrl.toString() },
    };
  } catch (error: any) {
    context.error('Error en oauth/callback:', error.message);
    return {
      status: 302,
      headers: { Location: `${config.frontendUrl}/error?reason=token_exchange_failed` },
    };
  }
}

app.http('oauthCallback', {
  methods: ['GET'],
  route: 'oauth/callback',
  authLevel: 'anonymous',
  handler: oauthCallback,
});
