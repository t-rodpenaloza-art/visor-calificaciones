import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCanvasConfig } from '../models/types';

/**
 * ALL /api/canvas/{*path}
 * Proxy que reenvía peticiones al API de Canvas.
 * 
 * Beneficios:
 * - Resuelve CORS (frontend → nuestro backend → Canvas)
 * - No expone el access_token en el frontend
 * - Monitorea rate limiting (X-Rate-Limit-Remaining)
 * - Maneja paginación automática si se solicita
 * 
 * Headers requeridos:
 * - Authorization: Bearer <access_token>
 * 
 * Query params opcionales:
 * - _allPages=true → sigue paginación automáticamente
 */
async function canvasProxy(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const config = getCanvasConfig();

  try {
    // Extraer el path después de /api/canvas/
    const url = new URL(request.url);
    const fullPath = url.pathname;
    const canvasPath = fullPath.replace(/^\/api\/canvas\//, '/api/v1/');

    // Obtener el token del header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        jsonBody: { error: 'Se requiere header Authorization: Bearer <token>' },
      };
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const allPages = request.query.get('_allPages') === 'true';

    // Construir URL de Canvas
    const canvasUrl = new URL(`${config.apiBaseUrl}${canvasPath}`);

    // Copiar query params (excepto _allPages)
    url.searchParams.forEach((value, key) => {
      if (key !== '_allPages') {
        canvasUrl.searchParams.set(key, value);
      }
    });

    // Si se solicita paginación automática, obtener todas las páginas
    if (allPages && request.method === 'GET') {
      return await fetchAllPages(canvasUrl.toString(), accessToken, context);
    }

    // Petición simple (sin paginación automática)
    const canvasResponse = await fetchFromCanvas(canvasUrl.toString(), {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    // Log de rate limiting
    const rateLimitRemaining = canvasResponse.headers.get('X-Rate-Limit-Remaining');
    const requestCost = canvasResponse.headers.get('X-Request-Cost');
    if (rateLimitRemaining) {
      context.log(`Canvas Rate Limit: remaining=${rateLimitRemaining}, cost=${requestCost}`);

      // Advertir si queda poco
      if (parseFloat(rateLimitRemaining) < 100) {
        context.warn(`⚠️ Rate limit bajo: ${rateLimitRemaining} unidades restantes`);
      }
    }

    const responseBody = await canvasResponse.text();

    return {
      status: canvasResponse.status,
      headers: {
        'Content-Type': canvasResponse.headers.get('Content-Type') || 'application/json',
        'X-Rate-Limit-Remaining': rateLimitRemaining || '',
        'X-Request-Cost': requestCost || '',
      },
      body: responseBody,
    };
  } catch (error: any) {
    context.error('Error en canvas proxy:', error.message);
    return {
      status: 500,
      jsonBody: { error: 'Error al comunicarse con Canvas', detail: error.message },
    };
  }
}

/**
 * Obtiene todas las páginas de un endpoint paginado de Canvas.
 * Canvas usa Link headers para paginación:
 *   Link: <url>; rel="next", <url>; rel="last"
 */
async function fetchAllPages(
  initialUrl: string,
  accessToken: string,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const allResults: any[] = [];
  let nextUrl: string | null = initialUrl;
  let pageCount = 0;
  const MAX_PAGES = 50; // Límite de seguridad

  while (nextUrl && pageCount < MAX_PAGES) {
    pageCount++;

    const response = await fetchFromCanvas(nextUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Verificar rate limiting
    const rateLimitRemaining = response.headers.get('X-Rate-Limit-Remaining');
    if (rateLimitRemaining && parseFloat(rateLimitRemaining) < 50) {
      context.warn(`Rate limit muy bajo (${rateLimitRemaining}), deteniendo paginación en página ${pageCount}`);
      break;
    }

    if (!response.ok) {
      return {
        status: response.status,
        body: await response.text(),
      };
    }

    const pageData = await response.json();
    if (Array.isArray(pageData)) {
      allResults.push(...pageData);
    } else {
      allResults.push(pageData);
    }

    // Buscar la URL de la siguiente página en el header Link
    nextUrl = parseLinkHeader(response.headers.get('Link'));

    context.log(`Página ${pageCount} obtenida: ${Array.isArray(pageData) ? pageData.length : 1} items`);
  }

  context.log(`Paginación completa: ${pageCount} páginas, ${allResults.length} items totales`);

  return {
    status: 200,
    jsonBody: allResults,
  };
}

/**
 * Extrae la URL "next" del header Link de Canvas
 * Formato: <https://...?page=2&per_page=10>; rel="next", <https://...>; rel="last"
 */
function parseLinkHeader(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    if (match) return match[1];
  }

  return null;
}

/**
 * Wrapper de fetch con retry para rate limiting (429/403)
 */
async function fetchFromCanvas(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  const response = await fetch(url, options);

  // Si Canvas nos throttlea, esperar y reintentar
  if ((response.status === 403 || response.status === 429) && retries > 0) {
    const waitTime = 1000 * (4 - retries); // 1s, 2s, 3s
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return fetchFromCanvas(url, options, retries - 1);
  }

  return response;
}

app.http('canvasProxy', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  route: 'canvas/{*path}',
  authLevel: 'anonymous',
  handler: canvasProxy,
});
