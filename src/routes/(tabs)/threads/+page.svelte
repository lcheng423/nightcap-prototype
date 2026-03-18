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
  let timelineShellEl;
  let timelineTrackEl;
  let timelineLabelEl;
  let selectedTick = 34;
  let isScrubbing = false;
  let timelineLabelText = 'Today';
  let timelineLabelStyle = '';
  let selectedTickStyle = '';
  let futureRangeFillStyle = '';
  let pastRangeDimStyle = '';

  const TICK_COUNT = 68;
  const PRESENT_TICK = 34;
  const TICK_WIDTH = 2;
  const TRACK_GAP = 3;
  const TRACK_PADDING = 6;
  const TIMELINE = Array.from({ length: TICK_COUNT }, (_, id) => ({ id }));

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
        x,
        y,
        baseSize: size,
        driftX,
        driftY,
        driftDuration,
        bobDuration,
        delay,
        rgb
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

  function selectTick(index) {
    selectedTick = clampIndex(index);
  }

  function tickIndexFromTrackClientX(clientX) {
    if (!timelineTrackEl) return selectedTick;
    const rect = timelineTrackEl.getBoundingClientRect();
    const usable = Math.max(1, rect.width - TRACK_PADDING * 2);
    const x = clamp(clientX - rect.left - TRACK_PADDING, 0, usable);
    return clampIndex(Math.round((x / usable) * (TICK_COUNT - 1)));
  }

  function handleTrackPointerDown(event) {
    isScrubbing = true;
    selectTick(tickIndexFromTrackClientX(event.clientX));
    if (timelineTrackEl && event.pointerId !== undefined) {
      timelineTrackEl.setPointerCapture(event.pointerId);
    }
  }

  function handleTrackPointerMove(event) {
    if (!isScrubbing) return;
    selectTick(tickIndexFromTrackClientX(event.clientX));
  }

  function handleTrackPointerUp() {
    isScrubbing = false;
  }

  function buildLabelForTick(index) {
    const delta = PRESENT_TICK - index;
    if (delta === 0) return 'Today';
    const months = Math.abs(delta);
    const direction = delta > 0 ? 'past' : 'future';

    function seasonForMonth(monthIndex) {
      if (monthIndex === 11 || monthIndex <= 1) return 'winter';
      if (monthIndex >= 2 && monthIndex <= 4) return 'spring';
      if (monthIndex >= 5 && monthIndex <= 7) return 'summer';
      return 'fall';
    }

    // Offset from current month to get a natural season label.
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + (direction === 'past' ? -months : months), 1);
    const targetSeason = seasonForMonth(target.getMonth());

    if (months < 12) {
      const unit = months === 1 ? 'month' : 'months';
      return delta > 0 ? `${months} ${unit} ago` : `${months} ${unit} from now`;
    }

    if (months < 24) {
      return direction === 'past' ? `Last ${targetSeason}` : `Next ${targetSeason}`;
    }

    const years = Math.round((months / 12) * 10) / 10;
    return delta > 0 ? `${years} years ago` : `${years} years from now`;
  }

  function blobScale(blobId) {
    const monthsAgo = PRESENT_TICK - selectedTick;
    const isRecentPastFocus = monthsAgo === 1 || monthsAgo === 2;
    if (!isRecentPastFocus) return 1;

    if (blobId === 'me' || blobId === 'future' || blobId === 'self') return 1.95;
    if (blobId === 'friend' || blobId === 'creativity') return 0.35;
    return 1;
  }

  function blobAlpha(blobId) {
    const monthsAgo = PRESENT_TICK - selectedTick;
    const isRecentPastFocus = monthsAgo === 1 || monthsAgo === 2;
    if (!isRecentPastFocus) return 1;

    if (blobId === 'me' || blobId === 'future' || blobId === 'self') return 1;
    if (blobId === 'friend' || blobId === 'creativity') return 0.28;
    return 1;
  }

  function blobOuterStyle(blob) {
    const size = Math.round(blob.baseSize * blobScale(blob.id));
    return [
      `left:${blob.x}px`,
      `top:${blob.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      `--blob-dx:${blob.driftX}px`,
      `--blob-dy:${blob.driftY}px`,
      `--drift-duration:${blob.driftDuration}s`,
      `--bob-duration:${blob.bobDuration}s`,
      `--blob-delay:${blob.delay}s`,
      `opacity:${blobAlpha(blob.id)}`
    ].join(';');
  }

  function blobSurfaceStyle(blob) {
    const size = blob.baseSize * blobScale(blob.id);
    const padY = 15.73 * (size / BASE_SIZE);
    const padX = 30.25 * (size / BASE_SIZE);
    const gap = 12.1 * (size / BASE_SIZE);
    const radius = 24.2 * (size / BASE_SIZE);
    return [
      `padding:${padY}px ${padX}px`,
      `gap:${gap}px`,
      `border-radius:${radius}px`,
      `background:radial-gradient(50% 50% at 50% 50%, rgba(${blob.rgb.r}, ${blob.rgb.g}, ${blob.rgb.b}, 0.60) 0%, rgba(${blob.rgb.r}, ${blob.rgb.g}, ${blob.rgb.b}, 0.00) 100%)`
    ].join(';');
  }

  function labelColor() {
    return selectedTick >= PRESENT_TICK ? '#DA5F3D' : '#423530';
  }

  function tickStyle(index) {
    const isPast = index <= PRESENT_TICK;
    const color = isPast
      ? '#423530'
      : 'rgba(218, 95, 61, 0.3)';

    return [
      'height:26px',
      `width:${TICK_WIDTH}px`,
      'border-radius:2px',
      `background:${color}`,
      'transition:background 160ms ease'
    ].join(';');
  }

  function selectedTickColor() {
    return selectedTick >= PRESENT_TICK ? '#DA5F3D' : '#423530';
  }

  function refreshSelectedTickPosition() {
    if (!timelineTrackEl) return;
    const trackRect = timelineTrackEl.getBoundingClientRect();
    const hitEl = timelineTrackEl.querySelector(`.tick-hit[data-tick-index="${selectedTick}"]`);
    if (!hitEl) return;
    const hitRect = hitEl.getBoundingClientRect();
    const tickCenterInTrack = hitRect.left - trackRect.left + hitRect.width / 2;
    selectedTickStyle = [
      `left:${tickCenterInTrack}px`,
      'bottom:0',
      'width:2px',
      'height:32px',
      'border-radius:2px',
      `background:${selectedTickColor()}`,
      'transform:translateX(-50%)',
      'position:absolute',
      'pointer-events:none',
      'transition:left 140ms ease, background 140ms ease'
    ].join(';');
  }

  function refreshFutureRangeFill() {
    if (!timelineTrackEl || selectedTick <= PRESENT_TICK) {
      futureRangeFillStyle = 'display:none';
      return;
    }

    const trackRect = timelineTrackEl.getBoundingClientRect();
    const inner = Math.max(1, trackRect.width - TRACK_PADDING * 2);
    const colWidth = Math.max(0, (inner - (TICK_COUNT - 1) * TRACK_GAP) / TICK_COUNT);
    const step = colWidth + TRACK_GAP;
    const startCenter = TRACK_PADDING + (PRESENT_TICK + 1) * step + colWidth / 2;
    const endCenter = TRACK_PADDING + selectedTick * step + colWidth / 2;
    const left = Math.max(TRACK_PADDING, startCenter - TICK_WIDTH / 2);
    const width = Math.max(TICK_WIDTH, endCenter - startCenter + TICK_WIDTH);

    futureRangeFillStyle = [
      'display:block',
      `left:${left}px`,
      `width:${width}px`,
      'bottom:0',
      'height:26px',
      'position:absolute',
      'pointer-events:none',
      'z-index:1',
      'background:repeating-linear-gradient(to right, #DA5F3D 0 2px, transparent 2px 5px)'
    ].join(';');
  }

  function refreshPastRangeDim() {
    if (!timelineTrackEl || selectedTick >= PRESENT_TICK) {
      pastRangeDimStyle = 'display:none';
      return;
    }

    const trackRect = timelineTrackEl.getBoundingClientRect();
    const inner = Math.max(1, trackRect.width - TRACK_PADDING * 2);
    const colWidth = Math.max(0, (inner - (TICK_COUNT - 1) * TRACK_GAP) / TICK_COUNT);
    const step = colWidth + TRACK_GAP;
    const startCenter = TRACK_PADDING + (selectedTick + 1) * step + colWidth / 2;
    const endCenter = TRACK_PADDING + PRESENT_TICK * step + colWidth / 2;
    const left = Math.max(TRACK_PADDING, startCenter - TICK_WIDTH / 2);
    const width = Math.max(TICK_WIDTH, endCenter - startCenter + TICK_WIDTH);

    pastRangeDimStyle = [
      'display:block',
      `left:${left}px`,
      `width:${width}px`,
      'bottom:0',
      'height:26px',
      'position:absolute',
      'pointer-events:none',
      'z-index:1',
      'background:rgba(238, 225, 196, 0.7)'
    ].join(';');
  }

  function refreshLabelPosition() {
    if (!timelineShellEl || !timelineTrackEl || !timelineLabelEl) return;
    const shellRect = timelineShellEl.getBoundingClientRect();
    const trackRect = timelineTrackEl.getBoundingClientRect();
    const usable = Math.max(1, trackRect.width - TRACK_PADDING * 2);
    const tickCenterInTrack = TRACK_PADDING + (selectedTick / (TICK_COUNT - 1)) * usable;
    const tickCenter = trackRect.left - shellRect.left + tickCenterInTrack;
    const labelWidth = timelineLabelEl.offsetWidth;
    const maxRight = shellRect.width;

    if (tickCenter + labelWidth <= maxRight) {
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
      `right:${Math.max(0, maxRight - tickCenter)}px`,
      'text-align:right',
      `color:${labelColor()}`
    ].join(';');
  }

  onMount(() => {
    refreshBlobLayout();
    window.addEventListener('resize', refreshBlobLayout);
    window.addEventListener('resize', refreshLabelPosition);
    window.addEventListener('resize', refreshSelectedTickPosition);
    window.addEventListener('resize', refreshFutureRangeFill);
    window.addEventListener('resize', refreshPastRangeDim);
    window.addEventListener('pointerup', handleTrackPointerUp);
    window.addEventListener('pointercancel', handleTrackPointerUp);
    requestAnimationFrame(() => {
      refreshLabelPosition();
      refreshSelectedTickPosition();
      refreshFutureRangeFill();
      refreshPastRangeDim();
    });
    return () => {
      window.removeEventListener('resize', refreshBlobLayout);
      window.removeEventListener('resize', refreshLabelPosition);
      window.removeEventListener('resize', refreshSelectedTickPosition);
      window.removeEventListener('resize', refreshFutureRangeFill);
      window.removeEventListener('resize', refreshPastRangeDim);
      window.removeEventListener('pointerup', handleTrackPointerUp);
      window.removeEventListener('pointercancel', handleTrackPointerUp);
    };
  });

  $: selectedTick, refreshLabelPosition();
  $: selectedTick, refreshSelectedTickPosition();
  $: selectedTick, refreshFutureRangeFill();
  $: selectedTick, refreshPastRangeDim();
  $: timelineLabelText = buildLabelForTick(selectedTick);
</script>

<div class="page-body scrollbar-hide">
  <div class="threads-blob-stage" bind:this={stageEl}>
    {#each blobLayout as blob (blob.id)}
      <div
        class="blob"
        style={blobOuterStyle(blob)}
        aria-label={blob.label}
      >
        <div class="blob-drift">
          <div class="blob-bob">
            <div class="blob-surface" style={blobSurfaceStyle(blob)}>
              <span class="blob-label">{blob.label}</span>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <div class="timeline-shell" bind:this={timelineShellEl}>
    <div class="timeline-label-wrap">
      <div class="timeline-label" style={timelineLabelStyle} bind:this={timelineLabelEl}>
        {timelineLabelText}
      </div>
    </div>
    <div
      class="timeline-track"
      bind:this={timelineTrackEl}
      role="slider"
      tabindex="0"
      aria-valuemin="0"
      aria-valuemax={TICK_COUNT - 1}
      aria-valuenow={selectedTick}
      aria-label="Timeline"
      on:keydown={(event) => {
        if (event.key === 'ArrowLeft') selectTick(selectedTick - 1);
        if (event.key === 'ArrowRight') selectTick(selectedTick + 1);
      }}
      on:pointerdown={handleTrackPointerDown}
      on:pointermove={handleTrackPointerMove}
      on:click={(event) => {
        selectTick(tickIndexFromTrackClientX(event.clientX));
      }}
    >
      <div class="past-range-dim" style={pastRangeDimStyle} aria-hidden="true"></div>
      <div class="future-range-fill" style={futureRangeFillStyle} aria-hidden="true"></div>
      {#each TIMELINE as tick (tick.id)}
        <button
          class="tick-hit"
          data-tick-index={tick.id}
          on:click|stopPropagation={() => selectTick(tick.id)}
          on:pointerdown={(event) => {
            isScrubbing = true;
            selectTick(tick.id);
            if (timelineTrackEl && event.pointerId !== undefined) {
              timelineTrackEl.setPointerCapture(event.pointerId);
            }
          }}
          on:pointerenter={() => {
            if (isScrubbing) selectTick(tick.id);
          }}
          aria-label={`Select time ${tick.id}`}
        >
          <span class="tick" style={tickStyle(tick.id)}></span>
        </button>
      {/each}
      <div class="selected-tick" style={selectedTickStyle} aria-hidden="true"></div>
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
    z-index: 20;
    pointer-events: auto;
    overflow: hidden;
  }

  .timeline-label-wrap {
    position: relative;
    height: 18px;
    margin-bottom: 6px;
  }

  .timeline-label {
    position: absolute;
    top: 0;
    font-family: 'DIN Rounded', sans-serif;
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 0;
    white-space: nowrap;
    transition: left 140ms ease, right 140ms ease, color 140ms ease;
  }

  .timeline-track {
    position: relative;
    display: grid;
    grid-template-columns: repeat(68, minmax(0, 1fr));
    column-gap: 3px;
    align-items: flex-end;
    width: 100%;
    padding: 0 6px;
    touch-action: none;
    box-sizing: border-box;
  }

  .tick-hit {
    position: relative;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border: none;
    padding: 0;
    margin: 0;
    background: transparent;
    cursor: ew-resize;
    touch-action: none;
    appearance: none;
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }

  .tick-hit:focus,
  .tick-hit:focus-visible,
  .tick-hit:active {
    outline: none;
    box-shadow: none;
  }

  .tick {
    display: block;
    flex: 0 0 auto;
    pointer-events: none;
  }

  .selected-tick {
    z-index: 3;
  }

  .blob {
    position: absolute;
    transform: translate(-50%, -50%);
    will-change: transform;
    transition: width 280ms ease, height 280ms ease, opacity 280ms ease;
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
