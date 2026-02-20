<script>
  export let ariaLabel = '';
  export let size = 46;
  export let extraStyle = '';
  export let type = 'button';
</script>

<button
  {type}
  class="top-btn header-button"
  aria-label={ariaLabel}
  style={`width:${size}px; height:${size}px; ${extraStyle}`}
  on:click
>
  <slot />
</button>
