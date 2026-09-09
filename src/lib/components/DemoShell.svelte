<script context="module">
  import { features } from '../utils/features.js';
  // Mark the document as demo before first paint so the layout offsets apply immediately.
  if (typeof document !== 'undefined' && features.demoBanner) {
    document.documentElement.classList.add('rapimax-demo');
  }
</script>

<script>
  // Loads the demo banner and guided tour ONLY when the demo flag is on.
  // Dynamic imports keep DemoBanner/DemoTour out of the production bundle.
  import { onMount } from 'svelte';

  let Banner = null;
  let Tour = null;
  let tourRef = null;

  onMount(async () => {
    if (!features.demoBanner && !features.demoTour) return;
    const [b, t] = await Promise.all([
      features.demoBanner ? import('./DemoBanner.svelte') : Promise.resolve(null),
      features.demoTour ? import('./DemoTour.svelte') : Promise.resolve(null)
    ]);
    Banner = b?.default ?? null;
    Tour = t?.default ?? null;
  });
</script>

{#if Banner}
  <svelte:component this={Banner} on:tour={() => tourRef?.start()} />
{/if}

{#if Tour}
  <svelte:component this={Tour} bind:this={tourRef} />
{/if}

<style>
  /* Demo layout offsets: the fixed banner takes the top strip; nav and sticky panels move below it. */
  :global(html.rapimax-demo) { --demo-banner-h: 37px; }
  :global(html.rapimax-demo body) { padding-top: var(--demo-banner-h); }
  :global(html.rapimax-demo .nav-wrapper) { top: var(--demo-banner-h); }
  :global(html.rapimax-demo .sticky-panel) {
    top: var(--demo-banner-h);
    height: calc(100vh - var(--demo-banner-h));
  }
  @media (max-width: 640px), (prefers-reduced-motion: reduce) {
    :global(html.rapimax-demo .sticky-panel) { top: 0; height: auto; }
  }
</style>
