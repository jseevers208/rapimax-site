<script>
  import { onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  export let visible = false;
  export let onClose = () => {};

  let email        = '';
  let submitted    = false;
  let errorMessage = '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    errorMessage = '';
    if (!emailRegex.test(email)) {
      errorMessage = 'Por favor ingresá un correo electrónico válido.';
      return;
    }
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        submitted = true;
        setTimeout(handleClose, 2400);
      } else {
        errorMessage = result.error || 'Error al registrar.';
      }
    } catch {
      errorMessage = 'Error de conexión. Intentá de nuevo.';
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) handleClose(); };
  const handleKeydown        = (e) => { if (e.key === 'Escape') handleClose(); };
  const handleBackdropKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClose();
    }
  };

  $: if (visible) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }

  onDestroy(() => document.removeEventListener('keydown', handleKeydown));
</script>

{#if visible}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="modal-backdrop"
    on:click={handleBackdropClick}
    on:keydown={handleBackdropKeydown}
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div
      class="modal-card"
      transition:scale={{ duration: 300, easing: cubicOut, start: 0.9 }}
    >
      <button
        class="close-button"
        on:click={handleClose}
        aria-label="Cerrar"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      {#if !submitted}
        <div class="modal-content">
          <h2 id="modal-title" class="modal-title">
            ¡Sé de los primeros en saberlo!
          </h2>
          <p class="modal-text">
            RapiMax está próximo a lanzarse. Dejanos tu correo y te notificaremos cuando estemos listos para revolucionar tu forma de financiar vehículos.
          </p>

          <form on:submit={handleSubmit} class="modal-form">
            <div class="form-field">
              <label for="email" class="visually-hidden">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                bind:value={email}
                required
                aria-required="true"
                aria-invalid={errorMessage ? 'true' : 'false'}
              />
              {#if errorMessage}
                <span class="error-message" role="alert">{errorMessage}</span>
              {/if}
            </div>
            <button type="submit" class="submit-button">
              Notificarme
            </button>
          </form>
        </div>
      {:else}
        <div class="modal-content success">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="modal-title">¡Listo!</h2>
          <p class="modal-text">
            Te notificaremos cuando RapiMax esté disponible. ¡Gracias por tu interés!
          </p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(1, 13, 40, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  }

  .modal-card {
    background: var(--c-navy);
    border: 1px solid rgba(255, 246, 226, 0.12);
    border-radius: var(--radius-l);
    padding: clamp(32px, 5vw, 48px);
    max-width: 540px;
    width: 100%;
    position: relative;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(1, 13, 40, 0.4);
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 246, 226, 0.15);
    color: var(--c-cream);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 200ms ease, transform 200ms ease;
    z-index: 2;
  }

  .close-button:hover,
  .close-button:focus-visible {
    background: rgba(255, 246, 226, 0.25);
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .modal-content {
    display: grid;
    gap: 24px;
    text-align: center;
  }

  .modal-content.success {
    padding: 20px 0;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(213, 181, 132, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    color: var(--c-sand);
  }

  .modal-title {
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(1.8rem, 3vw + 1rem, 2.6rem);
    font-weight: 700;
    margin: 0;
    color: var(--c-cream);
    line-height: 1.2;
  }

  .modal-text {
    font-size: clamp(1rem, 0.5vw + 0.95rem, 1.15rem);
    color: rgba(255, 246, 226, 0.85);
    margin: 0;
    line-height: 1.6;
    max-width: 440px;
    margin-left: auto;
    margin-right: auto;
  }

  .modal-form {
    display: grid;
    gap: 16px;
    margin-top: 8px;
  }

  .form-field {
    display: grid;
    gap: 8px;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  input[type='email'] {
    width: 100%;
    padding: 16px 20px;
    border-radius: var(--radius-s);
    border: 1px solid rgba(255, 246, 226, 0.3);
    background: rgba(255, 246, 226, 0.15);
    color: var(--c-cream);
    font-size: 1rem;
    transition: border-color 200ms ease, background 200ms ease;
  }

  input[type='email']::placeholder {
    color: rgba(255, 246, 226, 0.5);
  }

  input[type='email']:focus {
    outline: none;
    border-color: var(--c-sand);
    background: rgba(255, 246, 226, 0.2);
  }

  input[type='email'][aria-invalid='true'] {
    border-color: rgba(255, 100, 100, 0.6);
  }

  .error-message {
    font-size: 0.9rem;
    color: rgba(255, 150, 150, 0.9);
    text-align: left;
    padding-left: 4px;
  }

  .submit-button {
    width: 100%;
    padding: 16px 32px;
    border-radius: 999px;
    border: none;
    background: var(--c-sand);
    color: var(--c-navy-deep);
    font-weight: 700;
    font-size: 1.05rem;
    cursor: pointer;
    transition: transform 200ms ease, box-shadow 200ms ease;
    box-shadow: 0 8px 20px rgba(213, 181, 132, 0.3);
  }

  .submit-button:hover,
  .submit-button:focus-visible {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(213, 181, 132, 0.4);
  }

  .submit-button:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    .modal-backdrop {
      padding: 16px;
    }

    .modal-card {
      padding: 28px 20px;
    }

    .close-button {
      top: 12px;
      right: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .close-button,
    .submit-button,
    input[type='email'] {
      transition: none;
    }
  }
</style>
