import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isArticlesReady } from "@/lib/articles";
import ArticlesClient from "./articles-client";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const ready = isArticlesReady();
  const [articles, categories] = await Promise.all([
    ready
      ? prisma.article.findMany({
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          include: { category: { select: { id: true, slug: true, name: true } } },
        })
      : Promise.resolve([]),
    ready ? prisma.category.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-medium">Articles</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Long-form posts rendered at{" "}
            <code className="font-mono">/articles/[slug]</code> with a chosen layout.
          </p>
        </div>
        <Link
          href="/articles"
          target="_blank"
          className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          View public page ↗
        </Link>
      </div>

      {!ready && (
        <div className="mt-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 text-sm">
          <p className="font-medium">Articles table isn&apos;t ready yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run prisma:migrate
            </code>{" "}
            then restart{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run dev
            </code>
            .
          </p>
        </div>
      )}

      {ready && (
        <div className="mt-5 sm:mt-6">
          <ArticlesClient
            initialArticles={articles.map((a) => ({
              id: a.id,
              slug: a.slug,
              title: a.title,
              excerpt: a.excerpt,
              body: a.body,
              coverImage: a.coverImage,
              layout: a.layout,
              categoryId: a.categoryId,
              categoryName: a.category?.name ?? null,
              isPublished: a.isPublished,
              order: a.order,
              createdAt: a.createdAt.toISOString(),
            }))}
            categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          />
        </div>
      )}
    </section>
  );
}
