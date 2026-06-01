<script>
  import { onDestroy, onMount } from 'svelte';
  import GlowRing from './GlowRing.svelte';
  import { BakedIconScene } from '../three/bakedIconScene.js';
  import iconAtlasUrl from '../../assets/3d-icons/rapimax-icons.glb?url';

  const DESKTOP_BREAKPOINT = 1080;
  const MOBILE_BREAKPOINT = 640;
  const WEBGL_BREAKPOINT = 320;

  const benefits = [
    {
      iconName: 'why-lightning',
      iconSvg: '<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M52 6 18 55h26l-6 35 40-55H50L52 6Z" fill="currentColor"/></svg>',
      title: 'Agilidad',
      body: 'Aplicá en minutos y obtené respuesta en menos de 1 hora.'
    },
    {
      iconName: 'why-stopwatch',
      iconSvg: '<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M38 8h20v10H38V8Zm5 44V28h10v28l17 10-5 9-22-13V52Z" fill="currentColor"/><path d="M48 16c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35S67.3 16 48 16Zm0 10c13.8 0 25 11.2 25 25S61.8 76 48 76 23 64.8 23 51s11.2-25 25-25Z" fill="currentColor"/></svg>',
      title: 'Rapidez',
      body: 'Estrená tu vehículo en menos de 24 horas una vez aprobado tu financiamiento.'
    },
    {
      iconName: 'why-digital',
      iconSvg: '<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M18 18h60c5 0 9 4 9 9v35c0 5-4 9-9 9H58v7h12v8H26v-8h12v-7H18c-5 0-9-4-9-9V27c0-5 4-9 9-9Zm2 10v33h56V28H20Zm19 8h18v8H39v-8Zm-10 14h38v8H29v-8Z" fill="currentColor"/></svg>',
      title: '100% digital',
      body: 'Un proceso simple, rápido y eficiente.'
    },
    {
      iconName: 'why-gear',
      iconSvg: '<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M54 7 58 18c2.2.7 4.3 1.6 6.2 2.6l10.7-5 8.5 8.5-5 10.7c1 1.9 1.9 4 2.6 6.2l11 4v12l-11 4a34.8 34.8 0 0 1-2.6 6.2l5 10.7-8.5 8.5-10.7-5c-1.9 1-4 1.9-6.2 2.6l-4 11H42l-4-11a34.8 34.8 0 0 1-6.2-2.6l-10.7 5-8.5-8.5 5-10.7c-1-1.9-1.9-4-2.6-6.2l-11-4V45l11-4c.7-2.2 1.6-4.3 2.6-6.2l-5-10.7 8.5-8.5 10.7 5c1.9-1 4-1.9 6.2-2.6l4-11h12ZM48 36a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z" fill="currentColor"/></svg>',
      title: 'Flexibilidad',
      body: 'Soluciones de financiamiento adaptadas a cada cliente.'
    },
    {
      iconName: 'why-handshake',
      iconSvg: '<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M15 40 34 22c6-5.7 14.7-6.3 21.3-1.5L61 24h13c4.4 0 8 3.6 8 8v29h-8.6l-9.8 10c-6.3 6.4-16.6 6.4-22.9 0L15 45.2V40Zm27.8-11.1L28.5 42.4l20.7 20.7c2.4 2.4 6.3 2.4 8.7 0l13-13V34H58.2L49 28.2c-1.9-1.2-4.4-1-6.2.7Z" fill="currentColor"/><path d="M44 35 32 47l-7-7 12-12 7 7Zm12 12-7 7-16-16 7-7 16 16Z" fill="currentColor"/></svg>',
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
    const paused = !isSectionVisible;
    renderers.forEach((renderer) => {
      renderer?.setPaused(paused);
      renderer?.setReducedMotion(reduceMotion || isMobile);
    });
  };

  const canUseWebgl = () =>
    typeof window !== 'undefined' && window.innerWidth >= WEBGL_BREAKPOINT;

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
        reduceMotion: reduceMotion || isMobile,
        maxPixelRatio: isMobile ? 1 : 1.25,
        initialPointerX: isMobile ? -0.9 : 0,
        initialPointerY: isMobile ? 0.22 : 0,
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
    if (isMobile) return;
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
    if (isMobile) return;
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
          on:click={() => setActiveBenefit(index)}
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
              <span class="benefit-card__fallback" aria-hidden="true">
                {@html benefit.iconSvg}
              </span>
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
    display: grid;
    place-items: center;
    color: var(--c-navy);
    border-radius: 28%;
    background: rgba(213, 181, 132, 0.16);
    box-shadow: inset 0 0 0 1px rgba(18, 41, 65, 0.08);
    transition:
      color 240ms ease,
      background-color 240ms ease,
      box-shadow 240ms ease;
  }

  :global(.benefit-card__fallback svg) {
    width: 72%;
    height: 72%;
    display: block;
  }

  :global(.benefit-card.is-active) :global(.benefit-card__fallback),
  :global(.benefit-card):hover :global(.benefit-card__fallback),
  :global(.benefit-card):focus-visible :global(.benefit-card__fallback) {
    color: var(--c-crema);
    background: rgba(213, 181, 132, 0.2);
    box-shadow: inset 0 0 0 1px rgba(255, 246, 226, 0.18);
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
    padding-bottom: clamp(56px, 12vw, 84px);
  }

  .benefits-section--mobile .benefits-shell {
    width: 100%;
    padding: 0 clamp(10px, 2.8vw, 16px);
    gap: clamp(24px, 5vw, 32px);
  }

  .benefits-section--mobile .benefits-rail {
    grid-template-columns: minmax(0, 1fr);
  }

  .benefits-section--mobile :global(.benefit-card) {
    --benefit-mobile-icon-size: clamp(164px, 45vw, 190px);
    --benefit-mobile-gap: clamp(8px, 2.8vw, 14px);
    width: 100%;
    min-height: calc(var(--benefit-mobile-icon-size) + 56px);
    padding: 0;
  }

  .benefits-section--mobile :global(.benefit-card > .glow-ring__content--fill) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr);
    align-items: center;
    gap: var(--benefit-mobile-gap);
    padding: 24px clamp(16px, 4vw, 20px);
  }

  .benefits-section--mobile :global(.benefit-card__media),
  .benefits-section--mobile :global(.benefit-card.is-active) :global(.benefit-card__media) {
    position: relative;
    grid-column: 2;
    top: auto;
    right: auto;
    justify-self: center;
    width: min(var(--benefit-mobile-icon-size), 100%);
    height: auto;
    aspect-ratio: 1;
    transform: none;
    opacity: 1;
  }

  .benefits-section--mobile :global(.benefit-card:not(.is-active)) :global(.benefit-card__media) {
    transform: none;
    opacity: 1;
  }

  .benefits-section--mobile :global(.benefit-card__fallback) {
    width: 100%;
    height: 100%;
    background: rgba(213, 181, 132, 0.14);
  }

  .benefits-section--mobile :global(.benefit-card__fallback svg) {
    width: 82%;
    height: 82%;
  }

  .benefits-section--mobile :global(.benefit-card__copy),
  .benefits-section--mobile :global(.benefit-card.is-active) :global(.benefit-card__copy) {
    position: relative;
    grid-column: 1;
    grid-row: 1;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    align-self: center;
    width: 100%;
    height: var(--benefit-mobile-icon-size);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    transform: none;
  }

  .benefits-section--mobile :global(.benefit-card__body),
  .benefits-section--mobile :global(.benefit-card.is-active) :global(.benefit-card__body) {
    inline-size: 100%;
    max-height: none;
    opacity: 1;
    transform: none;
    font-size: clamp(0.95rem, 3.8vw, 1.12rem);
    line-height: 1.42;
  }

  .benefits-section--mobile :global(.benefit-card__heading),
  .benefits-section--mobile :global(.benefit-card.is-active) :global(.benefit-card__heading) {
    max-width: 8ch;
    font-size: clamp(1.25rem, 6vw, 1.72rem);
    line-height: 1.02;
    transform: none;
  }

  .benefits-section--mobile :global(.benefit-card:not(.is-active)) :global(.benefit-card__body) {
    color: rgba(18, 41, 65, 0.82);
  }

  .benefits-section--mobile :global(.benefit-card.is-active) :global(.benefit-card__body) {
    color: rgba(255, 246, 226, 0.9);
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
