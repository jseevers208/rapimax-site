<script>
  // Guided tour for the demo environment. No external dependencies.
  //
  // Design notes:
  // - The home page is built with stacked ".scroll-layer" wrappers whose ".sticky-panel"
  //   children pin at the top of the viewport. A layer with a HIGHER z-index than the
  //   previous one covers it (scroll to the layer top). A layer with a LOWER z-index is
  //   revealed when the previous one scrolls away (scroll to the previous layer bottom).
  // - Scrolling goes through Lenis when it is active, otherwise native scrolling. The user can
  //   keep scrolling during the tour; the spotlight re-measures and follows the target.
  // - The spotlight is clamped to the viewport; full-viewport targets get an outline only.
  // - Cross-page steps navigate and resume from sessionStorage.
  import { onMount, onDestroy, tick } from 'svelte';
  import { tourSteps, TOUR_STORAGE_KEY } from '../utils/demoTourSteps.js';
  import { getLenis } from '../utils/smoothScroll.js';

  let active = false;
  let index = 0;
  let rect = null;          // spotlight rect (viewport coords), already clamped
  let fullView = false;     // target fills the viewport: outline only, no dimming
  let cardStyle = '';
  let cardEl;
  let rafId = 0;
  let missingTarget = false;
  let settled = false;      // card is revealed once the scroll and layout have settled
  let timers = [];

  const PAD = 10;
  const CARD_W = 360;
  const EDGE = 8;

  const currentPath = () => window.location.pathname.replace(/\/+$/, '') || '/';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const bannerHeight = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--demo-banner-h');
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  $: step = tourSteps[index];
  $: total = tourSteps.length;

  const persist = (i) => {
    try { sessionStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({ index: i, ts: Date.now() })); } catch {}
  };
  const clearPersist = () => { try { sessionStorage.removeItem(TOUR_STORAGE_KEY); } catch {} };

  const findTarget = () => (step?.selector ? document.querySelector(step.selector) : null);

  // The element to frame: the pinned panel inside a layer, otherwise the element itself.
  const visibleTarget = () => {
    const el = findTarget();
    if (!el) return null;
    return el.querySelector(':scope > .sticky-panel') || el;
  };

  const isFixed = (el) => getComputedStyle(el).position === 'fixed';

  const layerScrollTarget = (el) => {
    const docTop = el.getBoundingClientRect().top + window.scrollY;
    const prev = el.previousElementSibling;
    if (!el.classList.contains('scroll-layer') || !prev || !prev.classList.contains('scroll-layer')) {
      return docTop;
    }
    const z = parseInt(getComputedStyle(el).zIndex, 10) || 0;
    const zPrev = parseInt(getComputedStyle(prev).zIndex, 10) || 0;
    const prevBottom = prev.getBoundingClientRect().bottom + window.scrollY;
    // Lower z-index than the previous layer: it is revealed once the previous layer scrolls out.
    return zPrev > z ? Math.max(docTop, prevBottom) : docTop;
  };

  const scrollTo = (y, duration = 0.9) =>
    new Promise((resolve) => {
      const target = Math.max(0, Math.round(y));
      const lenis = getLenis();
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      if (lenis) {
        lenis.scrollTo(target, { duration, onComplete: finish });
        setTimeout(finish, duration * 1000 + 400);
      } else {
        window.scrollTo({ top: target, behavior: 'smooth' });
        setTimeout(finish, Math.max(400, duration * 800));
      }
    });

  const targetY = (el) => {
    if (el.id === 'inicio') return 0;
    if (el.classList.contains('scroll-layer')) return layerScrollTarget(el);
    const r = el.getBoundingClientRect();
    const offset = bannerHeight() + 88; // banner + floating nav
    const tall = r.height > window.innerHeight - offset - 40;
    return r.top + window.scrollY - (tall ? offset : Math.max(offset, (window.innerHeight - r.height) / 2));
  };

  // Sections above the target mount lazily while scrolling and grow, which moves the target.
  // Scroll, let the layout settle, recompute, and repeat until the position converges.
  const scrollToStep = async () => {
    const el = findTarget();
    if (!el || isFixed(el)) return;
    for (let pass = 0; pass < 4; pass += 1) {
      const y = Math.max(0, Math.round(targetY(el)));
      if (Math.abs(y - window.scrollY) < 6) break;
      await scrollTo(y, pass === 0 ? 0.9 : 0.45);
      if (pass === 0) { measure(); settled = true; }
      await wait(260);
    }
  };

  const measure = () => {
    const el = visibleTarget();
    if (!el) { rect = null; fullView = false; missingTarget = true; positionCard(); return; }
    missingTarget = false;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top = Math.max(EDGE, r.top - PAD);
    const left = Math.max(EDGE, r.left - PAD);
    const bottom = Math.min(vh - EDGE, r.bottom + PAD);
    const right = Math.min(vw - EDGE, r.right + PAD);
    if (bottom - top < 40 || right - left < 40) {
      rect = null; fullView = false; positionCard(); return;
    }
    rect = { top, left, width: right - left, height: bottom - top };
    fullView = (rect.width * rect.height) / (vw * vh) > 0.72;
    positionCard();
  };

  const positionCard = async () => {
    await tick();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ch = cardEl?.offsetHeight || 220;
    const cw = Math.min(CARD_W, vw - 24);
    let placement = step.placement || 'center';
    if (!rect || fullView || vw < 720 || placement === 'center') placement = 'center';
    let top = 0;
    let left = 0;
    const clampX = (x) => Math.min(Math.max(12, x), vw - cw - 12);
    const clampY = (y) => Math.min(Math.max(bannerHeight() + 12, y), vh - ch - 12);

    if (placement === 'center') {
      top = vh - ch - 24;
      left = (vw - cw) / 2;
    } else if (placement === 'top') {
      top = rect.top - ch - 14;
      left = rect.left + rect.width / 2 - cw / 2;
      if (top < bannerHeight() + 12) top = rect.top + rect.height + 14;
    } else if (placement === 'bottom') {
      top = rect.top + rect.height + 14;
      left = rect.left + rect.width / 2 - cw / 2;
      if (top + ch > vh - 12) top = rect.top - ch - 14;
    } else if (placement === 'left') {
      left = rect.left - cw - 14;
      top = rect.top + rect.height / 2 - ch / 2;
      if (left < 12) left = rect.left + rect.width + 14;
    } else if (placement === 'right') {
      left = rect.left + rect.width + 14;
      top = rect.top + rect.height / 2 - ch / 2;
      if (left + cw > vw - 12) left = rect.left - cw - 14;
    }
    cardStyle = `top:${Math.round(clampY(top))}px;left:${Math.round(clampX(left))}px;width:${cw}px;`;
  };

  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };

  const showStep = async (i) => {
    clearTimers();
    index = i;
    active = true;
    settled = false;
    persist(i);
    // Lazy sections mount on scroll: give the target a moment to exist.
    for (let attempt = 0; attempt < 15 && !findTarget(); attempt += 1) await wait(120);
    await scrollToStep();
    measure();
    settled = true;
    later(measure, 300);
    later(measure, 1000);
  };

  const goTo = async (i) => {
    if (i < 0) return;
    if (i >= total) { finish(); return; }
    const target = tourSteps[i];
    if (target.page !== currentPath()) {
      persist(i);
      window.location.href = target.page;
      return;
    }
    await showStep(i);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const finish = () => {
    clearTimers();
    active = false;
    rect = null;
    fullView = false;
    clearPersist();
  };

  export const start = () => {
    const first = tourSteps.findIndex((s) => s.page === currentPath());
    goTo(first >= 0 ? first : 0);
  };

  const onKey = (e) => {
    if (!active) return;
    if (e.key === 'Escape') finish();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };

  const onViewportChange = () => {
    if (!active) return;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(measure);
  };

  onMount(() => {
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, { passive: true });
    // Resume a tour in progress after a cross-page navigation.
    try {
      const raw = sessionStorage.getItem(TOUR_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const i = Number(saved.index);
        const fresh = Date.now() - (saved.ts || 0) < 10 * 60 * 1000;
        if (Number.isInteger(i) && tourSteps[i] && fresh && tourSteps[i].page === currentPath()) {
          later(() => showStep(i), 500);
        } else {
          clearPersist();
        }
      }
    } catch {}
  });

  onDestroy(() => {
    clearTimers();
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange);
    cancelAnimationFrame(rafId);
  });
</script>

{#if active}
  <div class="tour" aria-live="polite">
    {#if rect}
      <div
        class="tour__spot"
        class:tour__spot--outline={fullView}
        style={`top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;`}
        aria-hidden="true"
      ></div>
    {:else}
      <div class="tour__dim" aria-hidden="true"></div>
    {/if}

    <div class="tour__card" class:tour__card--settled={settled} style={cardStyle} bind:this={cardEl} role="dialog" aria-labelledby="tour-title">
      <div class="tour__meta">
        <span class="tour__badge">Recorrido</span>
        <span class="tour__count">{index + 1} / {total}</span>
      </div>
      <h3 id="tour-title" class="tour__title">{step.title}</h3>
      <p class="tour__body">{step.body}</p>
      {#if missingTarget}
        <p class="tour__note">Esta sección se carga al desplazarse; continuá para verla.</p>
      {/if}
      <div class="tour__progress" aria-hidden="true">
        <span style={`width:${Math.round(((index + 1) / total) * 100)}%`}></span>
      </div>
      <div class="tour__actions">
        <button type="button" class="tour__btn tour__btn--ghost" on:click={finish}>Salir</button>
        <div class="tour__nav">
          <button type="button" class="tour__btn tour__btn--ghost" on:click={prev} disabled={index === 0}>Anterior</button>
          {#if step.final}
            <button type="button" class="tour__btn tour__btn--primary" on:click={finish}>Finalizar</button>
          {:else}
            <button type="button" class="tour__btn tour__btn--primary" on:click={next}>Siguiente</button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .tour { position: fixed; inset: 0; z-index: 10000; pointer-events: none; }

  .tour__dim {
    position: absolute; inset: 0;
    background: rgba(1, 13, 40, 0.62);
    pointer-events: auto;
  }

  .tour__spot {
    position: absolute;
    border-radius: 18px;
    box-shadow: 0 0 0 9999px rgba(1, 13, 40, 0.62), 0 0 0 2px rgba(213, 181, 132, 0.9), 0 18px 48px rgba(1, 13, 40, 0.45);
    transition: top 260ms ease, left 260ms ease, width 260ms ease, height 260ms ease;
    pointer-events: auto;
  }

  /* Full-viewport sections: keep them fully visible, frame them only. */
  .tour__spot--outline {
    box-shadow: inset 0 0 0 3px rgba(213, 181, 132, 0.9), inset 0 0 0 9999px rgba(1, 13, 40, 0.10);
  }

  .tour__card {
    position: absolute;
    pointer-events: auto;
    background: #fff6e2;
    color: #122941;
    border-radius: 18px;
    padding: 18px 20px 16px;
    box-shadow: 0 24px 60px rgba(1, 13, 40, 0.35);
    border: 1px solid rgba(213, 181, 132, 0.5);
    transition: top 260ms ease, left 260ms ease, opacity 220ms ease;
    font-family: inherit;
    opacity: 0;
  }
  .tour__card--settled { opacity: 1; }

  .tour__meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .tour__badge {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: #8a6a3a; background: rgba(213, 181, 132, 0.22); padding: 3px 9px; border-radius: 999px;
  }
  .tour__count { font-size: 0.78rem; color: rgba(18, 41, 65, 0.6); font-weight: 600; }

  .tour__title { margin: 0 0 6px; font-size: 1.12rem; line-height: 1.2; font-weight: 800; letter-spacing: -0.01em; }
  .tour__body { margin: 0; font-size: 0.93rem; line-height: 1.55; color: rgba(18, 41, 65, 0.86); }
  .tour__note { margin: 8px 0 0; font-size: 0.8rem; color: rgba(18, 41, 65, 0.6); font-style: italic; }

  .tour__progress { height: 4px; border-radius: 999px; background: rgba(18, 41, 65, 0.1); margin: 14px 0 12px; overflow: hidden; }
  .tour__progress span { display: block; height: 100%; background: #d5b584; transition: width 260ms ease; }

  .tour__actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .tour__nav { display: flex; gap: 8px; }

  .tour__btn {
    appearance: none; border: 0; font: inherit; font-weight: 700; font-size: 0.86rem;
    padding: 9px 14px; border-radius: 999px; cursor: pointer;
    transition: background 160ms ease, transform 160ms ease, opacity 160ms ease;
  }
  .tour__btn:disabled { opacity: 0.4; cursor: default; }
  .tour__btn--ghost { background: transparent; color: rgba(18, 41, 65, 0.75); }
  .tour__btn--ghost:not(:disabled):hover { background: rgba(18, 41, 65, 0.08); }
  .tour__btn--primary { background: #122941; color: #fff6e2; }
  .tour__btn--primary:hover { background: #010d28; transform: translateY(-1px); }

  @media (max-width: 720px) {
    .tour__card { padding: 16px; }
    .tour__title { font-size: 1.02rem; }
    .tour__body { font-size: 0.88rem; }
  }
</style>
