"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "light" | "dark";

interface ThemeValues {
  lightPrimary: string;
  lightAccent: string;
  lightBackground: string;
  lightForeground: string;
  darkPrimary: string;
  darkAccent: string;
  darkBackground: string;
  darkForeground: string;
}

const swatchPresets: { name: string; primary: string; accent: string }[] = [
  { name: "Violet · Fuchsia", primary: "#7c3aed", accent: "#ec4899" },
  { name: "Indigo · Cyan", primary: "#4f46e5", accent: "#06b6d4" },
  { name: "Emerald · Lime", primary: "#10b981", accent: "#84cc16" },
  { name: "Rose · Amber", primary: "#e11d48", accent: "#f59e0b" },
  { name: "Sky · Teal", primary: "#0ea5e9", accent: "#14b8a6" },
  { name: "Slate · Orange", primary: "#475569", accent: "#f97316" },
];

export default function ThemeClient({
  initial,
  defaults,
}: {
  initial: ThemeValues;
  defaults: Omit<ThemeValues, never>;
}) {
  const router = useRouter();
  const [v, setV] = useState<ThemeValues>(initial);
  const [mode, setMode] = useState<Mode>("light");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = (Object.keys(initial) as (keyof ThemeValues)[]).some(
    (k) => initial[k].toLowerCase() !== v[k].toLowerCase(),
  );

  function set<K extends keyof ThemeValues>(k: K, val: string) {
    setV((p) => ({ ...p, [k]: val }));
  }

  function applyPreset(p: { primary: string; accent: string }) {
    if (mode === "light") {
      set("lightPrimary", p.primary);
      set("lightAccent", p.accent);
    } else {
      // For dark mode, lighten preset by mixing toward white. Simple shift here.
      set("darkPrimary", lighten(p.primary, 0.25));
      set("darkAccent", lighten(p.accent, 0.25));
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/theme", {
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
    router.refresh();
  }

  async function onResetDefaults() {
    if (!confirm("Restore the default palette?")) return;
    setSaving(true);
    const res = await fetch("/api/admin/theme", { method: "POST" });
    setSaving(false);
    if (res.ok) {
      const { theme } = await res.json();
      setV({ ...theme });
      setSavedAt(new Date());
      router.refresh();
    }
  }

  const activePalette =
    mode === "light"
      ? {
          primary: v.lightPrimary,
          accent: v.lightAccent,
          bg: v.lightBackground,
          fg: v.lightForeground,
        }
      : {
          primary: v.darkPrimary,
          accent: v.darkAccent,
          bg: v.darkBackground,
          fg: v.darkForeground,
        };

  return (
    <form onSubmit={onSave} className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-5 min-w-0">
        {/* Mode tabs */}
        <div className="inline-flex rounded-full border border-zinc-200 dark:border-zinc-800 p-1 bg-white dark:bg-zinc-900">
          {(["light", "dark"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-sm rounded-full transition ${
                mode === m
                  ? "text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              style={
                mode === m
                  ? {
                      background:
                        "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                    }
                  : undefined
              }
            >
              {m === "light" ? "☀ Light mode" : "☾ Dark mode"}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Presets
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {swatchPresets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="group rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-left hover:border-zinc-400 dark:hover:border-zinc-600 transition"
              >
                <div className="flex gap-1.5 mb-2">
                  <span
                    className="h-6 w-6 rounded-full shadow-inner"
                    style={{ background: p.primary }}
                  />
                  <span
                    className="h-6 w-6 rounded-full shadow-inner"
                    style={{ background: p.accent }}
                  />
                </div>
                <div className="text-xs font-medium truncate">{p.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color inputs */}
        <div className="space-y-3">
          {mode === "light" ? (
            <>
              <ColorField
                label="Primary"
                desc="Headlines, primary buttons, focused borders."
                value={v.lightPrimary}
                onChange={(s) => set("lightPrimary", s)}
              />
              <ColorField
                label="Accent"
                desc="Gradient endpoint, hover highlights."
                value={v.lightAccent}
                onChange={(s) => set("lightAccent", s)}
              />
              <ColorField
                label="Background"
                desc="Used by the theme variable --site-bg."
                value={v.lightBackground}
                onChange={(s) => set("lightBackground", s)}
              />
              <ColorField
                label="Foreground"
                desc="Default text colour against --site-bg."
                value={v.lightForeground}
                onChange={(s) => set("lightForeground", s)}
              />
            </>
          ) : (
            <>
              <ColorField
                label="Primary"
                value={v.darkPrimary}
                onChange={(s) => set("darkPrimary", s)}
              />
              <ColorField
                label="Accent"
                value={v.darkAccent}
                onChange={(s) => set("darkAccent", s)}
              />
              <ColorField
                label="Background"
                value={v.darkBackground}
                onChange={(s) => set("darkBackground", s)}
              />
              <ColorField
                label="Foreground"
                value={v.darkForeground}
                onChange={(s) => set("darkForeground", s)}
              />
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="px-5 py-2 rounded-md text-white text-sm font-medium disabled:opacity-50 shadow-sm"
            style={{
              background:
                "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
            }}
          >
            {saving ? "Saving…" : "Save theme"}
          </button>
          {dirty && (
            <button
              type="button"
              onClick={() => setV(initial)}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Reset changes
            </button>
          )}
          <button
            type="button"
            onClick={onResetDefaults}
            className="ml-auto text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
          >
            Restore defaults
          </button>
          {savedAt && !dirty && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 basis-full">
              ✓ Saved {savedAt.toLocaleTimeString()} · reload tabs to fully apply
            </span>
          )}
        </div>
      </div>

      {/* Live preview */}
      <aside className="space-y-3">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Live preview · {mode}
        </p>
        <div
          className="rounded-2xl p-5 shadow-md border"
          style={{
            background: activePalette.bg,
            color: activePalette.fg,
            borderColor: activePalette.fg + "22",
          }}
        >
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: activePalette.fg }}>preview.app</span>
            <span style={{ opacity: 0.5 }}>{mode}</span>
          </div>
          <h3
            className="mt-4 text-2xl font-semibold leading-tight"
            style={{
              backgroundImage: `linear-gradient(90deg, ${activePalette.primary}, ${activePalette.accent})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Beautiful by default
          </h3>
          <p className="mt-2 text-sm" style={{ opacity: 0.7 }}>
            This block updates instantly as you edit the colours on the left.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-md text-white text-xs font-medium"
              style={{
                background: `linear-gradient(90deg, ${activePalette.primary}, ${activePalette.accent})`,
              }}
            >
              Primary action
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-md text-xs font-medium border"
              style={{
                borderColor: activePalette.primary,
                color: activePalette.primary,
                background: "transparent",
              }}
            >
              Secondary
            </button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 0.6, 0.3, 0.1].map((o, i) => (
              <div
                key={i}
                className="h-8 rounded-md"
                style={{
                  background: activePalette.primary,
                  opacity: o,
                }}
              />
            ))}
          </div>
          <div className="mt-4 text-xs">
            <div className="flex justify-between" style={{ opacity: 0.6 }}>
              <span>primary</span>
              <span className="font-mono">{activePalette.primary}</span>
            </div>
            <div className="flex justify-between" style={{ opacity: 0.6 }}>
              <span>accent</span>
              <span className="font-mono">{activePalette.accent}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Tip — your saved colours are exposed as CSS variables:{" "}
          <code className="font-mono">--site-primary</code>,{" "}
          <code className="font-mono">--site-accent</code>,{" "}
          <code className="font-mono">--site-bg</code>,{" "}
          <code className="font-mono">--site-fg</code>. Use them in your own
          components with{" "}
          <code className="font-mono">style={`{{ color: 'var(--site-primary)' }}`}</code>.
        </p>
      </aside>
    </form>
  );
}

/* ─── color field ─── */

function ColorField({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 bg-white/70 dark:bg-zinc-900/40">
      <div className="flex items-center gap-3">
        <label
          className="relative h-12 w-12 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer shrink-0"
          style={{ background: valid ? value : "transparent" }}
        >
          <input
            type="color"
            value={valid ? value.slice(0, 7) : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            {!valid && (
              <span className="text-xs text-red-600">invalid hex</span>
            )}
          </div>
          {desc && (
            <p className="text-xs text-zinc-500 mt-0.5 hidden sm:block">{desc}</p>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="mt-2 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ─── */

function lighten(hex: string, amount: number): string {
  // very rough lighten — mix RGB toward 255
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return (
    "#" +
    lr.toString(16).padStart(2, "0") +
    lg.toString(16).padStart(2, "0") +
    lb.toString(16).padStart(2, "0")
  );
}
