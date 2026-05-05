<script>
  import { createEventDispatcher } from 'svelte';

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const dispatch = createEventDispatcher();

  let className = '';
  export { className as class };

  let inlineStyle = '';
  export { inlineStyle as style };

  export let as = 'div';
  export let href = undefined;
  export let type = 'button';
  export let disabled = false;
  export let role = undefined;
  export let element = null;
  export let fillContent = false;
  export let glowColor = 'rgba(213, 181, 132, 0.8)';
  export let outlineColor = 'rgba(213, 181, 132, 0.96)';
  export let glowPad = '24px';
  export let glowRadius = '72px';
  export let revealRadius = undefined;
  export let outlineWidth = '1px';
  export let fadeMs = 170;

  let root;

  const setGlowFromEvent = (event) => {
    if (!root || disabled) return;

    const rect = root.getBoundingClientRect();
    const width = Math.max(root.offsetWidth || rect.width, 1);
    const height = Math.max(root.offsetHeight || rect.height, 1);
    const scaleX = Math.max(rect.width / width, 0.0001);
    const scaleY = Math.max(rect.height / height, 0.0001);
    const x = clamp((event.clientX - rect.left) / scaleX, 0, width);
    const y = clamp((event.clientY - rect.top) / scaleY, 0, height);

    root.style.setProperty('--glow-ring-x', `${x}px`);
    root.style.setProperty('--glow-ring-y', `${y}px`);
    root.style.setProperty('--glow-ring-opacity', '1');
  };

  const handleMouseEnter = (event) => {
    dispatch('mouseenter', event);
  };

  const handlePointerEnter = (event) => {
    setGlowFromEvent(event);
    dispatch('pointerenter', event);
  };

  const handlePointerMove = (event) => {
    setGlowFromEvent(event);
    dispatch('pointermove', event);
  };

  const handlePointerLeave = () => {
    if (!root) return;
    root.style.setProperty('--glow-ring-opacity', '0');
    dispatch('pointerleave');
  };

  const handleKeydown = (event) => {
    dispatch('keydown', event);
  };

  const handleFocus = (event) => {
    dispatch('focus', event);
  };

  const handleBlur = (event) => {
    dispatch('blur', event);
  };

  $: element = root;
  $: computedRole = role ?? (as === 'button' || as === 'a' ? undefined : 'group');
  $: computedRevealRadius = revealRadius ?? glowRadius;

  $: rootStyle = [
    `--glow-ring-color: ${glowColor}`,
    `--glow-ring-outline: ${outlineColor}`,
    `--glow-ring-pad: ${glowPad}`,
    `--glow-ring-radius: ${glowRadius}`,
    `--glow-ring-reveal-radius: ${computedRevealRadius}`,
    `--glow-ring-outline-width: ${outlineWidth}`,
    `--glow-ring-fade-ms: ${fadeMs}`,
    inlineStyle,
  ]
    .filter(Boolean)
    .join('; ');
</script>

<svelte:element
  this={as}
  bind:this={root}
  href={as === 'a' ? href : undefined}
  type={as === 'button' ? type : undefined}
  disabled={as === 'button' ? disabled : undefined}
  role={computedRole}
  class={`glow-ring ${className}`.trim()}
  style={rootStyle}
  on:mouseenter={handleMouseEnter}
  on:pointerenter={handlePointerEnter}
  on:pointermove={handlePointerMove}
  on:pointerleave={handlePointerLeave}
  on:keydown={handleKeydown}
  on:focus={handleFocus}
  on:blur={handleBlur}
  {...$$restProps}
>
  <span class="glow-ring__glow" aria-hidden="true">
    <span class="glow-ring__glow-shape"></span>
  </span>
  <span class="glow-ring__content" class:glow-ring__content--fill={fillContent}>
    <slot />
  </span>
</svelte:element>

<style>
  .glow-ring {
    position: relative;
    isolation: isolate;
    overflow: visible;
    --glow-ring-x: 50%;
    --glow-ring-y: 50%;
    --glow-ring-opacity: 0;
  }

  .glow-ring::before {
    content: '';
    position: absolute;
    inset: calc(-1 * var(--glow-ring-outline-width, 1px));
    border: var(--glow-ring-outline-width, 1px) solid var(--glow-ring-outline, rgba(213, 181, 132, 0.96));
    border-radius: inherit;
    pointer-events: none;
    z-index: 1;
  }

  .glow-ring__glow {
    position: absolute;
    inset: calc(-1 * var(--glow-ring-pad, 24px));
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--glow-ring-opacity, 0);
    transition: opacity calc(var(--glow-ring-fade-ms, 170) * 1ms) ease;
    z-index: -1;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-image:
      radial-gradient(
        circle var(--glow-ring-reveal-radius, var(--glow-ring-radius, 72px)) at calc(var(--glow-ring-x) + var(--glow-ring-pad, 24px))
          calc(var(--glow-ring-y) + var(--glow-ring-pad, 24px)),
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 0.92) 56%,
        rgba(0, 0, 0, 0) 100%
      );
    mask-image:
      radial-gradient(
        circle var(--glow-ring-reveal-radius, var(--glow-ring-radius, 72px)) at calc(var(--glow-ring-x) + var(--glow-ring-pad, 24px))
          calc(var(--glow-ring-y) + var(--glow-ring-pad, 24px)),
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 0.92) 56%,
        rgba(0, 0, 0, 0) 100%
      );
  }

  .glow-ring__glow-shape {
    position: absolute;
    inset: var(--glow-ring-pad, 24px);
    border-radius: inherit;
    background: transparent;
    box-shadow: 0 0 18px 6px var(--glow-ring-color, rgba(213, 181, 132, 0.8));
  }

  .glow-ring__content {
    position: relative;
    z-index: 2;
    display: inherit;
    align-items: inherit;
    justify-content: inherit;
    gap: inherit;
    flex-direction: inherit;
  }

  .glow-ring__content--fill {
    position: absolute;
    inset: 0;
    display: flex;
  }
</style>
