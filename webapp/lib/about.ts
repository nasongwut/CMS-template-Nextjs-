/**
 * About page helpers — singleton page settings + lists of articles & timeline.
 *
 * Like the theme/settings helpers, these gracefully fall back to defaults when
 * the migration hasn't been applied yet (so the public /about page still
 * renders something useful).
 */
import { prisma } from "./prisma";

const SINGLETON_ID = "singleton";

export interface AboutPage {
  id: string;
  heading: string;
  subheading: string;
  body: string;
  heroImage: string | null;
  layout: string;
  updatedAt: Date;
}

export interface AboutArticle {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  imageUrl: string | null;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const defaultPage = (): AboutPage => ({
  id: SINGLETON_ID,
  heading: "About us",
  subheading: "Built by makers, for makers.",
  body: "",
  heroImage: null,
  layout: "classic",
  updatedAt: new Date(0),
});

function modelsAvailable(): {
  page: boolean;
  article: boolean;
  timeline: boolean;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = prisma as any;
  return {
    page: !!p?.aboutPage?.findUnique,
    article: !!p?.aboutArticle?.findMany,
    timeline: !!p?.timelineEvent?.findMany,
  };
}

export function isAboutReady(): boolean {
  const m = modelsAvailable();
  return m.page && m.article && m.timeline;
}

export async function getAboutPage(): Promise<AboutPage> {
  if (!modelsAvailable().page) return defaultPage();
  try {
    // Use upsert so concurrent calls (e.g. generateMetadata + page render)
    // don't race and hit a unique-constraint violation.
    const row = await prisma.aboutPage.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
    return normaliseAboutPage(row);
  } catch (e) {
    console.warn("getAboutPage: falling back to defaults", e);
    return defaultPage();
  }
}

export async function updateAboutPage(
  patch: Partial<
    Pick<AboutPage, "heading" | "subheading" | "body" | "heroImage" | "layout">
  >,
): Promise<AboutPage> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await (prisma.aboutPage as any).upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...patch },
    update: patch,
  });
  return normaliseAboutPage(row);
}

/**
 * Coerce whatever shape Prisma returns into our typed AboutPage. After
 * `prisma:generate` the row already contains `heroImage` and `layout`; if the
 * client is stale this fills sensible defaults so callers can rely on them.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseAboutPage(row: any): AboutPage {
  return {
    id: row.id,
    heading: row.heading,
    subheading: row.subheading,
    body: row.body,
    heroImage: row.heroImage ?? null,
    layout: row.layout ?? "classic",
    updatedAt: row.updatedAt,
  };
}

/* ─── timeline sorting ─── */

/**
 * Convert a free-form date label into a sortable number — newest highest.
 *
 *   "2014"        → 2014 * 12 = 24168
 *   "Q3 2024"     → 2024 * 12 + 6 = 24294
 *   "Oct 2026"    → 2026 * 12 + 9 = 24321
 *   "Sep 2026"    → 2026 * 12 + 8 = 24320
 *   ""            → -Infinity (sorts to top when desc, end when asc)
 */
export function dateRank(date: string): number {
  if (!date) return Number.NEGATIVE_INFINITY;
  const lower = date.toLowerCase();
  const y = lower.match(/\b(\d{4})\b/);
  const year = y ? Number(y[1]) : 0;
  if (!year) return Number.NEGATIVE_INFINITY;

  // Quarter — "Q1".."Q4"
  const q = lower.match(/q\s*([1-4])/);
  if (q) return year * 12 + (Number(q[1]) - 1) * 3;

  // Month names — English + Thai short
  const months: Array<[number, RegExp]> = [
    [0, /\b(jan|january|ม\.?ค\.?|มกราคม)\b/],
    [1, /\b(feb|february|ก\.?พ\.?|กุมภาพันธ์)\b/],
    [2, /\b(mar|march|มี\.?ค\.?|มีนาคม)\b/],
    [3, /\b(apr|april|เม\.?ย\.?|เมษายน)\b/],
    [4, /\b(may|พ\.?ค\.?|พฤษภาคม)\b/],
    [5, /\b(jun|june|มิ\.?ย\.?|มิถุนายน)\b/],
    [6, /\b(jul|july|ก\.?ค\.?|กรกฎาคม)\b/],
    [7, /\b(aug|august|ส\.?ค\.?|สิงหาคม)\b/],
    [8, /\b(sep|sept|september|ก\.?ย\.?|กันยายน)\b/],
    [9, /\b(oct|october|ต\.?ค\.?|ตุลาคม)\b/],
    [10, /\b(nov|november|พ\.?ย\.?|พฤศจิกายน)\b/],
    [11, /\b(dec|december|ธ\.?ค\.?|ธันวาคม)\b/],
  ];
  for (const [idx, re] of months) {
    if (re.test(lower)) return year * 12 + idx;
  }
  return year * 12;
}

/** Sort timeline events oldest → newest by parsed date label. */
export function sortTimelineByYear<T extends { date: string; order: number }>(
  events: T[],
  dir: "asc" | "desc" = "asc",
): T[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...events].sort((a, b) => {
    const ra = dateRank(a.date);
    const rb = dateRank(b.date);
    if (ra !== rb) return (ra - rb) * sign;
    return a.order - b.order;
  });
}

export async function listArticles({
  includeDrafts = false,
}: { includeDrafts?: boolean } = {}): Promise<AboutArticle[]> {
  if (!modelsAvailable().article) return [];
  try {
    return prisma.aboutArticle.findMany({
      where: includeDrafts ? {} : { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (e) {
    console.warn("listArticles: falling back to empty list", e);
    return [];
  }
}

export async function listTimeline({
  includeDrafts = false,
}: { includeDrafts?: boolean } = {}): Promise<TimelineEvent[]> {
  if (!modelsAvailable().timeline) return [];
  try {
    return prisma.timelineEvent.findMany({
      where: includeDrafts ? {} : { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  } catch (e) {
    console.warn("listTimeline: falling back to empty list", e);
    return [];
  }
}

/** Split a plain-text body on blank lines into paragraphs (preserves single \n as <br/>). */
export function splitParagraphs(body: string): string[][] {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.split("\n").map((s) => s.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);
}
