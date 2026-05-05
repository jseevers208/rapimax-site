<script>
  import { onMount, tick } from 'svelte';
  import SiteLayout from './lib/components/SiteLayout.svelte';

  const requirementProfiles = [
    {
      id: 'asalariados',
      title: 'Asalariados',
      description: 'Documentos y condiciones para personas que trabajan bajo relación laboral.',
      items: [
        'Cédula vigente y en buen estado',
        'Licencia de conducir vigente',
        'Constancia salarial',
        'Última orden patronal',
        'Ser mayor de 21 años',
        'Mínimo 6 meses de continuidad laboral'
      ]
    },
    {
      id: 'independientes',
      title: 'Independientes',
      description: 'Requisitos para solicitantes con actividad económica propia o ingresos independientes.',
      items: [
        'Cédula vigente y en buen estado',
        'Licencia de conducir vigente',
        'Certificación de ingresos emitida por contador público (CPA)',
        'Estados de cuenta personales de los últimos 6 meses',
        'Ser mayor de 21 años'
      ]
    },
    {
      id: 'personas-juridicas',
      title: 'Personas jurídicas',
      description: 'Información requerida para empresas que buscan financiar un vehículo.',
      items: [
        'Personería jurídica con detalle accionario',
        'Cédula del representante legal',
        'Licencia de conducir vigente',
        'Estados financieros recientes (2 periodos y 1 corte)',
        'Copia última declaración de renta'
      ]
    }
  ];

  const profileIds = new Set(requirementProfiles.map((profile) => profile.id));
  let activeProfileId = '';

  const waitForNextFrame = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });

  const getProfileIdFromHash = (hash = window.location.hash) => {
    const normalizedHash = hash.replace(/^#/, '');
    return profileIds.has(normalizedHash) ? normalizedHash : '';
  };

  const setHashForProfile = (profileId) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);

    if (profileId) {
      url.hash = profileId;
    } else {
      url.hash = '';
    }

    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const scrollToHashTarget = async (hash = window.location.hash) => {
    if (!hash) return;

    await tick();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }

      await waitForNextFrame();
    }
  };

  const toggleProfile = (profileId) => {
    const nextProfileId = activeProfileId === profileId ? '' : profileId;
    activeProfileId = nextProfileId;
    setHashForProfile(nextProfileId);

    if (nextProfileId) {
      void scrollToHashTarget(`#${nextProfileId}`);
    }
  };

  onMount(() => {
    const handleHashChange = () => {
      activeProfileId = getProfileIdFromHash();
      if (activeProfileId) {
        void scrollToHashTarget(`#${activeProfileId}`);
      }
    };

    activeProfileId = getProfileIdFromHash();

    if (activeProfileId) {
      void scrollToHashTarget(`#${activeProfileId}`);
    }

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });
</script>

<SiteLayout page="requirements" footerSpacing="compact">
  <section class="requirements-page section">
    <div class="container requirements-page__shell">
      <header class="requirements-page__intro">
        <div class="requirements-page__headline">
          <h1>Conocé los requisitos según tu perfil</h1>
        </div>
      </header>

      <div class="requirements-page__list" aria-label="Tipos de requisitos">
        {#each requirementProfiles as profile}
          <article
            id={profile.id}
            class="requirements-profile"
            class:requirements-profile--active={activeProfileId === profile.id}
            aria-labelledby={`${profile.id}-title`}
          >
            <div class="requirements-profile__intro">
              <h2 id={`${profile.id}-title`}>{profile.title}</h2>
              <p class="requirements-profile__description">{profile.description}</p>
            </div>

            <button
              type="button"
              class="requirements-profile__trigger"
              aria-expanded={activeProfileId === profile.id}
              aria-controls={`${profile.id}-panel`}
              aria-labelledby={`${profile.id}-title`}
              on:click={() => toggleProfile(profile.id)}
            >
              <span class="requirements-profile__toggle" aria-hidden="true"></span>
            </button>

            {#if activeProfileId === profile.id}
              <div
                id={`${profile.id}-panel`}
                class="requirements-profile__panel"
                role="region"
                aria-labelledby={`${profile.id}-title`}
              >
                <ul class="requirements-profile__items">
                  {#each profile.items as item}
                    <li>{item}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </article>
        {/each}
      </div>

      <section class="requirements-cta" aria-labelledby="requirements-cta-title">
        <div class="requirements-cta__panel">
          <p class="requirements-cta__label" id="requirements-cta-title">Siguiente paso</p>
          <button
            type="button"
            class="btn primary requirements-cta__button"
            disabled
            aria-disabled="true"
            title="Próximamente"
          >
            Aplicá en minutos y obtené respuesta en menos de 1 hora.
          </button>
        </div>
      </section>
    </div>
  </section>
</SiteLayout>

<style>
  .requirements-page {
    padding-top: calc(var(--hero-safe-top, 88px) + clamp(24px, 5vw, 56px));
    padding-bottom: clamp(56px, 9vw, 88px);
    background: var(--c-crema);
  }

  .requirements-page__shell {
    display: grid;
    gap: clamp(28px, 4vw, 42px);
  }

  .requirements-page__intro {
    display: grid;
    gap: 8px;
    width: min(840px, 100%);
    margin: 0 auto;
    text-align: center;
  }

  .requirements-page__headline {
    display: block;
  }

  .requirements-page__headline h1 {
    margin: 0;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(2.6rem, 4vw + 1rem, 5rem);
    line-height: 0.94;
    letter-spacing: -0.04em;
  }

  .requirements-page__list {
    display: grid;
    gap: clamp(18px, 2.8vw, 26px);
  }

  .requirements-profile {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: clamp(18px, 2.8vw, 24px);
    align-items: start;
    padding: clamp(24px, 3vw, 36px);
    border-radius: clamp(28px, 3vw, 36px);
    border: 1px solid rgba(18, 41, 65, 0.12);
    box-shadow: 0 18px 30px rgba(5, 15, 34, 0.08);
    background: var(--c-warm-gray);
    scroll-margin-top: calc(var(--hero-safe-top, 88px) + 24px);
  }

  .requirements-profile--active {
    grid-template-columns: minmax(240px, 320px) minmax(0, 1fr) auto;
    background: var(--c-navy);
    border-color: rgba(213, 181, 132, 0.36);
  }

  .requirements-profile__intro {
    display: grid;
    grid-column: 1;
    gap: 12px;
  }

  .requirements-profile__trigger {
    display: inline-flex;
    grid-column: -1;
    align-items: center;
    justify-content: center;
    align-self: start;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: inherit;
  }

  .requirements-profile h2 {
    margin: 0;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(2rem, 2vw + 1rem, 3.1rem);
    line-height: 0.98;
    letter-spacing: -0.04em;
  }

  .requirements-profile__description {
    margin: 0;
    color: var(--c-ink-soft);
    max-width: 28ch;
  }

  .requirements-profile--active h2,
  .requirements-profile--active .requirements-profile__description {
    color: #fff6e2;
  }

  .requirements-profile__toggle {
    position: relative;
    flex: 0 0 auto;
    width: 52px;
    height: 52px;
    border-radius: 999px;
    border: 1px solid rgba(18, 41, 65, 0.14);
    background: rgba(255, 255, 255, 0.68);
    transition:
      background-color var(--transition-fast),
      border-color var(--transition-fast),
      transform var(--transition-fast);
  }

  .requirements-profile__toggle::before,
  .requirements-profile__toggle::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 18px;
    height: 2px;
    border-radius: 999px;
    background: var(--c-navy);
    transform: translate(-50%, -50%);
    transition:
      transform var(--transition-fast),
      opacity var(--transition-fast),
      background-color var(--transition-fast);
  }

  .requirements-profile__toggle::after {
    transform: translate(-50%, -50%) rotate(90deg);
  }

  .requirements-profile--active .requirements-profile__toggle {
    border-color: rgba(255, 246, 226, 0.2);
    background: rgba(255, 246, 226, 0.12);
  }

  .requirements-profile--active .requirements-profile__toggle::before,
  .requirements-profile--active .requirements-profile__toggle::after {
    background: #fff6e2;
  }

  .requirements-profile--active .requirements-profile__toggle::after {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(90deg) scaleX(0.2);
  }

  .requirements-profile__panel {
    display: grid;
    grid-row: 1;
    grid-column: 2;
    align-self: start;
  }

  .requirements-profile__items {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .requirements-profile__items li {
    position: relative;
    display: flex;
    align-items: flex-start;
    min-height: 100%;
    padding: 16px 18px 16px 56px;
    border-radius: 22px;
    border: 1px solid rgba(18, 41, 65, 0.08);
    background: #ffffff;
    color: var(--c-navy);
    font-weight: 600;
    line-height: 1.5;
  }

  .requirements-profile__items li::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 18px;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    border: 1px solid rgba(213, 181, 132, 0.7);
    background:
      radial-gradient(circle at center, rgba(213, 181, 132, 0.95) 0 35%, transparent 36%),
      rgba(213, 181, 132, 0.16);
    transform: translateY(-50%);
  }

  .requirements-profile--active .requirements-profile__items li {
    border-color: rgba(255, 246, 226, 0.1);
    background: var(--c-navy-deep);
    color: #fff6e2;
  }

  .requirements-profile--active .requirements-profile__items li::before {
    border-color: rgba(255, 246, 226, 0.38);
    background:
      radial-gradient(circle at center, rgba(255, 246, 226, 0.96) 0 35%, transparent 36%),
      rgba(255, 246, 226, 0.12);
  }

  .requirements-cta {
    padding-top: 6px;
  }

  .requirements-cta__panel {
    display: grid;
    gap: 18px;
    justify-items: center;
    padding: clamp(26px, 4vw, 42px);
    border-radius: clamp(28px, 3vw, 36px);
    background: linear-gradient(160deg, var(--c-navy-deep) 0%, var(--c-navy) 100%);
    border: 1px solid rgba(255, 246, 226, 0.16);
    box-shadow: 0 20px 38px rgba(1, 13, 40, 0.18);
  }

  .requirements-cta__label {
    margin: 0;
    color: rgba(255, 246, 226, 0.72);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .requirements-cta__button {
    width: min(100%, 760px);
    min-height: 74px;
    padding-inline: clamp(22px, 4vw, 40px);
    font-size: clamp(1rem, 0.35vw + 1rem, 1.18rem);
    text-align: center;
    line-height: 1.35;
    white-space: normal;
    opacity: 1;
    background: transparent;
    color: #fff6e2;
    border: 2px solid rgba(255, 246, 226, 0.92);
    box-shadow: none;
    cursor: default;
    pointer-events: auto;
    transition:
      transform var(--transition-fast),
      border-color var(--transition-fast),
      background-color var(--transition-fast),
      color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .requirements-cta__button:hover,
  .requirements-cta__button:focus-visible {
    transform: scale(1.03);
    background: var(--c-arena);
    border-color: var(--c-arena);
    color: var(--c-navy-deep);
    box-shadow: 0 14px 30px rgba(213, 181, 132, 0.28);
    outline: none;
  }

  @media (max-width: 860px) {
    .requirements-profile--active {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .requirements-profile__panel {
      grid-row: auto;
      grid-column: 1 / -1;
    }

    .requirements-profile__description {
      max-width: none;
    }
  }

  @media (max-width: 720px) {
    .requirements-page__headline h1 {
      font-size: clamp(2.4rem, 12vw, 3.8rem);
    }

    .requirements-profile__items li {
      padding-left: 52px;
    }

    .requirements-profile__toggle {
      width: 46px;
      height: 46px;
    }

    .requirements-cta__button {
      width: 100%;
      min-height: 82px;
    }
  }
</style>
