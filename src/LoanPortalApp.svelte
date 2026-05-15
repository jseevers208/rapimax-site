<script>
  import { onMount } from 'svelte';

  let lookupValue = '';
  let loading = false;
  let error = '';
  let loanData = null; // { loan, schedule, payments, summary }
  let activeView = 'overview'; // overview | schedule | payments | pay

  // Check URL params
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const loan = params.get('loan');
    if (email) { lookupValue = email; fetchLoan(); }
    else if (loan) { lookupValue = loan; fetchLoan(); }
  });

  async function fetchLoan() {
    if (!lookupValue.trim()) return;
    loading = true; error = '';
    const v = lookupValue.trim();
    const param = v.includes('@') ? `email=${encodeURIComponent(v)}` : v.startsWith('RM-') ? `loan=${encodeURIComponent(v)}` : `cedula=${encodeURIComponent(v)}`;
    try {
      const res = await fetch(`/api/loans?${param}`);
      const result = await res.json();
      if (result.found) { loanData = result; }
      else { error = 'No se encontró un crédito activo con esos datos. Verificá tu email, cédula o número de préstamo.'; }
    } catch { error = 'Error de conexión. Intentá de nuevo.'; }
    loading = false;
  }

  function fmtMoney(amount, currency = 'USD') {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
  }

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const diff = (new Date(dateStr + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  }

  let payingScheduleId = null;
  let payLoading = false;
  let payError = '';

  async function payWithCard(scheduleItem) {
    payingScheduleId = scheduleItem.id;
    payLoading = true; payError = '';
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payment_link',
          loanId: loanData.loan.id,
          scheduleId: scheduleItem.id,
          amount: scheduleItem.totalDue,
          currency: loanData.loan.currency,
          description: `RapiMax Cuota #${scheduleItem.installmentNumber} — Préstamo ${loanData.loan.loanNumber}`
        })
      });
      const result = await res.json();
      if (result.success && result.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank');
      } else {
        payError = result.error || 'No se pudo generar el enlace de pago.';
      }
    } catch { payError = 'Error de conexión.'; }
    payLoading = false; payingScheduleId = null;
  }

  $: nextPay = loanData?.summary?.nextPayment;
  $: daysLeft = nextPay ? daysUntil(nextPay.dueDate) : null;
</script>

<div class="loan-portal">
  <header class="lp-header">
    <a href="/" class="lp-logo">
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 937.11 141.63' class="lp-logo__svg"><g><g><path fill='currentColor' d='M336.31,0h35.56C391.39,0,407.28,14.63,407.28,34.15s-13.69,31.63-26.91,34.15l24.39,41.86h-16.68l-22.82-40.44h-13.53v40.44h-15.42V0ZM371.87,55.86c11.96,0,19.98-9.76,19.98-21.72s-8.03-20.3-19.98-20.3h-20.14v42.02h20.14Z'/><path fill='currentColor' d='M416.72,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM482.5,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M553.94,30.21c22.35,0,40.6,18.1,40.6,40.6s-18.25,40.6-40.6,40.6c-10.54,0-19.04-4.41-24.86-11.33v41.54h-15.58v-70.81c0-22.5,18.1-40.6,40.44-40.6ZM579.12,70.81c0-14.32-10.7-25.65-25.18-25.65s-25.18,11.33-25.18,25.65,11.02,25.65,25.18,25.65,25.18-11.33,25.18-25.65Z'/><path fill='currentColor' d='M609.49,11.17c0-5.35,4.09-9.44,9.44-9.44s9.28,4.09,9.28,9.44-4.09,9.44-9.28,9.44-9.44-4.09-9.44-9.44ZM611.22,31.47h15.42v78.68h-15.42V31.47Z'/><path fill='currentColor' d='M756.3,0v110.15h-15.42V34.62l-34.15,75.53h-13.22l-34.15-75.53v75.53h-15.42V0h15.42l40.76,87.97L740.88,0h15.42Z'/><path fill='currentColor' d='M771.25,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM837.03,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M919.49,110.15l-20.3-28.17-20.3,28.17h-17.78l29.27-40.91-26.91-37.77h17.47l18.1,25.18,18.41-25.18h17.47l-26.91,37.77,29.11,40.91h-17.62Z'/></g><g><path fill='currentColor' d='M109.63,111.41h-21.98L27.86,51.57c-2.51-2.51-5.71-2.46-7.86-1.57-2.15.89-4.45,3.11-4.45,6.66v54.74H0v-54.74c0-9.38,5.39-17.44,14.05-21.03,8.67-3.59,18.17-1.7,24.8,4.94l19.41,19.43,31.98-31.95c2.51-2.51,2.46-5.71,1.57-7.86-.89-2.15-3.11-4.45-6.66-4.45H0V.19h85.15c9.38,0,17.44,5.38,21.03,14.05,3.59,8.67,1.69,18.17-4.94,24.8l-31.98,31.95,40.37,40.4Z'/><path fill='currentColor' d='M235.77,111.56h-15.79v-18.36c0-2.24-.87-4.34-2.46-5.93l-21.72-21.71-21.72,21.71c-1.58,1.58-2.46,3.69-2.46,5.93v18.36h-15.79v-12.74c0-7.68,0-14.94,5.79-20.72l23.36-23.35-38.16-38.19c-1.7-1.71-3.57-1.3-4.53-.9-.95.4-2.56,1.43-2.56,3.84v91.81h-15.29V19.5c0-8.02,4.6-14.9,12.01-17.97,7.41-3.06,15.53-1.45,21.2,4.22l38.16,38.19L233.91,5.76c5.67-5.68,13.8-7.3,21.21-4.23,7.41,3.07,12.01,9.95,12.01,17.97l-.04,91.76h-15.3l.05-91.76c0-2.41-1.61-3.44-2.57-3.84-.96-.4-2.82-.81-4.53.9l-38.13,38.19,23.36,23.35c5.79,5.78,5.79,13.04,5.79,20.72v12.74Z'/></g></g></svg>
    </a>
    {#if loanData}
      <div class="lp-header__user">
        <span class="lp-header__name">{loanData.loan.borrowerName}</span>
        <span class="lp-header__loan">{loanData.loan.loanNumber}</span>
      </div>
    {/if}
  </header>

  {#if !loanData}
    <!-- LOOKUP -->
    <div class="lp-lookup">
      <div class="lp-lookup__card">
        <div class="lp-lookup__icon">🔐</div>
        <h1>Mi Crédito</h1>
        <p>Ingresá tu correo electrónico, número de cédula o número de préstamo para acceder a tu crédito.</p>
        <form on:submit|preventDefault={fetchLoan}>
          <input type="text" placeholder="Email, cédula o N° de préstamo" bind:value={lookupValue} class="lp-input" autofocus />
          {#if error}<p class="lp-error">{error}</p>{/if}
          <button type="submit" class="lp-btn" disabled={loading}>{loading ? 'Buscando...' : 'Consultar mi crédito'}</button>
        </form>
        <a href="/ingresar" class="lp-link">¿Tenés una solicitud en proceso? Consultala acá</a>
        <a href="/" class="lp-link">Volver al inicio</a>
      </div>
    </div>
  {:else}
    <!-- DASHBOARD -->
    <div class="lp-dashboard">
      <!-- Nav tabs -->
      <nav class="lp-nav">
        <button class:active={activeView === 'overview'} on:click={() => activeView = 'overview'}>📊 Resumen</button>
        <button class:active={activeView === 'schedule'} on:click={() => activeView = 'schedule'}>📅 Cronograma</button>
        <button class:active={activeView === 'payments'} on:click={() => activeView = 'payments'}>💳 Pagos</button>
        <button class:active={activeView === 'pay'} on:click={() => activeView = 'pay'}>💰 Pagar</button>
      </nav>

      {#if activeView === 'overview'}
        <!-- OVERVIEW -->
        <div class="lp-section">
          <!-- Next payment alert -->
          {#if nextPay}
            <div class="lp-alert" class:lp-alert--urgent={daysLeft !== null && daysLeft <= 3} class:lp-alert--warn={daysLeft !== null && daysLeft > 3 && daysLeft <= 7}>
              <div class="lp-alert__main">
                <span class="lp-alert__label">Próximo pago</span>
                <span class="lp-alert__amount">{fmtMoney(nextPay.totalDue, loanData.loan.currency)}</span>
              </div>
              <div class="lp-alert__meta">
                <span>Cuota #{nextPay.installmentNumber} · {fmtDate(nextPay.dueDate)}</span>
                {#if daysLeft !== null}
                  <span class="lp-alert__days">
                    {#if daysLeft < 0}⚠️ Vencida hace {Math.abs(daysLeft)} días
                    {:else if daysLeft === 0}📍 Vence hoy
                    {:else}📅 En {daysLeft} días
                    {/if}
                  </span>
                {/if}
              </div>
              <button class="lp-alert__pay" on:click={() => { activeView = 'pay'; }}>Pagar ahora →</button>
            </div>
          {/if}

          <!-- Summary cards -->
          <div class="lp-cards">
            <div class="lp-card">
              <span class="lp-card__label">Monto original</span>
              <span class="lp-card__value">{fmtMoney(loanData.loan.principalAmount, loanData.loan.currency)}</span>
            </div>
            <div class="lp-card">
              <span class="lp-card__label">Cuota mensual</span>
              <span class="lp-card__value">{fmtMoney(loanData.loan.monthlyPayment, loanData.loan.currency)}</span>
            </div>
            <div class="lp-card">
              <span class="lp-card__label">Saldo pendiente</span>
              <span class="lp-card__value">{fmtMoney(loanData.summary.remainingBalance, loanData.loan.currency)}</span>
            </div>
            <div class="lp-card">
              <span class="lp-card__label">Progreso</span>
              <span class="lp-card__value">{loanData.summary.progressPercent}%</span>
              <div class="lp-card__bar"><div class="lp-card__fill" style="width:{loanData.summary.progressPercent}%"></div></div>
            </div>
          </div>

          <!-- Loan details -->
          <div class="lp-details">
            <h3>Detalles del crédito</h3>
            <div class="lp-details__grid">
              <div><span class="lbl">N° Préstamo</span><span>{loanData.loan.loanNumber}</span></div>
              <div><span class="lbl">Tasa de interés</span><span>{loanData.loan.interestRate}% anual</span></div>
              <div><span class="lbl">Plazo</span><span>{loanData.loan.termMonths} meses</span></div>
              <div><span class="lbl">Desembolso</span><span>{fmtDate(loanData.loan.disbursementDate)}</span></div>
              <div><span class="lbl">Primera cuota</span><span>{fmtDate(loanData.loan.firstPaymentDate)}</span></div>
              <div><span class="lbl">Total a pagar</span><span>{fmtMoney(loanData.loan.totalAmount, loanData.loan.currency)}</span></div>
              <div><span class="lbl">Total pagado</span><span>{fmtMoney(loanData.summary.totalPaid, loanData.loan.currency)}</span></div>
              <div><span class="lbl">Cuotas pagadas</span><span>{loanData.summary.paidInstallments} de {loanData.summary.totalInstallments}</span></div>
            </div>
            {#if loanData.loan.bankName}
              <h3 style="margin-top:20px">Cuenta de desembolso</h3>
              <div class="lp-details__grid">
                <div><span class="lbl">Banco</span><span>{loanData.loan.bankName}</span></div>
                <div><span class="lbl">Cuenta</span><span>{loanData.loan.bankAccount}</span></div>
              </div>
            {/if}
          </div>
        </div>

      {:else if activeView === 'schedule'}
        <!-- AMORTIZATION SCHEDULE -->
        <div class="lp-section">
          <h3>📅 Cronograma de pagos</h3>
          {#if loanData.schedule.length === 0}
            <p class="lp-empty">El cronograma de pagos aún no ha sido generado. Contactá a RapiMax para más información.</p>
          {:else}
            <div class="lp-table-wrap">
              <table class="lp-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Capital</th>
                    <th>Interés</th>
                    <th>Cuota</th>
                    <th>Saldo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {#each loanData.schedule as row}
                    <tr class:row--paid={row.status === 'paid'} class:row--overdue={row.status === 'pending' && daysUntil(row.dueDate) < 0}>
                      <td>{row.installmentNumber}</td>
                      <td>{fmtDate(row.dueDate)}</td>
                      <td>{fmtMoney(row.principalPortion, loanData.loan.currency)}</td>
                      <td>{fmtMoney(row.interestPortion, loanData.loan.currency)}</td>
                      <td class="cell--bold">{fmtMoney(row.totalDue, loanData.loan.currency)}</td>
                      <td>{fmtMoney(row.balanceAfter, loanData.loan.currency)}</td>
                      <td>
                        {#if row.status === 'paid'}
                          <span class="badge badge--paid">✅ Pagado</span>
                        {:else if daysUntil(row.dueDate) < 0}
                          <span class="badge badge--overdue">⚠️ Vencido</span>
                        {:else if daysUntil(row.dueDate) <= 7}
                          <span class="badge badge--soon">📅 Próximo</span>
                        {:else}
                          <span class="badge badge--pending">Pendiente</span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>

      {:else if activeView === 'payments'}
        <!-- PAYMENT HISTORY -->
        <div class="lp-section">
          <h3>💳 Historial de pagos</h3>
          {#if loanData.payments.length === 0}
            <p class="lp-empty">Aún no se han registrado pagos.</p>
          {:else}
            <div class="lp-table-wrap">
              <table class="lp-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Método</th>
                    <th>Referencia</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {#each loanData.payments as pmt}
                    <tr>
                      <td>{fmtDate(pmt.createdAt)}</td>
                      <td class="cell--bold">{fmtMoney(pmt.amount, pmt.currency)}</td>
                      <td>{pmt.paymentMethod === 'onvo_card' ? '💳 Tarjeta (ONVO)' : pmt.paymentMethod === 'wire_transfer' ? '🏦 Transferencia' : pmt.paymentMethod === 'sinpe' ? '📱 SINPE' : pmt.paymentMethod}</td>
                      <td>{pmt.referenceNumber || pmt.onvoSessionId || '—'}</td>
                      <td>
                        {#if pmt.status === 'completed'}<span class="badge badge--paid">Completado</span>
                        {:else if pmt.status === 'pending'}<span class="badge badge--soon">Pendiente</span>
                        {:else}<span class="badge badge--pending">{pmt.status}</span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>

      {:else if activeView === 'pay'}
        <!-- PAY -->
        <div class="lp-section">
          <h3>💰 Realizar un pago</h3>

          {#if nextPay}
            <div class="lp-pay-card">
              <div class="lp-pay-card__header">
                <span>Cuota #{nextPay.installmentNumber}</span>
                <span class="lp-pay-card__due">Vence: {fmtDate(nextPay.dueDate)}</span>
              </div>
              <div class="lp-pay-card__amount">{fmtMoney(nextPay.totalDue, loanData.loan.currency)}</div>
              <div class="lp-pay-card__breakdown">
                Capital: {fmtMoney(nextPay.principalPortion, loanData.loan.currency)} · Interés: {fmtMoney(nextPay.interestPortion, loanData.loan.currency)}
              </div>

              {#if payError}<p class="lp-error" style="margin:12px 0">{payError}</p>{/if}

              <button class="lp-btn lp-btn--pay" on:click={() => payWithCard(nextPay)} disabled={payLoading}>
                {#if payLoading}Generando enlace...{:else}💳 Pagar con tarjeta (ONVO Pay){/if}
              </button>
            </div>
          {:else}
            <p class="lp-empty">🎉 ¡Todas tus cuotas están al día! No tenés pagos pendientes.</p>
          {/if}

          <div class="lp-pay-alt">
            <h4>🏦 Pago por transferencia bancaria</h4>
            <p>También podés realizar tu pago por transferencia o SINPE a la siguiente cuenta:</p>
            <div class="lp-pay-bank">
              <div><span class="lbl">Beneficiario</span><span>Rapi Moto Credit S.A.</span></div>
              <div><span class="lbl">Cédula jurídica</span><span>3-101-748267</span></div>
              <div><span class="lbl">Banco</span><span>Banco Nacional de Costa Rica</span></div>
              <div><span class="lbl">Cuenta IBAN</span><span>CR21015108410026000000</span></div>
              <div><span class="lbl">Moneda</span><span>{loanData.loan.currency === 'CRC' ? 'Colones (₡)' : 'Dólares ($)'}</span></div>
              <div><span class="lbl">Referencia</span><span>{loanData.loan.loanNumber}</span></div>
            </div>
            <p class="lp-pay-note">📌 Incluí tu número de préstamo ({loanData.loan.loanNumber}) como referencia en la transferencia. Enviá el comprobante por WhatsApp al <a href="https://wa.me/50671996622" target="_blank">+506 7199-6622</a> para que registremos tu pago.</p>
          </div>
        </div>
      {/if}

      <!-- Contact footer -->
      <div class="lp-contact">
        <p>¿Necesitás ayuda? Contactanos:</p>
        <div class="lp-contact__links">
          <a href="https://wa.me/50671996622" target="_blank">💬 WhatsApp</a>
          <a href="tel:+50671996622">📞 +506 7199-6622</a>
          <a href="mailto:info@rapimax-dev.com">✉️ Email</a>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) { margin:0; font-family:'Montserrat',-apple-system,system-ui,sans-serif; background:#0a1929; color:#e8e4dc; -webkit-font-smoothing:antialiased; }
  .loan-portal { min-height:100vh; }

  /* Header */
  .lp-header { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-bottom:1px solid rgba(213,181,132,.1); }
  .lp-logo__svg { width:140px; color:#d5b584; }
  .lp-header__user { text-align:right; }
  .lp-header__name { display:block; font-weight:600; font-size:.85rem; color:#d5b584; }
  .lp-header__loan { display:block; font-size:.72rem; color:rgba(255,246,226,.35); }

  /* Lookup */
  .lp-lookup { display:flex; align-items:center; justify-content:center; min-height:80vh; padding:24px; }
  .lp-lookup__card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:20px; padding:48px 36px; max-width:420px; width:100%; text-align:center; }
  .lp-lookup__icon { font-size:2.5rem; margin-bottom:16px; }
  .lp-lookup__card h1 { font-size:1.6rem; color:#d5b584; margin:0 0 8px; }
  .lp-lookup__card p { font-size:.85rem; color:rgba(255,246,226,.45); margin:0 0 24px; line-height:1.5; }
  .lp-input { width:100%; padding:14px 18px; border:1px solid rgba(255,255,255,.1); border-radius:12px; background:rgba(255,255,255,.05); color:#fff; font-size:.92rem; outline:none; box-sizing:border-box; }
  .lp-input:focus { border-color:rgba(213,181,132,.4); }
  .lp-input::placeholder { color:rgba(255,255,255,.25); }
  .lp-error { color:#ef4444; font-size:.82rem; margin:10px 0 0; }
  .lp-btn { width:100%; padding:14px; border:none; border-radius:12px; background:linear-gradient(135deg,#d5b584,#c4a06a); color:#0a1929; font-weight:700; font-size:.95rem; cursor:pointer; margin-top:16px; transition:all .2s; }
  .lp-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(213,181,132,.3); }
  .lp-btn:disabled { opacity:.5; cursor:not-allowed; }
  .lp-link { display:block; color:rgba(255,246,226,.35); font-size:.78rem; margin-top:12px; text-decoration:none; }
  .lp-link:hover { color:#d5b584; }

  /* Dashboard */
  .lp-dashboard { max-width:960px; margin:0 auto; padding:24px; }
  .lp-nav { display:flex; gap:4px; background:rgba(255,255,255,.03); border-radius:14px; padding:4px; margin-bottom:24px; }
  .lp-nav button { flex:1; padding:10px 12px; border:none; border-radius:10px; background:none; color:rgba(255,246,226,.45); font-size:.82rem; font-weight:600; cursor:pointer; transition:all .2s; }
  .lp-nav button.active { background:rgba(213,181,132,.15); color:#d5b584; }
  .lp-nav button:hover:not(.active) { color:#fff; }

  .lp-section h3 { font-size:1rem; color:#d5b584; margin:0 0 16px; }
  .lp-empty { color:rgba(255,246,226,.35); font-size:.88rem; text-align:center; padding:40px 20px; }

  /* Alert */
  .lp-alert { background:rgba(213,181,132,.08); border:1px solid rgba(213,181,132,.2); border-radius:16px; padding:20px; margin-bottom:24px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .lp-alert--urgent { border-color:rgba(239,68,68,.4); background:rgba(239,68,68,.08); }
  .lp-alert--warn { border-color:rgba(245,158,11,.3); background:rgba(245,158,11,.06); }
  .lp-alert__main { flex:1; }
  .lp-alert__label { display:block; font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color:rgba(255,246,226,.4); }
  .lp-alert__amount { display:block; font-size:1.6rem; font-weight:700; color:#d5b584; }
  .lp-alert__meta { text-align:right; }
  .lp-alert__meta span { display:block; font-size:.82rem; color:rgba(255,246,226,.5); }
  .lp-alert__days { font-weight:600; }
  .lp-alert__pay { padding:10px 20px; border:none; border-radius:10px; background:linear-gradient(135deg,#d5b584,#c4a06a); color:#0a1929; font-weight:700; font-size:.85rem; cursor:pointer; white-space:nowrap; }

  /* Cards */
  .lp-cards { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:24px; }
  .lp-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:16px; }
  .lp-card__label { display:block; font-size:.7rem; text-transform:uppercase; letter-spacing:.04em; color:rgba(255,246,226,.35); margin-bottom:6px; }
  .lp-card__value { display:block; font-size:1.2rem; font-weight:700; color:#fff; }
  .lp-card__bar { height:6px; background:rgba(255,255,255,.06); border-radius:3px; margin-top:8px; overflow:hidden; }
  .lp-card__fill { height:100%; background:linear-gradient(90deg,#d5b584,#c4a06a); border-radius:3px; transition:width .5s; }

  /* Details */
  .lp-details { background:rgba(255,255,255,.03); border-radius:14px; padding:20px; border:1px solid rgba(255,255,255,.06); }
  .lp-details h3 { font-size:.88rem; color:#d5b584; margin:0 0 12px; }
  .lp-details__grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; }
  .lp-details__grid .lbl { display:block; font-size:.68rem; text-transform:uppercase; letter-spacing:.03em; color:rgba(255,246,226,.35); margin-bottom:2px; }
  .lp-details__grid span:not(.lbl) { font-size:.88rem; font-weight:500; }

  /* Table */
  .lp-table-wrap { overflow-x:auto; border-radius:12px; border:1px solid rgba(255,255,255,.06); }
  .lp-table { width:100%; border-collapse:collapse; font-size:.82rem; }
  .lp-table th { background:rgba(213,181,132,.08); color:#d5b584; font-size:.7rem; text-transform:uppercase; letter-spacing:.04em; padding:10px 12px; text-align:left; }
  .lp-table td { padding:10px 12px; border-top:1px solid rgba(255,255,255,.04); }
  .lp-table .cell--bold { font-weight:600; }
  .lp-table .row--paid { opacity:.5; }
  .lp-table .row--overdue td { background:rgba(239,68,68,.05); }

  /* Badges */
  .badge { display:inline-block; padding:3px 10px; border-radius:6px; font-size:.72rem; font-weight:600; }
  .badge--paid { background:rgba(34,197,94,.12); color:#22c55e; }
  .badge--overdue { background:rgba(239,68,68,.12); color:#ef4444; }
  .badge--soon { background:rgba(245,158,11,.12); color:#f59e0b; }
  .badge--pending { background:rgba(255,255,255,.06); color:rgba(255,246,226,.4); }

  /* Pay */
  .lp-pay-card { background:rgba(213,181,132,.06); border:1px solid rgba(213,181,132,.2); border-radius:16px; padding:24px; text-align:center; margin-bottom:24px; }
  .lp-pay-card__header { display:flex; justify-content:space-between; font-size:.82rem; color:rgba(255,246,226,.5); margin-bottom:8px; }
  .lp-pay-card__due { color:rgba(255,246,226,.35); }
  .lp-pay-card__amount { font-size:2rem; font-weight:700; color:#d5b584; margin:8px 0; }
  .lp-pay-card__breakdown { font-size:.78rem; color:rgba(255,246,226,.35); margin-bottom:20px; }
  .lp-btn--pay { background:linear-gradient(135deg,#0a1929,#1a3a5c); color:#d5b584; font-size:1rem; padding:16px; }
  .lp-btn--pay:hover:not(:disabled) { box-shadow:0 8px 32px rgba(10,25,41,.5); }

  .lp-pay-alt { background:rgba(255,255,255,.03); border-radius:14px; padding:20px; border:1px solid rgba(255,255,255,.06); }
  .lp-pay-alt h4 { color:#d5b584; font-size:.92rem; margin:0 0 8px; }
  .lp-pay-alt p { font-size:.85rem; color:rgba(255,246,226,.55); line-height:1.6; margin:0 0 16px; }
  .lp-pay-bank { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
  .lp-pay-bank .lbl { display:block; font-size:.68rem; text-transform:uppercase; color:rgba(255,246,226,.3); margin-bottom:2px; }
  .lp-pay-bank span:not(.lbl) { font-size:.85rem; }
  .lp-pay-note { font-size:.8rem; color:rgba(255,246,226,.4); background:rgba(213,181,132,.05); padding:12px 16px; border-radius:10px; line-height:1.6; }
  .lp-pay-note a { color:#d5b584; }

  /* Contact */
  .lp-contact { text-align:center; padding:32px 0; margin-top:32px; border-top:1px solid rgba(255,255,255,.06); }
  .lp-contact p { font-size:.82rem; color:rgba(255,246,226,.35); margin:0 0 12px; }
  .lp-contact__links { display:flex; gap:16px; justify-content:center; }
  .lp-contact__links a { color:#d5b584; text-decoration:none; font-size:.82rem; font-weight:500; }
  .lp-contact__links a:hover { text-decoration:underline; }

  @media (max-width:768px) {
    .lp-cards { grid-template-columns:1fr 1fr; }
    .lp-details__grid { grid-template-columns:1fr 1fr; }
    .lp-pay-bank { grid-template-columns:1fr; }
    .lp-alert { flex-direction:column; text-align:center; }
    .lp-alert__meta { text-align:center; }
  }
  @media (max-width:480px) {
    .lp-cards { grid-template-columns:1fr; }
    .lp-nav { flex-wrap:wrap; }
  }
</style>
