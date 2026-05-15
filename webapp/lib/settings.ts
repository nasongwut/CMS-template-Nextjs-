/**
 * Site-wide branding/SEO settings — stored as a singleton row.
 *
 * `getSettings()` is safe to call during the very first request:
 *   - if the row doesn't exist yet, it creates one with the defaults from
 *     the schema;
 *   - if the table itself doesn't exist (migration not run), it returns a
 *     hard-coded fallback so the layout still renders. The admin UI will
 *     surface the migration error when it actually tries to save.
 */
import { prisma } from "./prisma";
import { env } from "./env";

export interface SiteSettings {
  id: string;
  siteName: string;
  description: string;
  keywords: string;
  author: string;
  updatedAt: Date;
}

const SINGLETON_ID = "singleton";

const fallback = (): SiteSettings => ({
  id: SINGLETON_ID,
  siteName: env.appName,
  description: "A Next.js starter with role-based membership and pluggable storage.",
  keywords: "",
  author: "",
  updatedAt: new Date(0),
});

export async function getSettings(): Promise<SiteSettings> {
  try {
    return await prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID, siteName: env.appName },
    });
  } catch (e) {
    // Prisma's upsert isn't atomic at the DB level — two parallel callers
    // (e.g. generateMetadata + page render in the same Next.js request)
    // can both see "row missing" and race to INSERT. The losing call hits
    // a unique-constraint error (P2002). Retry as a plain read in that case.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any)?.code === "P2002") {
      try {
        const row = await prisma.siteSettings.findUnique({
          where: { id: SINGLETON_ID },
        });
        if (row) return row;
      } catch {
        /* fall through */
      }
    }
    console.warn("getSettings: falling back to defaults", e);
    return fallback();
  }
}

export async function updateSettings(
  patch: Partial<Pick<SiteSettings, "siteName" | "description" | "keywords" | "author">>,
): Promise<SiteSettings> {
  return prisma.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...patch },
    update: patch,
  });
}

/** Parse the comma-separated keywords string into a clean array. */
export function parseKeywords(s: string): string[] {
  return s
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}
