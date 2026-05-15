<script>
  import { onDestroy, onMount, tick } from 'svelte';
  import SiteLayout from './lib/components/SiteLayout.svelte';
  import personalImage from './assets/services/personal.webp';
  import personalHoverImage from './assets/services/personal2.webp';
  import commercialImage from './assets/services/commercial.webp';
  import commercialHoverImage from './assets/services/commercial2.webp';
  import workImage from './assets/services/work.webp';
  import workHoverImage from './assets/services/work2.webp';
  import premiumImage from './assets/services/premium.webp';
  import premiumHoverImage from './assets/services/premium2.webp';
  import motoImage from './assets/services/moto.webp';
  import motoHoverImage from './assets/services/moto2.webp';

  const REVEAL_DELAY_MS = 160;
  const CENTER_POSITION = '50%';
  const ZERO_RADIUS = '0px';
  const REVEAL_RADIUS_PADDING = 24;

  const services = [
    {
      id: 'vehiculos-personales',
      title: 'Vehículos de uso personal',
      description: 'Financiamiento para carros de uso particular.',
      image: personalImage,
      hoverImage: personalHoverImage,
      layout: 'default'
    },
    {
      id: 'vehiculos-comerciales',
      title: 'Vehículos de uso comercial',
      description: 'Soluciones para actividades comerciales o productivas.',
      image: commercialImage,
      hoverImage: commercialHoverImage,
      layout: 'mirrored'
    },
    {
      id: 'flotas-empresariales',
      title: 'Flotas empresariales',
      description: 'Financiamiento para empresas que necesitan múltiples vehículos.',
      image: workImage,
      hoverImage: workHoverImage,
      layout: 'default'
    },
    {
      id: 'vehiculos-alta-gama',
      title: 'Vehículos de alta gama',
      description: 'Opciones de financiamiento para vehículos premium.',
      image: premiumImage,
      hoverImage: premiumHoverImage,
      layout: 'mirrored'
    },
    {
      id: 'motocicletas',
      title: 'Motocicletas',
      description: 'Financiamiento ágil para motocicletas.',
      image: motoImage,
      hoverImage: motoHoverImage,
      layout: 'default'
    }
  ];

  const createCardState = () => ({
    revealX: CENTER_POSITION,
    revealY: CENTER_POSITION,
    revealRadius: ZERO_RADIUS,
    isRevealed: false,
    isResettingOrigin: false
  });

  const serviceIds = new Set(services.map((service) => service.id));
  let activeServiceId = '';
  let cardStates = services.map(() => createCardState());
  let revealTimers = services.map(() => null);
  let collapseFrames = services.map(() => []);
  let prefersReducedMotion = false;
  let reducedMotionQuery;

  const waitForNextFrame = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });

  const setCardState = (index, patch) => {
    cardStates[index] = { ...cardStates[index], ...patch };
    cardStates = [...cardStates];
  };

  const clearRevealTimer = (index) => {
    if (!revealTimers[index]) return;

    clearTimeout(revealTimers[index]);
    revealTimers[index] = null;
  };

  const clearCollapseFrames = (index) => {
    if (!collapseFrames[index].length) return;

    for (const frame of collapseFrames[index]) {
      cancelAnimationFrame(frame);
    }

    collapseFrames[index] = [];
  };

  const getCardRectMetrics = (element) => {
    const rect = element.getBoundingClientRect();

    return {
      centerX: `${rect.width / 2}px`,
      centerY: `${rect.height / 2}px`,
      centerRadius: `${Math.ceil(Math.hypot(rect.width / 2, rect.height / 2) + REVEAL_RADIUS_PADDING)}px`
    };
  };

  const getPointerMetrics = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

    return {
      revealX: `${x}px`,
      revealY: `${y}px`,
      revealRadius: `${Math.ceil(
        Math.max(
          Math.hypot(x, y),
          Math.hypot(rect.width - x, y),
          Math.hypot(x, rect.height - y),
          Math.hypot(rect.width - x, rect.height - y)
        ) + REVEAL_RADIUS_PADDING
      )}px`
    };
  };

  const scheduleReveal = (index) => {
    clearRevealTimer(index);

    if (prefersReducedMotion) {
      setCardState(index, { isResettingOrigin: false, isRevealed: true });
      return;
    }

    revealTimers[index] = window.setTimeout(() => {
      revealTimers[index] = null;
      setCardState(index, { isResettingOrigin: false, isRevealed: true });
    }, REVEAL_DELAY_MS);
  };

  const handlePointerEnter = (index, event) => {
    if (event.pointerType === 'touch') return;

    clearCollapseFrames(index);
    setCardState(index, {
      ...getPointerMetrics(event),
      isResettingOrigin: false
    });
    scheduleReveal(index);
  };

  const handlePointerMove = (index, event) => {
    if (event.pointerType === 'touch') return;

    clearCollapseFrames(index);
    setCardState(index, {
      ...getPointerMetrics(event),
      isResettingOrigin: false
    });

    if (!cardStates[index].isRevealed && !revealTimers[index]) {
      scheduleReveal(index);
    }
  };

  const handlePointerLeave = (index, event) => {
    if (event.pointerType === 'touch') return;

    clearRevealTimer(index);
    clearCollapseFrames(index);

    if (prefersReducedMotion) {
      setCardState(index, {
        revealX: CENTER_POSITION,
        revealY: CENTER_POSITION,
        revealRadius: ZERO_RADIUS,
        isResettingOrigin: false,
        isRevealed: false
      });
      return;
    }

    const { centerX, centerY, centerRadius } = getCardRectMetrics(event.currentTarget);

    setCardState(index, {
      revealX: centerX,
      revealY: centerY,
      revealRadius: centerRadius,
      isResettingOrigin: true,
      isRevealed: true
    });

    const firstFrame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => {
        setCardState(index, {
          revealRadius: ZERO_RADIUS,
          isResettingOrigin: false,
          isRevealed: false
        });
        collapseFrames[index] = [];
      });

      collapseFrames[index] = [secondFrame];
    });

    collapseFrames[index] = [firstFrame];
  };

  const getServiceIdFromHash = (hash = window.location.hash) => {
    const normalizedHash = hash.replace(/^#/, '');
    return serviceIds.has(normalizedHash) ? normalizedHash : '';
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

  onMount(() => {
    let syncReducedMotion = () => {};

    if (typeof window !== 'undefined' && window.matchMedia) {
      reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      syncReducedMotion = () => {
        prefersReducedMotion = reducedMotionQuery.matches;
      };

      syncReducedMotion();
      reducedMotionQuery.addEventListener?.('change', syncReducedMotion);
    }

    const handleHashChange = () => {
      activeServiceId = getServiceIdFromHash();
      void scrollToHashTarget();
    };

    activeServiceId = getServiceIdFromHash();
    void scrollToHashTarget();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      reducedMotionQuery?.removeEventListener?.('change', syncReducedMotion);
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  onDestroy(() => {
    revealTimers.forEach((timer) => timer && clearTimeout(timer));
    collapseFrames.forEach((frames) => frames.forEach((frame) => cancelAnimationFrame(frame)));
  });
</script>

<SiteLayout page="services" footerSpacing="compact">
  <section class="services-page section">
    <div class="container services-page__shell">
      <header class="services-page__intro">
        <h1>Leasing financiero</h1>
      </header>

      <section class="services-panel" aria-labelledby="services-panel-title">
        <h2 id="services-panel-title" class="services-panel__title">Soluciones de financiamiento</h2>

        <div class="services-list" aria-label="Productos de leasing financiero">
          {#each services as service, index}
            <article
              id={service.id}
              class={`service-row service-row--${service.layout}`}
              class:service-row--active={activeServiceId === service.id}
              aria-labelledby={`${service.id}-title`}
            >
              <div class="service-row__media">
                <div
                  class="service-row__media-frame"
                  class:is-revealed={cardStates[index].isRevealed}
                  class:is-resetting-origin={cardStates[index].isResettingOrigin}
                  style={`--service-reveal-x: ${cardStates[index].revealX}; --service-reveal-y: ${cardStates[index].revealY}; --service-reveal-radius: ${cardStates[index].revealRadius};`}
                  on:pointerenter={(event) => handlePointerEnter(index, event)}
                  on:pointermove={(event) => handlePointerMove(index, event)}
                  on:pointerleave={(event) => handlePointerLeave(index, event)}
                >
                  <img
                    class="service-row__image service-row__image--base"
                    src={service.image}
                    alt={`Imagen de referencia para ${service.title}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <img
                    class="service-row__image service-row__image--reveal"
                    src={service.hoverImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div class="service-row__content">
                <div class="service-row__copy">
                  <h3 id={`${service.id}-title`}>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            </article>
          {/each}
        </div>
      </section>

      <section class="services-cta" aria-labelledby="services-cta-title">
        <div class="services-cta__panel">
          <p class="services-cta__label" id="services-cta-title">Aplicación rápida</p>
          <a
            class="btn primary services-cta__button"
            href="/contactanos"
          >
            Aplicá en minutos y obtené respuesta en menos de una hora.
          </a>
        </div>
      </section>
    </div>
  </section>
</SiteLayout>

<style>
  .services-page {
    padding-top: calc(var(--hero-safe-top, 88px) + clamp(24px, 5vw, 56px));
    padding-bottom: clamp(56px, 9vw, 92px);
    background: var(--c-crema);
  }

  .services-page__shell {
    display: grid;
    gap: clamp(28px, 4vw, 42px);
  }

  .services-page__intro {
    width: min(900px, 100%);
    margin: 0 auto;
    text-align: center;
  }

  .services-page__intro h1,
  .services-panel__title,
  .service-row__copy h3 {
    margin: 0;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    letter-spacing: -0.04em;
  }

  .services-page__intro h1 {
    font-size: clamp(2.6rem, 4vw + 1rem, 5rem);
    line-height: 0.94;
  }

  .services-panel,
  .services-cta__panel {
    border-radius: clamp(28px, 3vw, 38px);
  }

  .services-panel {
    display: grid;
    gap: clamp(28px, 4vw, 42px);
    padding: clamp(22px, 3vw, 34px);
    background: var(--c-warm-gray);
    border: 1px solid rgba(18, 41, 65, 0.12);
    box-shadow: 0 20px 36px rgba(5, 15, 34, 0.08);
  }

  .services-panel__title {
    text-align: center;
    font-size: clamp(1.9rem, 1.4vw + 1.3rem, 3rem);
    line-height: 0.98;
  }

  .services-list {
    display: grid;
    gap: clamp(44px, 6vw, 80px);
  }

  .service-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas: 'media content';
    gap: clamp(22px, 2.8vw, 40px);
    align-items: center;
    scroll-margin-top: calc(var(--hero-safe-top, 88px) + 22px);
  }

  .service-row--mirrored {
    grid-template-areas: 'content media';
  }

  .service-row__media,
  .service-row__content {
    min-width: 0;
  }

  .service-row__media {
    grid-area: media;
  }

  .service-row__media-frame {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    border-radius: clamp(20px, 2vw, 28px);
    aspect-ratio: 16 / 9;
    background:
      linear-gradient(180deg, rgba(241, 241, 239, 0.42) 0%, rgba(18, 41, 65, 0.08) 100%),
      #ffffff;
    border: 1px solid rgba(18, 41, 65, 0.1);
    box-shadow: 0 18px 30px rgba(1, 13, 40, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transform-origin: center;
    transition: transform 220ms ease, box-shadow 220ms ease;
  }

  .service-row__media-frame:hover {
    transform: scale(1.018);
    box-shadow: 0 24px 38px rgba(1, 13, 40, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .service-row__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .service-row__image--reveal {
    clip-path: circle(0px at var(--service-reveal-x, 50%) var(--service-reveal-y, 50%));
    transition: clip-path 480ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: clip-path;
  }

  .service-row__media-frame.is-revealed .service-row__image--reveal {
    clip-path: circle(var(--service-reveal-radius, 0px) at var(--service-reveal-x, 50%) var(--service-reveal-y, 50%));
  }

  .service-row__media-frame.is-resetting-origin .service-row__image--reveal {
    transition: none;
  }

  .service-row--active .service-row__media-frame {
    border-color: rgba(213, 181, 132, 0.9);
    box-shadow: 0 0 0 2px rgba(213, 181, 132, 0.22), 0 18px 30px rgba(1, 13, 40, 0.08);
  }

  .service-row__content {
    grid-area: content;
    display: grid;
    align-content: center;
  }

  .service-row__copy {
    display: grid;
    gap: 14px;
    padding: clamp(12px, 1.8vw, 20px) clamp(2px, 0.8vw, 8px);
  }

  .service-row__copy h3 {
    max-width: 12ch;
    font-size: clamp(1.8rem, 1.4vw + 1rem, 2.8rem);
    line-height: 0.96;
  }

  .service-row__copy p {
    margin: 0;
    max-width: 42ch;
    color: var(--c-ink-soft);
    font-size: clamp(1rem, 0.25vw + 0.96rem, 1.08rem);
    line-height: 1.6;
  }

  .services-cta {
    display: grid;
  }

  .services-cta__panel {
    display: grid;
    gap: 18px;
    justify-items: center;
    padding: clamp(26px, 4vw, 42px);
    background: linear-gradient(160deg, var(--c-navy-deep) 0%, var(--c-navy) 100%);
    border: 1px solid rgba(255, 246, 226, 0.16);
    box-shadow: 0 20px 38px rgba(1, 13, 40, 0.18);
  }

  .services-cta__label {
    margin: 0;
    color: rgba(255, 246, 226, 0.72);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .services-cta__button {
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

  .services-cta__button:hover,
  .services-cta__button:focus-visible {
    transform: scale(1.03);
    background: var(--c-arena);
    border-color: var(--c-arena);
    color: var(--c-navy-deep);
    box-shadow: 0 14px 30px rgba(213, 181, 132, 0.28);
    outline: none;
  }

  @media (max-width: 860px) {
    .service-row,
    .service-row--mirrored {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'media'
        'content';
      gap: 18px;
    }

    .service-row__copy h3,
    .service-row__copy p {
      max-width: none;
    }
  }

  @media (max-width: 720px) {
    .services-page__intro h1 {
      font-size: clamp(2.4rem, 12vw, 4rem);
    }

    .services-panel,
    .services-cta__panel {
      padding: 18px 14px;
    }

    .services-list {
      gap: 38px;
    }

    .services-cta__button {
      width: 100%;
      min-height: 84px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .service-row__media-frame,
    .services-cta__button {
      transition: none;
    }

    .service-row__media-frame:hover,
    .services-cta__button:hover,
    .services-cta__button:focus-visible {
      transform: none;
    }

    .service-row__image--reveal {
      clip-path: none;
      opacity: 0;
      transition: opacity 180ms ease;
    }

    .service-row__media-frame.is-revealed .service-row__image--reveal {
      opacity: 1;
    }
  }
</style>
