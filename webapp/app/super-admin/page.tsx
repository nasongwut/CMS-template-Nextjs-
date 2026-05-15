import Link from "next/link";
import { redirect } from "next/navigation";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { getPlatformAdmin, isPlatformReady } from "@/lib/platform";

export const dynamic = "force-dynamic";

export default async function SuperAdminHome() {
  if (!isPlatformReady()) {
    return null; // layout shows the migrate-needed banner
  }
  const admin = await getPlatformAdmin();
  if (!admin) redirect("/super-admin/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sites = await (prisma as any).site.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { domains: true } } },
  });

  return (
    <section>
      <div className="flex items-end justify-between gap-3 flex-wrap mb-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Platform
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
            Sites
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            All websites managed by this control plane.
          </p>
        </div>
        <Link
          href="/super-admin/sites/new"
          className="px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          + New site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-zinc-500">
          ยังไม่มี site — กด <strong>New site</strong> เพื่อเริ่ม
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (s: any) => {
              const hasDb = !!s.databaseUrl;
              return (
                <li key={s.id}>
                  <Link
                    href={`/super-admin/sites/${s.id}`}
                    className="block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{s.name}</h3>
                        <p className="text-xs font-mono text-zinc-500 mt-0.5 truncate">
                          /{s.slug}
                          {s.primaryDomain && ` · ${s.primaryDomain}`}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                          s.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {s.isActive ? "active" : "paused"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                      <span
                        className={
                          hasDb ? "text-emerald-600" : "text-amber-600"
                        }
                      >
                        {hasDb ? "✓ DB connected" : "⚠ no DB URL"}
                      </span>
                      <span>·</span>
                      <span>{s._count.domains} domains</span>
                    </div>
                  </Link>
                </li>
              );
            },
          )}
        </ul>
      )}
    </section>
  );
}
