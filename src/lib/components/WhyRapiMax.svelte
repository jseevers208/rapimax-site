<script>
  import { onDestroy, onMount } from 'svelte';
  import GlowRing from './GlowRing.svelte';
  import { BakedIconScene } from '../three/bakedIconScene.js';
  import iconAtlasUrl from '../../assets/3d-icons/rapimax-icons.glb?url';

  const DESKTOP_BREAKPOINT = 1080;
  const MOBILE_BREAKPOINT = 640;
  const WEBGL_BREAKPOINT = 820;

  const benefits = [
    {
      iconName: 'why-lightning',
      title: 'Agilidad',
      body: 'Aplicá en minutos y obtené respuesta en menos de 1 hora.'
    },
    {
      iconName: 'why-stopwatch',
      title: 'Rapidez',
      body: 'Estrená tu vehículo en menos de 24 horas una vez aprobado tu financiamiento.'
    },
    {
      iconName: 'why-digital',
      title: '100% digital',
      body: 'Un proceso simple, rápido y eficiente.'
    },
    {
      iconName: 'why-gear',
      title: 'Flexibilidad',
      body: 'Soluciones de financiamiento adaptadas a cada cliente.'
    },
    {
      iconName: 'why-handshake',
      title: 'Atención personalizada',
      body: 'Asesores reales te acompañan durante todo el proceso.'
    }
  ];

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  let sectionEl;
  let iconCanvasEls = [];
  let renderers = benefits.map(() => null);
  let webglReady = benefits.map(() => false);
  let reduceMotionMedia;
  let visibilityObserver;
  let preloadObserver;
  let stagedInitIdleId = null;
  let stagedInitTimeoutId = 0;
  let cleanupReduceMotionListener = () => {};
  let isSectionVisible = false;
  let isSectionNear = false;
  let isCompactLayout = false;
  let isMobile = false;
  let reduceMotion = false;
  let activeBenefitIndex = 0;
  let benefitColumns = 'minmax(0, 1fr)';
  const STAGED_RENDERER_DELAY_MS = 80;
  const SECTION_PRELOAD_MARGIN = '900px 0px';

  const setActiveBenefit = (index) => {
    activeBenefitIndex = clamp(index, 0, benefits.length - 1);
    startRendererWarmup();
  };

  $: {
    const activeGrow = isCompactLayout ? 2.6 : 2.2;
    const inactiveGrow = isCompactLayout ? 0.8 : 1;

    benefitColumns = isMobile
      ? 'minmax(0, 1fr)'
      : benefits
          .map((_, index) => `${index === activeBenefitIndex ? activeGrow : inactiveGrow}fr`)
          .join(' ');
  }

  $: {
    renderers.forEach((renderer, index) => {
      renderer?.setHighlighted(index === activeBenefitIndex);
    });
  }

  const cancelStagedRendererInit = () => {
    if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && stagedInitIdleId !== null) {
      window.cancelIdleCallback(stagedInitIdleId);
    }

    stagedInitIdleId = null;

    if (typeof window !== 'undefined' && stagedInitTimeoutId) {
      window.clearTimeout(stagedInitTimeoutId);
      stagedInitTimeoutId = 0;
    }
  };

  const setWebglReadyAtIndex = (index, ready) => {
    webglReady = webglReady.map((value, currentIndex) => (currentIndex === index ? ready : value));
  };

  const destroyRenderers = () => {
    cancelStagedRendererInit();
    renderers.forEach((renderer) => renderer?.dispose());
    renderers = benefits.map(() => null);
    webglReady = benefits.map(() => false);
  };

  const syncRendererPauseState = () => {
    const paused = !isSectionVisible || isMobile;
    renderers.forEach((renderer) => {
      renderer?.setPaused(paused);
      renderer?.setReducedMotion(reduceMotion);
    });
  };

  const canUseWebgl = () =>
    typeof window !== 'undefined' && window.innerWidth >= WEBGL_BREAKPOINT && !isMobile;

  const getRendererInitOrder = () => {
    const order = [activeBenefitIndex];

    for (let index = 0; index < benefits.length; index += 1) {
      if (index !== activeBenefitIndex) {
        order.push(index);
      }
    }

    return order;
  };

  const initRendererAtIndex = (index) => {
    if (!canUseWebgl() || renderers[index]) return false;

    const canvas = iconCanvasEls[index];
    if (!canvas) return false;

    try {
      const renderer = new BakedIconScene(canvas, iconAtlasUrl, {
        iconName: benefits[index].iconName,
        reduceMotion,
        maxPixelRatio: 1.25,
        onReady: () => setWebglReadyAtIndex(index, true),
        onError: () => setWebglReadyAtIndex(index, false)
      });
      renderer.setHighlighted(index === activeBenefitIndex);
      renderers[index] = renderer;
      syncRendererPauseState();
      return true;
    } catch {
      setWebglReadyAtIndex(index, false);
      return false;
    }
  };

  const scheduleNextRendererInit = () => {
    cancelStagedRendererInit();

    if (!isSectionNear || !canUseWebgl()) {
      return;
    }

    const nextIndex = getRendererInitOrder().find((index) => !renderers[index]);
    if (typeof nextIndex !== 'number') {
      return;
    }

    const queueTask = () => {
      stagedInitIdleId = null;
      initRendererAtIndex(nextIndex);

      if (getRendererInitOrder().some((index) => !renderers[index])) {
        stagedInitTimeoutId = window.setTimeout(() => {
          stagedInitTimeoutId = 0;
          scheduleNextRendererInit();
        }, STAGED_RENDERER_DELAY_MS);
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      stagedInitIdleId = window.requestIdleCallback(queueTask, { timeout: 450 });
      return;
    }

    stagedInitTimeoutId = window.setTimeout(() => {
      stagedInitTimeoutId = 0;
      queueTask();
    }, STAGED_RENDERER_DELAY_MS);
  };

  const startRendererWarmup = () => {
    if (!isSectionNear || !canUseWebgl()) return;
    scheduleNextRendererInit();
  };

  const updateViewportMode = () => {
    isCompactLayout = window.innerWidth < DESKTOP_BREAKPOINT;
    isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    if (!canUseWebgl()) {
      destroyRenderers();
      return;
    }

    startRendererWarmup();
    syncRendererPauseState();
  };

  const setRendererPointerFromEvent = (event, index) => {
    const renderer = renderers[index];
    if (!renderer) return;

    const source = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    if (!source) return;

    const rect = source.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    renderer.setPointer(x, y);
  };

  const clearRendererPointer = (index) => {
    renderers[index]?.setPointer(0, 0);
  };

  const handleCardKeydown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveBenefit(index);
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveBenefit((index + 1) % benefits.length);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveBenefit((index - 1 + benefits.length) % benefits.length);
    }
  };

  onMount(() => {
    if (window?.matchMedia) {
      reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
      reduceMotion = reduceMotionMedia.matches;

      const handleReduceMotionChange = (event) => {
        reduceMotion = event.matches;
        syncRendererPauseState();
        startRendererWarmup();
      };

      reduceMotionMedia.addEventListener('change', handleReduceMotionChange);
      cleanupReduceMotionListener = () =>
        reduceMotionMedia?.removeEventListener('change', handleReduceMotionChange);
    }

    const handleResize = () => {
      updateViewportMode();
    };

    window.addEventListener('resize', handleResize);

    if ('IntersectionObserver' in window && sectionEl) {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isSectionVisible = Boolean(entry?.isIntersecting);
          syncRendererPauseState();
        },
        { threshold: 0.12 }
      );
      visibilityObserver.observe(sectionEl);

      preloadObserver = new IntersectionObserver(
        ([entry]) => {
          isSectionNear = Boolean(entry?.isIntersecting);

          if (isSectionNear) {
            startRendererWarmup();
            preloadObserver?.disconnect();
            preloadObserver = null;
          }
        },
        { threshold: 0, rootMargin: SECTION_PRELOAD_MARGIN }
      );
      preloadObserver.observe(sectionEl);
    } else {
      isSectionVisible = true;
      isSectionNear = true;
    }

    updateViewportMode();

    return () => {
      window.removeEventListener('resize', handleResize);
      visibilityObserver?.disconnect();
      preloadObserver?.disconnect();
      cleanupReduceMotionListener();
      destroyRenderers();
    };
  });

  onDestroy(() => {
    cancelStagedRendererInit();
    destroyRenderers();
  });
</script>

<section
  class="section benefits-section"
  class:benefits-section--compact={isCompactLayout}
  class:benefits-section--mobile={isMobile}
  class:benefits-section--reduced-motion={reduceMotion}
  bind:this={sectionEl}
  aria-label="Beneficios de financiar con Rapimax"
>
  <div class="benefits-shell">
    <header class="benefits-header">
      <h2 class="section-title benefits-title">Beneficios de financiar con Rapimax</h2>
    </header>

    <div
      class="benefits-rail"
      role="list"
      style={`grid-template-columns: ${benefitColumns};`}
      on:mouseleave={() => setActiveBenefit(0)}
    >
      {#each benefits as benefit, index}
        <GlowRing
          as="button"
          type="button"
          class={`benefit-card ${index === activeBenefitIndex ? 'is-active' : ''} ${benefit.title === 'Rapidez' ? 'benefit-card--rapidez' : ''}`.trim()}
          aria-pressed={index === activeBenefitIndex}
          aria-label={benefit.title}
          glowColor="rgba(213, 181, 132, 0.82)"
          glowPad="26px"
          glowRadius="84px"
          revealRadius="346px"
          outlineWidth="0"
          fillContent={true}
          on:mouseenter={() => setActiveBenefit(index)}
          on:focus={() => setActiveBenefit(index)}
          on:keydown={(event) => handleCardKeydown(event.detail, index)}
          on:pointerenter={() => setActiveBenefit(index)}
          on:pointermove={(event) => setRendererPointerFromEvent(event.detail, index)}
          on:pointerleave={() => clearRendererPointer(index)}
        >
          <span class="benefit-card__media">
            <canvas
              class="benefit-card__canvas"
              class:is-hidden={!webglReady[index]}
              bind:this={iconCanvasEls[index]}
              aria-hidden="true"
            ></canvas>

            {#if !webglReady[index]}
              <span class="benefit-card__fallback" aria-hidden="true"></span>
            {/if}
          </span>

          <span class="benefit-card__copy">
            <span class="benefit-card__heading">{benefit.title}</span>
            <span class="benefit-card__body">{benefit.body}</span>
          </span>
        </GlowRing>
      {/each}
    </div>
  </div>
</section>

<style>
  .benefits-section {
    background: var(--c-crema);
    padding: clamp(44px, 6vw, 72px) 0 clamp(330px, 38vw, 560px);
  }

  .benefits-shell {
    width: min(1340px, 96vw);
    margin: 0 auto;
    padding: 0 clamp(12px, 2.2vw, 34px);
    display: grid;
    gap: clamp(44px, 5.2vw, 64px);
  }

  .benefits-header {
    display: grid;
    justify-items: center;
  }

  .benefits-title {
    width: min(18ch, 100%);
    margin-bottom: 0;
  }

  .benefits-rail {
    position: relative;
    display: grid;
    gap: clamp(6px, 0.6vw, 10px);
    align-items: stretch;
    transition: grid-template-columns 320ms ease;
  }

  :global(.benefit-card) {
    width: 100%;
    position: relative;
    z-index: 1;
    min-width: 0;
    min-height: clamp(420px, 34vw, 520px);
    padding: clamp(20px, 2vw, 28px);
    border: 1px solid rgba(18, 41, 65, 0.08);
    border-radius: clamp(24px, 2.5vw, 34px);
    background: var(--c-warm-gray);
    box-shadow: 0 18px 34px rgba(1, 13, 40, 0.09);
    color: var(--c-navy);
    appearance: none;
    cursor: pointer;
    overflow: hidden;
    isolation: isolate;
    transition:
      background 240ms ease,
      border-color 240ms ease,
      box-shadow 240ms ease;
  }

  :global(.benefit-card)::before,
  :global(.benefit-card)::after {
    content: none;
  }

  :global(.benefit-card):hover,
  :global(.benefit-card):focus-visible,
  :global(.benefit-card.is-active) {
    background: var(--c-navy);
    border-color: rgba(1, 13, 40, 0.5);
    box-shadow: 0 22px 38px rgba(1, 13, 40, 0.16);
  }

  :global(.benefit-card):focus-visible {
    outline: none;
  }

  :global(.benefit-card__media),
  :global(.benefit-card__copy) {
    position: relative;
    z-index: 1;
  }

  :global(.benefit-card__media) {
    position: absolute;
    top: clamp(16px, 1.6vw, 22px);
    right: clamp(14px, 1.5vw, 20px);
    width: clamp(104px, 8vw, 148px);
    height: clamp(104px, 8vw, 148px);
    display: grid;
    place-items: center;
    pointer-events: auto;
    transition:
      width 280ms ease,
      height 280ms ease,
      transform 280ms ease,
      opacity 280ms ease;
  }

  :global(.benefit-card.is-active) :global(.benefit-card__media) {
    width: clamp(170px, 12.2vw, 228px);
    height: clamp(170px, 12.2vw, 228px);
    transform: translate3d(0, 0, 0) scale(1);
  }

  :global(.benefit-card:not(.is-active)) :global(.benefit-card__media) {
    transform: translate3d(0, 0, 0) scale(0.92);
    opacity: 0.92;
  }

  :global(.benefit-card__canvas),
  :global(.benefit-card__fallback) {
    width: 100%;
    height: 100%;
    display: block;
  }

  :global(.benefit-card__canvas) {
    pointer-events: none;
  }

  :global(.benefit-card__canvas.is-hidden) {
    visibility: hidden;
    opacity: 0;
  }

  :global(.benefit-card__fallback) {
    width: 64%;
    height: 64%;
    border-radius: 30%;
    background:
      radial-gradient(circle at 35% 28%, rgba(255, 246, 226, 0.86), rgba(213, 181, 132, 0.24) 35%, transparent 36%),
      linear-gradient(135deg, rgba(213, 181, 132, 0.95), rgba(18, 41, 65, 0.9));
    box-shadow:
      inset 0 0 0 1px rgba(255, 246, 226, 0.2),
      0 16px 26px rgba(1, 13, 40, 0.34);
  }

  :global(.benefit-card__copy) {
    position: absolute;
    left: clamp(18px, 1.8vw, 26px);
    right: clamp(18px, 1.8vw, 26px);
    bottom: clamp(18px, 1.8vw, 26px);
    display: grid;
    gap: 0;
    justify-items: start;
    text-align: left;
    transition:
      gap 260ms ease,
      color 240ms ease;
  }

  :global(.benefit-card__heading) {
    max-width: 12ch;
    margin: 0;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(1.25rem, 1vw + 0.9rem, 1.8rem);
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: -0.03em;
    text-wrap: balance;
    transform: translateY(0);
    transition:
      color 240ms ease,
      font-size 240ms ease,
      max-width 240ms ease,
      transform 260ms ease;
  }

  :global(.benefit-card__body) {
    inline-size: 28ch;
    max-width: none;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    color: rgba(18, 41, 65, 0.82);
    font-size: clamp(0.94rem, 0.28vw + 0.9rem, 1.02rem);
    line-height: 1.55;
    text-wrap: pretty;
    transform: translateY(10px);
    transition:
      max-height 260ms ease,
      opacity 220ms ease,
      transform 260ms ease,
      color 240ms ease;
  }

  :global(.benefit-card):hover :global(.benefit-card__heading),
  :global(.benefit-card):focus-visible :global(.benefit-card__heading),
  :global(.benefit-card.is-active) :global(.benefit-card__heading) {
    color: var(--c-crema);
  }

  :global(.benefit-card):hover :global(.benefit-card__body),
  :global(.benefit-card):focus-visible :global(.benefit-card__body),
  :global(.benefit-card.is-active) :global(.benefit-card__body) {
    color: rgba(255, 246, 226, 0.9);
  }

  :global(.benefit-card.is-active) :global(.benefit-card__copy) {
    gap: 10px;
  }

  :global(.benefit-card.is-active) :global(.benefit-card__heading) {
    max-width: 13ch;
    font-size: clamp(1.55rem, 1vw + 1rem, 2rem);
    transform: translateY(-4px);
  }

  :global(.benefit-card.is-active) :global(.benefit-card__body) {
    max-height: 7em;
    opacity: 1;
    transform: translateY(0);
  }

  :global(.benefit-card--rapidez.is-active) :global(.benefit-card__body) {
    inline-size: 32ch;
  }

  .benefits-section--compact :global(.benefit-card) {
    min-height: 330px;
  }

  .benefits-section--compact :global(.benefit-card__media) {
    width: clamp(132px, 15vw, 180px);
    height: clamp(132px, 15vw, 180px);
  }

  .benefits-section--compact :global(.benefit-card.is-active) :global(.benefit-card__media) {
    width: clamp(150px, 16vw, 196px);
    height: clamp(150px, 16vw, 196px);
  }

  .benefits-section--mobile {
    padding-top: clamp(28px, 6vw, 40px);
    padding-bottom: clamp(36px, 8vw, 56px);
  }

  .benefits-section--mobile .benefits-shell {
    gap: clamp(20px, 4vw, 28px);
  }

  /* 2-column grid of compact cards */
  .benefits-section--mobile .benefits-rail {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px;
  }

  /* Reset absolute positioning — make cards flow naturally */
  .benefits-section--mobile :global(.benefit-card) {
    width: 100%;
    min-height: auto !important;
    padding: 20px 16px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center;
    gap: 12px;
    aspect-ratio: 1 / 1;
    border-radius: 20px !important;
  }

  /* Force media out of absolute positioning */
  .benefits-section--mobile :global(.benefit-card__media),
  .benefits-section--mobile :global(.benefit-card.is-active) :global(.benefit-card__media) {
    position: static !important;
    width: 56px !important;
    height: 56px !important;
    transform: none !important;
    opacity: 1 !important;
    flex-shrink: 0;
  }

  /* Force copy out of absolute positioning */
  .benefits-section--mobile :global(.benefit-card__copy) {
    position: static !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .benefits-section--mobile :global(.benefit-card__heading) {
    max-width: none !important;
    font-size: 0.88rem !important;
    text-align: center;
    transform: none !important;
    opacity: 1 !important;
  }

  /* Hide body text on non-active cards — too small for 2-col */
  .benefits-section--mobile :global(.benefit-card__body) {
    display: none !important;
  }

  /* Active card: show body text, navy background */
  .benefits-section--mobile :global(.benefit-card.is-active) {
    background: var(--c-navy, #122941) !important;
    color: #fff6e2 !important;
  }

  .benefits-section--mobile :global(.benefit-card.is-active) :global(.benefit-card__body) {
    display: block !important;
    inline-size: 100%;
    max-height: none !important;
    opacity: 0.8 !important;
    font-size: 0.75rem !important;
    line-height: 1.4;
    text-align: center;
    transform: none !important;
  }

  .benefits-section--mobile :global(.benefit-card.is-active) :global(.benefit-card__heading) {
    color: #fff6e2 !important;
  }

  /* Fallback icon smaller for 2-col grid */
  .benefits-section--mobile :global(.benefit-card__fallback) {
    width: 80% !important;
    height: 80% !important;
  }

  .benefits-section--reduced-motion :global(.benefit-card),
  .benefits-section--reduced-motion :global(.benefit-card__media),
  .benefits-section--reduced-motion :global(.benefit-card__heading),
  .benefits-section--reduced-motion :global(.benefit-card__body) {
    transition: none;
  }

  @media (max-width: 640px) {
    .benefits-title {
      width: min(14ch, 100%);
    }
  }

  @media (max-width: 820px) {
    :global(.benefit-card__fallback) {
      box-shadow:
        inset 0 0 0 1px rgba(255, 246, 226, 0.2),
        0 12px 22px rgba(1, 13, 40, 0.32);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.benefit-card),
    :global(.benefit-card__media),
    :global(.benefit-card__heading),
    :global(.benefit-card__body) {
      transition: none;
    }
  }
</style>
