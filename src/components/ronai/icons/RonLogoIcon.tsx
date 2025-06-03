
import type { SVGProps } from 'react';

export function RonLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
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
      <circle cx="12" cy="12" r="10" fill="#8B5CF6" stroke="none" /> {/* Changed fill to primary purple */}
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="12"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
      >
        N
      </text>
    </svg>
  );
}
