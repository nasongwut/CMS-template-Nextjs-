"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/app/_components/image-upload";
import { ABOUT_LAYOUTS } from "@/lib/about-layouts";

/* ─── types ─── */

interface PageValues {
  heading: string;
  subheading: string;
  body: string;
  heroImage: string;
  layout: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  isPublished: boolean;
}

type SubTab = "page" | "layout" | "timeline";

const subTabs: { id: SubTab; label: string }[] = [
  { id: "page", label: "Page content" },
  { id: "layout", label: "Layout" },
  { id: "timeline", label: "Timeline" },
];

export default function AboutClient({
  initialPage,
  initialTimeline,
}: {
  initialPage: PageValues;
  initialTimeline: TimelineEvent[];
}) {
  const [tab, setTab] = useState<SubTab>("page");

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-full border border-zinc-200 dark:border-zinc-800 p-1 bg-white dark:bg-zinc-900 text-sm overflow-x-auto">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap ${
              tab === t.id
                ? "text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
            style={
              tab === t.id
                ? {
                    background:
                      "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                  }
                : undefined
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "page" && <PageEditor initial={initialPage} />}
      {tab === "layout" && <LayoutPicker initial={initialPage} />}
      {tab === "timeline" && <TimelineEditor initial={initialTimeline} />}
    </div>
  );
}

/* ═══════════════════ PAGE editor ═══════════════════ */

function PageEditor({ initial }: { initial: PageValues }) {
  const router = useRouter();
  const [v, setV] = useState<PageValues>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    v.heading !== initial.heading ||
    v.subheading !== initial.subheading ||
    v.body !== initial.body ||
    v.heroImage !== initial.heroImage;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const r = await fetch("/api/admin/about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heading: v.heading,
        subheading: v.subheading,
        body: v.body,
        heroImage: v.heroImage || null,
      }),
    });
    setSaving(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Save failed");
      return;
    }
    setSavedAt(new Date());
    router.refresh();
  }

  return (
    <form onSubmit={onSave} className="space-y-5 max-w-3xl">
      <Field
        label="Heading"
        value={v.heading}
        onChange={(s) => setV((p) => ({ ...p, heading: s }))}
        maxLen={200}
        required
      />
      <Field
        label="Sub-heading"
        value={v.subheading}
        onChange={(s) => setV((p) => ({ ...p, subheading: s }))}
        maxLen={400}
      />
      <ImageUpload
        label="Hero image"
        prefix="about/hero"
        aspect="wide"
        hint="Used by every layout that shows a hero image (Magazine / Bold / Split, etc.)"
        value={v.heroImage}
        onChange={(s) => setV((p) => ({ ...p, heroImage: s }))}
      />
      <Textarea
        label="Body"
        hint="Plain text. Blank lines separate paragraphs."
        value={v.body}
        onChange={(s) => setV((p) => ({ ...p, body: s }))}
        rows={8}
        maxLen={20000}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || !dirty}
          className="px-5 py-2 rounded-md text-white text-sm font-medium disabled:opacity-50 shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => setV(initial)}
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
    </form>
  );
}

/* ═══════════════════ LAYOUT picker ═══════════════════ */

function LayoutPicker({ initial }: { initial: PageValues }) {
  const router = useRouter();
  const [layout, setLayout] = useState(initial.layout);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(next: string) {
    setError(null);
    setSaving(next);
    const r = await fetch("/api/admin/about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: next }),
    });
    setSaving(null);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Save failed");
      return;
    }
    setLayout(next);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h3 className="text-sm font-medium">เลือก Layout</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            กดเลือกเพื่อเปลี่ยนการแสดงผลของหน้า{" "}
            <code className="font-mono">/about</code> ทันที
          </p>
        </div>
        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Preview ↗
        </a>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2 mb-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {ABOUT_LAYOUTS.map((l) => {
          const active = l.id === layout;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => pick(l.id)}
              disabled={saving === l.id}
              className={`text-left rounded-xl border-2 transition overflow-hidden ${
                active
                  ? "border-violet-500 dark:border-violet-400 shadow-md"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                <LayoutSwatch
                  shape={l.swatch.shape}
                  primary={l.swatch.primary}
                  accent={l.swatch.accent}
                />
                {active && (
                  <span className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                    }}
                  >
                    ✓
                  </span>
                )}
                {saving === l.id && (
                  <div className="absolute inset-0 grid place-items-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm text-xs text-zinc-500">
                    Saving…
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm">{l.name}</h4>
                <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
                  {l.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Tiny SVG preview for each layout shape */
function LayoutSwatch({
  shape,
  primary,
  accent,
}: {
  shape:
    | "centered"
    | "split"
    | "magazine"
    | "grid"
    | "horizontal"
    | "sidebar"
    | "bold"
    | "compact"
    | "mosaic"
    | "minimal";
  primary: string;
  accent: string;
}) {
  // common bg gradient under each preview
  const bg = `linear-gradient(135deg, ${primary}22, ${accent}22)`;
  return (
    <div className="absolute inset-0 p-3" style={{ background: bg }}>
      <svg
        viewBox="0 0 100 75"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {shape === "centered" && (
          <>
            <rect x="35" y="10" width="30" height="3" rx="1" fill={primary} />
            <rect x="25" y="17" width="50" height="3" rx="1" fill={accent} opacity="0.7" />
            <rect x="20" y="30" width="60" height="2" rx="1" fill="#a1a1aa" opacity="0.6" />
            <rect x="20" y="35" width="55" height="2" rx="1" fill="#a1a1aa" opacity="0.4" />
            <line x1="15" y1="48" x2="15" y2="70" stroke={primary} strokeWidth="1" />
            <circle cx="15" cy="52" r="2" fill={primary} />
            <circle cx="15" cy="60" r="2" fill={accent} />
            <circle cx="15" cy="68" r="2" fill={primary} />
            <rect x="20" y="51" width="60" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
            <rect x="20" y="59" width="50" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
            <rect x="20" y="67" width="40" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
          </>
        )}
        {shape === "split" && (
          <>
            <rect x="6" y="10" width="35" height="4" rx="1" fill={primary} />
            <rect x="6" y="18" width="40" height="2" rx="1" fill="#a1a1aa" opacity="0.6" />
            <rect x="6" y="22" width="35" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
            <rect x="54" y="8" width="40" height="32" rx="2" fill={accent} opacity="0.8" />
            <rect x="6" y="50" width="30" height="2" rx="1" fill={primary} />
            <rect x="40" y="50" width="20" height="14" rx="2" fill={accent} opacity="0.5" />
            <rect x="64" y="64" width="30" height="2" rx="1" fill={primary} />
            <rect x="40" y="64" width="20" height="6" rx="2" fill={accent} opacity="0.3" />
          </>
        )}
        {shape === "minimal" && (
          <>
            <rect x="20" y="12" width="40" height="3" rx="1" fill="#27272a" />
            <rect x="20" y="20" width="55" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
            <line x1="15" y1="35" x2="85" y2="35" stroke="#e4e4e7" strokeWidth="0.5" />
            <rect x="15" y="42" width="10" height="2" fill="#a1a1aa" />
            <rect x="30" y="42" width="40" height="2" fill="#27272a" />
            <rect x="15" y="50" width="10" height="2" fill="#a1a1aa" />
            <rect x="30" y="50" width="35" height="2" fill="#27272a" />
            <rect x="15" y="58" width="10" height="2" fill="#a1a1aa" />
            <rect x="30" y="58" width="45" height="2" fill="#27272a" />
            <rect x="15" y="66" width="10" height="2" fill="#a1a1aa" />
            <rect x="30" y="66" width="30" height="2" fill="#27272a" />
          </>
        )}
        {shape === "magazine" && (
          <>
            <rect x="0" y="0" width="100" height="35" fill={accent} opacity="0.8" />
            <rect x="6" y="22" width="50" height="5" rx="1" fill="white" />
            <rect x="6" y="29" width="35" height="2" rx="1" fill="white" opacity="0.8" />
            <rect x="6" y="42" width="60" height="2" fill="#a1a1aa" opacity="0.5" />
            <rect x="6" y="46" width="55" height="2" fill="#a1a1aa" opacity="0.5" />
            <rect x="6" y="55" width="35" height="15" rx="1" fill={primary} opacity="0.6" />
            <rect x="48" y="55" width="46" height="2" fill={primary} />
            <rect x="48" y="60" width="40" height="1.5" fill="#a1a1aa" />
            <rect x="48" y="64" width="42" height="1.5" fill="#a1a1aa" />
          </>
        )}
        {shape === "grid" && (
          <>
            <rect x="30" y="6" width="40" height="3" rx="1" fill={primary} />
            <rect x="35" y="12" width="30" height="2" rx="1" fill="#a1a1aa" opacity="0.6" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              return (
                <g key={i}>
                  <rect
                    x={5 + col * 32}
                    y={22 + row * 26}
                    width="28"
                    height="14"
                    rx="2"
                    fill={i % 2 === 0 ? primary : accent}
                    opacity="0.7"
                  />
                  <rect
                    x={5 + col * 32}
                    y={38 + row * 26}
                    width="20"
                    height="2"
                    rx="1"
                    fill={primary}
                  />
                  <rect
                    x={5 + col * 32}
                    y={42 + row * 26}
                    width="24"
                    height="1.5"
                    rx="1"
                    fill="#a1a1aa"
                    opacity="0.6"
                  />
                </g>
              );
            })}
          </>
        )}
        {shape === "horizontal" && (
          <>
            <rect x="30" y="8" width="40" height="3" rx="1" fill={primary} />
            <rect x="35" y="14" width="30" height="2" rx="1" fill="#a1a1aa" opacity="0.6" />
            <line x1="5" y1="48" x2="95" y2="48" stroke={primary} strokeWidth="0.5" />
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <circle cx={15 + i * 24} cy={48} r="2" fill={i % 2 === 0 ? primary : accent} />
                <rect
                  x={9 + i * 24}
                  y={54}
                  width="14"
                  height="14"
                  rx="1"
                  fill={i % 2 === 0 ? primary : accent}
                  opacity="0.6"
                />
              </g>
            ))}
          </>
        )}
        {shape === "compact" && (
          <>
            <rect x="35" y="8" width="30" height="3" rx="1" fill={primary} />
            <rect x="35" y="15" width="30" height="14" rx="1" fill={accent} opacity="0.6" />
            <rect x="35" y="33" width="30" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
            <rect x="35" y="37" width="28" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
            <rect x="35" y="46" width="6" height="1.5" rx="1" fill={primary} />
            <rect x="43" y="46" width="22" height="1.5" rx="1" fill="#27272a" />
            <rect x="43" y="50" width="20" height="1.2" rx="1" fill="#a1a1aa" />
            <rect x="35" y="56" width="6" height="1.5" rx="1" fill={primary} />
            <rect x="43" y="56" width="22" height="1.5" rx="1" fill="#27272a" />
            <rect x="43" y="60" width="20" height="1.2" rx="1" fill="#a1a1aa" />
            <rect x="35" y="66" width="6" height="1.5" rx="1" fill={primary} />
            <rect x="43" y="66" width="22" height="1.5" rx="1" fill="#27272a" />
          </>
        )}
        {shape === "sidebar" && (
          <>
            <rect x="6" y="8" width="40" height="3" rx="1" fill={primary} />
            <rect x="6" y="14" width="35" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
            <rect x="6" y="25" width="100" height="14" rx="1" fill={accent} opacity="0.4" />
            <line x1="22" y1="45" x2="22" y2="70" stroke="#e4e4e7" strokeWidth="0.5" />
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x="8" y={46 + i * 8} width="10" height="1.5" rx="1" fill={primary} opacity="0.6" />
                <rect x="28" y={46 + i * 8} width="40" height="1.5" rx="1" fill="#27272a" />
                <rect x="28" y={50 + i * 8} width="55" height="1.2" rx="1" fill="#a1a1aa" />
              </g>
            ))}
          </>
        )}
        {shape === "bold" && (
          <>
            <rect x="0" y="0" width="100" height="45" fill="#0a0a0a" />
            <rect x="0" y="0" width="100" height="45" fill={primary} opacity="0.5" />
            <rect x="6" y="30" width="55" height="6" rx="1" fill="white" />
            <rect x="6" y="38" width="40" height="2" rx="1" fill="white" opacity="0.8" />
            <text x="6" y="60" fill={accent} fontFamily="monospace" fontSize="9" fontWeight="bold">
              2024
            </text>
            <rect x="32" y="55" width="30" height="2" fill="#27272a" />
            <rect x="32" y="59" width="38" height="1.5" fill="#a1a1aa" />
            <text x="6" y="72" fill={accent} fontFamily="monospace" fontSize="9" fontWeight="bold">
              2025
            </text>
            <rect x="32" y="67" width="35" height="2" fill="#27272a" />
            <rect x="32" y="71" width="33" height="1.5" fill="#a1a1aa" />
          </>
        )}
        {shape === "mosaic" && (
          <>
            <rect x="6" y="6" width="40" height="3" rx="1" fill={primary} />
            <rect x="6" y="12" width="35" height="2" rx="1" fill="#a1a1aa" opacity="0.5" />
            <rect x="50" y="6" width="28" height="28" rx="2" fill={primary} opacity="0.7" />
            <rect x="80" y="6" width="14" height="14" rx="1" fill={accent} opacity="0.8" />
            <rect x="80" y="22" width="14" height="12" rx="1" fill={primary} opacity="0.5" />
            <rect x="6" y="40" width="18" height="14" rx="1" fill={accent} opacity="0.7" />
            <rect x="26" y="40" width="14" height="20" rx="1" fill={primary} opacity="0.5" />
            <rect x="42" y="40" width="18" height="14" rx="1" fill={accent} opacity="0.5" />
            <rect x="6" y="56" width="14" height="14" rx="1" fill={primary} opacity="0.7" />
            <rect x="42" y="56" width="22" height="14" rx="1" fill={accent} opacity="0.6" />
            <rect x="66" y="40" width="28" height="30" rx="1" fill={primary} opacity="0.4" />
          </>
        )}
      </svg>
    </div>
  );
}

/* ═══════════════════ TIMELINE editor ═══════════════════ */

function TimelineEditor({ initial }: { initial: TimelineEvent[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const r = await fetch("/api/admin/timeline");
    if (r.ok) {
      const j = await r.json();
      setItems(j.events);
    }
  }

  async function onSave(form: { id?: string } & Omit<TimelineEvent, "id">) {
    setError(null);
    const isNew = !form.id;
    const url = isNew ? "/api/admin/timeline" : `/api/admin/timeline/${form.id}`;
    const method = isNew ? "POST" : "PATCH";
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Save failed");
      return;
    }
    setEditing(null);
    await reload();
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const r = await fetch(`/api/admin/timeline/${id}`, { method: "DELETE" });
    if (r.ok) {
      await reload();
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-zinc-500">
            {items.length} event{items.length === 1 ? "" : "s"} —{" "}
            <span className="text-xs">
              จัดเรียงตามปีอัตโนมัติบนหน้า /about
            </span>
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="px-3 py-1.5 rounded-md text-white text-sm font-medium shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          + New event
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {editing === "new" && (
        <TimelineForm
          onCancel={() => setEditing(null)}
          onSubmit={(v) => onSave(v)}
          initial={{
            date: "",
            title: "",
            description: "",
            imageUrl: "",
            isPublished: true,
            order: items.length,
          }}
        />
      )}

      <ul className="space-y-2">
        {items.length === 0 && editing !== "new" && (
          <li className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-zinc-500 text-sm">
            No events yet — add your first milestone.
          </li>
        )}
        {items.map((e) => (
          <li key={e.id}>
            {editing === e.id ? (
              <TimelineForm
                onCancel={() => setEditing(null)}
                onSubmit={(v) => onSave({ ...v, id: e.id })}
                initial={{
                  date: e.date,
                  title: e.title,
                  description: e.description ?? "",
                  imageUrl: e.imageUrl ?? "",
                  isPublished: e.isPublished,
                  order: e.order,
                }}
              />
            ) : (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                {e.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.imageUrl}
                    alt=""
                    className="w-14 h-14 rounded-md object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-md shrink-0 border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 text-[10px]">
                    no img
                  </div>
                )}
                <div className="sm:w-28 shrink-0">
                  <span
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: "var(--site-primary)" }}
                  >
                    {e.date}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{e.title}</h3>
                    {!e.isPublished && (
                      <span className="text-[10px] uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                        draft
                      </span>
                    )}
                  </div>
                  {e.description && (
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                      {e.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm shrink-0">
                  <button
                    onClick={() => setEditing(e.id)}
                    className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(e.id)}
                    className="px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: {
    date: string;
    title: string;
    description: string;
    imageUrl: string;
    isPublished: boolean;
    order: number;
  };
  onSubmit: (v: typeof initial) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="rounded-lg border-2 border-violet-300 dark:border-violet-700 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-3"
    >
      <div className="grid sm:grid-cols-[160px_1fr] gap-3">
        <Field
          label="Date label"
          value={v.date}
          onChange={(s) => setV((p) => ({ ...p, date: s }))}
          maxLen={40}
          required
          placeholder="2024 / Q3 2025 / Oct 2026"
        />
        <Field
          label="Title"
          value={v.title}
          onChange={(s) => setV((p) => ({ ...p, title: s }))}
          maxLen={200}
          required
        />
      </div>
      <Textarea
        label="Description"
        value={v.description}
        onChange={(s) => setV((p) => ({ ...p, description: s }))}
        rows={3}
        maxLen={1000}
      />
      <ImageUpload
        label="Event image"
        prefix="about/timeline"
        aspect="square"
        hint="Upload a JPG / PNG / WebP, or paste an existing URL."
        value={v.imageUrl}
        onChange={(s) => setV((p) => ({ ...p, imageUrl: s }))}
      />
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={v.isPublished}
          onChange={(e) => setV((p) => ({ ...p, isPublished: e.target.checked }))}
        />
        <span>Published</span>
      </label>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          className="px-5 py-2 rounded-md text-white text-sm font-medium shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          Save event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── shared field components ─── */

function Field({
  label,
  value,
  onChange,
  maxLen,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLen?: number;
  required?: boolean;
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
      <input
        type="text"
        value={value}
        required={required}
        maxLength={maxLen}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
      />
    </label>
  );
}

function Textarea({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  maxLen,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLen?: number;
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
        className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm leading-6 font-mono"
      />
    </label>
  );
}
