<script>
  import { onDestroy, onMount } from 'svelte';

  const sentenceOneWords =
    'RapiMax ofrece soluciones ágiles y flexibles de financiamiento de activos, trabajando junto a socios comerciales y agencias.'
      .split(' ');

  const sentenceTwoWords =
    'Formamos parte de Nacascolo Holdings, un grupo empresarial sólido que respalda nuestra visión de crecimiento.'
      .split(' ');
  const sentenceTwoHighlightWords = new Set(['Nacascolo', 'Holdings,']);

  const STATIC_LAYOUT_QUERY = '(prefers-reduced-motion: reduce)';
  const SENTENCE_ONE_SCROLL_RANGE = { start: 0.06, end: 0.3 };
  const SENTENCE_TWO_SCROLL_RANGE = { start: 0.36, end: 0.65 };
  const EPSILON = 0.0001;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  let sectionEl;
  let sentenceOneEl;
  let sentenceTwoEl;
  let staticLayoutMedia;
  let copyLineSyncRafId = null;
  let scrollSyncRafId = null;
  let resizeHandler;
  let scrollHandler;
  let isStaticLayout = false;
  let sentenceOneTokens = [];
  let sentenceTwoTokens = [];
  let sentenceOneLineCount = 0;
  let sentenceTwoLineCount = 0;

  const wordTilt = (node) => {
    const maxTilt = 32;
    const maxScaleBoost = 0.09;
    const interactionPadding = 200;
    const smoothing = 0.2;
    let rafId = null;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let currentScale = 1;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let targetScale = 1;

    const setTargetsFromPointer = (clientX, clientY) => {
      if (isStaticLayout) {
        targetRotateX = 0;
        targetRotateY = 0;
        targetScale = 1;
        return;
      }

      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        targetRotateX = 0;
        targetRotateY = 0;
        targetScale = 1;
        return;
      }

      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const radiusX = rect.width * 0.5 + interactionPadding;
      const radiusY = rect.height * 0.5 + interactionPadding;

      const normalizedX = clamp(dx / Math.max(radiusX, EPSILON), -1, 1);
      const normalizedY = clamp(dy / Math.max(radiusY, EPSILON), -1, 1);
      const ellipseDistance = Math.sqrt(
        (dx * dx) / Math.max(radiusX * radiusX, EPSILON) +
          (dy * dy) / Math.max(radiusY * radiusY, EPSILON)
      );
      const influenceRaw = clamp(1 - ellipseDistance, 0, 1);
      const influence = influenceRaw * influenceRaw * (3 - 2 * influenceRaw);

      targetRotateY = normalizedX * maxTilt * influence;
      targetRotateX = -normalizedY * maxTilt * influence;
      targetScale = 1 + maxScaleBoost * influence;
    };

    const syncTilt = () => {
      currentRotateX += (targetRotateX - currentRotateX) * smoothing;
      currentRotateY += (targetRotateY - currentRotateY) * smoothing;
      currentScale += (targetScale - currentScale) * smoothing;

      node.style.setProperty('--brand-tilt-x', `${currentRotateX.toFixed(2)}deg`);
      node.style.setProperty('--brand-tilt-y', `${currentRotateY.toFixed(2)}deg`);
      node.style.setProperty('--brand-scale', currentScale.toFixed(4));

      const isSettled =
        Math.abs(targetRotateX - currentRotateX) < 0.03 &&
        Math.abs(targetRotateY - currentRotateY) < 0.03 &&
        Math.abs(targetScale - currentScale) < 0.0006;

      if (isSettled) {
        rafId = null;
        return;
      }

      rafId = requestAnimationFrame(syncTilt);
    };

    const scheduleTiltSync = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(syncTilt);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
        return;
      }
      setTargetsFromPointer(event.clientX, event.clientY);
      scheduleTiltSync();
    };

    const resetTargets = () => {
      targetRotateX = 0;
      targetRotateY = 0;
      targetScale = 1;
      scheduleTiltSync();
    };

    const handleFocus = () => {
      if (isStaticLayout) return;
      targetRotateX = 0;
      targetRotateY = 0;
      targetScale = 1 + maxScaleBoost;
      scheduleTiltSync();
    };

    node.style.setProperty('--brand-tilt-x', '0deg');
    node.style.setProperty('--brand-tilt-y', '0deg');
    node.style.setProperty('--brand-scale', '1');
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', resetTargets);
    window.addEventListener('blur', resetTargets);
    node.addEventListener('focus', handleFocus);
    node.addEventListener('blur', resetTargets);

    return {
      destroy() {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerleave', resetTargets);
        window.removeEventListener('blur', resetTargets);
        node.removeEventListener('focus', handleFocus);
        node.removeEventListener('blur', resetTargets);
      }
    };
  };

  const syncLineIndicesFor = (copyNode) => {
    if (!copyNode) return { tokens: [], lineCount: 0 };
    const tokens = Array.from(copyNode.querySelectorAll('.whos-rapimax__copy-token'));
    if (!tokens.length) return { tokens: [], lineCount: 0 };

    let lineIndex = 0;
    let previousTop = null;

    tokens.forEach((token) => {
      const { top } = token.getBoundingClientRect();
      if (previousTop === null) {
        previousTop = top;
      } else if (Math.abs(top - previousTop) > 4) {
        lineIndex += 1;
        previousTop = top;
      }

      token.style.setProperty('--line-index', `${lineIndex}`);
      token.dataset.lineIndex = `${lineIndex}`;
    });

    return { tokens, lineCount: lineIndex + 1 };
  };

  const syncCopyLineIndices = () => {
    const sentenceOneMetrics = syncLineIndicesFor(sentenceOneEl);
    const sentenceTwoMetrics = syncLineIndicesFor(sentenceTwoEl);

    sentenceOneTokens = sentenceOneMetrics.tokens;
    sentenceOneLineCount = sentenceOneMetrics.lineCount;
    sentenceTwoTokens = sentenceTwoMetrics.tokens;
    sentenceTwoLineCount = sentenceTwoMetrics.lineCount;

    scheduleScrollSync();
  };

  const scheduleCopyLineSync = () => {
    if (copyLineSyncRafId !== null) return;
    copyLineSyncRafId = requestAnimationFrame(() => {
      copyLineSyncRafId = null;
      syncCopyLineIndices();
    });
  };

  const getSectionProgress = () => {
    if (!sectionEl) return 0;

    const rect = sectionEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const start = viewportHeight * 0.82;
    const end = viewportHeight * 0.18;
    const totalTravel = Math.max(rect.height + start - end, 1);

    return clamp((start - rect.top) / totalTravel);
  };

  const getRangeProgress = (progress, { start, end }) => {
    if (end <= start) {
      return progress >= end ? 1 : 0;
    }

    return clamp((progress - start) / Math.max(end - start, EPSILON));
  };

  const syncSentenceReveal = (tokens, lineCount, progress) => {
    if (!tokens.length) return;

    if (lineCount <= 1) {
      const singleLineProgress = progress.toFixed(4);
      tokens.forEach((token) => token.style.setProperty('--line-progress', singleLineProgress));
      return;
    }

    tokens.forEach((token) => {
      const lineIndex = Number(token.dataset.lineIndex ?? token.style.getPropertyValue('--line-index') ?? 0);
      const lineStart = lineIndex / lineCount;
      const lineEnd = (lineIndex + 1) / lineCount;
      const lineProgress = clamp((progress - lineStart) / Math.max(lineEnd - lineStart, EPSILON));

      token.style.setProperty('--line-progress', lineProgress.toFixed(4));
    });
  };

  const syncScrollProgress = () => {
    scrollSyncRafId = null;

    if (isStaticLayout) {
      syncSentenceReveal(sentenceOneTokens, sentenceOneLineCount, 1);
      syncSentenceReveal(sentenceTwoTokens, sentenceTwoLineCount, 1);
      return;
    }

    const sectionProgress = getSectionProgress();
    syncSentenceReveal(
      sentenceOneTokens,
      sentenceOneLineCount,
      getRangeProgress(sectionProgress, SENTENCE_ONE_SCROLL_RANGE)
    );
    syncSentenceReveal(
      sentenceTwoTokens,
      sentenceTwoLineCount,
      getRangeProgress(sectionProgress, SENTENCE_TWO_SCROLL_RANGE)
    );
  };

  const scheduleScrollSync = () => {
    if (scrollSyncRafId !== null) return;
    scrollSyncRafId = requestAnimationFrame(syncScrollProgress);
  };

  const updateStaticLayout = () => {
    isStaticLayout = Boolean(staticLayoutMedia?.matches);
    scheduleScrollSync();
  };

  onMount(() => {
    staticLayoutMedia = window.matchMedia(STATIC_LAYOUT_QUERY);

    const handleStaticLayoutChange = () => {
      updateStaticLayout();
    };

    staticLayoutMedia.addEventListener?.('change', handleStaticLayoutChange);
    staticLayoutMedia.addListener?.(handleStaticLayoutChange);
    updateStaticLayout();

    resizeHandler = () => {
      scheduleCopyLineSync();
    };
    scrollHandler = () => {
      scheduleScrollSync();
    };

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scheduleCopyLineSync();
    document.fonts?.ready?.then(() => {
      scheduleCopyLineSync();
    });

    return () => {
      staticLayoutMedia?.removeEventListener?.('change', handleStaticLayoutChange);
      staticLayoutMedia?.removeListener?.(handleStaticLayoutChange);
    };
  });

  onDestroy(() => {
    if (copyLineSyncRafId !== null) {
      cancelAnimationFrame(copyLineSyncRafId);
      copyLineSyncRafId = null;
    }

    if (scrollSyncRafId !== null) {
      cancelAnimationFrame(scrollSyncRafId);
      scrollSyncRafId = null;
    }

    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }

    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
  });
</script>

<section
  id="requisitos"
  class="section whos-rapimax"
  aria-label="Quienes Somos"
  bind:this={sectionEl}
>
  <div class="container">
    <div class="whos-rapimax__layout">
      <div class="whos-rapimax__viewport">
        <p
          class="whos-rapimax__copy whos-rapimax__copy--sentence-1"
          bind:this={sentenceOneEl}
        >
          {#each sentenceOneWords as word, index}
            <span class="whos-rapimax__copy-token" class:whos-rapimax__copy-token--brand={index === 0}>
              {#if index === 0}
                <span class="whos-rapimax__brand-text" use:wordTilt>{word}</span>
              {:else}
                {word}
              {/if}
            </span>{#if index < sentenceOneWords.length - 1}{' '}{/if}
          {/each}
        </p>

        <p
          class="whos-rapimax__copy whos-rapimax__copy--sentence-2"
          bind:this={sentenceTwoEl}
        >
          {#each sentenceTwoWords as word, index}
            <span class="whos-rapimax__copy-token">
              {#if sentenceTwoHighlightWords.has(word)}
                <span class="whos-rapimax__brand-text" use:wordTilt>{word}</span>
              {:else}
                {word}
              {/if}
            </span>{#if index < sentenceTwoWords.length - 1}{' '}{/if}
          {/each}
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .whos-rapimax {
    --whos-container-pad-top: clamp(48px, 8vh, 120px);
    --whos-container-pad-bottom: clamp(64px, 12vh, 180px);
    background: var(--c-crema);
    padding: 0;
  }

  .whos-rapimax .container {
    width: min(1320px, 96vw);
    position: relative;
    z-index: 1;
    min-height: auto;
    padding:
      var(--whos-container-pad-top)
      clamp(18px, 2.2vw, 34px)
      var(--whos-container-pad-bottom)
      clamp(18px, 2.2vw, 34px);
  }

  .whos-rapimax__layout {
    display: grid;
    align-content: start;
    justify-items: center;
  }

  .whos-rapimax__viewport {
    width: min(100%, 760px);
    display: grid;
    gap: clamp(64px, 10vh, 140px);
    justify-items: center;
  }

  .whos-rapimax__copy {
    width: min(100%, 700px);
    margin: 0;
    color: var(--c-navy);
    font-size: clamp(1.9rem, 2vw + 1rem, 3rem);
    font-weight: 700;
    line-height: 1.08;
    text-align: center;
    text-wrap: pretty;
  }

  .whos-rapimax__copy-token {
    --line-progress: 0;
    display: inline-block;
    opacity: var(--line-progress, 0);
    filter: blur(calc((1 - var(--line-progress, 0)) * 12px));
    transform:
      translate3d(0, calc((1 - var(--line-progress, 0)) * 24px), 0)
      scale(calc(0.98 + (var(--line-progress, 0) * 0.02)));
    will-change: opacity, filter, transform;
  }

  .whos-rapimax__brand-text {
    --brand-scale: 1;
    --brand-tilt-x: 0deg;
    --brand-tilt-y: 0deg;
    display: inline-block;
    color: var(--c-arena);
    -webkit-text-fill-color: var(--c-arena);
    transform:
      perspective(700px)
      rotateX(var(--brand-tilt-x))
      rotateY(var(--brand-tilt-y))
      scale(var(--brand-scale));
    transform-style: preserve-3d;
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }

  @media (max-width: 640px), (prefers-reduced-motion: reduce) {
    .whos-rapimax {
      --whos-container-pad-top: clamp(36px, 6vh, 80px);
      --whos-container-pad-bottom: clamp(48px, 10vh, 120px);
    }

    .whos-rapimax__layout {
      width: 100%;
    }

    .whos-rapimax__viewport {
      width: 100%;
      gap: clamp(48px, 8vh, 96px);
    }

    .whos-rapimax__copy {
      width: 100%;
      font-size: clamp(1.9rem, 2vw + 1rem, 3rem);
      line-height: 1.08;
    }

    .whos-rapimax__copy-token {
      opacity: 1 !important;
      filter: none !important;
      transform: none !important;
      transition: none !important;
    }

    .whos-rapimax__brand-text {
      transform: none !important;
      transition: none !important;
      will-change: auto;
    }
  }
</style>
