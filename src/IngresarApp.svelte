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
      <span class="ingresar__logo">RM</span> RapiMax
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
  .ingresar__brand { text-decoration:none; color:#d5b584; font-size:1.1rem; font-weight:700; display:flex; align-items:center; gap:8px; }
  .ingresar__logo { font-family:'Nordique Pro',sans-serif; font-size:.85rem; border:1.5px solid #d5b584; border-radius:6px; padding:2px 6px; font-weight:700; }
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
