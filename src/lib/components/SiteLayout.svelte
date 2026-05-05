<script>
  import { onMount } from 'svelte';
  import Nav from './Nav.svelte';
  import Footer from './Footer.svelte';
  import NotificationModal from './NotificationModal.svelte';
  import { initSmoothScroll } from '../utils/smoothScroll.js';

  export let page = 'home';
  export let footerSpacing = 'spacious';

  let showModal = false;

  const handleModalClose = () => {
    showModal = false;
  };

  const handleWaitlistOpen = () => {
    showModal = true;
  };

  onMount(() => {
    const teardownSmoothScroll = initSmoothScroll();

    return () => {
      teardownSmoothScroll?.();
    };
  });
</script>

<Nav {page} on:waitlist={handleWaitlistOpen} />

<main class={`site-main site-main--${page}`}>
  <slot />
</main>

<div class={`footer-shell footer-shell--${footerSpacing}`}>
  <Footer {page} />
</div>

<NotificationModal visible={showModal} onClose={handleModalClose} />

<style>
  .site-main {
    display: block;
    position: relative;
  }

  .footer-shell {
    background: var(--c-crema);
  }

  .footer-shell--spacious {
    padding-top: clamp(56px, 12vh, 140px);
  }

  .footer-shell--compact {
    padding-top: clamp(36px, 8vh, 84px);
  }

  @media (max-width: 640px) {
    .footer-shell--spacious {
      padding-top: clamp(30px, 8vh, 72px);
    }

    .footer-shell--compact {
      padding-top: clamp(24px, 7vh, 56px);
    }
  }
</style>
