import { withBasePath } from "@/lib/base-path";
import type { ConsolePlatform, GameConsole } from "@/types";

/** Image slug → file in /public/consoles/ */
export type ConsoleImageSlug =
  | "ps5-premium"
  | "ps5-standard"
  | "8-ball-pool"
  | "air-hockey"
  | "table-tennis"
  | "foosball"
  | "playstation";

interface ImageRule {
  slug: ConsoleImageSlug;
  keywords: string[];
}

/** Google Sheets console type id → image (stable when names vary slightly). */
const SHEETS_ID_TO_SLUG: Record<number, ConsoleImageSlug> = {
  1: "ps5-premium",
  2: "ps5-standard",
  3: "8-ball-pool",
  4: "air-hockey",
  5: "table-tennis",
  6: "foosball",
};

/** Exact setup names — most specific matches first. */
const SETUP_RULES: ImageRule[] = [
  {
    slug: "ps5-premium",
    keywords: [
      "ps5-premium",
      "ps5 premium",
      "premium ps5",
      "playstation 5 premium",
      "playstation premium",
    ],
  },
  {
    slug: "ps5-standard",
    keywords: [
      "ps5-standard",
      "ps5 standard",
      "standard ps5",
      "playstation 5 standard",
      "playstation standard",
    ],
  },
  {
    slug: "8-ball-pool",
    keywords: [
      "8 ball pool",
      "8-ball pool",
      "8ball pool",
      "eight ball pool",
      "billiards",
      "pool table",
    ],
  },
  { slug: "air-hockey", keywords: ["air hockey", "air-hockey", "airhockey"] },
  {
    slug: "table-tennis",
    keywords: [
      "table tennis",
      "table-tennis",
      "tabel tennis",
      "ping pong",
      "ping-pong",
    ],
  },
  { slug: "foosball", keywords: ["foosball", "foos ball", "table football"] },
  { slug: "playstation", keywords: ["playstation", "ps5", "ps4", "dualsense"] },
];

const PLATFORM_FALLBACK: Record<ConsolePlatform, ConsoleImageSlug> = {
  playstation: "playstation",
  xbox: "playstation",
  nintendo: "playstation",
  pc: "playstation",
  vr: "playstation",
  other: "foosball",
};

const AVAILABLE_IMAGES = new Set<ConsoleImageSlug>([
  "ps5-premium",
  "ps5-standard",
  "8-ball-pool",
  "air-hockey",
  "table-tennis",
  "foosball",
  "playstation",
]);

/** Slug → filename (without extension). Avoids paths starting with a digit. */
const SLUG_TO_FILENAME: Record<ConsoleImageSlug, string> = {
  "ps5-premium": "ps5-premium",
  "ps5-standard": "ps5-standard",
  "8-ball-pool": "ball-pool",
  "air-hockey": "air-hockey",
  "table-tennis": "table-tennis",
  foosball: "foosball",
  playstation: "playstation",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesRule(text: string, rule: ImageRule): boolean {
  return rule.keywords.some((kw) => text.includes(kw));
}

function slugFromSetupId(id?: string): ConsoleImageSlug | null {
  if (!id) return null;
  if (AVAILABLE_IMAGES.has(id as ConsoleImageSlug)) {
    return id as ConsoleImageSlug;
  }
  const numericId = Number(id);
  if (Number.isInteger(numericId) && SHEETS_ID_TO_SLUG[numericId]) {
    return SHEETS_ID_TO_SLUG[numericId];
  }
  return null;
}

export function resolveConsoleImageSlug(
  name: string,
  description?: string,
  platform?: ConsolePlatform,
  id?: string,
): ConsoleImageSlug {
  const fromId = slugFromSetupId(id);
  if (fromId) return fromId;

  const haystack = normalize(`${name} ${description ?? ""}`);

  for (const rule of SETUP_RULES) {
    if (matchesRule(haystack, rule)) return rule.slug;
  }

  if (platform) return PLATFORM_FALLBACK[platform];
  return "playstation";
}

export function getConsoleImagePath(
  console: Pick<GameConsole, "id" | "name" | "platform" | "description" | "imageUrl">,
): string {
  if (console.imageUrl?.trim()) {
    const url = console.imageUrl.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return withBasePath(url.startsWith("/") ? url : `/${url}`);
  }

  const slug = resolveConsoleImageSlug(
    console.name,
    console.description,
    console.platform,
    console.id,
  );

  const resolved = AVAILABLE_IMAGES.has(slug)
    ? slug
    : PLATFORM_FALLBACK[console.platform] ?? "playstation";

  const filename = SLUG_TO_FILENAME[resolved];
  return withBasePath(`/consoles/${filename}.png`);
}

export function enrichConsoleWithImage<T extends GameConsole>(console: T): T {
  if (console.imageUrl?.trim()) return console;
  return {
    ...console,
    imageUrl: getConsoleImagePath(console),
  };
}
