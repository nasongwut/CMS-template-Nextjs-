"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SiteDomainRow {
  id: string;
  hostname: string;
  isPrimary: boolean;
}

interface Site {
  id: string;
  name: string;
  slug: string;
  primaryDomain: string | null;
  databaseUrl: string;
  directDbUrl: string;
  notes: string | null;
  isActive: boolean;
  templateSiteId: string | null;
  createdAt: string;
  domains: SiteDomainRow[];
}

interface TemplateRef {
  id: string;
  name: string;
  slug: string;
}

const CLONE_SCOPES = [
  { id: "theme", label: "Theme (colours + style)" },
  { id: "settings", label: "Site settings" },
  { id: "about", label: "About page + timeline" },
  { id: "nav", label: "Navigation tree" },
  { id: "categories", label: "Categories" },
  { id: "articles", label: "Articles" },
] as const;

export default function SiteDetailClient({
  site,
  templates,
}: {
  site: Site;
  templates: TemplateRef[];
}) {
  const router = useRouter();
  const [v, setV] = useState({
    name: site.name,
    primaryDomain: site.primaryDomain ?? "",
    databaseUrl: site.databaseUrl,
    directDbUrl: site.directDbUrl,
    notes: site.notes ?? "",
    isActive: site.isActive,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Migration state — runs `prisma migrate deploy` against this site's DB
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<
    | null
    | {
        success: boolean;
        stdout: string;
        stderr: string;
        exitCode: number;
        durationMs: number;
        fatal?: string;
      }
  >(null);

  // Apply built-in template state
  interface BuiltInTemplate {
    id: string;
    name: string;
    blurb: string;
    glyph: string;
    themeId: string;
    counts: { categories: number; articles: number; timeline: number; navItems: number };
  }
  const [builtIns, setBuiltIns] = useState<BuiltInTemplate[]>([]);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
  const [templateResult, setTemplateResult] = useState<
    | null
    | {
        template: string;
        categories: number;
        articles: number;
        timeline: number;
        navItems: number;
        durationMs: number;
        errors: { step: string; message: string }[];
      }
  >(null);

  useEffect(() => {
    fetch("/api/super-admin/templates")
      .then((r) => (r.ok ? r.json() : { templates: [] }))
      .then((j) => setBuiltIns(j.templates ?? []))
      .catch(() => undefined);
  }, []);

  // Clone form state
  const [cloneMode, setCloneMode] = useState<"registered" | "url">(
    templates.length > 0 ? "registered" : "url",
  );
  const [cloneSourceId, setCloneSourceId] = useState("");
  const [cloneSourceUrl, setCloneSourceUrl] = useState("");
  const [cloneScopes, setCloneScopes] = useState<string[]>(
    CLONE_SCOPES.map((s) => s.id),
  );
  const [cloning, setCloning] = useState(false);
  const [cloneResult, setCloneResult] = useState<
    null | {
      scopes: Record<string, number>;
      durationMs: number;
      errors: { scope: string; message: string }[];
    }
  >(null);

  function toggleScope(id: string) {
    setCloneScopes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const r = await fetch(`/api/super-admin/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setSaving(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.detail ? `${j.error}: ${j.detail}` : j.error ?? "save_failed");
      return;
    }
    setSavedAt(new Date());
    router.refresh();
  }

  async function onRunMigrations() {
    if (
      !confirm(
        "รัน `prisma migrate deploy` กับ DB ของ site นี้? — สร้าง schema (ตาราง) ทั้งหมด ปลอดภัยกับ DB ว่าง แต่ถ้า DB มีข้อมูลผิด schema อยู่อาจ fail",
      )
    ) {
      return;
    }
    setError(null);
    setMigrateResult(null);
    setMigrating(true);
    const r = await fetch(`/api/super-admin/sites/${site.id}/migrate`, {
      method: "POST",
    });
    setMigrating(false);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(j.detail ?? j.error ?? "migrate_failed");
      return;
    }
    setMigrateResult(j);
    router.refresh();
  }

  async function callApplyOnce(templateId: string) {
    const r = await fetch(
      `/api/super-admin/sites/${site.id}/apply-template`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, wipeTarget: true }),
      },
    );
    return { ok: r.ok, json: await r.json().catch(() => ({})) };
  }

  /** "does not exist" appears in P2021 / P2022 schema errors. */
  function looksLikeSchemaMissing(result: {
    errors?: { step: string; message: string }[];
    categories?: number;
    articles?: number;
  }): boolean {
    if (!result.errors || result.errors.length === 0) return false;
    if ((result.categories ?? 0) > 0 || (result.articles ?? 0) > 0) return false;
    // Every error mentions a missing table — almost certainly un-migrated DB.
    return result.errors.every((e) => /does not exist/i.test(e.message));
  }

  async function onApplyTemplate(templateId: string) {
    if (
      !confirm(
        `Apply template "${templateId}" — จะ wipe Article/Category/NavItem/Timeline บน DB ของ site นี้แล้ว seed ใหม่ ทำต่อ?`,
      )
    ) {
      return;
    }
    setError(null);
    setTemplateResult(null);
    setApplyingTemplate(templateId);

    try {
      // First attempt
      let { ok, json } = await callApplyOnce(templateId);
      if (!ok) {
        setError(json.detail ?? json.error ?? "apply_template_failed");
        return;
      }

      // Schema missing? Auto-trigger migrations then retry once.
      if (looksLikeSchemaMissing(json)) {
        setApplyingTemplate(`${templateId}__migrating`);
        const mr = await fetch(
          `/api/super-admin/sites/${site.id}/migrate`,
          { method: "POST" },
        );
        const mj = await mr.json().catch(() => ({}));
        if (!mr.ok || !mj.success) {
          setError(
            "Schema ยังไม่ถูก migrate และ auto-migrate ล้มเหลว — " +
              (mj.fatal ?? mj.stderr ?? mj.detail ?? mj.error ?? "unknown"),
          );
          setTemplateResult(json); // surface the first attempt's errors
          return;
        }
        // Migrate ok — retry the apply once more.
        setApplyingTemplate(`${templateId}__retry`);
        const second = await callApplyOnce(templateId);
        if (!second.ok) {
          setError(second.json.detail ?? second.json.error ?? "retry_failed");
          return;
        }
        json = second.json;
      }

      setTemplateResult(json);
      router.refresh();
    } finally {
      setApplyingTemplate(null);
    }
  }

  async function onDelete(opts: { wipeContent: boolean }) {
    const msg = opts.wipeContent
      ? `ลบ site "${site.name}" + WIPE content บน tenant DB ของ site นี้ (Article / Category / NavItem / Timeline / About / Settings / Theme)?\n\n` +
        `Tenant DB เองจะไม่โดนลบ — แค่ทำ delete-many กับตาราง content`
      : `ลบ site "${site.name}"?\n\nMetadata + Domain rows ถูกลบ — แต่ tenant DB ของ site นี้ไม่โดนแตะ ข้อมูลใน DB จะอยู่เหมือนเดิม`;
    if (!confirm(msg)) return;

    setError(null);
    const url = `/api/super-admin/sites/${site.id}${opts.wipeContent ? "?wipeContent=1" : ""}`;
    const r = await fetch(url, { method: "DELETE" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(j.detail ?? j.error ?? "delete_failed");
      return;
    }
    if (opts.wipeContent && j.wipeError) {
      // Delete succeeded but wipe partially failed — show as warning, still redirect.
      alert(`Site ลบสำเร็จ แต่ wipe content บน tenant DB มีปัญหา: ${j.wipeError}`);
    }
    router.push("/super-admin");
  }

  async function onClone(e: React.FormEvent) {
    e.preventDefault();
    if (cloneMode === "registered" && !cloneSourceId) {
      setError("เลือก source site ก่อน");
      return;
    }
    if (cloneMode === "url" && !cloneSourceUrl.trim()) {
      setError("วาง DATABASE_URL ของ source ก่อน");
      return;
    }
    setError(null);
    setCloneResult(null);
    setCloning(true);
    const r = await fetch(`/api/super-admin/sites/${site.id}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        cloneMode === "registered"
          ? { sourceSiteId: cloneSourceId, scopes: cloneScopes, wipeTarget: true }
          : { sourceDbUrl: cloneSourceUrl.trim(), scopes: cloneScopes, wipeTarget: true },
      ),
    });
    setCloning(false);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const friendly = friendlyCloneError(j.error, j.detail);
      setError(friendly);
      return;
    }
    setCloneResult(j);
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-8">
      <header>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {site.name}
          </h1>
          <span
            className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
              site.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {site.isActive ? "active" : "paused"}
          </span>
        </div>
        <p className="text-xs font-mono text-zinc-500 mt-1">
          /{site.slug} · created{" "}
          {new Date(site.createdAt).toLocaleDateString()}
          {site.templateSiteId && ` · cloned from ${site.templateSiteId.slice(0, 6)}…`}
        </p>
      </header>

      {/* ── Settings form ── */}
      <form
        onSubmit={onSave}
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-5 space-y-4"
      >
        <h2 className="font-medium">Site details</h2>

        <Field
          label="Name"
          value={v.name}
          onChange={(s) => setV({ ...v, name: s })}
          required
        />
        <Field
          label="Primary domain"
          value={v.primaryDomain}
          onChange={(s) => setV({ ...v, primaryDomain: s })}
        />
        <Textarea
          label="DATABASE_URL"
          value={v.databaseUrl}
          onChange={(s) => setV({ ...v, databaseUrl: s })}
          rows={2}
          mono
        />
        <Textarea
          label="DIRECT_URL"
          value={v.directDbUrl}
          onChange={(s) => setV({ ...v, directDbUrl: s })}
          rows={2}
          mono
        />
        <Textarea
          label="Notes"
          value={v.notes}
          onChange={(s) => setV({ ...v, notes: s })}
          rows={3}
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={v.isActive}
            onChange={(e) => setV({ ...v, isActive: e.target.checked })}
          />
          <span>Active</span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-md text-white text-sm font-medium shadow-sm disabled:opacity-50"
            style={{
              background:
                "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {savedAt && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 self-center">
              ✓ Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => onDelete({ wipeContent: false })}
            className="ml-auto text-sm text-red-600 hover:underline"
          >
            Delete site
          </button>
          <button
            type="button"
            onClick={() => onDelete({ wipeContent: true })}
            className="text-sm text-red-700 hover:underline font-medium"
          >
            Delete + wipe DB content
          </button>
        </div>
      </form>

      {/* ── Run migrations on tenant DB ── */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-5 space-y-3">
        <div>
          <h2 className="font-medium">Schema — run migrations</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Bootstraps this site&apos;s DB by running{" "}
            <code className="font-mono">prisma migrate deploy</code> against
            its DATABASE_URL. Run this <strong>once</strong> on a freshly
            provisioned Neon / Supabase branch before applying a template.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRunMigrations}
            disabled={migrating || !v.databaseUrl}
            className="px-4 py-2 rounded-md text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 disabled:opacity-50"
          >
            {migrating ? "Running migrations…" : "Run migrations on this DB"}
          </button>
          {!v.databaseUrl && (
            <span className="text-xs text-zinc-500">
              (กรอก DATABASE_URL ใน Site details ด้านบนก่อน)
            </span>
          )}
        </div>

        {migrateResult && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              migrateResult.success
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800"
            }`}
          >
            <p
              className={`font-medium ${
                migrateResult.success
                  ? "text-emerald-900 dark:text-emerald-100"
                  : "text-red-900 dark:text-red-100"
              }`}
            >
              {migrateResult.success
                ? `✓ Migrations applied in ${migrateResult.durationMs}ms`
                : `✗ Migrations failed (exit code ${migrateResult.exitCode})`}
            </p>
            {migrateResult.fatal && (
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                {migrateResult.fatal}
              </p>
            )}
            {(migrateResult.stdout || migrateResult.stderr) && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-zinc-500">
                  Show CLI output
                </summary>
                <pre className="mt-2 text-[10px] font-mono whitespace-pre-wrap bg-zinc-100 dark:bg-zinc-900 p-2 rounded max-h-64 overflow-auto">
                  {migrateResult.stdout}
                  {migrateResult.stderr && `\n\n[stderr]\n${migrateResult.stderr}`}
                </pre>
              </details>
            )}
          </div>
        )}
      </section>

      {/* ── Apply built-in template ── */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-5 space-y-4">
        <div>
          <h2 className="font-medium">Apply a built-in template</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Bootstraps this site&apos;s DB with a vertical-specific bundle
            (theme + colours + categories + articles + about + nav).{" "}
            <strong>Wipes existing content</strong> in Article / Category /
            NavItem / Timeline tables of this site.
          </p>
        </div>

        {builtIns.length === 0 ? (
          <p className="text-sm text-zinc-500">Loading templates…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {builtIns.map((t) => {
              const myState = applyingTemplate?.startsWith(t.id)
                ? applyingTemplate.includes("__migrating")
                  ? "migrating"
                  : applyingTemplate.includes("__retry")
                    ? "retrying"
                    : "applying"
                : null;
              const busy = !!myState;
              return (
                <div
                  key={t.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg"
                          style={{
                            color: "var(--site-primary)",
                          }}
                        >
                          {t.glyph}
                        </span>
                        <h3 className="font-semibold truncate">{t.name}</h3>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                        {t.blurb}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded shrink-0">
                      {t.themeId}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono">
                    <span>cats</span><span className="text-right">{t.counts.categories}</span>
                    <span>articles</span><span className="text-right">{t.counts.articles}</span>
                    <span>timeline</span><span className="text-right">{t.counts.timeline}</span>
                    <span>nav</span><span className="text-right">{t.counts.navItems}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onApplyTemplate(t.id)}
                    disabled={!!applyingTemplate}
                    className="mt-auto text-sm font-medium px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 disabled:opacity-50"
                  >
                    {myState === "migrating"
                      ? "Migrating schema…"
                      : myState === "retrying"
                        ? "Retrying apply…"
                        : myState === "applying"
                          ? "Applying…"
                          : "Apply"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {templateResult && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 p-3 text-sm">
            <p className="font-medium text-emerald-900 dark:text-emerald-100">
              ✓ Applied &quot;{templateResult.template}&quot; in{" "}
              {templateResult.durationMs}ms
            </p>
            <ul className="mt-2 text-xs text-emerald-800 dark:text-emerald-200 space-y-0.5">
              <li>
                categories: <span className="font-mono">{templateResult.categories}</span>
              </li>
              <li>
                articles: <span className="font-mono">{templateResult.articles}</span>
              </li>
              <li>
                timeline: <span className="font-mono">{templateResult.timeline}</span>
              </li>
              <li>
                navItems: <span className="font-mono">{templateResult.navItems}</span>
              </li>
            </ul>
            {templateResult.errors.length > 0 && (
              <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                <p className="font-medium">Errors:</p>
                <ul className="space-y-0.5">
                  {templateResult.errors.map((e, i) => (
                    <li key={i}>
                      {e.step}: {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Clone content ── */}
      <form
        onSubmit={onClone}
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-5 space-y-4"
      >
        <div>
          <h2 className="font-medium">Clone content from another site</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Wipes the selected scopes on this site&apos;s DB and copies them from the
            source. <strong>Schema must already be migrated on both DBs.</strong>
          </p>
        </div>

        {/* Mode toggle — registered site vs ad-hoc DB URL */}
        <div className="inline-flex rounded-full border border-zinc-200 dark:border-zinc-800 p-1 bg-white dark:bg-zinc-900 text-sm">
          <button
            type="button"
            onClick={() => setCloneMode("registered")}
            disabled={templates.length === 0}
            className={`px-3 py-1 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed ${
              cloneMode === "registered"
                ? "text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
            style={
              cloneMode === "registered"
                ? {
                    backgroundImage:
                      "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                  }
                : undefined
            }
          >
            From registered site
            {templates.length === 0 && " (none yet)"}
          </button>
          <button
            type="button"
            onClick={() => setCloneMode("url")}
            className={`px-3 py-1 rounded-full transition ${
              cloneMode === "url"
                ? "text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
            style={
              cloneMode === "url"
                ? {
                    backgroundImage:
                      "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                  }
                : undefined
            }
          >
            From DATABASE_URL
          </button>
        </div>

        {cloneMode === "registered" ? (
          templates.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">
              ไม่มี registered site อื่นที่มี DATABASE_URL — สลับไปใช้ &quot;From
              DATABASE_URL&quot; แทน หรือสร้าง site อื่นเพิ่มก่อน
            </p>
          ) : (
            <label className="block">
              <span className="text-sm font-medium">Source site</span>
              <select
                value={cloneSourceId}
                onChange={(e) => setCloneSourceId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              >
                <option value="">— select source —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
            </label>
          )
        ) : (
          <label className="block">
            <span className="text-sm font-medium">Source DATABASE_URL</span>
            <p className="text-xs text-zinc-500 mt-0.5">
              วาง connection string ของ DB ต้นแบบ — เช่น DB ของเว็บที่
              running อยู่ตอนนี้ (อ่านได้จาก{" "}
              <code className="font-mono">.env.development</code>)
            </p>
            <textarea
              value={cloneSourceUrl}
              onChange={(e) => setCloneSourceUrl(e.target.value)}
              rows={2}
              placeholder="postgresql://user:pass@host/db?sslmode=require"
              className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono"
            />
          </label>
        )}

        <fieldset className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
          <legend className="text-sm font-medium mb-1.5">Scopes to copy</legend>
          {CLONE_SCOPES.map((s) => (
            <label key={s.id} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={cloneScopes.includes(s.id)}
                onChange={() => toggleScope(s.id)}
              />
              <span>{s.label}</span>
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled={
            cloning ||
            cloneScopes.length === 0 ||
            (cloneMode === "registered" ? !cloneSourceId : !cloneSourceUrl.trim())
          }
          className="px-5 py-2 rounded-md text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 disabled:opacity-50"
        >
          {cloning ? "Cloning…" : "Run clone"}
        </button>

        {cloneResult && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 p-3 text-sm">
            <p className="font-medium text-emerald-900 dark:text-emerald-100">
              ✓ Clone finished in {cloneResult.durationMs}ms
            </p>
            <ul className="mt-2 text-xs text-emerald-800 dark:text-emerald-200 space-y-0.5">
              {Object.entries(cloneResult.scopes).map(([k, n]) => (
                <li key={k}>
                  {k}: <span className="font-mono">{n}</span> rows
                </li>
              ))}
            </ul>
            {cloneResult.errors.length > 0 && (
              <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                <p className="font-medium">Errors:</p>
                <ul className="space-y-0.5">
                  {cloneResult.errors.map((e, i) => (
                    <li key={i}>
                      {e.scope}: {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </form>

      {/* ── Domains ── */}
      <DomainsSection siteId={site.id} initial={site.domains} />
    </div>
  );
}

/* ─── Domains CRUD ─── */

function DomainsSection({
  siteId,
  initial,
}: {
  siteId: string;
  initial: SiteDomainRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [newHost, setNewHost] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch(`/api/super-admin/sites/${siteId}`);
    if (!r.ok) return;
    const j = await r.json();
    setItems(
      (j.site?.domains ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => ({ id: d.id, hostname: d.hostname, isPrimary: d.isPrimary }),
      ),
    );
  }

  async function addDomain(makePrimary: boolean) {
    setErr(null);
    const host = newHost.trim().toLowerCase();
    if (!host) return;
    setBusy(true);
    const r = await fetch(`/api/super-admin/sites/${siteId}/domains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname: host, isPrimary: makePrimary }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.detail ?? j.error ?? "add failed");
      return;
    }
    setNewHost("");
    await refresh();
    router.refresh();
  }

  async function setPrimary(id: string) {
    setErr(null);
    const r = await fetch(`/api/super-admin/sites/${siteId}/domains/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.detail ?? j.error ?? "update failed");
      return;
    }
    await refresh();
    router.refresh();
  }

  async function removeDomain(id: string, hostname: string) {
    if (!confirm(`ลบ domain "${hostname}"?`)) return;
    setErr(null);
    const r = await fetch(`/api/super-admin/sites/${siteId}/domains/${id}`, {
      method: "DELETE",
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.detail ?? j.error ?? "delete failed");
      return;
    }
    await refresh();
    router.refresh();
  }

  // Suggest `.localhost` if hostname looks like a bare word in dev.
  const suggestion =
    newHost && !newHost.includes(".") && !newHost.includes(":")
      ? `${newHost}.localhost`
      : null;

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-5 space-y-4">
      <div>
        <h2 className="font-medium">Domains</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Hostnames ที่จะ route มาที่ site นี้ — ใน dev ต้องลงท้ายด้วย{" "}
          <code className="font-mono">.localhost</code> (เช่น{" "}
          <code className="font-mono">cityart.localhost</code>) เพราะ browser
          resolve เฉพาะ subdomain ของ <code className="font-mono">localhost</code>
        </p>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-sm text-amber-600">
          ⚠ ยังไม่มี domain — site นี้จะไม่มี URL ให้เปิดได้ จนกว่าจะเพิ่ม
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((d) => {
            const isReachable = d.hostname.includes(".") || d.hostname === "localhost";
            const httpUrl =
              typeof window !== "undefined"
                ? `${window.location.protocol}//${d.hostname}${
                    window.location.port ? `:${window.location.port}` : ""
                  }`
                : null;
            return (
              <li
                key={d.id}
                className="flex flex-wrap items-center gap-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2"
              >
                <span className="font-mono break-all">{d.hostname}</span>
                {!isReachable && (
                  <span
                    title="Browser ไม่สามารถ resolve hostname นี้ได้ — ต้องมี dot อย่างน้อย 1 ตัว (เช่น .localhost)"
                    className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.5 rounded"
                  >
                    ⚠ unreachable
                  </span>
                )}
                {d.isPrimary && (
                  <span className="text-[10px] uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 px-1.5 py-0.5 rounded">
                    primary
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2 text-xs">
                  {isReachable && httpUrl && (
                    <a
                      href={httpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      open ↗
                    </a>
                  )}
                  {!d.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(d.id)}
                      className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      make primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDomain(d.id, d.hostname)}
                    className="text-red-600 hover:underline"
                  >
                    remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add new */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <label className="block text-sm font-medium mb-1.5">Add domain</label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newHost}
            onChange={(e) => setNewHost(e.target.value)}
            placeholder="cityart.localhost  หรือ  www.cityart.co.th"
            className="flex-1 min-w-[200px] rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => addDomain(items.length === 0)}
            disabled={busy || !newHost.trim()}
            className="px-3 py-2 rounded-md text-white text-sm font-medium shadow-sm disabled:opacity-50"
            style={{
              background:
                "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
            }}
          >
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
        {suggestion && (
          <button
            type="button"
            onClick={() => setNewHost(suggestion)}
            className="mt-2 text-xs text-violet-600 dark:text-violet-400 hover:underline"
          >
            ↳ ใช้ <code className="font-mono">{suggestion}</code> แทนไหม? (ใน dev
            ต้องมี .localhost)
          </button>
        )}
        {err && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
            {err}
          </p>
        )}
      </div>
    </section>
  );
}

/** Translate API error codes into a Thai-friendly message with next-step hint. */
function friendlyCloneError(code: unknown, detail?: unknown): string {
  const c = typeof code === "string" ? code : "clone_failed";
  const d = typeof detail === "string" ? detail : "";
  switch (c) {
    case "source_equals_target_url":
    case "source_equals_target":
      return (
        "Source DB URL ตรงกับ Target DB URL — clone ใน DB เดียวกันไม่ได้ " +
        "(จะ wipe แล้วเขียนทับข้อมูลเดิม) " +
        "→ ให้สร้าง Neon DB ใหม่สำหรับ site นี้ก่อน แล้วเปลี่ยน DATABASE_URL ใน site detail ด้านบน"
      );
    case "target_no_db":
      return "Target site ยังไม่ได้กรอก DATABASE_URL — กรอกใน section Site details ก่อน";
    case "source_no_db":
      return "Source site ไม่มี DATABASE_URL — กรอกใน site นั้นก่อน";
    case "source_required":
      return "เลือก source site หรือวาง DATABASE_URL ก่อน";
    case "source_not_found":
      return "ไม่พบ source site ตามที่เลือก (อาจถูกลบไปแล้ว)";
    case "target_not_found":
      return "ไม่พบ target site นี้";
    case "unauthorized":
      return "หมดเซสชัน — กรุณา sign in ใหม่ที่ /super-admin/login";
    default:
      return d ? `${c}: ${d}` : c;
  }
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm ${
          mono ? "font-mono text-xs" : ""
        }`}
      />
    </label>
  );
}
