/**
 * Renderer for the 10 /about presets. Each layout receives the same data and
 * decides how to display it.
 */
import { splitParagraphs, type AboutPage, type TimelineEvent } from "@/lib/about";

export interface AboutData {
  page: AboutPage;
  timeline: TimelineEvent[]; // already sorted by date ascending
}

export default function AboutLayoutDispatcher({ data }: { data: AboutData }) {
  switch (data.page.layout) {
    case "split":
      return <SplitLayout data={data} />;
    case "minimal":
      return <MinimalLayout data={data} />;
    case "magazine":
      return <MagazineLayout data={data} />;
    case "cards":
      return <CardsLayout data={data} />;
    case "horizontal":
      return <HorizontalLayout data={data} />;
    case "compact":
      return <CompactLayout data={data} />;
    case "sidebar":
      return <SidebarLayout data={data} />;
    case "bold":
      return <BoldLayout data={data} />;
    case "mosaic":
      return <MosaicLayout data={data} />;
    case "classic":
    default:
      return <ClassicLayout data={data} />;
  }
}

/* ─── shared helpers ─── */

function Paragraphs({ body, className = "" }: { body: string; className?: string }) {
  const paragraphs = splitParagraphs(body);
  if (paragraphs.length === 0) return null;
  return (
    <div className={className}>
      {paragraphs.map((lines, i) => (
        <p key={i}>
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

function HeroImage({
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
      {children}
    </p>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   1. CLASSIC — centered hero, vertical timeline with gradient rail
   ════════════════════════════════════════════════════════════════════════ */

function ClassicLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[900px] -z-10 opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--site-primary), transparent 60%), radial-gradient(closest-side at 70% 50%, var(--site-accent), transparent 60%)",
        }}
      />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-8 sm:pb-12 text-center">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05]">
          <GradientText>{page.heading}</GradientText>
        </h1>
        {page.subheading && (
          <p className="mt-5 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {page.subheading}
          </p>
        )}
      </section>

      {page.heroImage && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <HeroImage src={page.heroImage} alt={page.heading} />
          </div>
        </section>
      )}

      <Paragraphs
        body={page.body}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg"
      />

      {timeline.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <Eyebrow>timeline</Eyebrow>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Our journey
            </h2>
          </div>
          <ol className="mt-10 relative">
            <span
              aria-hidden
              className="absolute left-3 sm:left-4 top-2 bottom-2 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, var(--site-primary), var(--site-accent))",
              }}
            />
            {timeline.map((e) => (
              <li key={e.id} className="relative pl-10 sm:pl-14 py-4">
                <span
                  aria-hidden
                  className="absolute left-0 top-5 inline-flex items-center justify-center w-6 sm:w-8 h-6 sm:h-8 rounded-full shadow-md ring-4 ring-zinc-50 dark:ring-zinc-950"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                  }}
                >
                  <span className="block w-1.5 h-1.5 rounded-full bg-white" />
                </span>
                <div>
                  <span
                    className="text-xs sm:text-sm font-mono font-medium uppercase tracking-wider"
                    style={{ color: "var(--site-primary)" }}
                  >
                    {e.date}
                  </span>
                  <h3 className="mt-1 text-base sm:text-lg font-semibold leading-snug">
                    {e.title}
                  </h3>
                  {e.imageUrl && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <HeroImage src={e.imageUrl} alt={e.title} className="max-h-72" />
                    </div>
                  )}
                  {e.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2. SPLIT — 2-column hero, alternating timeline
   ════════════════════════════════════════════════════════════════════════ */

function SplitLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <Eyebrow>About</Eyebrow>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05]">
            <GradientText>{page.heading}</GradientText>
          </h1>
          {page.subheading && (
            <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {page.subheading}
            </p>
          )}
          <Paragraphs
            body={page.body}
            className="mt-6 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed"
          />
        </div>
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 order-first lg:order-last">
          {page.heroImage ? (
            <HeroImage src={page.heroImage} alt={page.heading} />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
              }}
            />
          )}
        </div>
      </section>

      {timeline.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <Eyebrow>timeline</Eyebrow>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Our journey
            </h2>
          </div>
          <ol className="mt-12 relative">
            <span
              aria-hidden
              className="hidden md:block absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(to bottom, var(--site-primary), var(--site-accent))",
              }}
            />
            {timeline.map((e, i) => {
              const left = i % 2 === 0;
              return (
                <li
                  key={e.id}
                  className={`md:grid md:grid-cols-2 md:gap-10 py-6 ${
                    left ? "" : "md:[direction:rtl] md:[&>*]:[direction:ltr]"
                  }`}
                >
                  <div className={left ? "md:text-right md:pr-10" : "md:text-left md:pl-10"}>
                    <span
                      className="text-xs font-mono font-medium uppercase tracking-wider"
                      style={{ color: "var(--site-primary)" }}
                    >
                      {e.date}
                    </span>
                    <h3 className="mt-1 text-lg sm:text-xl font-semibold leading-snug">
                      {e.title}
                    </h3>
                    {e.description && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {e.description}
                      </p>
                    )}
                  </div>
                  {e.imageUrl ? (
                    <div className="mt-3 md:mt-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <HeroImage src={e.imageUrl} alt={e.title} className="aspect-[4/3]" />
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3. MINIMAL — pure text, no decorations
   ════════════════════════════════════════════════════════════════════════ */

function MinimalLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div className="font-light">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">About</p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-medium tracking-tight">
          {page.heading}
        </h1>
        {page.subheading && (
          <p className="mt-4 text-base text-zinc-500 leading-relaxed">
            {page.subheading}
          </p>
        )}
      </section>

      {page.heroImage && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-10">
          <HeroImage src={page.heroImage} alt={page.heading} className="rounded-sm aspect-[16/9]" />
        </section>
      )}

      <Paragraphs
        body={page.body}
        className="max-w-2xl mx-auto px-4 sm:px-6 pb-10 space-y-4 text-zinc-700 dark:text-zinc-300 leading-loose"
      />

      {timeline.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Timeline</p>
          <dl className="mt-8 space-y-6">
            {timeline.map((e) => (
              <div
                key={e.id}
                className="grid grid-cols-[90px_1fr] gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
              >
                <dt className="text-sm font-mono text-zinc-400 pt-1">{e.date}</dt>
                <dd>
                  <h3 className="font-medium">{e.title}</h3>
                  {e.description && (
                    <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4. MAGAZINE — big hero image with overlay text, alternating wide cards
   ════════════════════════════════════════════════════════════════════════ */

function MagazineLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div>
      <section className="relative">
        <div className="relative aspect-[21/9] sm:aspect-[3/1] w-full overflow-hidden">
          {page.heroImage ? (
            <HeroImage src={page.heroImage} alt={page.heading} />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 text-white max-w-5xl mx-auto">
            <p className="text-[11px] font-mono uppercase tracking-[0.3em] opacity-80">
              About
            </p>
            <h1 className="mt-2 text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              {page.heading}
            </h1>
            {page.subheading && (
              <p className="mt-3 text-base sm:text-lg max-w-xl opacity-90">
                {page.subheading}
              </p>
            )}
          </div>
        </div>
      </section>

      <Paragraphs
        body={page.body}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg first:[&>p]:first-letter:text-5xl first:[&>p]:first-letter:float-left first:[&>p]:first-letter:font-semibold first:[&>p]:first-letter:mr-2 first:[&>p]:first-letter:leading-none"
      />

      {timeline.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight border-b-2 border-zinc-900 dark:border-zinc-100 pb-4">
            Timeline
          </h2>
          <ol className="mt-8 space-y-10">
            {timeline.map((e, i) => (
              <li
                key={e.id}
                className={`grid md:grid-cols-[1fr_2fr] gap-6 sm:gap-10 items-start ${
                  i % 2 === 1 ? "md:[direction:rtl] md:[&>*]:[direction:ltr]" : ""
                }`}
              >
                {e.imageUrl ? (
                  <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 aspect-[4/3]">
                    <HeroImage src={e.imageUrl} alt={e.title} />
                  </div>
                ) : (
                  <div
                    className="rounded-xl aspect-[4/3]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                    }}
                  />
                )}
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                    {e.date}
                  </span>
                  <h3 className="mt-1 text-xl sm:text-2xl font-semibold leading-snug">
                    {e.title}
                  </h3>
                  {e.description && (
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   5. CARDS — timeline as a 3-column card grid
   ════════════════════════════════════════════════════════════════════════ */

function CardsLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tighter leading-tight">
          <GradientText>{page.heading}</GradientText>
        </h1>
        {page.subheading && (
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {page.subheading}
          </p>
        )}
      </section>

      {page.heroImage && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
          <HeroImage
            src={page.heroImage}
            alt={page.heading}
            className="rounded-2xl aspect-[16/9] border border-zinc-200 dark:border-zinc-800"
          />
        </section>
      )}

      <Paragraphs
        body={page.body}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed"
      />

      {timeline.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <Eyebrow>timeline</Eyebrow>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Milestones
            </h2>
          </div>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {timeline.map((e) => (
              <li
                key={e.id}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col"
              >
                <div
                  className="aspect-[16/10] relative overflow-hidden"
                  style={{
                    background: e.imageUrl
                      ? undefined
                      : "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                  }}
                >
                  {e.imageUrl ? (
                    <HeroImage src={e.imageUrl} alt={e.title} className="group-hover:scale-[1.02] transition-transform" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/90 font-mono text-2xl">
                      {e.date}
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1">
                  <span
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: "var(--site-primary)" }}
                  >
                    {e.date}
                  </span>
                  <h3 className="mt-1 font-semibold text-base sm:text-lg leading-snug">
                    {e.title}
                  </h3>
                  {e.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4">
                      {e.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   6. HORIZONTAL — horizontal scrollable timeline
   ════════════════════════════════════════════════════════════════════════ */

function HorizontalLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05]">
          <GradientText>{page.heading}</GradientText>
        </h1>
        {page.subheading && (
          <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {page.subheading}
          </p>
        )}
      </section>

      {page.heroImage && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <HeroImage src={page.heroImage} alt={page.heading} className="aspect-[16/9] rounded-2xl border border-zinc-200 dark:border-zinc-800" />
        </section>
      )}

      <Paragraphs
        body={page.body}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed"
      />

      {timeline.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>timeline →</Eyebrow>
              <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
                Scroll the journey
              </h2>
            </div>
          </div>
          <div className="mt-10 relative">
            {/* gradient rail */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-[80px] h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--site-primary) 10%, var(--site-accent) 90%, transparent)",
              }}
            />
            <ol className="flex gap-5 overflow-x-auto px-4 sm:px-8 pb-6 snap-x snap-mandatory">
              {timeline.map((e) => (
                <li
                  key={e.id}
                  className="snap-start shrink-0 w-72 sm:w-80 relative pt-[100px]"
                >
                  <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 top-[72px] w-4 h-4 rounded-full ring-4 ring-zinc-50 dark:ring-zinc-950"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                    }}
                  />
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 sm:p-5">
                    <span
                      className="text-2xl font-mono font-semibold"
                      style={{ color: "var(--site-primary)" }}
                    >
                      {e.date}
                    </span>
                    <h3 className="mt-1 font-semibold leading-snug">{e.title}</h3>
                    {e.imageUrl && (
                      <HeroImage src={e.imageUrl} alt={e.title} className="mt-3 rounded-md aspect-[16/10]" />
                    )}
                    {e.description && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {e.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   7. COMPACT — narrow column, tight spacing
   ════════════════════════════════════════════════════════════════════════ */

function CompactLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="text-center">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
          <GradientText>{page.heading}</GradientText>
        </h1>
        {page.subheading && (
          <p className="mt-3 text-base text-zinc-500">{page.subheading}</p>
        )}
      </header>

      {page.heroImage && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <HeroImage src={page.heroImage} alt={page.heading} className="aspect-[4/3]" />
        </div>
      )}

      <Paragraphs
        body={page.body}
        className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
      />

      {timeline.length > 0 && (
        <section className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <Eyebrow>timeline</Eyebrow>
          <ol className="mt-4 space-y-3">
            {timeline.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-[60px_1fr] gap-3 items-start"
              >
                <span
                  className="text-xs font-mono font-medium uppercase tracking-wider pt-0.5 text-right"
                  style={{ color: "var(--site-primary)" }}
                >
                  {e.date}
                </span>
                <div>
                  <h3 className="text-sm font-semibold leading-snug">{e.title}</h3>
                  {e.description && (
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   8. SIDEBAR — sticky year nav + content
   ════════════════════════════════════════════════════════════════════════ */

function SidebarLayout({ data: { page, timeline } }: { data: AboutData }) {
  const years = timeline.map((e) => ({ id: e.id, date: e.date }));
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-10">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">
          <GradientText>{page.heading}</GradientText>
        </h1>
        {page.subheading && (
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            {page.subheading}
          </p>
        )}
      </header>

      {page.heroImage && (
        <HeroImage
          src={page.heroImage}
          alt={page.heading}
          className="aspect-[21/9] rounded-2xl mb-10 border border-zinc-200 dark:border-zinc-800"
        />
      )}

      <div className="grid md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] gap-8 lg:gap-12">
        <aside className="md:sticky md:top-20 md:self-start">
          <Paragraphs
            body={page.body}
            className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6"
          />
          {years.length > 0 && (
            <nav className="border-l border-zinc-200 dark:border-zinc-800 pl-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                Years
              </p>
              <ul className="space-y-1.5">
                {years.map((y) => (
                  <li key={y.id}>
                    <a
                      href={`#year-${y.id}`}
                      className="block text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      {y.date}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>

        <ol className="space-y-10">
          {timeline.map((e) => (
            <li
              key={e.id}
              id={`year-${e.id}`}
              className="scroll-mt-20 grid sm:grid-cols-[1fr_auto] gap-4"
            >
              <div>
                <span
                  className="text-xs font-mono uppercase tracking-wider"
                  style={{ color: "var(--site-primary)" }}
                >
                  {e.date}
                </span>
                <h3 className="mt-1 text-xl sm:text-2xl font-semibold leading-snug">
                  {e.title}
                </h3>
                {e.description && (
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {e.description}
                  </p>
                )}
              </div>
              {e.imageUrl && (
                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 w-full sm:w-40 aspect-square">
                  <HeroImage src={e.imageUrl} alt={e.title} />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   9. BOLD — full-bleed hero, massive year numbers in timeline
   ════════════════════════════════════════════════════════════════════════ */

function BoldLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div className="bg-zinc-950 text-white -mt-px">
      <section className="relative min-h-[60vh] sm:min-h-[80vh] flex items-end overflow-hidden">
        {page.heroImage ? (
          <HeroImage src={page.heroImage} alt={page.heading} className="absolute inset-0" />
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
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] opacity-70">
            About
          </p>
          <h1 className="mt-3 text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[0.95] max-w-4xl">
            {page.heading}
          </h1>
          {page.subheading && (
            <p className="mt-6 text-lg sm:text-xl opacity-90 max-w-2xl leading-relaxed">
              {page.subheading}
            </p>
          )}
        </div>
      </section>

      <Paragraphs
        body={page.body}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-5 text-zinc-300 leading-relaxed text-lg"
      />

      {timeline.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/10">
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">Timeline.</h2>
          <ol className="mt-12 divide-y divide-white/10">
            {timeline.map((e) => (
              <li
                key={e.id}
                className="grid sm:grid-cols-[200px_1fr] gap-4 sm:gap-8 py-8 sm:py-10"
              >
                <div
                  className="text-5xl sm:text-6xl font-bold tracking-tighter"
                  style={{
                    color: "var(--site-accent)",
                  }}
                >
                  {e.date}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold leading-snug">
                    {e.title}
                  </h3>
                  {e.description && (
                    <p className="mt-2 text-zinc-400 leading-relaxed">{e.description}</p>
                  )}
                  {e.imageUrl && (
                    <HeroImage
                      src={e.imageUrl}
                      alt={e.title}
                      className="mt-4 rounded-lg aspect-[16/9] max-w-xl"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   10. MOSAIC — image-heavy visual-first timeline
   ════════════════════════════════════════════════════════════════════════ */

function MosaicLayout({ data: { page, timeline } }: { data: AboutData }) {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <Eyebrow>About</Eyebrow>
          <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tighter leading-tight">
            <GradientText>{page.heading}</GradientText>
          </h1>
          {page.subheading && (
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              {page.subheading}
            </p>
          )}
          <Paragraphs
            body={page.body}
            className="mt-5 space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
          />
        </div>
        {/* mosaic of hero + 3 timeline images */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 aspect-square">
          {page.heroImage && (
            <HeroImage
              src={page.heroImage}
              alt={page.heading}
              className="col-span-2 row-span-2 rounded-xl"
            />
          )}
          {timeline
            .filter((e) => e.imageUrl)
            .slice(0, page.heroImage ? 5 : 7)
            .map((e) => (
              <div
                key={e.id}
                className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <HeroImage src={e.imageUrl!} alt={e.title} />
              </div>
            ))}
        </div>
      </section>

      {timeline.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <Eyebrow>timeline</Eyebrow>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Visual journey
            </h2>
          </div>
          <ol className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-5 [column-fill:_balance]">
            {timeline.map((e) => (
              <li
                key={e.id}
                className="break-inside-avoid mb-4 sm:mb-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 overflow-hidden"
              >
                {e.imageUrl ? (
                  <HeroImage src={e.imageUrl} alt={e.title} />
                ) : (
                  <div
                    className="aspect-[4/3] flex items-center justify-center text-white/90 font-mono text-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                    }}
                  >
                    {e.date}
                  </div>
                )}
                <div className="p-4">
                  <span
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: "var(--site-primary)" }}
                  >
                    {e.date}
                  </span>
                  <h3 className="mt-1 font-semibold leading-snug">{e.title}</h3>
                  {e.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
