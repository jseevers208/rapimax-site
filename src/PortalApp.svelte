<script>
  // i18n translations
  const translations = {
    es: {
      loading: 'Cargando tu solicitud...',
      invalidLink: 'Enlace inválido',
      invalidLinkDesc: 'Este enlace no contiene un token válido. Si recibiste un enlace por correo o WhatsApp, asegurate de copiar la URL completa.',
      goToSite: 'Ir al sitio de RapiMax',
      notFound: 'Solicitud no encontrada',
      notFoundDesc: 'No encontramos una solicitud asociada a este enlace. Es posible que el enlace haya expirado o sea incorrecto.',
      notFoundHint: 'Si creés que esto es un error, contactanos por WhatsApp.',
      applicant: 'Solicitante',
      id: 'Identificación',
      requestedAmount: 'Monto solicitado',
      term: 'Plazo',
      months: 'meses',
      applicationDate: 'Fecha de solicitud',
      lastUpdate: 'Última actualización',
      progress: 'Progreso de tu solicitud',
      notApproved: 'No aprobada',
      history: 'Historial',
      statusUpdated: 'Estado actualizado',
      questions: '¿Tenés preguntas?',
      questionsDesc: 'Contactanos para información sobre tu solicitud.',
      whatsapp: '💬 WhatsApp',
      call: '📞 Llamar',
      uploadTitle: 'Documentos solicitados',
      uploadDesc: 'Subí los documentos requeridos para continuar con tu solicitud.',
      uploadBtn: 'Seleccionar archivo',
      uploading: 'Subiendo...',
      uploadSuccess: '✅ Documento subido exitosamente',
      uploadedDocs: 'Documentos enviados',
      langToggle: 'English',
    },
    en: {
      loading: 'Loading your application...',
      invalidLink: 'Invalid link',
      invalidLinkDesc: 'This link does not contain a valid token. If you received a link by email or WhatsApp, make sure to copy the full URL.',
      goToSite: 'Go to RapiMax',
      notFound: 'Application not found',
      notFoundDesc: 'We could not find an application associated with this link. The link may have expired or is incorrect.',
      notFoundHint: 'If you think this is an error, contact us via WhatsApp.',
      applicant: 'Applicant',
      id: 'Identification',
      requestedAmount: 'Requested amount',
      term: 'Term',
      months: 'months',
      applicationDate: 'Application date',
      lastUpdate: 'Last updated',
      progress: 'Application progress',
      notApproved: 'Not approved',
      history: 'History',
      statusUpdated: 'Status updated',
      questions: 'Have questions?',
      questionsDesc: 'Contact us for information about your application.',
      whatsapp: '💬 WhatsApp',
      call: '📞 Call',
      uploadTitle: 'Requested documents',
      uploadDesc: 'Upload the required documents to continue with your application.',
      uploadBtn: 'Select file',
      uploading: 'Uploading...',
      uploadSuccess: '✅ Document uploaded successfully',
      uploadedDocs: 'Submitted documents',
      langToggle: 'Español',
    },
  };

  let lang = 'es';
  $: t = translations[lang];

  function toggleLang() { lang = lang === 'es' ? 'en' : 'es'; }

  let token = '';
  let data = null;
  let error = '';
  let loading = true;

  // Document upload state
  let uploading = false;
  let uploadMessage = '';
  let uploadedFiles = [];

  // Get token from URL
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    token = params.get('token') || '';
  }

  async function loadStatus() {
    if (!token) { error = 'no-token'; loading = false; return; }
    try {
      const res = await fetch(`/api/portal?token=${encodeURIComponent(token)}`);
      const result = await res.json();
      if (result.error) { error = result.error; }
      else { data = result; }
    } catch { error = 'Error de conexión.'; }
    loading = false;
    // Load uploaded documents
    if (data && token) loadDocuments();
  }

  async function loadDocuments() {
    try {
      const res = await fetch(`/api/files?action=list&application_id=${data.application?.id || ''}&token=${encodeURIComponent(token)}`);
      // The files endpoint needs admin auth for listing, so we'll use the portal endpoint instead
    } catch {}
  }

  function fmtDate(d) {
    if (!d) return '';
    try {
      const locale = lang === 'en' ? 'en-US' : 'es-CR';
      return new Date(d + (d.includes('Z') ? '' : 'Z')).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return d; }
  }

  function fmtFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMessage = '';
    uploading = true;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/files?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        uploadMessage = 'success';
        uploadedFiles = [...uploadedFiles, { name: file.name, size: file.size, date: new Date().toISOString() }];
      } else {
        uploadMessage = result.error || 'Error al subir.';
      }
    } catch {
      uploadMessage = 'Error de conexión.';
    }
    uploading = false;
    event.target.value = '';
  }

  if (token) loadStatus();
  else { error = 'no-token'; loading = false; }
</script>

<div class="portal">
  <header class="portal__header">
    <a href="/" class="portal__brand">
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 937.11 141.63' class="portal__logo-svg"><g><g><path fill='currentColor' d='M336.31,0h35.56C391.39,0,407.28,14.63,407.28,34.15s-13.69,31.63-26.91,34.15l24.39,41.86h-16.68l-22.82-40.44h-13.53v40.44h-15.42V0ZM371.87,55.86c11.96,0,19.98-9.76,19.98-21.72s-8.03-20.3-19.98-20.3h-20.14v42.02h20.14Z'/><path fill='currentColor' d='M416.72,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM482.5,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M553.94,30.21c22.35,0,40.6,18.1,40.6,40.6s-18.25,40.6-40.6,40.6c-10.54,0-19.04-4.41-24.86-11.33v41.54h-15.58v-70.81c0-22.5,18.1-40.6,40.44-40.6ZM579.12,70.81c0-14.32-10.7-25.65-25.18-25.65s-25.18,11.33-25.18,25.65,11.02,25.65,25.18,25.65,25.18-11.33,25.18-25.65Z'/><path fill='currentColor' d='M609.49,11.17c0-5.35,4.09-9.44,9.44-9.44s9.28,4.09,9.28,9.44-4.09,9.44-9.28,9.44-9.44-4.09-9.44-9.44ZM611.22,31.47h15.42v78.68h-15.42V31.47Z'/><path fill='currentColor' d='M756.3,0v110.15h-15.42V34.62l-34.15,75.53h-13.22l-34.15-75.53v75.53h-15.42V0h15.42l40.76,87.97L740.88,0h15.42Z'/><path fill='currentColor' d='M771.25,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM837.03,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M919.49,110.15l-20.3-28.17-20.3,28.17h-17.78l29.27-40.91-26.91-37.77h17.47l18.1,25.18,18.41-25.18h17.47l-26.91,37.77,29.11,40.91h-17.62Z'/></g><g><path fill='currentColor' d='M109.63,111.41h-21.98L27.86,51.57c-2.51-2.51-5.71-2.46-7.86-1.57-2.15.89-4.45,3.11-4.45,6.66v54.74H0v-54.74c0-9.38,5.39-17.44,14.05-21.03,8.67-3.59,18.17-1.7,24.8,4.94l19.41,19.43,31.98-31.95c2.51-2.51,2.46-5.71,1.57-7.86-.89-2.15-3.11-4.45-6.66-4.45H0V.19h85.15c9.38,0,17.44,5.38,21.03,14.05,3.59,8.67,1.69,18.17-4.94,24.8l-31.98,31.95,40.37,40.4Z'/><path fill='currentColor' d='M235.77,111.56h-15.79v-18.36c0-2.24-.87-4.34-2.46-5.93l-21.72-21.71-21.72,21.71c-1.58,1.58-2.46,3.69-2.46,5.93v18.36h-15.79v-12.74c0-7.68,0-14.94,5.79-20.72l23.36-23.35-38.16-38.19c-1.7-1.71-3.57-1.3-4.53-.9-.95.4-2.56,1.43-2.56,3.84v91.81h-15.29V19.5c0-8.02,4.6-14.9,12.01-17.97,7.41-3.06,15.53-1.45,21.2,4.22l38.16,38.19L233.91,5.76c5.67-5.68,13.8-7.3,21.21-4.23,7.41,3.07,12.01,9.95,12.01,17.97l-.04,91.76h-15.3l.05-91.76c0-2.41-1.61-3.44-2.57-3.84-.96-.4-2.82-.81-4.53.9l-38.13,38.19,23.36,23.35c5.79,5.78,5.79,13.04,5.79,20.72v12.74Z'/></g></g></svg>
    </a>
    <button class="portal__lang" on:click={toggleLang}>{t.langToggle}</button>
  </header>

  <main class="portal__main">
    {#if loading}
      <div class="portal__loading">
        <div class="portal__spinner"></div>
        <p>{t.loading}</p>
      </div>

    {:else if error === 'no-token'}
      <div class="portal__error-card">
        <div class="portal__error-icon">🔗</div>
        <h2>{t.invalidLink}</h2>
        <p>{t.invalidLinkDesc}</p>
        <a href="/" class="portal__cta">{t.goToSite}</a>
      </div>

    {:else if error}
      <div class="portal__error-card">
        <div class="portal__error-icon">❌</div>
        <h2>{t.notFound}</h2>
        <p>{t.notFoundDesc}</p>
        <p style="margin-top:12px; font-size:.85rem; opacity:.6">{t.notFoundHint}</p>
        <a href="/" class="portal__cta">{t.goToSite}</a>
      </div>

    {:else if data}
      <!-- Status Banner -->
      <div class="portal__status-banner" style="border-color:{data.statusInfo.color}">
        <div class="portal__status-dot" style="background:{data.statusInfo.color}"></div>
        <div>
          <h1 class="portal__status-title">{data.statusInfo.title}</h1>
          <p class="portal__status-desc">{data.statusInfo.desc}</p>
        </div>
      </div>

      <!-- Applicant Info -->
      <div class="portal__card">
        <div class="portal__card-row">
          <span class="portal__label">{t.applicant}</span>
          <span class="portal__value">{data.application.name || '—'}</span>
        </div>
        {#if data.application.idPartial}
          <div class="portal__card-row">
            <span class="portal__label">{t.id}</span>
            <span class="portal__value">{data.application.idPartial}</span>
          </div>
        {/if}
        {#if data.application.amount}
          <div class="portal__card-row">
            <span class="portal__label">{t.requestedAmount}</span>
            <span class="portal__value portal__value--highlight">${Number(data.application.amount).toLocaleString()}</span>
          </div>
        {/if}
        {#if data.application.term}
          <div class="portal__card-row">
            <span class="portal__label">{t.term}</span>
            <span class="portal__value">{data.application.term} {t.months}</span>
          </div>
        {/if}
        <div class="portal__card-row">
          <span class="portal__label">{t.applicationDate}</span>
          <span class="portal__value">{fmtDate(data.application.submittedAt)}</span>
        </div>
        <div class="portal__card-row">
          <span class="portal__label">{t.lastUpdate}</span>
          <span class="portal__value">{fmtDate(data.application.updatedAt)}</span>
        </div>
      </div>

      <!-- Pipeline -->
      <div class="portal__card">
        <h3 class="portal__section-title">{t.progress}</h3>
        <div class="portal__pipeline">
          {#each data.pipeline as step, i}
            <div class="portal__step" class:completed={step.completed} class:current={step.current} class:rejected={data.isRejected && step.current}>
              <div class="portal__step-dot" style="background:{step.completed ? step.color : 'rgba(255,255,255,.1)'}">
                {#if step.completed && !step.current}
                  <span class="portal__check">✓</span>
                {:else if step.current}
                  <span class="portal__current-dot" style="background:{step.color}"></span>
                {/if}
              </div>
              <span class="portal__step-label" class:active={step.current}>{step.label}</span>
              {#if i < data.pipeline.length - 1}
                <div class="portal__step-line" style="background:{step.completed ? step.color : 'rgba(255,255,255,.06)'}"></div>
              {/if}
            </div>
          {/each}
        </div>
        {#if data.isRejected}
          <div class="portal__rejected-badge">{t.notApproved}</div>
        {/if}
      </div>

      <!-- Document Upload (shown when status is 'documentos') -->
      {#if data.status === 'documentos'}
        <div class="portal__card portal__card--upload">
          <h3 class="portal__section-title">📄 {t.uploadTitle}</h3>
          <p style="font-size:.85rem; color:rgba(255,246,226,.5); margin:0 0 16px">{t.uploadDesc}</p>
          <label class="portal__upload-btn">
            {#if uploading}
              <div class="portal__spinner portal__spinner--sm"></div> {t.uploading}
            {:else}
              📎 {t.uploadBtn}
            {/if}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" on:change={handleFileUpload} disabled={uploading} style="display:none" />
          </label>
          {#if uploadMessage === 'success'}
            <p class="portal__upload-success">{t.uploadSuccess}</p>
          {:else if uploadMessage}
            <p class="portal__upload-error">{uploadMessage}</p>
          {/if}
          {#if uploadedFiles.length > 0}
            <div class="portal__uploaded-list">
              <h4 class="portal__section-title" style="margin-top:16px">{t.uploadedDocs}</h4>
              {#each uploadedFiles as doc}
                <div class="portal__uploaded-item">
                  <span>📄 {doc.name}</span>
                  <span class="portal__uploaded-size">{fmtFileSize(doc.size)}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Timeline -->
      {#if (data.timeline || []).length > 0}
        <div class="portal__card">
          <h3 class="portal__section-title">{t.history}</h3>
          <div class="portal__timeline">
            {#each data.timeline as event}
              <div class="portal__timeline-item">
                <div class="portal__timeline-dot"></div>
                <div>
                  <span class="portal__timeline-date">{fmtDate(event.date)}</span>
                  <span class="portal__timeline-text">{t.statusUpdated}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Contact -->
      <div class="portal__card portal__card--contact">
        <h3 class="portal__section-title">{t.questions}</h3>
        <p style="font-size:.85rem; color:rgba(255,246,226,.5); margin:0 0 16px">{t.questionsDesc}</p>
        <div class="portal__contact-btns">
          <a href="https://wa.me/50686991253?text=Hola RapiMax, quiero consultar sobre mi solicitud" class="portal__contact-btn portal__contact-btn--wa">{t.whatsapp}</a>
          <a href="tel:+50671996622" class="portal__contact-btn portal__contact-btn--phone">{t.call}</a>
        </div>
      </div>

      <p class="portal__footer">© {new Date().getFullYear()} Rapi Moto Credit S.A. · 3-101-748267</p>
    {/if}
  </main>
</div>

<style>
  :global(body) { margin:0; font-family:'Montserrat',-apple-system,system-ui,sans-serif; background:#0a1929; color:#e8e4dc; -webkit-font-smoothing:antialiased; }

  .portal { min-height:100vh; }

  .portal__header { padding:16px 24px; display:flex; align-items:center; border-bottom:1px solid rgba(255,255,255,.06); justify-content:space-between; }
  .portal__brand { text-decoration:none; color:#d5b584; display:flex; align-items:center; }
  :global(.portal__logo-svg) { width:140px; height:auto; }
  .portal__lang { background:none; border:1px solid rgba(255,246,226,.15); color:rgba(255,246,226,.5); padding:6px 14px; border-radius:8px; font-size:.78rem; cursor:pointer; transition:all .2s; }
  .portal__lang:hover { border-color:rgba(255,246,226,.3); color:#d5b584; }

  .portal__main { max-width:520px; margin:0 auto; padding:24px 20px 60px; }

  .portal__loading { text-align:center; padding:80px 0; color:rgba(255,246,226,.4); }
  .portal__spinner { width:32px; height:32px; border:3px solid rgba(255,255,255,.1); border-top-color:#d5b584; border-radius:50%; animation:spin .8s linear infinite; margin:0 auto 16px; }
  @keyframes spin { to { transform:rotate(360deg); } }

  .portal__error-card { text-align:center; padding:48px 24px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:20px; }
  .portal__error-icon { font-size:2.5rem; margin-bottom:16px; }
  .portal__error-card h2 { font-size:1.2rem; margin:0 0 12px; }
  .portal__error-card p { font-size:.9rem; color:rgba(255,246,226,.5); margin:0; line-height:1.6; }
  .portal__cta { display:inline-block; margin-top:24px; padding:12px 28px; border-radius:12px; background:linear-gradient(135deg, #d5b584, #c9a36e); color:#0a1929; font-weight:700; text-decoration:none; font-size:.9rem; }

  .portal__status-banner { display:flex; align-items:flex-start; gap:16px; padding:24px; background:rgba(255,255,255,.03); border:1px solid; border-radius:20px; margin-bottom:16px; }
  .portal__status-dot { width:14px; height:14px; border-radius:50%; flex-shrink:0; margin-top:4px; }
  .portal__status-title { font-size:1.3rem; font-weight:700; margin:0 0 6px; }
  .portal__status-desc { font-size:.88rem; color:rgba(255,246,226,.6); margin:0; line-height:1.5; }

  .portal__card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:16px; padding:20px; margin-bottom:12px; }
  .portal__card--contact { text-align:center; }
  .portal__section-title { font-size:.82rem; text-transform:uppercase; letter-spacing:.06em; color:rgba(255,246,226,.4); margin:0 0 16px; font-weight:600; }
  .portal__card-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.04); }
  .portal__card-row:last-child { border-bottom:none; }
  .portal__label { font-size:.82rem; color:rgba(255,246,226,.4); }
  .portal__value { font-size:.9rem; font-weight:600; }
  .portal__value--highlight { color:#d5b584; font-size:1.05rem; }

  /* Pipeline */
  .portal__pipeline { display:flex; flex-direction:column; gap:0; }
  .portal__step { display:flex; align-items:center; gap:12px; position:relative; padding:8px 0; }
  .portal__step-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:2px solid rgba(255,255,255,.08); }
  .portal__step.completed .portal__step-dot { border-color:transparent; }
  .portal__check { color:#fff; font-size:.75rem; font-weight:700; }
  .portal__current-dot { width:10px; height:10px; border-radius:50%; animation:pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.8)} }
  .portal__step-label { font-size:.82rem; color:rgba(255,246,226,.35); }
  .portal__step-label.active { color:#fff; font-weight:700; font-size:.88rem; }
  .portal__step-line { position:absolute; left:13px; top:36px; width:2px; height:16px; }
  .portal__rejected-badge { display:inline-block; margin-top:12px; padding:6px 16px; border-radius:8px; background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.3); color:#ef4444; font-size:.82rem; font-weight:700; }

  /* Timeline */
  .portal__timeline { display:flex; flex-direction:column; gap:12px; }
  .portal__timeline-item { display:flex; align-items:center; gap:12px; }
  .portal__timeline-dot { width:8px; height:8px; border-radius:50%; background:#d5b584; flex-shrink:0; }
  .portal__timeline-date { font-size:.78rem; color:rgba(255,246,226,.35); margin-right:8px; }
  .portal__timeline-text { font-size:.82rem; }

  /* Contact */
  .portal__contact-btns { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
  .portal__contact-btn { padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:600; font-size:.85rem; border:1px solid rgba(255,255,255,.12); color:#e8e4dc; transition:all .2s; }
  .portal__contact-btn--wa:hover { background:rgba(37,211,102,.12); border-color:rgba(37,211,102,.3); color:#25d366; }
  .portal__contact-btn--phone:hover { background:rgba(91,143,217,.1); border-color:rgba(91,143,217,.3); color:#5b8fd9; }

  .portal__footer { text-align:center; font-size:.72rem; color:rgba(255,246,226,.2); margin-top:32px; }

  /* Upload */
  .portal__card--upload { border-color:rgba(245,158,11,.2); }
  .portal__upload-btn {
    display:inline-flex; align-items:center; gap:8px; padding:12px 24px; border-radius:12px;
    background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.3); color:#f59e0b;
    font-weight:600; font-size:.85rem; cursor:pointer; transition:all .2s;
  }
  .portal__upload-btn:hover { background:rgba(245,158,11,.18); }
  .portal__spinner--sm { width:16px; height:16px; border:2px solid rgba(255,255,255,.1); border-top-color:#f59e0b; border-radius:50%; animation:spin .8s linear infinite; }
  .portal__upload-success { font-size:.85rem; color:#22c55e; margin:12px 0 0; }
  .portal__upload-error { font-size:.85rem; color:#ef4444; margin:12px 0 0; }
  .portal__uploaded-list { margin-top:8px; }
  .portal__uploaded-item { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.04); font-size:.82rem; }
  .portal__uploaded-item:last-child { border-bottom:none; }
  .portal__uploaded-size { color:rgba(255,246,226,.3); font-size:.75rem; }

  @media (max-width:480px) {
    .portal__main { padding:16px 16px 48px; }
    .portal__status-banner { flex-direction:column; gap:12px; }
    .portal__status-title { font-size:1.1rem; }
  }
</style>
