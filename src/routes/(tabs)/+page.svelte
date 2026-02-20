<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { CARD_CONTENT, CARD_IDS } from '$lib/data/card-content';
  import HomeScoresRow from '$lib/components/HomeScoresRow.svelte';

  const REFLECTION_STATE_KEY = 'reflectionState';
  const HAS_VIEWED_INSIGHT_KEY = 'hasViewedInsight';

  let hasReflectionInProgress = false;
  let hasViewedInsight = false;
  let order = [...CARD_IDS];
  let isNavigatingToCard = false;

  onMount(() => {
    try {
      hasReflectionInProgress = !!localStorage.getItem(REFLECTION_STATE_KEY);
      hasViewedInsight = !!sessionStorage.getItem(HAS_VIEWED_INSIGHT_KEY);
    } catch {
      // ignore
    }
  });

  const getCard = (id) => CARD_CONTENT.find((c) => c.id === id);

  function primaryButtonLabel() {
    if (hasReflectionInProgress) return 'Continue my reflection';
    if (hasViewedInsight) return 'View my insights';
    return 'Start reflection';
  }

  function handlePrimaryButtonClick() {
    const nextRoute = hasViewedInsight && !hasReflectionInProgress ? '/insight' : '/reflection';
    goto(nextRoute);
  }

  function handleCardClick(cardId) {
    if (isNavigatingToCard) return;
    const card = getCard(cardId);
    isNavigatingToCard = true;
    const phone = document.querySelector('main.phone');
    phone?.classList.add('detail-leave-to-card');
    goto(`/card/${cardId}`);
  }
</script>

<div class="page-body scrollbar-hide">
  <HomeScoresRow />

  <div
    class="cards-grid"
    style="margin-left:-16px; margin-right:-16px; grid-template-columns:189px 189px; column-gap:8px; row-gap:8px; justify-content:center;"
  >
    {#each order as cardId}
      {@const card = getCard(cardId)}
      <button
        type="button"
        style="border:none; background:transparent; padding:0; text-align:left;"
        on:click={() => handleCardClick(cardId)}
      >
        <div class="card">
          {#if card?.hasContent}
            <div style="display:flex; align-items:flex-start; gap:12px; width:100%;">
              <div style="font-size:22px; line-height:1;">{card?.emoji}</div>
              <div style="font-size: 12px; font-weight: 600; line-height:1.1;">
                <div>{card?.label}</div>
                <div>{card?.threadName}</div>
              </div>
            </div>
            <div
              style="width:100%; margin-top:6px; color:#423530; white-space:normal; overflow-wrap:anywhere; font-family:'DIN 2014 Rounded VF', 'DIN Rounded', sans-serif; font-size:20px; font-style:normal; font-weight:600; line-height:100%; letter-spacing:-0.3px;"
            >
              {card?.body}
            </div>
          {/if}
        </div>
      </button>
    {/each}
  </div>

  <div style="height:140px;"></div>
</div>
