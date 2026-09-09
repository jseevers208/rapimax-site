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
    // The home page uses stacked sticky layers tuned to exact viewport heights: leave its layout untouched.
    if (features.demoBanner && !document.querySelector('.scroll-layer')) {
      document.documentElement.classList.add('rapimax-demo-pad');
    }
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
  /* The fixed banner floats over the page like the nav does; the nav moves below it. */
  :global(html.rapimax-demo) { --demo-banner-h: 37px; }
  :global(html.rapimax-demo .nav-wrapper) { top: var(--demo-banner-h); }
  /* Pages without the layered home scroll get a top offset so nothing hides under the banner. */
  :global(html.rapimax-demo.rapimax-demo-pad body) { padding-top: var(--demo-banner-h); }
</style>
