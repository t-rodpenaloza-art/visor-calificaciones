// Respuesta del token endpoint de Canvas
export interface CanvasTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  user: {
    id: number;
    name: string;
  };
}

// Token almacenado en Table Storage
export interface StoredToken {
  partitionKey: string;   // "canvas-tokens"
  rowKey: string;         // userId
  refreshToken: string;
  createdAt: string;
  updatedAt: string;
}

// Token devuelto al frontend
export interface TokenValidationResult {
  accessToken: string;
  expiresIn: number;
  user: {
    id: number;
    name: string;
  };
}

// Configuración de Canvas desde environment variables
export interface CanvasConfig {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  frontendUrl: string;
}

export function getCanvasConfig(): CanvasConfig {
  return {
    apiBaseUrl: process.env.CANVAS_API_BASE_URL || '',
    clientId: process.env.CANVAS_CLIENT_ID || '',
    clientSecret: process.env.CANVAS_CLIENT_SECRET || '',
    redirectUri: process.env.CANVAS_REDIRECT_URI || '',
    scopes: (process.env.CANVAS_SCOPES || '').split(' '),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4201',
  };
}
