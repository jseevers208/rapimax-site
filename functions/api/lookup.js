import { corsResponse, handleOptions, errorResponse } from './_helpers.js';

export async function onRequestOptions() { return handleOptions(); }

// POST /api/lookup — public endpoint, finds application by email or cédula
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const query = (data.query || '').trim();

    if (!query || query.length < 3) {
      return errorResponse('Ingresá tu correo electrónico o número de cédula (mínimo 3 caracteres).');
    }

    // Search by email or ID number
    const row = await env.DB.prepare(
      `SELECT access_token, applicant_full_name, status
       FROM loan_applications
       WHERE (personal_email = ? OR applicant_id_number = ?)
       AND access_token IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 1`
    ).bind(query, query).first();

    if (!row || !row.access_token) {
      return errorResponse('No encontramos una solicitud con esos datos. Verificá tu correo electrónico o número de cédula.');
    }

    return corsResponse({
      success: true,
      portalUrl: `/mi-solicitud?token=${row.access_token}`,
      name: row.applicant_full_name,
      status: row.status,
    });
  } catch (err) {
    console.error('Lookup error:', err);
    return errorResponse('Error al buscar. Intentá de nuevo.', 500);
  }
}
