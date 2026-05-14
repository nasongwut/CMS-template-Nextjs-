/**
 * Theme — singleton CSS variables that drive primary / accent / background /
 * foreground colors in both light and dark modes.
 */
import { prisma } from "./prisma";

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
  updatedAt: Date;
}

const SINGLETON_ID = "singleton";

export const themeDefaults: Omit<Theme, "id" | "updatedAt"> = {
  lightPrimary: "#7c3aed",
  lightAccent: "#ec4899",
  lightBackground: "#fafafa",
  lightForeground: "#18181b",
  darkPrimary: "#a78bfa",
  darkAccent: "#f472b6",
  darkBackground: "#09090b",
  darkForeground: "#fafafa",
};

const fallback = (): Theme => ({
  id: SINGLETON_ID,
  ...themeDefaults,
  updatedAt: new Date(0),
});

export async function getTheme(): Promise<Theme> {
  try {
    // Atomic — protects against parallel callers racing the seed insert.
    return await prisma.themeSettings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID, ...themeDefaults },
    });
  } catch (e) {
    console.warn("getTheme: falling back to defaults", e);
    return fallback();
  }
}

export async function updateTheme(patch: Partial<Omit<Theme, "id" | "updatedAt">>): Promise<Theme> {
  return prisma.themeSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...themeDefaults, ...patch },
    update: patch,
  });
}

/** Validates a hex color. Accepts #rgb, #rrggbb, #rrggbbaa. */
export function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
}

/** Build the inline <style> string that injects theme as CSS variables. */
export function themeStyleTag(t: Theme): string {
  return `
:root{
  --site-primary:${t.lightPrimary};
  --site-accent:${t.lightAccent};
  --site-bg:${t.lightBackground};
  --site-fg:${t.lightForeground};
}
@media (prefers-color-scheme: dark){
  :root{
    --site-primary:${t.darkPrimary};
    --site-accent:${t.darkAccent};
    --site-bg:${t.darkBackground};
    --site-fg:${t.darkForeground};
  }
}`.trim();
}
