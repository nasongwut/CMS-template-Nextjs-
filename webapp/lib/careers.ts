/**
 * Careers helpers — graceful fallbacks when the migration hasn't been run
 * (mirrors lib/about.ts pattern).
 */
import { prisma } from "./prisma";
import { TEMPLATES, type SiteTemplate } from "./templates";
import type { TemplatePosition } from "./templates/types";

export function isCareersReady(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.jobApplication?.findMany;
}

export const ALLOWED_STATUSES = [
  "NEW",
  "REVIEWING",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
  "ARCHIVED",
] as const;

export type ApplicationStatus = (typeof ALLOWED_STATUSES)[number];

export function isStatus(v: unknown): v is ApplicationStatus {
  return typeof v === "string" && (ALLOWED_STATUSES as readonly string[]).includes(v);
}

export const STATUS_LABELS: Record<ApplicationStatus, { label: string; tone: string }> = {
  NEW: { label: "New", tone: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
  REVIEWING: { label: "Reviewing", tone: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  INTERVIEW: { label: "Interview", tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  HIRED: { label: "Hired", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  REJECTED: { label: "Rejected", tone: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
  ARCHIVED: { label: "Archived", tone: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500" },
};

/**
 * Detect which built-in SiteTemplate the current tenant is using based on
 * its Category slugs, and return its job positions. Used by /careers to
 * show industry-appropriate openings on each tenant site.
 *
 * Returns the fallback DEFAULT_OPEN_POSITIONS (City Art studio) when no
 * template matches — e.g. for a brand-new site that hasn't applied any
 * template yet, or the platform main site.
 */
export async function getOpenPositionsForCurrentSite(): Promise<
  TemplatePosition[]
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(prisma as any)?.category?.findMany) return DEFAULT_OPEN_POSITIONS;
  try {
    const cats = await prisma.category.findMany({ select: { slug: true } });
    const slugs = new Set(cats.map((c) => c.slug));
    const matched = detectTemplateFromCategorySlugs(slugs);
    if (matched) return matched.openPositions;
  } catch {
    /* fall through */
  }
  return DEFAULT_OPEN_POSITIONS;
}

/** Map of "signature" category slug → template id, used to fingerprint a tenant. */
const TEMPLATE_SIGNATURES: Record<string, string> = {
  // vehicles
  cars: "vehicles",
  motorcycles: "vehicles",
  // pets
  dogs: "pets",
  cats: "pets",
  "small-pets": "pets",
  // furniture
  living: "furniture",
  bedroom: "furniture",
  kitchen: "furniture",
  // party
  birthday: "party",
  wedding: "party",
  "decor-party": "party",
  // engineering
  structural: "engineering",
  electrical: "engineering",
  mechanical: "engineering",
  software: "engineering",
};

function detectTemplateFromCategorySlugs(
  slugs: Set<string>,
): SiteTemplate | null {
  // Count matches per template, pick the one with the most signature hits.
  const counts = new Map<string, number>();
  for (const slug of slugs) {
    const id = TEMPLATE_SIGNATURES[slug];
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let best: { id: string; n: number } | null = null;
  for (const [id, n] of counts.entries()) {
    if (!best || n > best.n) best = { id, n };
  }
  if (!best || best.n === 0) return null;
  return TEMPLATES.find((t) => t.id === best.id) ?? null;
}

/** Fallback positions (City Art studio) for sites with no recognised template.
 *  Also exported as `OPEN_POSITIONS` for legacy imports. */
export const DEFAULT_OPEN_POSITIONS: TemplatePosition[] = [
  {
    id: "art-director",
    title: "Art Director",
    team: "Creative",
    type: "Full-time",
    location: "Bangkok",
    summary:
      "นำทีมออกแบบงานศิลปะและ installation ขนาดใหญ่ ดูแล art direction ตั้งแต่ concept จนถึงหน้างาน",
  },
  {
    id: "3d-designer",
    title: "3D Designer / Visualiser",
    team: "Design",
    type: "Full-time",
    location: "Bangkok",
    summary:
      "สร้าง 3D model + rendering สำหรับ event, exhibition และ corporate art ใช้ Blender / 3ds Max / Cinema 4D",
  },
  {
    id: "production-supervisor",
    title: "Production Supervisor",
    team: "Production",
    type: "Full-time",
    location: "Bangkok / On-site",
    summary:
      "คุมโรงผลิตและงานติดตั้งจริง วางแผนวัสดุ ทีมช่าง และไทม์ไลน์ส่งมอบงาน",
  },
  {
    id: "project-coordinator",
    title: "Project Coordinator",
    team: "Account",
    type: "Full-time",
    location: "Bangkok",
    summary:
      "ประสานงานระหว่างลูกค้า ทีมออกแบบ และทีมผลิต ดูแลตั้งแต่ kickoff จนถึง wrap-up",
  },
  {
    id: "graphic-designer",
    title: "Graphic Designer",
    team: "Creative",
    type: "Full-time / Freelance",
    location: "Bangkok / Remote",
    summary:
      "ออกแบบกราฟิกสำหรับงาน event และ corporate มี taste เรื่อง typography / layout / brand",
  },
  {
    id: "internship",
    title: "Internship — Design / Production",
    team: "Multiple",
    type: "Internship 3-6 mo.",
    location: "Bangkok",
    summary: "เปิดรับ นศ. ที่อยากเรียนรู้กระบวนการสร้างงานศิลปะตั้งแต่ต้นจนจบ",
  },
];

/** Legacy alias — old code can `import { OPEN_POSITIONS } from "@/lib/careers"`. */
export const OPEN_POSITIONS = DEFAULT_OPEN_POSITIONS;
