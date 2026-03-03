<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  $: from = $page.url.searchParams.get('from') || '/';

  let intentionText = '';

  const COPY_TEXTS = [
    "I'll show up as...",
    "I'll choose to...",
    "I'll prioritize...",
    "I want to..."
  ];

  let displayIndex = 0;
  let previousIndex = null;
  let animateIn = false;

  let intervalId;

  onMount(() => {
    intervalId = setInterval(() => {
      previousIndex = displayIndex;
      displayIndex = (displayIndex + 1) % COPY_TEXTS.length;
      animateIn = true;
      setTimeout(() => { previousIndex = null; }, 100);
      setTimeout(() => { animateIn = false; }, 300);
    }, 2000);
    return () => clearInterval(intervalId);
  });

  function goToConfirm() {
    goto(`/add/confirm?from=${encodeURIComponent(from)}`);
  }
</script>

<div class="add-screen">
  <main class="phone ios-frame add-phone">
    <!-- Background: cream + radial gradient overlay per Figma -->
    <div class="add-bg" aria-hidden="true"></div>

    <img class="status-bar" src="/assets/status-bar.png" alt="" />

    <!-- Header: back, fuzzy time pill, more -->
    <header class="add-header">
      <button
        type="button"
        class="add-header-btn add-back"
        aria-label="Back"
        on:click={() => goto(from)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="add-pill">
        <span class="add-pill-text">fuzzy time</span>
      </div>
      <button type="button" class="add-header-btn add-more" aria-label="More options">
        <span aria-hidden="true">···</span>
      </button>
    </header>

    <!-- Main card: 386px wide, 40px radius, 36px padding, gap 20px -->
    <div class="add-card-wrap">
      <article class="add-card">
        <!-- Row 1: band-aid icon (opacity 0.2) + optional thread label -->
        <div class="add-card-top">
          <span class="add-bandaid" aria-hidden="true">🩹</span>
          <span class="add-thread-label add-thread-hidden">Mental health</span>
        </div>

        <!-- Main copy + textarea: cycle through strings with fade out/in -->
        <div class="add-input-wrap">
          <div class="add-card-copy-wrap">
            {#if previousIndex !== null}
              <p class="add-card-copy copy-leaving">{COPY_TEXTS[previousIndex]}</p>
            {/if}
            <p class="add-card-copy copy-incoming" class:copy-animate-in={animateIn}>
              {COPY_TEXTS[displayIndex]}
            </p>
          </div>
          <textarea
            bind:value={intentionText}
            class="add-input"
            placeholder=""
            rows="4"
          ></textarea>
        </div>

        <!-- Bottom row: gallery + gradient buttons, Add button -->
        <div class="add-card-bottom">
          <div class="add-round-btns">
            <button type="button" class="add-round-btn add-gallery" aria-label="Gallery">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2.8916 15.8115C1.01953 15.8115 0 14.8096 0 12.9463V2.87402C0 1.01074 1.01953 0 2.8916 0H16.9277C18.7998 0 19.8105 1.01074 19.8105 2.87402V12.9463C19.8105 14.8096 18.7998 15.8115 16.9277 15.8115H2.8916ZM2.03027 3.10254V11.6104L4.07812 9.79102C4.4209 9.4834 4.74609 9.33398 5.1416 9.33398C5.53711 9.33398 5.91504 9.49219 6.2666 9.7998L7.7959 11.1797L11.5488 7.83105C11.9268 7.49707 12.3311 7.33887 12.7881 7.33887C13.2275 7.33887 13.667 7.50586 14.0273 7.83984L17.7891 11.3555V3.10254C17.7891 2.37305 17.4111 2.03027 16.7256 2.03027H3.09375C2.39941 2.03027 2.03027 2.37305 2.03027 3.10254ZM6.77637 8.15625C5.66016 8.15625 4.7373 7.24219 4.7373 6.11719C4.7373 5.00098 5.66016 4.07812 6.77637 4.07812C7.89258 4.07812 8.81543 5.00098 8.81543 6.11719C8.81543 7.24219 7.89258 8.15625 6.77637 8.15625Z" fill="#423530"/>
              </svg>
            </button>
            <button type="button" class="add-round-btn add-gradient" aria-label="Theme">
              <span class="add-gradient-inner" aria-hidden="true"></span>
            </button>
          </div>
          <button type="button" class="add-btn-add" on:click={goToConfirm}>Add</button>
        </div>
      </article>
    </div>

    <!-- Keyboard image: anchored to bottom, animates in from below -->
    <div class="add-keyboard-wrap">
      <img src="/assets/marketing/growth/Keyboard.png" alt="" class="add-keyboard-img" />
    </div>
  </main>
</div>

<style>
  .add-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    padding: 16px;
  }

  .add-phone {
    background: rgb(238, 225, 196);
    position: relative;
    overflow-x: hidden;
    overflow-y: hidden;
    padding-bottom: 24px;
  }

  /* Figma: radial gradient overlay (warm peach/pink glow) */
  .add-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background: radial-gradient(
      ellipse 120% 80% at 20% 48%,
      rgba(255, 205, 105, 0.35) 0%,
      rgba(255, 201, 138, 0.2) 12%,
      rgba(255, 196, 172, 0.12) 25%,
      rgba(255, 187, 239, 0.06) 50%,
      transparent 100%
    );
  }

  /* Header: back (32px), pill (center), more (330px from left = right side) */
  .add-header {
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    z-index: 2;
  }

  .add-header-btn {
    width: 46px;
    height: 46px;
    border-radius: 20px;
    border: none;
    background: rgba(0, 0, 0, 0.1);
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    flex-shrink: 0;
    font-family: var(--font-din-rounded), 'SF Pro Rounded', sans-serif;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.4px;
  }

  .add-back {
    margin-right: auto;
  }

  .add-more {
    margin-left: auto;
  }

  .add-pill {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    height: 46px;
    padding: 12px 16px;
    border-radius: 20px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
  }

  .add-pill-text {
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #423530;
    letter-spacing: -0.4px;
    white-space: nowrap;
  }

  /* Card container: centered, right under header (moved up 50px more) */
  .add-card-wrap {
    position: relative;
    z-index: 1;
    margin-top: 70px;
    padding: 0 8px;
    display: flex;
    justify-content: center;
  }

  .add-card {
    width: 100%;
    max-width: 386px;
    min-height: 514px;
    background: rgba(247, 240, 225, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 40px;
    padding: 36px;
    box-shadow: 0 8.124px 40.618px 0 rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .add-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-shrink: 0;
  }

  .add-bandaid {
    font-size: 44px;
    line-height: 1;
    color: rgba(66, 53, 48, 0.2);
    flex-shrink: 0;
  }

  .add-thread-label {
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #423530;
    letter-spacing: -0.32px;
    text-transform: uppercase;
  }

  .add-thread-hidden {
    opacity: 0;
    pointer-events: none;
  }

  .add-input-wrap {
    width: 329px;
    height: 143px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .add-card-copy-wrap {
    position: relative;
    width: 100%;
    flex-shrink: 0;
  }

  .add-card-copy {
    color: #423530;
    font-family: "DIN 2014 Rounded VF", var(--font-din-rounded), sans-serif;
    font-size: 32px;
    font-style: normal;
    font-weight: 600;
    line-height: 100%;
    letter-spacing: -0.64px;
    text-align: left;
    margin: 0;
    flex-shrink: 0;
    opacity: 0.3;
  }

  .add-card-copy.copy-leaving {
    position: absolute;
    left: 0;
    top: 0;
    animation: copy-fade-out 0.1s ease-out forwards;
  }

  .add-card-copy.copy-incoming {
    opacity: 0.3;
    transform: translateY(0);
  }

  .add-card-copy.copy-incoming.copy-animate-in {
    opacity: 0;
    transform: translateY(10px);
    animation: copy-fade-in-up 0.3s ease-out forwards;
  }

  @keyframes copy-fade-out {
    to { opacity: 0; }
  }

  @keyframes copy-fade-in-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 0.3;
      transform: translateY(0);
    }
  }

  .add-input {
    flex: 1;
    min-height: 100px;
    width: 100%;
    max-width: 329px;
    border: none;
    background: transparent;
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    color: #423530;
    letter-spacing: -0.4px;
    resize: none;
    outline: none;
  }

  .add-input::placeholder {
    color: #423530;
    opacity: 0.3;
  }

  .add-intention-label {
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #423530;
    letter-spacing: -0.32px;
    text-transform: uppercase;
    margin: 0;
    flex-shrink: 0;
  }

  .add-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-shrink: 0;
    margin-top: auto;
    margin-bottom: 100px;
  }

  .add-round-btns {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .add-round-btn {
    width: 46px;
    height: 46px;
    border-radius: 20px;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .add-gallery {
    background: #fff;
    color: #423530;
    box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.05);
  }

  .add-gradient {
    padding: 0;
    background: transparent;
  }

  .add-gradient-inner {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: linear-gradient(
      135deg,
      #c4b5fd 0%,
      #a78bfa 25%,
      #818cf8 50%,
      #f472b6 75%,
      #fb923c 100%
    );
    box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.05);
  }

  .add-btn-add {
    height: 46px;
    padding: 12px 16px;
    border-radius: 20px;
    border: none;
    background: #423530;
    color: #fff;
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.4px;
    white-space: nowrap;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Keyboard: anchored to bottom, animates in from below */
  .add-keyboard-wrap {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    pointer-events: none;
    z-index: 2;
    transform: translateY(100%);
    animation: keyboard-slide-in 0.25s ease-out forwards;
  }

  .add-keyboard-img {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    object-fit: contain;
    object-position: bottom;
  }

  @keyframes keyboard-slide-in {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
</style>
