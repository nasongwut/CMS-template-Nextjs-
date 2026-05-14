/**
 * Lightweight, first-party analytics — no external service required.
 *
 * Page views are inserted by POST /api/track/pageview (called from the
 * PageTracker client component). The admin dashboard reads aggregated stats
 * via direct Prisma queries.
 *
 * Every aggregator is wrapped in try/catch so the admin dashboard still renders
 * (with empty data) when:
 *   - the Prisma client hasn't been regenerated yet (`prisma.pageView` is undefined), or
 *   - the migration hasn't been applied yet (table missing).
 */
import crypto from "node:crypto";
import { prisma } from "./prisma";

/** Classify where a visitor came from based on referrer + UTM params. */
export function classifySource(
  referrer: string | null | undefined,
  utm?: { source?: string | null; medium?: string | null },
): string {
  if (utm?.source) {
    const tag = utm.source.toLowerCase();
    if (utm.medium) return `${utm.medium.toLowerCase()}:${tag}`;
    return tag;
  }
  if (!referrer) return "direct";

  let host: string;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "unknown";
  }

  const search = ["google.", "bing.", "duckduckgo.", "yahoo.", "yandex.", "baidu.", "ecosia."];
  const social = [
    ["facebook", /facebook\./],
    ["twitter", /twitter\.|x\.com|t\.co/],
    ["linkedin", /linkedin\./],
    ["reddit", /reddit\./],
    ["instagram", /instagram\./],
    ["tiktok", /tiktok\./],
    ["youtube", /youtube\.|youtu\.be/],
    ["github", /github\./],
    ["discord", /discord\.|discordapp\./],
  ] as const;

  for (const s of search) {
    if (host.startsWith(s) || host.includes(s)) {
      return "search:" + host.split(".")[0];
    }
  }
  for (const [name, re] of social) {
    if (re.test(host)) return "social:" + name;
  }

  return "referral:" + host;
}

/** Pretty label for a source string. */
export function labelSource(source: string): {
  label: string;
  kind: "direct" | "search" | "social" | "referral" | "campaign" | "unknown";
} {
  if (source === "direct") return { label: "Direct", kind: "direct" };
  if (source === "unknown") return { label: "Unknown", kind: "unknown" };
  const [k, v] = source.split(":");
  if (k === "search") return { label: `Search · ${v}`, kind: "search" };
  if (k === "social") return { label: `Social · ${v}`, kind: "social" };
  if (k === "referral") return { label: `Referral · ${v}`, kind: "referral" };
  return { label: source, kind: "campaign" };
}

/** Stable hash used as a cheap unique-visitor identifier — no PII stored. */
export function visitorHash(ip: string, userAgent: string, day: string): string {
  return crypto
    .createHash("sha256")
    .update(`${ip}|${userAgent}|${day}`)
    .digest("hex")
    .slice(0, 16);
}

/* ─── safety net ──────────────────────────────────────────────────────── */

/**
 * Returns true if `prisma.pageView` is wired up by the generated client.
 * False when the developer hasn't run `prisma generate` after adding the model.
 */
function pageViewAvailable(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.pageView?.count;
}

function warnMissingTable(err: unknown) {
  console.warn(
    "analytics: PageView model/table unavailable — run `npm run prisma:migrate` (or `npm run prisma:generate` if you've already migrated).",
    err,
  );
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!pageViewAvailable()) {
    warnMissingTable(`${label}: prisma.pageView not generated`);
    return fallback;
  }
  try {
    return await fn();
  } catch (e) {
    warnMissingTable(`${label}: query failed`);
    if (e instanceof Error) console.warn(e.message);
    return fallback;
  }
}

/* ─── aggregations consumed by /admin (Dashboard) ─── */

const DAY_MS = 86_400_000;

function startOf(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function aggregateOverview() {
  const empty = {
    viewsToday: 0,
    viewsWeek: 0,
    viewsMonth: 0,
    viewsAll: 0,
    uniquesToday: 0,
    uniquesWeek: 0,
    uniquesMonth: 0,
  };

  return safe("aggregateOverview", async () => {
    const now = new Date();
    const today = startOf(now);
    const week = new Date(today.getTime() - 6 * DAY_MS);
    const month = new Date(today.getTime() - 29 * DAY_MS);

    const [
      viewsToday,
      viewsWeek,
      viewsMonth,
      viewsAll,
      uniquesToday,
      uniquesWeek,
      uniquesMonth,
    ] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
      prisma.pageView.count({ where: { createdAt: { gte: week } } }),
      prisma.pageView.count({ where: { createdAt: { gte: month } } }),
      prisma.pageView.count(),
      countUniqueVisitors(today),
      countUniqueVisitors(week),
      countUniqueVisitors(month),
    ]);

    return {
      viewsToday,
      viewsWeek,
      viewsMonth,
      viewsAll,
      uniquesToday,
      uniquesWeek,
      uniquesMonth,
    };
  }, empty);
}

async function countUniqueVisitors(since: Date): Promise<number> {
  const rows = await prisma.pageView.findMany({
    where: { createdAt: { gte: since }, visitorHash: { not: null } },
    select: { visitorHash: true },
    distinct: ["visitorHash"],
  });
  return rows.length;
}

export async function aggregateDailySeries(days = 30): Promise<
  { day: string; views: number; uniques: number }[]
> {
  const today = startOf(new Date());
  const from = new Date(today.getTime() - (days - 1) * DAY_MS);

  // Always return an array of `days` length so the chart can render an empty grid.
  const empty: { day: string; views: number; uniques: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getTime() + i * DAY_MS);
    empty.push({ day: formatDay(d), views: 0, uniques: 0 });
  }

  return safe(
    "aggregateDailySeries",
    async () => {
      const rows = await prisma.pageView.findMany({
        where: { createdAt: { gte: from } },
        select: { createdAt: true, visitorHash: true },
      });

      const buckets = new Map<string, { views: number; uniques: Set<string> }>();
      for (let i = 0; i < days; i++) {
        const d = new Date(from.getTime() + i * DAY_MS);
        buckets.set(formatDay(d), { views: 0, uniques: new Set() });
      }
      for (const r of rows) {
        const key = formatDay(r.createdAt);
        const b = buckets.get(key);
        if (!b) continue;
        b.views++;
        if (r.visitorHash) b.uniques.add(r.visitorHash);
      }
      return [...buckets.entries()].map(([day, v]) => ({
        day,
        views: v.views,
        uniques: v.uniques.size,
      }));
    },
    empty,
  );
}

function formatDay(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function topSources(limit = 8, sinceDays = 30) {
  return safe(
    "topSources",
    async () => {
      const since = new Date(Date.now() - sinceDays * DAY_MS);
      const rows = await prisma.pageView.groupBy({
        by: ["source"],
        where: { createdAt: { gte: since }, source: { not: null } },
        _count: true,
        orderBy: { _count: { source: "desc" } },
        take: limit,
      });
      return rows.map((r) => ({ source: r.source ?? "unknown", count: r._count }));
    },
    [] as { source: string; count: number }[],
  );
}

export async function topPages(limit = 8, sinceDays = 30) {
  return safe(
    "topPages",
    async () => {
      const since = new Date(Date.now() - sinceDays * DAY_MS);
      const rows = await prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: since } },
        _count: true,
        orderBy: { _count: { path: "desc" } },
        take: limit,
      });
      return rows.map((r) => ({ path: r.path, count: r._count }));
    },
    [] as { path: string; count: number }[],
  );
}

/** Top countries — uses the `country` column populated from edge headers. */
export async function topCountries(limit = 8, sinceDays = 30) {
  return safe(
    "topCountries",
    async () => {
      const since = new Date(Date.now() - sinceDays * DAY_MS);
      const rows = await prisma.pageView.groupBy({
        by: ["country"],
        where: { createdAt: { gte: since }, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: "desc" } },
        take: limit,
      });
      return rows.map((r) => ({ country: r.country ?? "XX", count: r._count }));
    },
    [] as { country: string; count: number }[],
  );
}

/**
 * Top referring websites — groups by the referrer hostname (e.g.
 * "google.com", "facebook.com"). Skips `direct` traffic.
 */
export async function topReferrerHosts(limit = 10, sinceDays = 30) {
  return safe(
    "topReferrerHosts",
    async () => {
      const since = new Date(Date.now() - sinceDays * DAY_MS);
      const rows = await prisma.pageView.groupBy({
        by: ["referrerHost"],
        where: { createdAt: { gte: since }, referrerHost: { not: null } },
        _count: true,
        orderBy: { _count: { referrerHost: "desc" } },
        take: limit,
      });
      return rows.map((r) => ({ host: r.referrerHost ?? "unknown", count: r._count }));
    },
    [] as { host: string; count: number }[],
  );
}

export async function recentReferrers(limit = 12) {
  return safe(
    "recentReferrers",
    async () =>
      prisma.pageView.findMany({
        where: { referrer: { not: null } },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          referrer: true,
          path: true,
          source: true,
          country: true,
          createdAt: true,
        },
      }),
    [] as {
      id: string;
      referrer: string | null;
      path: string;
      source: string | null;
      country: string | null;
      createdAt: Date;
    }[],
  );
}

/** Helper used by the dashboard page to detect the "schema not migrated yet" state. */
export function isAnalyticsReady(): boolean {
  return pageViewAvailable();
}
