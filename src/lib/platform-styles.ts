import type { ConsolePlatform } from "@/types";

export interface PlatformStyle {
  label: string;
  color: string;
}

export const platformStyles: Record<ConsolePlatform, PlatformStyle> = {
  playstation: { label: "PlayStation", color: "#4da3ff" },
  xbox: { label: "Xbox", color: "#52b043" },
  nintendo: { label: "Nintendo", color: "#ff6b7a" },
  pc: { label: "PC Gaming", color: "#818cf8" },
  vr: { label: "VR", color: "#c084fc" },
  other: { label: "Gaming", color: "#f97316" },
};

export function getPlatformStyle(platform: ConsolePlatform): PlatformStyle {
  return platformStyles[platform] ?? platformStyles.other;
}
