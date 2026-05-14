import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isCategoriesReady } from "@/lib/categories";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const ready = isCategoriesReady();
  const categories = ready
    ? await prisma.category.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: { _count: { select: { articles: true } } },
      })
    : [];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-medium">Categories</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Group articles into categories shown on{" "}
            <code className="font-mono">/categories</code>.
          </p>
        </div>
        <Link
          href="/categories"
          target="_blank"
          className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          View public page ↗
        </Link>
      </div>

      {!ready && (
        <div className="mt-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 text-sm">
          <p className="font-medium">Categories table isn&apos;t ready yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run prisma:migrate
            </code>
            , then restart{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run dev
            </code>
            .
          </p>
        </div>
      )}

      {ready && (
        <div className="mt-5 sm:mt-6">
          <CategoriesClient
            initial={categories.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              description: c.description,
              coverImage: c.coverImage,
              order: c.order,
              isPublished: c.isPublished,
              articleCount: c._count.articles,
            }))}
          />
        </div>
      )}
    </section>
  );
}
