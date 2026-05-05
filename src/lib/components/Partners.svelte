<script>
  const partnerTiles = [
    { id: 'tile-1', slot: 'a' },
    { id: 'tile-2', slot: 'b' },
    { id: 'tile-3', slot: 'c' },
    { id: 'tile-4', slot: 'd', tone: 'navy' },
    { id: 'tile-5', slot: 'e' },
    { id: 'tile-6', slot: 'f' },
    { id: 'tile-7', slot: 'g' },
    { id: 'tile-8', slot: 'h', tone: 'arena' },
    { id: 'tile-9', slot: 'i' },
    { id: 'tile-10', slot: 'j' },
    { id: 'tile-11', slot: 'k', tone: 'dark-navy' },
    { id: 'tile-12', slot: 'l' },
    { id: 'tile-13', slot: 'm' }
  ];
</script>

<section class="section partners-showroom">
  <div class="partners-shell">
    <header class="partners-header">
      <h2 class="section-title">Con quienes trabajamos</h2>
    </header>

    <div class="partners-bento" role="list" aria-label="Aliados">
      {#each partnerTiles as tile, index (tile.id)}
        <article
          class={`partner-card partner-card--slot-${tile.slot} ${tile.tone ? `partner-card--tone-${tile.tone}` : ''}`}
          role="listitem"
          aria-label={`Logo de aliado ${index + 1}`}
        >
          <span class="partner-logo" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="5" />
              <ellipse cx="16" cy="16" rx="12" ry="6.4" />
            </svg>
          </span>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .partners-showroom {
    width: 100%;
    height: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: clamp(24px, 2vw, 36px) 0 clamp(28px, 3vw, 48px);
    background: var(--c-warm-gray);
    position: relative;
    isolation: isolate;
    border-radius: inherit;
    border-bottom-left-radius: var(--layer-seam-radius);
    border-bottom-right-radius: var(--layer-seam-radius);
    border: 1px solid rgba(255, 255, 255, 0.24);
    box-shadow: 0 26px 52px rgba(1, 13, 40, 0.24);
    overflow: clip;
    z-index: 2;
  }

  .partners-showroom::before {
    content: none;
  }

  .partners-showroom::after {
    content: none;
  }

  .partners-shell {
    width: min(1360px, 98vw);
    margin: 0 auto;
    position: relative;
    z-index: 1;
    display: grid;
    gap: clamp(16px, 1.8vw, 24px);
    padding: 0 clamp(12px, 1.8vw, 22px) clamp(16px, 1.8vw, 28px);
  }

  .partners-header {
    display: grid;
    justify-items: center;
    text-align: center;
    gap: 0;
    padding-inline: clamp(10px, 2vw, 24px);
    position: relative;
    z-index: 1;
  }

  .partners-header :global(.section-title) {
    margin: 0;
  }

  .partners-bento {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-template-rows: repeat(3, clamp(118px, 10.4vw, 170px));
    gap: clamp(10px, 0.95vw, 16px);
    position: relative;
    z-index: 1;
  }

  .partner-card {
    position: relative;
    border-radius: clamp(14px, 1.2vw, 22px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(18, 41, 65, 0.08);
    background: #ffffff;
    transition: transform 180ms ease;
    overflow: hidden;
    isolation: isolate;
  }

  .partner-card::before {
    content: none;
  }

  .partner-card:hover {
    transform: translateY(-2px);
  }

  .partner-card--tone-navy {
    background: var(--c-navy);
    border-color: rgba(1, 13, 40, 0.5);
  }

  .partner-card--tone-arena {
    background: var(--c-arena);
    border-color: rgba(141, 114, 71, 0.5);
  }

  .partner-card--tone-dark-navy {
    background: var(--c-navy-dark);
    border-color: rgba(1, 13, 40, 0.62);
  }

  .partner-card--tone-navy::before,
  .partner-card--tone-arena::before,
  .partner-card--tone-dark-navy::before {
    content: none;
  }

  .partner-card--tone-navy .partner-logo,
  .partner-card--tone-dark-navy .partner-logo {
    color: var(--c-cream);
  }

  .partner-card--slot-a {
    grid-column: 1 / span 2;
    grid-row: 1;
  }

  .partner-card--slot-b {
    grid-column: 3;
    grid-row: 1;
  }

  .partner-card--slot-c {
    grid-column: 4;
    grid-row: 1;
  }

  .partner-card--slot-d {
    grid-column: 5;
    grid-row: 1;
  }

  .partner-card--slot-e {
    grid-column: 6;
    grid-row: 1;
  }

  .partner-card--slot-f {
    grid-column: 1;
    grid-row: 2;
  }

  .partner-card--slot-g {
    grid-column: 2;
    grid-row: 2;
  }

  .partner-card--slot-h {
    grid-column: 3 / span 2;
    grid-row: 2;
  }

  .partner-card--slot-i {
    grid-column: 5;
    grid-row: 2 / span 2;
  }

  .partner-card--slot-j {
    grid-column: 6;
    grid-row: 2 / span 2;
  }

  .partner-card--slot-k {
    grid-column: 1;
    grid-row: 3;
  }

  .partner-card--slot-l {
    grid-column: 2 / span 2;
    grid-row: 3;
  }

  .partner-card--slot-m {
    grid-column: 4;
    grid-row: 3;
  }

  .partner-logo {
    width: clamp(42px, 3vw, 68px);
    height: clamp(42px, 3vw, 68px);
    color: #122941;
    position: relative;
    z-index: 1;
  }

  .partner-logo svg {
    width: 100%;
    height: 100%;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (max-width: 1100px) {
    .partners-bento {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-auto-rows: clamp(104px, 16vw, 136px);
      grid-template-rows: none;
    }

    .partner-card {
      grid-column: span 1;
      grid-row: span 1;
    }

    .partner-card--slot-a,
    .partner-card--slot-h,
    .partner-card--slot-l {
      grid-column: span 2;
    }

    .partner-card--slot-i,
    .partner-card--slot-j {
      grid-row: span 2;
    }
  }

  @media (max-width: 720px) {
    .partners-showroom {
      padding-top: 18px;
      padding-bottom: 24px;
    }

    .partners-bento {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: 108px;
      grid-template-rows: none;
      gap: 10px;
    }

    .partner-card,
    .partner-card--slot-a,
    .partner-card--slot-h,
    .partner-card--slot-l,
    .partner-card--slot-i,
    .partner-card--slot-j {
      grid-column: span 1;
      grid-row: span 1;
    }
  }
</style>
