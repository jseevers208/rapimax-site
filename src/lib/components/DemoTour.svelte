<script>
  // Lightweight guided tour for the demo environment. No external deps.
  // Highlights an element with a spotlight overlay and a positioned card,
  // navigates across pages and resumes from sessionStorage.
  import { onMount, onDestroy, tick } from 'svelte';
  import { tourSteps, TOUR_STORAGE_KEY } from '../utils/demoTourSteps.js';

  let active = false;
  let index = 0;
  let rect = null;          // highlighted element rect (viewport coords)
  let cardStyle = '';
  let cardEl;
  let rafId = 0;
  let missingTarget = false;

  const PAD = 10;
  const CARD_W = 360;

  const currentPath = () => window.location.pathname.replace(/\/+$/, '') || '/';

  $: step = tourSteps[index];
  $: total = tourSteps.length;

  const persist = (i) => {
    try { sessionStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({ index: i, ts: Date.now() })); } catch {}
  };
  const clearPersist = () => { try { sessionStorage.removeItem(TOUR_STORAGE_KEY); } catch {} };

  const findTarget = () => {
    if (!step?.selector) return null;
    return document.querySelector(step.selector);
  };

  const measure = () => {
    const el = findTarget();
    if (!el) { rect = null; missingTarget = true; positionCard(); return; }
    missingTarget = false;
    const r = el.getBoundingClientRect();
    rect = { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
    positionCard();
  };

  const positionCard = async () => {
    await tick();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ch = cardEl?.offsetHeight || 220;
    const cw = Math.min(CARD_W, vw - 24);
    const placement = (!rect || step.placement === 'center' || vw < 720) ? 'center' : step.placement;
    let top = 0, left = 0;

    if (placement === 'center') {
      top = Math.max(16, vh - ch - 24);
      left = Math.max(12, (vw - cw) / 2);
    } else if (placement === 'top') {
      top = Math.max(16, rect.top - ch - 14);
      left = Math.min(Math.max(12, rect.left + rect.width / 2 - cw / 2), vw - cw - 12);
      if (rect.top - ch - 14 < 16) top = Math.min(vh - ch - 16, rect.top + rect.height + 14);
    } else if (placement === 'bottom') {
      top = Math.min(vh - ch - 16, rect.top + rect.height + 14);
      left = Math.min(Math.max(12, rect.left + rect.width / 2 - cw / 2), vw - cw - 12);
    } else if (placement === 'left') {
      left = Math.max(12, rect.left - cw - 14);
      top = Math.min(Math.max(16, rect.top + rect.height / 2 - ch / 2), vh - ch - 16);
    } else if (placement === 'right') {
      left = Math.min(rect.left + rect.width + 14, vw - cw - 12);
      top = Math.min(Math.max(16, rect.top + rect.height / 2 - ch / 2), vh - ch - 16);
    }
    cardStyle = `top:${Math.round(top)}px;left:${Math.round(left)}px;width:${cw}px;`;
  };

  const scrollToTarget = async () => {
    const el = findTarget();
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: step.placement === 'center' ? 'start' : 'center' });
    await new Promise((r) => setTimeout(r, 520));
  };

  const showStep = async (i) => {
    index = i;
    active = true;
    persist(i);
    // Give lazy sections time to mount, then retry a few frames.
    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (findTarget()) break;
      await new Promise((r) => setTimeout(r, 120));
    }
    await scrollToTarget();
    measure();
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
    active = false;
    rect = null;
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
    // Resume if a tour was in progress and we just navigated here.
    try {
      const raw = sessionStorage.getItem(TOUR_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const i = Number(saved.index);
        if (Number.isInteger(i) && tourSteps[i] && tourSteps[i].page === currentPath() && Date.now() - (saved.ts || 0) < 10 * 60 * 1000) {
          setTimeout(() => showStep(i), 400);
        } else if (Number.isInteger(i) && tourSteps[i] && tourSteps[i].page !== currentPath()) {
          clearPersist();
        }
      }
    } catch {}
  });

  onDestroy(() => {
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
        style={`top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;`}
        aria-hidden="true"
      ></div>
    {:else}
      <div class="tour__dim" aria-hidden="true"></div>
    {/if}

    <div class="tour__card" style={cardStyle} bind:this={cardEl} role="dialog" aria-labelledby="tour-title">
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

  .tour__card {
    position: absolute;
    pointer-events: auto;
    background: #fff6e2;
    color: #122941;
    border-radius: 18px;
    padding: 18px 20px 16px;
    box-shadow: 0 24px 60px rgba(1, 13, 40, 0.35);
    border: 1px solid rgba(213, 181, 132, 0.5);
    transition: top 260ms ease, left 260ms ease;
    font-family: inherit;
  }

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
