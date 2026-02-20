<script>
  export let error;
  export let status;
</script>

<svelte:head>
  <title>Error {status}</title>
</svelte:head>

<main style="padding:24px; font-family: ui-monospace, Menlo, monospace; background:#111; color:#eee; min-height:100vh;">
  <h1 style="margin:0 0 12px;">Error {status}</h1>
  <pre style="white-space:pre-wrap; line-height:1.4;">{error?.message || 'Unknown error'}</pre>
  {#if error?.stack}
    <hr style="margin:16px 0; border-color:#333;" />
    <pre style="white-space:pre-wrap; line-height:1.3; color:#bbb;">{error.stack}</pre>
  {/if}
</main>
