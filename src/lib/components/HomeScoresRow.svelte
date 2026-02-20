<script context="module">
  let hasAnimatedScoresThisRuntime = false;
</script>

<script>
  import { onMount } from 'svelte';

  const SCORES = [
    { slug: 'becoming', target: 78, label: 'Becoming' },
    { slug: 'giving', target: 97, label: 'Supporting' },
    { slug: 'aware', target: 92, label: 'Intentionality' }
  ];

  let values = [0, 0, 0];

  onMount(() => {
    if (hasAnimatedScoresThisRuntime) {
      values = SCORES.map((s) => s.target);
      return;
    }

    const start = performance.now();
    const duration = 900;
    let raf = 0;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
      values = SCORES.map((s) => Math.round(s.target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      hasAnimatedScoresThisRuntime = true;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<div style="display:flex; gap:7px; width:386px; height:124px; margin-top:0; margin-bottom:16px; margin-left:-16px; margin-right:-16px;">
  {#each SCORES as score, i}
    <a href={`/score/${score.slug}`} style="position:relative; display:block; width:124px; height:124px; border-radius:28px; background:rgba(247,240,225,0.50); text-decoration:none; color:#423530;">
      <span style="position:absolute; top:16px; left:50%; transform:translateX(-50%); display:flex; width:24px; height:24px; align-items:center; justify-content:center;">
        {#if score.slug === 'becoming'}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 18V10.025C6.93333 10.025 5.90833 9.82083 4.925 9.4125C3.94167 9.00417 3.075 8.425 2.325 7.675C1.575 6.925 1 6.05833 0.6 5.075C0.2 4.09167 0 3.06667 0 2V0H2C3.05 0 4.06667 0.204167 5.05 0.6125C6.03333 1.02083 6.9 1.6 7.65 2.35C8.16667 2.86667 8.59583 3.43333 8.9375 4.05C9.27917 4.66667 9.54167 5.325 9.725 6.025C9.80833 5.90833 9.9 5.79583 10 5.6875C10.1 5.57917 10.2083 5.46667 10.325 5.35C11.075 4.6 11.9417 4.02083 12.925 3.6125C13.9083 3.20417 14.9333 3 16 3H18V5C18 6.06667 17.7958 7.09167 17.3875 8.075C16.9792 9.05833 16.4 9.925 15.65 10.675C14.9 11.425 14.0375 12 13.0625 12.4C12.0875 12.8 11.0667 13 10 13V18H8ZM8 8C8 7.2 7.84583 6.4375 7.5375 5.7125C7.22917 4.9875 6.79167 4.34167 6.225 3.775C5.65833 3.20833 5.0125 2.77083 4.2875 2.4625C3.5625 2.15417 2.8 2 2 2C2 2.8 2.15 3.56667 2.45 4.3C2.75 5.03333 3.18333 5.68333 3.75 6.25C4.31667 6.81667 4.96667 7.25 5.7 7.55C6.43333 7.85 7.2 8 8 8ZM10 11C10.8 11 11.5625 10.85 12.2875 10.55C13.0125 10.25 13.6583 9.81667 14.225 9.25C14.7917 8.68333 15.2292 8.03333 15.5375 7.3C15.8458 6.56667 16 5.8 16 5C15.2 5 14.4333 5.15417 13.7 5.4625C12.9667 5.77083 12.3167 6.20833 11.75 6.775C11.1833 7.34167 10.75 7.9875 10.45 8.7125C10.15 9.4375 10 10.2 10 11Z" fill="#423530"/>
          </svg>
        {:else if score.slug === 'giving'}
          <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M0 4.79688C0 1.9375 1.99219 0 4.4375 0C5.89062 0 6.99219 0.648438 7.64062 1.58594C8.28906 0.640625 9.38281 0 10.8438 0C13.2891 0 15.2812 1.9375 15.2812 4.79688C15.2812 7.96875 12.6172 11.1172 8.53125 13.7734C8.21875 13.9844 7.875 14.1719 7.64062 14.1719C7.40625 14.1719 7.05469 13.9844 6.75 13.7734C2.66406 11.1172 0 7.96875 0 4.79688ZM1.89844 4.78125C1.89844 7.21875 4.38281 10.0078 7.51562 12.0938C7.57031 12.1328 7.60938 12.1562 7.64062 12.1562C7.67188 12.1562 7.70312 12.1328 7.76562 12.0938C10.8984 10.0078 13.3828 7.21875 13.3828 4.78125C13.3828 3.03125 12.2031 1.83594 10.6328 1.83594C9.375 1.83594 8.71094 2.57812 8.22656 3.23438C8 3.53125 7.85938 3.65625 7.64062 3.65625C7.42188 3.65625 7.25781 3.53125 7.05469 3.23438C6.59375 2.57031 5.90625 1.83594 4.64844 1.83594C3.07812 1.83594 1.89844 3.03125 1.89844 4.78125Z" fill="black"/>
          </svg>
        {:else}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15.1875 14.6875C16.0625 13.8125 16.5 12.75 16.5 11.5C16.5 10.25 16.0625 9.1875 15.1875 8.3125C14.3125 7.4375 13.25 7 12 7C10.75 7 9.6875 7.4375 8.8125 8.3125C7.9375 9.1875 7.5 10.25 7.5 11.5C7.5 12.75 7.9375 13.8125 8.8125 14.6875C9.6875 15.5625 10.75 16 12 16C13.25 16 14.3125 15.5625 15.1875 14.6875ZM10.0875 13.4125C9.5625 12.8875 9.3 12.25 9.3 11.5C9.3 10.75 9.5625 10.1125 10.0875 9.5875C10.6125 9.0625 11.25 8.8 12 8.8C12.75 8.8 13.3875 9.0625 13.9125 9.5875C14.4375 10.1125 14.7 10.75 14.7 11.5C14.7 12.25 14.4375 12.8875 13.9125 13.4125C13.3875 13.9375 12.75 14.2 12 14.2C11.25 14.2 10.6125 13.9375 10.0875 13.4125ZM5.35 16.9625C3.35 15.6042 1.9 13.7833 1 11.5C1.9 9.21667 3.35 7.39583 5.35 6.0375C7.35 4.67917 9.56667 4 12 4C14.4333 4 16.65 4.67917 18.65 6.0375C20.65 7.39583 22.1 9.21667 23 11.5C22.1 13.7833 20.65 15.6042 18.65 16.9625C16.65 18.3208 14.4333 19 12 19C9.56667 19 7.35 18.3208 5.35 16.9625ZM17.1875 15.5125C18.7625 14.5208 19.9667 13.1833 20.8 11.5C19.9667 9.81667 18.7625 8.47917 17.1875 7.4875C15.6125 6.49583 13.8833 6 12 6C10.1167 6 8.3875 6.49583 6.8125 7.4875C5.2375 8.47917 4.03333 9.81667 3.2 11.5C4.03333 13.1833 5.2375 14.5208 6.8125 15.5125C8.3875 16.5042 10.1167 17 12 17C13.8833 17 15.6125 16.5042 17.1875 15.5125Z" fill="#423530"/>
          </svg>
        {/if}
      </span>
      <span style="position:absolute; top:50%; left:50%; margin-top:4px; transform:translate(-50%, -50%); display:flex; align-items:center; justify-content:center; width:100%; font-size:40px; font-weight:600; line-height:98%; letter-spacing:-0.8px; text-align:center;">{values[i]}</span>
      <span style="position:absolute; left:0; right:0; bottom:16px; display:flex; justify-content:center; align-items:center; text-align:center; font-size:12px; font-weight:600; line-height:98%; letter-spacing:-0.24px;">{score.label}</span>
    </a>
  {/each}
</div>
