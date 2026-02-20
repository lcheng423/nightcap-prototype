<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import HeaderButton from '$lib/components/HeaderButton.svelte';

  export let paddingBottom = '24px';

  let entering = true;
  let leaving = false;

  onMount(() => {
    requestAnimationFrame(() => {
      entering = false;
    });
  });

  function handleBack() {
    if (leaving) return;
    leaving = true;
    try {
      sessionStorage.setItem('detailBackAnim', '1');
    } catch {
      // ignore
    }
    if (history.length > 1) history.back();
    else goto('/');
  }
</script>

<section class={`page-body detail-shell ${entering ? 'entering' : ''} ${leaving ? 'leaving' : ''}`} style={`padding-bottom:${paddingBottom};`}>
  <HeaderButton ariaLabel="Back" size={43} extraStyle="margin-top:32px; margin-bottom:20px;" on:click={handleBack}>
    <svg width="11" height="18" viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 8.76953C0.00976562 8.36914 0.146484 8.03711 0.46875 7.72461L7.98828 0.371094C8.23242 0.117188 8.53516 0 8.90625 0C9.63867 0 10.2246 0.576172 10.2246 1.30859C10.2246 1.66992 10.0781 2.00195 9.81445 2.26562L3.13477 8.75977L9.81445 15.2734C10.0781 15.5371 10.2246 15.8594 10.2246 16.2305C10.2246 16.9629 9.63867 17.5488 8.90625 17.5488C8.54492 17.5488 8.23242 17.4219 7.98828 17.168L0.46875 9.81445C0.146484 9.50195 0 9.16992 0 8.76953Z" fill="black"/>
    </svg>
  </HeaderButton>

  <slot />
</section>

<style>
  .detail-shell {
    transform: translateX(0);
    opacity: 1;
    transition: transform 380ms ease, opacity 340ms ease;
  }

  .detail-shell.entering {
    transform: translateX(24px);
    opacity: 0;
  }

  .detail-shell.leaving {
    transform: translateX(24px);
    opacity: 0;
  }
</style>
