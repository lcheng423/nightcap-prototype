<script>
  import { goto } from '$app/navigation';

  let userText = '';
  const prompt = "So, how'd your day go?";
  const toInsight = () => goto('/insight');
</script>

<div class="screen">
  <main class="phone ios-frame" style="padding-bottom:120px;">
    <img class="status-bar" src="/assets/status-bar.png" alt="" />
    <section class="page-body" style="padding-top:28px;">
      <a href="/" style="display:inline-block; margin-bottom:20px; text-decoration:none; color:#423530; font-size:14px;">← Back</a>
      <h1 style="font-size:34px; line-height:1; margin: 0 0 18px;">Reflection</h1>

      <div class="card" style="min-height:auto; margin-bottom: 12px;">
        <div style="font-size: 12px; opacity:0.7;">Prompt</div>
        <div style="font-size: 28px; font-weight: 600; line-height: 1.05;">{prompt}</div>
      </div>

      <textarea bind:value={userText} class="chat-input" rows="5" placeholder="Type your reflection..."></textarea>

      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="top-btn" style="width:auto; padding:0 14px;" on:click={toInsight}>Save reflection</button>
        <button class="top-btn" style="width:auto; padding:0 14px;" on:click={toInsight}>Skip to insight</button>
      </div>
    </section>
  </main>
</div>
