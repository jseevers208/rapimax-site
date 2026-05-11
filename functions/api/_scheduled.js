// Scheduled email reports — daily and weekly digests via Resend
// Called by Cloudflare Cron Triggers

/**
 * Build and send a daily digest email summarizing activity.
 */
export async function sendDailyDigest(env) {
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_EMAIL) {
    console.log('Skipping daily digest: RESEND_API_KEY or NOTIFICATION_EMAIL not set');
    return;
  }

  const db = env.DB;
  const siteUrl = env.SITE_URL || 'https://rapimax-dev.com';

  // Today's stats
  const [newApps, newContacts, newLeads, statusChanges, newCases] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c FROM loan_applications WHERE created_at >= datetime('now', '-1 day')").first(),
    db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE created_at >= datetime('now', '-1 day')").first(),
    db.prepare("SELECT COUNT(*) as c FROM calculator_leads WHERE created_at >= datetime('now', '-1 day')").first(),
    db.prepare("SELECT COUNT(*) as c FROM activity_log WHERE action = 'status_changed' AND created_at >= datetime('now', '-1 day')").first(),
    db.prepare("SELECT COUNT(*) as c FROM cases WHERE created_at >= datetime('now', '-1 day')").first(),
  ]);

  // Pipeline snapshot
  const pipeline = await db.prepare(
    "SELECT status, COUNT(*) as count FROM loan_applications WHERE status NOT IN ('completada','rechazada') GROUP BY status ORDER BY count DESC"
  ).all();

  // Overdue follow-ups
  const overdue = await db.prepare(
    "SELECT COUNT(*) as c FROM cases WHERE follow_up_date < datetime('now') AND status NOT IN ('cerrado','desembolsado','rechazado')"
  ).first();

  // Attention queue (new, unassigned applications)
  const unassigned = await db.prepare(
    "SELECT COUNT(*) as c FROM loan_applications WHERE status = 'nueva' AND assigned_to IS NULL"
  ).first();

  const apps = newApps?.c || 0;
  const contacts = newContacts?.c || 0;
  const leads = newLeads?.c || 0;
  const changes = statusChanges?.c || 0;
  const cases = newCases?.c || 0;
  const overdueCount = overdue?.c || 0;
  const unassignedCount = unassigned?.c || 0;

  // Build pipeline HTML
  const pipelineRows = (pipeline?.results || [])
    .map(r => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${r.status}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;">${r.count}</td></tr>`)
    .join('');

  const dateStr = new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="background:#0a1929;padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#d5b584;margin:0;font-size:20px;">📊 Reporte Diario — RapiMax</h1>
        <p style="color:rgba(255,246,226,.6);margin:8px 0 0;font-size:13px;">${dateStr}</p>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #eee;">
        <h2 style="font-size:16px;color:#0a1929;margin:0 0 16px;">Actividad de las últimas 24 horas</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px 0;">Nuevas solicitudes</td><td style="text-align:right;font-weight:bold;font-size:18px;color:${apps > 0 ? '#22c55e' : '#999'};">${apps}</td></tr>
          <tr><td style="padding:8px 0;">Mensajes de contacto</td><td style="text-align:right;font-weight:bold;font-size:18px;color:${contacts > 0 ? '#5b8fd9' : '#999'};">${contacts}</td></tr>
          <tr><td style="padding:8px 0;">Leads (calculadora)</td><td style="text-align:right;font-weight:bold;font-size:18px;color:${leads > 0 ? '#8b5cf6' : '#999'};">${leads}</td></tr>
          <tr><td style="padding:8px 0;">Nuevos casos</td><td style="text-align:right;font-weight:bold;font-size:18px;color:${cases > 0 ? '#f59e0b' : '#999'};">${cases}</td></tr>
          <tr><td style="padding:8px 0;">Cambios de estado</td><td style="text-align:right;font-weight:bold;font-size:18px;">${changes}</td></tr>
        </table>

        ${overdueCount > 0 || unassignedCount > 0 ? `
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px;margin-bottom:20px;">
          <strong style="color:#856404;">⚠️ Requiere atención:</strong>
          ${overdueCount > 0 ? `<p style="margin:6px 0 0;color:#856404;">• ${overdueCount} seguimiento${overdueCount > 1 ? 's' : ''} vencido${overdueCount > 1 ? 's' : ''}</p>` : ''}
          ${unassignedCount > 0 ? `<p style="margin:6px 0 0;color:#856404;">• ${unassignedCount} solicitud${unassignedCount > 1 ? 'es' : ''} sin asignar</p>` : ''}
        </div>` : ''}

        ${pipelineRows ? `
        <h3 style="font-size:14px;color:#0a1929;margin:0 0 12px;">Pipeline activo</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr style="background:#f8f9fa;"><th style="padding:8px 12px;text-align:left;">Estado</th><th style="padding:8px 12px;text-align:center;">Cantidad</th></tr>
          ${pipelineRows}
        </table>` : ''}

        <div style="text-align:center;padding-top:12px;">
          <a href="${siteUrl}/admin" style="display:inline-block;padding:12px 28px;background:#0a1929;color:#d5b584;border-radius:8px;text-decoration:none;font-weight:bold;">Abrir Panel de Admin</a>
        </div>
      </div>
      <div style="padding:16px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;">
        Rapi Moto Credit S.A. · 3-101-748267 · ${siteUrl}
      </div>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || 'RapiMax <notificaciones@rapimax.co.cr>',
      to: env.NOTIFICATION_EMAIL.split(',').map(e => e.trim()),
      subject: `📊 Reporte Diario RapiMax — ${apps} solicitudes, ${leads} leads`,
      html,
    }),
  });

  console.log(`Daily digest sent: ${apps} apps, ${contacts} contacts, ${leads} leads`);
}

/**
 * Build and send a weekly summary with trends.
 */
export async function sendWeeklyDigest(env) {
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_EMAIL) return;

  const db = env.DB;
  const siteUrl = env.SITE_URL || 'https://rapimax-dev.com';

  const [weekApps, weekContacts, weekLeads, weekApproved, weekRejected, weekDesembolsadas, totalActive, waitlistCount] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c FROM loan_applications WHERE created_at >= datetime('now', '-7 days')").first(),
    db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE created_at >= datetime('now', '-7 days')").first(),
    db.prepare("SELECT COUNT(*) as c FROM calculator_leads WHERE created_at >= datetime('now', '-7 days')").first(),
    db.prepare("SELECT COUNT(*) as c FROM activity_log WHERE action = 'status_changed' AND new_value = 'aprobada' AND created_at >= datetime('now', '-7 days')").first(),
    db.prepare("SELECT COUNT(*) as c FROM activity_log WHERE action = 'status_changed' AND new_value = 'rechazada' AND created_at >= datetime('now', '-7 days')").first(),
    db.prepare("SELECT COUNT(*) as c FROM activity_log WHERE action = 'status_changed' AND new_value = 'desembolsada' AND created_at >= datetime('now', '-7 days')").first(),
    db.prepare("SELECT COUNT(*) as c FROM loan_applications WHERE status NOT IN ('completada','rechazada')").first(),
    db.prepare("SELECT COUNT(*) as c FROM waitlist_subscribers").first().catch(() => ({ c: 0 })),
  ]);

  // Amount pipeline
  const totalPipeline = await db.prepare(
    "SELECT COALESCE(SUM(requested_credit_amount), 0) as total FROM loan_applications WHERE status NOT IN ('completada','rechazada','desembolsada')"
  ).first();

  const dateStr = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="background:#0a1929;padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#d5b584;margin:0;font-size:20px;">📈 Reporte Semanal — RapiMax</h1>
        <p style="color:rgba(255,246,226,.6);margin:8px 0 0;font-size:13px;">Semana al ${dateStr}</p>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #eee;">
        <h2 style="font-size:16px;color:#0a1929;margin:0 0 16px;">Resumen de la semana</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px 0;">Nuevas solicitudes</td><td style="text-align:right;font-weight:bold;font-size:18px;">${weekApps?.c || 0}</td></tr>
          <tr><td style="padding:8px 0;">Mensajes de contacto</td><td style="text-align:right;font-weight:bold;font-size:18px;">${weekContacts?.c || 0}</td></tr>
          <tr><td style="padding:8px 0;">Leads (calculadora)</td><td style="text-align:right;font-weight:bold;font-size:18px;">${weekLeads?.c || 0}</td></tr>
          <tr style="border-top:2px solid #eee;"><td style="padding:12px 0;color:#22c55e;font-weight:600;">✅ Aprobadas</td><td style="text-align:right;font-weight:bold;font-size:18px;color:#22c55e;">${weekApproved?.c || 0}</td></tr>
          <tr><td style="padding:8px 0;color:#ef4444;">❌ Rechazadas</td><td style="text-align:right;font-weight:bold;font-size:18px;color:#ef4444;">${weekRejected?.c || 0}</td></tr>
          <tr><td style="padding:8px 0;color:#14b8a6;">💰 Desembolsadas</td><td style="text-align:right;font-weight:bold;font-size:18px;color:#14b8a6;">${weekDesembolsadas?.c || 0}</td></tr>
        </table>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:4px 0;">Solicitudes activas en pipeline</td><td style="text-align:right;font-weight:bold;">${totalActive?.c || 0}</td></tr>
            <tr><td style="padding:4px 0;">Monto total en pipeline</td><td style="text-align:right;font-weight:bold;color:#0a1929;">$${Number(totalPipeline?.total || 0).toLocaleString()}</td></tr>
            <tr><td style="padding:4px 0;">Suscriptores lista de espera</td><td style="text-align:right;font-weight:bold;">${waitlistCount?.c || 0}</td></tr>
          </table>
        </div>

        <div style="text-align:center;padding-top:12px;">
          <a href="${siteUrl}/admin" style="display:inline-block;padding:12px 28px;background:#0a1929;color:#d5b584;border-radius:8px;text-decoration:none;font-weight:bold;">Abrir Panel de Admin</a>
        </div>
      </div>
      <div style="padding:16px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;">
        Rapi Moto Credit S.A. · 3-101-748267 · ${siteUrl}
      </div>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || 'RapiMax <notificaciones@rapimax.co.cr>',
      to: env.NOTIFICATION_EMAIL.split(',').map(e => e.trim()),
      subject: `📈 Reporte Semanal RapiMax — ${weekApps?.c || 0} solicitudes, ${weekApproved?.c || 0} aprobadas`,
      html,
    }),
  });

  console.log('Weekly digest sent');
}
