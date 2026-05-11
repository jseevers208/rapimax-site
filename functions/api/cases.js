import { corsResponse, handleOptions, errorResponse, checkAdminAuth, rowToCamel } from './_helpers.js';
import { sendStatusWhatsApp } from './_whatsapp.js';

export async function onRequestOptions() { return handleOptions(); }

const CASE_STATUSES = ['lead', 'contactado', 'en-proceso', 'documentos', 'en-revision', 'aprobado', 'rechazado', 'desembolsado', 'cerrado'];

export async function onRequest(context) {
  const { request, env, ctx } = context;
  if (request.method === 'OPTIONS') return handleOptions();
  if (!checkAdminAuth(request, env)) return errorResponse('No autorizado.', 401);

  const url = new URL(request.url);

  // ---- GET ----
  if (request.method === 'GET') {
    const action = url.searchParams.get('action') || 'list';

    // Kanban data — grouped by status
    if (action === 'kanban') {
      const assigned = url.searchParams.get('assigned');
      let where = '';
      const binds = [];
      if (assigned) { where = ' WHERE assigned_to = ?'; binds.push(assigned); }
      const rows = await env.DB.prepare(`SELECT * FROM cases${where} ORDER BY priority DESC, updated_at DESC`).bind(...binds).all();
      const grouped = {};
      for (const s of CASE_STATUSES) grouped[s] = [];
      for (const row of (rows?.results || [])) {
        const r = rowToCamel(row);
        if (grouped[r.status]) grouped[r.status].push(r);
        else grouped.lead.push(r);
      }
      return corsResponse({ kanban: grouped, statuses: CASE_STATUSES });
    }

    // List (paginated, filterable, searchable)
    if (action === 'list') {
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '25', 10);
      const offset = (page - 1) * limit;
      const status = url.searchParams.get('status');
      const assigned = url.searchParams.get('assigned');
      const priority = url.searchParams.get('priority');
      const search = url.searchParams.get('q');
      const sortBy = url.searchParams.get('sort') || 'updated_at';
      const sortDir = url.searchParams.get('dir') === 'asc' ? 'ASC' : 'DESC';
      const overdue = url.searchParams.get('overdue');

      let conditions = [];
      let binds = [];
      if (status) { conditions.push('status = ?'); binds.push(status); }
      if (assigned) { conditions.push('assigned_to = ?'); binds.push(assigned); }
      if (priority) { conditions.push('priority = ?'); binds.push(priority); }
      if (overdue === 'true') { conditions.push("follow_up_date < datetime('now') AND status NOT IN ('cerrado','desembolsado','rechazado')"); }
      if (search) {
        conditions.push(`(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)`);
        const q = `%${search}%`;
        binds.push(q, q, q);
      }

      const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
      const allowedSorts = ['created_at', 'updated_at', 'status', 'full_name', 'priority', 'follow_up_date', 'estimated_value'];
      const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'updated_at';

      const countResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM cases${where}`).bind(...binds).first();
      const rows = await env.DB.prepare(`SELECT * FROM cases${where} ORDER BY ${safeSort} ${sortDir} LIMIT ? OFFSET ?`).bind(...binds, limit, offset).all();

      return corsResponse({
        data: (rows?.results || []).map(rowToCamel),
        total: countResult?.total || 0,
        page,
        totalPages: Math.ceil((countResult?.total || 0) / limit),
      });
    }

    // Single case detail
    if (action === 'detail') {
      const id = url.searchParams.get('id');
      if (!id) return errorResponse('ID requerido.');
      const row = await env.DB.prepare('SELECT * FROM cases WHERE id = ?').bind(id).first();
      if (!row) return errorResponse('Caso no encontrado.', 404);
      const caseData = rowToCamel(row);

      // Fetch linked records
      let application = null, contact = null, leads = [];
      if (caseData.linkedApplicationId) {
        const app = await env.DB.prepare('SELECT * FROM loan_applications WHERE id = ?').bind(caseData.linkedApplicationId).first();
        if (app) application = rowToCamel(app);
      }
      if (caseData.linkedContactId) {
        const ct = await env.DB.prepare('SELECT * FROM contact_messages WHERE id = ?').bind(caseData.linkedContactId).first();
        if (ct) contact = rowToCamel(ct);
      }
      try {
        const leadIds = JSON.parse(caseData.linkedLeadIds || '[]');
        if (leadIds.length) {
          const placeholders = leadIds.map(() => '?').join(',');
          const lr = await env.DB.prepare(`SELECT * FROM calculator_leads WHERE id IN (${placeholders})`).bind(...leadIds).all();
          leads = (lr?.results || []).map(rowToCamel);
        }
      } catch {}

      const notes = await env.DB.prepare('SELECT * FROM notes WHERE record_type = ? AND record_id = ? ORDER BY created_at DESC').bind('cases', id).all();
      const activity = await env.DB.prepare('SELECT * FROM activity_log WHERE record_type = ? AND record_id = ? ORDER BY created_at DESC LIMIT 50').bind('cases', id).all();

      return corsResponse({
        case: caseData,
        application,
        contact,
        leads,
        notes: (notes?.results || []).map(rowToCamel),
        activity: (activity?.results || []).map(rowToCamel),
      });
    }

    // Lookup — search across all tables by name/email/phone
    if (action === 'lookup') {
      const q = url.searchParams.get('q');
      if (!q || q.length < 2) return corsResponse({ results: [] });
      const like = `%${q}%`;

      const [apps, contacts, leads] = await Promise.all([
        env.DB.prepare(`SELECT id, applicant_full_name as name, personal_email as email, cell_phone as phone, 'application' as source, created_at FROM loan_applications WHERE applicant_full_name LIKE ? OR personal_email LIKE ? OR cell_phone LIKE ? ORDER BY created_at DESC LIMIT 5`).bind(like, like, like).all(),
        env.DB.prepare(`SELECT id, full_name as name, email, phone, 'contact' as source, created_at FROM contact_messages WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY created_at DESC LIMIT 5`).bind(like, like, like).all(),
        env.DB.prepare(`SELECT id, full_name as name, email, phone, 'lead' as source, created_at FROM calculator_leads WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY created_at DESC LIMIT 5`).bind(like, like, like).all(),
      ]);

      const results = [
        ...(apps?.results || []).map(rowToCamel),
        ...(contacts?.results || []).map(rowToCamel),
        ...(leads?.results || []).map(rowToCamel),
      ].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

      return corsResponse({ results });
    }

    // Stats for cases dashboard
    if (action === 'stats') {
      const [total, byStatus, overdue, thisWeek, unassigned] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as c FROM cases').first(),
        env.DB.prepare('SELECT status, COUNT(*) as count FROM cases GROUP BY status').all(),
        env.DB.prepare("SELECT COUNT(*) as c FROM cases WHERE follow_up_date < datetime('now') AND status NOT IN ('cerrado','desembolsado','rechazado')").first(),
        env.DB.prepare("SELECT COUNT(*) as c FROM cases WHERE created_at >= datetime('now', '-7 days')").first(),
        env.DB.prepare("SELECT COUNT(*) as c FROM cases WHERE assigned_to IS NULL AND status NOT IN ('cerrado','desembolsado','rechazado')").first(),
      ]);
      return corsResponse({
        total: total?.c || 0,
        byStatus: byStatus?.results || [],
        overdue: overdue?.c || 0,
        thisWeek: thisWeek?.c || 0,
        unassigned: unassigned?.c || 0,
      });
    }

    return errorResponse('Acción no reconocida.');
  }

  // ---- POST ----
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return errorResponse('Datos inválidos.', 400); }

    // Create case
    if (body.action === 'create') {
      const c = body;
      const result = await env.DB.prepare(
        `INSERT INTO cases (status, assigned_to, priority, follow_up_date, next_steps, source, full_name, email, phone, linked_application_id, linked_contact_id, linked_lead_ids, estimated_value)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        c.status || 'lead', c.assignedTo || null, c.priority || 'normal',
        c.followUpDate || null, c.nextSteps || null, c.source || 'manual',
        c.fullName || null, c.email || null, c.phone || null,
        c.linkedApplicationId || null, c.linkedContactId || null,
        JSON.stringify(c.linkedLeadIds || []), c.estimatedValue || null
      ).run();

      await logCaseActivity(env.DB, result.meta?.last_row_id, 'created', null, c.fullName || 'Nuevo caso', body.actor || 'Admin');
      return corsResponse({ success: true, id: result.meta?.last_row_id });
    }

    // Update case
    if (body.action === 'update') {
      if (!body.id) return errorResponse('ID requerido.');
      const old = await env.DB.prepare('SELECT * FROM cases WHERE id = ?').bind(body.id).first();
      if (!old) return errorResponse('Caso no encontrado.', 404);

      const fields = [];
      const vals = [];
      const trackable = ['status', 'assigned_to', 'priority', 'follow_up_date', 'next_steps', 'full_name', 'email', 'phone', 'estimated_value', 'linked_application_id', 'linked_contact_id', 'linked_lead_ids'];
      const fieldMap = {
        status: 'status', assignedTo: 'assigned_to', priority: 'priority',
        followUpDate: 'follow_up_date', nextSteps: 'next_steps', fullName: 'full_name',
        email: 'email', phone: 'phone', estimatedValue: 'estimated_value',
        linkedApplicationId: 'linked_application_id', linkedContactId: 'linked_contact_id',
        linkedLeadIds: 'linked_lead_ids'
      };

      for (const [camel, snake] of Object.entries(fieldMap)) {
        if (body[camel] !== undefined) {
          fields.push(`${snake} = ?`);
          vals.push(camel === 'linkedLeadIds' ? JSON.stringify(body[camel]) : body[camel]);
          if (old[snake] !== (body[camel] ?? null)) {
            await logCaseActivity(env.DB, body.id, `${snake}_changed`, String(old[snake] ?? ''), String(body[camel] ?? ''), body.actor || 'Admin');
          }
        }
      }

      if (fields.length) {
        fields.push("updated_at = datetime('now')");
        await env.DB.prepare(`UPDATE cases SET ${fields.join(', ')} WHERE id = ?`).bind(...vals, body.id).run();
      }

      return corsResponse({ success: true });
    }

    // Add note to case
    if (body.action === 'add_note') {
      if (!body.id || !body.content) return errorResponse('Datos requeridos.');
      await env.DB.prepare('INSERT INTO notes (record_type, record_id, author, content) VALUES (?, ?, ?, ?)').bind('cases', body.id, body.author || 'Admin', body.content).run();
      await env.DB.prepare("UPDATE cases SET notes_count = notes_count + 1, updated_at = datetime('now') WHERE id = ?").bind(body.id).run();
      await logCaseActivity(env.DB, body.id, 'note_added', null, body.content.slice(0, 80), body.author || 'Admin');
      return corsResponse({ success: true });
    }

    // Quick status change (for kanban drag)
    if (body.action === 'move') {
      if (!body.id || !body.status) return errorResponse('Datos requeridos.');
      const old = await env.DB.prepare('SELECT status, phone, full_name FROM cases WHERE id = ?').bind(body.id).first();
      await env.DB.prepare("UPDATE cases SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(body.status, body.id).run();
      await logCaseActivity(env.DB, body.id, 'status_changed', old?.status, body.status, body.actor || 'Admin');
      // WhatsApp notification for case status change (non-blocking)
      if (old?.phone) {
        ctx.waitUntil(sendStatusWhatsApp(env, old.phone, body.status, old.full_name));
      }
      return corsResponse({ success: true });
    }

    return errorResponse('Acción no reconocida.', 400);
  }

  return errorResponse('Método no soportado.', 405);
}

async function logCaseActivity(db, caseId, action, oldVal, newVal, actor) {
  try {
    await db.prepare('INSERT INTO activity_log (record_type, record_id, action, old_value, new_value, actor) VALUES (?, ?, ?, ?, ?, ?)').bind('cases', caseId, action, oldVal || null, newVal || null, actor).run();
  } catch (e) { console.error('Activity log error:', e); }
}
