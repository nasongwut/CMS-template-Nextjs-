import type { Metadata } from "next";
import Link from "next/link";
import { listArticles } from "@/lib/articles";
import { listCategories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Articles",
  description: "Browse all published articles.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ArticlesIndex({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const [articles, categories] = await Promise.all([
    listArticles({ categorySlug: category }),
    listCategories(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
          Articles
        </p>
        <h1
          className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05] bg-gradient-to-r bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          Stories & writeups
        </h1>
      </header>

      {categories.length > 0 && (
        <nav className="flex flex-wrap justify-center gap-2 mb-10">
          <Link
            href="/articles"
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
              !category
                ? "border-transparent text-white shadow-sm"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
            style={
              !category
                ? {
                    background:
                      "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                  }
                : undefined
            }
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/articles?category=${c.slug}`}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
                category === c.slug
                  ? "border-transparent text-white shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
              style={
                category === c.slug
                  ? {
                      background:
                        "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                    }
                  : undefined
              }
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-zinc-500">
          ยังไม่มีบทความ — เพิ่มได้ที่{" "}
          <code className="font-mono">/admin/articles</code>
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
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/90 text-3xl font-semibold">
                      {a.title
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase())
                        .join("")}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {a.category && (
                    <span
                      className="text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: "var(--site-primary)" }}
                    >
                      {a.category.name}
                    </span>
                  )}
                  <h3 className="mt-1 font-semibold text-base sm:text-lg leading-snug line-clamp-2">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {a.excerpt}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-zinc-500">
                    {new Date(a.publishedAt ?? a.createdAt).toLocaleDateString()}
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
