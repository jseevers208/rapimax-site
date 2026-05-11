import { corsResponse, handleOptions, errorResponse, checkAdminAuth } from './_helpers.js';

export async function onRequestOptions() { return handleOptions(); }

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  const url = new URL(request.url);

  // ---- PUBLIC: Customer upload (auth by portal token) ----
  if (request.method === 'POST') {
    const token = url.searchParams.get('token');
    if (!token || token.length < 16) return errorResponse('Token inválido.', 401);

    // Verify token and get application
    const app = await env.DB.prepare(
      'SELECT id, applicant_full_name, status FROM loan_applications WHERE access_token = ?'
    ).bind(token).first();
    if (!app) return errorResponse('Solicitud no encontrada.', 404);

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return errorResponse('No se recibió archivo.');

    // Validate
    if (file.size > MAX_FILE_SIZE) return errorResponse('El archivo excede 10MB.');
    const contentType = file.type || 'application/octet-stream';
    if (!ALLOWED_TYPES.includes(contentType)) {
      return errorResponse('Tipo de archivo no permitido. Enviá PDF, imágenes o documentos Word.');
    }

    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    const timestamp = Date.now();
    const r2Key = `applications/${app.id}/${timestamp}_${safeName}`;

    // Upload to R2
    await env.DOCUMENTS.put(r2Key, file.stream(), {
      httpMetadata: { contentType },
      customMetadata: {
        applicationId: String(app.id),
        originalName: file.name,
        uploadedBy: 'customer',
      },
    });

    // Record in D1
    await env.DB.prepare(
      `INSERT INTO documents (application_id, filename, r2_key, content_type, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(app.id, file.name, r2Key, contentType, file.size, 'customer').run();

    // Log activity
    await env.DB.prepare(
      `INSERT INTO activity_log (record_type, record_id, action, new_value, actor) VALUES (?, ?, ?, ?, ?)`
    ).bind('applications', app.id, 'document_uploaded', file.name, 'customer').run();

    return corsResponse({ success: true, message: 'Documento subido exitosamente.' });
  }

  // ---- ADMIN: List files for an application ----
  if (request.method === 'GET') {
    if (!checkAdminAuth(request, env)) return errorResponse('No autorizado.', 401);

    const action = url.searchParams.get('action') || 'list';
    const appId = url.searchParams.get('application_id');

    if (action === 'list') {
      if (!appId) return errorResponse('application_id requerido.');
      const docs = await env.DB.prepare(
        'SELECT * FROM documents WHERE application_id = ? ORDER BY created_at DESC'
      ).bind(appId).all();
      return corsResponse({ documents: docs?.results || [] });
    }

    // Download/preview — generate a temporary URL
    if (action === 'download') {
      const key = url.searchParams.get('key');
      if (!key) return errorResponse('key requerido.');

      const object = await env.DOCUMENTS.get(key);
      if (!object) return errorResponse('Archivo no encontrado.', 404);

      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('Content-Disposition', `inline; filename="${key.split('/').pop()}"`);
      headers.set('Cache-Control', 'private, max-age=300');
      // CORS
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(object.body, { headers });
    }

    return errorResponse('Acción no reconocida.');
  }

  return errorResponse('Método no soportado.', 405);
}
