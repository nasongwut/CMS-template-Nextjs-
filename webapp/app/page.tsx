import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export default async function Home() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  return (
    <div className="relative overflow-hidden">
      {/* ─────────────────────── HERO ─────────────────────── */}
      <section className="relative isolate">
        {/* Decorative gradient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[1100px] -z-10 opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(139,92,246,0.4), transparent 65%), radial-gradient(closest-side at 30% 60%, rgba(16,185,129,0.35), transparent 60%), radial-gradient(closest-side at 70% 30%, rgba(244,114,182,0.35), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.6),transparent)] dark:[background:radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.05),transparent)]"
        />

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur px-4 py-1.5 text-xs font-medium shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">
              New · Folder management &amp; per-user storage live
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-5xl sm:text-7xl font-semibold tracking-tighter leading-[0.95]">
            <span className="block">Launch your</span>
            <span className="block mt-2 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
              {settings.siteName}
            </span>
            <span className="block mt-2">in minutes, not months.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {settings.description}
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                href="/files"
                className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-7 py-3.5 font-medium text-base shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Open my files
                <ArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-7 py-3.5 font-medium text-base shadow-lg shadow-violet-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Get started — it's free
                  <ArrowRight />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur px-7 py-3.5 font-medium text-base hover:bg-white dark:hover:bg-zinc-900"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Trust mini-bar */}
          <p className="mt-6 text-xs text-zinc-500">
            No credit card · Production-ready · Open source
          </p>

          {/* Hero "screenshot" card */}
          <div className="relative mt-16 mx-auto max-w-4xl">
            <div className="absolute inset-x-12 -bottom-6 h-24 bg-gradient-to-b from-violet-500/20 to-transparent blur-2xl rounded-full" />
            <MockupCard siteName={settings.siteName} />
          </div>
        </div>
      </section>

      {/* ─────────────────────── STATS BAR ─────────────────────── */}
      <section className="border-y border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <Stat number="5min" label="From clone to running app" />
          <Stat number="100%" label="TypeScript, end-to-end" />
          <Stat number="3" label="Roles wired in by default" />
          <Stat number="∞" label="Storage backends supported" />
        </div>
      </section>

      {/* ─────────────────────── TRUSTED-BY / TECH STRIP ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-14 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-6">
          Built on the tools you already love
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-zinc-500">
          {["Next.js 16", "React 19", "Prisma", "PostgreSQL", "Tailwind v4", "TypeScript", "JWT"].map(
            (t) => (
              <span
                key={t}
                className="font-mono text-base sm:text-lg text-zinc-700 dark:text-zinc-300 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition"
              >
                {t}
              </span>
            ),
          )}
        </div>
      </section>

      {/* ─────────────────────── FEATURES (alternating) ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-24">
        <FeatureRow
          eyebrow="Membership built-in"
          title="Auth, sessions, and roles — already done."
          desc="Sign-up, sign-in, JWT cookie sessions, bcrypt password hashing, and an Edge-runtime middleware that protects routes. Three roles wired in: ADMIN, USER, GUEST."
          bullets={[
            "Email + password authentication out of the box",
            "Role-based protection on routes and APIs",
            "Admin console for managing members",
          ]}
          accent="violet"
          visual={<VisualAuth />}
        />
        <FeatureRow
          reverse
          eyebrow="Pluggable storage"
          title="Local today, S3 tomorrow — flip a switch."
          desc="One STORAGE_DRIVER env var picks the backend. Filesystem in development, S3 / R2 / MinIO in production. The same driver interface, the same DB model — your code never changes."
          bullets={[
            "Per-user namespacing built in",
            "Streaming downloads through an auth-checked endpoint",
            "Folders, sortable columns, and configurable upload limits",
          ]}
          accent="emerald"
          visual={<VisualStorage />}
        />
        <FeatureRow
          eyebrow="Branding without redeploys"
          title="Edit site name, SEO &amp; metadata from /admin."
          desc="No more env wrangling for marketing tweaks. Update the site name, meta description, keywords, and author from a polished admin form. Changes go live the moment you hit Save."
          bullets={[
            "Singleton settings persisted in the database",
            "Live preview while typing",
            "Auto-generates <title>, <meta>, and Open Graph tags",
          ]}
          accent="amber"
          visual={<VisualSettings siteName={settings.siteName} />}
        />
      </section>

      {/* ─────────────────────── HOW IT WORKS ─────────────────────── */}
      <section className="border-y border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <SectionHeader
            eyebrow="how it works"
            title="From zero to launch in three steps."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <HowStep
              n={1}
              title="Clone &amp; install"
              desc="One command installs root + webapp dependencies and generates the Prisma client."
              code="npm install"
            />
            <HowStep
              n={2}
              title="Configure &amp; migrate"
              desc="Set DATABASE_URL plus a strong AUTH_SECRET, then create tables and seed your admin."
              code={`npm run prisma:migrate
npm run db:seed`}
            />
            <HowStep
              n={3}
              title="Ship"
              desc="Run dev, build for production, deploy anywhere. Same scripts for every environment."
              code="npm run dev"
              highlight
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────── TESTIMONIAL ─────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <svg
          aria-hidden
          viewBox="0 0 32 32"
          className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700"
          fill="currentColor"
        >
          <path d="M9.4 7.6C6 9.6 4 13 4 17v8h8v-8H8c0-2.4 1.4-5 4.4-6.8L9.4 7.6zm14 0c-3.4 2-5.4 5.4-5.4 9.4v8h8v-8h-4c0-2.4 1.4-5 4.4-6.8l-3-2.6z" />
        </svg>
        <blockquote className="mt-6 text-2xl sm:text-3xl font-medium tracking-tight leading-snug text-zinc-900 dark:text-zinc-100">
          “Took me 8 minutes to go from <code className="font-mono text-violet-600 dark:text-violet-400">git clone</code>
          {" "}to a live admin user uploading files. Auth, roles, storage — all sorted.”
        </blockquote>
        <p className="mt-6 text-sm text-zinc-500">
          — a hypothetical happy founder, somewhere in the multiverse
        </p>
      </section>

      {/* ─────────────────────── PRICING TEASER ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <SectionHeader
          eyebrow="pricing"
          title="Open source. Free forever."
          align="center"
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <PriceCard
            name="Starter"
            price="Free"
            sub="for everyone"
            features={[
              "Self-hosted membership",
              "Local file storage",
              "Up to 25 MB uploads",
              "Community support",
            ]}
            cta={user ? "Already in" : "Get started"}
            href={user ? "/files" : "/register"}
          />
          <PriceCard
            name="Pro"
            price="Free"
            sub="…seriously"
            features={[
              "Everything in Starter",
              "S3 / R2 storage driver",
              "Role-based admin console",
              "Live site settings editor",
            ]}
            cta="Read the docs"
            href="/docs"
            featured
          />
          <PriceCard
            name="Custom"
            price="Yours"
            sub="fork &amp; remix"
            features={[
              "Open source, MIT-friendly",
              "Add your own storage driver",
              "Bring your own auth provider",
              "No vendor lock-in",
            ]}
            cta="View source"
            href="/docs/architecture"
          />
        </div>
      </section>

      {/* ─────────────────────── FAQ ─────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <SectionHeader eyebrow="faq" title="Questions, answered." align="center" />
        <div className="mt-10 divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
          <Faq q="Do I need an external auth provider?">
            No. JWT cookie sessions are baked in, with bcrypt password hashing and Edge-runtime route protection. Add OAuth later if you want — the design doesn't get in your way.
          </Faq>
          <Faq q="Can I use SQLite?">
            Not by default — the schema uses an <code className="font-mono">enum</code> for roles, which SQLite can't store. Postgres is the easy path; MySQL works with a one-line provider change.
          </Faq>
          <Faq q="What about big file uploads to S3?">
            The S3 driver ships as a stub with a worked example you fill in. Install <code className="font-mono">@aws-sdk/client-s3</code>, paste the snippet from the docs, and switch <code className="font-mono">STORAGE_DRIVER=s3</code>.
          </Faq>
          <Faq q="Is the admin console safe?">
            Admins can't demote, disable, or delete themselves, and every admin endpoint is double-protected (Edge middleware + server-side <code className="font-mono">requireRole</code>).
          </Faq>
          <Faq q="Where does my uploaded data live?">
            With the local driver, in <code className="font-mono">&lt;project-root&gt;/storage/</code> — outside the webapp folder. With S3, in the bucket you configure. Either way, downloads always stream through an auth-checked endpoint.
          </Faq>
        </div>
      </section>

      {/* ─────────────────────── FINAL CTA ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-white p-10 sm:p-16 text-center">
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(closest-side at 20% 30%, rgba(139,92,246,0.4), transparent 60%), radial-gradient(closest-side at 80% 70%, rgba(236,72,153,0.35), transparent 60%), radial-gradient(closest-side at 50% 50%, rgba(16,185,129,0.25), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Stop wiring auth. Start shipping.
            </h2>
            <p className="mt-4 text-zinc-300 max-w-xl mx-auto">
              Spend your hours on the parts of your product nobody else can build.
              Let {settings.siteName} handle the rest.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!user && (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 px-7 py-3.5 font-medium shadow-lg shadow-black/40 hover:scale-[1.02] transition"
                >
                  Create your account <ArrowRight />
                </Link>
              )}
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 text-white px-7 py-3.5 font-medium hover:bg-white/10 transition"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────── pieces ─────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="mt-2 text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  );
}

const accentMap = {
  violet: "from-violet-500 to-fuchsia-500 text-violet-600 dark:text-violet-400",
  emerald: "from-emerald-500 to-teal-500 text-emerald-600 dark:text-emerald-400",
  amber: "from-amber-500 to-orange-500 text-amber-600 dark:text-amber-400",
} as const;

function FeatureRow({
  eyebrow,
  title,
  desc,
  bullets,
  visual,
  reverse = false,
  accent,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  visual: React.ReactNode;
  reverse?: boolean;
  accent: keyof typeof accentMap;
}) {
  return (
    <div
      className={`grid lg:grid-cols-2 items-center gap-10 ${
        reverse ? "lg:[&>:first-child]:order-2" : ""
      }`}
    >
      <div>
        <p
          className={`text-xs font-mono uppercase tracking-[0.2em] ${accentMap[accent].split(" ").slice(-2).join(" ")}`}
        >
          {eyebrow}
        </p>
        <h3
          className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {desc}
        </p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
              <span
                className={`mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-gradient-to-br ${accentMap[accent].split(" ").slice(0, 2).join(" ")} text-white text-xs`}
              >
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>{visual}</div>
    </div>
  );
}

function HowStep({
  n,
  title,
  desc,
  code,
  highlight = false,
}: {
  n: number;
  title: string;
  desc: string;
  code: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 ${
        highlight
          ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div
        className={`absolute -top-3 left-6 h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
          highlight
            ? "bg-white text-violet-700"
            : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
        }`}
      >
        {n}
      </div>
      <h4
        className="mt-2 text-lg font-medium"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p
        className={`mt-2 text-sm ${
          highlight ? "text-white/80" : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {desc}
      </p>
      <pre
        className={`mt-5 rounded-lg px-3 py-2 text-xs font-mono leading-6 overflow-x-auto ${
          highlight ? "bg-black/30 text-white" : "bg-zinc-950 text-zinc-100"
        }`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function PriceCard({
  name,
  price,
  sub,
  features,
  cta,
  href,
  featured = false,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 ${
        featured
          ? "border-2 border-violet-500 bg-white dark:bg-zinc-900 shadow-xl shadow-violet-500/10"
          : "border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-2.5 py-0.5 rounded-full">
          most popular
        </span>
      )}
      <h3 className="text-lg font-medium">{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">{price}</span>
        <span className="text-sm text-zinc-500">/{sub}</span>
      </div>
      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium ${
          featured
            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
            : "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group px-6 py-4">
      <summary className="flex cursor-pointer items-center justify-between list-none">
        <span className="font-medium">{q}</span>
        <span className="text-zinc-400 transition-transform group-open:rotate-45 text-2xl leading-none">
          +
        </span>
      </summary>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
        {children}
      </p>
    </details>
  );
}

/* ─── visuals ─── */

function MockupCard({ siteName }: { siteName: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-900/10 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="ml-3 flex-1 text-center text-xs font-mono text-zinc-500 truncate">
          {siteName.toLowerCase().replace(/\s+/g, "-")}.app / files
        </div>
      </div>
      <div className="grid sm:grid-cols-[180px_1fr] text-left">
        <aside className="border-r border-zinc-200 dark:border-zinc-800 p-3 space-y-1 text-xs">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
            Folders
          </p>
          {["All files", "Reports", "Designs", "Invoices"].map((f, i) => (
            <div
              key={f}
              className={`px-2 py-1.5 rounded ${
                i === 1
                  ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {f}
            </div>
          ))}
        </aside>
        <div className="p-3 text-xs">
          <div className="grid grid-cols-[1fr_60px_60px_30px] gap-2 text-[10px] uppercase tracking-wider text-zinc-500 px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-800">
            <span>Name ↓</span>
            <span className="text-right">Size</span>
            <span>Driver</span>
            <span />
          </div>
          {[
            ["Q4-report.pdf", "1.4 MB", "local"],
            ["mockups-v3.png", "892 KB", "s3"],
            ["proposal.docx", "245 KB", "local"],
            ["invoice-1042.pdf", "98 KB", "local"],
          ].map(([n, s, d]) => (
            <div
              key={n}
              className="grid grid-cols-[1fr_60px_60px_30px] gap-2 px-2 py-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 items-center"
            >
              <span className="truncate">{n}</span>
              <span className="text-right text-zinc-500">{s}</span>
              <span>
                <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5">
                  {d}
                </span>
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">⋯</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualAuth() {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 p-8 shadow-lg">
      <div className="rounded-xl bg-white dark:bg-zinc-900 shadow-md p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">alice@example.com</div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded">
                ADMIN
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                ● active
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-1.5 text-xs">
          {[
            ["bob@example.com", "USER"],
            ["carol@example.com", "USER"],
            ["dan@example.com", "GUEST"],
          ].map(([e, r]) => (
            <div key={e} className="flex items-center justify-between">
              <span className="text-zinc-700 dark:text-zinc-300">{e}</span>
              <span
                className={`text-[9px] uppercase tracking-wider rounded px-1.5 py-0.5 ${
                  r === "USER"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {r}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualStorage() {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-8 shadow-lg">
      <div className="grid grid-cols-2 gap-3">
        <DriverCard name="local" active />
        <DriverCard name="s3" />
        <DriverCard name="r2" coming />
        <DriverCard name="azure" coming />
      </div>
      <div className="mt-4 rounded-lg bg-zinc-950 text-zinc-100 px-3 py-2 text-xs font-mono">
        <span className="text-zinc-500"># .env</span>
        <br />
        <span className="text-emerald-400">STORAGE_DRIVER</span>
        <span className="text-zinc-300">=</span>
        <span className="text-amber-300">local</span>
      </div>
    </div>
  );
}

function DriverCard({
  name,
  active = false,
  coming = false,
}: {
  name: string;
  active?: boolean;
  coming?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center ${
        active
          ? "bg-emerald-500 text-white shadow-md"
          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
      }`}
    >
      <div className="text-xs font-mono uppercase">{name}</div>
      <div className="text-[9px] mt-1 opacity-70">
        {active ? "✓ active" : coming ? "soon" : "available"}
      </div>
    </div>
  );
}

function VisualSettings({ siteName }: { siteName: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-8 shadow-lg">
      <div className="rounded-xl bg-white dark:bg-zinc-900 shadow-md p-5 space-y-3 text-sm">
        <div>
          <label className="text-xs text-zinc-500">Site name</label>
          <div className="mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 font-medium">
            {siteName}
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500">Description</label>
          <div className="mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-600 dark:text-zinc-400">
            A starter for membership-based apps with auth &amp; storage.
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500">Keywords</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {["nextjs", "prisma", "membership", "storage"].map((k) => (
              <span
                key={k}
                className="text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded px-1.5 py-0.5"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <button className="mt-2 w-full rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 text-sm font-medium">
          Save settings ✓
        </button>
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
