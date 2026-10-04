const paths = {
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10m3-8c-4-3-7 2-3 3s2 5-3 3" />
    </>
  ),
  gem: (
    <>
      <path d="m3 9 4-5h10l4 5-9 12L3 9Zm0 0h18M7 4l5 17 5-17" />
    </>
  ),
  energy: <path d="m14 2-9 12h6l-1 8 9-12h-6l1-8Z" />,
  leaf: (
    <>
      <path d="M20 3C7 2 2 7 5 15s15 6 15-12Z" />
      <path d="m3 21 12-12M8 16l-1-5m5 1 5 1" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7M5 9v12h14V9M10 21v-7h4v7" />
      <path d="M17 3v4" />
    </>
  ),
  bag: (
    <>
      <path d="M4 8h16l1 13H3L4 8ZM8 8V6a4 4 0 0 1 8 0v2" />
    </>
  ),
  book: (
    <>
      <path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v16" />
    </>
  ),
  settings: (
    <>
      <path d="m10 3-1 3-3 1-3 2 2 3-1 4 4 1 2 4 3-2 4 1 1-4 3-2-2-3 1-4-4-1-2-3-3 2Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" />
    </>
  ),
  moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  water: (
    <path d="M12 2C8 8 5 10 5 14a7 7 0 0 0 14 0c0-4-3-6-7-12Zm-4 13c0 2 1 3 3 3" />
  ),
  egg: <path d="M19 15c0-5-4-12-7-12S5 10 5 15a7 7 0 0 0 14 0Z" />,
  chicken: (
    <>
      <path d="M5 12c-3-3-3-5-2-7 3 1 4 3 4 5m10-2V5c0-4 4-4 4 0v6c0 6-3 8-9 8s-8-3-7-7c3 2 7 2 12-4ZM8 19v3m7-3v3m6-15 2 1-2 1" />
      <circle cx="19" cy="5" r=".5" />
    </>
  ),
  tools: (
    <path d="m4 20 9-9m3-3 4-4c2 6-1 10-6 8L7 21l-4-4 9-7C10 5 14 2 20 4M3 3l18 18" />
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </>
  ),
  market: (
    <>
      <path d="m3 9 2-6h14l2 6M4 12v9h16v-9M3 9c0 4 4 4 4 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 4 4 4 0M8 21v-6h8v6" />
    </>
  ),
  gift: (
    <>
      <path d="M3 8h18v4H3V8Zm2 4v9h14v-9M12 8v13m0-13C5 8 4 2 8 3c3 0 4 5 4 5 0-5 4-6 5-4 2 3-2 4-5 4Z" />
    </>
  ),
  sound: (
    <>
      <path d="m10 4-5 5H2v6h3l5 5V4m5 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14" />
    </>
  ),
  star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z" />,
};
export default function Icon({ name, size = 22, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}
