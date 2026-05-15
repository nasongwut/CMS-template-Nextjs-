/**
 * Theme — singleton CSS variables that drive primary / accent / background /
 * foreground colors in both light and dark modes.
 */
import { prisma } from "./prisma";

/** Recognised site-wide design language ids — see SITE_THEMES below. */
export const SITE_STYLES = ["studio", "editorial", "gallery", "bloom", "terminal"] as const;
export type SiteStyle = (typeof SITE_STYLES)[number];

export function isSiteStyle(v: unknown): v is SiteStyle {
  return typeof v === "string" && (SITE_STYLES as readonly string[]).includes(v);
}

export interface Theme {
  id: string;
  lightPrimary: string;
  lightAccent: string;
  lightBackground: string;
  lightForeground: string;
  darkPrimary: string;
  darkAccent: string;
  darkBackground: string;
  darkForeground: string;
  siteStyle: string;
  updatedAt: Date;
}

const SINGLETON_ID = "singleton";

/**
 * Default theme — "Editorial Plum & Coral".
 *
 * Refined from the original violet/fuchsia so the surface feels less
 * generic-SaaS and more art-studio:
 *   - Light bg is warm off-white (stone-50) instead of zinc, like paper
 *   - Light fg is stone-900, slightly warmer than pure ink
 *   - Primary is purple-700 → confident without being neon
 *   - Accent is rose-500 → warm coral that pairs with the warm bg
 *   - Dark bg is stone-950 (deep ink with warm undertone)
 *   - Dark accents are dialled up so they pop against the dark
 */
/**
 * Default theme = Studio. Mirrors the first entry in SITE_THEMES exactly so
 * picking "Studio" in the admin matches what a fresh install ships with.
 */
export const themeDefaults: Omit<Theme, "id" | "updatedAt"> = {
  lightPrimary: "#7e22ce",
  lightAccent: "#f43f5e",
  lightBackground: "#f7f3ec",
  lightForeground: "#1c1917",
  darkPrimary: "#c084fc",
  darkAccent: "#fb7185",
  darkBackground: "#100b18",
  darkForeground: "#f5f3ef",
  siteStyle: "studio",
};

/**
 * Full-palette presets — each preset describes BOTH modes at once.
 * The admin theme picker writes all 8 colours when one of these is chosen.
 */
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  light: { primary: string; accent: string; background: string; foreground: string };
  dark: { primary: string; accent: string; background: string; foreground: string };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "plum-coral",
    name: "Plum & Coral",
    description: "Warm purple + soft coral on paper-white. The new default.",
    light: { primary: "#7e22ce", accent: "#f43f5e", background: "#fafaf9", foreground: "#1c1917" },
    dark: { primary: "#c084fc", accent: "#fb7185", background: "#0c0a09", foreground: "#f5f5f4" },
  },
  {
    id: "indigo-amber",
    name: "Indigo & Amber",
    description: "Confident editorial — deep indigo with warm gold accent.",
    light: { primary: "#4338ca", accent: "#f59e0b", background: "#fafaf7", foreground: "#1c1917" },
    dark: { primary: "#a5b4fc", accent: "#fbbf24", background: "#0a0a0c", foreground: "#fafaf9" },
  },
  {
    id: "violet-fuchsia",
    name: "Violet & Fuchsia",
    description: "The original — vivid violet + fuchsia gradient.",
    light: { primary: "#7c3aed", accent: "#ec4899", background: "#fafafa", foreground: "#18181b" },
    dark: { primary: "#a78bfa", accent: "#f472b6", background: "#09090b", foreground: "#fafafa" },
  },
  {
    id: "forest-ember",
    name: "Forest & Ember",
    description: "Earthy green + burnt orange. Quiet but characterful.",
    light: { primary: "#15803d", accent: "#ea580c", background: "#fafaf7", foreground: "#1c1917" },
    dark: { primary: "#4ade80", accent: "#fb923c", background: "#0c0a09", foreground: "#f5f5f4" },
  },
  {
    id: "ocean-rose",
    name: "Ocean & Rose",
    description: "Cool nautical blue paired with warm rose. Crisp.",
    light: { primary: "#0369a1", accent: "#f43f5e", background: "#f8fafc", foreground: "#0f172a" },
    dark: { primary: "#38bdf8", accent: "#fb7185", background: "#020617", foreground: "#f1f5f9" },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Burnt rust + fuchsia — golden hour energy.",
    light: { primary: "#c2410c", accent: "#db2777", background: "#fff7ed", foreground: "#27272a" },
    dark: { primary: "#fb923c", accent: "#f472b6", background: "#1c1917", foreground: "#fafaf9" },
  },
  {
    id: "sage-brass",
    name: "Sage & Brass",
    description: "Olive green with antique brass. Mature, gallery-ready.",
    light: { primary: "#4d7c0f", accent: "#a16207", background: "#fafaf7", foreground: "#1c1917" },
    dark: { primary: "#a3e635", accent: "#eab308", background: "#0c0a09", foreground: "#fafaf9" },
  },
  {
    id: "mono-red",
    name: "Mono & Red",
    description: "Pure black-and-white with one bold red accent. Tabloid.",
    light: { primary: "#18181b", accent: "#dc2626", background: "#fafafa", foreground: "#18181b" },
    dark: { primary: "#fafaf9", accent: "#f87171", background: "#0a0a0a", foreground: "#fafaf9" },
  },
  {
    id: "tropical",
    name: "Tropical",
    description: "Teal lagoon + warm amber. Refreshing and lively.",
    light: { primary: "#0d9488", accent: "#f59e0b", background: "#f0fdfa", foreground: "#134e4a" },
    dark: { primary: "#2dd4bf", accent: "#fbbf24", background: "#042f2e", foreground: "#f0fdfa" },
  },
  {
    id: "mocha-cream",
    name: "Mocha & Cream",
    description: "Espresso brown with cream highlights. Cozy.",
    light: { primary: "#7c2d12", accent: "#d97706", background: "#fef3c7", foreground: "#451a03" },
    dark: { primary: "#f97316", accent: "#fbbf24", background: "#1c1917", foreground: "#fef3c7" },
  },
];

export function getPreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id);
}

/**
 * SITE_THEMES — five fully designed site themes that bundle colours AND
 * design language. Picking one of these writes all 8 colours plus the
 * `siteStyle` flag which switches typography, border-radius and surface
 * details across the whole site via globals.css.
 */
export interface SiteTheme {
  id: SiteStyle;
  name: string;
  /** Short one-liner — used as the card subtitle. */
  blurb: string;
  /** Three sentences describing the vibe — used in the design summary. */
  description: string;
  /** Decorative emoji shown in the card swatch. */
  glyph: string;
  light: { primary: string; accent: string; background: string; foreground: string };
  dark: { primary: string; accent: string; background: string; foreground: string };
}

export const SITE_THEMES: SiteTheme[] = [
  {
    id: "studio",
    name: "Studio",
    blurb: "Refined creative studio — warm vellum + violet ink.",
    description:
      "Geist Sans, medium rounded corners, subtle shadows. Background is a warm " +
      "vellum cream; dark mode shifts to a deep aubergine ink that echoes the " +
      "primary purple. Feels like a contemporary art / design house.",
    glyph: "✦",
    // Light: #f7f3ec warm vellum cream — paper-like, slight gold undertone
    // Dark : #100b18 deep aubergine ink — picks up a hint of the primary
    light: { primary: "#7e22ce", accent: "#f43f5e", background: "#f7f3ec", foreground: "#1c1917" },
    dark: { primary: "#c084fc", accent: "#fb7185", background: "#100b18", foreground: "#f5f3ef" },
  },
  {
    id: "editorial",
    name: "Editorial",
    blurb: "Serif journal — manila paper + warm ink.",
    description:
      "Georgia/serif typography across the site, no rounded corners, no shadows. " +
      "Manila newsprint background with deep warm ink — reads like a quarterly " +
      "journal or museum catalogue.",
    glyph: "❦",
    // Light: #f5efdf manila paper — yellow-cream like newsprint
    // Dark : #1a1610 warm ink black — feels like wet ink on dark paper
    light: { primary: "#4338ca", accent: "#b45309", background: "#f5efdf", foreground: "#1c1917" },
    dark: { primary: "#a5b4fc", accent: "#f59e0b", background: "#1a1610", foreground: "#f5efdf" },
  },
  {
    id: "gallery",
    name: "Gallery",
    blurb: "Bold mono — gallery cream + one bold red.",
    description:
      "Heavy display weight, 2px black borders, square corners, hard offset " +
      "shadows. Off-white gallery walls (not pure white) + soft black ink — the " +
      "exact tones contemporary art galleries actually use.",
    glyph: "■",
    // Light: #f4f3ee classic gallery wall cream — what museums actually paint
    // Dark : #131313 elevated soft black — not pure 0, kinder to eyes
    light: { primary: "#171717", accent: "#dc2626", background: "#f4f3ee", foreground: "#0a0a0a" },
    dark: { primary: "#fafaf9", accent: "#ef4444", background: "#131313", foreground: "#fafafa" },
  },
  {
    id: "bloom",
    name: "Bloom",
    blurb: "Soft pastel — peach cream + wine ink.",
    description:
      "Warm peach-cream surface with wine-coloured foreground in light mode, " +
      "deep mauve in dark mode. Pastel rose + amber accents. Large radii + pill " +
      "buttons. Inviting boutique-skincare feel.",
    glyph: "❀",
    // Light: #fdf3eb peachy cream — warmer than the previous pink, less saccharine
    // Dark : #221319 deep mauve-wine — soft and feminine but rich
    light: { primary: "#db2777", accent: "#f59e0b", background: "#fdf3eb", foreground: "#451a2c" },
    dark: { primary: "#f9a8d4", accent: "#fcd34d", background: "#221319", foreground: "#fce7f3" },
  },
  {
    id: "terminal",
    name: "Terminal",
    blurb: "Mono dev studio — green-tinted paper, forest ink.",
    description:
      "Monospace font everywhere, 2px corners, no shadows. Background carries a " +
      "subtle green cast that ties into the terminal-green primary; dark mode is " +
      "a deep forest ink with mint-green readout.",
    glyph: "▌",
    // Light: #eef2ea slight green-tinted off-white — like an old CRT monitor at rest
    // Dark : #0a120d forest ink — deep but with a green undertone
    light: { primary: "#15803d", accent: "#0f766e", background: "#eef2ea", foreground: "#0c130c" },
    dark: { primary: "#4ade80", accent: "#22d3ee", background: "#0a120d", foreground: "#86efac" },
  },
];

export function getSiteTheme(id: string): SiteTheme | undefined {
  return SITE_THEMES.find((t) => t.id === id);
}

const fallback = (): Theme => ({
  id: SINGLETON_ID,
  ...themeDefaults,
  updatedAt: new Date(0),
});

export async function getTheme(): Promise<Theme> {
  try {
    // Atomic — protects against parallel callers racing the seed insert.
    const row = await prisma.themeSettings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID, ...themeDefaults },
    });
    // Older rows may not have siteStyle (stale prisma client) — normalise.
    return normaliseTheme(row);
  } catch (e) {
    console.warn("getTheme: falling back to defaults", e);
    return fallback();
  }
}

export async function updateTheme(patch: Partial<Omit<Theme, "id" | "updatedAt">>): Promise<Theme> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await (prisma.themeSettings as any).upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...themeDefaults, ...patch },
    update: patch,
  });
  return normaliseTheme(row);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseTheme(row: any): Theme {
  return {
    id: row.id,
    lightPrimary: row.lightPrimary,
    lightAccent: row.lightAccent,
    lightBackground: row.lightBackground,
    lightForeground: row.lightForeground,
    darkPrimary: row.darkPrimary,
    darkAccent: row.darkAccent,
    darkBackground: row.darkBackground,
    darkForeground: row.darkForeground,
    siteStyle: row.siteStyle ?? "studio",
    updatedAt: row.updatedAt,
  };
}

/** Validates a hex color. Accepts #rgb, #rrggbb, #rrggbbaa. */
export function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
}

/**
 * Build the inline <style> string that injects theme as CSS variables.
 * Also styles `<body>` so the chosen bg/fg actually drive the surface
 * instead of being applied only to the theme-preview component.
 */
export function themeStyleTag(t: Theme): string {
  return `
:root{
  --site-primary:${t.lightPrimary};
  --site-accent:${t.lightAccent};
  --site-bg:${t.lightBackground};
  --site-fg:${t.lightForeground};
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark){
  :root{
    --site-primary:${t.darkPrimary};
    --site-accent:${t.darkAccent};
    --site-bg:${t.darkBackground};
    --site-fg:${t.darkForeground};
  }
}
html, body{
  background-color: var(--site-bg);
  color: var(--site-fg);
}`.trim();
}
