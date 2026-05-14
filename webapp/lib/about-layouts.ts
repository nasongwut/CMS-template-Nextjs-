/**
 * Catalogue of available presets for the public /about page.
 *
 * The admin picks one of these by id; the public page imports
 * AboutLayoutDispatcher (app/about/_layouts/index.tsx) which renders the
 * matching component.
 */

export interface LayoutMeta {
  id: string;
  name: string;
  description: string;
  /** Inline SVG-ish preview painted in the admin picker. */
  swatch: {
    primary: string;
    accent: string;
    shape: "centered" | "split" | "magazine" | "grid" | "horizontal" | "sidebar" | "bold" | "compact" | "mosaic" | "minimal";
  };
}

export const ABOUT_LAYOUTS: LayoutMeta[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Centered hero + vertical timeline with gradient rail — the original look.",
    swatch: { primary: "#7c3aed", accent: "#ec4899", shape: "centered" },
  },
  {
    id: "split",
    name: "Split Hero",
    description: "Hero is a 2-column grid (text + image). Timeline alternates left/right.",
    swatch: { primary: "#0ea5e9", accent: "#f59e0b", shape: "split" },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Pure text, no gradients. Timeline is a tight typographic list.",
    swatch: { primary: "#18181b", accent: "#a1a1aa", shape: "minimal" },
  },
  {
    id: "magazine",
    name: "Magazine",
    description: "Big 16:9 hero image with overlaid title. Timeline as alternating wide cards.",
    swatch: { primary: "#dc2626", accent: "#facc15", shape: "magazine" },
  },
  {
    id: "cards",
    name: "Card Grid",
    description: "Timeline events rendered as a 3-column card grid.",
    swatch: { primary: "#16a34a", accent: "#0ea5e9", shape: "grid" },
  },
  {
    id: "horizontal",
    name: "Horizontal Timeline",
    description: "Hero centered, timeline scrolls horizontally with year markers.",
    swatch: { primary: "#7c3aed", accent: "#22d3ee", shape: "horizontal" },
  },
  {
    id: "compact",
    name: "Compact",
    description: "Narrow column, tight spacing. Great for short timelines.",
    swatch: { primary: "#475569", accent: "#0ea5e9", shape: "compact" },
  },
  {
    id: "sidebar",
    name: "Sidebar Years",
    description: "Sticky year navigation on the left, content on the right.",
    swatch: { primary: "#2563eb", accent: "#f97316", shape: "sidebar" },
  },
  {
    id: "bold",
    name: "Bold",
    description: "Full-bleed hero image with big overlay text. Massive year numbers in timeline.",
    swatch: { primary: "#111827", accent: "#facc15", shape: "bold" },
  },
  {
    id: "mosaic",
    name: "Mosaic",
    description: "Image-heavy mosaic timeline. Visual-first.",
    swatch: { primary: "#db2777", accent: "#9333ea", shape: "mosaic" },
  },
];

export const DEFAULT_LAYOUT = "classic";

export function isLayoutId(id: string): boolean {
  return ABOUT_LAYOUTS.some((l) => l.id === id);
}

export function getLayoutMeta(id: string): LayoutMeta {
  return ABOUT_LAYOUTS.find((l) => l.id === id) ?? ABOUT_LAYOUTS[0];
}
