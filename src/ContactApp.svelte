<script>
  import SiteLayout from './lib/components/SiteLayout.svelte';
  import phoneIcon from './assets/contact/phone.svg';
  import whatsappIcon from './assets/contact/whatsapp-bw.svg';
  import whatsappColorIcon from './assets/contact/whatsapp-color.svg';

  const CONTACT_PHONE_DISPLAY = '+506 7199-6622';
  const CONTACT_PHONE_HREF = 'tel:+50671996622';
  const SERVICE_HOURS_LABEL = 'Lunes a Viernes · 8:00 a. m. - 6:00 p. m.';
  const WHATSAPP_URL = 'https://wa.me/50686991253?text=Hola%20RapiMax%2C%20necesito%20ayuda%20con%20mi%20financiamiento.';

  let contactForm = { name: '', lastName: '', idNumber: '', email: '', cellphone: '', comment: '' };
  let contactSubmitting = false;
  let contactSuccess = false;
  let contactError = '';

  const handleContactSubmit = async () => {
    if (!contactForm.name || !contactForm.comment) return;
    contactSubmitting = true;
    contactError = '';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: `${contactForm.name} ${contactForm.lastName}`.trim(),
          email: contactForm.email || null,
          phone: contactForm.cellphone || null,
          subject: contactForm.idNumber ? `Cédula: ${contactForm.idNumber}` : null,
          message: contactForm.comment,
        }),
      });
      const result = await response.json();
      if (result.success) {
        contactSuccess = true;
      } else {
        contactError = result.error || 'Error al enviar.';
      }
    } catch {
      contactError = 'Error de conexión. Intentá de nuevo.';
    } finally {
      contactSubmitting = false;
    }
  };

  const contactMethods = [
    {
      id: 'whatsapp',
      kind: 'link',
      title: 'WhatsApp',
      description: 'Escribinos para consultas rapidas sobre financiamiento, requisitos o seguimiento.',
      label: 'Abrir WhatsApp',
      href: WHATSAPP_URL,
      searchTerms: 'mensajes asesor ayuda financiamiento chat movil'
    },
    {
      id: 'telefono',
      kind: 'link',
      title: 'Telefono',
      description: 'Llamanos si preferis resolver tu consulta con un asesor por voz.',
      label: CONTACT_PHONE_DISPLAY,
      href: CONTACT_PHONE_HREF,
      searchTerms: 'telefono llamada numero contacto servicio cliente'
    },
    {
      id: 'horario',
      kind: 'info',
      title: 'Horario de atencion',
      description: 'Nuestro equipo de servicio al cliente esta disponible de lunes a viernes.',
      label: SERVICE_HOURS_LABEL,
      searchTerms: 'horario horas abierto lunes viernes servicio cliente disponibilidad'
    }
  ];

  const faqItems = [
    {
      id: 'aprobacion',
      question: 'Cuanto tarda la respuesta de una solicitud?',
      answer: 'Nuestro proceso esta pensado para ser agil. En la mayoria de los casos podras recibir una respuesta inicial en menos de una hora, siempre que la informacion requerida este completa.'
    },
    {
      id: 'documentos',
      question: 'Que documentos necesito para iniciar?',
      answer: 'Depende de tu perfil, pero normalmente vas a necesitar identificacion vigente, licencia de conducir y respaldo de ingresos. Si queres ver el detalle por tipo de solicitante, tambien podes revisar la pagina de requisitos.'
    },
    {
      id: 'seguimiento',
      question: 'Como doy seguimiento a mi tramite?',
      answer: 'Podes escribirnos por WhatsApp o llamarnos para validar el estado de tu gestion. Si ya hablaste con un asesor, te recomendamos tener a mano tu nombre completo y el medio por el que aplicaste.'
    },
    {
      id: 'alianzas',
      question: 'Puedo aplicar desde una agencia aliada y tambien por cuenta propia?',
      answer: 'Si. Trabajamos con agencias aliadas y tambien podemos estructurar financiamiento para un vehiculo que ya encontraste por tu cuenta, siempre que cumpla con la validacion correspondiente.'
    },
    {
      id: 'horarios',
      question: 'Atienden fuera del horario laboral?',
      answer: 'La atencion en vivo esta disponible de lunes a viernes de 8:00 a. m. a 6:00 p. m. Si nos escribis fuera de ese horario, tu mensaje quedara registrado para seguimiento.'
    },
    {
      id: 'sin-respuesta',
      question: 'Ya escribi y todavia no recibo respuesta. Que hago?',
      answer: 'Revisa si tu mensaje incluye tu nombre y el motivo de la consulta. Si escribiste fuera del horario de atencion, nuestro equipo retomara tu caso en la siguiente jornada habil.'
    },
    {
      id: 'llamada',
      question: 'Que hago si no logro comunicarme por telefono?',
      answer: 'Intenta de nuevo dentro del horario de atencion o dejanos un mensaje por WhatsApp para que un asesor pueda devolverte el contacto con mas contexto.'
    },
    {
      id: 'documentacion-ayuda',
      question: 'Que hago si no se que documento me falta?',
      answer: 'Consultanos por WhatsApp indicando si sos asalariado, independiente o persona juridica. Asi podremos decirte exactamente que respaldo necesitas completar.'
    },
    {
      id: 'cotizacion-ayuda',
      question: 'Me pueden ayudar a entender una cotizacion?',
      answer: 'Compartinos el monto, plazo o cuota que queres revisar y te ayudamos a interpretar la propuesta antes de continuar con tu solicitud.'
    }
  ];

  const docItems = [
    {
      id: 'canales',
      topic: 'Guia de canales de contacto',
      info: 'Usa el formulario para dejarnos tu consulta, WhatsApp para mensajes rapidos y telefono para conversaciones directas con un asesor.'
    },
    {
      id: 'preparacion',
      topic: 'Como preparar tu consulta',
      info: 'Para recibir ayuda mas rapida, comparti tu nombre, tipo de financiamiento, si ya aplicaste y cualquier dato de seguimiento que te haya dado un asesor.'
    },
    {
      id: 'escalamiento',
      topic: 'Cuando conviene escalar por telefono',
      info: 'Si tu caso requiere confirmar documentos, revisar tiempos de respuesta o aclarar una propuesta recibida, la llamada telefonica suele ser el canal mas directo.'
    }
  ];

  const normalizeText = (value = '') =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const buildSearchText = (parts) => normalizeText(parts.filter(Boolean).join(' '));

  const contactIndex = contactMethods.map((item) => ({
    ...item,
    searchText: buildSearchText([item.title, item.description, item.label, item.searchTerms])
  }));

  const faqIndex = faqItems.map((item) => ({
    ...item,
    searchText: buildSearchText([item.question, item.answer])
  }));

  const docIndex = docItems.map((item) => ({
    ...item,
    kind: 'doc',
    question: item.topic,
    answer: item.info,
    searchText: buildSearchText([item.topic, item.info])
  }));

  let query = '';
  let openFaqIds = [];

  $: normalizedQuery = normalizeText(query);
  $: searchActive = normalizedQuery.length > 0;
  $: filteredContacts = searchActive
    ? contactIndex.filter((item) => item.searchText.includes(normalizedQuery))
    : contactIndex;
  $: filteredFaq = searchActive
    ? faqIndex.filter((item) => item.searchText.includes(normalizedQuery))
    : faqIndex;
  $: filteredDocs = searchActive
    ? docIndex.filter((item) => item.searchText.includes(normalizedQuery))
    : [];
  $: visibleFaqItems = searchActive ? [...filteredFaq, ...filteredDocs] : filteredFaq;
  $: totalResults = filteredContacts.length + visibleFaqItems.length;
  $: hasResults = totalResults > 0;

  function toggleOpen(id) {
    if (searchActive) return;

    openFaqIds = openFaqIds.includes(id)
      ? openFaqIds.filter((itemId) => itemId !== id)
      : [...openFaqIds, id];
  }

  function isOpen(id) {
    if (searchActive) return true;
    return openFaqIds.includes(id);
  }

  function clearSearch() {
    query = '';
  }

</script>

<SiteLayout page="contact" footerSpacing="compact">
  <section class="contact-page section">
    <div class="container contact-page__shell">
      <header class="contact-hero">
        <div class="contact-hero__copy">
          <h1>Escribinos</h1>
          <p>Complet&aacute; el formulario y un asesor podr&aacute; revisar tu consulta.</p>
        </div>

        <form class="contact-form" aria-label="Formulario de contacto" on:submit|preventDefault={handleContactSubmit}>
          {#if contactSuccess}
            <div class="contact-form__success">
              <p>¡Mensaje enviado! Un asesor te contactará pronto.</p>
            </div>
          {:else}
          <div class="contact-form__grid">
            <label class="contact-form__field">
              <span>Nombre</span>
              <input type="text" name="name" autocomplete="given-name" bind:value={contactForm.name} required />
            </label>

            <label class="contact-form__field">
              <span>Apellido</span>
              <input type="text" name="last-name" autocomplete="family-name" bind:value={contactForm.lastName} />
            </label>

            <label class="contact-form__field">
              <span>N&uacute;mero de c&eacute;dula</span>
              <input type="text" name="id-number" autocomplete="off" bind:value={contactForm.idNumber} />
            </label>

            <label class="contact-form__field">
              <span>Correo electr&oacute;nico</span>
              <input type="email" name="email" autocomplete="email" bind:value={contactForm.email} />
            </label>

            <label class="contact-form__field">
              <span>N&uacute;mero de celular</span>
              <input type="tel" name="cellphone" autocomplete="tel" bind:value={contactForm.cellphone} />
            </label>

            <label class="contact-form__field contact-form__field--full">
              <span>Comentario</span>
              <textarea name="comment" rows="4" bind:value={contactForm.comment} required></textarea>
            </label>
          </div>

          {#if contactError}
            <p class="contact-form__error" style="color:#c44; margin-bottom:12px; font-size:0.85rem;">{contactError}</p>
          {/if}
          <button type="submit" class="contact-form__submit" disabled={contactSubmitting}>
            {contactSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
          {/if}
        </form>
      </header>

      <section class="contact-methods-heading" aria-labelledby="contact-methods-title">
        <h2 id="contact-methods-title">Canales de contacto<br />para resolver tu consulta</h2>
      </section>

      {#if !searchActive || filteredContacts.length > 0}
        <section class="contact-panel" aria-label="Canales de contacto">
          <div class="contact-grid">
            {#each filteredContacts as method}
              <article class={`contact-card contact-card--${method.kind}`}>
                <div class="contact-card__topline">
                  <span class="contact-card__icon" aria-hidden="true">
                    {#if method.id === 'whatsapp'}
                      <img src={whatsappIcon} alt="" />
                    {:else if method.id === 'telefono'}
                      <img src={phoneIcon} alt="" />
                    {:else}
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.8" />
                        <path d="M12 8v4.2l2.7 1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    {/if}
                  </span>
                </div>

                <div class="contact-card__body">
                  <h3>{method.title}</h3>
                  <p>{method.description}</p>
                </div>

                <div class="contact-card__footer">
                  {#if method.kind === 'link'}
                    <a
                      class="contact-card__action"
                      href={method.href}
                      target={method.id === 'whatsapp' ? '_blank' : undefined}
                      rel={method.id === 'whatsapp' ? 'noreferrer' : undefined}
                    >
                      {method.label}
                    </a>
                  {:else}
                    <div class="contact-card__info">{method.label}</div>
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        </section>
      {/if}

      {#if visibleFaqItems.length > 0 || searchActive}
        <section class="faq-heading" aria-labelledby="faq-title">
          <h2 id="faq-title">Preguntas frecuentes</h2>
        </section>

        <section class="support-section" aria-label="Preguntas frecuentes">
          <div class="search-shell search-shell--embedded">
            <label class="search-field">
              <span class="search-field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.9" />
                  <path d="M16 16L20 20" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
                </svg>
              </span>
              <input
                bind:value={query}
                type="search"
                inputmode="search"
                placeholder="Busc&aacute; para encontrar respuestas r&aacute;pidamente."
                aria-label="Buscar ayuda en esta página"
              />
            </label>

            {#if searchActive}
              <button type="button" class="search-clear" on:click={clearSearch}>
                Limpiar
              </button>
            {/if}
          </div>

            {#if searchActive && !hasResults}
              <div class="empty-state empty-state--embedded" aria-live="polite">
                <div class="empty-state__card">
                  <span class="eyebrow">Sin resultados</span>
                  <h2>No encontramos resultados para tu b&uacute;squeda</h2>
                  <p>
                    Intent&aacute; con otro t&eacute;rmino como <strong>WhatsApp</strong>, <strong>documentos</strong>,
                    <strong>seguimiento</strong> o <strong>horario</strong>.
                  </p>
                </div>
              </div>
            {:else}
              <div class="support-list">
              {#each visibleFaqItems as item}
                <article
                  class="support-item"
                  class:is-open={isOpen(item.id)}
                >
                  <button
                    type="button"
                    class="support-item__trigger"
                    aria-expanded={isOpen(item.id)}
                    aria-controls={`faq-panel-${item.id}`}
                    on:click={() => toggleOpen(item.id)}
                  >
                    <span>
                      <strong class="support-item__title">{item.question}</strong>
                    </span>
                    <span class="support-item__plus" aria-hidden="true"></span>
                  </button>

                  <div
                    id={`faq-panel-${item.id}`}
                    class="support-item__panel"
                    aria-hidden={!isOpen(item.id) && !searchActive}
                  >
                    <p>{item.answer}</p>
                  </div>
                </article>
              {/each}
              </div>
            {/if}
          </section>
      {/if}
    </div>
  </section>

  <a
    class="contact-whatsapp-float"
    href={WHATSAPP_URL}
    target="_blank"
    rel="noreferrer"
    aria-label="Abrir chat de WhatsApp"
  >
    <img src={whatsappColorIcon} alt="" />
  </a>
</SiteLayout>

<style>
  .contact-page {
    padding-top: calc(var(--hero-safe-top, 88px) + clamp(24px, 5vw, 56px));
    padding-bottom: clamp(56px, 9vw, 96px);
    background: var(--c-crema);
  }

  .contact-page__shell {
    display: grid;
    gap: clamp(24px, 3vw, 36px);
  }

  .contact-whatsapp-float {
    position: fixed;
    right: clamp(16px, 2.5vw, 28px);
    bottom: clamp(16px, 2.5vw, 28px);
    z-index: 40;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 62px;
    height: 62px;
    border-radius: 999px;
    background: #ffffff;
    box-shadow: 0 18px 32px rgba(1, 13, 40, 0.18);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .contact-whatsapp-float:hover,
  .contact-whatsapp-float:focus-visible {
    transform: translateY(-2px);
    box-shadow: 0 22px 38px rgba(1, 13, 40, 0.22);
  }

  .contact-whatsapp-float:focus-visible {
    outline: none;
  }

  .contact-whatsapp-float img {
    width: 34px;
    height: 34px;
    object-fit: contain;
  }

  .contact-hero,
  .contact-panel,
  .search-panel,
  .support-section,
  .empty-state__card {
    border-radius: clamp(28px, 3vw, 38px);
    background: var(--c-warm-gray);
    border: 1px solid rgba(18, 41, 65, 0.12);
    box-shadow: 0 20px 36px rgba(5, 15, 34, 0.08);
  }

  .contact-hero {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(320px, 1.15fr);
    gap: clamp(20px, 3vw, 34px);
    align-items: center;
    padding: clamp(26px, 4vw, 40px);
  }

  .contact-hero__copy {
    display: grid;
    align-content: center;
    gap: 14px;
  }

  .contact-methods-heading {
    padding: clamp(72px, 9vw, 108px) 0;
    text-align: center;
  }

  .faq-heading {
    padding: clamp(72px, 9vw, 108px) 0;
    text-align: center;
  }

  .contact-methods-heading h2,
  .faq-heading h2 {
    margin: 0 auto;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(2rem, 2vw + 1.25rem, 3.2rem);
    line-height: 0.98;
    letter-spacing: -0.04em;
  }

  .contact-methods-heading h2 {
    width: min(24ch, 100%);
  }

  .faq-heading h2 {
    width: min(11ch, 100%);
  }

  .contact-hero__copy h1,
  .empty-state__card h2,
  .contact-card__body h3 {
    margin: 0;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    letter-spacing: -0.04em;
  }

  .contact-hero__copy h1 {
    max-width: 8ch;
    font-size: clamp(2.5rem, 3.2vw + 1rem, 4.3rem);
    line-height: 0.95;
  }

  .contact-hero__copy p,
  .contact-panel__header p,
  .search-panel__copy p,
  .support-section__header p,
  .empty-state__card p,
  .contact-card__body p,
  .support-item__panel p,
  .search-meta {
    margin: 0;
    color: var(--c-ink-soft);
    line-height: 1.6;
  }

  .contact-hero__copy p {
    max-width: 34ch;
    font-size: clamp(1rem, 0.24vw + 0.98rem, 1.08rem);
  }

  .contact-form {
    display: grid;
    gap: 18px;
    padding: clamp(22px, 2.8vw, 28px);
    border-radius: clamp(22px, 2vw, 30px);
    background: var(--c-navy);
    color: #fff6e2;
    box-shadow: 0 18px 30px rgba(1, 13, 40, 0.2);
  }

  .contact-form__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .contact-form__field {
    display: grid;
    gap: 8px;
  }

  .contact-form__field--full {
    grid-column: 1 / -1;
  }

  .contact-form__field span {
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 246, 226, 0.78);
  }

  .contact-form__field input,
  .contact-form__field textarea {
    width: 100%;
    border: 1px solid rgba(255, 246, 226, 0.18);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.08);
    color: #fff6e2;
    padding: 10px 14px;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast);
  }

  .contact-form__field input {
    min-height: 42px;
  }

  .contact-form__field textarea {
    min-height: 96px;
    resize: vertical;
  }

  .contact-form__field input::placeholder,
  .contact-form__field textarea::placeholder {
    color: rgba(255, 246, 226, 0.5);
  }

  .contact-form__field input:focus-visible,
  .contact-form__field textarea:focus-visible {
    outline: none;
    border-color: rgba(213, 181, 132, 0.9);
    box-shadow: 0 0 0 4px rgba(213, 181, 132, 0.14);
    background: rgba(255, 255, 255, 0.12);
  }

  .contact-form__submit {
    justify-self: start;
    min-height: 50px;
    padding: 0 24px;
    border: 1px solid rgba(255, 246, 226, 0.16);
    border-radius: 999px;
    background: #fff6e2;
    color: var(--c-navy);
    font-weight: 700;
    cursor: pointer;
    transition:
      transform var(--transition-fast),
      box-shadow var(--transition-fast),
      background-color var(--transition-fast);
  }

  .contact-form__submit:hover,
  .contact-form__submit:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(1, 13, 40, 0.2);
  }

  .contact-panel,
  .support-section,
  .empty-state__card {
    padding: clamp(22px, 3vw, 34px);
  }

  .support-section__header {
    display: grid;
    gap: 8px;
    margin-bottom: 22px;
  }

  .empty-state__card h2 {
    font-size: clamp(1.9rem, 1.4vw + 1.2rem, 3rem);
    line-height: 0.98;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(14px, 1.6vw, 18px);
  }

  .contact-card {
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 18px;
    min-height: 270px;
    padding: clamp(18px, 2vw, 24px);
    border-radius: clamp(22px, 2vw, 30px);
    background: #ffffff;
    border: 1px solid rgba(18, 41, 65, 0.08);
    box-shadow: 0 16px 28px rgba(1, 13, 40, 0.08);
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease;
  }

  .contact-card:hover,
  .contact-card:focus-within {
    transform: translateY(-2px);
    border-color: rgba(213, 181, 132, 0.64);
    box-shadow: 0 20px 34px rgba(1, 13, 40, 0.12);
  }

  .contact-card--info {
    background: var(--c-navy);
    border-color: rgba(213, 181, 132, 0.24);
    box-shadow: 0 18px 32px rgba(1, 13, 40, 0.18);
  }

  .contact-card--info .contact-card__body h3,
  .contact-card--info .contact-card__body p,
  .contact-card--info .contact-card__info,
  .contact-card--info .contact-card__icon {
    color: #fff6e2;
  }

  .contact-card__topline {
    display: flex;
    justify-content: flex-end;
  }

  .contact-card__icon {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(213, 181, 132, 0.18);
    color: var(--c-navy);
    flex-shrink: 0;
  }

  .contact-card__icon svg {
    width: 22px;
    height: 22px;
  }

  .contact-card__icon img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }

  .contact-card__body {
    display: grid;
    align-content: start;
    gap: 10px;
  }

  .contact-card__body h3 {
    font-size: clamp(1.35rem, 0.9vw + 1rem, 1.9rem);
    line-height: 1.04;
  }

  .contact-card__footer {
    display: flex;
    align-content: end;
  }

  .contact-card__action,
  .contact-card__info,
  .search-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 18px;
    border-radius: 999px;
    font-weight: 700;
    text-align: center;
  }

  .contact-card__action {
    border: 1px solid rgba(18, 41, 65, 0.14);
    background: var(--c-navy);
    color: #fff6e2;
    transition:
      transform var(--transition-fast),
      box-shadow var(--transition-fast),
      background-color var(--transition-fast),
      border-color var(--transition-fast);
  }

  .contact-card__action:hover,
  .contact-card__action:focus-visible,
  .search-clear:hover,
  .search-clear:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(1, 13, 40, 0.14);
  }

  .contact-card__action:focus-visible,
  .search-clear:focus-visible,
  .search-field input:focus-visible,
  .support-item__trigger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(213, 181, 132, 0.2);
  }

  .contact-card__info {
    justify-content: flex-start;
    padding-inline: 0;
    min-height: auto;
    color: #fff6e2;
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(1.2rem, 0.7vw + 1rem, 1.6rem);
    letter-spacing: -0.02em;
  }

  .search-shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .search-shell--embedded {
    margin-bottom: 22px;
  }

  .search-field {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-field__icon {
    position: absolute;
    left: 18px;
    width: 20px;
    height: 20px;
    color: rgba(18, 41, 65, 0.56);
    pointer-events: none;
  }

  .search-field__icon svg {
    width: 100%;
    height: 100%;
  }

  .search-field input {
    width: 100%;
    min-height: 62px;
    padding: 0 20px 0 54px;
    border-radius: 999px;
    border: 1px solid rgba(18, 41, 65, 0.14);
    background: #ffffff;
    color: var(--c-navy);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .search-field input::placeholder {
    color: rgba(18, 41, 65, 0.48);
  }

  .search-clear {
    border: 1px solid rgba(18, 41, 65, 0.18);
    background: transparent;
    color: var(--c-navy);
    cursor: pointer;
  }

  .support-list {
    display: grid;
    gap: 14px;
  }

  .support-item {
    border-radius: clamp(20px, 2vw, 28px);
    border: 1px solid rgba(18, 41, 65, 0.08);
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 12px 20px rgba(1, 13, 40, 0.05);
    transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  }

  .support-item.is-open,
  .support-item:hover,
  .support-item:focus-within {
    border-color: rgba(213, 181, 132, 0.6);
    box-shadow: 0 16px 28px rgba(1, 13, 40, 0.08);
    transform: translateY(-1px);
  }

  .support-item.is-open {
    background: var(--c-navy);
    border-color: rgba(213, 181, 132, 0.4);
    box-shadow: 0 18px 32px rgba(1, 13, 40, 0.18);
  }

  .support-item__trigger {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    padding: 22px 24px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    appearance: none;
  }

  .support-item__title {
    display: block;
    margin: 0;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(1.25rem, 0.7vw + 1rem, 1.7rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .support-item__plus {
    width: 36px;
    height: 36px;
    position: relative;
    border-radius: 999px;
    background: rgba(213, 181, 132, 0.18);
    flex-shrink: 0;
  }

  .support-item__plus::before,
  .support-item__plus::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 14px;
    height: 1.8px;
    background: var(--c-navy);
    border-radius: 999px;
    transform: translate(-50%, -50%);
    transition: transform 180ms ease, opacity 180ms ease;
  }

  .support-item.is-open .support-item__title,
  .support-item.is-open .support-item__panel p {
    color: #fff6e2;
  }

  .support-item.is-open .support-item__plus {
    background: var(--c-navy-deep);
  }

  .support-item.is-open .support-item__plus::before,
  .support-item.is-open .support-item__plus::after {
    background: #fff6e2;
  }

  .support-item__plus::after {
    transform: translate(-50%, -50%) rotate(90deg);
  }

  .support-item.is-open .support-item__plus::after {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(90deg) scaleX(0.3);
  }

  .support-item__panel {
    max-height: 0;
    padding: 0 24px;
    opacity: 0;
    overflow: hidden;
    transition: max-height 220ms ease, padding 220ms ease, opacity 180ms ease;
  }

  .support-item.is-open .support-item__panel,
  .support-item:hover .support-item__panel,
  .support-item:focus-within .support-item__panel {
    max-height: 220px;
    padding: 0 24px 24px;
    opacity: 1;
  }

  .empty-state__card {
    display: grid;
    gap: 14px;
    justify-items: start;
  }

  .empty-state--embedded {
    display: block;
  }

  @media (max-width: 1080px) {
    .contact-form__grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .contact-form__field--full {
      grid-column: auto;
    }

    .contact-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 860px) {
    .contact-hero {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 720px) {
    .contact-page {
      padding-bottom: clamp(48px, 12vw, 72px);
    }

    .contact-hero__copy h1 {
      max-width: 12ch;
      font-size: clamp(2.4rem, 11vw, 4rem);
    }

    .contact-panel,
    .support-section,
    .empty-state__card,
    .contact-hero,
    .contact-form {
      padding: 18px 14px;
    }

    .contact-methods-heading {
      padding: clamp(48px, 12vw, 72px) 0;
    }

    .faq-heading {
      padding: clamp(48px, 12vw, 72px) 0;
    }

    .contact-methods-heading h2 {
      font-size: clamp(1.55rem, 7vw, 2.35rem);
    }

    .contact-grid,
    .search-shell {
      grid-template-columns: minmax(0, 1fr);
    }

    .contact-form__submit {
      width: 100%;
      justify-self: stretch;
    }

    .contact-whatsapp-float {
      width: 56px;
      height: 56px;
    }

    .contact-whatsapp-float img {
      width: 30px;
      height: 30px;
    }

    .search-clear {
      width: 100%;
    }

    .support-item__trigger,
    .support-item__panel {
      padding-left: 18px;
      padding-right: 18px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .contact-card,
    .contact-card__action,
    .search-clear,
    .support-item,
    .support-item__plus::after {
      transition: none;
    }

    .contact-card:hover,
    .support-item:hover,
    .support-item:focus-within,
    .contact-card:focus-within {
      transform: none;
    }
  }
</style>
