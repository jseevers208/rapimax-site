import { corsResponse, handleOptions, errorResponse, checkAdminAuth, rowToCamel,
  hashPassword, generateSalt, verifyPassword, createToken, verifyToken, generateResetToken } from './_helpers.js';
import { notifyStatusChange } from './_whatsapp.js';

export async function onRequestOptions() { return handleOptions(); }

const TABLE_MAP = { applications: 'loan_applications', contacts: 'contact_messages', leads: 'calculator_leads' };
const STATUS_LIST = ['nueva', 'en-proceso', 'contactada', 'documentos', 'en-revision', 'aprobada', 'rechazada', 'desembolsada', 'completada'];

// Helper: get JWT secret (uses ADMIN_PASSWORD or fallback)
function getSecret(env) { return env.ADMIN_PASSWORD || 'rapimax-admin-2026'; }

// Helper: verify JWT from Authorization header, returns user payload or null
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  // Try JWT first
  const payload = await verifyToken(token, getSecret(env));
  if (payload) return payload;
  // Legacy: plain password match (backwards compat during migration)
  const adminPassword = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
  if (token === adminPassword) return { id: 0, email: 'legacy', role: 'super_admin', name: 'Admin' };
  return null;
}

export async function onRequest(context) {
  const { request, env, ctx } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  // --- POST ROUTES ---
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return errorResponse('Datos inválidos.', 400); }

    // --- LOGIN (email + password) ---
    if (body.action === 'login' || !body.action) {
      // Support legacy password-only login during migration
      if (body.password && !body.email) {
        const pw = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
        if (body.password === pw) {
          const token = await createToken({ id: 0, email: 'legacy', role: 'super_admin', name: 'Admin (legacy)' }, getSecret(env));
          return corsResponse({ success: true, token, user: { id: 0, email: 'legacy', role: 'super_admin', name: 'Admin (legacy)' } });
        }
        return errorResponse('Contraseña incorrecta.', 401);
      }

      // New email + password login
      if (!body.email || !body.password) return errorResponse('Email y contraseña son requeridos.');
      const email = body.email.toLowerCase().trim();
      const user = await env.DB.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').bind(email).first();
      if (!user) return errorResponse('Credenciales incorrectas.', 401);
      const valid = await verifyPassword(body.password, user.password_hash, user.salt);
      if (!valid) return errorResponse('Credenciales incorrectas.', 401);
      // Update last login
      await env.DB.prepare("UPDATE admin_users SET last_login = datetime('now') WHERE id = ?").bind(user.id).run();
      const token = await createToken({ id: user.id, email: user.email, role: user.role, name: user.name }, getSecret(env));
      return corsResponse({ success: true, token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    }

    // --- SETUP: Create first admin user (requires ADMIN_PASSWORD) ---
    if (body.action === 'setup_admin') {
      const setupPw = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
      if (body.setupKey !== setupPw) return errorResponse('Clave de configuración incorrecta.', 401);
      // Check if any users exist
      const count = await env.DB.prepare('SELECT COUNT(*) as c FROM admin_users').first();
      if (count && count.c > 0) return errorResponse('Ya existen usuarios administradores.');
      if (!body.email || !body.password || !body.name) return errorResponse('Email, contraseña y nombre son requeridos.');
      const salt = generateSalt();
      const hash = await hashPassword(body.password, salt);
      await env.DB.prepare(
        'INSERT INTO admin_users (email, password_hash, salt, name, role) VALUES (?, ?, ?, ?, ?)'
      ).bind(body.email.toLowerCase().trim(), hash, salt, body.name, 'super_admin').run();
      return corsResponse({ success: true, message: 'Primer usuario administrador creado.' });
    }

    // --- PASSWORD RESET REQUEST ---
    if (body.action === 'reset_password_request') {
      if (!body.email) return errorResponse('Email es requerido.');
      const email = body.email.toLowerCase().trim();
      const user = await env.DB.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').bind(email).first();
      // Always return success to prevent email enumeration
      if (!user) return corsResponse({ success: true, message: 'Si el email existe, recibirás un enlace de recuperación.' });
      const resetToken = generateResetToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await env.DB.prepare("UPDATE admin_users SET reset_token = ?, reset_expires = ? WHERE id = ?").bind(resetToken, expires, user.id).run();
      // Send reset email via Resend
      if (env.RESEND_API_KEY) {
        const resetUrl = `${new URL(request.url).origin}/admin/?reset=${resetToken}`;
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
            body: JSON.stringify({
              from: env.EMAIL_FROM || 'RapiMax <notificaciones@rapimax-dev.com>',
              to: [email],
              subject: 'RapiMax — Restablecer contraseña',
              html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
                <h2 style="color:#122941;">Restablecer contraseña</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña del panel de administración de RapiMax.</p>
                <p><a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#122941;color:#d5b584;text-decoration:none;border-radius:8px;font-weight:bold;">Restablecer contraseña</a></p>
                <p style="font-size:0.85em;color:#888;">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignorá este email.</p>
              </div>`
            })
          });
        } catch (e) { console.error('Reset email error:', e); }
      }
      return corsResponse({ success: true, message: 'Si el email existe, recibirás un enlace de recuperación.' });
    }

    // --- RESET PASSWORD (with token) ---
    if (body.action === 'reset_password') {
      if (!body.token || !body.newPassword) return errorResponse('Token y nueva contraseña son requeridos.');
      if (body.newPassword.length < 8) return errorResponse('La contraseña debe tener al menos 8 caracteres.');
      const user = await env.DB.prepare(
        "SELECT * FROM admin_users WHERE reset_token = ? AND reset_expires > datetime('now') AND is_active = 1"
      ).bind(body.token).first();
      if (!user) return errorResponse('Token inválido o expirado.', 401);
      const salt = generateSalt();
      const hash = await hashPassword(body.newPassword, salt);
      await env.DB.prepare(
        "UPDATE admin_users SET password_hash = ?, salt = ?, reset_token = NULL, reset_expires = NULL, updated_at = datetime('now') WHERE id = ?"
      ).bind(hash, salt, user.id).run();
      return corsResponse({ success: true, message: 'Contraseña actualizada exitosamente.' });
    }

    // --- All other POST actions require auth ---
    const authUser = await authenticateRequest(request, env);
    if (!authUser) return errorResponse('No autorizado.', 401);

    // --- CREATE USER (super_admin only) ---
    if (body.action === 'create_user') {
      if (authUser.role !== 'super_admin') return errorResponse('Solo super administradores pueden crear usuarios.', 403);
      if (!body.email || !body.password || !body.name) return errorResponse('Email, contraseña y nombre son requeridos.');
      if (body.password.length < 8) return errorResponse('La contraseña debe tener al menos 8 caracteres.');
      const email = body.email.toLowerCase().trim();
      const existing = await env.DB.prepare('SELECT id FROM admin_users WHERE email = ?').bind(email).first();
      if (existing) return errorResponse('Ya existe un usuario con ese email.');
      const salt = generateSalt();
      const hash = await hashPassword(body.password, salt);
      const role = ['super_admin', 'admin', 'viewer'].includes(body.role) ? body.role : 'admin';
      await env.DB.prepare(
        'INSERT INTO admin_users (email, password_hash, salt, name, role) VALUES (?, ?, ?, ?, ?)'
      ).bind(email, hash, salt, body.name.trim(), role).run();
      return corsResponse({ success: true, message: `Usuario ${email} creado como ${role}.` });
    }

    // --- UPDATE USER (super_admin only) ---
    if (body.action === 'update_user') {
      if (authUser.role !== 'super_admin') return errorResponse('Solo super administradores pueden modificar usuarios.', 403);
      if (!body.userId) return errorResponse('ID de usuario requerido.');
      const updates = []; const binds = [];
      if (body.name) { updates.push('name = ?'); binds.push(body.name.trim()); }
      if (body.role && ['super_admin', 'admin', 'viewer'].includes(body.role)) { updates.push('role = ?'); binds.push(body.role); }
      if (typeof body.isActive === 'boolean' || typeof body.isActive === 'number') { updates.push('is_active = ?'); binds.push(body.isActive ? 1 : 0); }
      if (body.newPassword && body.newPassword.length >= 8) {
        const salt = generateSalt();
        const hash = await hashPassword(body.newPassword, salt);
        updates.push('password_hash = ?', 'salt = ?'); binds.push(hash, salt);
      }
      if (!updates.length) return errorResponse('Nada que actualizar.');
      updates.push("updated_at = datetime('now')");
      binds.push(body.userId);
      await env.DB.prepare(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
      return corsResponse({ success: true, message: 'Usuario actualizado.' });
    }

    // --- CHANGE OWN PASSWORD ---
    if (body.action === 'change_password') {
      if (!authUser.id || authUser.id === 0) return errorResponse('No disponible en modo legacy.');
      if (!body.currentPassword || !body.newPassword) return errorResponse('Contraseña actual y nueva son requeridas.');
      if (body.newPassword.length < 8) return errorResponse('La nueva contraseña debe tener al menos 8 caracteres.');
      const user = await env.DB.prepare('SELECT * FROM admin_users WHERE id = ?').bind(authUser.id).first();
      if (!user) return errorResponse('Usuario no encontrado.', 404);
      const valid = await verifyPassword(body.currentPassword, user.password_hash, user.salt);
      if (!valid) return errorResponse('Contraseña actual incorrecta.', 401);
      const salt = generateSalt();
      const hash = await hashPassword(body.newPassword, salt);
      await env.DB.prepare("UPDATE admin_users SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?").bind(hash, salt, authUser.id).run();
      return corsResponse({ success: true, message: 'Contraseña actualizada.' });
    }

    // --- ADD NOTE ---
    if (body.action === 'add_note') {
      if (!body.recordType || !body.recordId || !body.content) return errorResponse('Campos requeridos.');
      await env.DB.prepare(
        `INSERT INTO notes (record_type, record_id, author, content) VALUES (?, ?, ?, ?)`
      ).bind(body.recordType, body.recordId, body.author || 'Admin', body.content).run();
      await logActivity(env.DB, body.recordType, body.recordId, 'note_added', null, body.content, body.author || 'Admin');
      return corsResponse({ success: true });
    }

    // --- UPDATE STATUS ---
    if (body.action === 'update_status') {
      const table = TABLE_MAP[body.type];
      if (!table || !body.id || !body.status) return errorResponse('Datos inválidos.');
      const current = await env.DB.prepare(`SELECT status FROM ${table} WHERE id = ?`).bind(body.id).first();
      await env.DB.prepare(`UPDATE ${table} SET status = ?, updated_at = datetime('now') WHERE id = ?`).bind(body.status, body.id).run();
      await logActivity(env.DB, body.type, body.id, 'status_changed', current?.status, body.status, body.actor || 'Admin');
      // WhatsApp notification (non-blocking)
      ctx.waitUntil(notifyStatusChange(env, env.DB, body.type, body.id, body.status));
      return corsResponse({ success: true });
    }

    // --- UPDATE PRIORITY ---
    if (body.action === 'update_priority') {
      if (!body.id || !body.priority) return errorResponse('Datos inválidos.');
      await env.DB.prepare(`UPDATE loan_applications SET priority = ?, updated_at = datetime('now') WHERE id = ?`).bind(body.priority, body.id).run();
      return corsResponse({ success: true });
    }

    // --- ASSIGN ---
    if (body.action === 'assign') {
      const table = TABLE_MAP[body.type];
      if (!table || !body.id) return errorResponse('Datos inválidos.');
      await env.DB.prepare(`UPDATE ${table} SET assigned_to = ?, updated_at = datetime('now') WHERE id = ?`).bind(body.assignedTo || null, body.id).run();
      await logActivity(env.DB, body.type, body.id, 'assigned', null, body.assignedTo, body.actor || 'Admin');
      return corsResponse({ success: true });
    }

    // --- CMS: UPDATE SETTINGS ---
    if (body.action === 'update_settings') {
      if (!body.settings || typeof body.settings !== 'object') return errorResponse('Datos inválidos.');
      for (const [key, value] of Object.entries(body.settings)) {
        await env.DB.prepare(
          `INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, datetime('now'))
           ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at`
        ).bind(key, value).run();
      }
      return corsResponse({ success: true });
    }

    // --- CMS: UPSERT CONTENT ---
    if (body.action === 'update_content') {
      if (!body.page || !body.section || !body.fieldKey || !body.valueEs) return errorResponse('Campos requeridos.');
      await env.DB.prepare(
        `INSERT INTO site_content (page, section, field_key, value_es, value_en, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(page, section, field_key) DO UPDATE SET
           value_es = excluded.value_es, value_en = excluded.value_en, updated_at = excluded.updated_at`
      ).bind(body.page, body.section, body.fieldKey, body.valueEs, body.valueEn || null).run();
      return corsResponse({ success: true });
    }

    // --- CMS: UPSERT PARTNER LOCATION ---
    if (body.action === 'upsert_partner') {
      const p = body.partner;
      if (!p || !p.name) return errorResponse('Nombre es requerido.');
      if (p.id) {
        await env.DB.prepare(
          `UPDATE partner_locations SET name=?, category=?, address=?, province=?, latitude=?, longitude=?, phone=?, website=?, is_active=?, sort_order=?, updated_at=datetime('now') WHERE id=?`
        ).bind(p.name, p.category||null, p.address||null, p.province||null, p.latitude||null, p.longitude||null, p.phone||null, p.website||null, p.isActive??1, p.sortOrder??0, p.id).run();
      } else {
        await env.DB.prepare(
          `INSERT INTO partner_locations (name, category, address, province, latitude, longitude, phone, website, is_active, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)`
        ).bind(p.name, p.category||null, p.address||null, p.province||null, p.latitude||null, p.longitude||null, p.phone||null, p.website||null, p.isActive??1, p.sortOrder??0).run();
      }
      return corsResponse({ success: true });
    }

    // --- DELETE PARTNER ---
    if (body.action === 'delete_partner') {
      if (!body.id) return errorResponse('ID requerido.');
      await env.DB.prepare(`DELETE FROM partner_locations WHERE id = ?`).bind(body.id).run();
      return corsResponse({ success: true });
    }

    return errorResponse('Acción no reconocida.', 400);
  }

  // --- ALL GET ROUTES (require auth) ---
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'list';

    // --- CEDULA IMAGE FROM R2 (supports query-param token for img src) ---
    if (action === 'cedula_image') {
      const qToken = url.searchParams.get('token') || '';
      const adminPassword = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
      const jwtUser = await authenticateRequest(request, env);
      if (!jwtUser && qToken !== adminPassword) return errorResponse('No autorizado.', 401);
      const key = url.searchParams.get('key');
      if (!key || !key.startsWith('cedulas/')) return errorResponse('Clave inválida.');
      if (!env.DOCUMENTS) return errorResponse('R2 no configurado.', 503);
      const obj = await env.DOCUMENTS.get(key);
      if (!obj) return errorResponse('Imagen no encontrada.', 404);
      const headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      headers.set('Content-Type', obj.httpMetadata?.contentType || 'image/jpeg');
      headers.set('Cache-Control', 'private, max-age=3600');
      return new Response(obj.body, { headers });
    }

    if (!await authenticateRequest(request, env)) return errorResponse('No autorizado.', 401);

    // --- LIST ADMIN USERS (super_admin only) ---
    if (action === 'users') {
      const authUser = await authenticateRequest(request, env);
      if (authUser.role !== 'super_admin') return errorResponse('Solo super administradores pueden ver usuarios.', 403);
      const rows = await env.DB.prepare('SELECT id, email, name, role, is_active, last_login, created_at FROM admin_users ORDER BY created_at ASC').all();
      return corsResponse({ users: (rows?.results || []).map(rowToCamel) });
    }

    // --- DASHBOARD STATS ---
    if (action === 'stats') {
      const [apps, contacts, leads, today, week, pipeline, byStatus, byProvince, recentActivity] = await Promise.all([
        env.DB.prepare(`SELECT COUNT(*) as c FROM loan_applications`).first(),
        env.DB.prepare(`SELECT COUNT(*) as c FROM contact_messages`).first(),
        env.DB.prepare(`SELECT COUNT(*) as c FROM calculator_leads`).first(),
        env.DB.prepare(`SELECT COUNT(*) as c FROM loan_applications WHERE date(created_at) = date('now')`).first(),
        env.DB.prepare(`SELECT COUNT(*) as c FROM loan_applications WHERE created_at >= datetime('now', '-7 days')`).first(),
        env.DB.prepare(`SELECT COALESCE(SUM(requested_credit_amount), 0) as total FROM loan_applications WHERE status NOT IN ('rechazada', 'completada')`).first(),
        env.DB.prepare(`SELECT status, COUNT(*) as count FROM loan_applications GROUP BY status ORDER BY count DESC`).all(),
        env.DB.prepare(`SELECT home_province as province, COUNT(*) as count FROM loan_applications WHERE home_province IS NOT NULL GROUP BY home_province ORDER BY count DESC LIMIT 10`).all(),
        env.DB.prepare(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 20`).all(),
      ]);

      // Leads by day (last 30 days)
      const leadsByDay = await env.DB.prepare(
        `SELECT date(created_at) as day, COUNT(*) as count FROM calculator_leads WHERE created_at >= datetime('now', '-30 days') GROUP BY date(created_at) ORDER BY day`
      ).all();

      // Conversion funnel
      const funnel = await env.DB.prepare(
        `SELECT
          (SELECT COUNT(*) FROM calculator_leads) as leads_total,
          (SELECT COUNT(*) FROM loan_applications) as apps_total,
          (SELECT COUNT(*) FROM loan_applications WHERE status IN ('aprobada','desembolsada','completada')) as approved_total,
          (SELECT COUNT(*) FROM loan_applications WHERE status = 'desembolsada') as disbursed_total`
      ).first();

      // Monthly applications trend (last 6 months)
      const monthlyTrend = await env.DB.prepare(
        `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count, COALESCE(SUM(requested_credit_amount), 0) as volume
         FROM loan_applications WHERE created_at >= datetime('now', '-6 months')
         GROUP BY strftime('%Y-%m', created_at) ORDER BY month`
      ).all();

      // Average loan amount
      const avgAmount = await env.DB.prepare(
        `SELECT COALESCE(AVG(requested_credit_amount), 0) as avg_amount FROM loan_applications WHERE requested_credit_amount > 0`
      ).first();

      // Response time: avg hours from created_at to first status change away from 'nueva'
      const responseTime = await env.DB.prepare(
        `SELECT AVG((julianday(a.new_time) - julianday(la.created_at)) * 24) as avg_hours
         FROM loan_applications la
         JOIN (SELECT record_id, MIN(created_at) as new_time FROM activity_log WHERE record_type = 'applications' AND action = 'status_changed' AND old_value = 'nueva' GROUP BY record_id) a
         ON la.id = a.record_id`
      ).first();

      // Cases overview
      let casesOverview = { total: 0, active: 0, overdue: 0 };
      try {
        const co = await env.DB.prepare(
          `SELECT COUNT(*) as total,
           SUM(CASE WHEN status NOT IN ('cerrado','desembolsado','rechazado') THEN 1 ELSE 0 END) as active,
           SUM(CASE WHEN follow_up_date < datetime('now') AND status NOT IN ('cerrado','desembolsado','rechazado') THEN 1 ELSE 0 END) as overdue
           FROM cases`
        ).first();
        if (co) casesOverview = { total: co.total || 0, active: co.active || 0, overdue: co.overdue || 0 };
      } catch {}

      // Attention needed: applications in 'nueva' for 48+ hours
      const attention = await env.DB.prepare(
        `SELECT id, applicant_full_name, cell_phone, requested_credit_amount, created_at
         FROM loan_applications WHERE status = 'nueva' AND created_at <= datetime('now', '-2 days')
         ORDER BY created_at ASC LIMIT 10`
      ).all();

      return corsResponse({
        totalApplications: apps?.c || 0,
        totalContacts: contacts?.c || 0,
        totalLeads: leads?.c || 0,
        todayApplications: today?.c || 0,
        weekApplications: week?.c || 0,
        pipelineValue: pipeline?.total || 0,
        byStatus: byStatus?.results || [],
        byProvince: byProvince?.results || [],
        recentActivity: (recentActivity?.results || []).map(rowToCamel),
        leadsByDay: leadsByDay?.results || [],
        funnel: funnel || {},
        monthlyTrend: monthlyTrend?.results || [],
        avgAmount: avgAmount?.avg_amount || 0,
        avgResponseHours: responseTime?.avg_hours || null,
        casesOverview,
        attention: (attention?.results || []).map(rowToCamel),
      });
    }

    // --- LIST (paginated, filterable, searchable) ---
    if (action === 'list') {
      const type = url.searchParams.get('type') || 'applications';
      const table = TABLE_MAP[type];
      if (!table) return errorResponse('Tipo inválido.');

      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '25', 10);
      const offset = (page - 1) * limit;
      const status = url.searchParams.get('status');
      const priority = url.searchParams.get('priority');
      const search = url.searchParams.get('q');
      const dateFrom = url.searchParams.get('from');
      const dateTo = url.searchParams.get('to');
      const sortBy = url.searchParams.get('sort') || 'created_at';
      const sortDir = url.searchParams.get('dir') === 'asc' ? 'ASC' : 'DESC';
      const format = url.searchParams.get('format');

      let conditions = [];
      let binds = [];

      if (status) { conditions.push('status = ?'); binds.push(status); }
      if (priority && type === 'applications') { conditions.push('priority = ?'); binds.push(priority); }
      if (dateFrom) { conditions.push('created_at >= ?'); binds.push(dateFrom); }
      if (dateTo) { conditions.push('created_at <= ?'); binds.push(dateTo + 'T23:59:59'); }

      if (search) {
        if (type === 'applications') {
          conditions.push(`(applicant_full_name LIKE ? OR applicant_id_number LIKE ? OR cell_phone LIKE ? OR personal_email LIKE ? OR employer_name LIKE ?)`);
          const q = `%${search}%`;
          binds.push(q, q, q, q, q);
        } else if (type === 'contacts') {
          conditions.push(`(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)`);
          const q = `%${search}%`;
          binds.push(q, q, q, q);
        } else {
          conditions.push(`(email LIKE ?)`);
          binds.push(`%${search}%`);
        }
      }

      const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
      const allowedSorts = ['created_at', 'status', 'applicant_full_name', 'requested_credit_amount', 'full_name', 'email'];
      const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';

      // CSV export
      if (format === 'csv') {
        const allRows = await env.DB.prepare(`SELECT * FROM ${table}${where} ORDER BY ${safeSort} ${sortDir}`).bind(...binds).all();
        if (!allRows.results.length) return new Response('', { status: 200, headers: { 'Content-Type': 'text/csv', 'Access-Control-Allow-Origin': '*' } });
        const headers = Object.keys(allRows.results[0]);
        const csvLines = [headers.join(',')];
        for (const row of allRows.results) {
          csvLines.push(headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','));
        }
        await logActivity(env.DB, type, 0, 'exported', null, `${allRows.results.length} registros`, 'Admin');
        return new Response(csvLines.join('\n'), {
          headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${type}-${new Date().toISOString().slice(0,10)}.csv"`, 'Access-Control-Allow-Origin': '*' },
        });
      }

      const countResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM ${table}${where}`).bind(...binds).first();
      const rows = await env.DB.prepare(`SELECT * FROM ${table}${where} ORDER BY ${safeSort} ${sortDir} LIMIT ? OFFSET ?`).bind(...binds, limit, offset).all();

      return corsResponse({
        data: rows.results.map(rowToCamel),
        total: countResult?.total || 0,
        page, totalPages: Math.ceil((countResult?.total || 0) / limit),
      });
    }

    // --- SINGLE RECORD DETAIL ---
    if (action === 'detail') {
      const type = url.searchParams.get('type') || 'applications';
      const table = TABLE_MAP[type];
      const id = url.searchParams.get('id');
      if (!table || !id) return errorResponse('Datos inválidos.');
      const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
      if (!row) return errorResponse('No encontrado.', 404);
      const notes = await env.DB.prepare(`SELECT * FROM notes WHERE record_type = ? AND record_id = ? ORDER BY created_at DESC`).bind(type, id).all();
      const activity = await env.DB.prepare(`SELECT * FROM activity_log WHERE record_type = ? AND record_id = ? ORDER BY created_at DESC LIMIT 50`).bind(type, id).all();

      // Look up Rapi-ID scan data from activity log
      let rapiIdData = null;
      if (type === 'applications' && row.applicant_id_number) {
        const idNum = row.applicant_id_number.replace(/[^a-zA-Z0-9]/g, '');
        const rapiIdLog = await env.DB.prepare(
          `SELECT new_value FROM activity_log WHERE record_type = 'rapi_id' AND action = 'cedula_scanned' ORDER BY created_at DESC LIMIT 5`
        ).all();
        // Find matching entry by ID number
        for (const entry of (rapiIdLog?.results || [])) {
          try {
            const parsed = JSON.parse(entry.new_value);
            if (parsed.id && parsed.id.replace(/[^a-zA-Z0-9]/g, '') === idNum) {
              rapiIdData = parsed;
              break;
            }
          } catch {}
        }
      }

      return corsResponse({
        record: rowToCamel(row),
        notes: (notes?.results || []).map(rowToCamel),
        activity: (activity?.results || []).map(rowToCamel),
        rapiIdData,
      });
    }

    // --- NOTES FOR RECORD ---
    if (action === 'notes') {
      const rType = url.searchParams.get('type');
      const rId = url.searchParams.get('id');
      if (!rType || !rId) return errorResponse('Datos inválidos.');
      const notes = await env.DB.prepare(`SELECT * FROM notes WHERE record_type = ? AND record_id = ? ORDER BY created_at DESC`).bind(rType, rId).all();
      return corsResponse({ notes: (notes?.results || []).map(rowToCamel) });
    }

    // --- ACTIVITY LOG (global) ---
    if (action === 'activity') {
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const rows = await env.DB.prepare(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?`).bind(limit).all();
      return corsResponse({ activity: (rows?.results || []).map(rowToCamel) });
    }

    // --- CMS: GET SETTINGS ---
    if (action === 'settings') {
      const rows = await env.DB.prepare(`SELECT * FROM site_settings ORDER BY setting_key`).all();
      const settings = {};
      for (const r of (rows?.results || [])) { settings[r.setting_key] = r.setting_value; }
      return corsResponse({ settings });
    }

    // --- CMS: GET CONTENT ---
    if (action === 'content') {
      const pg = url.searchParams.get('page');
      let rows;
      if (pg) {
        rows = await env.DB.prepare(`SELECT * FROM site_content WHERE page = ? ORDER BY section, field_key`).bind(pg).all();
      } else {
        rows = await env.DB.prepare(`SELECT * FROM site_content ORDER BY page, section, field_key`).all();
      }
      return corsResponse({ content: (rows?.results || []).map(rowToCamel) });
    }

    // --- CMS: GET PARTNERS ---
    if (action === 'partners') {
      const rows = await env.DB.prepare(`SELECT * FROM partner_locations ORDER BY sort_order, name`).all();
      return corsResponse({ partners: (rows?.results || []).map(rowToCamel) });
    }

    return errorResponse('Acción no reconocida.', 400);
  }

  return errorResponse('Método no soportado.', 405);
}

async function logActivity(db, recordType, recordId, action, oldValue, newValue, actor) {
  try {
    await db.prepare(
      `INSERT INTO activity_log (record_type, record_id, action, old_value, new_value, actor) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(recordType, recordId, action, oldValue || null, newValue || null, actor || 'system').run();
  } catch (e) { console.error('Activity log error:', e); }
}
