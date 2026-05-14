/**
 * Careers helpers — graceful fallbacks when the migration hasn't been run
 * (mirrors lib/about.ts pattern).
 */
import { prisma } from "./prisma";

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

/** Positions advertised on /careers — kept in code so admins can curate via PR. */
export const OPEN_POSITIONS: { id: string; title: string; team: string; type: string; location: string; summary: string }[] = [
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
