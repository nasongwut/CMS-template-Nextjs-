import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ALLOWED_STATUSES, isCareersReady } from "@/lib/careers";
import CareersAdminClient from "./careers-admin-client";

export const dynamic = "force-dynamic";

/** Shape of the rows returned to the client component (post-mapping). */
interface RawApplication {
  id: string;
  position: string;
  fullName: string;
  email: string;
  phone: string | null;
  experience: string | null;
  expectedSalary: string | null;
  availableFrom: string | null;
  portfolioUrl: string | null;
  message: string | null;
  photoUrl: string | null;
  cvUrl: string | null;
  cvName: string | null;
  status: string;
  createdAt: Date;
  _count: { files: number };
}

export default async function AdminCareersPage() {
  const ready = isCareersReady();
  const [applications, grouped] = await Promise.all([
    ready
      ? (prisma.jobApplication.findMany({
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { files: true } } },
        }) as unknown as Promise<RawApplication[]>)
      : Promise.resolve([] as RawApplication[]),
    ready
      ? (prisma.jobApplication.groupBy({ by: ["status"], _count: true }) as unknown as Promise<
          { status: string; _count: number }[]
        >)
      : Promise.resolve([] as { status: string; _count: number }[]),
  ]);

  const counts: Record<string, number> = Object.fromEntries(
    ALLOWED_STATUSES.map((s) => [s, 0]),
  );
  for (const g of grouped) {
    counts[g.status as string] = (g as { _count: number })._count;
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-medium">Careers</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Applications submitted via the public{" "}
            <code className="font-mono">/careers</code> page.
          </p>
        </div>
        <Link
          href="/careers"
          target="_blank"
          className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          View public page ↗
        </Link>
      </div>

      {!ready && (
        <div className="mt-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 text-sm">
          <p className="font-medium">Careers tables aren&apos;t ready yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run prisma:migrate
            </code>{" "}
            to create them, then restart{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run dev
            </code>
            .
          </p>
        </div>
      )}

      {ready && (
        <div className="mt-5 sm:mt-6">
          <CareersAdminClient
            initialApplications={applications.map((a) => ({
              id: a.id,
              position: a.position,
              fullName: a.fullName,
              email: a.email,
              phone: a.phone,
              experience: a.experience,
              expectedSalary: a.expectedSalary,
              availableFrom: a.availableFrom,
              portfolioUrl: a.portfolioUrl,
              message: a.message,
              photoUrl: a.photoUrl,
              cvUrl: a.cvUrl,
              cvName: a.cvName,
              status: a.status,
              createdAt: a.createdAt.toISOString(),
              fileCount: a._count.files,
            }))}
            initialCounts={counts}
          />
        </div>
      )}
    </section>
  );
}
