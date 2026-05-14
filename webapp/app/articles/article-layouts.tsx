/**
 * Renderers for the 10 article presets. Same pattern as
 * app/about/about-layouts.tsx — one dispatcher + one component per preset.
 */
import Link from "next/link";
import { splitArticleParagraphs, type Article } from "@/lib/articles";

export interface ArticleData {
  article: Article;
}

export default function ArticleLayoutDispatcher({ data }: { data: ArticleData }) {
  switch (data.article.layout) {
    case "magazine":
      return <MagazineLayout data={data} />;
    case "minimal":
      return <MinimalLayout data={data} />;
    case "editorial":
      return <EditorialLayout data={data} />;
    case "wide":
      return <WideLayout data={data} />;
    case "sidebar":
      return <SidebarLayout data={data} />;
    case "bold":
      return <BoldLayout data={data} />;
    case "gallery":
      return <GalleryLayout data={data} />;
    case "compact":
      return <CompactLayout data={data} />;
    case "technical":
      return <TechnicalLayout data={data} />;
    case "classic":
    default:
      return <ClassicLayout data={data} />;
  }
}

/* ─── shared bits ─── */

function Paragraphs({
  body,
  className = "",
  firstLetterDropCap = false,
}: {
  body: string;
  className?: string;
  firstLetterDropCap?: boolean;
}) {
  const paragraphs = splitArticleParagraphs(body);
  if (paragraphs.length === 0) return null;
  return (
    <div className={className}>
      {paragraphs.map((lines, i) => (
        <p
          key={i}
          className={
            firstLetterDropCap && i === 0
              ? "first-letter:text-5xl first-letter:float-left first-letter:font-semibold first-letter:mr-2 first-letter:leading-none"
              : undefined
          }
        >
          {lines.map((l, j) => (
            <span key={j}>
              {l}
              {j < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function CategoryPill({ article }: { article: Article }) {
  if (!article.category) return null;
  return (
    <Link
      href={`/categories/${article.category.slug}`}
      className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 transition"
      style={{ color: "var(--site-primary)" }}
    >
      {article.category.name}
    </Link>
  );
}

function MetaLine({ article }: { article: Article }) {
  const date = article.publishedAt ?? article.createdAt;
  return (
    <p className="text-sm text-zinc-500 mt-3 flex flex-wrap items-center gap-2">
      <CategoryPill article={article} />
      <time dateTime={new Date(date).toISOString()}>
        {new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </time>
    </p>
  );
}

function HeroImg({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      loading="eager"
    />
  );
}

function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-gradient-to-r bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
      }}
    >
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   1. CLASSIC — centered title + body, simple cover
   ════════════════════════════════════════════════════════════════════════ */

function ClassicLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <header className="text-center mb-10">
        <CategoryPill article={article} />
        <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05]">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-5 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <MetaLine article={article} />
      </header>

      {article.coverImage && (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-10">
          <HeroImg src={article.coverImage} alt={article.title} />
        </div>
      )}

      <Paragraphs
        body={article.body}
        className="space-y-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg"
      />
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2. MAGAZINE — full-width hero with title overlay
   ════════════════════════════════════════════════════════════════════════ */

function MagazineLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article>
      <header className="relative">
        <div className="relative aspect-[21/9] sm:aspect-[3/1] w-full overflow-hidden">
          {article.coverImage ? (
            <HeroImg src={article.coverImage} alt={article.title} />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 max-w-5xl mx-auto flex flex-col justify-end p-6 sm:p-12 text-white">
            <CategoryPill article={article} />
            <h1 className="mt-3 text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-4 text-base sm:text-lg max-w-2xl opacity-90">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <MetaLine article={article} />
        <Paragraphs
          body={article.body}
          firstLetterDropCap
          className="mt-6 space-y-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg"
        />
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3. MINIMAL — narrow text-only column
   ════════════════════════════════════════════════════════════════════════ */

function MinimalLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article className="max-w-xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 font-light">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">
          {article.category?.name ?? "Article"}
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-medium tracking-tight">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-base text-zinc-500 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <p className="mt-4 text-xs text-zinc-400 font-mono">
          {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString()}
        </p>
      </header>

      {article.coverImage && (
        <HeroImg
          src={article.coverImage}
          alt={article.title}
          className="my-10 aspect-[4/3]"
        />
      )}

      <Paragraphs
        body={article.body}
        className="mt-10 space-y-4 text-zinc-700 dark:text-zinc-300 leading-loose"
      />
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4. EDITORIAL — drop cap, pull quotes
   ════════════════════════════════════════════════════════════════════════ */

function EditorialLayout({ data: { article } }: { data: ArticleData }) {
  const paragraphs = splitArticleParagraphs(article.body);
  // Pull a sentence to highlight as a pull-quote — middle paragraph's first line.
  const pullIndex = paragraphs.length > 3 ? Math.floor(paragraphs.length / 2) : -1;
  const pullQuote = pullIndex >= 0 ? paragraphs[pullIndex][0] : null;

  return (
    <article>
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-8 text-center border-b border-zinc-200 dark:border-zinc-800">
        <CategoryPill article={article} />
        <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight leading-[1.1]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-5 text-lg italic text-zinc-600 dark:text-zinc-400">
            {article.excerpt}
          </p>
        )}
        <MetaLine article={article} />
      </header>

      {article.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
          <HeroImg src={article.coverImage} alt={article.title} className="aspect-[16/9]" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6 text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {paragraphs.map((lines, i) => (
          <div key={i}>
            <p
              className={
                i === 0
                  ? "first-letter:text-6xl first-letter:float-left first-letter:font-semibold first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.85]"
                  : undefined
              }
            >
              {lines.map((l, j) => (
                <span key={j}>
                  {l}
                  {j < lines.length - 1 && <br />}
                </span>
              ))}
            </p>
            {i === pullIndex - 1 && pullQuote && (
              <blockquote
                className="my-10 pl-6 border-l-4 italic text-2xl sm:text-3xl leading-snug"
                style={{ borderColor: "var(--site-primary)" }}
              >
                “{pullQuote}”
              </blockquote>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   5. WIDE — full-width hero, 2-column body
   ════════════════════════════════════════════════════════════════════════ */

function WideLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article>
      {article.coverImage && (
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <HeroImg src={article.coverImage} alt={article.title} />
        </div>
      )}

      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        <CategoryPill article={article} />
        <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05] max-w-4xl">
          <GradientText>{article.title}</GradientText>
        </h1>
        {article.excerpt && (
          <p className="mt-5 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <MetaLine article={article} />
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Paragraphs
          body={article.body}
          className="md:columns-2 md:gap-12 space-y-5 [&>p]:break-inside-avoid text-zinc-700 dark:text-zinc-300 leading-relaxed"
        />
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   6. SIDEBAR — sticky meta, scrolling content
   ════════════════════════════════════════════════════════════════════════ */

function SidebarLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-10 lg:gap-16">
        <aside className="md:sticky md:top-20 md:self-start space-y-4">
          <CategoryPill article={article} />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-sm text-zinc-500 leading-relaxed">{article.excerpt}</p>
          )}
          <div className="text-xs text-zinc-500 font-mono">
            <div>{new Date(article.publishedAt ?? article.createdAt).toLocaleDateString()}</div>
          </div>
        </aside>

        <div>
          {article.coverImage && (
            <HeroImg
              src={article.coverImage}
              alt={article.title}
              className="aspect-[16/9] rounded-2xl mb-8 border border-zinc-200 dark:border-zinc-800"
            />
          )}
          <Paragraphs
            body={article.body}
            className="space-y-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg"
          />
        </div>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   7. BOLD — dark theme, huge type
   ════════════════════════════════════════════════════════════════════════ */

function BoldLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article className="bg-zinc-950 text-white -mt-px">
      <header className="relative min-h-[60vh] sm:min-h-[80vh] flex items-end overflow-hidden">
        {article.coverImage ? (
          <HeroImg src={article.coverImage} alt={article.title} className="absolute inset-0" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
          <CategoryPill article={article} />
          <h1 className="mt-4 text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[0.95] max-w-4xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-6 text-lg sm:text-xl opacity-90 max-w-2xl leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <Paragraphs
          body={article.body}
          className="space-y-5 text-zinc-300 leading-relaxed text-lg"
        />
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   8. GALLERY — image-first
   ════════════════════════════════════════════════════════════════════════ */

function GalleryLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article>
      <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6 text-center">
        <CategoryPill article={article} />
        <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter leading-tight">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {article.excerpt}
          </p>
        )}
        <MetaLine article={article} />
      </header>

      {article.coverImage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HeroImg
            src={article.coverImage}
            alt={article.title}
            className="aspect-[16/9] rounded-2xl border border-zinc-200 dark:border-zinc-800"
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <Paragraphs
          body={article.body}
          className="space-y-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg"
        />
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   9. COMPACT — narrow tight column for short reads
   ════════════════════════════════════════════════════════════════════════ */

function CompactLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header>
        <CategoryPill article={article} />
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight leading-snug">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{article.excerpt}</p>
        )}
        <p className="mt-3 text-xs text-zinc-400 font-mono">
          {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString()}
        </p>
      </header>

      {article.coverImage && (
        <HeroImg
          src={article.coverImage}
          alt={article.title}
          className="my-6 aspect-[4/3] rounded-xl border border-zinc-200 dark:border-zinc-800"
        />
      )}

      <Paragraphs
        body={article.body}
        className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
      />
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   10. TECHNICAL — monospace, structured, documentation feel
   ════════════════════════════════════════════════════════════════════════ */

function TechnicalLayout({ data: { article } }: { data: ArticleData }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs font-mono uppercase tracking-wider text-zinc-500">
          <span>{article.category?.name ?? "Article"}</span>
          <span>{new Date(article.publishedAt ?? article.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-mono font-semibold tracking-tight leading-tight">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-sm font-mono text-zinc-500 leading-relaxed bg-zinc-50 dark:bg-zinc-900 rounded-md px-4 py-3 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-400">// </span>
            {article.excerpt}
          </p>
        )}
      </header>

      {article.coverImage && (
        <HeroImg
          src={article.coverImage}
          alt={article.title}
          className="aspect-[16/9] rounded-md border border-zinc-200 dark:border-zinc-800 mb-8"
        />
      )}

      <Paragraphs
        body={article.body}
        className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base [&>p]:font-sans"
      />
    </article>
  );
}
