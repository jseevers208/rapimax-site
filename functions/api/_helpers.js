// Shared API helpers for Cloudflare Pages Functions

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function corsResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function errorResponse(message, status = 400) {
  return corsResponse({ error: message }, status);
}

export function checkAdminAuth(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const adminPassword = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
  return token === adminPassword;
}

export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function rowToCamel(row) {
  if (!row) return null;
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [snakeToCamel(key), value])
  );
}
