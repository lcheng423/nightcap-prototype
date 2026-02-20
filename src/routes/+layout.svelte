<script>
  import { onMount } from 'svelte';
  import '../app/globals.css';
  import '../app.css';

  let cursorEl;

  onMount(() => {
    const onMove = (e) => {
      if (!cursorEl) return;
      cursorEl.style.left = `${e.clientX}px`;
      cursorEl.style.top = `${e.clientY}px`;
      const frame = document.querySelector('main.ios-frame');
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      cursorEl.classList.toggle('visible', inside);
    };

    const onDown = () => cursorEl?.classList.add('pressing');
    const onUp = () => cursorEl?.classList.remove('pressing');

    document.addEventListener('mousemove', onMove);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
    };
  });
</script>

<svelte:head>
  <title>Nightcap</title>
  <meta name="description" content="Nightcap prototype" />
</svelte:head>

<div bind:this={cursorEl} class="ios-cursor"></div>
<slot />
