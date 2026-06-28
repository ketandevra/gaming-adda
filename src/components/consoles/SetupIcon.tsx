import { memo, type ReactNode } from "react";

export type SetupIconType =
  | "ps5-premium"
  | "ps5-standard"
  | "8-ball-pool"
  | "air-hockey"
  | "table-tennis"
  | "foosball";

interface SetupIconProps {
  setupId: SetupIconType | string;
  color: string;
  size?: number;
}

function SetupIconComponent({ setupId, color, size = 18 }: SetupIconProps) {
  const icons: Record<string, ReactNode> = {
    "ps5-premium": (
      <>
        <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
        <path d="M9 10v4M9 12h2M15 10c-1 0-1.5.5-1.5 1.5s.5 1.5 1.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </>
    ),
    "ps5-standard": (
      <>
        <rect x="5" y="8" width="14" height="9" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
        <path d="M8 11h2v2H8zM14 11h2v2h-2z" fill={color} />
      </>
    ),
    "8-ball-pool": (
      <>
        <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
        <circle cx="12" cy="12" r="2.5" fill={color} />
        <text x="12" y="13.5" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">8</text>
      </>
    ),
    "air-hockey": (
      <>
        <rect x="4" y="7" width="16" height="10" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
        <circle cx="12" cy="12" r="2" fill={color} />
        <path d="M8 17h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    "table-tennis": (
      <>
        <ellipse cx="12" cy="14" rx="8" ry="3" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
        <line x1="12" y1="14" x2="12" y2="6" stroke={color} strokeWidth="1.5" />
        <circle cx="12" cy="5" r="2" stroke={color} strokeWidth="1.2" fill={`${color}25`} />
      </>
    ),
    foosball: (
      <>
        <rect x="4" y="9" width="16" height="7" rx="1.5" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
        <line x1="8" y1="7" x2="8" y2="18" stroke={color} strokeWidth="1.2" />
        <line x1="12" y1="7" x2="12" y2="18" stroke={color} strokeWidth="1.2" />
        <line x1="16" y1="7" x2="16" y2="18" stroke={color} strokeWidth="1.2" />
        <circle cx="8" cy="8" r="1" fill={color} />
        <circle cx="12" cy="8" r="1" fill={color} />
        <circle cx="16" cy="8" r="1" fill={color} />
      </>
    ),
  };

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      {icons[setupId] ?? icons["ps5-standard"]}
    </svg>
  );
}

export const SetupIcon = memo(SetupIconComponent);
