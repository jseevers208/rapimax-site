import { corsResponse, handleOptions, rowToCamel } from './_helpers.js';

export async function onRequestOptions() { return handleOptions(); }

// GET /api/content?page=home&lang=es
// GET /api/content?type=settings
// GET /api/content?type=partners
export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const type = url.searchParams.get('type') || 'page';

  if (type === 'settings') {
    const rows = await env.DB.prepare(`SELECT setting_key, setting_value FROM site_settings`).all();
    const settings = {};
    for (const r of (rows?.results || [])) { settings[r.setting_key] = r.setting_value; }
    return corsResponse({ settings }, 200);
  }

  if (type === 'partners') {
    const rows = await env.DB.prepare(`SELECT * FROM partner_locations WHERE is_active = 1 ORDER BY sort_order, name`).all();
    return corsResponse({ partners: (rows?.results || []).map(rowToCamel) }, 200);
  }

  // Page content
  const page = url.searchParams.get('page');
  const lang = url.searchParams.get('lang') || 'es';
  if (!page) return corsResponse({ content: {} });

  const rows = await env.DB.prepare(`SELECT section, field_key, value_es, value_en FROM site_content WHERE page = ?`).bind(page).all();
  const content = {};
  for (const r of (rows?.results || [])) {
    if (!content[r.section]) content[r.section] = {};
    content[r.section][r.field_key] = lang === 'en' ? (r.value_en || r.value_es) : r.value_es;
  }
  return corsResponse({ content }, 200);
}
