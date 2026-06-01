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
      <span class="footer-title">Contactanos</span>
      <a href="tel:+50671996622">+506 7199-6622</a>
      <a class="email-link" href="mailto:info@rapimax-dev.com">info@rapimax-dev.com</a>
      <div class="social-icons" aria-label="Redes sociales">
        <a href="https://www.instagram.com/rapimaxcr" aria-label="Instagram" target="_blank" rel="noreferrer"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
        <a href="https://wa.me/50671996622?text=%C2%A1Hola!%20Quiero%20realizar%20mi%20precalificaci%C3%B3n%20con%20RapiMax%20%F0%9F%9B%B5%20%F0%9F%9A%99%0AMi%20n%C3%BAmero%20de%20c%C3%A9dula%20es%3A" aria-label="WhatsApp" target="_blank" rel="noreferrer"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
      </div>
    </div>
    <!-- HIDDEN: Enlaces rápidos — re-enable later -->
    <div class="footer-links" style="display:none">
      <span class="footer-title">Enlaces rápidos</span>
      <a href={resolveHref('#inicio')}>Quiénes somos</a>
      <a href="/servicios">Vehículos</a>
      <a href="/contactanos">Contactanos</a>
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    .footer {
      padding: 30px 0 46px;
    }

    .footer-logo-band {
      margin-top: -4px;
      margin-bottom: 22px;
    }

    .footer-mark {
      width: clamp(128px, 42vw, 190px);
    }

    .footer-grid {
      width: min(430px, 100%);
      grid-template-columns: minmax(0, 1fr);
      justify-items: center;
      gap: 30px;
      text-align: center;
    }

    .footer-contact,
    .footer-links,
    .footer-legal,
    .legal-links {
      width: 100%;
      justify-items: center;
    }

    .footer-contact,
    .footer-links,
    .footer-legal {
      justify-self: stretch;
    }

    .social-icons {
      justify-content: center;
      margin-top: 8px;
    }

    .email-link {
      overflow-wrap: anywhere;
    }

    .footer-holdings {
      width: min(160px, 58vw);
      justify-self: center;
      margin-top: 8px;
    }
  }

  @media (max-width: 520px) {
    .footer {
      padding-bottom: 40px;
    }

    .footer-grid {
      gap: 28px;
      padding-inline: 22px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-logo-track {
      animation: none;
      transform: translate3d(0, 0, 0);
    }
  }
</style>
