<script>
  import { onDestroy, onMount } from 'svelte';
  import { BakedIconScene } from '../three/bakedIconScene.js';
  import iconAtlasUrl from '../../assets/3d-icons/rapimax-icons.glb?url';

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const steps = [
    {
      iconName: 'howitworks-registration',
      leadLines: ['Aplicá en'],
      highlight: 'Minutos',
      body: 'Iniciá tu solicitud de financiamiento en línea.'
    },
    {
      iconName: 'howitworks-authorized',
      leadLines: ['Preaprobación en menos de'],
      highlight: '1 Hora',
      body: 'Conocé rápidamente si tu solicitud fue aprobada.'
    },
    {
      iconName: 'howitworks-steeringwheel',
      leadLines: ['Estrená tu', 'vehículo en'],
      highlight: '24 Horas',
      body: 'Una vez formalizado el financiamiento, podrás recibir tu vehículo en menos de un día.'
    }
  ];

  const AUTOROTATE_SPEED = 0.00105;
  const AUTOROTATE_RANGE = 0.24;
  const AUTOROTATE_PITCH_RANGE = 0.06;
  const HIGHLIGHT_CYCLE_MS = 2200;
  const STAGED_RENDERER_DELAY_MS = 80;
  const SECTION_PRELOAD_MARGIN = '900px 0px';

  let sectionEl;
  let stepEls = [];
  let iconCanvasEls = [];
  let renderers = steps.map(() => null);
  let webglReady = steps.map(() => false);
  let reduceMotionMedia;
  let touchModeMedia;
  let visibilityObserver;
  let preloadObserver;
  let stagedInitIdleId = null;
  let stagedInitTimeoutId = 0;
  let cleanupReduceMotionListener = () => {};
  let cleanupTouchModeListener = () => {};
  let isSectionVisible = false;
  let isSectionNear = false;
  let reduceMotion = false;
  let isTouchInputMode = false;
  let isUserInteracting = false;
  let highlightCycleIntervalId = null;
  let activeStepIndex = 0;

  const setWebglReadyAtIndex = (index, ready) => {
    webglReady = webglReady.map((value, currentIndex) => (currentIndex === index ? ready : value));
  };

  const setActiveStep = (index) => {
    activeStepIndex = clamp(index, 0, steps.length - 1);
    startRendererWarmup();
  };

  const stopHighlightCycle = () => {
    if (typeof window === 'undefined') return;
    if (!highlightCycleIntervalId) return;
    window.clearInterval(highlightCycleIntervalId);
    highlightCycleIntervalId = null;
  };

  const startHighlightCycle = () => {
    if (typeof window === 'undefined') return;
    if (highlightCycleIntervalId || reduceMotion || isUserInteracting || !isSectionVisible) return;

    highlightCycleIntervalId = window.setInterval(() => {
      setActiveStep((activeStepIndex + 1) % steps.length);
      clearAllPointers();
    }, HIGHLIGHT_CYCLE_MS);
  };

  const syncHighlightCycle = () => {
    stopHighlightCycle();
    startHighlightCycle();
  };

  const setUserInteracting = (value) => {
    const nextValue = Boolean(value);
    if (nextValue === isUserInteracting) return;
    isUserInteracting = nextValue;
    syncHighlightCycle();
  };

  const focusStep = (index) => {
    stepEls[index]?.focus();
  };

  $: {
    renderers.forEach((renderer, index) => {
      renderer?.setHighlighted(index === activeStepIndex);
    });
  }

  const syncRendererPauseState = () => {
    const paused = !isSectionVisible;
    renderers.forEach((renderer) => {
      renderer?.setPaused(paused);
      renderer?.setReducedMotion(reduceMotion);
    });
  };

  const setTouchInputMode = (value) => {
    const nextMode = Boolean(value);
    if (nextMode === isTouchInputMode) return;
    isTouchInputMode = nextMode;

    renderers.forEach((renderer) => {
      renderer?.setAutoRotate(isTouchInputMode);
      renderer?.setPointer(0, 0);
    });
  };

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

  const destroyRenderers = () => {
    cancelStagedRendererInit();
    renderers.forEach((renderer) => renderer?.dispose());
    renderers = steps.map(() => null);
    webglReady = steps.map(() => false);
  };

  const initRendererAtIndex = (index) => {
    if (renderers[index]) return false;

    const canvas = iconCanvasEls[index];
    if (!canvas) return false;

    try {
      const renderer = new BakedIconScene(canvas, iconAtlasUrl, {
        iconName: steps[index].iconName,
        reduceMotion,
        autoRotate: isTouchInputMode,
        autoRotateSpeed: AUTOROTATE_SPEED,
        autoRotateRange: AUTOROTATE_RANGE,
        autoRotatePitchRange: AUTOROTATE_PITCH_RANGE,
        maxPixelRatio: 1.25,
        onReady: () => setWebglReadyAtIndex(index, true),
        onError: () => setWebglReadyAtIndex(index, false)
      });

      renderer.setHighlighted(index === activeStepIndex);
      renderer.setPaused(!isSectionVisible);
      renderers[index] = renderer;
      return true;
    } catch {
      setWebglReadyAtIndex(index, false);
      return false;
    }
  };

  const getRendererInitOrder = () => {
    const order = [activeStepIndex];

    for (let index = 0; index < steps.length; index += 1) {
      if (index !== activeStepIndex) {
        order.push(index);
      }
    }

    return order;
  };

  const scheduleNextRendererInit = () => {
    cancelStagedRendererInit();

    if (!isSectionNear) return;

    const nextIndex = getRendererInitOrder().find((index) => !renderers[index]);
    if (typeof nextIndex !== 'number') return;

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
    if (!isSectionNear) return;
    scheduleNextRendererInit();
  };

  const setRendererPointerFromEvent = (event, index) => {
    if (event.pointerType === 'touch') {
      setTouchInputMode(true);
      return;
    }

    if (isTouchInputMode) {
      setTouchInputMode(false);
    }

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

  const clearAllPointers = () => {
    renderers.forEach((renderer) => renderer?.setPointer(0, 0));
  };

  const handleStepPointerEnter = (event, index) => {
    setUserInteracting(true);
    setActiveStep(index);

    if (event.pointerType === 'touch') {
      setTouchInputMode(true);
      return;
    }

    if (event.pointerType) {
      setTouchInputMode(false);
    }
  };

  const handleStepKeydown = (event, index) => {
    const isInfoButton =
      event.target instanceof HTMLElement && event.target.closest('.how-it-works__info-button');

    if (isInfoButton && (event.key === 'Enter' || event.key === ' ')) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveStep(index);
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % steps.length;
      setActiveStep(nextIndex);
      focusStep(nextIndex);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = (index - 1 + steps.length) % steps.length;
      setActiveStep(nextIndex);
      focusStep(nextIndex);
    }
  };

  onMount(() => {
    if (window?.matchMedia) {
      reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
      reduceMotion = reduceMotionMedia.matches;

      const handleReduceMotionChange = (event) => {
        reduceMotion = event.matches;
        syncRendererPauseState();
        syncHighlightCycle();
        startRendererWarmup();
      };

      reduceMotionMedia.addEventListener('change', handleReduceMotionChange);
      cleanupReduceMotionListener = () =>
        reduceMotionMedia?.removeEventListener('change', handleReduceMotionChange);

      touchModeMedia = window.matchMedia('(pointer: coarse)');
      isTouchInputMode = touchModeMedia.matches;

      const handleTouchModeChange = (event) => {
        setTouchInputMode(event.matches);
      };

      touchModeMedia.addEventListener('change', handleTouchModeChange);
      cleanupTouchModeListener = () =>
        touchModeMedia?.removeEventListener('change', handleTouchModeChange);
    }

    if ('IntersectionObserver' in window && sectionEl) {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isSectionVisible = Boolean(entry?.isIntersecting);
          syncRendererPauseState();
          syncHighlightCycle();
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

    startRendererWarmup();
    syncHighlightCycle();

    return () => {
      visibilityObserver?.disconnect();
      preloadObserver?.disconnect();
      cleanupReduceMotionListener();
      cleanupTouchModeListener();
      stopHighlightCycle();
      destroyRenderers();
    };
  });

  onDestroy(() => {
    stopHighlightCycle();
    destroyRenderers();
  });

  const handleStepFocus = (index) => {
    setUserInteracting(true);
    setActiveStep(index);
  };

  const handleStepBlur = () => {
    if (typeof window === 'undefined') return;

    window.requestAnimationFrame(() => {
      if (sectionEl?.contains(document.activeElement)) return;
      setUserInteracting(false);
    });
  };

  const handleStepsPointerLeave = () => {
    clearAllPointers();
    setUserInteracting(false);
  };
</script>

<section
  class="section how-it-works"
  class:how-it-works--reduced-motion={reduceMotion}
  bind:this={sectionEl}
  aria-labelledby="how-it-works-title"
>
  <div class="how-it-works__shell">
    <h2 class="section-title how-it-works__title" id="how-it-works-title">
      Financiá tu vehículo en tres simples pasos
    </h2>

    <div class="how-it-works__panel">
      <ol class="how-it-works__steps" on:pointerleave={handleStepsPointerLeave}>
        {#each steps as step, index}
          <li
            class="how-it-works__step"
            class:how-it-works__step--active={index === activeStepIndex}
          >
            <div
              class="how-it-works__card"
              role="button"
              tabindex="0"
              aria-pressed={index === activeStepIndex}
              aria-label={`Paso ${index + 1}: ${step.leadLines.join(' ')} ${step.highlight}`}
              bind:this={stepEls[index]}
              on:mouseenter={() => (setUserInteracting(true), setActiveStep(index))}
              on:focus={() => handleStepFocus(index)}
              on:blur={handleStepBlur}
              on:pointerenter={(event) => handleStepPointerEnter(event, index)}
              on:pointermove={(event) => setRendererPointerFromEvent(event, index)}
              on:pointerleave={() => clearRendererPointer(index)}
              on:keydown={(event) => handleStepKeydown(event, index)}
            >
              <span class="how-it-works__step-number" aria-hidden="true">{index + 1}.</span>
              <div class="how-it-works__info-wrap">
                <button
                  type="button"
                  class="how-it-works__info-button"
                  aria-label={`Más información sobre ${step.leadLines.join(' ')} ${step.highlight}`}
                  aria-describedby={`how-it-works-tooltip-${index}`}
                >
                  i
                </button>
                <span
                  class="how-it-works__tooltip"
                  id={`how-it-works-tooltip-${index}`}
                  role="tooltip"
                >
                  {step.body}
                </span>
              </div>

              <h3 class="how-it-works__step-title">
                <span class="how-it-works__step-lead">
                  {#each step.leadLines as line}
                    <span class="how-it-works__step-line">{line}</span>
                  {/each}
                </span>
                <span class="how-it-works__step-media">
                  <canvas
                    class="how-it-works__step-canvas"
                    class:is-hidden={!webglReady[index]}
                    bind:this={iconCanvasEls[index]}
                    aria-hidden="true"
                  ></canvas>

                  {#if !webglReady[index]}
                    <span
                      class="how-it-works__step-fallback"
                      aria-hidden="true"
                    ></span>
                  {/if}
                </span>
                <span class="how-it-works__step-highlight">{step.highlight}</span>
              </h3>
            </div>
          </li>
        {/each}
      </ol>

      <div class="how-it-works__cta-row">
        <a
          class="btn primary how-it-works__cta"
          href="/solicitud"
        >
          Aplicar ahora
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  .how-it-works {
    background: #ffffff;
    padding: clamp(44px, 6vw, 72px) 0 clamp(84px, 10vw, 132px);
  }

  .how-it-works__shell {
    width: min(1280px, 96vw);
    margin: 0 auto;
    padding: 0 clamp(18px, 2.2vw, 34px);
    justify-items: center;
    display: grid;
    gap: clamp(30px, 4vw, 44px);
  }

  .how-it-works__title {
    width: min(20ch, 100%);
    margin: 0 0 clamp(14px, 2vw, 28px);
    color: var(--c-navy);
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    font-size: clamp(1.9rem, 2vw + 1rem, 3rem);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.03em;
    text-align: center;
  }

  .how-it-works__panel {
    width: min(1200px, 100%);
    border-radius: 34px;
    background: var(--c-warm-gray);
    border: 1px solid rgba(18, 41, 65, 0.1);
    box-shadow: 0 22px 42px rgba(1, 13, 40, 0.08);
    padding: clamp(24px, 3.2vw, 44px);
    display: grid;
    gap: clamp(20px, 2.4vw, 30px);
    overflow: visible;
  }

  .how-it-works__steps {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(28px, 3vw, 48px);
    width: min(1080px, 100%);
    margin: 0 auto;
  }

  .how-it-works__steps::before {
    content: '';
    position: absolute;
    top: clamp(136px, 16vw, 176px);
    left: clamp(88px, 9vw, 132px);
    right: clamp(88px, 9vw, 132px);
    border-top: 2px dashed rgba(18, 41, 65, 0.42);
    pointer-events: none;
    z-index: 0;
  }

  .how-it-works__step {
    position: relative;
    z-index: 1;
    min-width: 0;
    display: grid;
    justify-items: center;
    outline: none;
  }

  .how-it-works__card {
    position: relative;
    display: grid;
    align-items: start;
    justify-items: center;
    width: min(100%, 288px);
    min-height: 100%;
    padding: clamp(28px, 3vw, 38px) clamp(20px, 2vw, 28px);
    border: 1px solid rgba(18, 41, 65, 0.1);
    border-radius: 28px;
    background: #ffffff;
    box-shadow: 0 18px 34px rgba(1, 13, 40, 0.09);
    isolation: isolate;
    overflow: visible;
    transform: translateY(0) scale(1);
    transition:
      transform 230ms ease,
      box-shadow 230ms ease,
      background-color 230ms ease,
      border-color 230ms ease;
  }

  .how-it-works__step:hover .how-it-works__card,
  .how-it-works__step--active .how-it-works__card {
    transform: translateY(-2px) scale(1.025);
    background: var(--c-navy);
    border-color: rgba(1, 13, 40, 0.5);
    box-shadow: 0 22px 38px rgba(1, 13, 40, 0.16);
  }

  .how-it-works__card:focus-visible {
    outline: 2px solid rgba(18, 41, 65, 0.35);
    outline-offset: 2px;
  }

  .how-it-works__step-number {
    position: absolute;
    top: 18px;
    left: 20px;
    z-index: 2;
    color: var(--c-navy);
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    transition: color 230ms ease;
  }

  .how-it-works__step:hover .how-it-works__step-number,
  .how-it-works__step--active .how-it-works__step-number {
    color: var(--c-crema);
  }

  .how-it-works__info-wrap {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 3;
    display: grid;
    justify-items: end;
  }

  .how-it-works__info-button {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid rgba(18, 41, 65, 0.14);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.66);
    color: var(--c-navy);
    font-size: 0.92rem;
    font-weight: 700;
    line-height: 1;
    cursor: help;
    transition:
      transform var(--transition-fast),
      box-shadow var(--transition-fast),
      border-color var(--transition-fast),
      background-color var(--transition-fast),
      color var(--transition-fast);
  }

  .how-it-works__step:hover .how-it-works__info-button,
  .how-it-works__step--active .how-it-works__info-button {
    border-color: rgba(255, 246, 226, 0.35);
    background: rgba(255, 246, 226, 0.2);
    color: var(--c-crema);
  }

  .how-it-works__info-button:hover,
  .how-it-works__info-button:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(1, 13, 40, 0.12);
  }

  .how-it-works__info-button:focus-visible {
    outline: none;
  }

  .how-it-works__tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    right: 0;
    width: min(240px, 70vw);
    padding: 12px 14px;
    border-radius: 16px;
    background: #fff6e2;
    color: var(--c-navy);
    font-size: 0.92rem;
    font-weight: 500;
    line-height: 1.45;
    text-align: left;
    box-shadow: 0 16px 34px rgba(1, 13, 40, 0.22);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px);
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast),
      visibility var(--transition-fast);
    pointer-events: none;
    z-index: 3;
  }

  .how-it-works__info-wrap:hover .how-it-works__tooltip,
  .how-it-works__info-wrap:focus-within .how-it-works__tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .how-it-works__step-title {
    position: relative;
    z-index: 1;
    margin: 0;
    display: grid;
    grid-template-rows: auto auto auto;
    justify-items: center;
    gap: clamp(12px, 1.5vw, 18px);
    width: 100%;
    text-align: center;
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
  }

  .how-it-works__step-lead {
    display: grid;
    align-content: start;
    min-height: calc(1.15em * 2);
    color: var(--c-navy);
    font-size: clamp(1.12rem, 0.72vw + 0.96rem, 1.55rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.15;
    text-wrap: balance;
    transition: color 230ms ease;
  }

  .how-it-works__step-line {
    display: block;
  }

  .how-it-works__step-media {
    position: relative;
    width: clamp(84px, 6.4vw, 114px);
    height: clamp(84px, 6.4vw, 114px);
    display: grid;
    place-items: center;
  }

  .how-it-works__step-canvas,
  .how-it-works__step-fallback {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    display: block;
  }

  .how-it-works__step-canvas {
    pointer-events: none;
  }

  .how-it-works__step-canvas.is-hidden {
    visibility: hidden;
    opacity: 0;
  }

  .how-it-works__step-fallback {
    width: 62%;
    height: 62%;
    border-radius: 28%;
    background:
      radial-gradient(circle at 34% 30%, rgba(255, 246, 226, 0.95), rgba(213, 181, 132, 0.24) 34%, transparent 35%),
      linear-gradient(135deg, rgba(18, 41, 65, 0.96), rgba(38, 74, 112, 0.86));
    box-shadow:
      inset 0 0 0 1px rgba(255, 246, 226, 0.24),
      0 10px 18px rgba(1, 13, 40, 0.18);
    transition:
      background 230ms ease,
      box-shadow 230ms ease;
  }

  .how-it-works__step-highlight {
    color: var(--c-navy);
    font-size: clamp(1.85rem, 1.2vw + 1.4rem, 2.8rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    white-space: nowrap;
    align-self: start;
    transition: color 230ms ease;
  }

  .how-it-works__step:hover .how-it-works__step-lead,
  .how-it-works__step--active .how-it-works__step-lead,
  .how-it-works__step:hover .how-it-works__step-highlight,
  .how-it-works__step--active .how-it-works__step-highlight {
    color: var(--c-crema);
  }

  .how-it-works__step:hover .how-it-works__step-fallback,
  .how-it-works__step--active .how-it-works__step-fallback {
    background:
      radial-gradient(circle at 34% 30%, rgba(18, 41, 65, 0.9), rgba(18, 41, 65, 0.16) 34%, transparent 35%),
      linear-gradient(135deg, rgba(255, 246, 226, 0.98), rgba(213, 181, 132, 0.82));
    box-shadow:
      inset 0 0 0 1px rgba(18, 41, 65, 0.12),
      0 12px 22px rgba(1, 13, 40, 0.32);
  }

  .how-it-works__cta.btn.primary {
    min-width: clamp(180px, 22vw, 220px);
    border: 2px solid var(--c-navy);
    background: transparent;
    color: var(--c-navy);
    box-shadow: none;
  }

  .how-it-works__cta.btn.primary:hover,
  .how-it-works__cta.btn.primary:focus-visible {
    background: rgba(18, 41, 65, 0.06);
    color: var(--c-navy);
    box-shadow: 0 10px 22px rgba(18, 41, 65, 0.16);
  }

  .how-it-works__cta-row {
    display: flex;
    justify-content: center;
    margin-bottom: 0;
  }

  .how-it-works--reduced-motion .how-it-works__card,
  .how-it-works--reduced-motion .how-it-works__step-number,
  .how-it-works--reduced-motion .how-it-works__step-lead,
  .how-it-works--reduced-motion .how-it-works__step-highlight,
  .how-it-works--reduced-motion .how-it-works__step-fallback,
  .how-it-works--reduced-motion .how-it-works__info-button {
    transition: none;
  }

  .how-it-works--reduced-motion .how-it-works__step:hover .how-it-works__card,
  .how-it-works--reduced-motion .how-it-works__step--active .how-it-works__card {
    transform: none;
  }

  @media (max-width: 980px) {
    .how-it-works__steps {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .how-it-works__steps::before {
      display: none;
    }
  }

  @media (max-width: 720px) {
    .how-it-works {
      padding: clamp(28px, 6vw, 40px) 0 clamp(64px, 12vw, 88px);
    }

    .how-it-works__shell {
      gap: clamp(24px, 5vw, 32px);
    }

    .how-it-works__panel {
      padding: clamp(18px, 4.2vw, 28px);
      border-radius: 26px;
    }

    .how-it-works__title {
      width: min(15ch, 100%);
      margin-bottom: clamp(10px, 4vw, 18px);
    }

    .how-it-works__steps {
      grid-template-columns: minmax(0, 1fr);
      width: 100%;
    }

    .how-it-works__card {
      width: 100%;
      padding: 28px 20px 24px;
    }

    .how-it-works__tooltip {
      right: 0;
      width: min(220px, calc(100vw - 72px));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .how-it-works__card,
    .how-it-works__step-number,
    .how-it-works__step-lead,
    .how-it-works__step-highlight,
    .how-it-works__step-fallback,
    .how-it-works__info-button {
      transition: none;
    }

    .how-it-works__step:hover .how-it-works__card,
    .how-it-works__step--active .how-it-works__card {
      transform: none;
    }
  }
</style>
