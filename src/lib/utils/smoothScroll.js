import Lenis from 'lenis';

let lenis = null;

const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

const addMediaListener = (mediaQuery, handler) => {
  if (typeof mediaQuery?.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  mediaQuery?.addListener?.(handler);
  return () => mediaQuery?.removeListener?.(handler);
};

const shouldEnableSmoothScroll = (reduceMotionMedia, finePointerMedia) =>
  !reduceMotionMedia.matches && finePointerMedia.matches;

const createLenis = () =>
  new Lenis({
    autoRaf: true,
    smoothWheel: true,
    syncTouch: false,
    lerp: 0.085,
    wheelMultiplier: 0.92
  });

const destroyLenis = () => {
  lenis?.destroy();
  lenis = null;
};

export const initSmoothScroll = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const reduceMotionMedia = window.matchMedia(REDUCE_MOTION_QUERY);
  const finePointerMedia = window.matchMedia(FINE_POINTER_QUERY);

  const syncSmoothScroll = () => {
    if (!shouldEnableSmoothScroll(reduceMotionMedia, finePointerMedia)) {
      destroyLenis();
      return;
    }

    if (!lenis) {
      lenis = createLenis();
    }
  };

  syncSmoothScroll();

  const removeReduceMotionListener = addMediaListener(reduceMotionMedia, syncSmoothScroll);
  const removeFinePointerListener = addMediaListener(finePointerMedia, syncSmoothScroll);

  return () => {
    removeReduceMotionListener();
    removeFinePointerListener();
    destroyLenis();
  };
};
