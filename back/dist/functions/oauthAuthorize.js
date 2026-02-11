"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const canvasOAuth_service_1 = require("../services/canvasOAuth.service");
/**
 * GET /api/oauth/authorize
 * Redirige al usuario a la página de autorización de Canvas
 */
async function oauthAuthorize(request, context) {
    try {
        // El userId puede venir como query param para tracking
        const userId = request.query.get('userId') || '';
        const authUrl = (0, canvasOAuth_service_1.buildAuthorizationUrl)(userId);
        context.log(`Redirigiendo a Canvas OAuth para usuario: ${userId}`);
        return {
            status: 302,
            headers: { Location: authUrl },
        };
    }
    catch (error) {
        context.error('Error en oauth/authorize:', error.message);
        return {
            status: 500,
            jsonBody: { error: 'Error al construir URL de autorización', detail: error.message },
        };
    }
}
functions_1.app.http('oauthAuthorize', {
    methods: ['GET'],
    route: 'oauth/authorize',
    authLevel: 'anonymous',
    handler: oauthAuthorize,
});
//# sourceMappingURL=oauthAuthorize.js.map