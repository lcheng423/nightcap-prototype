<script>
  import { page } from '$app/stores';

  const NAV_DARK = '#423530';
  const NAV_ACTIVE_BG = '#423530';
  const NAV_ACTIVE_FG = '#FFF';
  const INDICATOR_OFFSETS = { ideas: 0, today: 66, threads: 132 };

  function pathToPage(pathname) {
    if (pathname === '/today') return 'today';
    if (pathname === '/threads') return 'threads';
    if (pathname === '/insight') return 'today';
    return 'ideas';
  }

  $: activePage = pathToPage($page.url.pathname);
  $: targetOffset = INDICATOR_OFFSETS[activePage] ?? 0;
</script>

<nav class="bottom-nav" style="position:absolute; bottom:40px; left:24px; right:24px; z-index:10; display:flex; justify-content:space-between; align-items:center; pointer-events:none;">
  <div style="display:inline-flex; height:72px; padding:0 4px; justify-content:center; align-items:center; gap:2px; border-radius:28px; border:1px solid rgba(0,0,0,0.10); background:#F7F0E1; box-shadow:0 4px 20px 0 rgba(0,0,0,0.15); pointer-events:auto; position:relative;">
    <div style={`position:absolute; top:50%; left:4px; width:64px; height:64px; margin-top:-32px; border-radius:24px; background:${NAV_ACTIVE_BG}; transition:transform 300ms cubic-bezier(0.34,1.28,0.64,1); transform:translateX(${targetOffset}px); z-index:0;`}></div>

    <a href="/" style="display:flex; width:64px; height:64px; padding:0 27px; flex-direction:column; justify-content:center; align-items:center; gap:4px; border-radius:24px; text-decoration:none; position:relative; z-index:1;">
      <svg width="11" height="19" viewBox="0 0 11 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M0 4.96875C0 2.14844 2.39844 0 5.38281 0C8.36719 0 10.7734 2.15625 10.7734 4.96875C10.7734 7.92188 9.03125 8.83594 8.57812 13.8359C8.54688 14.2734 8.27344 14.5391 7.82812 14.5391H2.9375C2.49219 14.5391 2.22656 14.2734 2.1875 13.8359C1.73438 8.83594 0 7.91406 0 4.96875ZM1.50781 4.96875C1.50781 7.01562 2.91406 7.60156 3.57031 13.0312H7.19531C7.85156 7.60156 9.26562 7.01562 9.26562 4.96875C9.26562 2.9375 7.48438 1.50781 5.38281 1.5C3.28906 1.5 1.50781 2.9375 1.50781 4.96875ZM2.85156 16.4453C2.54688 16.4453 2.3125 16.1953 2.3125 15.9062C2.3125 15.6172 2.54688 15.375 2.85156 15.375H7.91406C8.21875 15.375 8.45312 15.6172 8.45312 15.9062C8.45312 16.1953 8.21875 16.4453 7.91406 16.4453H2.85156ZM5.38281 18.8047C4.125 18.8047 3.10938 18.1953 3.03906 17.2812H7.71094C7.63281 18.1953 6.64062 18.8047 5.38281 18.8047Z" fill={activePage === 'ideas' ? NAV_ACTIVE_FG : NAV_DARK} />
      </svg>
      <span style={`color:${activePage === 'ideas' ? NAV_ACTIVE_FG : NAV_DARK}; font-size:12px; font-weight:700; line-height:90%; letter-spacing:-0.24px; white-space:nowrap;`}>For you</span>
    </a>

    <a href="/today" style="display:flex; width:64px; height:64px; padding:0 27px; flex-direction:column; justify-content:center; align-items:center; gap:4px; border-radius:24px; text-decoration:none; position:relative; z-index:1;">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M10.8594 3.98438C10.332 3.98438 9.88281 3.53516 9.88281 3.00781V0.976562C9.88281 0.439453 10.332 0 10.8594 0C11.3867 0 11.8359 0.439453 11.8359 0.976562V3.00781C11.8359 3.53516 11.3867 3.98438 10.8594 3.98438ZM15.7227 6.02539C15.3516 5.64453 15.3516 5.01953 15.7227 4.64844L17.168 3.19336C17.5488 2.82227 18.1738 2.82227 18.5449 3.19336C18.916 3.56445 18.916 4.19922 18.5547 4.57031L17.1094 6.01562C16.7285 6.39648 16.1035 6.38672 15.7227 6.02539ZM5.97656 6.02539C5.60547 6.38672 4.98047 6.38672 4.60938 6.01562L3.16406 4.56055C2.80273 4.19922 2.8125 3.56445 3.18359 3.19336C3.55469 2.82227 4.18945 2.83203 4.55078 3.19336L5.99609 4.64844C6.35742 5.00977 6.35742 5.6543 5.97656 6.02539ZM10.8594 15.9766C8.04688 15.9766 5.75195 13.6914 5.75195 10.8789C5.75195 8.06641 8.04688 5.77148 10.8594 5.77148C13.6719 5.77148 15.957 8.06641 15.957 10.8789C15.957 13.6914 13.6719 15.9766 10.8594 15.9766ZM10.8594 14.1797C12.6855 14.1797 14.1602 12.7051 14.1602 10.8789C14.1602 9.05273 12.6855 7.57812 10.8594 7.57812C9.0332 7.57812 7.55859 9.05273 7.55859 10.8789C7.55859 12.7051 9.0332 14.1797 10.8594 14.1797ZM17.7441 10.8789C17.7441 10.3418 18.1836 9.90234 18.7207 9.90234H20.7422C21.2793 9.90234 21.7188 10.3418 21.7188 10.8789C21.7188 11.4062 21.2793 11.8457 20.7422 11.8457H18.7207C18.1836 11.8457 17.7441 11.4062 17.7441 10.8789ZM3.97461 10.8789C3.97461 11.4062 3.53516 11.8457 2.99805 11.8457H0.976562C0.439453 11.8457 0 11.4062 0 10.8789C0 10.3418 0.439453 9.90234 0.976562 9.90234H2.99805C3.53516 9.90234 3.97461 10.3418 3.97461 10.8789ZM5.99609 15.752C6.35742 16.123 6.35742 16.748 5.97656 17.1191L4.54102 18.5645C4.16992 18.9355 3.53516 18.9258 3.1543 18.5449C2.79297 18.1738 2.79297 17.5488 3.16406 17.1777L4.60938 15.7422C4.98047 15.3711 5.61523 15.3809 5.99609 15.752ZM15.7227 15.752C16.0938 15.3809 16.7285 15.3711 17.0996 15.7422L18.5449 17.1875C18.9258 17.5586 18.9258 18.1836 18.5547 18.5547C18.1738 18.9258 17.5488 18.9453 17.1777 18.5742L15.7227 17.1191C15.3516 16.748 15.3516 16.123 15.7227 15.752ZM10.8594 17.7734C11.3867 17.7734 11.8359 18.2129 11.8359 18.75V20.7812C11.8359 21.3086 11.3867 21.7578 10.8594 21.7578C10.332 21.7578 9.88281 21.3086 9.88281 20.7812V18.75C9.88281 18.2129 10.332 17.7734 10.8594 17.7734Z" fill={activePage === 'today' ? NAV_ACTIVE_FG : NAV_DARK} />
      </svg>
      <span style={`color:${activePage === 'today' ? NAV_ACTIVE_FG : NAV_DARK}; font-size:12px; font-weight:700; line-height:90%; letter-spacing:-0.24px; white-space:nowrap;`}>Today</span>
    </a>

    <a href="/threads" style="display:flex; width:64px; height:64px; padding:0 27px; flex-direction:column; justify-content:center; align-items:center; gap:4px; border-radius:24px; text-decoration:none; position:relative; z-index:1;">
      <div style="width:24px; height:24px; border-radius:10px; overflow:hidden;">
        <img src="/assets/courtneys-cat.jpeg" alt="" style="width:24px; height:24px; object-fit:cover;" />
      </div>
      <span style={`color:${activePage === 'threads' ? NAV_ACTIVE_FG : NAV_DARK}; font-size:12px; font-weight:700; line-height:90%; letter-spacing:-0.24px; white-space:nowrap;`}>Threads</span>
    </a>
  </div>

  <button class="nav-plus-btn" style="display:flex; width:72px; height:72px; padding:18px; justify-content:center; align-items:center; border-radius:28px; border:1px solid rgba(0,0,0,0.10); background:#F7F0E1; box-shadow:0 4px 20px 0 rgba(0,0,0,0.15); pointer-events:auto;" aria-label="Create new">
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1.39062 14.2812C0.640625 14.2812 0 13.6562 0 12.8906C0 12.125 0.640625 11.4844 1.39062 11.4844H11.5V1.39062C11.5 0.640625 12.125 0 12.8906 0C13.6562 0 14.2969 0.640625 14.2969 1.39062V11.4844H24.3906C25.1406 11.4844 25.7812 12.125 25.7812 12.8906C25.7812 13.6562 25.1406 14.2812 24.3906 14.2812H14.2969V24.3906C14.2969 25.1406 13.6562 25.7812 12.8906 25.7812C12.125 25.7812 11.5 25.1406 11.5 24.3906V14.2812H1.39062Z" fill="#423530" />
    </svg>
  </button>
</nav>
