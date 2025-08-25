import type { SVGProps } from 'react';

export const PnpTvSparkIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 17 L5 22 L7 14 L2 9 L9 9 Z" fill="url(#icon-gradient)" stroke="url(#icon-gradient)" />
    <path d="M12 2v20" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.2" />
    <path d="M2 9h20" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.2" />
  </svg>
);
