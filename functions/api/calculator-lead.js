import { corsResponse, handleOptions, errorResponse } from './_helpers.js';

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    if (!data.email) {
      return errorResponse('Email es requerido.');
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ua = request.headers.get('User-Agent') || 'unknown';

    await env.DB.prepare(
      `INSERT INTO calculator_leads
       (email, vehicle_type, vehicle_use, currency, vehicle_value, vehicle_year,
        down_payment, term_months, monthly_payment, annual_rate, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      data.email, data.vehicleType || null, data.vehicleUse || null,
      data.currency || null, data.vehicleValue || null, data.vehicleYear || null,
      data.downPayment || null, data.termMonths || null, data.monthlyPayment || null,
      data.annualRate || null, ip, ua
    ).run();

    return corsResponse({ success: true, message: 'Datos guardados.' });
  } catch (err) {
    console.error('Calculator lead error:', err);
    return errorResponse('Error al guardar los datos.', 500);
  }
}
