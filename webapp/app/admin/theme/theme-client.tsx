"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_THEMES, THEME_PRESETS, type SiteTheme, type ThemePreset } from "@/lib/theme";

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
  siteStyle: string;
}

export default function ThemeClient({
  initial,
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

  /** Apply a colour preset — replaces 8 colours, keeps current siteStyle. */
  function applyPreset(p: ThemePreset) {
    setV((prev) => ({
      ...prev,
      lightPrimary: p.light.primary,
      lightAccent: p.light.accent,
      lightBackground: p.light.background,
      lightForeground: p.light.foreground,
      darkPrimary: p.dark.primary,
      darkAccent: p.dark.accent,
      darkBackground: p.dark.background,
      darkForeground: p.dark.foreground,
    }));
  }

  /** Apply a complete site theme — colours + design language. */
  function applySiteTheme(t: SiteTheme) {
    setV({
      lightPrimary: t.light.primary,
      lightAccent: t.light.accent,
      lightBackground: t.light.background,
      lightForeground: t.light.foreground,
      darkPrimary: t.dark.primary,
      darkAccent: t.dark.accent,
      darkBackground: t.dark.background,
      darkForeground: t.dark.foreground,
      siteStyle: t.id,
    });
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
      <div className="space-y-6 min-w-0">
        {/* ── Site themes (full design language packs) ── */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Site theme
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Each pack swaps colours <strong>and</strong> typography / radius /
                borders across the whole site
              </p>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Current:{" "}
              <code className="font-mono">{v.siteStyle}</code>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SITE_THEMES.map((t) => {
              const active = v.siteStyle === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applySiteTheme(t)}
                  className={`group rounded-2xl border p-4 text-left transition overflow-hidden ${
                    active
                      ? "border-violet-500 dark:border-violet-400 shadow-md ring-2 ring-violet-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  {/* Big split preview */}
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-3">
                    <div
                      className="h-16 px-3 flex items-center justify-between"
                      style={{ background: t.light.background, color: t.light.foreground }}
                    >
                      <span className="text-2xl" style={{ color: t.light.primary }}>
                        {t.glyph}
                      </span>
                      <div className="flex gap-1">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: t.light.primary }}
                        />
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: t.light.accent }}
                        />
                      </div>
                    </div>
                    <div
                      className="h-16 px-3 flex items-center justify-between"
                      style={{ background: t.dark.background, color: t.dark.foreground }}
                    >
                      <span className="text-2xl" style={{ color: t.dark.primary }}>
                        {t.glyph}
                      </span>
                      <div className="flex gap-1">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: t.dark.primary }}
                        />
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: t.dark.accent }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold">{t.name}</h4>
                    {active && (
                      <span
                        className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded text-white font-medium shrink-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                        }}
                      >
                        ✓ active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {t.blurb}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

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
                      backgroundImage:
                        "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                    }
                  : undefined
              }
            >
              {m === "light" ? "☀ Light mode" : "☾ Dark mode"}
            </button>
          ))}
        </div>

        {/* Full-palette presets */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Presets — apply to both modes
            </p>
            <p className="text-xs text-zinc-400">
              {THEME_PRESETS.length} curated palettes
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {THEME_PRESETS.map((p) => {
              const isActive =
                p.light.primary.toLowerCase() === v.lightPrimary.toLowerCase() &&
                p.light.accent.toLowerCase() === v.lightAccent.toLowerCase() &&
                p.dark.primary.toLowerCase() === v.darkPrimary.toLowerCase() &&
                p.dark.accent.toLowerCase() === v.darkAccent.toLowerCase();
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  title={p.description}
                  className={`group rounded-xl border p-3 text-left transition overflow-hidden ${
                    isActive
                      ? "border-violet-500 dark:border-violet-400 shadow-md"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  {/* Mini split preview: top half light, bottom half dark */}
                  <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-2">
                    <div
                      className="h-8 flex items-center px-2 gap-1"
                      style={{ background: p.light.background }}
                    >
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ background: p.light.primary }}
                      />
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ background: p.light.accent }}
                      />
                      <span
                        className="ml-auto text-[10px] font-mono"
                        style={{ color: p.light.foreground }}
                      >
                        Aa
                      </span>
                    </div>
                    <div
                      className="h-8 flex items-center px-2 gap-1"
                      style={{ background: p.dark.background }}
                    >
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ background: p.dark.primary }}
                      />
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ background: p.dark.accent }}
                      />
                      <span
                        className="ml-auto text-[10px] font-mono"
                        style={{ color: p.dark.foreground }}
                      >
                        Aa
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-xs font-medium truncate">{p.name}</div>
                    {isActive && (
                      <span
                        className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded text-white font-medium shrink-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Color inputs for the active mode */}
        <section>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            {mode === "light" ? "Light mode colours" : "Dark mode colours"}
          </p>
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
                  desc="Drives the `<body>` background — used by --site-bg."
                  value={v.lightBackground}
                  onChange={(s) => set("lightBackground", s)}
                />
                <ColorField
                  label="Foreground"
                  desc="Default text colour over the background."
                  value={v.lightForeground}
                  onChange={(s) => set("lightForeground", s)}
                />
              </>
            ) : (
              <>
                <ColorField
                  label="Primary"
                  desc="Brighter than light mode — pops on dark surface."
                  value={v.darkPrimary}
                  onChange={(s) => set("darkPrimary", s)}
                />
                <ColorField
                  label="Accent"
                  desc="Warm or bright second colour for the gradient."
                  value={v.darkAccent}
                  onChange={(s) => set("darkAccent", s)}
                />
                <ColorField
                  label="Background"
                  desc="Deep dark surface — avoid pure black for paper feel."
                  value={v.darkBackground}
                  onChange={(s) => set("darkBackground", s)}
                />
                <ColorField
                  label="Foreground"
                  desc="Slightly off-white reads gentler than pure white."
                  value={v.darkForeground}
                  onChange={(s) => set("darkForeground", s)}
                />
              </>
            )}
          </div>
        </section>

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
              backgroundImage:
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

      {/* Live preview — sticky on lg+ so it stays in view while scrolling */}
      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Live preview
          </p>
          <p className="text-xs text-zinc-400 font-mono">{mode}</p>
        </div>
        <div
          className="rounded-2xl p-5 shadow-md border overflow-hidden"
          style={{
            background: activePalette.bg,
            color: activePalette.fg,
            borderColor: activePalette.fg + "22",
          }}
        >
          {/* mini nav */}
          <div className="flex items-center justify-between text-xs pb-3 border-b"
            style={{ borderColor: activePalette.fg + "11" }}
          >
            <span
              className="font-semibold"
              style={{
                backgroundImage: `linear-gradient(90deg, ${activePalette.primary}, ${activePalette.accent})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              preview.app
            </span>
            <span style={{ opacity: 0.5 }}>{mode}</span>
          </div>

          {/* Hero */}
          <h3
            className="mt-5 text-2xl font-semibold leading-tight"
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
            This block updates instantly as you edit colours or pick a preset.
          </p>

          {/* Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-md text-white text-xs font-medium"
              style={{
                backgroundImage: `linear-gradient(90deg, ${activePalette.primary}, ${activePalette.accent})`,
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
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                background: activePalette.accent + "22",
                color: activePalette.accent,
              }}
            >
              ★ accent
            </span>
          </div>

          {/* Swatch ramp */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 0.6, 0.3, 0.1].map((o, i) => (
              <div
                key={i}
                className="h-8 rounded-md flex items-end justify-end p-1"
                style={{
                  background: activePalette.primary,
                  opacity: o,
                }}
              >
                <span className="text-[9px] font-mono text-white opacity-80">
                  {Math.round(o * 100)}
                </span>
              </div>
            ))}
          </div>

          {/* Card sample */}
          <div
            className="mt-4 rounded-lg p-3 border text-xs"
            style={{
              borderColor: activePalette.fg + "22",
              background: activePalette.fg + "06",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: activePalette.primary }}
              />
              <span style={{ opacity: 0.8 }}>City Art · เปิดสตูดิโอใหม่</span>
            </div>
            <p className="mt-1 text-[11px]" style={{ opacity: 0.55 }}>
              ลดเวลาผลิตเฉลี่ยลง 35% ด้วยโรงงานในมือตัวเอง
            </p>
          </div>

          {/* Hex codes */}
          <div className="mt-4 text-xs space-y-1">
            <div className="flex justify-between" style={{ opacity: 0.55 }}>
              <span>primary</span>
              <span className="font-mono">{activePalette.primary}</span>
            </div>
            <div className="flex justify-between" style={{ opacity: 0.55 }}>
              <span>accent</span>
              <span className="font-mono">{activePalette.accent}</span>
            </div>
            <div className="flex justify-between" style={{ opacity: 0.55 }}>
              <span>background</span>
              <span className="font-mono">{activePalette.bg}</span>
            </div>
            <div className="flex justify-between" style={{ opacity: 0.55 }}>
              <span>foreground</span>
              <span className="font-mono">{activePalette.fg}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Tip — your colours are exposed as CSS variables{" "}
          <code className="font-mono">--site-primary</code>,{" "}
          <code className="font-mono">--site-accent</code>,{" "}
          <code className="font-mono">--site-bg</code>,{" "}
          <code className="font-mono">--site-fg</code>.
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
