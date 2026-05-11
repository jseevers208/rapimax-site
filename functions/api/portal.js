import { corsResponse, handleOptions, errorResponse, rowToCamel } from './_helpers.js';

export async function onRequestOptions() { return handleOptions(); }

// GET /api/portal?token={token} — returns application status for the applicant
export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  if (!token || token.length < 16) {
    return errorResponse('Token inválido.', 400);
  }

  try {
    const row = await env.DB.prepare(
      `SELECT id, created_at, updated_at, status, applicant_full_name, applicant_id_number,
              requested_credit_amount, requested_term_months, credit_facility_type,
              cell_phone, personal_email, home_province
       FROM loan_applications WHERE access_token = ?`
    ).bind(token).first();

    if (!row) {
      return errorResponse('Solicitud no encontrada.', 404);
    }

    const app = rowToCamel(row);

    // Get status timeline (only status changes, not internal notes)
    const timeline = await env.DB.prepare(
      `SELECT created_at, action, old_value, new_value FROM activity_log
       WHERE record_type = 'applications' AND record_id = ? AND action = 'status_changed'
       ORDER BY created_at ASC`
    ).bind(row.id).all();

    // Status messages for the applicant
    const statusMessages = {
      nueva: { title: 'Solicitud recibida', desc: 'Estamos revisando tu información. Un asesor te contactará pronto.', color: '#d5b584' },
      'en-proceso': { title: 'En proceso', desc: 'Un asesor está trabajando en tu solicitud.', color: '#5b8fd9' },
      contactada: { title: 'Te contactamos', desc: 'Un asesor se comunicó contigo. Si no recibiste la llamada, por favor contáctanos.', color: '#8b5cf6' },
      documentos: { title: 'Documentos pendientes', desc: 'Necesitamos documentación adicional para continuar con tu solicitud.', color: '#f59e0b' },
      'en-revision': { title: 'En revisión', desc: 'Tu solicitud está en revisión final. Te notificaremos pronto.', color: '#6366f1' },
      aprobada: { title: '¡Aprobada!', desc: '¡Felicidades! Tu financiamiento fue aprobado. Un asesor te contactará con los próximos pasos.', color: '#22c55e' },
      rechazada: { title: 'No aprobada', desc: 'Lamentamos informarte que tu solicitud no fue aprobada en esta ocasión. Contactanos para más información.', color: '#ef4444' },
      desembolsada: { title: 'Desembolsada', desc: 'Tu financiamiento fue desembolsado exitosamente.', color: '#14b8a6' },
      completada: { title: 'Completada', desc: 'Tu caso está cerrado. Gracias por confiar en RapiMax.', color: '#6b7280' },
    };

    const pipeline = ['nueva', 'en-proceso', 'contactada', 'documentos', 'en-revision', 'aprobada', 'desembolsada'];
    const currentIdx = pipeline.indexOf(app.status);
    const isRejected = app.status === 'rechazada';

    return corsResponse({
      application: {
        name: app.applicantFullName,
        idPartial: app.applicantIdNumber ? '****' + app.applicantIdNumber.slice(-4) : null,
        amount: app.requestedCreditAmount,
        term: app.requestedTermMonths,
        type: app.creditFacilityType,
        province: app.homeProvince,
        submittedAt: app.createdAt,
        updatedAt: app.updatedAt,
      },
      status: app.status,
      statusInfo: statusMessages[app.status] || statusMessages.nueva,
      pipeline: pipeline.map((s, i) => ({
        id: s,
        label: statusMessages[s]?.title || s,
        completed: !isRejected && i <= currentIdx,
        current: s === app.status,
        color: statusMessages[s]?.color || '#6b7280',
      })),
      isRejected,
      timeline: (timeline?.results || []).map(r => ({
        date: r.created_at,
        from: r.old_value,
        to: r.new_value,
      })),
    });
  } catch (err) {
    console.error('Portal error:', err);
    return errorResponse('Error al cargar la solicitud.', 500);
  }
}
