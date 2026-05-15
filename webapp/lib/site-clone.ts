/**
 * Site-clone helper — connects to two tenant databases by URL and copies
 * content from a source site into a target site.
 *
 * Used by /super-admin/sites/[id]/clone to bootstrap a brand-new tenant
 * with the same look/content as an existing one.
 *
 * IMPORTANT: this spins up brand-new PrismaClient instances against the
 * supplied URLs — NOT the global singleton — so it can talk to any
 * tenant DB the platform admin has registered.
 */
import { PrismaClient } from "@prisma/client";

export type CloneScope =
  | "theme" // ThemeSettings singleton
  | "settings" // SiteSettings singleton
  | "about" // AboutPage + TimelineEvent (+ legacy AboutArticle)
  | "nav" // NavItem tree
  | "categories" // Category rows
  | "articles"; // Article rows

export const ALL_SCOPES: CloneScope[] = [
  "theme",
  "settings",
  "about",
  "nav",
  "categories",
  "articles",
];

export interface CloneOptions {
  sourceDbUrl: string;
  targetDbUrl: string;
  /** Which slices to copy. Empty = none, omitted = all. */
  scopes?: CloneScope[];
  /** Whether to wipe the target tables in each scope before copying. */
  wipeTarget?: boolean;
}

export interface CloneResult {
  scopes: Partial<Record<CloneScope, number>>;
  durationMs: number;
  errors: { scope: CloneScope; message: string }[];
}

function makeClient(url: string): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
}

/**
 * Run the clone. Both databases must have the same schema applied — we
 * recommend running `prisma migrate deploy` against the target before
 * cloning so all the tables exist.
 */
export async function cloneSite(opts: CloneOptions): Promise<CloneResult> {
  const start = Date.now();
  const scopes = opts.scopes ?? ALL_SCOPES;
  const wipe = opts.wipeTarget ?? true;
  const result: CloneResult = { scopes: {}, durationMs: 0, errors: [] };

  const source = makeClient(opts.sourceDbUrl);
  const target = makeClient(opts.targetDbUrl);

  try {
    if (scopes.includes("theme")) {
      try {
        const rows = await source.themeSettings.findMany();
        if (wipe) await target.themeSettings.deleteMany();
        for (const r of rows) {
          await target.themeSettings.upsert({
            where: { id: r.id },
            create: r,
            update: r,
          });
        }
        result.scopes.theme = rows.length;
      } catch (e) {
        result.errors.push({ scope: "theme", message: errMsg(e) });
      }
    }

    if (scopes.includes("settings")) {
      try {
        const rows = await source.siteSettings.findMany();
        if (wipe) await target.siteSettings.deleteMany();
        for (const r of rows) {
          await target.siteSettings.upsert({
            where: { id: r.id },
            create: r,
            update: r,
          });
        }
        result.scopes.settings = rows.length;
      } catch (e) {
        result.errors.push({ scope: "settings", message: errMsg(e) });
      }
    }

    if (scopes.includes("about")) {
      try {
        // AboutPage (singleton)
        const pages = await source.aboutPage.findMany();
        if (wipe) await target.aboutPage.deleteMany();
        for (const p of pages) {
          await target.aboutPage.upsert({ where: { id: p.id }, create: p, update: p });
        }
        // TimelineEvent
        const events = await source.timelineEvent.findMany();
        if (wipe) await target.timelineEvent.deleteMany();
        if (events.length) await target.timelineEvent.createMany({ data: events });
        result.scopes.about = pages.length + events.length;
      } catch (e) {
        result.errors.push({ scope: "about", message: errMsg(e) });
      }
    }

    if (scopes.includes("nav")) {
      try {
        const items = await source.navItem.findMany({
          orderBy: [{ parentId: "asc" }, { order: "asc" }],
        });
        if (wipe) await target.navItem.deleteMany();
        // Two passes — top-level first so children's parentId is valid.
        const top = items.filter((i) => !i.parentId);
        const children = items.filter((i) => i.parentId);
        if (top.length) await target.navItem.createMany({ data: top });
        if (children.length) await target.navItem.createMany({ data: children });
        result.scopes.nav = items.length;
      } catch (e) {
        result.errors.push({ scope: "nav", message: errMsg(e) });
      }
    }

    if (scopes.includes("categories")) {
      try {
        const cats = await source.category.findMany();
        if (wipe) {
          // Articles FK reference categories — wipe articles first if also in scope.
          if (scopes.includes("articles")) await target.article.deleteMany();
          await target.category.deleteMany();
        }
        if (cats.length) await target.category.createMany({ data: cats });
        result.scopes.categories = cats.length;
      } catch (e) {
        result.errors.push({ scope: "categories", message: errMsg(e) });
      }
    }

    if (scopes.includes("articles")) {
      try {
        const articles = await source.article.findMany();
        if (wipe && !scopes.includes("categories")) {
          await target.article.deleteMany();
        }
        if (articles.length) await target.article.createMany({ data: articles });
        result.scopes.articles = articles.length;
      } catch (e) {
        result.errors.push({ scope: "articles", message: errMsg(e) });
      }
    }
  } finally {
    await Promise.allSettled([source.$disconnect(), target.$disconnect()]);
  }

  result.durationMs = Date.now() - start;
  return result;
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

/**
 * Sanity-check a DATABASE_URL before saving it. Returns null on success or
 * a friendly error message on failure. Does NOT verify the URL belongs to
 * Postgres — just ensures it parses and we can open a transient connection.
 */
export async function pingDatabaseUrl(url: string): Promise<string | null> {
  if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
    return "URL must start with postgres:// or postgresql://";
  }
  const client = makeClient(url);
  try {
    // Cheapest possible round-trip.
    await client.$queryRawUnsafe("SELECT 1");
    return null;
  } catch (e) {
    return errMsg(e);
  } finally {
    await client.$disconnect().catch(() => undefined);
  }
}
