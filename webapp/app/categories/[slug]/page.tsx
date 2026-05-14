import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/categories";
import { listArticles } from "@/lib/articles";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategoryBySlug(slug);
  if (!c) return { title: "Not found" };
  return {
    title: c.name,
    description: c.description ?? undefined,
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryDetail({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.isPublished) notFound();

  const articles = await listArticles({ categoryId: category.id });

  return (
    <div>
      {/* HERO */}
      <section className="relative">
        {category.coverImage ? (
          <div className="relative aspect-[3/1] sm:aspect-[4/1] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.coverImage}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 max-w-5xl mx-auto flex flex-col justify-end p-6 sm:p-12 text-white">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] opacity-80">
                Category
              </p>
              <h1 className="mt-2 text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-3 text-base sm:text-lg max-w-2xl opacity-90">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-6 text-center">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
              Category
            </p>
            <h1
              className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05] bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
              }}
            >
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-medium">
            {articles.length} article{articles.length === 1 ? "" : "s"}
          </h2>
          <Link
            href="/categories"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← All categories
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-zinc-500">
            ยังไม่มีบทความใน category นี้
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="group block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                >
                  <div
                    className="aspect-[16/10] relative overflow-hidden"
                    style={{
                      background: a.coverImage
                        ? undefined
                        : "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                    }}
                  >
                    {a.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-base sm:text-lg leading-snug line-clamp-2">
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {a.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
