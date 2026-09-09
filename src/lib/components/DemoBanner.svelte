<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="demo-banner" role="status" aria-label="Ambiente de demostración">
  <div class="demo-banner__inner">
    <span class="demo-banner__dot" aria-hidden="true"></span>
    <span class="demo-banner__label">Ambiente demo</span>
    <span class="demo-banner__sep" aria-hidden="true">·</span>
    <span class="demo-banner__text">Datos ficticios. Funcionalidad completa de la plataforma RapiMax.</span>
    <button type="button" class="demo-banner__cta" on:click={() => dispatch('tour')}>
      Iniciar recorrido
    </button>
  </div>
</div>

<style>
  .demo-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--demo-banner-h, 37px);
    box-sizing: border-box;
    z-index: 10001;
    background: var(--c-navy-deep, #010d28);
    color: rgba(255, 246, 226, 0.92);
    font-size: 0.82rem;
    letter-spacing: 0.01em;
    border-bottom: 1px solid rgba(213, 181, 132, 0.35);
  }

  .demo-banner__inner {
    max-width: 1340px;
    margin: 0 auto;
    height: 100%;
    padding: 0 clamp(14px, 3vw, 28px);
    display: flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
    overflow: hidden;
  }

  .demo-banner__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c-sand, #d5b584);
    box-shadow: 0 0 0 0 rgba(213, 181, 132, 0.6);
    animation: demo-pulse 2.2s ease-out infinite;
  }

  .demo-banner__label {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
    color: var(--c-sand, #d5b584);
  }

  .demo-banner__sep { opacity: 0.5; }

  .demo-banner__text { opacity: 0.85; }

  .demo-banner__cta {
    margin-left: auto;
    appearance: none;
    border: 1px solid rgba(213, 181, 132, 0.6);
    background: rgba(213, 181, 132, 0.12);
    color: #fff6e2;
    font: inherit;
    font-weight: 700;
    font-size: 0.78rem;
    padding: 4px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
  }

  .demo-banner__cta:hover {
    background: rgba(213, 181, 132, 0.28);
    border-color: var(--c-sand, #d5b584);
    transform: translateY(-1px);
  }

  @keyframes demo-pulse {
    0% { box-shadow: 0 0 0 0 rgba(213, 181, 132, 0.55); }
    70% { box-shadow: 0 0 0 8px rgba(213, 181, 132, 0); }
    100% { box-shadow: 0 0 0 0 rgba(213, 181, 132, 0); }
  }

  @media (max-width: 640px) {
    .demo-banner__text { display: none; }
    .demo-banner__sep { display: none; }
  }
</style>
