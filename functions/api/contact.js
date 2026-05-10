import { corsResponse, handleOptions, errorResponse } from './_helpers.js';

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    if (!data.fullName || !data.message) {
      return errorResponse('Nombre y mensaje son requeridos.');
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ua = request.headers.get('User-Agent') || 'unknown';

    const insertResult = await env.DB.prepare(
      `INSERT INTO contact_messages (full_name, email, phone, subject, message, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      data.fullName, data.email || null, data.phone || null,
      data.subject || null, data.message, ip, ua
    ).run();

    // Log activity
    try {
      await env.DB.prepare(
        `INSERT INTO activity_log (record_type, record_id, action, new_value, actor) VALUES (?, ?, ?, ?, ?)`
      ).bind('contacts', insertResult.meta?.last_row_id, 'created', data.fullName || 'N/A', 'system').run();
    } catch (e) { console.error('Activity log error:', e); }

    if (env.RESEND_API_KEY && env.NOTIFICATION_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: env.EMAIL_FROM || 'RapiMax <notificaciones@rapimax.co.cr>',
            to: [env.NOTIFICATION_EMAIL],
            subject: `Nuevo mensaje de contacto — ${data.fullName}`,
            html: `
              <h2>Nuevo mensaje de contacto</h2>
              <p><strong>Nombre:</strong> ${data.fullName}</p>
              <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
              <p><strong>Teléfono:</strong> ${data.phone || 'N/A'}</p>
              <p><strong>Asunto:</strong> ${data.subject || 'N/A'}</p>
              <hr>
              <p>${data.message}</p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
    }

    return corsResponse({ success: true, message: 'Mensaje enviado exitosamente.' });
  } catch (err) {
    console.error('Contact error:', err);
    return errorResponse('Error al enviar el mensaje. Intentá de nuevo.', 500);
  }
}
