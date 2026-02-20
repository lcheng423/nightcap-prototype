<script>
  import { goto } from '$app/navigation';
  import { CARD_CONTENT, CARD_IDS } from '$lib/data/card-content';

  function getWeekDates() {
    const now = new Date();
    const day = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const days = [];
    let todayIndex = -1;
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) todayIndex = i;
      days.push({ label: labels[i], date: d.getDate(), isToday });
    }
    return { days, todayIndex };
  }

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_COUNT = 7;

  const { days: week, todayIndex } = getWeekDates();
  let activeIndex = todayIndex;
  let dayCardOrders = Array.from({ length: DAY_COUNT }, () => [...CARD_IDS]);
  let dragOffset = 0;
  let isDragging = false;
  let carouselEl;
  let isNavigatingToCard = false;

  let swipe = { active: false, pointerId: null, startX: 0, startY: 0, deltaX: 0, deltaY: 0, lockedAxis: null };

  $: dayDiff = activeIndex - todayIndex;
  $: dayTitle = dayDiff === 0 ? 'Today' : dayDiff === -1 ? 'Yesterday' : dayDiff === 1 ? 'Tomorrow' : DAY_NAMES[activeIndex];

  function handleCarouselDown(e) {
    swipe = { active: true, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, deltaX: 0, deltaY: 0, lockedAxis: null };
    dragOffset = 0;
    isDragging = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function handleCarouselMove(e) {
    if (!swipe.active || swipe.pointerId !== e.pointerId) return;
    swipe.deltaX = e.clientX - swipe.startX;
    swipe.deltaY = e.clientY - swipe.startY;

    if (!swipe.lockedAxis) {
      const absX = Math.abs(swipe.deltaX);
      const absY = Math.abs(swipe.deltaY);
      if (Math.max(absX, absY) < 8) return;
      swipe.lockedAxis = absX > absY ? 'x' : 'y';
    }

    if (swipe.lockedAxis === 'x') {
      e.preventDefault();
      isDragging = true;
      const atStart = activeIndex === 0 && swipe.deltaX > 0;
      const atEnd = activeIndex === DAY_COUNT - 1 && swipe.deltaX < 0;
      dragOffset = atStart || atEnd ? swipe.deltaX * 0.35 : swipe.deltaX;
    }
  }

  function handleCarouselEnd(e) {
    if (!swipe.active || swipe.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (swipe.lockedAxis === 'x') {
      const panelWidth = carouselEl?.clientWidth ?? 1;
      if (Math.abs(swipe.deltaX) >= panelWidth / 2) {
        const dir = swipe.deltaX > 0 ? -1 : 1;
        activeIndex = Math.max(0, Math.min(DAY_COUNT - 1, activeIndex + dir));
      }
    }
    dragOffset = 0;
    isDragging = false;
    swipe = { active: false, pointerId: null, startX: 0, startY: 0, deltaX: 0, deltaY: 0, lockedAxis: null };
  }

  function handleCardClick(cardId) {
    if (isNavigatingToCard) return;
    isNavigatingToCard = true;
    const phone = document.querySelector('main.phone');
    phone?.classList.add('detail-leave-to-card');
    goto(`/card/${cardId}`);
  }
</script>

<div class="page-body scrollbar-hide">
  <h1 class="top-title">{dayTitle}</h1>

  <div style="margin-top: 5px; position: sticky; top: 0; z-index: 20; margin-left: -24px; margin-right: -24px;">
    <div style="background:#EEE1C4; padding:0 24px 6px;">
      <div style="display:flex; gap:4px; position:relative; margin:0 -12px;">
        <div
          style={`position:absolute; width:36px; height:36px; border-radius:14px; background:${week[activeIndex]?.isToday ? '#DA5F3D' : '#423530'}; bottom:8px; left:calc(${activeIndex} * (((100% - 24px) / 7) + 4px) + (((100% - 24px) / 7 - 36px)/2)); transition:left 250ms cubic-bezier(0.34,1.28,0.64,1), background-color 250ms ease;`}
        ></div>
        {#each week as d, i}
          <button on:click={() => (activeIndex = i)} style="flex:1; background:transparent; border:none; display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 0; position:relative; z-index:1; font-family:inherit;">
            <span style="font-size:8px; font-weight:600; line-height:17px;">{d.label}</span>
            <span style={`width:36px; height:36px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:600; color:${i === activeIndex ? '#fff' : d.isToday ? '#DA5F3D' : '#423530'};`}>{d.date}</span>
          </button>
        {/each}
      </div>
    </div>
    <div style="height:7px; margin-top:-1px; background:linear-gradient(180deg,#EEE1C4 0%,rgba(238,225,196,0) 70%);"></div>
  </div>

  <div
    role="presentation"
    bind:this={carouselEl}
    style="margin:0 -24px; overflow:hidden; padding-top:2px; touch-action:none;"
    on:pointerdown={handleCarouselDown}
    on:pointermove={handleCarouselMove}
    on:pointerup={handleCarouselEnd}
    on:pointercancel={handleCarouselEnd}
    on:pointerleave={handleCarouselEnd}
  >
    <div style={`display:flex; width:${DAY_COUNT * 100}%; transform:translateX(calc(-${activeIndex * (100 / DAY_COUNT)}% + ${dragOffset}px)); transition:${isDragging ? 'none' : 'transform 300ms cubic-bezier(0.25,0.1,0.25,1)'};`}>
      {#each Array.from({ length: DAY_COUNT }) as _, dayIdx}
        <div style={`width:${100 / DAY_COUNT}%; flex-shrink:0; padding:0 8px;`}>
          <div style="display:grid; grid-template-columns:189px 189px; gap:8px;">
            {#each dayCardOrders[dayIdx] as cardId, i}
              <button
                type="button"
                data-today-card-index={i}
                aria-label={`Today card ${i + 1}`}
                style="text-align:left; width:100%; border:none; background:transparent; padding:0;"
                on:click={() => handleCardClick(cardId)}
              >
                <div class="card" style="min-height:252px;"></div>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div style="height:130px;"></div>
</div>
