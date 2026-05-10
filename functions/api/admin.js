import { corsResponse, handleOptions, errorResponse, checkAdminAuth, rowToCamel } from './_helpers.js';

export async function onRequestOptions() { return handleOptions(); }

const TABLE_MAP = { applications: 'loan_applications', contacts: 'contact_messages', leads: 'calculator_leads' };
const STATUS_LIST = ['nueva', 'en-proceso', 'contactada', 'documentos', 'en-revision', 'aprobada', 'rechazada', 'desembolsada', 'completada'];

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  // --- LOGIN ---
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return errorResponse('Datos inválidos.', 400); }

    if (body.action === 'login' || !body.action) {
      const pw = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
      if (body.password === pw) return corsResponse({ success: true, token: pw });
      return errorResponse('Contraseña incorrecta.', 401);
    }

    // Authenticated POST actions
    if (!checkAdminAuth(request, env)) return errorResponse('No autorizado.', 401);

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
    if (!checkAdminAuth(request, env)) return errorResponse('No autorizado.', 401);
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'list';

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
          (SELECT COUNT(*) FROM loan_applications WHERE status IN ('aprobada','desembolsada','completada')) as approved_total`
      ).first();

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
      return corsResponse({
        record: rowToCamel(row),
        notes: (notes?.results || []).map(rowToCamel),
        activity: (activity?.results || []).map(rowToCamel),
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
