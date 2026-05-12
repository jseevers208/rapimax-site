<script>
  // Default partner data — will be overridden by CMS when admins upload real logos
  const defaultPartners = [
    { id: 'tile-1', slot: 'a', name: 'Yamaha Motor CR', tone: '', svg: `<svg viewBox="0 0 120 40" fill="none"><path d="M10 35L25 5h10L50 35h-9l-3-7H22l-3 7H10zm15-14h13L31.5 7 25 21z" fill="currentColor"/><path d="M55 5h12c8 0 13 4 13 10s-5 10-13 10h-3v10h-9V5zm9 14h3c3 0 5-2 5-4s-2-4-5-4h-3v8z" fill="currentColor"/><circle cx="98" cy="20" r="14" stroke="currentColor" stroke-width="3"/><path d="M92 14l12 12M104 14L92 26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>` },
    { id: 'tile-2', slot: 'b', name: 'MotoPlus', tone: '', svg: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2.5"/><path d="M14 30V18l10 8 10-8v12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="14" r="3" fill="currentColor"/></svg>` },
    { id: 'tile-3', slot: 'c', name: 'AutoCentro', tone: '', svg: `<svg viewBox="0 0 48 48" fill="none"><path d="M8 32h32M12 32l4-16h16l4 16" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="17" cy="32" r="4" stroke="currentColor" stroke-width="2"/><circle cx="31" cy="32" r="4" stroke="currentColor" stroke-width="2"/><path d="M20 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>` },
    { id: 'tile-4', slot: 'd', name: 'KR Motors', tone: 'navy', svg: `<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="32" rx="4" stroke="currentColor" stroke-width="2.5"/><path d="M16 16v16M16 24l12-8v16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 16h2v16h-2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>` },
    { id: 'tile-5', slot: 'e', name: 'VeloMax', tone: '', svg: `<svg viewBox="0 0 48 48" fill="none"><path d="M8 36L24 8l16 28" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M15 28h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="20" r="4" stroke="currentColor" stroke-width="2"/></svg>` },
    { id: 'tile-6', slot: 'f', name: 'SeguroMax', tone: '', svg: `<svg viewBox="0 0 48 48" fill="none"><path d="M24 4L6 14v12c0 10 8 16 18 18 10-2 18-8 18-18V14L24 4z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 24l4 4 8-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    { id: 'tile-7', slot: 'g', name: 'FinanMotor', tone: '', svg: `<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="12" width="32" height="24" rx="3" stroke="currentColor" stroke-width="2.5"/><path d="M8 20h32" stroke="currentColor" stroke-width="2.5"/><circle cx="34" cy="30" r="3" fill="currentColor"/><circle cx="27" cy="30" r="3" stroke="currentColor" stroke-width="1.5"/></svg>` },
    { id: 'tile-8', slot: 'h', name: 'Ruta CR', tone: 'arena', svg: `<svg viewBox="0 0 100 48" fill="none"><path d="M10 38c8-20 22-30 40-30s28 10 40 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="16" r="8" stroke="currentColor" stroke-width="2.5"/><path d="M47 16h6M50 13v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M25 30l8-4M75 30l-8-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>` },
    { id: 'tile-9', slot: 'i', name: 'TicoMoto', tone: '', svg: `<svg viewBox="0 0 48 64" fill="none"><circle cx="24" cy="20" r="14" stroke="currentColor" stroke-width="2.5"/><path d="M17 18c2-4 5-6 7-6s5 2 7 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 24h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 34v12M18 40l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    { id: 'tile-10', slot: 'j', name: 'BajaCR', tone: '', svg: `<svg viewBox="0 0 48 64" fill="none"><polygon points="24,4 44,18 38,42 10,42 4,18" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><polygon points="24,14 34,22 30,36 18,36 14,22" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="24" cy="26" r="4" fill="currentColor"/></svg>` },
    { id: 'tile-11', slot: 'k', name: 'ProRider', tone: 'dark-navy', svg: `<svg viewBox="0 0 48 48" fill="none"><circle cx="16" cy="32" r="10" stroke="currentColor" stroke-width="2.5"/><circle cx="36" cy="32" r="10" stroke="currentColor" stroke-width="2.5"/><path d="M16 22l8-12h12l-4 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="32" r="3" fill="currentColor"/><circle cx="36" cy="32" r="3" fill="currentColor"/></svg>` },
    { id: 'tile-12', slot: 'l', name: 'GrupoCR Auto', tone: '', svg: `<svg viewBox="0 0 100 48" fill="none"><rect x="8" y="8" width="84" height="32" rx="6" stroke="currentColor" stroke-width="2.5"/><path d="M24 16v16M24 24h16M40 16v16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="64" cy="24" r="10" stroke="currentColor" stroke-width="2.5"/><path d="M60 24h8M64 20v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>` },
    { id: 'tile-13', slot: 'm', name: 'MotoVerde', tone: '', svg: `<svg viewBox="0 0 48 48" fill="none"><path d="M24 6l4 12h12l-10 7 4 13-10-8-10 8 4-13-10-7h12l4-12z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>` },
  ];

  let partners = defaultPartners;
</script>

<section class="section partners-showroom">
  <div class="partners-shell">
    <header class="partners-header">
      <h2 class="section-title">Con quienes trabajamos</h2>
    </header>

    <div class="partners-bento" role="list" aria-label="Aliados">
      {#each partners as tile, index (tile.id)}
        <article
          class={`partner-card partner-card--slot-${tile.slot} ${tile.tone ? `partner-card--tone-${tile.tone}` : ''}`}
          role="listitem"
          aria-label={`Logo de ${tile.name}`}
          title={tile.name}
        >
          <span class="partner-logo" aria-hidden="true">
            {@html tile.svg}
          </span>
          <span class="partner-name">{tile.name}</span>
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

  .partner-name {
    position: absolute;
    bottom: clamp(6px, 0.6vw, 12px);
    left: 50%;
    transform: translateX(-50%);
    font-size: clamp(0.55rem, 0.6vw, 0.72rem);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(18, 41, 65, 0.35);
    white-space: nowrap;
    z-index: 2;
  }

  .partner-card--tone-navy .partner-name,
  .partner-card--tone-dark-navy .partner-name {
    color: rgba(255, 246, 226, 0.35);
  }

  .partner-card--tone-arena .partner-name {
    color: rgba(18, 41, 65, 0.4);
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
