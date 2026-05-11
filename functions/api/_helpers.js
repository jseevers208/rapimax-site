// Shared API helpers for Cloudflare Pages Functions

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function corsResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function errorResponse(message, status = 400) {
  return corsResponse({ error: message }, status);
}

export function checkAdminAuth(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const adminPassword = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
  return token === adminPassword;
}

export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function rowToCamel(row) {
  if (!row) return null;
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [snakeToCamel(key), value])
  );
}

// Auto-create or link a Case when a form is submitted
export async function autoCreateCase(db, { source, fullName, email, phone, linkedApplicationId, linkedContactId, linkedLeadId, estimatedValue }) {
  try {
    // Check if a case already exists for this email or phone
    let existing = null;
    if (email) {
      existing = await db.prepare("SELECT * FROM cases WHERE email = ? AND status NOT IN ('cerrado') ORDER BY created_at DESC LIMIT 1").bind(email).first();
    }
    if (!existing && phone) {
      existing = await db.prepare("SELECT * FROM cases WHERE phone = ? AND status NOT IN ('cerrado') ORDER BY created_at DESC LIMIT 1").bind(phone).first();
    }

    if (existing) {
      // Link new record to existing case
      const updates = ["updated_at = datetime('now')"];
      const binds = [];
      if (linkedApplicationId && !existing.linked_application_id) {
        updates.push('linked_application_id = ?'); binds.push(linkedApplicationId);
      }
      if (linkedContactId && !existing.linked_contact_id) {
        updates.push('linked_contact_id = ?'); binds.push(linkedContactId);
      }
      if (linkedLeadId) {
        const currentLeads = JSON.parse(existing.linked_lead_ids || '[]');
        if (!currentLeads.includes(linkedLeadId)) {
          currentLeads.push(linkedLeadId);
          updates.push('linked_lead_ids = ?'); binds.push(JSON.stringify(currentLeads));
        }
      }
      if (estimatedValue && !existing.estimated_value) {
        updates.push('estimated_value = ?'); binds.push(estimatedValue);
      }
      if (!existing.full_name && fullName) {
        updates.push('full_name = ?'); binds.push(fullName);
      }
      if (!existing.phone && phone) {
        updates.push('phone = ?'); binds.push(phone);
      }
      binds.push(existing.id);
      await db.prepare(`UPDATE cases SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
      await db.prepare('INSERT INTO activity_log (record_type, record_id, action, new_value, actor) VALUES (?, ?, ?, ?, ?)').bind('cases', existing.id, 'record_linked', `${source}: ${fullName || email}`, 'system').run();
      return existing.id;
    }

    // Create new case
    const result = await db.prepare(
      `INSERT INTO cases (source, full_name, email, phone, linked_application_id, linked_contact_id, linked_lead_ids, estimated_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      source, fullName || null, email || null, phone || null,
      linkedApplicationId || null, linkedContactId || null,
      linkedLeadId ? JSON.stringify([linkedLeadId]) : '[]',
      estimatedValue || null
    ).run();
    const caseId = result.meta?.last_row_id;
    await db.prepare('INSERT INTO activity_log (record_type, record_id, action, new_value, actor) VALUES (?, ?, ?, ?, ?)').bind('cases', caseId, 'created', `Desde ${source}: ${fullName || email || phone}`, 'system').run();
    return caseId;
  } catch (e) {
    console.error('Auto-case creation error:', e);
    return null;
  }
}
