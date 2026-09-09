<script>
  // Loads the demo banner and guided tour ONLY when the demo flag is on.
  // Dynamic imports keep DemoBanner/DemoTour out of the production bundle.
  import { onMount } from 'svelte';
  import { features } from '../utils/features.js';

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

{#if features.demoBanner}
  <div class="demo-shell" aria-hidden={Banner ? 'false' : 'true'}>
    {#if Banner}
      <svelte:component this={Banner} on:tour={() => tourRef?.start()} />
    {/if}
  </div>
{/if}

{#if Tour}
  <svelte:component this={Tour} bind:this={tourRef} />
{/if}

<style>
  /* Reserve the banner height so the page does not shift when it mounts. */
  .demo-shell { min-height: 37px; background: #010d28; }
</style>
