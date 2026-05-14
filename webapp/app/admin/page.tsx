import {
  aggregateDailySeries,
  aggregateOverview,
  isAnalyticsReady,
  labelSource,
  recentReferrers,
  topCountries,
  topPages,
  topReferrerHosts,
  topSources,
} from "@/lib/analytics";
import { countryFlag, countryName } from "@/lib/countries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Auth/role redirects handled by app/admin/layout.tsx
  const ready = isAnalyticsReady();
  const [overview, series, sources, pages, recent, countries, referrerHosts] =
    await Promise.all([
      aggregateOverview(),
      aggregateDailySeries(30),
      topSources(8, 30),
      topPages(8, 30),
      recentReferrers(12),
      topCountries(8, 30),
      topReferrerHosts(10, 30),
    ]);

  const maxViews = Math.max(1, ...series.map((s) => s.views));
  const totalSources = sources.reduce((a, b) => a + b.count, 0);
  const totalCountries = countries.reduce((a, b) => a + b.count, 0);
  const totalHosts = referrerHosts.reduce((a, b) => a + b.count, 0);

  return (
    <section className="space-y-6 sm:space-y-8">
      <header>
        <h2 className="text-lg sm:text-xl font-medium">Dashboard</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Site activity over the last 30 days. Page views are recorded by the
          tracker that ships with every layout.
        </p>
      </header>

      {!ready && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 sm:p-5">
          <p className="font-medium">Analytics tables aren&rsquo;t ready yet.</p>
          <p className="text-sm mt-1 text-amber-800 dark:text-amber-300">
            Run a migration to create the <code className="font-mono">PageView</code>{" "}
            and <code className="font-mono">ThemeSettings</code> tables, then restart{" "}
            <code className="font-mono">npm run dev</code>:
          </p>
          <pre className="mt-3 rounded-md bg-amber-950/90 text-amber-100 px-3 py-2 text-xs font-mono overflow-x-auto">
            npm run prisma:migrate
          </pre>
          <p className="text-xs mt-2 text-amber-800 dark:text-amber-300">
            (If the migration ran but the client wasn&rsquo;t regenerated, run{" "}
            <code className="font-mono">npm run prisma:generate</code> instead.)
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Views today" value={overview.viewsToday} sub={`${overview.uniquesToday} unique`} accent="primary" />
        <StatCard label="Last 7 days" value={overview.viewsWeek} sub={`${overview.uniquesWeek} unique`} accent="accent" />
        <StatCard label="Last 30 days" value={overview.viewsMonth} sub={`${overview.uniquesMonth} unique`} accent="emerald" />
        <StatCard label="All time" value={overview.viewsAll} sub="total views" accent="amber" />
      </div>

      {/* Daily chart */}
      <Panel title="Daily traffic" subtitle="Last 30 days · views per day">
        <div className="flex items-end gap-1 sm:gap-1.5 h-40 sm:h-48 mt-2">
          {series.map((s) => {
            const h = (s.views / maxViews) * 100;
            const u = (s.uniques / maxViews) * 100;
            return (
              <div key={s.day} className="flex-1 min-w-0 flex flex-col items-stretch justify-end group relative" title={`${s.day} · ${s.views} views · ${s.uniques} unique`}>
                <div
                  className="rounded-t transition-opacity opacity-30 group-hover:opacity-50"
                  style={{
                    height: `${Math.max(2, u)}%`,
                    background: "var(--site-accent)",
                  }}
                />
                <div
                  className="rounded-t -mt-px"
                  style={{
                    height: `${Math.max(2, h - u)}%`,
                    background: "var(--site-primary)",
                  }}
                />
                {/* tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                  {s.day} · {s.views} views · {s.uniques} uniq
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
          <Legend color="var(--site-primary)" label="Views" />
          <Legend color="var(--site-accent)" label="Unique visitors" />
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top sources */}
        <Panel title="Top traffic sources" subtitle="Where visitors come from">
          {sources.length === 0 ? (
            <Empty>No traffic recorded yet.</Empty>
          ) : (
            <div className="space-y-2.5">
              {sources.map((s) => {
                const lab = labelSource(s.source);
                const pct = totalSources > 0 ? (s.count / totalSources) * 100 : 0;
                return (
                  <div key={s.source} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 min-w-0">
                        <SourceIcon kind={lab.kind} />
                        <span className="truncate">{lab.label}</span>
                      </span>
                      <span className="tabular-nums text-zinc-500 ml-3">
                        {s.count}{" "}
                        <span className="text-[10px]">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Top pages */}
        <Panel title="Top pages" subtitle="Most-visited paths">
          {pages.length === 0 ? (
            <Empty>No page views yet.</Empty>
          ) : (
            <ol className="space-y-2">
              {pages.map((p, i) => (
                <li key={p.path} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-right text-xs tabular-nums text-zinc-500">
                    {i + 1}
                  </span>
                  <code className="font-mono truncate flex-1 min-w-0">{p.path}</code>
                  <span className="tabular-nums text-zinc-500">{p.count}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top countries */}
        <Panel
          title="Visitors by country"
          subtitle="From edge headers (Cloudflare / Vercel)"
        >
          {countries.length === 0 ? (
            <Empty>
              No country data yet. The tracker reads it from{" "}
              <code className="font-mono">CF-IPCountry</code> /{" "}
              <code className="font-mono">x-vercel-ip-country</code> — visible
              once the site is behind Cloudflare or deployed to Vercel.
            </Empty>
          ) : (
            <div className="space-y-2.5">
              {countries.map((c) => {
                const pct =
                  totalCountries > 0 ? (c.count / totalCountries) * 100 : 0;
                return (
                  <div key={c.country} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-lg leading-none">
                          {countryFlag(c.country)}
                        </span>
                        <span className="truncate">
                          {countryName(c.country)}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                          {c.country}
                        </span>
                      </span>
                      <span className="tabular-nums text-zinc-500 ml-3">
                        {c.count}{" "}
                        <span className="text-[10px]">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Top referring websites (hostnames) */}
        <Panel
          title="Top referring websites"
          subtitle="Hostnames that link to us"
        >
          {referrerHosts.length === 0 ? (
            <Empty>No referrers logged yet.</Empty>
          ) : (
            <ol className="space-y-2">
              {referrerHosts.map((r, i) => {
                const pct = totalHosts > 0 ? (r.count / totalHosts) * 100 : 0;
                return (
                  <li
                    key={r.host}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-5 text-right text-xs tabular-nums text-zinc-500">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0 truncate">
                      <a
                        href={`https://${r.host}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {r.host}
                      </a>
                    </span>
                    <span className="tabular-nums text-zinc-500">
                      {r.count}{" "}
                      <span className="text-[10px]">({pct.toFixed(0)}%)</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>

      {/* Recent referrers */}
      <Panel title="Recent referrers" subtitle="Latest off-site visits">
        {recent.length === 0 ? (
          <Empty>No referrers recorded yet.</Empty>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-3 sm:px-4 py-2">Source</th>
                  <th className="px-3 sm:px-4 py-2">Country</th>
                  <th className="px-3 sm:px-4 py-2">Referrer</th>
                  <th className="px-3 sm:px-4 py-2">Landed on</th>
                  <th className="px-3 sm:px-4 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const lab = labelSource(r.source ?? "unknown");
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <SourceIcon kind={lab.kind} />
                          {lab.label}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                        {r.country ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-base leading-none">
                              {countryFlag(r.country)}
                            </span>
                            <span className="text-xs">
                              {countryName(r.country)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2 max-w-[260px] truncate text-zinc-600 dark:text-zinc-400">
                        {r.referrer}
                      </td>
                      <td className="px-3 sm:px-4 py-2 font-mono text-xs">{r.path}</td>
                      <td className="px-3 sm:px-4 py-2 text-zinc-500 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </section>
  );
}

/* ─── helpers ─── */

const accentBg = {
  primary: "from-violet-500/15 to-violet-500/0 text-violet-700 dark:text-violet-300",
  accent: "from-pink-500/15 to-pink-500/0 text-pink-700 dark:text-pink-300",
  emerald: "from-emerald-500/15 to-emerald-500/0 text-emerald-700 dark:text-emerald-300",
  amber: "from-amber-500/15 to-amber-500/0 text-amber-700 dark:text-amber-300",
} as const;

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent: keyof typeof accentBg;
}) {
  return (
    <div
      className={`rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${accentBg[accent]} bg-white/70 dark:bg-zinc-900/70`}
    >
      <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-2xl sm:text-3xl font-semibold tabular-nums">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-zinc-500 mt-0.5 truncate">{sub}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        {subtitle && (
          <p className="text-xs text-zinc-500 truncate ml-3">{subtitle}</p>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 text-center text-sm text-zinc-500">{children}</div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-sm inline-block"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function SourceIcon({
  kind,
}: {
  kind: ReturnType<typeof labelSource>["kind"];
}) {
  const map = {
    direct: ["bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", "→"],
    search: ["bg-blue-500/15 text-blue-600 dark:text-blue-400", "⌕"],
    social: ["bg-pink-500/15 text-pink-600 dark:text-pink-400", "♥"],
    referral: ["bg-amber-500/15 text-amber-600 dark:text-amber-400", "↗"],
    campaign: ["bg-violet-500/15 text-violet-600 dark:text-violet-400", "★"],
    unknown: ["bg-zinc-200 dark:bg-zinc-800 text-zinc-500", "?"],
  } as const;
  const [cls, char] = map[kind];
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-medium ${cls}`}
      aria-hidden
    >
      {char}
    </span>
  );
}
