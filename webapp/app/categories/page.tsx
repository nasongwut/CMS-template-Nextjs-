import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse articles by category.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesIndex() {
  const categories = await listCategories();

  // Count articles per category (best-effort).
  const counts: Record<string, number> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((prisma as any)?.article?.groupBy) {
      const rows = await prisma.article.groupBy({
        by: ["categoryId"],
        where: { isPublished: true },
        _count: true,
      });
      for (const r of rows) {
        if (r.categoryId) counts[r.categoryId] = (r as { _count: number })._count;
      }
    }
  } catch {
    /* falls through to zero counts */
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
          Categories
        </p>
        <h1
          className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05] bg-gradient-to-r bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          Browse by topic
        </h1>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-zinc-500">
          ยังไม่มี category — สร้างได้ที่{" "}
          <code className="font-mono">/admin/categories</code>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/categories/${c.slug}`}
                className="group block rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                <div
                  className="aspect-[16/10] relative overflow-hidden"
                  style={{
                    background: c.coverImage
                      ? undefined
                      : "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                  }}
                >
                  {c.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.coverImage}
                      alt={c.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/90 text-3xl font-semibold">
                      {c.name[0]}
                    </div>
                  )}
                </div>
                <div className="p-5 bg-white/70 dark:bg-zinc-900/40">
                  <h3 className="font-semibold text-lg leading-snug">{c.name}</h3>
                  {c.description && (
                    <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-zinc-500">
                    {counts[c.id] ?? 0} article{(counts[c.id] ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
