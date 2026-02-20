<script>
  import { onMount } from 'svelte';

  const BASE_SIZE = 242;
  const MIN_SIZE = 208;
  const MAX_SIZE = 236;
  const SAFE_INSET = 8;
  const BLOB_VERTICAL_OFFSET = 30;
  const BLOB_ITEMS = [
    { id: 'creativity', label: 'CREATIVITY', color: '#7D6C26' },
    { id: 'friend', label: 'FRIEND', color: '#CB6F3E' },
    { id: 'self', label: 'SELF', color: '#D56B93' },
    { id: 'future', label: 'FAMILY', color: '#FFCD69' },
    { id: 'me', label: 'DESIGNER', color: '#406673' }
  ];

  const ANCHORS = [
    { x: 0.36, y: 0.22 },
    { x: 0.63, y: 0.23 },
    { x: 0.37, y: 0.43 },
    { x: 0.62, y: 0.44 },
    { x: 0.50, y: 0.58 }
  ];

  let stageEl;
  let blobLayout = [];
  let timelineEl;
  let timelineLabelEl;
  let selectedTick = 34;
  let timelineLabelStyle = '';
  let isDraggingTimeline = false;

  const TICK_COUNT = 68;
  const PRESENT_TICK = 34;
  const TICK_WIDTH = 2;
  const TICK_GAP = 3;
  const TRACK_SIDE_PADDING = 6;
  const TIMELINE = Array.from({ length: TICK_COUNT }, (_, index) => ({ id: index }));

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
      const jitterX = randomBetween(-12, 12);
      const jitterY = randomBetween(-12, 12);
      const minX = size / 2 + SAFE_INSET;
      const maxX = stageWidth - size / 2 - SAFE_INSET;
      const minY = size / 2 + SAFE_INSET;
      const maxY = stageHeight - size / 2 - SAFE_INSET;
      const x = clamp(anchor.x * stageWidth + jitterX, minX, maxX);
      const y = clamp(anchor.y * stageHeight + jitterY + BLOB_VERTICAL_OFFSET, minY, maxY);
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

  function clampIndex(index) {
    return clamp(index, 0, TICK_COUNT - 1);
  }

  function trackMetrics() {
    const pitch = TICK_WIDTH + TICK_GAP;
    const usable = (TICK_COUNT - 1) * pitch;
    const total = usable + TRACK_SIDE_PADDING * 2;
    return { pitch, usable, total };
  }

  function selectedTickFromPointer(clientX) {
    if (!timelineEl) return selectedTick;
    const rect = timelineEl.getBoundingClientRect();
    const { pitch, usable, total } = trackMetrics();
    const centeredTrackLeft = (rect.width - total) / 2;
    const x = clamp(clientX - rect.left - centeredTrackLeft - TRACK_SIDE_PADDING, 0, usable);
    return clampIndex(Math.round(x / pitch));
  }

  function handleTimelinePointerDown(event) {
    isDraggingTimeline = true;
    if (timelineEl && event.pointerId !== undefined) {
      timelineEl.setPointerCapture(event.pointerId);
    }
    selectedTick = selectedTickFromPointer(event.clientX);
  }

  function handleTimelinePointerMove(event) {
    if (!isDraggingTimeline) return;
    selectedTick = selectedTickFromPointer(event.clientX);
  }

  function handleTimelinePointerUp() {
    isDraggingTimeline = false;
  }

  function labelForSelectedTick() {
    const delta = PRESENT_TICK - selectedTick;
    if (delta === 0) return 'Today';
    const months = Math.abs(delta);
    if (months < 12) {
      const unit = months === 1 ? 'month' : 'months';
      return delta > 0 ? `${months} ${unit} ago` : `${months} ${unit} from now`;
    }
    const years = Math.round((months / 12) * 10) / 10;
    return delta > 0 ? `${years} years ago` : `${years} years from now`;
  }

  function tickStyle(index) {
    const isSelected = index === selectedTick;
    const isPast = index <= PRESENT_TICK;
    const inPastGapToPresent = selectedTick < PRESENT_TICK && index > selectedTick && index <= PRESENT_TICK;
    const inFutureRangeToSelected = selectedTick > PRESENT_TICK && index >= PRESENT_TICK && index <= selectedTick;

    let background = 'rgba(218, 95, 61, 0.2)';
    if (isPast) background = 'rgba(66, 53, 48, 1)';
    if (inPastGapToPresent && !isSelected) background = 'rgba(66, 53, 48, 0.2)';
    if (!isPast && !isSelected) background = 'rgba(218, 95, 61, 0.2)';
    if (inFutureRangeToSelected && !isSelected) background = 'rgba(218, 95, 61, 1)';
    if (isSelected) background = selectedTick >= PRESENT_TICK ? 'rgba(218, 95, 61, 1)' : 'rgba(66, 53, 48, 1)';

    return [
      `height:${isSelected ? 32 : 26}px`,
      `width:${TICK_WIDTH}px`,
      'border-radius:2px',
      `background:${background}`,
      'transition:height 180ms ease, background 180ms ease'
    ].join(';');
  }

  function labelColor() {
    return selectedTick > PRESENT_TICK ? '#DA5F3D' : '#423530';
  }

  function refreshLabelPosition() {
    if (!timelineEl || !timelineLabelEl) return;
    const shellRect = timelineEl.getBoundingClientRect();
    const { pitch, total } = trackMetrics();
    const centeredTrackLeft = (shellRect.width - total) / 2;
    const tickCenter = centeredTrackLeft + TRACK_SIDE_PADDING + selectedTick * pitch + TICK_WIDTH / 2;
    const containerWidth = timelineEl.clientWidth;
    const labelWidth = timelineLabelEl.offsetWidth;

    if (tickCenter + labelWidth <= containerWidth) {
      timelineLabelStyle = [
        `left:${Math.max(0, tickCenter)}px`,
        'right:auto',
        'text-align:left',
        `color:${labelColor()}`
      ].join(';');
      return;
    }

    timelineLabelStyle = [
      'left:auto',
      `right:${Math.max(0, containerWidth - tickCenter)}px`,
      'text-align:right',
      `color:${labelColor()}`
    ].join(';');
  }

  onMount(() => {
    refreshBlobLayout();
    window.addEventListener('resize', refreshBlobLayout);
    window.addEventListener('resize', refreshLabelPosition);
    window.addEventListener('pointerup', handleTimelinePointerUp);
    window.addEventListener('pointercancel', handleTimelinePointerUp);
    requestAnimationFrame(() => {
      refreshLabelPosition();
    });
    return () => {
      window.removeEventListener('resize', refreshBlobLayout);
      window.removeEventListener('resize', refreshLabelPosition);
      window.removeEventListener('pointerup', handleTimelinePointerUp);
      window.removeEventListener('pointercancel', handleTimelinePointerUp);
    };
  });

  $: selectedTick, refreshLabelPosition();
</script>

<div class="page-body scrollbar-hide">
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

  <div class="timeline-shell">
    <div class="timeline-label-wrap">
      <div class="timeline-label" style={timelineLabelStyle} bind:this={timelineLabelEl}>
        {labelForSelectedTick()}
      </div>
    </div>
    <div
      class="timeline-scroll scrollbar-hide"
      bind:this={timelineEl}
      on:pointerdown={handleTimelinePointerDown}
      on:pointermove={handleTimelinePointerMove}
      on:keydown={(event) => {
        if (event.key === 'ArrowLeft') selectedTick = clampIndex(selectedTick - 1);
        if (event.key === 'ArrowRight') selectedTick = clampIndex(selectedTick + 1);
      }}
      role="slider"
      tabindex="0"
      aria-valuemin="0"
      aria-valuemax={TICK_COUNT - 1}
      aria-valuenow={selectedTick}
      aria-label="Threads timeline"
    >
      <div class="timeline-track">
        {#each TIMELINE as tick (tick.id)}
          <button
            class="tick-btn"
            style={tickStyle(tick.id)}
            on:click={() => {
              selectedTick = tick.id;
              refreshLabelPosition();
            }}
            aria-label={`Select time ${tick.id}`}
          ></button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .page-body {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-bottom: 136px;
  }

  .threads-blob-stage {
    position: relative;
    flex: 1;
    min-height: clamp(360px, 52vh, 520px);
    margin-top: -22px;
    margin-bottom: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .timeline-shell {
    position: absolute;
    left: 24px;
    right: 24px;
    bottom: 130px;
  }

  .timeline-label-wrap {
    position: relative;
    height: 18px;
    margin-bottom: 12px;
  }

  .timeline-label {
    position: absolute;
    top: 0;
    color: #423530;
    font-family: 'DIN Rounded', sans-serif;
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 0;
    white-space: nowrap;
    transition: color 180ms ease, left 180ms ease, right 180ms ease;
  }

  .timeline-scroll {
    overflow: hidden;
    padding: 0;
    touch-action: none;
    cursor: ew-resize;
  }

  .timeline-track {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    width: max-content;
    padding: 0 6px;
    margin: 0 auto;
  }

  .tick-btn {
    border: none;
    padding: 0;
    cursor: pointer;
    background: transparent;
    flex: 0 0 auto;
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
    .blob-bob,
    .tick-btn {
      animation: none;
    }
  }
</style>
