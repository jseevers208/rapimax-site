// WhatsApp Cloud API notification helper
// Requires env vars: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID
// Optional: WHATSAPP_TEMPLATE_NAME (defaults to 'status_update')

const STATUS_MESSAGES = {
  'nueva': '📋 Tu solicitud fue recibida exitosamente. Un asesor la revisará pronto.',
  'en-proceso': '⚙️ Tu solicitud está siendo procesada por un asesor.',
  'contactada': '📞 Un asesor intentó contactarte. Si no recibiste la llamada, por favor respondé a este mensaje.',
  'documentos': '📄 Necesitamos documentación adicional para continuar. Un asesor te indicará qué documentos enviar.',
  'en-revision': '🔍 Tu solicitud está en revisión final. Te notificaremos pronto.',
  'aprobada': '🎉 ¡Felicidades! Tu financiamiento fue aprobado. Un asesor te contactará con los próximos pasos.',
  'rechazada': '😔 Lamentamos informarte que tu solicitud no fue aprobada en esta ocasión. Contactanos para más información.',
  'desembolsada': '✅ Tu financiamiento fue desembolsado exitosamente. ¡Gracias por confiar en RapiMax!',
  'completada': '🏁 Tu caso está cerrado. ¡Gracias por confiar en RapiMax!',
};

/**
 * Send a WhatsApp text notification to an applicant on status change.
 * Falls back silently if credentials aren't configured.
 *
 * @param {Object} env - Worker env bindings
 * @param {string} phone - Applicant phone number (raw, e.g. "50688887777")
 * @param {string} newStatus - New status slug
 * @param {string} applicantName - Applicant name for personalization
 * @param {string} [portalUrl] - Optional portal URL
 */
export async function sendStatusWhatsApp(env, phone, newStatus, applicantName, portalUrl) {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID || !phone) return;

  // Normalize phone: strip spaces, dashes, leading +
  const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
  if (cleanPhone.length < 8) return;

  const message = STATUS_MESSAGES[newStatus];
  if (!message) return;

  const siteUrl = env.SITE_URL || 'https://rapimax-dev.com';
  let text = `Hola ${applicantName || ''},\n\n${message}`;
  if (portalUrl) {
    text += `\n\n🔗 Consultá el estado de tu solicitud:\n${siteUrl}${portalUrl}`;
  }
  text += `\n\n— RapiMax Financiamiento`;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: text },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('WhatsApp API error:', res.status, err);
    }
  } catch (err) {
    console.error('WhatsApp notification failed:', err);
  }
}

/**
 * Lookup applicant details and send WhatsApp notification.
 * Call this from status update handlers.
 */
export async function notifyStatusChange(env, db, recordType, recordId, newStatus) {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) return;

  try {
    let phone, name, portalUrl;

    if (recordType === 'applications') {
      const app = await db.prepare(
        'SELECT cell_phone, applicant_full_name, access_token FROM loan_applications WHERE id = ?'
      ).bind(recordId).first();
      if (!app) return;
      phone = app.cell_phone;
      name = app.applicant_full_name;
      portalUrl = app.access_token ? `/mi-solicitud?token=${app.access_token}` : null;
    } else if (recordType === 'contacts') {
      const ct = await db.prepare('SELECT phone, full_name FROM contact_messages WHERE id = ?').bind(recordId).first();
      if (!ct?.phone) return;
      phone = ct.phone;
      name = ct.full_name;
    } else {
      return; // Only notify on applications and contacts
    }

    await sendStatusWhatsApp(env, phone, newStatus, name, portalUrl);
  } catch (err) {
    console.error('notifyStatusChange error:', err);
  }
}
