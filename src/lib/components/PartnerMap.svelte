<script>
  import { onMount } from 'svelte';
  import targetIcon from '../../assets/partners/target.svg';
  import searchIcon from '../../assets/partners/search.svg';

  const locations = [
    {
      name: 'AutoMall San Jose',
      address: 'Paseo Colon, San Jose',
      phone: '+506 2222-3333',
      email: 'ventas@rapimax.co.cr',
      coords: [9.933, -84.087]
    },
    {
      name: 'MotoCentro Heredia',
      address: 'Ruta 3, Heredia Centro',
      phone: '+506 2222-3333',
      email: 'aliados@rapimax.co.cr',
      coords: [9.997, -84.116]
    },
    {
      name: 'Grupo Ruta Alajuela',
      address: 'Av. 2, Alajuela Centro',
      phone: '+506 2222-3333',
      email: 'contacto@rapimax.co.cr',
      coords: [10.016, -84.214]
    },
    {
      name: 'FleetPro Cartago',
      address: 'Calle 1, Cartago Centro',
      phone: '+506 2222-3333',
      email: 'flotillas@rapimax.co.cr',
      coords: [9.864, -83.919]
    },
    {
      name: 'AutoServicios Limon',
      address: 'Av. Principal, Limon Centro',
      phone: '+506 2222-4444',
      email: 'limon@rapimax.co.cr',
      coords: [9.991, -83.044]
    },
    {
      name: 'MotoWorld Puntarenas',
      address: 'Calle 3, Puntarenas Centro',
      phone: '+506 2222-5555',
      email: 'puntarenas@rapimax.co.cr',
      coords: [9.976, -84.838]
    },
    {
      name: 'FleetMax Guanacaste',
      address: 'Liberia Centro',
      phone: '+506 2222-6666',
      email: 'guanacaste@rapimax.co.cr',
      coords: [10.635, -85.437]
    },
    {
      name: 'AutoPro Perez Zeledon',
      address: 'San Isidro Centro',
      phone: '+506 2222-7777',
      email: 'perez@rapimax.co.cr',
      coords: [9.378, -83.702]
    }
  ];

  const searchOrigins = [
    { label: 'San Jose', tokens: ['1', 'san jose', 'sj'], coords: [9.933, -84.087], kind: 'postal' },
    { label: 'Alajuela', tokens: ['2', 'alajuela'], coords: [10.016, -84.214], kind: 'postal' },
    { label: 'Cartago', tokens: ['3', 'cartago'], coords: [9.864, -83.919], kind: 'postal' },
    { label: 'Heredia', tokens: ['4', 'heredia'], coords: [9.997, -84.116], kind: 'postal' },
    { label: 'Guanacaste', tokens: ['5', 'guanacaste', 'liberia'], coords: [10.635, -85.437], kind: 'postal' },
    { label: 'Puntarenas', tokens: ['6', 'puntarenas'], coords: [9.976, -84.838], kind: 'postal' },
    { label: 'Limon', tokens: ['7', 'limon'], coords: [9.991, -83.044], kind: 'postal' },
    { label: 'Perez Zeledon', tokens: ['perez zeledon', 'san isidro'], coords: [9.378, -83.702], kind: 'city' }
  ];

  const OPEN_FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const PARTNER_SOURCE_ID = 'partners';
  const PARTNER_PIN_LAYER_ID = 'partners-pins';
  const PARTNER_PIN_ACTIVE_LAYER_ID = 'partners-pins-active';
  const PARTNER_PIN_IMAGE_ID = 'partner-pin';
  const PARTNER_PIN_ACTIVE_IMAGE_ID = 'partner-pin-active';
  const SEARCH_ZOOM = 10;
  const GEOLOCATE_ZOOM = 11;
  const MAP_ATTRIBUTION = '';
  const BRAND_MAP_COLORS = {
    land: '#FFF6E2',
    water: '#F1F1EF',
    line: '#D5B584',
    road: '#D5B584',
    label: '#010D28',
    halo: '#FFF6E2',
    pin: '#122941',
    pinDot: '#FFF6E2',
    activePin: '#122941',
    activePinDot: '#D5B584'
  };

  let mapElement;
  let L = null;
  let maplibregl = null;
  let mapModulesPromise = null;
  let hoveredIndex = null;
  let mapInstance = null;
  let mapLibreLayer = null;
  let mapLibreMap = null;
  let popupInstance = null;
  let mapResizeObserver = null;
  let sectionEl;
  let hasActivated = false;
  let mapCleanup = () => {};
  let scheduledMapIdleId = null;
  let scheduledMapTimeoutId = 0;
  let searchQuery = '';
  let isLocating = false;
  let isMapLoading = false;
  let isMapReady = false;

  async function loadMapModules() {
    if (!mapModulesPromise) {
      mapModulesPromise = (async () => {
        const [leafletModule, maplibreModule] = await Promise.all([
          import('leaflet'),
          import('maplibre-gl'),
          import('leaflet/dist/leaflet.css'),
          import('maplibre-gl/dist/maplibre-gl.css')
        ]);

        L = leafletModule.default ?? leafletModule;
        maplibregl = maplibreModule.default ?? maplibreModule;
        await import('@maplibre/maplibre-gl-leaflet');
      })();

      mapModulesPromise.catch(() => {
        mapModulesPromise = null;
      });
    }

    return mapModulesPromise;
  }

  function cancelScheduledMapInit() {
    if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && scheduledMapIdleId !== null) {
      window.cancelIdleCallback(scheduledMapIdleId);
    }

    scheduledMapIdleId = null;

    if (typeof window !== 'undefined' && scheduledMapTimeoutId) {
      window.clearTimeout(scheduledMapTimeoutId);
      scheduledMapTimeoutId = 0;
    }
  }

  function scheduleMapInit() {
    if (hasActivated || scheduledMapIdleId !== null || scheduledMapTimeoutId) return;

    const runInit = () => {
      scheduledMapIdleId = null;
      scheduledMapTimeoutId = 0;
      initMap();
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      scheduledMapIdleId = window.requestIdleCallback(runInit, { timeout: 700 });
      return;
    }

    scheduledMapTimeoutId = window.setTimeout(runInit, 120);
  }

  function normalizeText(value = '') {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function resolveSearchOrigin(query) {
    const normalized = normalizeText(query);

    if (!normalized) {
      return null;
    }

    const digits = normalized.replace(/\D/g, '');
    if (digits) {
      const province = searchOrigins.find(
        (origin) => origin.kind === 'postal' && origin.tokens[0] === digits[0]
      );

      if (province) {
        return province;
      }
    }

    const exactMatch = searchOrigins.find((origin) =>
      origin.tokens.some((token) => normalized === token)
    );

    if (exactMatch) {
      return exactMatch;
    }

    return (
      searchOrigins.find((origin) => origin.tokens.some((token) => normalized.includes(token))) ?? null
    );
  }

  function createPartnerPinSvg(fill, dot) {
    return `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="${fill}"/>
      <circle cx="14" cy="14" r="6" fill="${dot}"/>
    </svg>`;
  }

  function loadSvgImage(svg) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
  }

  async function ensurePartnerPinImages(glMap) {
    if (!glMap.hasImage(PARTNER_PIN_IMAGE_ID)) {
      const image = await loadSvgImage(createPartnerPinSvg(BRAND_MAP_COLORS.pin, BRAND_MAP_COLORS.pinDot));
      glMap.addImage(PARTNER_PIN_IMAGE_ID, image);
    }

    if (!glMap.hasImage(PARTNER_PIN_ACTIVE_IMAGE_ID)) {
      const image = await loadSvgImage(
        createPartnerPinSvg(BRAND_MAP_COLORS.activePin, BRAND_MAP_COLORS.activePinDot)
      );
      glMap.addImage(PARTNER_PIN_ACTIVE_IMAGE_ID, image);
    }
  }

  function getPartnerPopupContent(locationIndex) {
    const location = locations[locationIndex];

    return `
      <div class="partner-tooltip-card">
        <strong>${location.name}</strong>
        <span>${location.address}</span>
        <span>${location.phone}</span>
        <span>${location.email}</span>
      </div>
    `;
  }

  function getPartnerGeoJson() {
    return {
      type: 'FeatureCollection',
      features: locations.map((location, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.coords[1], location.coords[0]]
        },
        properties: {
          index,
          active: index === hoveredIndex ? 1 : 0
        }
      }))
    };
  }

  function getPartnerLayerInsertBeforeId(glMap) {
    return glMap.getStyle()?.layers?.find((layer) => layer.type === 'symbol')?.id;
  }

  async function ensurePartnerPinLayers(glMap) {
    await ensurePartnerPinImages(glMap);

    if (!glMap.getSource(PARTNER_SOURCE_ID)) {
      glMap.addSource(PARTNER_SOURCE_ID, {
        type: 'geojson',
        data: getPartnerGeoJson()
      });
    }

    const beforeId = getPartnerLayerInsertBeforeId(glMap);

    if (!glMap.getLayer(PARTNER_PIN_LAYER_ID)) {
      glMap.addLayer(
        {
          id: PARTNER_PIN_LAYER_ID,
          type: 'symbol',
          source: PARTNER_SOURCE_ID,
          filter: ['!=', ['get', 'active'], 1],
          layout: {
            'icon-image': PARTNER_PIN_IMAGE_ID,
            'icon-size': 1,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          }
        },
        beforeId
      );
    }

    if (!glMap.getLayer(PARTNER_PIN_ACTIVE_LAYER_ID)) {
      glMap.addLayer(
        {
          id: PARTNER_PIN_ACTIVE_LAYER_ID,
          type: 'symbol',
          source: PARTNER_SOURCE_ID,
          filter: ['==', ['get', 'active'], 1],
          layout: {
            'icon-image': PARTNER_PIN_ACTIVE_IMAGE_ID,
            'icon-size': 1.2,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          }
        },
        beforeId
      );
    }
  }

  function setLayerPaint(glMap, layerId, property, value) {
    if (!glMap.getLayer(layerId)) return;

    try {
      glMap.setPaintProperty(glMap.getLayer(layerId).id, property, value);
    } catch (error) {
      console.warn(`Unable to set ${property} on ${layerId}`, error);
    }
  }

  function applyBrandMapStyle(glMap) {
    const layers = glMap.getStyle()?.layers ?? [];

    for (const layer of layers) {
      const sourceLayer = layer['source-layer'];

      if (layer.id === 'background') {
        setLayerPaint(glMap, layer.id, 'background-color', BRAND_MAP_COLORS.land);
        continue;
      }

      if (layer.id === 'natural_earth') {
        setLayerPaint(glMap, layer.id, 'raster-opacity', 0);
        continue;
      }

      if (layer.type === 'fill' || layer.type === 'fill-extrusion') {
        if (sourceLayer === 'water') {
          const colorKey = layer.type === 'fill' ? 'fill-color' : 'fill-extrusion-color';
          setLayerPaint(glMap, layer.id, colorKey, BRAND_MAP_COLORS.water);
          continue;
        }

        if (
          ['park', 'landuse', 'landcover', 'building', 'aeroway'].includes(sourceLayer) ||
          layer.id === 'road_area_pattern'
        ) {
          const colorKey = layer.type === 'fill' ? 'fill-color' : 'fill-extrusion-color';
          setLayerPaint(glMap, layer.id, colorKey, BRAND_MAP_COLORS.land);

          if (layer.type === 'fill') {
            setLayerPaint(glMap, layer.id, 'fill-outline-color', BRAND_MAP_COLORS.land);
          }
        }
      }

      if (layer.type === 'line') {
        if (sourceLayer === 'waterway') {
          setLayerPaint(glMap, layer.id, 'line-color', BRAND_MAP_COLORS.water);
          continue;
        }

        if (layer.id === 'boundary_2' || layer.id === 'boundary_disputed') {
          setLayerPaint(glMap, layer.id, 'line-color', BRAND_MAP_COLORS.line);
          continue;
        }

        if (layer.id === 'boundary_3') {
          setLayerPaint(glMap, layer.id, 'line-color', BRAND_MAP_COLORS.line);
          continue;
        }

        if (sourceLayer === 'transportation' || sourceLayer === 'aeroway') {
          setLayerPaint(glMap, layer.id, 'line-color', BRAND_MAP_COLORS.road);
        }
      }

      if (layer.type === 'symbol') {
        setLayerPaint(glMap, layer.id, 'text-color', BRAND_MAP_COLORS.label);
        setLayerPaint(glMap, layer.id, 'text-halo-color', BRAND_MAP_COLORS.halo);
        setLayerPaint(glMap, layer.id, 'icon-opacity', 0);
      }
    }
  }

  function updateMarkerIcons() {
    const partnerSource = mapLibreMap?.getSource(PARTNER_SOURCE_ID);
    if (!partnerSource) return;
    partnerSource.setData(getPartnerGeoJson());
  }

  function closePartnerTooltip() {
    popupInstance?._map?.closePopup(popupInstance);
  }

  function openPartnerTooltip(locationIndex) {
    if (!mapInstance || !popupInstance) return;

    popupInstance
      .setLatLng(locations[locationIndex].coords)
      .setContent(getPartnerPopupContent(locationIndex))
      .openOn(mapInstance);
  }

  function clearHoveredPartner() {
    if (hoveredIndex === null) return;

    hoveredIndex = null;
    updateMarkerIcons();
    closePartnerTooltip();
  }

  function setHoveredPartner(locationIndex) {
    if (hoveredIndex === locationIndex) return;

    hoveredIndex = locationIndex;
    updateMarkerIcons();
    openPartnerTooltip(locationIndex);
  }

  function centerMapOn(coords, zoom = SEARCH_ZOOM) {
    clearHoveredPartner();

    if (mapInstance) {
      mapInstance.flyTo(coords, zoom, {
        duration: 0.8
      });
    }
  }

  function handleSearchSubmit() {
    const origin = resolveSearchOrigin(searchQuery);

    if (!origin) {
      return;
    }

    centerMapOn(origin.coords, SEARCH_ZOOM);
  }

  function handleLocateMe() {
    if (!navigator.geolocation) {
      return;
    }

    isLocating = true;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        isLocating = false;
        centerMapOn([coords.latitude, coords.longitude], GEOLOCATE_ZOOM);
      },
      () => {
        isLocating = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  function zoomMapBy(delta) {
    if (!mapInstance) return;
    mapInstance.setZoom(mapInstance.getZoom() + delta);
  }

  function getHoveredLocationIndex(event) {
    if (!mapLibreMap) return null;

    const features = mapLibreMap.queryRenderedFeatures([event.containerPoint.x, event.containerPoint.y], {
      layers: [PARTNER_PIN_LAYER_ID, PARTNER_PIN_ACTIVE_LAYER_ID]
    });

    if (!features.length) {
      return null;
    }

    const locationIndex = Number(features[0].properties.index);
    return Number.isNaN(locationIndex) ? null : locationIndex;
  }

  async function initMap() {
    if (hasActivated || !mapElement || mapInstance) return;

    hasActivated = true;
    isMapLoading = true;

    try {
      await loadMapModules();

      mapInstance = L.map(mapElement, {
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: true,
        maxBounds: [
          [-180, -Infinity],
          [180, Infinity]
        ],
        maxBoundsViscosity: 1,
        minZoom: 1
      }).setView([9.935, -84.091], 8);

      mapInstance.attributionControl.setPrefix(false);
      popupInstance = L.popup({
        closeButton: false,
        autoPan: false,
        offset: [0, -28],
        className: 'partner-popup'
      });

      mapLibreLayer = L.maplibreGL({
        style: OPEN_FREE_MAP_STYLE,
        interactive: false,
        padding: 0,
        maplibreGL: maplibregl,
        className: 'partners-maplibre-canvas',
        attributionControl: {
          customAttribution: MAP_ATTRIBUTION
        }
      }).addTo(mapInstance);

      mapLibreMap = mapLibreLayer.getMaplibreMap();
      const applyStyle = async () => {
        applyBrandMapStyle(mapLibreMap);
        await ensurePartnerPinLayers(mapLibreMap);
        updateMarkerIcons();
        isMapReady = true;
        isMapLoading = false;
      };

      if (mapLibreMap.isStyleLoaded()) {
        await applyStyle();
      } else {
        mapLibreMap.once('load', applyStyle);
      }

      const handleMapPointerMove = (event) => {
        const locationIndex = getHoveredLocationIndex(event);

        if (locationIndex === null) {
          mapInstance.getContainer().style.cursor = '';
          clearHoveredPartner();
          return;
        }

        mapInstance.getContainer().style.cursor = 'pointer';
        setHoveredPartner(locationIndex);
      };

      const handleMapPointerLeave = () => {
        mapInstance.getContainer().style.cursor = '';
        clearHoveredPartner();
      };

      mapInstance.on('mousemove', handleMapPointerMove);
      mapInstance.on('mouseout', handleMapPointerLeave);

      if ('ResizeObserver' in window) {
        mapResizeObserver = new ResizeObserver(() => {
          requestAnimationFrame(() => mapInstance?.invalidateSize(false));
        });
        mapResizeObserver.observe(mapElement);
      }

      mapCleanup = () => {
        mapInstance?.off('mousemove', handleMapPointerMove);
        mapInstance?.off('mouseout', handleMapPointerLeave);
        mapResizeObserver?.disconnect();
        mapResizeObserver = null;
      };

      requestAnimationFrame(() => mapInstance?.invalidateSize());
    } catch (error) {
      isMapLoading = false;
      hasActivated = false;
      console.error(error);
    }
  }

  onMount(() => {
    let observer;

    if (window.location.hash === '#alianzas' || !sectionEl || !('IntersectionObserver' in window)) {
      scheduleMapInit();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            scheduleMapInit();
            observer.disconnect();
          }
        },
        { rootMargin: '640px 0px' }
      );

      observer.observe(sectionEl);
    }

    return () => {
      observer?.disconnect();
      cancelScheduledMapInit();
      mapCleanup();
      mapResizeObserver?.disconnect();
      mapResizeObserver = null;

      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }

      mapLibreLayer = null;
      mapLibreMap = null;
      popupInstance = null;
      isMapLoading = false;
      isMapReady = false;
    };
  });
</script>

<section id="alianzas" class="section partners" bind:this={sectionEl}>
  <div class="container partners-stack">
    <div class="partners-intro">
      <h2 class="section-title partners-title">Alianzas que impulsan tu camino</h2>
    </div>

    <div class="partners-map">
      <div class="map-shell-frame" class:map-shell-frame--ready={isMapReady}>
        <div class="map-placeholder" aria-hidden="true">
          <span class="map-placeholder__route map-placeholder__route--one"></span>
          <span class="map-placeholder__route map-placeholder__route--two"></span>
          <span class="map-placeholder__route map-placeholder__route--three"></span>
          <span class="map-placeholder__pin map-placeholder__pin--one"></span>
          <span class="map-placeholder__pin map-placeholder__pin--two"></span>
          <span class="map-placeholder__pin map-placeholder__pin--three"></span>
          <span class="map-placeholder__pin map-placeholder__pin--four"></span>
        </div>
        <div
          class="map-shell"
          bind:this={mapElement}
          aria-label="Mapa de aliados"
          aria-busy={isMapLoading && !isMapReady}
        ></div>
      </div>

      <form class="partners-search" on:submit|preventDefault={handleSearchSubmit}>
        <label class="partners-search-field">
          <span class="sr-only">Codigo postal o ciudad</span>
          <input
            bind:value={searchQuery}
            type="text"
            name="partner-location"
            placeholder="Ej. 10101 o Heredia"
            autocomplete="postal-code"
          />
        </label>

        <button
          class="partners-search-action partners-icon-button"
          type="button"
          on:click={handleLocateMe}
          disabled={isLocating}
          aria-label="Ubicarme"
          data-tooltip={isLocating ? 'Ubicando...' : 'Ubicarme'}
        >
          <img src={targetIcon} alt="" aria-hidden="true" />
        </button>
        <button
          class="partners-search-icon partners-icon-button"
          type="submit"
          aria-label="Buscar aliado"
          data-tooltip="Buscar"
        >
          <img src={searchIcon} alt="" aria-hidden="true" />
        </button>
      </form>

      <div class="partners-zoom-controls" aria-label="Controles de zoom del mapa">
        <button
          class="partners-zoom-button"
          type="button"
          on:click={() => zoomMapBy(1)}
          aria-label="Acercar mapa"
          data-tooltip="Acercar"
        >
          <span aria-hidden="true">+</span>
        </button>
        <button
          class="partners-zoom-button"
          type="button"
          on:click={() => zoomMapBy(-1)}
          aria-label="Alejar mapa"
          data-tooltip="Alejar"
        >
          <span aria-hidden="true">-</span>
        </button>
      </div>
    </div>
  </div>
</section>

<style>
  .partners {
    background: var(--c-crema);
    position: relative;
    height: 100%;
    min-height: calc(100vh - var(--hero-safe-top, 0px));
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
    padding: calc(clamp(28px, 3.2vw, 40px) + var(--hero-safe-top, 0px)) 0
      clamp(28px, 3.2vw, 40px);
  }

  .partners-title {
    width: auto;
    max-width: none;
    margin: 0;
    color: var(--c-navy);
    text-align: center;
    white-space: nowrap;
    font-size: clamp(1.1rem, 1.8vw + 0.75rem, 2.85rem);
  }

  .partners-stack {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: min(1280px, 96vw);
    max-width: 1280px;
    margin: 0 auto;
    gap: clamp(18px, 2.2vw, 28px);
    align-content: start;
    min-height: calc(100vh - var(--hero-safe-top, 0px) - clamp(56px, 6.4vw, 80px));
  }

  .partners-intro {
    width: 100%;
    margin: 0 auto;
    display: grid;
    justify-items: center;
  }

  .partners-map {
    position: relative;
    width: 100%;
    min-height: min(clamp(540px, 72vh, 860px), calc(100vh - var(--hero-safe-top, 0px) - 150px));
    display: flex;
  }

  .map-shell-frame {
    width: 100%;
    min-height: inherit;
    flex: 1 1 auto;
    border-radius: clamp(22px, 2vw, 30px);
    overflow: hidden;
    position: relative;
    z-index: 0;
    border: 1px solid rgba(18, 41, 65, 0.12);
    box-shadow: var(--shadow-soft);
    background: #fff6e2;
  }

  .map-shell {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: transparent;
  }

  .map-shell-frame::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 246, 226, 0.06), rgba(255, 246, 226, 0));
    pointer-events: none;
    z-index: 350;
  }

  .map-placeholder {
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    background:
      radial-gradient(circle at 18% 22%, rgba(213, 181, 132, 0.22), transparent 23%),
      radial-gradient(circle at 76% 78%, rgba(18, 41, 65, 0.12), transparent 28%),
      linear-gradient(135deg, #fff6e2 0%, #f1f1ef 54%, #fff6e2 100%);
    opacity: 1;
    transition: opacity 360ms ease, visibility 360ms ease;
    pointer-events: none;
  }

  .map-shell-frame--ready .map-placeholder {
    opacity: 0;
    visibility: hidden;
  }

  .map-placeholder::before,
  .map-placeholder::after {
    content: '';
    position: absolute;
    inset: -18%;
    background-image:
      linear-gradient(rgba(213, 181, 132, 0.22) 1px, transparent 1px),
      linear-gradient(90deg, rgba(213, 181, 132, 0.18) 1px, transparent 1px);
    background-size: 92px 92px;
    transform: rotate(-10deg) scale(1.08);
    filter: blur(1px);
    opacity: 0.72;
  }

  .map-placeholder::after {
    background-size: 168px 168px;
    transform: rotate(12deg) scale(1.12);
    opacity: 0.36;
  }

  .map-placeholder__route {
    position: absolute;
    height: 14px;
    border-radius: 999px;
    background: rgba(213, 181, 132, 0.46);
    filter: blur(5px);
    transform-origin: left center;
  }

  .map-placeholder__route--one {
    width: 58%;
    left: 8%;
    top: 35%;
    transform: rotate(-12deg);
  }

  .map-placeholder__route--two {
    width: 48%;
    right: -4%;
    top: 54%;
    transform: rotate(18deg);
  }

  .map-placeholder__route--three {
    width: 42%;
    left: 24%;
    bottom: 21%;
    transform: rotate(-4deg);
  }

  .map-placeholder__pin {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50% 50% 50% 0;
    background: var(--c-navy);
    box-shadow: 0 10px 22px rgba(1, 13, 40, 0.18);
    transform: rotate(-45deg);
  }

  .map-placeholder__pin::after {
    content: '';
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: var(--c-sand);
  }

  .map-placeholder__pin--one {
    left: 26%;
    top: 32%;
  }

  .map-placeholder__pin--two {
    right: 25%;
    top: 44%;
  }

  .map-placeholder__pin--three {
    left: 47%;
    bottom: 25%;
  }

  .map-placeholder__pin--four {
    right: 14%;
    bottom: 18%;
  }

  .partners-search {
    position: absolute;
    top: clamp(16px, 2vw, 24px);
    left: clamp(16px, 2vw, 24px);
    z-index: 900;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 8px;
    align-items: center;
    width: min(620px, calc(100% - 32px));
    padding: 10px 10px 10px 11px;
    border-radius: 999px;
    background: rgba(18, 41, 65, 0.94);
    border: 1px solid rgba(213, 181, 132, 0.56);
    box-shadow: 0 14px 32px rgba(1, 13, 40, 0.22);
    overflow: visible;
  }

  .partners-search::before {
    content: none;
  }

  .partners-search::after {
    content: none;
  }

  .partners-search-field {
    display: block;
    position: relative;
    z-index: 1;
  }

  .partners-search-field input {
    width: 100%;
    height: 44px;
    min-height: 44px;
    padding: 0 17px;
    border-radius: 999px;
    border: 1px solid rgba(255, 246, 226, 0.18);
    background: rgba(255, 246, 226, 0.08);
    color: #ffffff;
    outline: none;
    transition: border-color 200ms ease, box-shadow 200ms ease, background 200ms ease;
  }

  .partners-search-field input::placeholder {
    color: rgba(255, 255, 255, 0.64);
  }

  .partners-search-field input:focus {
    border-color: var(--c-sand);
    box-shadow: 0 0 0 4px rgba(213, 181, 132, 0.18);
    background: rgba(255, 246, 226, 0.12);
  }

  .partners-search-action {
    position: relative;
    z-index: 1;
    height: 44px;
    min-height: 44px;
    padding-inline: 17px;
  }

  .partners-search-action:disabled,
  .partners-search-icon:disabled,
  .partners-zoom-button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .partners-icon-button {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid rgba(213, 181, 132, 0.72);
    border-radius: 999px;
    background: rgba(255, 246, 226, 0.08);
    color: #ffffff;
    cursor: pointer;
    box-shadow: none;
    transition: transform 200ms ease, border-color 200ms ease, opacity 200ms ease,
      background 200ms ease;
  }

  .partners-search-icon {
    border-color: rgba(213, 181, 132, 0.72);
  }

  .partners-search-action {
    border-color: rgba(255, 246, 226, 0.22);
  }

  .partners-icon-button img {
    width: 18px;
    height: 18px;
    display: block;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(100%);
  }

  .partners-icon-button:hover,
  .partners-icon-button:focus-visible {
    transform: translateY(-1px);
  }

  .partners-search-action:hover,
  .partners-search-action:focus-visible {
    border-color: rgba(255, 246, 226, 0.5);
  }

  .partners-search-icon:hover,
  .partners-search-icon:focus-visible {
    border-color: var(--c-sand);
    background: rgba(213, 181, 132, 0.16);
  }

  .partners-icon-button::after,
  .partners-zoom-button::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 50%;
    bottom: calc(100% + 10px);
    transform: translate(-50%, 6px);
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(1, 13, 40, 0.96);
    color: #ffffff;
    font-size: 0.74rem;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    z-index: 12;
    transition: opacity 180ms ease, transform 180ms ease;
    box-shadow: 0 10px 20px rgba(1, 13, 40, 0.22);
  }

  .partners-icon-button:hover::after,
  .partners-icon-button:focus-visible::after,
  .partners-zoom-button:hover::after,
  .partners-zoom-button:focus-visible::after {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  .partners-zoom-controls {
    position: absolute;
    right: clamp(16px, 2vw, 24px);
    bottom: clamp(16px, 2vw, 24px);
    z-index: 700;
    display: grid;
    gap: 8px;
  }

  .partners-zoom-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: 1px solid rgba(255, 246, 226, 0.22);
    background: rgba(18, 41, 65, 0.94);
    color: #ffffff;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(1, 13, 40, 0.18);
    transition: transform 200ms ease, border-color 200ms ease, background 200ms ease;
  }

  .partners-zoom-button span {
    font-size: 1.35rem;
    line-height: 1;
    transform: translateY(-1px);
  }

  .partners-zoom-button:hover,
  .partners-zoom-button:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(255, 246, 226, 0.46);
    background: rgba(1, 13, 40, 0.96);
  }

  :global(.leaflet-container) {
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    z-index: 0;
    background: #fff6e2;
  }

  :global(.leaflet-gl-layer) {
    background: #fff6e2;
  }

  :global(.partners-maplibre-canvas) {
    filter: none;
  }

  :global(.leaflet-control-attribution) {
    background: rgba(255, 246, 226, 0.92) !important;
    color: rgba(1, 13, 40, 0.68) !important;
    border-radius: 10px 0 0 0;
    padding: 4px 8px !important;
    font-size: 0.65rem;
    line-height: 1.3;
  }

  :global(.leaflet-control-attribution a) {
    color: var(--c-navy-dark) !important;
  }

  :global(.partner-popup) {
    pointer-events: none;
  }

  :global(.partner-popup .leaflet-popup-content-wrapper) {
    background: var(--c-navy-deep);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    box-shadow: 0 18px 34px rgba(1, 13, 40, 0.28);
  }

  :global(.partner-popup .leaflet-popup-content) {
    margin: 0;
    min-width: 210px;
    font-size: 0.84rem;
    line-height: 1.45;
  }

  :global(.partner-popup .leaflet-popup-tip) {
    background: var(--c-navy-deep);
  }

  :global(.partner-tooltip-card) {
    display: grid;
    gap: 4px;
    padding: 12px 14px;
  }

  :global(.partner-tooltip-card strong) {
    font-size: 0.94rem;
    color: #ffffff;
  }

  :global(.partner-tooltip-card span) {
    color: rgba(255, 255, 255, 0.82);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 980px) {
    .partners {
      padding: calc(clamp(24px, 5vw, 36px) + var(--hero-safe-top, 0px)) 0
        clamp(24px, 5vw, 36px);
    }

    .partners-stack {
      min-height: auto;
    }

    .partners-map {
      min-height: clamp(420px, 72vw, 680px);
    }

    .partners-search {
      width: min(560px, calc(100% - 24px));
      top: 12px;
      left: 12px;
    }
  }

  @media (max-width: 640px) {
    .partners {
      min-height: auto;
      padding: calc(20px + var(--hero-safe-top, 0px)) 0 20px;
    }

    .partners-stack {
      gap: 14px;
      min-height: auto;
    }

    .partners-title {
      font-size: clamp(1.05rem, 5vw, 1.42rem);
    }

    .partners-map {
      min-height: clamp(380px, 74vh, 620px);
    }

    .partners-search {
      grid-template-columns: minmax(0, 1fr) auto auto;
      width: calc(100% - 20px);
      top: 10px;
      left: 10px;
      padding: 10px 10px 10px 11px;
      border-radius: 20px;
    }

    .partners-search-action {
      height: 44px;
      min-height: 44px;
      padding-inline: 14px;
      font-size: 0.84rem;
    }

    .partners-search-icon {
      width: 44px;
      height: 44px;
    }

    .partners-zoom-controls {
      right: 10px;
      bottom: 10px;
    }
  }
</style>
