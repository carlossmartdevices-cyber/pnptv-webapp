import type { SVGProps } from 'react';

export const PnpTvAppIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
      <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M12 2L2 7l10 15L22 7l-10-5z" fill="url(#icon-gradient)" stroke="url(#icon-gradient)" />
    <path d="M2 7l10 15V7L2 7z" fill="url(#icon-gradient)" stroke="url(#icon-gradient)" />
  </svg>
);
