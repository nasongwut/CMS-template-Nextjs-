/**
 * Apply a SiteTemplate to a tenant database — bootstraps About, Theme,
 * SiteSettings, NavItems, Categories, Articles, TimelineEvents.
 *
 * Used by /super-admin/sites/[id]/apply-template. Spins up an ad-hoc
 * PrismaClient against the supplied URL so it can talk to any tenant DB
 * the platform admin has registered.
 */
import { PrismaClient } from "@prisma/client";
import type { SiteTemplate } from "./templates/types";
import { getSiteTheme } from "./theme";

export interface ApplyTemplateOptions {
  targetDbUrl: string;
  template: SiteTemplate;
  /** Wipe Article/Category/NavItem/TimelineEvent before applying. */
  wipeTarget?: boolean;
}

export interface ApplyTemplateResult {
  categories: number;
  articles: number;
  timeline: number;
  navItems: number;
  durationMs: number;
  errors: { step: string; message: string }[];
}

export async function applyTemplate(
  opts: ApplyTemplateOptions,
): Promise<ApplyTemplateResult> {
  const start = Date.now();
  const wipe = opts.wipeTarget ?? true;
  const result: ApplyTemplateResult = {
    categories: 0,
    articles: 0,
    timeline: 0,
    navItems: 0,
    durationMs: 0,
    errors: [],
  };
  const tpl = opts.template;

  const target = new PrismaClient({
    datasources: { db: { url: opts.targetDbUrl } },
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

  try {
    /* ── Theme — pulled from SITE_THEMES so colour + style stay in sync ── */
    try {
      const siteTheme = getSiteTheme(tpl.themeId);
      if (siteTheme) {
        const themePayload = {
          lightPrimary: siteTheme.light.primary,
          lightAccent: siteTheme.light.accent,
          lightBackground: siteTheme.light.background,
          lightForeground: siteTheme.light.foreground,
          darkPrimary: siteTheme.dark.primary,
          darkAccent: siteTheme.dark.accent,
          darkBackground: siteTheme.dark.background,
          darkForeground: siteTheme.dark.foreground,
          siteStyle: siteTheme.id,
        };
        await target.themeSettings.upsert({
          where: { id: "singleton" },
          create: { id: "singleton", ...themePayload },
          update: themePayload,
        });
      }
    } catch (e) {
      result.errors.push({ step: "theme", message: errMsg(e) });
    }

    /* ── Site settings ── */
    try {
      await target.siteSettings.upsert({
        where: { id: "singleton" },
        create: {
          id: "singleton",
          siteName: tpl.siteName,
          description: tpl.siteDescription,
        },
        update: {
          siteName: tpl.siteName,
          description: tpl.siteDescription,
        },
      });
    } catch (e) {
      result.errors.push({ step: "settings", message: errMsg(e) });
    }

    /* ── About page (singleton) + timeline ── */
    try {
      await target.aboutPage.upsert({
        where: { id: "singleton" },
        create: {
          id: "singleton",
          heading: tpl.about.heading,
          subheading: tpl.about.subheading,
          body: tpl.about.body,
          heroImage: tpl.about.heroImage ?? null,
          layout: tpl.about.layout,
        },
        update: {
          heading: tpl.about.heading,
          subheading: tpl.about.subheading,
          body: tpl.about.body,
          heroImage: tpl.about.heroImage ?? null,
          layout: tpl.about.layout,
        },
      });
    } catch (e) {
      result.errors.push({ step: "about", message: errMsg(e) });
    }

    try {
      if (wipe) await target.timelineEvent.deleteMany();
      if (tpl.timeline.length > 0) {
        await target.timelineEvent.createMany({
          data: tpl.timeline.map((t) => ({
            date: t.date,
            title: t.title,
            description: t.description,
            imageUrl: t.imageUrl ?? null,
            order: t.order,
            isPublished: true,
          })),
        });
        result.timeline = tpl.timeline.length;
      }
    } catch (e) {
      result.errors.push({ step: "timeline", message: errMsg(e) });
    }

    /* ── Categories — wipe first so we can re-seed with fresh ids ── */
    const catIdBySlug = new Map<string, string>();
    try {
      if (wipe) {
        await target.article.deleteMany(); // FK depends on category
        await target.category.deleteMany();
      }
      for (const c of tpl.categories) {
        const created = await target.category.create({
          data: {
            slug: c.slug,
            name: c.name,
            description: c.description,
            coverImage: c.coverImage ?? null,
            order: c.order,
            isPublished: true,
          },
        });
        catIdBySlug.set(c.slug, created.id);
      }
      result.categories = tpl.categories.length;
    } catch (e) {
      result.errors.push({ step: "categories", message: errMsg(e) });
    }

    /* ── Articles — reference categories by slug ── */
    try {
      const now = new Date();
      for (const a of tpl.articles) {
        await target.article.create({
          data: {
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt,
            body: a.body,
            coverImage: a.coverImage ?? null,
            layout: a.layout,
            categoryId: catIdBySlug.get(a.categorySlug) ?? null,
            isPublished: true,
            publishedAt: new Date(now.getTime() - a.order * 86_400_000 * 3),
            order: a.order,
          },
        });
      }
      result.articles = tpl.articles.length;
    } catch (e) {
      result.errors.push({ step: "articles", message: errMsg(e) });
    }

    /* ── Nav items — two-pass so children can reference parent ids ── */
    try {
      if (wipe) await target.navItem.deleteMany();
      const parentIds = new Map<string, string>();
      for (const n of tpl.navItems) {
        const created = await target.navItem.create({
          data: {
            label: n.label,
            kind: n.kind,
            target: n.target,
            order: n.order,
            requireAuth: n.requireAuth ?? false,
            isPublished: true,
          },
        });
        parentIds.set(n.label, created.id);
        result.navItems++;
      }
      for (const n of tpl.navItems) {
        if (!n.children) continue;
        const parentId = parentIds.get(n.label);
        if (!parentId) continue;
        for (const c of n.children) {
          await target.navItem.create({
            data: {
              label: c.label,
              kind: c.kind,
              target: c.target,
              parentId,
              order: c.order,
              requireAuth: c.requireAuth ?? false,
              isPublished: true,
            },
          });
          result.navItems++;
        }
      }
    } catch (e) {
      result.errors.push({ step: "nav", message: errMsg(e) });
    }
  } finally {
    await target.$disconnect().catch(() => undefined);
  }

  result.durationMs = Date.now() - start;
  return result;
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
