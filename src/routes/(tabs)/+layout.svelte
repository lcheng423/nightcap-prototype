<script>
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { browser } from '$app/environment';
  import TopBar from '$lib/components/TopBar.svelte';
  import NavBar from '$lib/components/NavBar.svelte';

  const TAB_INDEX = { '/': 0, '/today': 1, '/threads': 2 };

  let tabStageEl;
  let tabViewEl;
  let enteringClass = '';
  let pendingDirection = null;
  let fromDetailEnter = false;

  if (browser) {
    try {
      fromDetailEnter = sessionStorage.getItem('detailBackAnim') === '1';
    } catch {
      // ignore
    }
  }

  function getTabIndex(pathname) {
    return TAB_INDEX[pathname];
  }

  onNavigate((navigation) => {
    const from = getTabIndex(navigation.from?.url.pathname || '');
    const to = getTabIndex(navigation.to?.url.pathname || '');
    if (from === undefined || to === undefined || from === to) {
      pendingDirection = null;
      return;
    }

    const direction = to > from ? 'forward' : 'back';
    pendingDirection = direction;

    if (tabStageEl && tabViewEl) {
      const ghost = tabViewEl.cloneNode(true);
      ghost.classList.add('tab-ghost', direction === 'forward' ? 'out-left' : 'out-right');
      tabStageEl.appendChild(ghost);
      requestAnimationFrame(() => ghost.classList.add('active'));
      setTimeout(() => ghost.remove(), 420);
    }
  });

  afterNavigate(() => {
    if (!pendingDirection) return;
    enteringClass = pendingDirection === 'forward' ? 'in-right' : 'in-left';
    requestAnimationFrame(() => {
      enteringClass = `${enteringClass} active`;
    });
    setTimeout(() => {
      enteringClass = '';
    }, 420);
    pendingDirection = null;
  });

  if (browser && fromDetailEnter) {
    try {
      sessionStorage.removeItem('detailBackAnim');
    } catch {
      // ignore
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fromDetailEnter = false;
      });
    });
  }
</script>

<div class="screen">
  <main class="phone ios-frame" class:from-detail-enter={fromDetailEnter}>
    <img class="status-bar" src="/assets/status-bar.png" alt="" />
    <TopBar notifications={0} />
    <div class="tab-stage" bind:this={tabStageEl}>
      <div class={`tab-view ${enteringClass}`} bind:this={tabViewEl}>
        <slot />
      </div>
    </div>
    <NavBar />
  </main>
</div>

<style>
  .tab-stage {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .tab-view {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
  }

  .tab-ghost {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    pointer-events: none;
    z-index: 3;
  }

  .tab-ghost.out-left {
    transform: translateX(0);
    opacity: 1;
  }

  .tab-ghost.out-left.active {
    transform: translateX(-24px);
    opacity: 0;
    transition: transform 380ms ease, opacity 340ms ease;
  }

  .tab-ghost.out-right {
    transform: translateX(0);
    opacity: 1;
  }

  .tab-ghost.out-right.active {
    transform: translateX(24px);
    opacity: 0;
    transition: transform 380ms ease, opacity 340ms ease;
  }

  .tab-view.in-right {
    transform: translateX(24px);
    opacity: 0;
  }

  .tab-view.in-left {
    transform: translateX(-24px);
    opacity: 0;
  }

  .tab-view.active {
    transform: translateX(0);
    opacity: 1;
    transition: transform 380ms ease, opacity 340ms ease;
  }
</style>
