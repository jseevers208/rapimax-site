import { corsResponse, handleOptions, errorResponse, camelToSnake, autoCreateCase } from './_helpers.js';

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    if (!data.applicantFullName || !data.applicantIdNumber || !data.cellPhone) {
      return errorResponse('Campos requeridos: nombre completo, número ID, celular.');
    }

    const columns = [
      'credit_facility_type', 'requested_credit_amount', 'requested_term_months',
      'applicant_id_type', 'applicant_id_number', 'applicant_full_name',
      'applicant_gender', 'marital_status', 'birth_place', 'birth_location',
      'birth_date', 'nationality', 'profession', 'location', 'landline_phone',
      'cell_phone', 'personal_email', 'home_address', 'home_country',
      'home_province', 'home_canton', 'residence_type', 'housing_payment',
      'exact_home_address', 'employer_name', 'occupation', 'gross_monthly_income',
      'employment_start_date', 'business_activity', 'work_location', 'work_phone',
      'work_fax', 'work_email', 'work_address', 'work_country', 'work_province',
      'work_canton', 'specific_work_address', 'spouse_id_type', 'spouse_id_number',
      'spouse_full_name', 'spouse_gender', 'spouse_nationality', 'spouse_birth_place',
      'spouse_employment_start_date', 'spouse_profession', 'spouse_gross_monthly_income',
      'reference1_name', 'reference1_phone', 'reference1_relationship',
      'reference2_name', 'reference2_phone', 'reference2_relationship',
      'ip_address', 'user_agent', 'access_token'
    ];

    // Generate portal access token
    const accessToken = Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ua = request.headers.get('User-Agent') || 'unknown';

    const snakeData = {};
    for (const [key, value] of Object.entries(data)) {
      snakeData[camelToSnake(key)] = value;
    }
    snakeData.ip_address = ip;
    snakeData.user_agent = ua;
    snakeData.access_token = accessToken;

    const presentColumns = columns.filter((col) => snakeData[col] !== undefined);
    const placeholders = presentColumns.map(() => '?').join(', ');
    const values = presentColumns.map((col) => snakeData[col] ?? null);

    const sql = `INSERT INTO loan_applications (${presentColumns.join(', ')}) VALUES (${placeholders})`;
    const result = await env.DB.prepare(sql).bind(...values).run();

    // Send email notification if Resend API key is configured
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
            subject: `Nueva solicitud de crédito — ${data.applicantFullName}`,
            html: `
              <h2>Nueva solicitud de financiamiento</h2>
              <p><strong>Nombre:</strong> ${data.applicantFullName}</p>
              <p><strong>Cédula:</strong> ${data.applicantIdType} ${data.applicantIdNumber}</p>
              <p><strong>Monto solicitado:</strong> $${data.requestedCreditAmount || 'N/A'}</p>
              <p><strong>Plazo:</strong> ${data.requestedTermMonths || 'N/A'} meses</p>
              <p><strong>Teléfono:</strong> ${data.cellPhone}</p>
              <p><strong>Email:</strong> ${data.personalEmail || 'N/A'}</p>
              <p><strong>Ingreso bruto mensual:</strong> $${data.grossMonthlyIncome || 'N/A'}</p>
              <hr>
              <p><a href="${env.SITE_URL || 'https://rapimax-dev.com'}/admin">Ver en panel de administración</a></p>
              <p><a href="${env.SITE_URL || 'https://rapimax-dev.com'}/mi-solicitud?token=${accessToken}">Ver portal del cliente</a></p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
    }

    // Log activity
    try {
      await env.DB.prepare(
        `INSERT INTO activity_log (record_type, record_id, action, new_value, actor) VALUES (?, ?, ?, ?, ?)`
      ).bind('applications', result.meta?.last_row_id, 'created', data.applicantFullName || 'N/A', 'system').run();
    } catch (e) { console.error('Activity log error:', e); }

    // Auto-create or link Case
    await autoCreateCase(env.DB, {
      source: 'solicitud',
      fullName: data.applicantFullName,
      email: data.personalEmail,
      phone: data.cellPhone,
      linkedApplicationId: result.meta?.last_row_id,
      estimatedValue: data.requestedCreditAmount || null,
    });

    return corsResponse({
      success: true,
      id: result.meta?.last_row_id,
      portalUrl: `/mi-solicitud?token=${accessToken}`,
      message: 'Solicitud recibida exitosamente.',
    });
  } catch (err) {
    console.error('Solicitud error:', err);
    return errorResponse('Error al procesar la solicitud. Intentá de nuevo.', 500);
  }
}
