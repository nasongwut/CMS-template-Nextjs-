"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Values {
  siteName: string;
  description: string;
  keywords: string;
  author: string;
}

export default function SettingsClient({ initial }: { initial: Values }) {
  const router = useRouter();
  const [v, setV] = useState<Values>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    v.siteName !== initial.siteName ||
    v.description !== initial.description ||
    v.keywords !== initial.keywords ||
    v.author !== initial.author;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Save failed");
      return;
    }
    setSavedAt(new Date());
    // Refresh server components (the layout reads settings)
    router.refresh();
  }

  function onReset() {
    setV(initial);
    setError(null);
  }

  const keywordsList = v.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <form onSubmit={onSave} className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-5">
        <Field
          label="Site name"
          hint="Shown in the navbar, the document <title>, and Open Graph metadata."
          required
          maxLen={120}
          value={v.siteName}
          onChange={(s) => setV((p) => ({ ...p, siteName: s }))}
        />
        <Textarea
          label="Description"
          hint="Used as the meta description for SEO and Open Graph. Keep under ~160 chars."
          maxLen={500}
          rows={3}
          value={v.description}
          onChange={(s) => setV((p) => ({ ...p, description: s }))}
        />
        <Field
          label="Keywords"
          hint="Comma-separated. Older SEO signal — modern crawlers mostly ignore this, but it's still emitted as <meta name='keywords'>."
          maxLen={500}
          value={v.keywords}
          placeholder="nextjs, prisma, storage, membership"
          onChange={(s) => setV((p) => ({ ...p, keywords: s }))}
        />
        <Field
          label="Author"
          hint="Name emitted as the <meta name='author'> tag."
          maxLen={120}
          value={v.author}
          onChange={(s) => setV((p) => ({ ...p, author: s }))}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-50 text-sm"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          {dirty && (
            <button
              type="button"
              onClick={onReset}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Reset
            </button>
          )}
          {savedAt && !dirty && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              ✓ Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Live preview */}
      <aside className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Preview
        </p>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/40 text-sm">
          <p className="font-medium truncate">
            {v.siteName || <em className="text-zinc-400">No site name</em>}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-3">
            {v.description || (
              <em className="text-zinc-400">No description</em>
            )}
          </p>
          {v.author && (
            <p className="text-zinc-500 text-xs mt-2">by {v.author}</p>
          )}
          {keywordsList.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {keywordsList.map((k) => (
                <span
                  key={k}
                  className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-zinc-500">
          Reflects what appears in <code className="font-mono">{"<title>"}</code>,
          <code className="font-mono">{"<meta description>"}</code> and OG tags.
        </p>
      </aside>
    </form>
  );
}

/* ─── fields ─── */

function Field({
  label,
  hint,
  value,
  onChange,
  required,
  maxLen,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  maxLen?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        {maxLen && (
          <span className="text-xs text-zinc-500">
            {value.length}/{maxLen}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      <input
        type="text"
        value={value}
        required={required}
        maxLength={maxLen}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
      />
    </label>
  );
}

function Textarea({
  label,
  hint,
  value,
  onChange,
  maxLen,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  maxLen?: number;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        {maxLen && (
          <span className="text-xs text-zinc-500">
            {value.length}/{maxLen}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      <textarea
        value={value}
        rows={rows}
        maxLength={maxLen}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm leading-6"
      />
    </label>
  );
}
