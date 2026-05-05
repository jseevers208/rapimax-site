<script>
  import { onMount, tick } from 'svelte';
  import SiteLayout from './lib/components/SiteLayout.svelte';
  import Hero from './lib/components/Hero.svelte';

  let WhosRapimax;
  let FinancingOptions;
  let HowItWorks;
  let WhyRapiMax;
  let Partners;
  let PartnerMap;
  let whosTarget;
  let financingTarget;
  let howItWorksTarget;
  let whyTarget;
  let partnersTarget;
  let partnerMapTarget;

  const loadWhosRapimax = async () => {
    if (WhosRapimax) return;
    const module = await import('./lib/components/WhosRapimax.svelte');
    WhosRapimax = module.default;
  };

  const loadFinancingOptions = async () => {
    if (FinancingOptions) return;
    const module = await import('./lib/components/FinancingOptions.svelte');
    FinancingOptions = module.default;
  };

  const loadHowItWorks = async () => {
    if (HowItWorks) return;
    const module = await import('./lib/components/HowItWorks.svelte');
    HowItWorks = module.default;
  };

  const loadWhyRapiMax = async () => {
    if (WhyRapiMax) return;
    const module = await import('./lib/components/WhyRapiMax.svelte');
    WhyRapiMax = module.default;
  };

  const loadPartners = async () => {
    if (Partners) return;
    const module = await import('./lib/components/Partners.svelte');
    Partners = module.default;
  };

  const loadPartnerMap = async () => {
    if (PartnerMap) return;
    const module = await import('./lib/components/PartnerMap.svelte');
    PartnerMap = module.default;
  };

  const waitForNextFrame = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });

  const homeHashLoaders = {
    '#requisitos': [loadWhosRapimax],
    '#servicios': [loadFinancingOptions],
    '#alianzas': [loadPartners, loadPartnerMap]
  };

  const scrollToHashTarget = async (hash = window.location.hash) => {
    if (!hash) return false;

    const target = document.querySelector(hash);
    if (!target) return false;

    target.scrollIntoView({ behavior: 'auto', block: 'start' });
    return true;
  };

  const syncHashTarget = async (hash = window.location.hash) => {
    if (!hash) return;

    const loaders = homeHashLoaders[hash] ?? [];
    await Promise.all(loaders.map((load) => load()));
    await tick();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (await scrollToHashTarget(hash)) return;
      await waitForNextFrame();
    }
  };

  const setupLazyObservers = () => {
    const entries = [
      { el: whosTarget, load: loadWhosRapimax, rootMargin: '400px 0px' },
      { el: financingTarget, load: loadFinancingOptions, rootMargin: '300px 0px' },
      { el: howItWorksTarget, load: loadHowItWorks, rootMargin: '900px 0px' },
      { el: whyTarget, load: loadWhyRapiMax, rootMargin: '1200px 0px' },
      { el: partnersTarget, load: loadPartners, rootMargin: '450px 0px' },
      { el: partnerMapTarget, load: loadPartnerMap, rootMargin: '700px 0px' }
    ].filter(({ el }) => Boolean(el));

    if (!entries.length) return () => {};

    if (!('IntersectionObserver' in window)) {
      entries.forEach(({ load }) => load());
      return () => {};
    }

    const observers = entries.map(({ el, load, rootMargin }) => {
      const observer = new IntersectionObserver(
        (items) => {
          items.forEach((item) => {
            if (!item.isIntersecting) return;
            load();
            observer.unobserve(item.target);
          });
        },
        { rootMargin }
      );

      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer.disconnect());
  };

  onMount(() => {
    const teardown = setupLazyObservers();
    const handleHashChange = () => {
      void syncHashTarget();
    };

    void syncHashTarget();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      teardown?.();
    };
  });
</script>

<SiteLayout page="home" footerSpacing="spacious">
  <Hero />

  <div class="scroll-layer scroll-layer--whos">
    <div class="sticky-panel sticky-panel--whos">
      {#if WhosRapimax}
        <svelte:component this={WhosRapimax} />
      {:else}
        <div class="lazy-placeholder lazy-placeholder--whos section" bind:this={whosTarget} aria-hidden="true"></div>
      {/if}
    </div>
  </div>

  <div class="scroll-layer scroll-layer--financing">
    <div class="sticky-panel sticky-panel--financing">
      {#if FinancingOptions}
        <svelte:component this={FinancingOptions} />
      {:else}
        <div class="lazy-placeholder lazy-placeholder--financing section" bind:this={financingTarget} aria-hidden="true"></div>
      {/if}
    </div>
  </div>

  <div class="scroll-layer scroll-layer--how-it-works">
    <div class="sticky-panel sticky-panel--how-it-works">
      {#if HowItWorks}
        <svelte:component this={HowItWorks} />
      {:else}
        <div class="lazy-placeholder lazy-placeholder--how-it-works section" bind:this={howItWorksTarget} aria-hidden="true"></div>
      {/if}
    </div>
  </div>

  <div class="scroll-layer scroll-layer--why">
    <div class="sticky-panel sticky-panel--why">
      {#if WhyRapiMax}
        <svelte:component this={WhyRapiMax} />
      {:else}
        <div class="lazy-placeholder lazy-placeholder--why section" bind:this={whyTarget} aria-hidden="true"></div>
      {/if}
    </div>
  </div>

  <div class="scroll-layer scroll-layer--partners">
    <div class="sticky-panel sticky-panel--partners">
      {#if Partners}
        <svelte:component this={Partners} />
      {:else}
        <div class="lazy-placeholder section" bind:this={partnersTarget} aria-hidden="true"></div>
      {/if}
    </div>
  </div>

  <div class="scroll-layer scroll-layer--partner-map">
    <div class="sticky-panel sticky-panel--partner-map">
      {#if PartnerMap}
        <svelte:component this={PartnerMap} />
      {:else}
        <div class="lazy-placeholder section" bind:this={partnerMapTarget} aria-hidden="true"></div>
      {/if}
    </div>
  </div>
</SiteLayout>

<style>
  .lazy-placeholder {
    min-height: 160px;
    height: auto;
  }

  .scroll-layer--whos .lazy-placeholder--whos {
    min-height: 260px;
  }

  .scroll-layer--partners .lazy-placeholder {
    min-height: calc(100vh + (var(--layer-seam-radius) * 2));
  }

  .scroll-layer--financing .lazy-placeholder,
  .scroll-layer--how-it-works .lazy-placeholder,
  .scroll-layer--why .lazy-placeholder {
    min-height: 72vh;
  }

  .scroll-layer--partner-map .lazy-placeholder {
    min-height: 100vh;
  }

  @media (max-width: 640px), (prefers-reduced-motion: reduce) {
    .scroll-layer--whos .lazy-placeholder,
    .scroll-layer--partners .lazy-placeholder,
    .scroll-layer--partner-map .lazy-placeholder {
      min-height: 220px;
    }
  }

</style>
