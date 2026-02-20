<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  const d = new Date();
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  onMount(() => {
    try { sessionStorage.setItem('hasViewedInsight', 'true'); } catch {}
  });
</script>

<div class="screen" style="background:#000;">
  <main class="phone ios-frame" style="background:#000; border-color:rgba(255,255,255,0.15); color:#fff;">
    <img class="status-bar" src="/assets/status-bar-white.png" alt="" />
    <div style="position: absolute; inset:0;">
      <img src="/assets/courtneys-cat.jpeg" alt="" style="width:100%; height:100%; object-fit:cover; opacity:0.95;" />
      <div style="position:absolute; inset:0; background:rgba(0,0,0,0.28);"></div>
    </div>

    <section style="position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; text-align:center; padding:96px 24px 150px; gap:28px;">
      <div>
        <div style="font-size:20px; font-weight:600;">{dayName}</div>
        <div style="font-size:20px; font-weight:600;">{monthDay}</div>
      </div>
      <div>
        <div style="font-size:16px; font-weight:600;">In your voice</div>
        <div style="font-size:32px; font-weight:600; line-height:1;">"Feeling more like myself lately"</div>
      </div>
      <div>
        <div style="font-size:16px; font-weight:600;">Words</div>
        <div style="font-size:32px; font-weight:600; line-height:1;">Healing, joy, snuggle</div>
      </div>
      <div>
        <div style="font-size:16px; font-weight:600;">Threads</div>
        <div style="font-size:32px; font-weight:600; line-height:1;">Recovery, wife, patience</div>
      </div>
    </section>

    <div style="position:absolute; left:24px; right:24px; bottom:40px; z-index:3;">
      <button on:click={() => goto('/')} style="width:100%; height:56px; border:none; border-radius:22px; background:#fff; color:#423530; font-family:inherit; font-size:18px; font-weight:600;">
        See your daily insight
      </button>
    </div>
  </main>
</div>
