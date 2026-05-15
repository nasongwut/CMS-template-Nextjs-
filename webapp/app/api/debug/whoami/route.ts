/**
 * GET /api/debug/whoami
 *
 * Diagnostic endpoint — answers "given this request's hostname, which DB
 * will my pages query?". Returns the resolved Site (if any), the platform-
 * vs-tenant verdict, and a redacted view of the database URL.
 *
 * Visit on each domain you care about to verify routing:
 *   http://localhost:3000/api/debug/whoami        → isPlatform: true
 *   http://tenant-a.localhost:3000/api/debug/whoami → resolvedSite: {…}
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { platformPrisma } from "@/lib/prisma-platform";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redact(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    // Hide password if any
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return url.replace(/:[^:@/]+@/, ":***@");
  }
}

function isPlatformHostname(hostname: string): boolean {
  const platform = (process.env.PLATFORM_HOSTNAME || "").toLowerCase();
  if (platform && hostname === platform) return true;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0"
  );
}

export async function GET(req: NextRequest) {
  const rawHost =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const hostname = rawHost.split(":")[0].toLowerCase().trim();
  const port = rawHost.includes(":") ? rawHost.split(":")[1] : null;

  const platform = isPlatformHostname(hostname);

  let resolvedSite: null | {
    id: string;
    name: string;
    slug: string;
    primaryDomain: string | null;
    isActive: boolean;
    databaseUrl: string;
    directDbUrl: string;
  } = null;
  let lookupError: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isReady = !!(platformPrisma as any)?.siteDomain?.findUnique;

  if (!platform && isReady) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const domain = await (platformPrisma as any).siteDomain.findUnique({
        where: { hostname },
        include: { site: true },
      });
      if (domain?.site) {
        resolvedSite = {
          id: domain.site.id,
          name: domain.site.name,
          slug: domain.site.slug,
          primaryDomain: domain.site.primaryDomain,
          isActive: domain.site.isActive,
          databaseUrl: redact(domain.site.databaseUrl),
          directDbUrl: redact(domain.site.directDbUrl),
        };
      }
    } catch (e) {
      lookupError = e instanceof Error ? e.message : String(e);
    }
  }

  // List all registered domains so the operator can spot typos.
  let allDomains: { hostname: string; siteName: string; isActive: boolean }[] =
    [];
  if (isReady) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = await (platformPrisma as any).siteDomain.findMany({
        include: { site: { select: { name: true, isActive: true } } },
        orderBy: { createdAt: "asc" },
      });
      allDomains = rows.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          hostname: r.hostname,
          siteName: r.site?.name ?? "(deleted site)",
          isActive: r.site?.isActive ?? false,
        }),
      );
    } catch {
      /* ignore */
    }
  }

  const willUse: "platform-db" | "tenant-db" | "platform-fallback" = platform
    ? "platform-db"
    : resolvedSite && resolvedSite.isActive
      ? "tenant-db"
      : "platform-fallback";

  // Bonus: try to count rows in the destination DB so the operator can see
  // whether the apply-template actually wrote anything.
  let liveCounts: null | {
    schema: string;
    articles: number | string;
    categories: number | string;
    navItems: number | string;
    aboutPage: number | string;
    themeSettings: number | string;
  } = null;
  try {
    if (platform) {
      // Counts from platform DB (the one super-admin uses).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = platformPrisma as any;
      liveCounts = {
        schema: "public (platform)",
        articles: (await p.article.count().catch(() => "n/a")) as number,
        categories: (await p.category.count().catch(() => "n/a")) as number,
        navItems: (await p.navItem.count().catch(() => "n/a")) as number,
        aboutPage: (await p.aboutPage.count().catch(() => "n/a")) as number,
        themeSettings: (await p.themeSettings.count().catch(() => "n/a")) as number,
      };
    } else if (resolvedSite && resolvedSite.isActive) {
      // Open a fresh tenant client and count there.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fullSite = await (platformPrisma as any).site.findUnique({
        where: { id: resolvedSite.id },
      });
      if (fullSite?.databaseUrl) {
        const tenant = new PrismaClient({
          datasources: { db: { url: fullSite.databaseUrl } },
          log: ["error"],
        });
        try {
          let schemaForUrl = "public";
          try {
            schemaForUrl =
              new URL(fullSite.databaseUrl).searchParams.get("schema") ?? "public";
          } catch {
            /* ignore */
          }
          liveCounts = {
            schema: schemaForUrl,
            articles: (await tenant.article.count().catch((e: Error) => e.message.slice(0, 100))) as number,
            categories: (await tenant.category.count().catch((e: Error) => e.message.slice(0, 100))) as number,
            navItems: (await tenant.navItem.count().catch((e: Error) => e.message.slice(0, 100))) as number,
            aboutPage: (await tenant.aboutPage.count().catch((e: Error) => e.message.slice(0, 100))) as number,
            themeSettings: (await tenant.themeSettings.count().catch((e: Error) => e.message.slice(0, 100))) as number,
          };
        } finally {
          await tenant.$disconnect().catch(() => undefined);
        }
      }
    }
  } catch (e) {
    /* ignore */
    void e;
  }

  return NextResponse.json(
    {
      request: { hostname, port, rawHost },
      verdict: {
        isPlatformHostname: platform,
        resolvedSite,
        willUse,
        platformHostnameEnv: process.env.PLATFORM_HOSTNAME ?? null,
        lookupError,
      },
      liveCounts,
      registeredDomains: allDomains,
      hint: explain(willUse, hostname, allDomains, liveCounts),
    },
    { status: 200 },
  );
}

function explain(
  willUse: "platform-db" | "tenant-db" | "platform-fallback",
  hostname: string,
  domains: { hostname: string; siteName: string; isActive: boolean }[],
  liveCounts: {
    schema: string;
    articles: number | string;
    categories: number | string;
  } | null,
): string {
  if (willUse === "platform-db") {
    return (
      `Hostname "${hostname}" = PLATFORM host. ` +
      `เปิดที่ tenant subdomain เช่น http://tenant-a.localhost:3000 จะเห็น tenant content แทน. ` +
      `Registered domains: ${domains.map((d) => d.hostname).join(", ") || "(none)"}`
    );
  }
  if (willUse === "tenant-db") {
    const empty =
      liveCounts &&
      typeof liveCounts.articles === "number" &&
      liveCounts.articles === 0 &&
      typeof liveCounts.categories === "number" &&
      liveCounts.categories === 0;
    if (empty) {
      return (
        `✓ Tenant routing works. But schema "${liveCounts?.schema}" has 0 articles + 0 categories — ` +
        `apply-template DIDN'T write data. Go to /super-admin and re-run Apply for this site.`
      );
    }
    return (
      `✓ Tenant routing works AND data exists in schema "${liveCounts?.schema}". ` +
      `If pages still look like main site, force-refresh (⌘⇧R) — Next.js may be caching.`
    );
  }
  // platform-fallback
  const known = domains.map((d) => d.hostname).join(", ") || "(none)";
  return (
    `Hostname "${hostname}" NOT in SiteDomain table — falling back to platform DB. ` +
    `Add it at /super-admin/sites/[id] → Site details → Primary domain → Save. ` +
    `Registered: ${known}`
  );
}
