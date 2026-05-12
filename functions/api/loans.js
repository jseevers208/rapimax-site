import { corsResponse, handleOptions, errorResponse, camelToSnake, rowToCamel } from './_helpers.js';

export async function onRequestOptions() { return handleOptions(); }

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();
  const url = new URL(request.url);

  // --- GET: Fetch loan by email, cedula, or loan number (client portal) ---
  if (request.method === 'GET') {
    const email = url.searchParams.get('email');
    const cedula = url.searchParams.get('cedula');
    const loanNumber = url.searchParams.get('loan');
    const token = url.searchParams.get('token');

    let loan;
    if (loanNumber) {
      loan = await env.DB.prepare('SELECT * FROM loans WHERE loan_number = ?').bind(loanNumber).first();
    } else if (email) {
      loan = await env.DB.prepare('SELECT * FROM loans WHERE borrower_email = ?').bind(email.toLowerCase().trim()).first();
    } else if (cedula) {
      loan = await env.DB.prepare('SELECT * FROM loans WHERE borrower_id_number = ?').bind(cedula.replace(/\s/g, '')).first();
    } else {
      return errorResponse('Email, cédula o número de préstamo requerido.');
    }

    if (!loan) return corsResponse({ found: false });

    // Get payment schedule
    const schedule = await env.DB.prepare(
      'SELECT * FROM payment_schedule WHERE loan_id = ? ORDER BY installment_number ASC'
    ).bind(loan.id).all();

    // Get payment history
    const payments = await env.DB.prepare(
      'SELECT * FROM loan_payments WHERE loan_id = ? ORDER BY created_at DESC'
    ).bind(loan.id).all();

    // Calculate summary
    const scheduleRows = schedule?.results || [];
    const paidCount = scheduleRows.filter(s => s.status === 'paid').length;
    const nextPayment = scheduleRows.find(s => s.status === 'pending');
    const totalPaid = scheduleRows.filter(s => s.status === 'paid').reduce((sum, s) => sum + (s.paid_amount || s.total_due), 0);
    const remainingBalance = scheduleRows.filter(s => s.status !== 'paid').reduce((sum, s) => sum + s.total_due, 0);

    return corsResponse({
      found: true,
      loan: rowToCamel(loan),
      schedule: scheduleRows.map(rowToCamel),
      payments: (payments?.results || []).map(rowToCamel),
      summary: {
        totalInstallments: scheduleRows.length,
        paidInstallments: paidCount,
        pendingInstallments: scheduleRows.length - paidCount,
        totalPaid: Math.round(totalPaid * 100) / 100,
        remainingBalance: Math.round(remainingBalance * 100) / 100,
        nextPayment: nextPayment ? rowToCamel(nextPayment) : null,
        progressPercent: scheduleRows.length > 0 ? Math.round((paidCount / scheduleRows.length) * 100) : 0,
      }
    });
  }

  // --- POST: Actions ---
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return errorResponse('Datos inválidos.', 400); }

    // --- Generate ONVO payment link ---
    if (body.action === 'create_payment_link') {
      if (!env.ONVO_SECRET_KEY) return errorResponse('Pagos con tarjeta no están configurados.', 503);
      const { loanId, scheduleId, amount, currency, description } = body;
      if (!loanId || !amount) return errorResponse('Datos de pago incompletos.');

      try {
        const onvoRes = await fetch('https://api.onvopay.com/v1/checkout/sessions/one-time-link', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.ONVO_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // ONVO expects cents
            currency: (currency || 'USD').toUpperCase(),
            description: description || `RapiMax — Pago de cuota`,
            metadata: { loanId: String(loanId), scheduleId: String(scheduleId || ''), source: 'rapimax-portal' }
          }),
        });

        if (!onvoRes.ok) {
          const errText = await onvoRes.text();
          console.error('ONVO error:', onvoRes.status, errText);
          return errorResponse('Error al crear enlace de pago.', 500);
        }

        const session = await onvoRes.json();

        // Log the payment attempt
        await env.DB.prepare(
          `INSERT INTO loan_payments (loan_id, schedule_id, amount, currency, payment_method, onvo_session_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(loanId, scheduleId || null, amount, currency || 'USD', 'onvo_card', session.id || '', 'pending', 'Enlace de pago generado').run();

        return corsResponse({
          success: true,
          checkoutUrl: session.url || session.checkout_url,
          sessionId: session.id,
        });
      } catch (err) {
        console.error('ONVO payment error:', err);
        return errorResponse('Error de conexión con procesador de pagos.', 500);
      }
    }

    // --- Record manual payment (admin, via wire transfer) ---
    if (body.action === 'record_payment') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      // Simple auth check (reuse admin password for now)
      const adminPw = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
      if (token !== adminPw) {
        // Try JWT
        const { verifyToken } = await import('./_helpers.js');
        const payload = await verifyToken(token, adminPw);
        if (!payload) return errorResponse('No autorizado.', 401);
      }

      const { loanId, scheduleId, amount, currency, paymentMethod, referenceNumber, notes } = body;
      if (!loanId || !amount) return errorResponse('Datos de pago incompletos.');

      // Record payment
      await env.DB.prepare(
        `INSERT INTO loan_payments (loan_id, schedule_id, amount, currency, payment_method, reference_number, status, notes, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(loanId, scheduleId || null, amount, currency || 'USD', paymentMethod || 'wire_transfer', referenceNumber || '', 'completed', notes || '', 'admin').run();

      // Mark schedule item as paid
      if (scheduleId) {
        await env.DB.prepare(
          `UPDATE payment_schedule SET status = 'paid', paid_date = datetime('now'), paid_amount = ?, payment_method = ? WHERE id = ?`
        ).bind(amount, paymentMethod || 'wire_transfer', scheduleId).run();
      }

      return corsResponse({ success: true, message: 'Pago registrado exitosamente.' });
    }

    // --- Generate amortization schedule for a loan ---
    if (body.action === 'generate_schedule') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const adminPw = env.ADMIN_PASSWORD || 'rapimax-admin-2026';
      if (token !== adminPw) {
        const { verifyToken } = await import('./_helpers.js');
        const payload = await verifyToken(token, adminPw);
        if (!payload) return errorResponse('No autorizado.', 401);
      }

      const { loanId } = body;
      if (!loanId) return errorResponse('ID de préstamo requerido.');

      const loan = await env.DB.prepare('SELECT * FROM loans WHERE id = ?').bind(loanId).first();
      if (!loan) return errorResponse('Préstamo no encontrado.', 404);

      // Check if schedule already exists
      const existing = await env.DB.prepare('SELECT COUNT(*) as c FROM payment_schedule WHERE loan_id = ?').bind(loanId).first();
      if (existing && existing.c > 0) return errorResponse('El cronograma ya existe. Eliminalo primero para regenerar.');

      // Generate amortization schedule
      const P = loan.principal_amount;
      const r = loan.interest_rate / 100 / 12; // monthly rate
      const n = loan.term_months;
      const M = loan.monthly_payment;
      let balance = P;
      const startDate = new Date(loan.first_payment_date || loan.disbursement_date);

      const stmts = [];
      for (let i = 1; i <= n; i++) {
        const interestPortion = Math.round(balance * r * 100) / 100;
        const principalPortion = Math.round((M - interestPortion) * 100) / 100;
        balance = Math.max(0, Math.round((balance - principalPortion) * 100) / 100);

        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        const dueDateStr = dueDate.toISOString().slice(0, 10);

        stmts.push(
          env.DB.prepare(
            `INSERT INTO payment_schedule (loan_id, installment_number, due_date, principal_portion, interest_portion, total_due, balance_after, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
          ).bind(loanId, i, dueDateStr, principalPortion, interestPortion, M, balance)
        );
      }

      // Batch insert
      for (const stmt of stmts) { await stmt.run(); }

      return corsResponse({ success: true, message: `Cronograma generado: ${n} cuotas.`, installments: n });
    }

    return errorResponse('Acción no reconocida.');
  }

  return errorResponse('Método no soportado.', 405);
}
