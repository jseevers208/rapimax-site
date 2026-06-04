import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ICON_OPACITY = 0.9;
const ICON_HIGHLIGHT_OPACITY = 0.98;
const POINTER_RANGE = 1.35;
const HIGHLIGHT_LERP = 0.12;
const NAVY_COLOR = 0x122941;
const NAVY_DEEP_COLOR = 0x264a70;
const CREAM_COLOR = 0xfff6e2;
const ARENA_COLOR = 0xd5b584;
const NAVY_COLOR_OBJ = new THREE.Color(NAVY_COLOR);
const NAVY_DEEP_COLOR_OBJ = new THREE.Color(NAVY_DEEP_COLOR);
const CREAM_COLOR_OBJ = new THREE.Color(CREAM_COLOR);
const MAX_PIXEL_RATIO = 2;
const SMALL_CANVAS_MAX_PIXEL_RATIO = 1.25;
const SETTLE_EPSILON = 0.002;
const DRACO_DECODER_PATH = '/draco/';

const atlasPromises = new Map();
let dracoLoader;
let gltfLoader;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getGltfLoader = () => {
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
  }

  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
  }

  return gltfLoader;
};

const loadAtlas = (atlasUrl) => {
  if (!atlasPromises.has(atlasUrl)) {
    const promise = getGltfLoader()
      .loadAsync(atlasUrl)
      .then((gltf) => gltf.scene);
    atlasPromises.set(atlasUrl, promise);
  }

  return atlasPromises.get(atlasUrl);
};

const createIconMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: NAVY_COLOR,
    metalness: 0.08,
    roughness: 0.18,
    clearcoat: 0.86,
    clearcoatRoughness: 0.16,
    iridescence: 0.18,
    iridescenceIOR: 1.2,
    iridescenceThicknessRange: [120, 320],
    sheen: 0.34,
    sheenColor: new THREE.Color(0x6f96c0),
    sheenRoughness: 0.4,
    anisotropy: 0.45,
    anisotropyRotation: 0,
    emissive: new THREE.Color(NAVY_DEEP_COLOR),
    emissiveIntensity: 0.14,
    transparent: true,
    opacity: ICON_OPACITY,
    side: THREE.FrontSide,
    depthWrite: true
  });

const cloneIconFromAtlas = (atlas, iconName) => {
  const source = atlas.getObjectByName(iconName);
  if (!source) {
    throw new Error(`Baked icon "${iconName}" was not found in the GLB atlas`);
  }

  const group = source.clone(false);
  group.name = iconName;

  source.children.forEach((child) => {
    const childClone = child.clone(false);
    childClone.position.copy(child.position);
    childClone.rotation.copy(child.rotation);
    childClone.scale.copy(child.scale);
    childClone.quaternion.copy(child.quaternion);
    group.add(childClone);
  });

  group.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry = child.geometry.clone();
    child.material = createIconMaterial();
  });

  return group;
};

export class BakedIconScene {
  constructor(canvas, atlasUrl, options = {}) {
    if (!canvas) throw new Error('Canvas is required');
    if (!atlasUrl) throw new Error('Baked icon atlas URL is required');
    if (!options.iconName) throw new Error('Baked icon name is required');

    this.canvas = canvas;
    this.atlasUrl = atlasUrl;
    this.iconName = options.iconName;
    this.onReady = typeof options.onReady === 'function' ? options.onReady : () => {};
    this.onError = typeof options.onError === 'function' ? options.onError : () => {};
    this.reduceMotion = Boolean(options.reduceMotion);
    this.pointerX = 0;
    this.pointerY = 0;
    this.pointerCurrentX = 0;
    this.pointerCurrentY = 0;
    this.highlighted = false;
    this.highlightMix = 0;
    this.paused = false;
    this.disposed = false;
    this.autoRotate = Boolean(options.autoRotate);
    this.autoRotateSpeed =
      typeof options.autoRotateSpeed === 'number' ? options.autoRotateSpeed : 0.00105;
    this.autoRotateRange =
      typeof options.autoRotateRange === 'number' ? options.autoRotateRange : 0.22;
    this.autoRotatePitchRange =
      typeof options.autoRotatePitchRange === 'number' ? options.autoRotatePitchRange : 0.06;
    this.maxPixelRatio =
      typeof options.maxPixelRatio === 'number' ? options.maxPixelRatio : SMALL_CANVAS_MAX_PIXEL_RATIO;
    this.rafId = null;
    this.resizeObserver = null;
    this.width = 0;
    this.height = 0;
    this.iconGroup = null;
    this.materials = [];

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxPixelRatio, MAX_PIXEL_RATIO));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
    this.camera.position.set(0, 0.1, 5.4);
    this.camera.lookAt(0, 0, 0);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    const hemi = new THREE.HemisphereLight(0xfbf4e6, 0x8d6f42, 1.02);
    const key = new THREE.DirectionalLight(0xffffff, 1.32);
    key.position.set(-2.4, 2.8, 3.2);
    const fill = new THREE.DirectionalLight(0xe1bf8f, 0.5);
    fill.position.set(2.5, 1.4, 2.8);
    this.accentLight = new THREE.DirectionalLight(ARENA_COLOR, 0.84);
    this.accentTarget = new THREE.Object3D();
    this.accentLight.position.set(3.2, 0.7, 2.6);
    this.accentTarget.position.set(0.2, 0.06, 0);
    this.accentLight.target = this.accentTarget;
    this.scene.add(hemi, key, fill, this.accentLight, this.accentTarget);

    this.resize();
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.requestRender());
      this.resizeObserver.observe(canvas);
    }
    this.render = this.render.bind(this);
    this.loadIcon();
  }

  async loadIcon() {
    try {
      const atlas = await loadAtlas(this.atlasUrl);
      if (this.disposed) return;

      this.iconGroup = cloneIconFromAtlas(atlas, this.iconName);
      this.root.add(this.iconGroup);
      this.materials = [];
      this.iconGroup.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        this.materials.push(child.material);
      });
      this.onReady();
      this.requestRender();
    } catch (error) {
      if (this.disposed) return;
      this.onError(error);
    }
  }

  setPointer(x, y) {
    const nextPointerX = clamp(x, -POINTER_RANGE, POINTER_RANGE);
    const nextPointerY = clamp(y, -POINTER_RANGE, POINTER_RANGE);
    if (nextPointerX === this.pointerX && nextPointerY === this.pointerY) return;
    this.pointerX = nextPointerX;
    this.pointerY = nextPointerY;
    this.requestRender();
  }

  setReducedMotion(value) {
    const nextReduceMotion = Boolean(value);
    if (nextReduceMotion === this.reduceMotion) return;
    this.reduceMotion = nextReduceMotion;
    this.requestRender();
  }

  setHighlighted(value) {
    const nextHighlighted = Boolean(value);
    if (nextHighlighted === this.highlighted) return;
    this.highlighted = nextHighlighted;
    this.requestRender();
  }

  setAutoRotate(value) {
    const nextAutoRotate = Boolean(value);
    if (nextAutoRotate === this.autoRotate) return;
    this.autoRotate = nextAutoRotate;
    this.requestRender();
  }

  setAutoRotateOptions(options = {}) {
    if (typeof options.autoRotateSpeed === 'number') {
      this.autoRotateSpeed = options.autoRotateSpeed;
    }

    if (typeof options.autoRotateRange === 'number') {
      this.autoRotateRange = options.autoRotateRange;
    }

    if (typeof options.autoRotatePitchRange === 'number') {
      this.autoRotatePitchRange = options.autoRotatePitchRange;
    }

    this.requestRender();
  }

  setPaused(value) {
    const nextPaused = Boolean(value);
    if (nextPaused === this.paused) return;
    this.paused = nextPaused;

    if (this.paused) {
      this.pointerX = 0;
      this.pointerY = 0;
      this.pointerCurrentX = 0;
      this.pointerCurrentY = 0;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      return;
    }

    this.requestRender();
  }

  resize() {
    const width = Math.max(1, Math.floor(this.canvas.clientWidth));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight));
    if (width === this.width && height === this.height) return false;

    this.width = width;
    this.height = height;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxPixelRatio, MAX_PIXEL_RATIO));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    return true;
  }

  requestRender() {
    if (this.paused || this.rafId !== null || !this.iconGroup) return;
    this.rafId = requestAnimationFrame(this.render);
  }

  shouldContinueRendering() {
    if (this.paused || !this.iconGroup) return false;
    if (this.autoRotate && !this.reduceMotion) return true;

    const pointerSettled =
      Math.abs(this.pointerX - this.pointerCurrentX) < SETTLE_EPSILON &&
      Math.abs(this.pointerY - this.pointerCurrentY) < SETTLE_EPSILON;
    const highlightSettled =
      Math.abs((this.highlighted ? 1 : 0) - this.highlightMix) < SETTLE_EPSILON;

    return !pointerSettled || !highlightSettled;
  }

  dispose() {
    this.disposed = true;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.iconGroup?.traverse((child) => {
      if (!child.isMesh) return;
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose?.());
      } else {
        child.material?.dispose?.();
      }
    });

    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
  }

  render(now = performance.now()) {
    this.rafId = null;
    if (this.paused || !this.iconGroup) return;

    this.resize();

    const followLerp = this.reduceMotion ? 0.24 : 0.12;
    const highlightLerp = this.reduceMotion ? 0.22 : HIGHLIGHT_LERP;
    this.pointerCurrentX += (this.pointerX - this.pointerCurrentX) * followLerp;
    this.pointerCurrentY += (this.pointerY - this.pointerCurrentY) * followLerp;
    this.highlightMix += ((this.highlighted ? 1 : 0) - this.highlightMix) * highlightLerp;

    const autoRotateMix = this.autoRotate && !this.reduceMotion ? 1 : 0;
    const autoYaw = autoRotateMix
      ? Math.sin(now * this.autoRotateSpeed) * this.autoRotateRange
      : 0;
    const autoPitch = autoRotateMix
      ? Math.cos(now * this.autoRotateSpeed * 0.82) * this.autoRotatePitchRange
      : 0;
    const drift = autoRotateMix ? Math.sin(now * 0.001) * 0.06 : 0;
    const yaw = this.pointerCurrentX * 0.26 + autoYaw;
    const pitch = -this.pointerCurrentY * 0.16 + autoPitch;

    this.root.rotation.x = -0.12 + pitch;
    this.root.rotation.y = yaw;
    this.root.position.y = drift;

    this.accentLight.position.set(
      3.2 + (this.pointerCurrentX + autoYaw * 0.75) * 2,
      0.68 + (this.pointerCurrentY + autoPitch * 0.85) * 0.8,
      2.6
    );
    this.accentTarget.position.set(
      0.18 + (this.pointerCurrentX + autoYaw * 0.45) * 0.22,
      0.04 + (this.pointerCurrentY + autoPitch * 0.45) * 0.18,
      0
    );

    const pointerMag = Math.max(Math.abs(this.pointerCurrentX), Math.abs(this.pointerCurrentY));
    for (let i = 0; i < this.materials.length; i += 1) {
      const material = this.materials[i];
      const targetOpacity = THREE.MathUtils.lerp(ICON_OPACITY, ICON_HIGHLIGHT_OPACITY, this.highlightMix);
      material.anisotropyRotation = this.pointerCurrentX * 0.7 + this.pointerCurrentY * 0.24;
      material.roughness = clamp(0.16 + pointerMag * 0.05, 0.12, 0.24);
      material.iridescence = clamp(0.16 + pointerMag * 0.12, 0.12, 0.32);
      material.clearcoatRoughness = clamp(0.14 + pointerMag * 0.04, 0.11, 0.24);
      material.color.copy(NAVY_COLOR_OBJ).lerp(CREAM_COLOR_OBJ, this.highlightMix);
      material.emissive.copy(NAVY_DEEP_COLOR_OBJ).lerp(NAVY_COLOR_OBJ, this.highlightMix);
      material.opacity = targetOpacity;
    }

    this.renderer.render(this.scene, this.camera);

    if (this.shouldContinueRendering()) {
      this.requestRender();
    }
  }
}
