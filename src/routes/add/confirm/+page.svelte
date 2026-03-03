<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  $: from = $page.url.searchParams.get('from') || '/';
</script>

<div class="confirm-screen">
  <main class="phone ios-frame confirm-phone">
    <img class="status-bar" src="/assets/status-bar.png" alt="" />

    <!-- Header -->
    <header class="confirm-header">
      <button
        type="button"
        class="confirm-back"
        aria-label="Close"
        on:click={() => goto(from)}
      >
        <span aria-hidden="true">×</span>
      </button>
      <h1 class="confirm-title">Added to your path</h1>
    </header>

    <!-- Decorative blobs (radial gradients) -->
    <div class="confirm-blobs" aria-hidden="true">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
      <div class="blob blob-5"></div>
    </div>

    <!-- Featured card (slightly rotated) -->
    <div class="confirm-card-wrap">
      <div class="confirm-card">
        <div class="confirm-card-inner">
          <div class="confirm-card-top">
            <div class="confirm-avatar">
              <img src="/assets/courtneys-cat.jpeg" alt="" />
            </div>
            <div class="confirm-card-labels">
              <span class="confirm-name">Long</span>
              <span class="confirm-tag">Fun friend</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Copy -->
    <p class="confirm-headline">Carry this with you today</p>
    <p class="confirm-sub">Want a nudge to reflect tonight?</p>

    <!-- CTA -->
    <div class="confirm-actions">
      <button
        type="button"
        class="confirm-btn-enable"
        on:click={() => goto(from)}
      >
        Enable
      </button>
    </div>
  </main>
</div>

<style>
  .confirm-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    padding: 16px;
  }

  .confirm-phone {
    background: #eee1c4;
    position: relative;
    overflow: hidden;
    padding-bottom: 100px;
  }

  /* Radial gradient blobs */
  .confirm-blobs {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    opacity: 0.6;
  }

  .blob-1 {
    width: 1266px;
    height: 1266px;
    left: -141px;
    top: -984px;
    background: radial-gradient(circle, rgba(125, 108, 38, 1) 0%, rgba(125, 108, 38, 0) 100%);
  }

  .blob-2 {
    width: 1184px;
    height: 1184px;
    left: 0;
    top: 396px;
    background: radial-gradient(circle, rgba(203, 111, 62, 1) 0%, rgba(203, 111, 62, 0) 100%);
  }

  .blob-3 {
    width: 740px;
    height: 740px;
    left: 171px;
    top: -244px;
    background: radial-gradient(circle, rgba(213, 107, 147, 1) 0%, rgba(213, 107, 147, 0) 100%);
  }

  .blob-4 {
    width: 1315px;
    height: 1315px;
    left: -1094px;
    top: -532px;
    background: radial-gradient(circle, rgba(64, 102, 115, 1) 0%, rgba(64, 102, 115, 0) 100%);
  }

  .blob-5 {
    width: 1061px;
    height: 1061px;
    left: -866px;
    top: 590px;
    background: radial-gradient(circle, rgba(255, 205, 105, 1) 0%, rgba(255, 205, 105, 0) 100%);
  }

  .confirm-header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 18px 24px 0;
    gap: 12px;
  }

  .confirm-back {
    width: 46px;
    height: 46px;
    border-radius: 20px;
    border: none;
    background: rgba(0, 0, 0, 0.1);
    color: #000;
    font-size: 20px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    flex-shrink: 0;
    font-family: var(--font-din-rounded), 'SF Pro Rounded', sans-serif;
    font-weight: 600;
    letter-spacing: -0.4px;
  }

  .confirm-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #423530;
    letter-spacing: -0.4px;
    white-space: nowrap;
  }

  .confirm-card-wrap {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 8px;
    min-height: 320px;
  }

  .confirm-card {
    transform: rotate(-4.34deg);
    width: 227px;
    border: 1.2px solid rgba(0, 0, 0, 0.1);
    border-radius: 34px;
    padding: 29px;
    background: linear-gradient(180deg, #b8d4e8 0%, #e8f4fc 100%);
    box-shadow: 0 4.8px 24px rgba(0, 0, 0, 0.1);
  }

  .confirm-card-inner {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .confirm-card-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .confirm-avatar {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    background: #d9d9d9;
  }

  .confirm-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .confirm-card-labels {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .confirm-name {
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #000;
    letter-spacing: -0.29px;
    line-height: 1;
  }

  .confirm-tag {
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #423530;
    letter-spacing: -0.24px;
    text-transform: uppercase;
    line-height: 1.1;
  }

  .confirm-headline {
    position: relative;
    z-index: 2;
    margin: 0;
    text-align: center;
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 40px;
    font-weight: 600;
    line-height: 0.9;
    letter-spacing: -0.8px;
    color: #423530;
    padding: 0 24px;
    max-width: 275px;
    margin-left: auto;
    margin-right: auto;
  }

  .confirm-sub {
    position: relative;
    z-index: 2;
    margin: 12px 0 0;
    padding: 0 49px;
    font-family: var(--font-din-rounded), 'DIN 2014 Rounded VF', sans-serif;
    font-size: 20px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.4px;
    color: #000;
  }

  .confirm-actions {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    padding: 24px 24px 0;
  }

  .confirm-btn-enable {
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
    cursor: pointer;
  }
</style>
