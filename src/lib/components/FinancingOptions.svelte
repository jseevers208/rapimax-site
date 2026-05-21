<script>
  import { onDestroy, onMount } from 'svelte';
  import imageSelfApplication from '../../assets/solutions/image1.webp';
  import imageAuthorizedRetailer from '../../assets/solutions/image2.webp';
  import imageSelfApplicationHover from '../../assets/solutions/image3.webp';
  import imageAuthorizedRetailerHover from '../../assets/solutions/image4.webp';

  const REVEAL_DELAY_MS = 160;
  const CENTER_POSITION = '50%';
  const ZERO_RADIUS = '0px';
  const REVEAL_RADIUS_PADDING = 24;

  const options = [
    {
      title: 'A través de agencias aliadas',
      body: 'Elegí tu vehículo en una de nuestras agencias y aplicá a financiamiento con RapiMax.',
      cta: 'Financiá ahora',
      href: '/contactanos',
      image: imageAuthorizedRetailer,
      hoverImage: imageAuthorizedRetailerHover,
      imagePosition: 'center center',
      hoverImagePosition: 'center center',
      layout: 'default'
    },
    {
      title: 'Vehículo por cuenta propia',
      body: 'Si ya encontraste el vehículo que querés comprar, también podemos estructurar el financiamiento.',
      cta: 'Solicitá financiamiento',
      href: '/contactanos',
      image: imageSelfApplication,
      hoverImage: imageSelfApplicationHover,
      imagePosition: 'center center',
      hoverImagePosition: 'center center',
      layout: 'mirrored'
    }
  ];

  const createCardState = () => ({
    revealX: CENTER_POSITION,
    revealY: CENTER_POSITION,
    revealRadius: ZERO_RADIUS,
    isRevealed: false,
    isResettingOrigin: false
  });

  let cardStates = options.map(() => createCardState());
  let revealTimers = options.map(() => null);
  let collapseFrames = options.map(() => []);
  let prefersReducedMotion = false;
  let reducedMotionQuery;

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

  onMount(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncReducedMotion = () => {
      prefersReducedMotion = reducedMotionQuery.matches;
    };

    syncReducedMotion();
    reducedMotionQuery.addEventListener?.('change', syncReducedMotion);

    return () => {
      reducedMotionQuery?.removeEventListener?.('change', syncReducedMotion);
    };
  });

  onDestroy(() => {
    revealTimers.forEach((timer) => timer && clearTimeout(timer));
    collapseFrames.forEach((frames) => frames.forEach((frame) => cancelAnimationFrame(frame)));
  });
</script>

<section id="servicios" class="section financing-options" aria-labelledby="financing-options-title">
  <div class="financing-options__shell">
    <header class="financing-options__header">
      <h2 class="section-title financing-options__title" id="financing-options-title">
        Dos formas de financiar tu vehículo
      </h2>
    </header>

    <div class="financing-options__container">
      <div class="financing-options__rows">
        {#each options as option, index}
          <article class={`financing-option-row financing-option-row--${option.layout}`}>
            <div
              class="financing-option__media-card"
              class:is-revealed={cardStates[index].isRevealed}
              class:is-resetting-origin={cardStates[index].isResettingOrigin}
              style={`--financing-reveal-x: ${cardStates[index].revealX}; --financing-reveal-y: ${cardStates[index].revealY}; --financing-reveal-radius: ${cardStates[index].revealRadius};`}
              on:pointerenter={(event) => handlePointerEnter(index, event)}
              on:pointermove={(event) => handlePointerMove(index, event)}
              on:pointerleave={(event) => handlePointerLeave(index, event)}
            >
              <div class="financing-option__media" aria-hidden="true">
                <img
                  class="financing-option__image financing-option__image--base"
                  src={option.image}
                  alt=""
                  loading="lazy"
                  style={`object-position: ${option.imagePosition};`}
                />
                <img
                  class="financing-option__image financing-option__image--reveal"
                  src={option.hoverImage}
                  alt=""
                  loading="lazy"
                  style={`object-position: ${option.hoverImagePosition};`}
                />
              </div>
            </div>

            <div class="financing-option__content-card">
              <h3 class="financing-option__title">{option.title}</h3>
              <p class="financing-option__body">{option.body}</p>
              <a
                class="btn primary financing-option__button"
                href={option.href}
              >
                {option.cta}
              </a>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .financing-options {
    background: var(--c-crema);
    padding: clamp(44px, 6vw, 72px) 0 clamp(96px, 12vw, 160px);
  }

  .financing-options__shell {
    width: min(1280px, 96vw);
    margin: 0 auto;
    padding: 0;
    display: grid;
    gap: clamp(36px, 5vw, 72px);
  }

  .financing-options__container {
    width: 100%;
    margin: 0 auto;
    padding: clamp(28px, 3.2vw, 42px);
    border-radius: clamp(24px, 2.5vw, 36px);
    background: var(--c-warm-gray);
    border: 1px solid rgba(18, 41, 65, 0.14);
    box-shadow: 0 18px 30px rgba(5, 15, 34, 0.08);
  }

  .financing-options__header {
    width: min(920px, 100%);
    margin: 0 auto;
    display: grid;
    justify-items: center;
  }

  .financing-options__title {
    width: min(18ch, 100%);
    margin: 0;
    text-align: center;
    text-wrap: balance;
    font-size: clamp(1.9rem, 2vw + 1rem, 3rem);
    color: var(--c-navy);
  }

  .financing-options__rows {
    width: 100%;
    margin: 0 auto;
    display: grid;
    gap: clamp(56px, 8vw, 112px);
  }

  .financing-option-row {
    display: grid;
    grid-template-columns: minmax(0, 1.06fr) minmax(0, 0.94fr);
    grid-template-areas: 'media content';
    align-items: stretch;
    gap: clamp(18px, 2vw, 30px);
  }

  .financing-option-row--mirrored {
    grid-template-areas: 'content media';
  }

  .financing-option__media-card {
    grid-area: media;
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: clamp(18px, 2vw, 28px);
    overflow: hidden;
    isolation: isolate;
    border: 1px solid rgba(18, 41, 65, 0.12);
    box-shadow: 0 22px 40px rgba(1, 13, 40, 0.2);
    transition: transform 220ms ease, box-shadow 220ms ease;
    transform-origin: center;
  }

  .financing-option__media-card:hover {
    transform: scale(1.018);
    box-shadow: 0 26px 44px rgba(1, 13, 40, 0.24);
  }

  .financing-option__media {
    position: absolute;
    inset: 0;
  }

  .financing-option__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .financing-option__image--reveal {
    clip-path: circle(0px at var(--financing-reveal-x, 50%) var(--financing-reveal-y, 50%));
    transition: clip-path 480ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: clip-path;
  }

  .financing-option__media-card.is-revealed .financing-option__image--reveal {
    clip-path: circle(var(--financing-reveal-radius, 0px) at var(--financing-reveal-x, 50%) var(--financing-reveal-y, 50%));
  }

  .financing-option__media-card.is-resetting-origin .financing-option__image--reveal {
    transition: none;
  }

  .financing-option__content-card {
    grid-area: content;
    display: grid;
    align-content: center;
    height: 100%;
    gap: clamp(12px, 1.4vw, 20px);
    padding: clamp(24px, 2.4vw, 38px);
  }

  .financing-option__title {
    margin: 0;
    max-width: 18ch;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(1.3rem, 1vw + 1rem, 1.95rem);
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .financing-option__body {
    margin: 0;
    width: min(42ch, 100%);
    color: rgba(18, 41, 65, 0.86);
    font-size: clamp(1.08rem, 0.3vw + 1rem, 1.18rem);
    line-height: 1.55;
    text-wrap: pretty;
  }

  .financing-option__button {
    justify-self: start;
    width: fit-content;
    padding-inline: 18px;
    white-space: nowrap;
    font-size: 0.96rem;
    background: transparent;
    border-color: var(--c-navy);
    color: var(--c-navy);
    box-shadow: none;
    transition: color 240ms ease, border-color 240ms ease, background-color 240ms ease;
  }



  @media (max-width: 1100px) {
    .financing-options__shell {
      width: min(1280px, 96vw);
    }
  }

  @media (max-width: 860px) {
    .financing-options {
      padding-top: clamp(28px, 6vw, 40px);
      padding-bottom: clamp(40px, 8vw, 64px);
    }

    .financing-option-row,
    .financing-option-row--mirrored {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'media'
        'content';
    }

    .financing-option__copy {
      text-align: center;
      align-items: center;
    }

    .financing-option__body {
      text-align: center;
    }

    .financing-option__button {
      justify-self: center;
    }
  }

  @media (max-width: 560px) {
    .financing-options__container {
      padding: 20px 14px;
    }

    .financing-options__title {
      width: min(14ch, 100%);
    }

    .financing-options__rows {
      gap: 28px;
    }

    .financing-option__button {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .financing-option__media-card {
      transition: box-shadow 180ms ease;
    }

    .financing-option__media-card:hover {
      transform: none;
    }

    .financing-option__image--reveal {
      clip-path: none;
      opacity: 0;
      transition: opacity 180ms ease;
    }

    .financing-option__media-card.is-revealed .financing-option__image--reveal {
      opacity: 1;
    }
  }
</style>


