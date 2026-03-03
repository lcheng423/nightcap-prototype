<script>
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  const BLOBS = [
    { left: 16.66, top: -385.24, size: 770, radius: 50.403, color: 'rgba(125,108,38,0.6)' },
    { left: 41.66, top: 358.76, size: 720, radius: 33.363, color: 'rgba(203,111,62,0.6)' },
    { left: 176.66, top: 98.76, size: 450, radius: 33.671, color: 'rgba(213,107,147,0.6)' },
    { left: -408.34, top: -102.24, size: 800, radius: 31.789, color: 'rgba(64,102,115,0.6)' },
    { left: -322.34, top: 548.76, size: 645, radius: 35.526, color: 'rgba(255,205,105,0.6)' }
  ];

  let containerEl;
  let started = false;
  let moveInDone = false;
  let fadeOut = false;
  const DELAY_MS = 3000;
  const MOVE_IN_MS = 500;
  const SPRING_OUT_MS = 600;
  const FADE_OUT_MS = 250;

  onMount(() => {
    const t = setTimeout(() => {
      started = true;
      moveInDone = false;
    }, DELAY_MS);

    const t2 = setTimeout(() => {
      moveInDone = true;
    }, DELAY_MS + MOVE_IN_MS);

    const springOutEnd = DELAY_MS + MOVE_IN_MS + SPRING_OUT_MS;
    const tFade = setTimeout(() => {
      fadeOut = true;
    }, springOutEnd);

    const t3 = setTimeout(() => {
      dispatch('done');
    }, springOutEnd + FADE_OUT_MS + 50);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      clearTimeout(tFade);
      clearTimeout(t3);
    };
  });
</script>

<div
  class="load-screen"
  class:started
  class:move-in-done={moveInDone}
  class:fade-out={fadeOut}
  bind:this={containerEl}
  role="presentation"
>
  <div class="load-screen__bg"></div>

  <!-- Blobs at exact Figma position/size -->
  {#each BLOBS as blob, i}
    <div
      class="load-screen__blob"
      style="
        left: {blob.left}px;
        top: {blob.top}px;
        width: {blob.size}px;
        height: {blob.size}px;
        border-radius: {blob.radius}px;
        background: radial-gradient(circle at 50% 50%, {blob.color}, transparent 70%);
      "
    ></div>
  {/each}

  <!-- Logo: inlined SVG, centered -->
  <div class="load-screen__logo-wrap">
    <svg
      class="load-screen__logo"
      width="154"
      height="110"
      viewBox="0 0 154 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path opacity="0.5" d="M114.828 47.1193C119.402 50.5236 123.513 54.5516 126.813 59.2033C138.424 53.3146 161.35 44.4947 150.851 28.6842C146.808 23.3361 138.507 22.3538 133.331 26.6156C128.326 30.5605 122.484 33.9595 115.945 36.7246C115.93 40.1133 115.395 43.4968 114.256 46.688C114.449 46.8283 114.636 46.9738 114.823 47.1141L114.828 47.1193Z" fill="#FFFBF0"/>
      <path opacity="0.7" d="M53.3538 15.8133C60.1624 17.4868 66.181 21.5096 71.1913 26.3224C78.7171 22.284 87.3448 27.0604 88.6753 34.6382C97.1211 36.9303 105.25 40.5268 112.495 45.4488C122.323 6.01098 71.0769 -16.6964 46.9351 14.8673C49.1024 14.9609 51.2541 15.2779 53.3538 15.8133Z" fill="#FFFBF0"/>
      <path opacity="0.9" d="M108.687 45.3921C99.3262 39.5086 88.6507 35.6366 77.6895 34.2229C83.5365 42.4608 87.7152 52.4138 87.4294 62.4135C91.6029 64.0767 99.0247 69.0922 99.0247 69.0922C101.01 70.667 103.63 73.2917 104.96 75.828L105.043 75.9891C105.22 76.3322 105.386 76.696 105.532 77.0494C107.616 81.2073 105.163 85.1365 103.099 88.6967C98.3387 96.9866 90.2204 102.891 81.2133 105.807C91.6652 110.703 105.854 110.214 115.849 104.564C141.94 89.6011 131.041 58.1309 108.681 45.3921H108.687Z" fill="#FFFBF0"/>
      <path d="M61.3963 66.7842C58.9016 85.3856 86.1931 82.709 85.9592 64.2998H85.9488C87.1026 45.0435 71.2818 23.1781 53.2312 17.9287C31.5321 11.2968 8.71557 35.0593 16.8235 56.3166C24.3025 49.5132 35.1547 43.952 43.9175 40.9687C43.9175 40.9687 46.2511 41.8263 47.0359 42.0914C52.7895 44.0404 61.7653 55.6877 61.5471 64.5701L61.3963 66.7842Z" fill="#FFFBF0"/>
      <path opacity="0.8" d="M82.4743 103.651C90.9564 100.979 107.323 88.5626 104.21 78.1158C101.013 71.723 94.262 67.9965 87.9679 65.1743C87.4482 85.3038 57.5684 87.8505 59.1952 67.3572C52.501 67.8198 42.2569 72.6482 36.1084 78.1418C40.0584 95.4127 56.2743 106.473 74.2624 105.376C78.0773 105.142 80.7072 104.207 82.4743 103.651Z" fill="#FFFBF0"/>
      <path opacity="0.9" d="M59.4592 65.1733C59.9738 56.925 51.6631 45.9377 46.5541 44.1134C45.8837 43.8744 43.8567 43.1831 43.8567 43.1831C35.1043 46.2911 24.382 51.8575 17.1005 58.8844C4.21098 71.4985 -7.9769 93.0209 6.68493 99.3201C10.1256 100.796 14.0392 100.916 17.5059 99.5072C25.9569 96.0717 23.223 87.4441 33.8257 77.4339V77.4235C40.5095 70.9839 51.7307 65.8281 59.454 65.1733H59.4592Z" fill="#FFFBF0"/>
    </svg>
  </div>
</div>

<style>
  /* Fills the phone frame (parent); positioned inside black phone frame */
  .load-screen {
    position: absolute;
    inset: 0;
    z-index: 10;
    overflow: hidden;
    pointer-events: auto;
  }

  /* Fade whole splash to transparent so tab-stage (#eee1c4) shows through before unmount */
  .load-screen.fade-out {
    opacity: 0;
    transition: opacity 250ms ease-out;
  }

  .load-screen__bg {
    position: absolute;
    inset: 0;
    background: #eee1c4;
  }

  .load-screen__blob {
    position: absolute;
    will-change: transform, opacity;
    transition: none;
  }

  /* After 3s: move in 20% toward phone center (201px, 437px for 402×874 phone) */
  .load-screen.started .load-screen__blob {
    transition: transform 500ms ease-out, opacity 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .load-screen.started .load-screen__blob:nth-child(2) {
    transform: translate(-40.13px, 87.45px);
  }
  .load-screen.started .load-screen__blob:nth-child(3) {
    transform: translate(-40.13px, -56.35px);
  }
  .load-screen.started .load-screen__blob:nth-child(4) {
    transform: translate(-40.13px, 22.65px);
  }
  .load-screen.started .load-screen__blob:nth-child(5) {
    transform: translate(41.87px, 27.85px);
  }
  .load-screen.started .load-screen__blob:nth-child(6) {
    transform: translate(40.17px, -86.85px);
  }

  /* Spring out: move each blob outward (no scale) — top-right, bottom-right, right, left, bottom-left */
  .load-screen.move-in-done .load-screen__blob {
    transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .load-screen.move-in-done .load-screen__blob:nth-child(2) {
    transform: translate(359.87px, -412.55px);
  }
  .load-screen.move-in-done .load-screen__blob:nth-child(3) {
    transform: translate(359.87px, 443.65px);
  }
  .load-screen.move-in-done .load-screen__blob:nth-child(4) {
    transform: translate(359.87px, -77.35px);
  }
  .load-screen.move-in-done .load-screen__blob:nth-child(5) {
    transform: translate(-458.13px, -272.15px);
  }
  .load-screen.move-in-done .load-screen__blob:nth-child(6) {
    transform: translate(-459.83px, 413.15px);
  }

  .load-screen__logo-wrap {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    will-change: transform, opacity;
  }

  .load-screen__logo {
    display: block;
    transition: none;
  }

  /* After 3s: logo scale down 5% */
  .load-screen.started .load-screen__logo-wrap {
    transition: transform 200ms ease-out;
    transform: translate(-50%, -50%) scale(0.95);
  }

  /* Logo fades out only (no scale-up) to avoid compositing layer dark flash */
  .load-screen.move-in-done .load-screen__logo-wrap {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0;
    transition: transform 200ms ease-out, opacity 200ms ease-out;
  }
</style>
