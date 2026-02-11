"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCanvasConfig = getCanvasConfig;
function getCanvasConfig() {
    return {
        apiBaseUrl: process.env.CANVAS_API_BASE_URL || '',
        clientId: process.env.CANVAS_CLIENT_ID || '',
        clientSecret: process.env.CANVAS_CLIENT_SECRET || '',
        redirectUri: process.env.CANVAS_REDIRECT_URI || '',
        scopes: (process.env.CANVAS_SCOPES || '').split(' '),
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4201',
    };
}
//# sourceMappingURL=types.js.map