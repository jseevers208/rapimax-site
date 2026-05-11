import { corsResponse, handleOptions, errorResponse } from './_helpers.js';

export async function onRequestOptions() { return handleOptions(); }

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return errorResponse('Correo electrónico inválido.');
    }

    const email = data.email.trim().toLowerCase();
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ua = request.headers.get('User-Agent') || 'unknown';

    // Check for duplicate
    const existing = await env.DB.prepare(
      'SELECT id FROM waitlist_subscribers WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      return corsResponse({ success: true, message: 'Ya estás registrado. ¡Te notificaremos!' });
    }

    await env.DB.prepare(
      `INSERT INTO waitlist_subscribers (email, ip_address, user_agent) VALUES (?, ?, ?)`
    ).bind(email, ip, ua).run();

    // Log activity
    try {
      await env.DB.prepare(
        `INSERT INTO activity_log (record_type, record_id, action, new_value, actor) VALUES (?, ?, ?, ?, ?)`
      ).bind('waitlist', 0, 'subscribed', email, 'system').run();
    } catch (e) { console.error('Activity log error:', e); }

    // Send notification email if Resend is configured
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
            subject: `Nueva suscripción — Lista de espera`,
            html: `<h2>Nuevo suscriptor en lista de espera</h2><p><strong>Email:</strong> ${email}</p>`,
          }),
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
    }

    return corsResponse({ success: true, message: '¡Registrado exitosamente!' });
  } catch (err) {
    console.error('Waitlist error:', err);
    return errorResponse('Error al registrar. Intentá de nuevo.', 500);
  }
}
