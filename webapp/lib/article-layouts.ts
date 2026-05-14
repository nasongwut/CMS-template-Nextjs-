/**
 * Catalogue of available presets for an Article detail page.
 * Mirrors the structure of lib/about-layouts.ts but tuned for single-article
 * (long-form) rather than for a list page.
 */

export interface ArticleLayoutMeta {
  id: string;
  name: string;
  description: string;
  swatch: {
    primary: string;
    accent: string;
    shape:
      | "classic"
      | "magazine"
      | "minimal"
      | "editorial"
      | "wide"
      | "sidebar"
      | "bold"
      | "gallery"
      | "compact"
      | "technical";
  };
}

export const ARTICLE_LAYOUTS: ArticleLayoutMeta[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Centered title + paragraphs. Safe choice for most posts.",
    swatch: { primary: "#7c3aed", accent: "#ec4899", shape: "classic" },
  },
  {
    id: "magazine",
    name: "Magazine",
    description: "Full-width hero image with title overlay, large lead paragraph.",
    swatch: { primary: "#dc2626", accent: "#facc15", shape: "magazine" },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Narrow column, no decoration. Reads like a quiet letter.",
    swatch: { primary: "#18181b", accent: "#a1a1aa", shape: "minimal" },
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Drop cap, pull quotes between sections — feels like a print magazine.",
    swatch: { primary: "#0f172a", accent: "#f97316", shape: "editorial" },
  },
  {
    id: "wide",
    name: "Wide",
    description: "Full-width hero, body text laid out in 2 newspaper-style columns.",
    swatch: { primary: "#0ea5e9", accent: "#f59e0b", shape: "wide" },
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "Sticky left sidebar with title + meta, content on the right.",
    swatch: { primary: "#2563eb", accent: "#f97316", shape: "sidebar" },
  },
  {
    id: "bold",
    name: "Bold",
    description: "Dark hero, huge typography. Great for manifestos.",
    swatch: { primary: "#111827", accent: "#facc15", shape: "bold" },
  },
  {
    id: "gallery",
    name: "Gallery",
    description: "Visual-first — large hero, image grid, captions between.",
    swatch: { primary: "#db2777", accent: "#9333ea", shape: "gallery" },
  },
  {
    id: "compact",
    name: "Compact",
    description: "Tight narrow column, ideal for short notes or news flashes.",
    swatch: { primary: "#475569", accent: "#0ea5e9", shape: "compact" },
  },
  {
    id: "technical",
    name: "Technical",
    description: "Monospace title + structured body — perfect for documentation.",
    swatch: { primary: "#16a34a", accent: "#0ea5e9", shape: "technical" },
  },
];

export const DEFAULT_ARTICLE_LAYOUT = "classic";

export function isArticleLayoutId(id: string): boolean {
  return ARTICLE_LAYOUTS.some((l) => l.id === id);
}

export function getArticleLayoutMeta(id: string): ArticleLayoutMeta {
  return ARTICLE_LAYOUTS.find((l) => l.id === id) ?? ARTICLE_LAYOUTS[0];
}
