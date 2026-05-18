<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import GlowRing from './GlowRing.svelte';
  import heroSvgMarkup from '../../assets/hero/RM_Lines.svg?raw';
  import heroLogoMarkup from '../../assets/hero/RM_Logo.svg?raw';

  const introWords = 'Financiamiento de vehículos simple y flexible'.split(' ');

  // DOM refs
  let heroShell, heroViewport, maskLayer, svgWrapper, logoWrapper, logoGlowIdleAuraWrapper, logoGlowHoverAuraWrapper, logoGlowHitArea;

  let pinState = 'before';
  let rafId, introRafId, logoIntroRafId, logoLoopRafId, removeWindowListeners;
  let logoLoopStartTime = 0;
  let logoLoopPauseMs = 0;
  let logoLoopChains = [];
  let logoGlowIdleAuraLoopChains = [];
  let logoGlowHoverAuraLoopChains = [];
  let scrollProgress = 0;
  let geometry = [], logoGeometry = [], logoGlowIdleAuraGeometry = [], logoGlowHoverAuraGeometry = [];
  let baseProgresses = [], logoBaseProgresses = [];
  let linesIntroActive = false, logoIntroActive = false;
  let removeLogoGlowListeners;
  let logoGlowRafId = null;
  let logoGlowMetrics = null;
  let logoGlowTargetX = 0;
  let logoGlowTargetY = 0;
  let logoGlowCurrentX = 0;
  let logoGlowCurrentY = 0;
  let logoGlowIdleX = 0;
  let logoGlowIdleY = 0;
  let logoGlowHoverOpacity = 0;
  let logoGlowIdleOpacity = 0;
  let logoGlowMode = 'idle-loop';
  let logoGlowBlendRafId = null;
  let logoGlowBlendStartedAt = 0;
  let logoGlowBlendFromIdleOpacity = 0;
  let logoGlowBlendToIdleOpacity = 0;
  let logoGlowBlendFromHoverOpacity = 0;
  let logoGlowBlendToHoverOpacity = 0;
  let logoLoopPhase = 0;
  let prefersReducedMotion = false;
  let heroInView = true;
  let supportsInteractiveLogoGlow = false;
  let mountLogoGlowAura = false;
  let logoGlowAuraReady = false;
  let lastAppliedProgress = -1;

  const shellStyleCache = new Map();

  // Scroll constants
  const SCROLL_MULTIPLIER = 1.3;
  const TOTAL_MULTIPLIER = SCROLL_MULTIPLIER;

  // Phase boundaries (normalized 0-1 over SCROLL_MULTIPLIER screens)
  const ROUND_START = 0;
  const ROUND_END = 0.62;
  const LAYER_SEAM_RADIUS = 80;
  const SCROLL_TRIGGER_THRESHOLD = 0.003;
  const PROGRESS_EPSILON = 0.0005;

  // Utilities
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const LOGO_GLOW_LERP = 0.2;
  const LOGO_GLOW_SNAP = 0.35;
  const LOGO_GLOW_BLEND_DURATION = 260;
  const LOGO_GLOW_IDLE_OPACITY = 1;
  const HERO_ACTIVE_CLASS = 'hero-active';

  const setHeroActiveClass = (active) => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle(HERO_ACTIVE_CLASS, Boolean(active));
  };

  const setShellVar = (name, value) => {
    if (!heroShell) return;
    if (shellStyleCache.get(name) === value) return;
    shellStyleCache.set(name, value);
    heroShell.style.setProperty(name, value);
  };

  const updateLogoGlowLayerPosition = (prefix, x, y, width, height) => {
    if (!heroShell || !logoGlowHitArea) return;
    const clampedX = clamp(x, 0, width);
    const clampedY = clamp(y, 0, height);
    setShellVar(`--logo-glow-${prefix}-x`, `${clampedX}px`);
    setShellVar(`--logo-glow-${prefix}-y`, `${clampedY}px`);
  };

  const syncLogoGlowOpacities = () => {
    setShellVar('--logo-glow-idle-opacity', `${logoGlowIdleOpacity}`);
    setShellVar('--logo-glow-hover-opacity', `${logoGlowHoverOpacity}`);
  };

  const syncLogoGlowPositions = () => {
    const metrics = getLogoGlowMetrics();
    if (!metrics) return;
    updateLogoGlowLayerPosition('idle', logoGlowIdleX, logoGlowIdleY, metrics.width, metrics.height);
    updateLogoGlowLayerPosition('hover', logoGlowCurrentX, logoGlowCurrentY, metrics.width, metrics.height);
  };

  const invalidateLogoGlowMetrics = () => {
    logoGlowMetrics = null;
  };

  const getLogoGlowMetrics = () => {
    if (!logoGlowHitArea) return null;
    if (logoGlowMetrics) return logoGlowMetrics;
    const rect = logoGlowHitArea.getBoundingClientRect();
    const width = Math.max(logoGlowHitArea.offsetWidth || rect.width, 1);
    const height = Math.max(logoGlowHitArea.offsetHeight || rect.height, 1);
    const scaleX = Math.max(rect.width / width, 0.0001);
    const scaleY = Math.max(rect.height / height, 0.0001);
    const logoSvgElement = logoWrapper?.querySelector('svg');
    const logoRect = logoSvgElement?.getBoundingClientRect();
    const viewBox = logoSvgElement?.viewBox?.baseVal;
    let logoBounds = null;
    const logoPaths = logoSvgElement ? Array.from(logoSvgElement.querySelectorAll('path')) : [];
    for (const pathElement of logoPaths) {
      if (typeof pathElement.getBBox !== 'function') continue;
      const bbox = pathElement.getBBox();
      if (!bbox || bbox.width <= 0 || bbox.height <= 0) continue;
      if (!logoBounds) {
        logoBounds = { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
        continue;
      }
      const minX = Math.min(logoBounds.x, bbox.x);
      const minY = Math.min(logoBounds.y, bbox.y);
      const maxX = Math.max(logoBounds.x + logoBounds.width, bbox.x + bbox.width);
      const maxY = Math.max(logoBounds.y + logoBounds.height, bbox.y + bbox.height);
      logoBounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    logoGlowMetrics = {
      rect,
      width,
      height,
      scaleX,
      scaleY,
      logoRect,
      viewBoxWidth: viewBox?.width || 0,
      viewBoxHeight: viewBox?.height || 0,
      logoBounds,
    };
    return logoGlowMetrics;
  };

  const setLogoGlowTargetFromEvent = (event, metrics) => {
    logoGlowTargetX = (event.clientX - metrics.rect.left) / metrics.scaleX;
    logoGlowTargetY = (event.clientY - metrics.rect.top) / metrics.scaleY;
  };

  const stopLogoGlowMotion = () => {
    if (!logoGlowRafId) return;
    cancelAnimationFrame(logoGlowRafId);
    logoGlowRafId = null;
  };

  const stopLogoGlowBlend = () => {
    if (!logoGlowBlendRafId) return;
    cancelAnimationFrame(logoGlowBlendRafId);
    logoGlowBlendRafId = null;
  };

  const completeLogoGlowBlend = () => {
    logoGlowIdleOpacity = logoGlowBlendToIdleOpacity;
    logoGlowHoverOpacity = logoGlowBlendToHoverOpacity;
    logoGlowMode = logoGlowHoverOpacity > logoGlowIdleOpacity ? 'hover-active' : 'idle-loop';
    logoGlowBlendRafId = null;
    syncLogoGlowOpacities();
  };

  const tickLogoGlowBlend = (now) => {
    const t = clamp((now - logoGlowBlendStartedAt) / LOGO_GLOW_BLEND_DURATION, 0, 1);
    const eased = easeOutCubic(t);
    logoGlowIdleOpacity = lerp(logoGlowBlendFromIdleOpacity, logoGlowBlendToIdleOpacity, eased);
    logoGlowHoverOpacity = lerp(logoGlowBlendFromHoverOpacity, logoGlowBlendToHoverOpacity, eased);
    syncLogoGlowOpacities();
    if (t >= 1) {
      completeLogoGlowBlend();
      return;
    }
    logoGlowBlendRafId = requestAnimationFrame(tickLogoGlowBlend);
  };

  const startLogoGlowBlend = ({ idleOpacity, hoverOpacity, mode }) => {
    stopLogoGlowBlend();
    logoGlowMode = mode;
    logoGlowBlendStartedAt = performance.now();
    logoGlowBlendFromIdleOpacity = logoGlowIdleOpacity;
    logoGlowBlendFromHoverOpacity = logoGlowHoverOpacity;
    logoGlowBlendToIdleOpacity = idleOpacity;
    logoGlowBlendToHoverOpacity = hoverOpacity;
    logoGlowBlendRafId = requestAnimationFrame(tickLogoGlowBlend);
  };

  const setLogoGlowHidden = () => {
    stopLogoGlowBlend();
    logoGlowMode = 'idle-loop';
    logoGlowIdleOpacity = 0;
    logoGlowHoverOpacity = 0;
    syncLogoGlowOpacities();
  };

  const projectSvgPointToLogoGlow = ({ x, y }, metrics) => {
    if (!metrics?.logoRect || !metrics.viewBoxWidth || !metrics.viewBoxHeight) return null;
    const offsetLeft = metrics.logoRect.left - metrics.rect.left;
    const offsetTop = metrics.logoRect.top - metrics.rect.top;
    const pointX = (offsetLeft + (x / metrics.viewBoxWidth) * metrics.logoRect.width) / metrics.scaleX;
    const pointY = (offsetTop + (y / metrics.viewBoxHeight) * metrics.logoRect.height) / metrics.scaleY;
    return { x: pointX, y: pointY };
  };

  const tickLogoGlow = () => {
    const metrics = getLogoGlowMetrics();
    if (!metrics) {
      logoGlowRafId = null;
      return;
    }

    const dx = logoGlowTargetX - logoGlowCurrentX;
    const dy = logoGlowTargetY - logoGlowCurrentY;
    logoGlowCurrentX += dx * LOGO_GLOW_LERP;
    logoGlowCurrentY += dy * LOGO_GLOW_LERP;

    if (Math.abs(dx) < LOGO_GLOW_SNAP && Math.abs(dy) < LOGO_GLOW_SNAP) {
      logoGlowCurrentX = logoGlowTargetX;
      logoGlowCurrentY = logoGlowTargetY;
    }

    updateLogoGlowLayerPosition('hover', logoGlowCurrentX, logoGlowCurrentY, metrics.width, metrics.height);

    if (
      Math.abs(logoGlowTargetX - logoGlowCurrentX) < LOGO_GLOW_SNAP &&
      Math.abs(logoGlowTargetY - logoGlowCurrentY) < LOGO_GLOW_SNAP
    ) {
      logoGlowRafId = null;
      return;
    }

    logoGlowRafId = requestAnimationFrame(tickLogoGlow);
  };

  const startLogoGlowMotion = () => {
    if (logoGlowRafId) return;
    logoGlowRafId = requestAnimationFrame(tickLogoGlow);
  };

  const onLogoGlowPointerMove = (event) => {
    const metrics = getLogoGlowMetrics();
    if (!metrics) return;
    setLogoGlowTargetFromEvent(event, metrics);
    startLogoGlowMotion();
  };

  const onLogoGlowPointerEnter = async (event) => {
    const auraReady = await ensureLogoGlowAura();
    if (!auraReady) return;
    invalidateLogoGlowMetrics();
    const metrics = getLogoGlowMetrics();
    if (!metrics) return;
    setLogoGlowTargetFromEvent(event, metrics);
    logoGlowCurrentX = logoGlowTargetX;
    logoGlowCurrentY = logoGlowTargetY;
    updateLogoGlowLayerPosition('hover', logoGlowCurrentX, logoGlowCurrentY, metrics.width, metrics.height);
    startLogoGlowBlend({ idleOpacity: 0, hoverOpacity: 1, mode: 'hover-blending-in' });
  };

  const onLogoGlowPointerLeave = () => {
    stopLogoGlowMotion();
    startLogoGlowBlend({ idleOpacity: heroInView && pinState !== 'after' ? LOGO_GLOW_IDLE_OPACITY : 0, hoverOpacity: 0, mode: 'hover-blending-out' });
  };

  const bindLogoGlowListeners = () => {
    if (!logoGlowHitArea || removeLogoGlowListeners) return;

    logoGlowHitArea.addEventListener('pointerenter', onLogoGlowPointerEnter);
    logoGlowHitArea.addEventListener('pointermove', onLogoGlowPointerMove);
    logoGlowHitArea.addEventListener('pointerleave', onLogoGlowPointerLeave);

    removeLogoGlowListeners = () => {
      logoGlowHitArea.removeEventListener('pointerenter', onLogoGlowPointerEnter);
      logoGlowHitArea.removeEventListener('pointermove', onLogoGlowPointerMove);
      logoGlowHitArea.removeEventListener('pointerleave', onLogoGlowPointerLeave);
      removeLogoGlowListeners = null;
    };
  };

  const unbindLogoGlowListeners = () => {
    removeLogoGlowListeners?.();
    stopLogoGlowMotion();
    setLogoGlowHidden();
  };

  const updateLogoGlowInteractivity = () => {
    const shouldTrack = heroInView && supportsInteractiveLogoGlow && !prefersReducedMotion && pinState !== 'after';
    if (shouldTrack) {
      bindLogoGlowListeners();
    } else {
      unbindLogoGlowListeners();
    }
  };

  // SVG stroke configs
  const pathConfigs = [
    { reverse: true, introTarget: 1 },
    { reverse: false, introTarget: 1 },
    { reverse: true, introTarget: 1 },
  ];

  const logoPathConfigs = [
    { reverse: true, introTarget: 1, introDelay: 300, introDuration: 1200 },
    { reverse: true, introTarget: 1, introDelay: 100, introDuration: 1200 },
    { reverse: true, introTarget: 1, introDelay: 600, introDuration: 1200 },
    { reverse: false, introTarget: 1, introDelay: 200, introDuration: 1200 },
    { reverse: true, introTarget: 1, introDelay: 300, introDuration: 1200 },
    { reverse: true, introTarget: 1, introDelay: 100, introDuration: 1200 },
    { reverse: true, introTarget: 1, introDelay: 600, introDuration: 1200 },
    { reverse: false, introTarget: 1, introDelay: 200, introDuration: 1200 },
  ];

  const INTRO_LINES_DURATION = 2000;
  const INTRO_LOGO_MAX_DURATION = Math.max(...logoPathConfigs.map((c) => (c.introDelay ?? 0) + (c.introDuration ?? 1200)));
  const LOGO_LOOP_INITIAL_PAUSE = 950;
  const LOGO_LOOP_CYCLE_DURATION = 8200;
  const ENABLE_LOGO_LOOP = true;
  const LOGO_LOOP_VISIBLE_RATIO = 1;
  const LOGO_LOOP_GAP_RATIO = 1 / 3;
  const LOGO_LOOP_DEFAULT_PHASE_RATE = 1;
  const LOGO_LOOP_M_CHAIN_PHASE_RATE = 0.5;
  const LOGO_LOOP_CHAIN_CONFIGS = [
    { indices: [1, 2], phaseRate: LOGO_LOOP_M_CHAIN_PHASE_RATE },
    { indices: [5, 6], phaseRate: LOGO_LOOP_M_CHAIN_PHASE_RATE },
  ];
  const LOGO_GLOW_IDLE_ORBIT_RADIUS_X = 0.46;
  const LOGO_GLOW_IDLE_ORBIT_RADIUS_Y = 0.36;
  const LOGO_GLOW_IDLE_ORBIT_TILT = -0.3;

  const buildGeometry = (svgElement, configs, { stroke, opacity = 1 }) =>
    Array.from(svgElement.querySelectorAll('path'))
      .map((element, index) => {
        if (typeof element.getTotalLength !== 'function') return null;
        const length = element.getTotalLength();
        const reverse = configs[index]?.reverse ?? false;
        element.style.stroke = stroke;
        element.style.strokeOpacity = `${opacity}`;
        element.style.opacity = `${opacity}`;
        element.style.strokeLinecap = 'butt';
        element.style.strokeDasharray = `${length}`;
        element.style.strokeDashoffset = `${(reverse ? -1 : 1) * length}`;
        return { element, length, reverse };
      })
      .filter(Boolean);

  const prepareSvgElement = (svgElement) => {
    if (!svgElement) return;
    svgElement.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    svgElement.style.cssText = 'width:100%;height:auto;display:block';
  };

  const getLoopHotspotPoint = (phase, metrics = getLogoGlowMetrics()) => {
    if (!metrics?.logoBounds) return null;

    const topLeft = projectSvgPointToLogoGlow(
      { x: metrics.logoBounds.x, y: metrics.logoBounds.y },
      metrics
    );
    const bottomRight = projectSvgPointToLogoGlow(
      { x: metrics.logoBounds.x + metrics.logoBounds.width, y: metrics.logoBounds.y + metrics.logoBounds.height },
      metrics
    );
    if (!topLeft || !bottomRight) return null;

    const logoWidth = bottomRight.x - topLeft.x;
    const logoHeight = bottomRight.y - topLeft.y;
    if (logoWidth <= 0 || logoHeight <= 0) return null;

    const orbitPhase = normalizePhase(phase);
    const angle = orbitPhase * Math.PI * 2;
    const centerX = topLeft.x + logoWidth / 2;
    const centerY = topLeft.y + logoHeight / 2;
    const radiusX = logoWidth * LOGO_GLOW_IDLE_ORBIT_RADIUS_X;
    const radiusY = logoHeight * LOGO_GLOW_IDLE_ORBIT_RADIUS_Y;
    const orbitX = Math.cos(angle) * radiusX;
    const orbitY = Math.sin(angle) * radiusY;
    const cosTilt = Math.cos(LOGO_GLOW_IDLE_ORBIT_TILT);
    const sinTilt = Math.sin(LOGO_GLOW_IDLE_ORBIT_TILT);

    return {
      x: centerX + orbitX * cosTilt - orbitY * sinTilt,
      y: centerY + orbitX * sinTilt + orbitY * cosTilt,
    };
  };

  const updateIdleGlowHotspot = (phase = logoLoopPhase) => {
    const metrics = getLogoGlowMetrics();
    if (!metrics) return;
    const point = getLoopHotspotPoint(phase, metrics);
    if (!point) {
      logoGlowIdleX = metrics.width / 2;
      logoGlowIdleY = metrics.height / 2;
    } else {
      logoGlowIdleX = point.x;
      logoGlowIdleY = point.y;
    }
    updateLogoGlowLayerPosition('idle', logoGlowIdleX, logoGlowIdleY, metrics.width, metrics.height);
  };

  const hydrateLogoGlowAura = () => {
    if (logoGlowAuraReady) return true;
    const logoGlowIdleAuraElement = logoGlowIdleAuraWrapper?.querySelector('svg');
    const logoGlowHoverAuraElement = logoGlowHoverAuraWrapper?.querySelector('svg');
    if (!logoGlowIdleAuraElement || !logoGlowHoverAuraElement) return false;

    [logoGlowIdleAuraElement, logoGlowHoverAuraElement].forEach(prepareSvgElement);
    logoGlowIdleAuraGeometry = buildGeometry(logoGlowIdleAuraElement, logoPathConfigs, { stroke: 'var(--c-arena)' });
    logoGlowHoverAuraGeometry = buildGeometry(logoGlowHoverAuraElement, logoPathConfigs, { stroke: 'var(--c-arena)' });
    setProgress(logoGlowIdleAuraGeometry, logoPathConfigs, logoBaseProgresses);
    setProgress(logoGlowHoverAuraGeometry, logoPathConfigs, logoBaseProgresses);
    logoGlowAuraReady = true;
    return true;
  };

  const ensureLogoGlowAura = async () => {
    if (logoGlowAuraReady) return true;
    if (!mountLogoGlowAura) {
      mountLogoGlowAura = true;
      await tick();
    }
    return hydrateLogoGlowAura();
  };

  const setProgress = (geometryItems, configs, baseProg = []) => {
    geometryItems.forEach(({ element, length, reverse }, index) => {
      const baseProgress = clamp(baseProg[index] ?? configs[index]?.introTarget ?? 1, 0, 1);
      element.style.strokeDashoffset = `${(reverse ? -1 : 1) * length * (1 - baseProgress)}`;
    });
  };

  const normalizePhase = (phase) => ((phase % 1) + 1) % 1;

  const buildLoopChains = (items, chainConfigs) =>
    chainConfigs
      .map(({ indices, phaseRate, visibleRatioScale }) => {
        let totalLength = 0;
        const members = indices
          .map((index) => {
            const item = items[index];
            if (!item) return null;
            const member = { index, prefix: totalLength };
            totalLength += item.length;
            return member;
          })
          .filter(Boolean);
        if (members.length < 2 || totalLength <= 0) return null;
        return { members, totalLength, phaseRate: phaseRate ?? 1, visibleRatioScale: visibleRatioScale ?? 1 };
      })
      .filter(Boolean);

  const applyLoopDashPatternForItems = (items, chains, { visibleRatio, gapRatio }) => {
    items.forEach(({ element, length }) => {
      element.style.strokeDasharray = `${length * visibleRatio} ${length * gapRatio}`;
    });

    chains.forEach(({ members, totalLength, visibleRatioScale }) => {
      const basePeriodRatio = visibleRatio + gapRatio;
      const chainVisibleRatio = visibleRatio * (visibleRatioScale ?? 1);
      const chainGapRatio = Math.max(basePeriodRatio - chainVisibleRatio, 0);
      const dashLength = totalLength * chainVisibleRatio;
      const gapLength = totalLength * chainGapRatio;

      members.forEach(({ index }) => {
        const item = items[index];
        if (!item) return;
        item.element.style.strokeDasharray = `${dashLength} ${gapLength}`;
      });
    });
  };

  const applyLogoLoopDashPattern = () => {
    const loopDashConfig = { visibleRatio: LOGO_LOOP_VISIBLE_RATIO, gapRatio: LOGO_LOOP_GAP_RATIO };
    applyLoopDashPatternForItems(logoGeometry, logoLoopChains, loopDashConfig);
    applyLoopDashPatternForItems(logoGlowIdleAuraGeometry, logoGlowIdleAuraLoopChains, loopDashConfig);
    applyLoopDashPatternForItems(logoGlowHoverAuraGeometry, logoGlowHoverAuraLoopChains, loopDashConfig);
  };

  const resetLogoDashPattern = () => {
    logoGeometry.forEach(({ element, length }) => {
      element.style.strokeDasharray = `${length}`;
    });
    logoGlowIdleAuraGeometry.forEach(({ element, length }) => {
      element.style.strokeDasharray = `${length}`;
    });
    logoGlowHoverAuraGeometry.forEach(({ element, length }) => {
      element.style.strokeDasharray = `${length}`;
    });
  };

  const setLoopTravelForItems = (items, chains, phase, { visibleRatio, gapRatio, defaultPhaseRate }) => {
    const normalizedPhase = normalizePhase(phase * defaultPhaseRate);

    items.forEach(({ element, length, reverse }) => {
      const direction = reverse ? 1 : -1;
      const period = length * (visibleRatio + gapRatio);
      element.style.strokeDashoffset = `${direction * period * normalizedPhase}`;
    });

    chains.forEach(({ members, totalLength, phaseRate }) => {
      const chainPhase = normalizePhase(phase * (phaseRate ?? defaultPhaseRate));
      const period = totalLength * (visibleRatio + gapRatio);

      members.forEach(({ index, prefix }) => {
        const item = items[index];
        if (!item) return;
        const direction = item.reverse ? 1 : -1;
        item.element.style.strokeDashoffset = `${direction * (period * chainPhase + prefix)}`;
      });
    });
  };

  const setLogoLoopTravel = (phase = 0) => {
    const loopTravelConfig = {
      visibleRatio: LOGO_LOOP_VISIBLE_RATIO,
      gapRatio: LOGO_LOOP_GAP_RATIO,
      defaultPhaseRate: LOGO_LOOP_DEFAULT_PHASE_RATE,
    };

    setLoopTravelForItems(logoGeometry, logoLoopChains, phase, loopTravelConfig);
    setLoopTravelForItems(logoGlowIdleAuraGeometry, logoGlowIdleAuraLoopChains, phase, loopTravelConfig);
    setLoopTravelForItems(logoGlowHoverAuraGeometry, logoGlowHoverAuraLoopChains, phase, loopTravelConfig);
  };

  const stopLogoLoop = ({ resetStroke = false } = {}) => {
    if (logoLoopRafId) {
      cancelAnimationFrame(logoLoopRafId);
      logoLoopRafId = null;
    }
    logoLoopPhase = 0;
    if (resetStroke) {
      resetLogoDashPattern();
      setLogoLoopTravel(0);
      setProgress(logoGeometry, logoPathConfigs, logoBaseProgresses);
      setProgress(logoGlowIdleAuraGeometry, logoPathConfigs, logoBaseProgresses);
      setProgress(logoGlowHoverAuraGeometry, logoPathConfigs, logoBaseProgresses);
      setLogoGlowHidden();
    }
  };

  const tickLogoLoop = (now) => {
    const elapsed = now - logoLoopStartTime;
    if (elapsed <= logoLoopPauseMs) {
      logoLoopPhase = 0;
    } else {
      logoLoopPhase = (elapsed - logoLoopPauseMs) / LOGO_LOOP_CYCLE_DURATION;
    }
    setLogoLoopTravel(logoLoopPhase);
    updateIdleGlowHotspot(logoLoopPhase);
    logoLoopRafId = requestAnimationFrame(tickLogoLoop);
  };

  const startLogoLoop = ({ pauseMs = 0 } = {}) => {
    if (!ENABLE_LOGO_LOOP) return;
    if (prefersReducedMotion || logoIntroActive || !logoGeometry.length || logoLoopRafId) return;
    applyLogoLoopDashPattern();
    logoLoopStartTime = performance.now();
    logoLoopPauseMs = Math.max(pauseMs, 0);
    logoGlowIdleOpacity = supportsInteractiveLogoGlow ? LOGO_GLOW_IDLE_OPACITY : LOGO_GLOW_IDLE_OPACITY;
    logoGlowHoverOpacity = 0;
    syncLogoGlowOpacities();
    updateIdleGlowHotspot(0);
    logoLoopRafId = requestAnimationFrame(tickLogoLoop);
  };

  const updateLogoLoopPlayback = () => {
    if (!ENABLE_LOGO_LOOP) {
      stopLogoLoop({ resetStroke: false });
      return;
    }
    const shouldLoop = heroInView && !prefersReducedMotion && pinState !== 'after' && !logoIntroActive;
    if (shouldLoop) {
      startLogoLoop();
    } else {
      stopLogoLoop({ resetStroke: true });
    }
  };

  function updateScrollProgress() {
    if (!heroShell || !heroViewport) return;
    // Clamp rubber-band overscroll so the hero never drops into `before`
    // when the browser reports negative scroll positions.
    const scrollTop = Math.max(window.scrollY || 0, 0);
    const shellTop = heroShell.offsetTop;
    const shellBottom = shellTop + heroShell.offsetHeight;
    const nextHeroInView = scrollTop + window.innerHeight > shellTop && scrollTop < shellBottom;
    const totalScrollDistance = heroShell.offsetHeight - window.innerHeight;
    if (totalScrollDistance <= 0) {
      scrollProgress = 0;
      return;
    }

    if (nextHeroInView !== heroInView) {
      heroInView = nextHeroInView;
      setHeroActiveClass(heroInView);
      lastAppliedProgress = -1;
      if (!heroInView) {
        unbindLogoGlowListeners();
      }
    }

    const rawScrollProgress = clamp((scrollTop - shellTop) / totalScrollDistance, 0, 1);
    scrollProgress = clamp(rawScrollProgress * (TOTAL_MULTIPLIER / SCROLL_MULTIPLIER), 0, 1);

    let newState;
    if (scrollTop < shellTop) newState = 'before';
    else if (rawScrollProgress >= 1.0) newState = 'after';
    else newState = 'pinned';

    if (newState !== pinState) {
      pinState = newState;
      const vs = heroViewport.style;
      if (pinState === 'before') {
        vs.position = 'absolute';
        vs.top = '0';
        vs.bottom = '';
        vs.zIndex = '';
      } else if (pinState === 'pinned') {
        vs.position = 'fixed';
        vs.top = '0';
        vs.bottom = '';
        vs.zIndex = '2';
      } else {
        vs.position = 'absolute';
        vs.top = `${totalScrollDistance}px`;
        vs.bottom = '';
        vs.zIndex = '';
      }
    }
  }

  function completeIntroEarly() {
    if (!linesIntroActive && !logoIntroActive) return;
    if (!geometry?.length || !logoGeometry?.length) return;
    if (introRafId) {
      cancelAnimationFrame(introRafId);
      introRafId = null;
    }
    if (logoIntroRafId) {
      cancelAnimationFrame(logoIntroRafId);
      logoIntroRafId = null;
    }
    baseProgresses = geometry.map((_, i) => pathConfigs[i]?.introTarget ?? 1);
    logoBaseProgresses = logoGeometry.map((_, i) => logoPathConfigs[i]?.introTarget ?? 1);
    linesIntroActive = false;
    logoIntroActive = false;
    setProgress(geometry, pathConfigs, baseProgresses);
    setProgress(logoGeometry, logoPathConfigs, logoBaseProgresses);
    setProgress(logoGlowIdleAuraGeometry, logoPathConfigs, logoBaseProgresses);
    setProgress(logoGlowHoverAuraGeometry, logoPathConfigs, logoBaseProgresses);
    startLogoLoop({ pauseMs: LOGO_LOOP_INITIAL_PAUSE });
  }

  function applyAnimations(force = false) {
    if (!heroShell || !maskLayer) return;

    updateLogoGlowInteractivity();
    updateLogoLoopPlayback();

    const progressUnchanged = Math.abs(scrollProgress - lastAppliedProgress) < PROGRESS_EPSILON;
    if (!force && progressUnchanged && !linesIntroActive && !logoIntroActive) {
      return;
    }
    lastAppliedProgress = scrollProgress;

    if ((linesIntroActive || logoIntroActive) && scrollProgress > SCROLL_TRIGGER_THRESHOLD) {
      completeIntroEarly();
    }

    setShellVar('--intro-scale', '1');
    setShellVar('--intro-opacity', '1');
    setShellVar('--lines-scale', '1');
    setShellVar('--mask-opacity', '1');

    const roundT = clamp((scrollProgress - ROUND_START) / (ROUND_END - ROUND_START), 0, 1);
    setShellVar('--bottom-radius', `${easeOutCubic(roundT) * LAYER_SEAM_RADIUS}px`);

    if (!linesIntroActive) setProgress(geometry, pathConfigs, baseProgresses);
    if (!logoIntroActive && !logoLoopRafId) {
      setProgress(logoGeometry, logoPathConfigs, logoBaseProgresses);
      setProgress(logoGlowIdleAuraGeometry, logoPathConfigs, logoBaseProgresses);
      setProgress(logoGlowHoverAuraGeometry, logoPathConfigs, logoBaseProgresses);
      updateIdleGlowHotspot(logoLoopPhase);
    }
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      invalidateLogoGlowMetrics();
      updateScrollProgress();
      applyAnimations();
    });
  }

  function onResize() {
    invalidateLogoGlowMetrics();
    lastAppliedProgress = -1;
    onScroll();
  }

  onMount(async () => {
    await tick();
    const initialRect = heroShell?.getBoundingClientRect();
    if (initialRect) {
      heroInView = initialRect.bottom > 0 && initialRect.top < window.innerHeight;
    }
    setHeroActiveClass(heroInView);

    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    supportsInteractiveLogoGlow = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (heroShell) heroShell.style.setProperty('--total-multiplier', TOTAL_MULTIPLIER);
    if (!prefersReducedMotion) {
      mountLogoGlowAura = true;
      await tick();
    }
    const svgElement = svgWrapper?.querySelector('svg');
    const logoElement = logoWrapper?.querySelector('svg');
    if (!svgElement || !logoElement) return;

    [svgElement, logoElement].forEach(prepareSvgElement);

    geometry = buildGeometry(svgElement, pathConfigs, { stroke: 'var(--c-navy-deep)', opacity: 0.34 });
    logoGeometry = buildGeometry(logoElement, logoPathConfigs, { stroke: 'var(--c-navy-deep)' });

    hydrateLogoGlowAura();
    logoLoopChains = buildLoopChains(logoGeometry, LOGO_LOOP_CHAIN_CONFIGS);
    logoGlowIdleAuraLoopChains = buildLoopChains(logoGlowIdleAuraGeometry, LOGO_LOOP_CHAIN_CONFIGS);
    logoGlowHoverAuraLoopChains = buildLoopChains(logoGlowHoverAuraGeometry, LOGO_LOOP_CHAIN_CONFIGS);

    if (prefersReducedMotion) {
      baseProgresses = geometry.map(() => 1);
      logoBaseProgresses = logoGeometry.map(() => 1);
      scrollProgress = 0;
      setProgress(geometry, pathConfigs, baseProgresses);
      setProgress(logoGeometry, logoPathConfigs, logoBaseProgresses);
      setProgress(logoGlowIdleAuraGeometry, logoPathConfigs, logoBaseProgresses);
      setProgress(logoGlowHoverAuraGeometry, logoPathConfigs, logoBaseProgresses);
      setLogoGlowHidden();
      applyAnimations(true);
      return;
    }

    // Intro animation - RM Lines (2s)
    const introStart = performance.now();
    linesIntroActive = true;
    logoIntroActive = true;

    const animateIntro = (now) => {
      const easedT = easeOutCubic(clamp((now - introStart) / INTRO_LINES_DURATION, 0, 1));
      baseProgresses = geometry.map((_, i) => (pathConfigs[i]?.introTarget ?? 1) * easedT);
      setProgress(geometry, pathConfigs, baseProgresses);
      if (easedT < 1) {
        introRafId = requestAnimationFrame(animateIntro);
      } else {
        baseProgresses = geometry.map((_, i) => pathConfigs[i]?.introTarget ?? 1);
        linesIntroActive = false;
        introRafId = null;
        updateScrollProgress();
        setProgress(geometry, pathConfigs, baseProgresses);
      }
    };

    // Intro animation - RM Logo (staggered per-path)
    const logoIntroStart = performance.now();
    const animateLogoIntro = (now) => {
      const elapsed = now - logoIntroStart;
      logoBaseProgresses = logoGeometry.map((_, i) => {
        const cfg = logoPathConfigs[i];
        const localT = clamp((elapsed - (cfg.introDelay ?? 0)) / Math.max(cfg.introDuration ?? 1200, 1), 0, 1);
        return (cfg.introTarget ?? 1) * easeOutCubic(localT);
      });
      setProgress(logoGeometry, logoPathConfigs, logoBaseProgresses);
      setProgress(logoGlowIdleAuraGeometry, logoPathConfigs, logoBaseProgresses);
      setProgress(logoGlowHoverAuraGeometry, logoPathConfigs, logoBaseProgresses);
      if (elapsed < INTRO_LOGO_MAX_DURATION) {
        logoIntroRafId = requestAnimationFrame(animateLogoIntro);
      } else {
        logoBaseProgresses = logoGeometry.map((_, i) => logoPathConfigs[i]?.introTarget ?? 1);
        logoIntroActive = false;
        logoIntroRafId = null;
        startLogoLoop({ pauseMs: LOGO_LOOP_INITIAL_PAUSE });
      }
    };

    introRafId = requestAnimationFrame(animateIntro);
    logoIntroRafId = requestAnimationFrame(animateLogoIntro);
    updateScrollProgress();
    applyAnimations(true);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    removeWindowListeners = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  });

  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (introRafId) cancelAnimationFrame(introRafId);
    if (logoIntroRafId) cancelAnimationFrame(logoIntroRafId);
    stopLogoLoop();

    unbindLogoGlowListeners();
    stopLogoGlowBlend();
    removeWindowListeners?.();
    setHeroActiveClass(false);
  });
</script>

<section id="inicio" class="hero-v2-shell" bind:this={heroShell}>
  <div class="hero-v2" bind:this={heroViewport}>
    <div class="hero-v2-backdrop" aria-hidden="true"></div>
    <div class="hero-v2-frame-stage">
      <div class="hero-v2-clip-frame">
        <!-- Foreground hero stack -->
        <div class="hero-v2-windshield-wrap">
          <div class="hero-v2-mask-layer" bind:this={maskLayer}>
            <!-- Foreground content stack -->
            <div class="hero-v2-mask-content-inner">
              <!-- Full-hero SVG treatment (RM Lines + Logo) -->
              <div class="hero-v2-svg-frame hero-v2-svg-frame--full" aria-hidden="true">
                <div class="hero-v2-svg hero-v2-lines" bind:this={svgWrapper}>{@html heroSvgMarkup}</div>
                {#if mountLogoGlowAura}
                  <div class="hero-v2-svg hero-v2-logo-glow-aura hero-v2-logo-glow-aura--idle" bind:this={logoGlowIdleAuraWrapper}>{@html heroLogoMarkup}</div>
                  <div class="hero-v2-svg hero-v2-logo-glow-aura hero-v2-logo-glow-aura--hover" bind:this={logoGlowHoverAuraWrapper}>{@html heroLogoMarkup}</div>
                {/if}
                <div class="hero-v2-svg hero-v2-logo" bind:this={logoWrapper}>{@html heroLogoMarkup}</div>
                <div class="hero-v2-svg hero-v2-logo-glow-hit" bind:this={logoGlowHitArea}></div>
              </div>

              <!-- Intro text -->
              <div class="hero-v2-text hero-v2-text--intro">
                <h1 aria-label="Financiamiento de vehículos simple y flexible">
                  {#each introWords as word, index}
                    <span class="hero-v2-word" style="--word-delay: {index * 120}ms">{word}</span>{#if index < introWords.length - 1}{' '}{/if}
                  {/each}
                </h1>
                <p class="hero-v2-subhead">Vos elegís el vehículo. Nosotros te ayudamos a hacerlo realidad</p>
                <GlowRing
                  as="a"
                  href="/contactanos"
                  class="btn primary hero-v2-cta hero-v2-cta--intro"
                  glowColor="rgba(213, 181, 132, 0.8)"
                  outlineColor="rgba(213, 181, 132, 0.96)"
                >
                  <span class="hero-v2-cta__label">Contactanos</span>
                </GlowRing>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* Shell - scroll runway */
  .hero-v2-shell {
    position: relative;
    z-index: 2;
    width: 100%;
    height: calc(var(--total-multiplier, 1.3) * 100vh);
    /* Rounded bottom corners on .hero-v2 reveal this shell background. Keep it white to match page canvas. */
    background: var(--c-crema, #ffffff);
    --intro-scale: 1;
    --intro-opacity: 1;
    --lines-scale: 1;
    --mask-opacity: 1;
    --bottom-radius: 0px;
    --logo-glow-idle-x: 50%;
    --logo-glow-idle-y: 50%;
    --logo-glow-idle-opacity: 0;
    --logo-glow-hover-x: 50%;
    --logo-glow-hover-y: 50%;
    --logo-glow-hover-opacity: 0;
    --hero-drop-shadow: 0 24px 42px -20px rgba(1, 13, 40, 0.45);
    --hero-content-max-width: 1280px;
    --hero-bg: var(--c-warm-gray, #f1f1ef);
    --hero-art-offset-x: -24px;
    --hero-art-offset-y: -200px;
    --hero-art-scale: 1.16;
  }

  .hero-v2-shell::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    /* Keep top fallback aligned with the hero background. */
    height: calc(100vh - var(--layer-seam-radius, 80px));
    background: var(--hero-bg, #fff6e2);
    pointer-events: none;
    z-index: 0;
  }

  /* Pinned viewport (JS controls position + z-index) */
  .hero-v2 {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    isolation: isolate;
    border-bottom-left-radius: var(--bottom-radius, 0px);
    border-bottom-right-radius: var(--bottom-radius, 0px);
    box-shadow: var(--hero-drop-shadow, none);
  }

  .hero-v2-backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: var(--hero-bg, #fff6e2);
    pointer-events: none;
  }

  .hero-v2-frame-stage {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .hero-v2-clip-frame {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 0;
    background: var(--hero-bg, #fff6e2);
    box-shadow: none;
  }

  /* Foreground windshield layer */
  .hero-v2-windshield-wrap {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: var(--mask-opacity, 1);
    transition: opacity 120ms linear;
  }

  /* Foreground content stack */
  .hero-v2-mask-content-inner {
    position: absolute;
    top: var(--hero-safe-top, 0px);
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding:
      clamp(18px, 3.6vh, 42px)
      clamp(16px, 3vw, 56px)
      clamp(18px, 4.8vh, 56px);
  }

  /* Foreground mask layer (clipping intentionally disabled) */
  .hero-v2-mask-layer {
    position: absolute;
    inset: 0;
  }

  .hero-v2-mask-layer::before {
    content: '';
    position: absolute;
    inset: 0;
    background: transparent;
    z-index: 0;
    pointer-events: none;
  }

  /* SVG frame */
  .hero-v2-svg-frame {
    position: absolute;
    top: 50%;
    left: 50%;
    width: min(114%, 1360px);
    aspect-ratio: 1920 / 2643.17;
    transform: translate(-50%, -11%) scale(1.34) scale(var(--lines-scale, 1));
    transform-origin: center;
    pointer-events: none;
    z-index: 2;
    will-change: transform;
  }

  .hero-v2-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .hero-v2-svg :global(svg) { width: 100%; height: 100%; }

  .hero-v2-svg-frame--full {
    inset: 0;
    width: 100%;
    aspect-ratio: auto;
    transform: translate(var(--hero-art-offset-x), var(--hero-art-offset-y)) scale(var(--hero-art-scale));
    transform-origin: center;
  }

  .hero-v2-lines :global(path) {
    fill: none !important;
    stroke: var(--c-navy, #122941) !important;
    stroke-opacity: 0.35;
  }
  .hero-v2-logo :global(path) {
    fill: none !important;
    stroke: var(--c-navy, #122941) !important;
    stroke-opacity: 1;
  }
  .hero-v2-lines { z-index: 0; }
  .hero-v2-logo { z-index: 3; }

  .hero-v2-logo-glow-aura {
    pointer-events: none;
    transition: opacity 180ms ease;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    z-index: 2;
    filter: blur(10px) drop-shadow(0 0 34px rgba(213, 181, 132, 0.56)) drop-shadow(0 0 56px rgba(213, 181, 132, 0.3));
    will-change: opacity, filter;
    contain: paint;
  }

  .hero-v2-logo-glow-aura--idle {
    opacity: var(--logo-glow-idle-opacity, 0);
    -webkit-mask-image: radial-gradient(circle 220px at var(--logo-glow-idle-x) var(--logo-glow-idle-y), rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.98) 40%, rgba(0, 0, 0, 0.72) 58%, rgba(0, 0, 0, 0.18) 76%, rgba(0, 0, 0, 0) 100%);
    mask-image: radial-gradient(circle 220px at var(--logo-glow-idle-x) var(--logo-glow-idle-y), rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.98) 40%, rgba(0, 0, 0, 0.72) 58%, rgba(0, 0, 0, 0.18) 76%, rgba(0, 0, 0, 0) 100%);
  }

  .hero-v2-logo-glow-aura--hover {
    opacity: var(--logo-glow-hover-opacity, 0);
    -webkit-mask-image: radial-gradient(circle 156px at var(--logo-glow-hover-x) var(--logo-glow-hover-y), rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.9) 52%, rgba(0, 0, 0, 0) 100%);
    mask-image: radial-gradient(circle 156px at var(--logo-glow-hover-x) var(--logo-glow-hover-y), rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.9) 52%, rgba(0, 0, 0, 0) 100%);
    filter: blur(10px) drop-shadow(0 0 28px rgba(213, 181, 132, 0.62)) drop-shadow(0 0 48px rgba(213, 181, 132, 0.3));
  }

  .hero-v2-logo-glow-hit {
    inset: 0;
    pointer-events: auto;
    z-index: 5;
  }

  .hero-v2-logo-glow-aura :global(path) {
    fill: none !important;
    stroke: var(--c-arena, #d5b584) !important;
    stroke-width: 54px !important;
    stroke-opacity: 0.34 !important;
  }

  .hero-v2-logo-glow-aura--idle :global(path) {
    stroke-opacity: 0.5 !important;
  }

  .hero-v2-logo-glow-aura--hover :global(path) {
    stroke-opacity: 0.62 !important;
  }

  /* Text layers */
  .hero-v2-text {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    z-index: 6;
    pointer-events: none;
    text-align: left;
    color: var(--c-navy, #122941);
    padding: 0;
    max-width: min(540px, 72vw);
    will-change: transform, opacity;
  }

  .hero-v2-text--intro {
    justify-content: flex-end;
    padding: 0;
    transform: scale(var(--intro-scale, 1));
    opacity: var(--intro-opacity, 1);
    max-width: 100%;
  }

  .hero-v2-text--intro h1 {
    font-size: clamp(1.95rem, 1.5vw + 1.15rem, 2.65rem);
    line-height: 1.1;
    margin-bottom: 6px;
    max-width: 24ch;
    text-wrap: balance;
  }

  .hero-v2-text--intro .hero-v2-subhead {
    font-size: clamp(0.98rem, 0.45vw + 0.84rem, 1.12rem);
    line-height: 1.2;
    color: rgba(18, 41, 65, 0.72);
    max-width: 36ch;
    white-space: normal;
  }

  .hero-v2-text p {
    margin: 0;
    font-size: clamp(1.4rem, 1vw + 1.1rem, 2rem);
    color: rgba(18, 41, 65, 0.72);
  }

  /* Word-by-word blur intro (on-load) */
  .hero-v2-text--intro .hero-v2-word {
    display: inline-block;
    opacity: 0;
    filter: blur(12px);
    animation: hero-word-in 600ms ease-out forwards;
    animation-delay: calc(600ms + var(--word-delay, 0ms));
  }

  .hero-v2-subhead {
    opacity: 0;
    filter: blur(12px);
    animation: hero-word-in 700ms ease-out forwards;
    animation-delay: 1400ms;
  }

  @keyframes hero-word-in {
    from { opacity: 0; filter: blur(12px); transform: translateY(6px); }
    to { opacity: 1; filter: blur(0); transform: translateY(0); }
  }

  @keyframes hero-btn-in {
    from { opacity: 0; translate: 0 18px; }
    to { opacity: 1; translate: 0 0; }
  }

  /* CTA buttons */
  :global(.hero-v2-cta),
  :global(.btn.primary.hero-v2-cta) {
    z-index: 12;
    pointer-events: auto;
    padding: clamp(9px, 0.7vw + 7px, 12px) clamp(16px, 1.3vw + 10px, 24px);
    font-size: clamp(0.86rem, 0.35vw + 0.76rem, 0.98rem);
    font-weight: 700;
    letter-spacing: 0.02em;
    box-shadow: 0 14px 28px rgba(1, 13, 40, 0.35);
    --cta-fill: #122941;
    background: var(--cta-fill);
    color: #fff;
    border-color: transparent;
    border-width: 1px;
    --glow-ring-pad: 24px;
    --glow-ring-radius: 72px;
    --glow-ring-outline-width: 1px;
    transition: transform 220ms ease, box-shadow 220ms ease, border-color 200ms ease;
  }

  :global(.hero-v2-cta--intro) {
    margin-top: 1rem;
    opacity: 0;
    translate: 0 18px;
    animation: hero-btn-in 600ms ease-out forwards;
    animation-delay: 1900ms;
  }

  .hero-v2-cta__label {
    position: relative;
    display: inline-block;
    z-index: 2;
  }

  :global(.hero-v2-cta):focus-visible {
    outline: 2px solid #fff6e2;
    outline-offset: 4px;
  }

  :global(.hero-v2-cta):hover,
  :global(.hero-v2-cta):focus-visible {
    transform: scale(1.06);
    box-shadow: 0 20px 40px rgba(1, 13, 40, 0.45);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .hero-v2-shell { height: auto; }

    .hero-v2 {
      position: relative !important;
      top: auto !important;
      bottom: auto !important;
      height: auto;
      min-height: 100vh;
    }

    .hero-v2-word,
    .hero-v2-subhead,
    :global(.hero-v2-cta--intro) {
      animation: none;
      opacity: 1;
      filter: none;
      transform: none;
    }

    .hero-v2-text,
    .hero-v2-svg-frame { will-change: auto; }

    .hero-v2-mask-layer {
      -webkit-mask-image: none !important;
      mask-image: none !important;
    }

    .hero-v2-logo-glow-hit { display: none; }
  }

  /* Compositor-stability fallback while hero is active. */
  :global(.hero-active) .hero-v2 {
    isolation: auto;
  }

  :global(.hero-active) .hero-v2-svg-frame,
  :global(.hero-active) .hero-v2-text,
  :global(.hero-active) .hero-v2-logo-glow-aura {
    will-change: auto;
  }

  :global(.hero-active) .hero-v2-text--intro .hero-v2-word,
  :global(.hero-active) .hero-v2-subhead {
    filter: none !important;
  }

  /* Keep a simple masked halo on the logo while hero-active. */
  :global(.hero-active) .hero-v2-logo-glow-aura :global(path) {
    stroke-opacity: 0.38 !important;
  }

  /* Mobile */
  @media (max-width: 1040px) {
    .hero-v2-mask-content-inner {
      padding:
        clamp(18px, 3.6vh, 38px)
        clamp(14px, 2.4vw, 34px)
        clamp(16px, 4.4vh, 42px);
    }
  }

  @media (max-width: 720px) {
    .hero-v2-shell {
      --hero-art-offset-x: 0px;
      --hero-art-offset-y: -10px;
      --hero-art-scale: 0.75;
    }

    .hero-v2-text h1 { font-size: clamp(1.8rem, 5vw + 0.8rem, 2.8rem); }
    .hero-v2-mask-content-inner {
      top: var(--hero-safe-top, 0px);
      align-items: flex-end;
      justify-content: flex-start;
      padding:
        clamp(16px, 3vh, 26px)
        clamp(12px, 4.5vw, 20px)
        clamp(14px, 4vh, 30px);
    }
    .hero-v2-svg-frame--full {
      inset: 0;
    }
    /* Override line + logo opacity for mobile — navy blue, not gray */
    .hero-v2-lines :global(path) {
      opacity: 0.18 !important;
      stroke: var(--c-navy, #122941) !important;
    }
    .hero-v2-logo :global(path) {
      opacity: 0.9 !important;
      stroke: var(--c-navy, #122941) !important;
    }
    /* Make logo larger on mobile */
    .hero-v2-logo {
      transform: scale(1.3);
      transform-origin: center 40%;
    }
    .hero-v2-text--intro {
      padding: 0;
      max-width: min(90vw, 520px);
    }
    .hero-v2-text--intro .hero-v2-subhead {
      white-space: normal;
    }
  }
</style>
