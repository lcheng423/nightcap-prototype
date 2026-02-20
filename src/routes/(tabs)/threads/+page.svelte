<script>
  import { onMount } from 'svelte';

  const BASE_SIZE = 242;
  const MIN_SIZE = 228;
  const MAX_SIZE = 258;
  const SAFE_INSET = 8;
  const BLOB_ITEMS = [
    { id: 'creativity', label: 'CREATIVITY', color: '#7D6C26' },
    { id: 'friend', label: 'FRIEND', color: '#CB6F3E' },
    { id: 'self', label: 'SELF', color: '#D56B93' },
    { id: 'future', label: 'FUTURE', color: '#FFCD69' },
    { id: 'me', label: 'ME', color: '#406673' }
  ];

  const ANCHORS = [
    { x: 0.28, y: 0.22 },
    { x: 0.72, y: 0.24 },
    { x: 0.25, y: 0.57 },
    { x: 0.68, y: 0.58 },
    { x: 0.48, y: 0.83 }
  ];

  let stageEl;
  let blobLayout = [];

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function hexToRgb(hex) {
    const sanitized = hex.replace('#', '');
    const parsed = parseInt(sanitized, 16);
    return {
      r: (parsed >> 16) & 255,
      g: (parsed >> 8) & 255,
      b: parsed & 255
    };
  }

  function buildBlobLayout(stageWidth, stageHeight) {
    return BLOB_ITEMS.map((item, index) => {
      const anchor = ANCHORS[index];
      const size = Math.round(randomBetween(MIN_SIZE, MAX_SIZE));
      const padY = 15.73 * (size / BASE_SIZE);
      const padX = 30.25 * (size / BASE_SIZE);
      const gap = 12.1 * (size / BASE_SIZE);
      const radius = 24.2 * (size / BASE_SIZE);
      const jitterX = randomBetween(-20, 20);
      const jitterY = randomBetween(-20, 20);
      const minX = size / 2 + SAFE_INSET;
      const maxX = stageWidth - size / 2 - SAFE_INSET;
      const minY = size / 2 + SAFE_INSET;
      const maxY = stageHeight - size / 2 - SAFE_INSET;
      const x = clamp(anchor.x * stageWidth + jitterX, minX, maxX);
      const y = clamp(anchor.y * stageHeight + jitterY, minY, maxY);
      const driftX = randomBetween(6, 18);
      const driftY = randomBetween(6, 18);
      const driftDuration = randomBetween(6.5, 10.5);
      const bobDuration = randomBetween(5.8, 9.6);
      const delay = randomBetween(-10, 0);
      const rgb = hexToRgb(item.color);

      return {
        ...item,
        style: [
          `left:${x}px`,
          `top:${y}px`,
          `width:${size}px`,
          `height:${size}px`,
          `--blob-dx:${driftX}px`,
          `--blob-dy:${driftY}px`,
          `--drift-duration:${driftDuration}s`,
          `--bob-duration:${bobDuration}s`,
          `--blob-delay:${delay}s`
        ].join(';'),
        surfaceStyle: [
          `padding:${padY}px ${padX}px`,
          `gap:${gap}px`,
          `border-radius:${radius}px`,
          `background:radial-gradient(50% 50% at 50% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.60) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.00) 100%)`
        ].join(';')
      };
    });
  }

  function refreshBlobLayout() {
    if (!stageEl) return;
    blobLayout = buildBlobLayout(stageEl.clientWidth, stageEl.clientHeight);
  }

  onMount(() => {
    refreshBlobLayout();
    window.addEventListener('resize', refreshBlobLayout);
    return () => {
      window.removeEventListener('resize', refreshBlobLayout);
    };
  });
</script>

<div class="page-body scrollbar-hide">
  <div style="display:flex; align-items:center; gap:12px; margin-bottom: 16px;">
    <img src="/assets/courtneys-cat.jpeg" alt="Profile" style="width:56px; height:56px; border-radius:22px; object-fit:cover;" />
    <h1 class="top-title">Threads</h1>
  </div>

  <div class="threads-blob-stage" bind:this={stageEl}>
    {#each blobLayout as blob (blob.id)}
      <div class="blob" style={blob.style} aria-label={blob.label}>
        <div class="blob-drift">
          <div class="blob-bob">
            <div class="blob-surface" style={blob.surfaceStyle}>
              <span class="blob-label">{blob.label}</span>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .threads-blob-stage {
    position: relative;
    min-height: clamp(470px, 62vh, 620px);
    margin-top: 6px;
    overflow: hidden;
    pointer-events: none;
  }

  .blob {
    position: absolute;
    transform: translate(-50%, -50%);
    will-change: transform;
  }

  .blob-drift {
    width: 100%;
    height: 100%;
    animation: blob-drift var(--drift-duration) ease-in-out var(--blob-delay) infinite alternate;
  }

  .blob-bob {
    width: 100%;
    height: 100%;
    animation: blob-bob var(--bob-duration) ease-in-out var(--blob-delay) infinite;
  }

  .blob-surface {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .blob-label {
    color: #fff;
    text-align: center;
    font-family: 'DIN Rounded', sans-serif;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
    letter-spacing: 0;
  }

  @keyframes blob-drift {
    0% {
      transform: translate3d(calc(-1 * var(--blob-dx)), calc(-1 * var(--blob-dy)), 0);
    }
    50% {
      transform: translate3d(var(--blob-dx), 0px, 0);
    }
    100% {
      transform: translate3d(0px, var(--blob-dy), 0);
    }
  }

  @keyframes blob-bob {
    0% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -8px, 0);
    }
    100% {
      transform: translate3d(0, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .blob-drift,
    .blob-bob {
      animation: none;
    }
  }
</style>
