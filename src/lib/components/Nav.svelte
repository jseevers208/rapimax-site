<script>
  import { fade, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import logoNavy from '../../assets/h-logo-navy.svg';
  import logoLight from '../../assets/h-logo-wt.svg';
  import productsImg from '../../assets/nav/products.webp';
  import contactImg from '../../assets/nav/contact.webp';
  import independentsImg from '../../assets/nav/independents.webp';
  import companiesImg from '../../assets/nav/companies.webp';
  import employeesImg from '../../assets/nav/employees.webp';

  export let page = 'home';

  let activeDropdown = null;
  let dropdownTimeout = null;

  const resolveHref = (href) => {
    if (!href) return href;
    if (href.startsWith('/')) return href;
    if (href.startsWith('#')) return page === 'home' ? href : `/${href}`;
    return href;
  };

  const navItems = [
    {
      id: 'servicios',
      label: 'Nuestros productos',
      href: '/servicios',
      dropdown: {
        image: productsImg,
        title: 'Nuestros productos',
        description: 'Soluciones de financiamiento diseñadas para cada necesidad.',
        links: [
          { label: 'Vehículos de uso personal', href: '/servicios#vehiculos-personales' },
          { label: 'Vehículos de uso comercial', href: '/servicios#vehiculos-comerciales' },
          { label: 'Flotas empresariales', href: '/servicios#flotas-empresariales' },
          { label: 'Vehículos de alta gama', href: '/servicios#vehiculos-alta-gama' },
          { label: 'Motocicletas', href: '/servicios#motocicletas' }
        ],
        extras: [
          { label: 'Calculadora de financiamiento', href: '/calculadora' },
          { label: 'Solicitar financiamiento', href: '/solicitud' }
        ]
      }
    },
    {
      id: 'requisitos',
      label: 'Requisitos',
      href: '/requisitos',
      dropdown: {
        introTitle: 'Requisitos para tu financiamiento',
        introSubtitle: 'Seleccioná el tipo de perfil para conocer los requisitos',
        profiles: [
          {
            image: employeesImg,
            title: 'Asalariados',
            description: 'Personas que trabajan para una empresa y reciben salario.',
            href: '/requisitos#asalariados'
          },
          {
            image: independentsImg,
            title: 'Independientes',
            description: 'Personas con ingresos propios o actividad independiente.',
            href: '/requisitos#independientes'
          },
          {
            image: companiesImg,
            title: 'Personas jurídicas',
            description: 'Empresas que desean financiar vehículos.',
            href: '/requisitos#personas-juridicas'
          },
        ]
      }
    },
    {
      id: 'contacto',
      label: 'Contáctanos',
      href: '/contactanos',
      dropdown: {
        image: contactImg,
        title: 'Contacto',
        description: 'Estamos aquí para ayudarte.',
        links: [
          { label: 'Sucursales', href: '/contactanos' },
          { label: 'Atención al Cliente', href: '/contactanos' },
          { label: 'Soporte Técnico', href: '/contactanos' }
        ],
        extras: [
          { label: 'WhatsApp', href: '/contactanos' },
          { label: 'Correo Electrónico', href: '/contactanos' },
          { label: 'Teléfono', href: '/contactanos' }
        ],
        extraText: 'Horario de atención: Lunes a Viernes 8:00 - 18:00'
      }
    }
  ];
  const navDefault = 'logo';

  let logoHighlighted = true;

  function handleMouseEnter(item) {
    clearTimeout(dropdownTimeout);
    activeDropdown = item.dropdown ? item.id : null;
  }

  function handleLogoEnter() {
    clearTimeout(dropdownTimeout);
    activeDropdown = null;
  }

  function handleMouseLeave() {
    dropdownTimeout = setTimeout(() => {
      activeDropdown = null;
    }, 150);
  }

  function handleDropdownEnter() {
    clearTimeout(dropdownTimeout);
  }

  const dispatch = createEventDispatcher();

  let authHover = null;
  let authContainerRef;
  let loginRef;
  let waitlistRef;
  let authHighlightStyle = '';
  let navWrapperRef;
  let navBarRef;
  let linkRefs = {};
  let navHighlightStyle = 'opacity: 0;';
  let navHighlightTransitionsEnabled = false;
  let navHover = null;
  const navHighlightPad = 8;
  const navHighlightHeightPad = 4;
  let navHighlightRect = null;
  let navHighlightTargetId = null;
  let navGlowX = 0;
  let navGlowY = 0;
  let navGlowActive = false;

  let authHighlightRect = null;
  let authHighlightTransitionsEnabled = false;
  let authGlowX = 0;
  let authGlowY = 0;
  let authGlowActive = true;
  let authGlowFromPointer = false;
  let authActive = 'waitlist';

  const authDefault = 'waitlist';
  const authHighlightInset = 6;
  const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);
  let enableHighlightTransitionsFrame = null;
  let enableHighlightTransitionsFrame2 = null;

  function getNavScaleComp() {
    return 1;
  }

  function queueHighlightTransitions() {
    if (navHighlightTransitionsEnabled && authHighlightTransitionsEnabled) return;
    if (enableHighlightTransitionsFrame || enableHighlightTransitionsFrame2) return;

    enableHighlightTransitionsFrame = requestAnimationFrame(() => {
      enableHighlightTransitionsFrame = null;
      enableHighlightTransitionsFrame2 = requestAnimationFrame(() => {
        enableHighlightTransitionsFrame2 = null;
        navHighlightTransitionsEnabled = true;
        authHighlightTransitionsEnabled = true;
      });
    });
  }

  function syncNavHighlightStyle() {
    if (!navHighlightRect) {
      navHighlightStyle = 'opacity: 0;';
      return;
    }
    navGlowX = clampValue(navGlowX, 0, navHighlightRect.width);
    navGlowY = clampValue(navGlowY, 0, navHighlightRect.height);
    navHighlightStyle = `width: ${navHighlightRect.width}px; height: ${navHighlightRect.height}px; transform: translate(${navHighlightRect.left}px, ${navHighlightRect.top}px); opacity: 1; --nav-glow-x: ${navGlowX}px; --nav-glow-y: ${navGlowY}px; --nav-glow-opacity: ${navGlowActive ? 1 : 0};`;
  }

  function setNavGlowFromEvent(event, targetId) {
    if (!navBarRef || !targetId || !linkRefs[targetId]) return;
    const navScale = getNavScaleComp();
    const navRect = navBarRef.getBoundingClientRect();
    const linkRect = linkRefs[targetId].getBoundingClientRect();
    const width = linkRect.width / navScale + navHighlightPad * 2;
    const height = linkRect.height / navScale + navHighlightHeightPad * 2;
    const left = (linkRect.left - navRect.left) / navScale - navHighlightPad;
    const top = (linkRect.top - navRect.top) / navScale - navHighlightHeightPad;
    navGlowX = clampValue((event.clientX - navRect.left) / navScale - left, 0, width);
    navGlowY = clampValue((event.clientY - navRect.top) / navScale - top, 0, height);
    navGlowActive = true;
    if (navHighlightTargetId === targetId) {
      syncNavHighlightStyle();
    }
  }

  async function updateNavHighlight(targetId) {
    await tick();
    if (!navBarRef || !targetId || !linkRefs[targetId]) {
      navHighlightRect = null;
      navHighlightTargetId = null;
      navGlowActive = false;
      syncNavHighlightStyle();
      return;
    }

    const navScale = getNavScaleComp();
    const navRect = navBarRef.getBoundingClientRect();
    const linkRect = linkRefs[targetId].getBoundingClientRect();
    const width = linkRect.width / navScale + navHighlightPad * 2;
    const height = linkRect.height / navScale + navHighlightHeightPad * 2;
    const left = (linkRect.left - navRect.left) / navScale - navHighlightPad;
    const top = (linkRect.top - navRect.top) / navScale - navHighlightHeightPad;
    navHighlightRect = { left, top, width, height };
    navHighlightTargetId = targetId;
    if (!navGlowActive) {
      navGlowX = width / 2;
      navGlowY = height / 2;
    }
    syncNavHighlightStyle();
  }

  function handleNavHover(targetId, event) {
    navHover = targetId;
    if (event) setNavGlowFromEvent(event, targetId);
    updateNavHighlight(targetId);
  }

  function handleNavPointerMove(targetId, event) {
    setNavGlowFromEvent(event, targetId);
  }

  function handleNavLeave() {
    navHover = null;
    navGlowActive = false;
    updateNavHighlight(searchOpen ? null : (activeDropdown ?? navDefault));
  }

  function syncAuthHighlightStyle() {
    if (!authHighlightRect) {
      authHighlightStyle = '';
      return;
    }
    authGlowX = clampValue(authGlowX, 0, authHighlightRect.width);
    authGlowY = clampValue(authGlowY, 0, authHighlightRect.height);
    authHighlightStyle = `width: ${authHighlightRect.width}px; transform: translateX(${authHighlightRect.left}px); --auth-glow-x: ${authGlowX}px; --auth-glow-y: ${authGlowY}px; --auth-glow-opacity: ${authGlowActive ? 1 : 0};`;
  }

  function setAuthGlowFromEvent(event, targetId) {
    if (!authContainerRef || !loginRef || !waitlistRef) return;
    const targetEl = targetId === 'login' ? loginRef : waitlistRef;
    if (!targetEl) return;
    const navScale = getNavScaleComp();
    const containerRect = authContainerRef.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const leftNudge = targetId === 'waitlist' ? 0 : 1;
    const left = (targetRect.left - containerRect.left) / navScale + leftNudge;
    const width = targetRect.width / navScale;
    const height = Math.max(containerRect.height / navScale - authHighlightInset * 2, 1);
    authGlowX = clampValue((event.clientX - containerRect.left) / navScale - left, 0, width);
    authGlowY = clampValue((event.clientY - containerRect.top) / navScale - authHighlightInset, 0, height);
    authGlowActive = true;
    authGlowFromPointer = true;
    syncAuthHighlightStyle();
  }

  async function updateAuthHighlight(targetId) {
    await tick();
    if (!authContainerRef || !loginRef || !waitlistRef) {
      return;
    }

    const targetEl = targetId === 'login' ? loginRef : waitlistRef;
    if (!targetEl) {
      return;
    }

    const navScale = getNavScaleComp();
    const containerRect = authContainerRef.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const leftNudge = targetId === 'waitlist' ? 0 : 1;
    const left = (targetRect.left - containerRect.left) / navScale + leftNudge;
    const width = targetRect.width / navScale;
    const height = Math.max(containerRect.height / navScale - authHighlightInset * 2, 1);
    authHighlightRect = { left, width, height };
    authActive = targetId;
    if (!authGlowFromPointer) {
      authGlowX = width / 2;
      authGlowY = height / 2;
    }
    syncAuthHighlightStyle();
  }

  function handleAuthHover(targetId, event) {
    authHover = targetId;
    if (event) setAuthGlowFromEvent(event, targetId);
    updateAuthHighlight(targetId);
  }

  function handleAuthPointerMove(targetId, event) {
    setAuthGlowFromEvent(event, targetId);
  }

  function handleAuthLeave() {
    authHover = null;
    authGlowActive = true;
    authGlowFromPointer = false;
    updateAuthHighlight(authDefault);
  }

  function handleWaitlistClick(event) {
    event.preventDefault();
    dispatch('waitlist');
  }

  // Search
  let searchOpen = false;
  let searchValue = '';
  let searchInputRef;

  function openSearch() {
    activeDropdown = null;
    clearTimeout(dropdownTimeout);
    searchOpen = true;
    tick().then(() => { searchInputRef?.focus(); });
  }

  function closeSearch() {
    searchOpen = false;
    searchValue = '';
  }

  function handleSearchKeydown(event) {
    if (event.key === 'Escape') closeSearch();
  }

  function updateHeroSafeTop() {
    if (!navWrapperRef || !navBarRef || typeof document === 'undefined') return;
    const wrapperStyle = getComputedStyle(navWrapperRef);
    const wrapperPadTop = Number.parseFloat(wrapperStyle.paddingTop) || 0;
    const navBarHeight = navBarRef.getBoundingClientRect().height;
    const safeTop = Math.max(0, Math.round(wrapperPadTop + navBarHeight));
    document.documentElement.style.setProperty('--hero-safe-top', `${safeTop}px`);
  }

  onMount(() => {
    Promise.all([
      updateAuthHighlight(authDefault),
      updateNavHighlight(navDefault)
    ]).then(() => {
      queueHighlightTransitions();
    });
    updateHeroSafeTop();

    let navResizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      navResizeObserver = new ResizeObserver(() => {
        updateHeroSafeTop();
        updateAuthHighlight(authHover ?? authDefault);
        updateNavHighlight(searchOpen ? null : (navHover ?? activeDropdown ?? navDefault));
      });
      if (navBarRef) navResizeObserver.observe(navBarRef);
      if (navWrapperRef) navResizeObserver.observe(navWrapperRef);
      if (linkRefs.logo) navResizeObserver.observe(linkRefs.logo);
      if (authContainerRef) navResizeObserver.observe(authContainerRef);
    }

    const onResize = () => {
      updateAuthHighlight(authHover ?? authDefault);
      updateNavHighlight(navHover ?? activeDropdown ?? navDefault);
      updateHeroSafeTop();
    };
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    const onKeydown = (e) => { if (e.key === 'Escape' && searchOpen) closeSearch(); };
    window.addEventListener('keydown', onKeydown);
    requestAnimationFrame(() => {
      updateHeroSafeTop();
    });
    return () => {
      if (enableHighlightTransitionsFrame) cancelAnimationFrame(enableHighlightTransitionsFrame);
      if (enableHighlightTransitionsFrame2) cancelAnimationFrame(enableHighlightTransitionsFrame2);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeydown);
      navResizeObserver?.disconnect();
    };
  });

  $: if (authContainerRef && loginRef && waitlistRef) {
    updateAuthHighlight(authHover ?? authDefault);
  }

  $: logoHighlighted = navHighlightTargetId === 'logo' && !searchOpen;

  $: updateNavHighlight(searchOpen ? null : (navHover ?? activeDropdown ?? navDefault));
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="nav-wrapper" bind:this={navWrapperRef} on:mouseleave={handleMouseLeave}>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-mouse-events-have-key-events a11y-interactive-supports-focus -->
  <header 
    class="nav-shell" 
    role="navigation"
  >
    <div class="nav-card">
      <div class="nav-container nav" aria-label="Primary" bind:this={navBarRef}>
        <span
          class="nav-highlight"
          class:hovered={navHover !== null}
          class:nav-highlight--transitions-enabled={navHighlightTransitionsEnabled}
          style={navHighlightStyle}
        >
          <span class="nav-highlight__glow" aria-hidden="true">
            <span class="nav-highlight__glow-shape"></span>
          </span>
        </span>
        <a
          class="logo"
          aria-label="RapiMax"
          href="/"
          bind:this={linkRefs.logo}
          on:mouseenter={handleLogoEnter}
          on:pointerenter={(event) => handleNavHover('logo', event)}
          on:pointermove={(event) => handleNavPointerMove('logo', event)}
          on:mouseleave={handleNavLeave}
        >
          <span class="logo-visual" class:is-highlighted={logoHighlighted} aria-hidden="true">
            <img
              class="logo-img logo-img--navy"
              src={logoNavy}
              alt=""
            />
            <img
              class="logo-img logo-img--light"
              src={logoLight}
              alt=""
            />
          </span>
        </a>
        <nav class="links" aria-label="Secciones" on:mouseleave={handleNavLeave}>
          {#each navItems as item (item.id)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="nav-item"
              class:nav-item-hidden={searchOpen}
              on:mouseenter={() => handleMouseEnter(item)}
            >
              <a
                href={resolveHref(item.href)}
                class="nav-link"
                class:active={navHover !== 'search' && (activeDropdown === item.id || (!activeDropdown && navDefault === item.id))}
                bind:this={linkRefs[item.id]}
                on:pointerenter={(event) => handleNavHover(item.id, event)}
                on:pointermove={(event) => handleNavPointerMove(item.id, event)}
              >
                <span class="nav-link-text">{item.label}</span>
                {#if item.dropdown}
                  <svg
                    class="caret"
                    class:rotated={activeDropdown === item.id}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                  >
                    <path d="M1 5L5 1L9 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                {/if}
              </a>
            </div>
          {/each}

          <!-- Search button: lives inside .links so it shares gap and the nav highlight -->
          <div class="nav-item search-nav-item">
            <!-- Expanding bar: anchored to right of .links, grows leftward -->
            <div class="search-bar" class:search-bar-open={searchOpen}>
              <div class="search-icon-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2"/>
                  <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                </svg>
              </div>
              <input
                class="search-input"
                type="text"
                placeholder="Buscar..."
                bind:value={searchValue}
                bind:this={searchInputRef}
                on:keydown={handleSearchKeydown}
                aria-label="Búsqueda"
              />
              <button class="search-close" on:click={closeSearch} aria-label="Cerrar búsqueda">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- Collapsed trigger: registered in linkRefs so the shared highlight tracks it -->
            <button
              class="search-btn"
              class:search-btn-hidden={searchOpen}
              on:click={openSearch}
              aria-label="Abrir búsqueda"
              bind:this={linkRefs['search']}
              on:pointerenter={(event) => handleNavHover('search', event)}
              on:pointermove={(event) => handleNavPointerMove('search', event)}
            >
              <svg class="search-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2"/>
                <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </nav>

        <div class="actions">
          <div
            class="auth-switch"
            bind:this={authContainerRef}
            role="group"
            aria-label="Acceso"
            on:mouseleave={handleAuthLeave}
          >
            <div
              class="auth-highlight"
              class:auth-highlight--transitions-enabled={authHighlightTransitionsEnabled}
              style={authHighlightStyle}
            >
              <span class="auth-highlight__glow" aria-hidden="true">
                <span class="auth-highlight__glow-shape"></span>
              </span>
            </div>
            <a
              class="auth-btn"
              class:highlighted={authActive === 'login'}
              href="/ingresar"
              bind:this={loginRef}
              on:pointerenter={(event) => handleAuthHover('login', event)}
              on:pointermove={(event) => handleAuthPointerMove('login', event)}
            >
              Ingresar
            </a>
            <a
              class="auth-btn auth-btn-active"
              class:highlighted={authActive === 'waitlist'}
              href="#waitlist"
              bind:this={waitlistRef}
              on:pointerenter={(event) => handleAuthHover('waitlist', event)}
              on:pointermove={(event) => handleAuthPointerMove('waitlist', event)}
              on:click={handleWaitlistClick}
            >
              Lista de espera
            </a>
          </div>
        </div>
      </div>

      {#if activeDropdown !== null}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div 
          class="dropdown-wrapper"
          transition:slide={{ duration: 300, easing: cubicOut }}
          on:mouseenter={handleDropdownEnter}
        >
          <div class="dropdown-container" class:dropdown-container-requisitos={activeDropdown === 'requisitos'}>
            {#each navItems as item (item.id)}
              {#if activeDropdown === item.id}
                <div
                  class="dropdown-content"
                  class:dropdown-content-requisitos={item.id === 'requisitos' && item.dropdown.profiles}
                  in:fade={{ duration: 200, delay: 100 }}
                  out:fade={{ duration: 150 }}
                >
                  {#if item.id === 'requisitos' && item.dropdown.profiles}
                    <div class="dropdown-requisitos">
                      <div class="dropdown-requisitos-intro">
                        <h3 class="dropdown-requisitos-title">{item.dropdown.introTitle}</h3>
                        <p class="dropdown-requisitos-subtitle">{item.dropdown.introSubtitle}</p>
                      </div>
                      <div class="dropdown-requisitos-grid">
                        {#each item.dropdown.profiles as profile, i}
                          <a
                            class="requisito-card"
                            href={profile.href}
                            style="animation-delay: {70 + i * 60}ms"
                          >
                            <div class="requisito-card-image-wrapper">
                              <img
                                src={profile.image}
                                alt={profile.title}
                                class="requisito-card-image"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <h4 class="requisito-card-title">{profile.title}</h4>
                            <p class="requisito-card-description">{profile.description}</p>
                          </a>
                        {/each}
                      </div>
                    </div>
                  {:else}
                    <div class="dropdown-grid">
                      <div class="dropdown-col dropdown-col-image">
                        <div class="dropdown-image-wrapper">
                          <img
                            src={item.dropdown.image}
                            alt={item.dropdown.title}
                            class="dropdown-image"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <h3 class="dropdown-title">{item.dropdown.title}</h3>
                        <p class="dropdown-description">{item.dropdown.description}</p>
                      </div>
                      <div class="dropdown-col dropdown-col-links">
                        <h4 class="dropdown-col-heading">Enlaces</h4>
                        <ul class="dropdown-links">
                          {#each item.dropdown.links as link, i}
                            <li style="animation-delay: {100 + i * 50}ms">
                              <a href={resolveHref(link.href)}>{link.label}</a>
                            </li>
                          {/each}
                        </ul>
                      </div>
                      <div class="dropdown-col dropdown-col-extras">
                        <h4 class="dropdown-col-heading">Más información</h4>
                        <ul class="dropdown-links">
                          {#each item.dropdown.extras as link, i}
                            <li style="animation-delay: {150 + i * 50}ms">
                              <a href={resolveHref(link.href)}>{link.label}</a>
                            </li>
                          {/each}
                        </ul>
                        {#if item.dropdown.extraText}
                          <p class="dropdown-extra-text">{item.dropdown.extraText}</p>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </header>
</div>

<style>
  .nav-wrapper {
    --nav-surface-dark: #122941;
    --nav-surface-dark-deep: #010d28;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    padding-top: 8px;
    pointer-events: none;
  }

  .nav-shell {
    position: relative;
    z-index: 2;
    background: transparent;
    pointer-events: auto;
  }

  .nav-card {
    width: min(1280px, 96vw);
    margin: 0 auto;
    position: relative;
    border-radius: var(--radius-l);
    background: var(--c-warm-gray);
    border: 1px solid rgba(18, 41, 65, 0.14);
    box-shadow: 0 10px 24px rgba(1, 13, 40, 0.12);
    overflow: visible;
    isolation: isolate;
    pointer-events: auto;
  }

  .nav-container {
    width: 100%;
    margin: 0;
    padding: 6px 20px;
  }

  .nav {
    --nav-pill-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    position: relative;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 20px;
    height: var(--nav-pill-height);
    padding: 0.5px 8px 0.5px 12px;
    border-radius: 999px;
    cursor: pointer;
    position: relative;
    z-index: 1;
  }

  .logo-visual {
    display: grid;
    place-items: center;
    transform: translateY(2px) scale(1);
    transform-origin: center;
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .logo:hover .logo-visual,
  .logo:focus-visible .logo-visual {
    transform: translateY(2px) scale(1.045);
  }

  .logo-img {
    grid-area: 1 / 1;
    height: calc(var(--nav-pill-height) - 1px);
    width: auto;
    transition: opacity 220ms ease;
  }

  .logo-img--navy {
    opacity: 1;
  }

  .logo-img--light {
    opacity: 0;
  }

  .logo-visual.is-highlighted .logo-img--navy {
    opacity: 0;
  }

  .logo-visual.is-highlighted .logo-img--light {
    opacity: 1;
  }

  .links {
    display: flex;
    gap: 6px;
    font-weight: 700;
    white-space: nowrap;
    position: relative;
    padding: 2px;
    z-index: 1;
  }

  .nav-item-hidden {
    opacity: 0;
    pointer-events: none;
    transition: opacity 220ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-highlight {
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(18, 41, 65, 0.92);
    border: 1px solid rgba(213, 181, 132, 0.48);
    border-radius: 999px;
    overflow: hidden;
    isolation: isolate;
    box-shadow: 0 4px 12px rgba(1, 13, 40, 0.2);
    --nav-glow-x: 50%;
    --nav-glow-y: 50%;
    --nav-glow-opacity: 0;
    --nav-glow-pad: 18px;
    --nav-glow-radius: 56px;
    z-index: 0;
    pointer-events: none;
  }

  .nav-highlight--transitions-enabled {
    transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1),
      width 220ms cubic-bezier(0.4, 0, 0.2, 1),
      height 220ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 180ms ease-out;
  }

  .nav-highlight::before {
    content: none;
  }

  .nav-highlight::after {
    content: none;
  }

  .nav-highlight__glow {
    position: absolute;
    inset: calc(-1 * var(--nav-glow-pad));
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--nav-glow-opacity, 0);
    transition: opacity 160ms ease;
    z-index: -1;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-image: radial-gradient(
      circle var(--nav-glow-radius) at calc(var(--nav-glow-x) + var(--nav-glow-pad)) calc(var(--nav-glow-y) + var(--nav-glow-pad)),
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.92) 56%,
      rgba(0, 0, 0, 0) 100%
    );
    mask-image: radial-gradient(
      circle var(--nav-glow-radius) at calc(var(--nav-glow-x) + var(--nav-glow-pad)) calc(var(--nav-glow-y) + var(--nav-glow-pad)),
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.92) 56%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  .nav-highlight__glow-shape {
    position: absolute;
    inset: var(--nav-glow-pad);
    border-radius: inherit;
    background: transparent;
    box-shadow:
      0 0 18px 6px rgba(213, 181, 132, 0.8);
  }

  .nav-highlight.hovered { border-color: var(--c-sand); }

  .nav-item {
    position: relative;
    flex-shrink: 0;
  }

  .search-nav-item {
    display: flex;
    align-items: center;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: var(--nav-pill-height);
    padding: 0 10px;
    line-height: 1;
    font-size: clamp(0.9rem, 0.3vw + 0.85rem, 0.98rem);
    color: #010d28;
    position: relative;
    transition: color var(--transition-fast);
    z-index: 1;
  }

  .nav-link:hover,
  .nav-link:focus-visible,
  .nav-link.active {
    color: #ffffff;
  }

  .caret {
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  .caret.rotated {
    transform: rotate(180deg);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 8px;
    position: relative;
    z-index: 1;
  }

  .auth-switch {
    display: inline-flex;
    align-items: center;
    position: relative;
    isolation: isolate;
    background: rgba(18, 41, 65, 0.94);
    border-radius: 999px;
    padding: 6px;
    border: 1px solid rgba(213, 181, 132, 0.56);
    box-shadow: 0 4px 12px rgba(1, 13, 40, 0.2);
    overflow: hidden;
  }

  .auth-switch::before {
    content: none;
  }

  .auth-switch::after {
    content: none;
  }

  .auth-highlight {
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 0;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(18, 41, 65, 0.14);
    border-radius: 999px;
    overflow: hidden;
    isolation: isolate;
    --auth-glow-x: 50%;
    --auth-glow-y: 50%;
    --auth-glow-opacity: 0;
    --auth-glow-pad: 18px;
    --auth-glow-radius: 52px;
    z-index: 1;
    pointer-events: none;
  }

  .auth-highlight--transitions-enabled {
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1), width 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .auth-highlight::before {
    content: none;
  }

  .auth-highlight__glow {
    position: absolute;
    inset: calc(-1 * var(--auth-glow-pad));
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--auth-glow-opacity, 0);
    transition: opacity 160ms ease;
    z-index: -1;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-image: radial-gradient(
      circle var(--auth-glow-radius) at calc(var(--auth-glow-x) + var(--auth-glow-pad)) calc(var(--auth-glow-y) + var(--auth-glow-pad)),
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.92) 56%,
      rgba(0, 0, 0, 0) 100%
    );
    mask-image: radial-gradient(
      circle var(--auth-glow-radius) at calc(var(--auth-glow-x) + var(--auth-glow-pad)) calc(var(--auth-glow-y) + var(--auth-glow-pad)),
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.92) 56%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  .auth-highlight__glow-shape {
    position: absolute;
    inset: var(--auth-glow-pad);
    border-radius: inherit;
    background: transparent;
    box-shadow:
      0 0 18px 6px rgba(213, 181, 132, 0.8);
  }

  .auth-btn {
    position: relative;
    z-index: 2;
    padding: 6px 13px;
    font-size: 0.85rem;
    font-weight: 700;
    color: #ffffff;
    text-decoration: none;
    transition: color 200ms ease, transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 999px;
  }

  .auth-btn:hover {
    transform: translateY(-1px);
  }

  .auth-btn-active {
    color: #ffffff;
  }

  .auth-btn.highlighted {
    color: #010d28;
  }

  /* Dropdown Styles */
  .dropdown-wrapper {
    position: relative;
    z-index: 1;
    background: transparent;
    border-top: 1px solid rgba(18, 41, 65, 0.08);
    pointer-events: auto;
  }

  .dropdown-container {
    width: 100%;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    height: 280px;
    overflow: hidden;
  }

  .dropdown-container.dropdown-container-requisitos {
    height: auto;
    overflow: visible;
  }

  .dropdown-content {
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    padding: 24px 0 20px;
  }

  .dropdown-content.dropdown-content-requisitos {
    position: relative;
    left: 0;
    right: 0;
    padding: 12px 0 24px;
  }

  .dropdown-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 40px;
  }

  .dropdown-requisitos {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .dropdown-requisitos-intro {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    padding: 8px 0;
  }

  .dropdown-requisitos-title {
    margin: 0;
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--c-navy-deep);
    line-height: 1.2;
    text-align: left;
    max-width: 46%;
  }

  .dropdown-requisitos-subtitle {
    margin: 0;
    font-size: 0.96rem;
    color: var(--c-ink-soft);
    line-height: 1.45;
    text-align: right;
    max-width: 48%;
  }

  .dropdown-requisitos-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }

  .requisito-card {
    display: grid;
    grid-template-rows: 118px auto 1fr;
    gap: 12px;
    padding: 14px;
    background: var(--c-warm-gray);
    border: 1px solid rgba(18, 41, 65, 0.14);
    border-radius: var(--radius-m);
    box-shadow: 0 8px 18px rgba(1, 13, 40, 0.08);
    animation: fadeSlideIn 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
    transition:
      background-color 230ms ease,
      border-color 230ms ease,
      box-shadow 230ms ease,
      transform 230ms ease;
  }

  .requisito-card:hover {
    background: var(--c-navy);
    border-color: rgba(1, 13, 40, 0.5);
    box-shadow: 0 12px 24px rgba(1, 13, 40, 0.2);
    transform: translateY(-2px);
  }

  .requisito-card:focus-visible {
    background: var(--c-navy);
    border-color: rgba(213, 181, 132, 0.95);
    box-shadow: 0 12px 24px rgba(1, 13, 40, 0.2), 0 0 0 3px rgba(213, 181, 132, 0.22);
    outline: none;
    transform: translateY(-2px);
  }

  .requisito-card-image-wrapper {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-s);
    overflow: hidden;
    background: rgba(18, 41, 65, 0.1);
  }

  .requisito-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .requisito-card-title {
    margin: 0;
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--c-navy-deep);
    line-height: 1.2;
    transition: color 230ms ease;
  }

  .requisito-card-description {
    margin: 0;
    font-size: 0.9rem;
    color: var(--c-ink-soft);
    line-height: 1.45;
    transition: color 230ms ease;
  }

  .requisito-card:hover .requisito-card-title {
    color: var(--c-crema);
  }

  .requisito-card:focus-visible .requisito-card-title {
    color: var(--c-crema);
  }

  .requisito-card:hover .requisito-card-description {
    color: rgba(255, 246, 226, 0.9);
  }

  .requisito-card:focus-visible .requisito-card-description {
    color: rgba(255, 246, 226, 0.9);
  }

  .dropdown-col {
    animation: fadeSlideIn 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
  }

  .dropdown-col-image {
    animation-delay: 50ms;
  }

  .dropdown-col-links {
    animation-delay: 100ms;
  }

  .dropdown-col-extras {
    animation-delay: 150ms;
  }

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-image-wrapper {
    width: 100%;
    max-width: 320px;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .dropdown-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 40%;
  }

  .dropdown-title {
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--c-navy-deep);
    margin: 0 0 8px;
  }

  .dropdown-description {
    font-size: 0.9rem;
    color: var(--c-ink-muted);
    margin: 0;
    line-height: 1.5;
  }

  .dropdown-col-heading {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--c-ink-muted);
    margin: 0 0 16px;
  }

  .dropdown-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .dropdown-links li {
    animation: fadeSlideIn 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
  }

  .dropdown-links a {
    display: inline-block;
    color: #010d28;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 4px 0;
    position: relative;
    transition: color var(--transition-fast);
  }

  .dropdown-links a::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    width: 100%;
    height: 1px;
    background: #010d28;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 200ms ease-out;
  }

  .dropdown-links a:hover {
    color: #010d28;
  }

  .dropdown-links a:hover::after {
    transform: scaleX(1);
  }

  .dropdown-extra-text {
    margin: 20px 0 0;
    padding: 16px;
    background: rgba(213, 181, 132, 0.2);
    border-radius: 10px;
    font-size: 0.85rem;
    color: var(--c-ink-soft);
    line-height: 1.5;
  }

  /* Search */
  .search-bar {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    width: 360px;
    max-width: 36px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(18, 41, 65, 0.94);
    border: 1px solid rgba(213, 181, 132, 0.56);
    box-shadow: 0 4px 12px rgba(1, 13, 40, 0.2);
    transition: max-width 280ms cubic-bezier(0.4, 0, 0.2, 1),
                opacity 180ms ease-out;
    opacity: 0;
    pointer-events: none;
    z-index: 10;
    isolation: isolate;
  }

  .search-bar::before {
    content: none;
  }

  .search-bar::after {
    content: none;
  }

  .search-bar.search-bar-open {
    max-width: 360px;
    opacity: 1;
    pointer-events: auto;
  }

  .search-icon-pill {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    margin: 2px;
    border-radius: 999px;
    background: var(--nav-surface-dark-deep);
    box-shadow: inset 0 0 0 1px #d5b584;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff6e2;
    position: relative;
    z-index: 1;
  }

  .search-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: #fff6e2;
    font-size: 0.88rem;
    font-weight: 500;
    padding: 0 8px;
    position: relative;
    z-index: 1;
  }

  .search-input::placeholder {
    color: rgba(255, 246, 226, 0.45);
  }

  .search-close {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    margin: 0 6px 0 0;
    border-radius: 999px;
    background: rgba(255, 246, 226, 0.1);
    border: 1px solid rgba(255, 246, 226, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff6e2;
    cursor: pointer;
    transition: background 160ms ease-out, border-color 160ms ease-out;
    position: relative;
    z-index: 1;
  }

  .search-close:hover {
    background: rgba(255, 246, 226, 0.18);
    border-color: rgba(255, 246, 226, 0.35);
  }

  .search-btn {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    margin: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #010d28;
    transition: color var(--transition-fast), opacity 160ms ease-out;
    position: relative;
    z-index: 1;
  }

  .search-btn.search-btn-hidden {
    opacity: 0;
    pointer-events: none;
  }

  .search-btn:hover,
  .search-btn:focus-visible {
    color: #ffffff;
  }

  .search-btn-icon {
    display: block;
  }

  @media (max-width: 1180px) {
    .dropdown-requisitos-intro {
      flex-direction: column;
      gap: 8px;
    }

    .dropdown-requisitos-title,
    .dropdown-requisitos-subtitle {
      max-width: 100%;
      text-align: left;
    }
  }

  @media (max-width: 900px) {
    .nav-wrapper {
      padding-top: 16px;
    }

    .nav-container {
      padding: 6px 16px;
    }

    .links {
      display: none;
    }

    .dropdown-wrapper {
      display: none;
    }
  }

  @media (max-width: 720px) {
    .auth-switch {
      display: none;
    }
  }
</style>


