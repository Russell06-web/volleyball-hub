// Shared SVG <symbol> sprite. Rendered once near the root of the app;
// every icon elsewhere is just <svg><use href="#i-name"/></svg>.
export default function Icons() {
  return (
    <svg style={{ display: 'none' }}>
      <symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" /></symbol>
      <symbol id="i-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><line x1="3.5" y1="9.5" x2="20.5" y2="9.5" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></symbol>
      <symbol id="i-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.4-3.8 4.3-5.8 7.5-5.8s6.1 2 7.5 5.8" /></symbol>
      <symbol id="i-settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.14-1.4l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2.4-1.4L13.6 2h-3.2l-.46 2.6a7 7 0 0 0-2.4 1.4l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.8l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2.4 1.4l.46 2.8h3.2l.46-2.8a7 7 0 0 0 2.4-1.4l2.4 1 2-3.4-2-1.6c.1-.46.14-.92.14-1.4Z" /></symbol>
      <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.2" y2="16.2" /></symbol>
      <symbol id="i-filter" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></symbol>
      <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></symbol>
      <symbol id="i-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M2.5 19c1.1-3.3 3.5-5 6.5-5s5.4 1.7 6.5 5" /><circle cx="17" cy="8.5" r="2.3" /><path d="M15.7 14.3c2.3.4 3.9 1.9 4.8 4.7" /></symbol>
      <symbol id="i-star" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3.3 14.6 9l6.3.6-4.8 4.2 1.4 6.2L12 16.9 6.5 20l1.4-6.2-4.8-4.2L9.4 9Z" /></symbol>
      <symbol id="i-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="11 6 5 12 11 18" /></symbol>
      <symbol id="i-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></symbol>
      <symbol id="i-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5s-7.5-4.6-9.7-9.3C.7 7.6 2.4 4.5 5.6 4a4.6 4.6 0 0 1 6.4 2 4.6 4.6 0 0 1 6.4-2c3.2.5 4.9 3.6 3.3 7.2C19.5 15.9 12 20.5 12 20.5Z" /></symbol>
      <symbol id="i-share" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><line x1="8.3" y1="10.7" x2="15.7" y2="6.3" /><line x1="8.3" y1="13.3" x2="15.7" y2="17.7" /></symbol>
      <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5 5.5V11c0 5 3 8.3 7 10 4-1.7 7-5 7-10V5.5Z" /><polyline points="9 12 11 14 15 9.5" /></symbol>
      <symbol id="i-whistle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 19c1.1-3.3 3.4-5.2 6.5-5.2 1.9 0 3.6.8 4.8 2.1" /><path d="M15 11.5 21 8" /><circle cx="21.6" cy="7.4" r="1.4" /></symbol>
      <symbol id="i-trend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 17 9.5 10.5 14 15 21 8" /><polyline points="15 8 21 8 21 14" /></symbol>
      <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="8 12.5 11 15.5 16 9" /></symbol>
      <symbol id="i-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16.5" /><circle cx="12" cy="7.8" r="0.4" fill="currentColor" /></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="7" x2="20" y2="7" /><path d="M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7" /><path d="M6.5 7 7.3 19a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 7" /><line x1="10" y1="11" x2="10" y2="16.5" /><line x1="14" y1="11" x2="14" y2="16.5" /></symbol>
      <symbol id="i-ball" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.2" /><path d="M12 2.8c3 2 4.6 5.4 4.4 9.2M12 2.8c-3 2-4.6 5.4-4.4 9.2M3 9.6c3.4-1.4 7-1 9 2.4M21 9.6c-3.4-1.4-7-1-9 2.4M4.3 16.5c1.4-3.2 4.4-4.6 7.7-4.1M19.7 16.5c-1.4-3.2-4.4-4.6-7.7-4.1" /></symbol>
      <symbol id="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></symbol>
      <symbol id="i-compare" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="6.3" /><circle cx="15" cy="12" r="6.3" /></symbol>
      <symbol id="i-logo" viewBox="0 0 100 130">
        <path d="M50 122 C34 100 12 80 12 44 A38 38 0 1 1 88 44 C88 80 66 100 50 122 Z" fill="#FF6B1A" />
        <circle cx="50" cy="44" r="35.5" fill="#FFFFFF" />
        <g transform="translate(50,44)" fill="none" stroke="#FF6B1A" strokeWidth="4.4" strokeLinecap="round">
          <path id="i-logo-petal" d="M-25.98,15 A30,30 0 0,1 25.98,15" />
          <use href="#i-logo-petal" transform="rotate(120)" />
          <use href="#i-logo-petal" transform="rotate(240)" />
        </g>
        <circle cx="50" cy="44" r="35.5" fill="none" stroke="#FF6B1A" strokeWidth="2.5" />
      </symbol>
    </svg>
  )
}

export function Icon({ id, size = 20, className }) {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}

export function LogoMark({ width = 24, height = 31.2, className }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 130" className={className} aria-hidden="true">
      <use href="#i-logo" />
    </svg>
  )
}
