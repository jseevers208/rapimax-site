<script>
  const translations = {
    es: {
      title: 'Consultá tu solicitud',
      desc: 'Ingresá tu correo electrónico o número de cédula para ver el estado de tu solicitud de financiamiento.',
      placeholder: 'Correo electrónico o cédula',
      search: 'Buscar mi solicitud',
      searching: 'Buscando...',
      minChars: 'Ingresá tu correo electrónico o número de cédula.',
      hello: '¡Hola,',
      currentStatus: 'Estado actual:',
      viewApp: 'Ver mi solicitud →',
      noApp: '¿No tenés solicitud? Solicitá tu financiamiento',
      goHome: 'Volver al inicio',
      langToggle: 'English',
    },
    en: {
      title: 'Check your application',
      desc: 'Enter your email address or ID number to view the status of your financing application.',
      placeholder: 'Email or ID number',
      search: 'Find my application',
      searching: 'Searching...',
      minChars: 'Enter your email address or ID number.',
      hello: 'Hello,',
      currentStatus: 'Current status:',
      viewApp: 'View my application →',
      noApp: "Don't have an application? Apply for financing",
      goHome: 'Back to home',
      langToggle: 'Español',
    },
  };

  let lang = 'es';
  $: t = translations[lang];

  function toggleLang() { lang = lang === 'es' ? 'en' : 'es'; }

  let query = '';
  let loading = false;
  let error = '';
  let result = null;

  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    result = null;
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      error = t.minChars;
      return;
    }
    loading = true;
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        result = data;
      } else {
        error = data.error || 'No se encontró la solicitud.';
      }
    } catch {
      error = 'Error de conexión. Intentá de nuevo.';
    }
    loading = false;
  }
</script>

<div class="ingresar">
  <header class="ingresar__header">
    <a href="/" class="ingresar__brand">
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 937.11 141.63' class="ingresar__logo-svg"><g><g><path fill='currentColor' d='M336.31,0h35.56C391.39,0,407.28,14.63,407.28,34.15s-13.69,31.63-26.91,34.15l24.39,41.86h-16.68l-22.82-40.44h-13.53v40.44h-15.42V0ZM371.87,55.86c11.96,0,19.98-9.76,19.98-21.72s-8.03-20.3-19.98-20.3h-20.14v42.02h20.14Z'/><path fill='currentColor' d='M416.72,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM482.5,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M553.94,30.21c22.35,0,40.6,18.1,40.6,40.6s-18.25,40.6-40.6,40.6c-10.54,0-19.04-4.41-24.86-11.33v41.54h-15.58v-70.81c0-22.5,18.1-40.6,40.44-40.6ZM579.12,70.81c0-14.32-10.7-25.65-25.18-25.65s-25.18,11.33-25.18,25.65,11.02,25.65,25.18,25.65,25.18-11.33,25.18-25.65Z'/><path fill='currentColor' d='M609.49,11.17c0-5.35,4.09-9.44,9.44-9.44s9.28,4.09,9.28,9.44-4.09,9.44-9.28,9.44-9.44-4.09-9.44-9.44ZM611.22,31.47h15.42v78.68h-15.42V31.47Z'/><path fill='currentColor' d='M756.3,0v110.15h-15.42V34.62l-34.15,75.53h-13.22l-34.15-75.53v75.53h-15.42V0h15.42l40.76,87.97L740.88,0h15.42Z'/><path fill='currentColor' d='M771.25,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM837.03,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M919.49,110.15l-20.3-28.17-20.3,28.17h-17.78l29.27-40.91-26.91-37.77h17.47l18.1,25.18,18.41-25.18h17.47l-26.91,37.77,29.11,40.91h-17.62Z'/></g><g><path fill='currentColor' d='M109.63,111.41h-21.98L27.86,51.57c-2.51-2.51-5.71-2.46-7.86-1.57-2.15.89-4.45,3.11-4.45,6.66v54.74H0v-54.74c0-9.38,5.39-17.44,14.05-21.03,8.67-3.59,18.17-1.7,24.8,4.94l19.41,19.43,31.98-31.95c2.51-2.51,2.46-5.71,1.57-7.86-.89-2.15-3.11-4.45-6.66-4.45H0V.19h85.15c9.38,0,17.44,5.38,21.03,14.05,3.59,8.67,1.69,18.17-4.94,24.8l-31.98,31.95,40.37,40.4Z'/><path fill='currentColor' d='M235.77,111.56h-15.79v-18.36c0-2.24-.87-4.34-2.46-5.93l-21.72-21.71-21.72,21.71c-1.58,1.58-2.46,3.69-2.46,5.93v18.36h-15.79v-12.74c0-7.68,0-14.94,5.79-20.72l23.36-23.35-38.16-38.19c-1.7-1.71-3.57-1.3-4.53-.9-.95.4-2.56,1.43-2.56,3.84v91.81h-15.29V19.5c0-8.02,4.6-14.9,12.01-17.97,7.41-3.06,15.53-1.45,21.2,4.22l38.16,38.19L233.91,5.76c5.67-5.68,13.8-7.3,21.21-4.23,7.41,3.07,12.01,9.95,12.01,17.97l-.04,91.76h-15.3l.05-91.76c0-2.41-1.61-3.44-2.57-3.84-.96-.4-2.82-.81-4.53.9l-38.13,38.19,23.36,23.35c5.79,5.78,5.79,13.04,5.79,20.72v12.74Z'/></g></g></svg>
    </a>
    <button class="ingresar__lang" on:click={toggleLang}>{t.langToggle}</button>
  </header>

  <main class="ingresar__main">
    <div class="ingresar__card">
      <div class="ingresar__icon">🔐</div>
      <h1>{t.title}</h1>
      <p class="ingresar__desc">{t.desc}</p>

      <form on:submit={handleSubmit} class="ingresar__form">
        <input
          type="text"
          placeholder={t.placeholder}
          bind:value={query}
          class="ingresar__input"
          autocomplete="off"
          disabled={loading}
        />
        {#if error}
          <p class="ingresar__error">{error}</p>
        {/if}
        <button type="submit" class="ingresar__btn" disabled={loading}>
          {loading ? t.searching : t.search}
        </button>
      </form>

      {#if result}
        <div class="ingresar__result">
          <div class="ingresar__result-icon">✅</div>
          <p class="ingresar__result-name">{t.hello} {result.name}!</p>
          <p class="ingresar__result-status">{t.currentStatus} <strong>{result.status}</strong></p>
          <a href={result.portalUrl} class="ingresar__result-btn">{t.viewApp}</a>
        </div>
      {/if}

      <div class="ingresar__footer-links">
        <a href="/solicitud">{t.noApp}</a>
        <a href="/">{t.goHome}</a>
      </div>
    </div>
  </main>
</div>

<style>
  :global(body) { margin:0; font-family:'Montserrat',-apple-system,system-ui,sans-serif; background:#0a1929; color:#e8e4dc; -webkit-font-smoothing:antialiased; }

  .ingresar { min-height:100vh; }

  .ingresar__header { padding:16px 24px; display:flex; align-items:center; border-bottom:1px solid rgba(255,255,255,.06); justify-content:space-between; }
  .ingresar__brand { text-decoration:none; color:#d5b584; display:flex; align-items:center; }
  :global(.ingresar__logo-svg) { width:140px; height:auto; }
  .ingresar__lang { background:none; border:1px solid rgba(255,246,226,.15); color:rgba(255,246,226,.5); padding:6px 14px; border-radius:8px; font-size:.78rem; cursor:pointer; transition:all .2s; }
  .ingresar__lang:hover { border-color:rgba(255,246,226,.3); color:#d5b584; }

  .ingresar__main { max-width:480px; margin:0 auto; padding:48px 20px 60px; }

  .ingresar__card { text-align:center; padding:40px 28px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:20px; }
  .ingresar__icon { font-size:2.5rem; margin-bottom:16px; }
  .ingresar__card h1 { font-size:1.4rem; margin:0 0 12px; font-weight:700; }
  .ingresar__desc { font-size:.9rem; color:rgba(255,246,226,.5); margin:0 0 28px; line-height:1.6; }

  .ingresar__form { display:grid; gap:12px; }
  .ingresar__input {
    width:100%; padding:14px 18px; border-radius:12px;
    border:1px solid rgba(255,246,226,.2); background:rgba(255,246,226,.08);
    color:#e8e4dc; font-size:.95rem; box-sizing:border-box;
    transition:border-color .2s;
  }
  .ingresar__input::placeholder { color:rgba(255,246,226,.35); }
  .ingresar__input:focus { outline:none; border-color:#d5b584; background:rgba(255,246,226,.12); }
  .ingresar__input:disabled { opacity:.5; }

  .ingresar__error { font-size:.85rem; color:rgba(255,120,120,.9); text-align:left; margin:0; }

  .ingresar__btn {
    width:100%; padding:14px 24px; border-radius:999px; border:none;
    background:linear-gradient(135deg, #d5b584, #c9a36e); color:#0a1929;
    font-weight:700; font-size:1rem; cursor:pointer;
    transition:transform .2s, box-shadow .2s;
    box-shadow:0 8px 20px rgba(213,181,132,.3);
  }
  .ingresar__btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 28px rgba(213,181,132,.4); }
  .ingresar__btn:disabled { opacity:.6; cursor:not-allowed; }

  .ingresar__result {
    margin-top:24px; padding:24px; border-radius:16px;
    background:rgba(34,197,94,.06); border:1px solid rgba(34,197,94,.2);
  }
  .ingresar__result-icon { font-size:2rem; margin-bottom:8px; }
  .ingresar__result-name { font-size:1.1rem; font-weight:700; margin:0 0 6px; }
  .ingresar__result-status { font-size:.85rem; color:rgba(255,246,226,.5); margin:0 0 16px; }
  .ingresar__result-status strong { color:#d5b584; }
  .ingresar__result-btn {
    display:inline-block; padding:12px 28px; border-radius:12px;
    background:linear-gradient(135deg, #d5b584, #c9a36e); color:#0a1929;
    font-weight:700; text-decoration:none; font-size:.9rem;
    transition:transform .2s;
  }
  .ingresar__result-btn:hover { transform:translateY(-2px); }

  .ingresar__footer-links { margin-top:28px; display:grid; gap:10px; }
  .ingresar__footer-links a { font-size:.82rem; color:rgba(255,246,226,.35); text-decoration:none; transition:color .2s; }
  .ingresar__footer-links a:hover { color:#d5b584; }

  @media (max-width:480px) {
    .ingresar__main { padding:24px 16px 48px; }
    .ingresar__card { padding:28px 20px; }
  }
</style>
