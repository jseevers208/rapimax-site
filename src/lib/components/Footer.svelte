<script>
  import holdingsLogo from '../../assets/nacascolo.png';
  import footerMarkLogoMarkup from '../../assets/h-wm.svg?raw';

  const footerLogoRepeatCount = 8;

  export let page = 'home';

  const resolveHref = (href) => {
    if (!href) return href;
    if (href.startsWith('/')) return href;
    if (href.startsWith('#')) return page === 'home' ? href : `/${href}`;
    return href;
  };
</script>

<footer id="contacto" class="footer">
  <div class="footer-logo-band">
    <div class="footer-logo-marquee" aria-hidden="true">
      <div class="footer-logo-track">
        {#each Array.from({ length: footerLogoRepeatCount }) as _, index}
          <div class="footer-mark" role="img" aria-label="RapiMax">
            <div class="footer-mark__base">
              {@html footerMarkLogoMarkup}
            </div>
          </div>
        {/each}
        {#each Array.from({ length: footerLogoRepeatCount }) as _, index (`mirror-${index}`)}
          <div class="footer-mark" role="img" aria-label="RapiMax">
            <div class="footer-mark__base">
              {@html footerMarkLogoMarkup}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="container footer-grid">
    <div class="footer-contact">
      <span class="footer-title">Contáctanos</span>
      <a href="tel:+50622223333">+506 2222-3333</a>
      <a class="email-link" href="mailto:hola@rapimax.co.cr">hola@rapimax.co.cr</a>
      <div class="social-icons" aria-label="Redes sociales">
        <a href="https://www.facebook.com"  aria-label="Facebook"  target="_blank" rel="noreferrer">FB</a>
        <a href="https://www.instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">IG</a>
        <a href="https://www.linkedin.com"  aria-label="LinkedIn"  target="_blank" rel="noreferrer">IN</a>
      </div>
    </div>
    <div class="footer-links">
      <span class="footer-title">Enlaces rápidos</span>
      <a href={resolveHref('#inicio')}>Quiénes somos</a>
      <a href="/servicios">Vehículos</a>
      <a href="/calculadora">Calculadora</a>
      <a href={resolveHref('#alianzas')}>Alianzas</a>
    </div>
    <div class="footer-legal">
      <span class="footer-title">Legal</span>
      <div class="legal-links">
        <a href="/terminos-y-condiciones">Términos y condiciones</a>
        <a href="/politica-de-privacidad">Política de privacidad</a>
      </div>
      <img class="footer-holdings" src={holdingsLogo} alt="Nacascolo Holdings" loading="lazy" decoding="async" />
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--c-navy-deep);
    padding: 34px 0 56px;
    border-top: 1px solid rgba(255, 246, 226, 0.12);
    border-radius: var(--layer-seam-radius) var(--layer-seam-radius) 0 0;
    overflow: hidden;
    position: relative;
    z-index: 5;
    content-visibility: auto;
    contain: layout paint;
    contain-intrinsic-size: 640px;
  }

  .footer-logo-band {
    width: 100%;
    margin-top: calc(-0.16 * var(--layer-seam-radius));
    margin-bottom: 20px;
    position: relative;
  }

  .footer-logo-marquee {
    width: 100%;
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent);
    -webkit-mask-image: linear-gradient(
      to right,
      transparent,
      rgba(0, 0, 0, 1) 8%,
      rgba(0, 0, 0, 1) 92%,
      transparent
    );
  }

  .footer-logo-track {
    width: max-content;
    display: flex;
    align-items: center;
    gap: clamp(20px, 2.4vw, 34px);
    animation: footerLogoSlide 30s linear infinite;
    will-change: transform;
  }

  .footer-mark {
    width: clamp(140px, 18vw, 230px);
    aspect-ratio: 600.81 / 141.62;
    flex: 0 0 auto;
    opacity: 0.84;
  }

  .footer-mark__base {
    width: 100%;
    height: 100%;
  }

  .footer-mark__base :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .footer-mark__base :global(path) {
    fill: var(--c-navy) !important;
  }

  @keyframes footerLogoSlide {
    from {
      transform: translate3d(-50%, 0, 0);
    }
    to {
      transform: translate3d(0, 0, 0);
    }
  }

  .footer-grid {
    display: grid;
    gap: 26px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    color: rgba(255, 246, 226, 0.72);
  }

  .footer-title {
    font-weight: 700;
    color: #fff6e2;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.95rem;
  }

  .email-link { font-weight: 700; }

  .footer-contact,
  .footer-links,
  .footer-legal { display: grid; gap: 10px; }

  .footer-links  { justify-self: center; }
  .footer-legal  { justify-self: end; }

  .footer a { color: rgba(255, 246, 226, 0.72); }
  .footer a:hover,
  .footer a:focus-visible { color: var(--c-sand); }

  .social-icons {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }

  .social-icons a {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(255, 246, 226, 0.32);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .legal-links { display: grid; gap: 10px; }

  .footer-holdings {
    margin-top: 16px;
    width: clamp(110px, 40%, 170px);
    justify-self: end;
    opacity: 0.9;
  }

  @media (max-width: 900px) {
    .footer-grid        { grid-template-columns: 1fr; }
    .footer-holdings    { justify-self: start; }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-logo-track {
      animation: none;
      transform: translate3d(0, 0, 0);
    }
  }
</style>
