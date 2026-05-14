"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NAV_KINDS, resolveHref, type NavKind } from "@/lib/nav";

interface NavItemRow {
  id: string;
  label: string;
  kind: string;
  target: string;
  order: number;
  requireAuth: boolean;
  adminOnly: boolean;
  openInNew: boolean;
  isPublished: boolean;
}

interface Ref {
  id: string;
  slug: string;
  name?: string;
  title?: string;
}

export default function NavClient({
  initial,
  categories,
  articles,
}: {
  initial: NavItemRow[];
  categories: Ref[];
  articles: Ref[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const r = await fetch("/api/admin/nav");
    if (r.ok) {
      const j = await r.json();
      setItems(j.items);
    }
  }

  async function onSave(form: Partial<NavItemRow> & { label: string }) {
    setError(null);
    const isNew = editing === "new";
    const url = isNew ? "/api/admin/nav" : `/api/admin/nav/${editing}`;
    const r = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
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
    if (!confirm("ลบ nav item นี้?")) return;
    const r = await fetch(`/api/admin/nav/${id}`, { method: "DELETE" });
    if (r.ok) {
      await reload();
      router.refresh();
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const i = items.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const a = items[i];
    const b = items[j];
    await Promise.all([
      fetch(`/api/admin/nav/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/nav/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    await reload();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-zinc-500">
          {items.length} nav item{items.length === 1 ? "" : "s"}
          {items.length === 0 && " — using built-in defaults"}
        </p>
        <button
          onClick={() => setEditing("new")}
          className="px-3 py-1.5 rounded-md text-white text-sm font-medium shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          + New nav item
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {editing === "new" && (
        <NavForm
          onCancel={() => setEditing(null)}
          onSubmit={onSave}
          categories={categories}
          articles={articles}
          initial={{
            label: "",
            kind: "page",
            target: "",
            order: items.length,
            requireAuth: false,
            adminOnly: false,
            openInNew: false,
            isPublished: true,
          }}
        />
      )}

      <ul className="space-y-2">
        {items.length === 0 && editing !== "new" && (
          <li className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-zinc-500 text-sm">
            ยังไม่มี nav item — เมื่อเพิ่มอันแรกแล้ว defaults จะหายไป
          </li>
        )}
        {items.map((it, i) => {
          const resolved = resolveHref(it.kind as NavKind, it.target);
          return (
            <li key={it.id}>
              {editing === it.id ? (
                <NavForm
                  onCancel={() => setEditing(null)}
                  onSubmit={onSave}
                  categories={categories}
                  articles={articles}
                  initial={{
                    label: it.label,
                    kind: it.kind,
                    target: it.target,
                    order: it.order,
                    requireAuth: it.requireAuth,
                    adminOnly: it.adminOnly,
                    openInNew: it.openInNew,
                    isPublished: it.isPublished,
                  }}
                />
              ) : (
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 w-fit shrink-0">
                    {it.kind}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{it.label}</h3>
                      {!it.isPublished && (
                        <span className="text-[10px] uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                          hidden
                        </span>
                      )}
                      {it.adminOnly && (
                        <span className="text-[10px] uppercase tracking-wider bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                          admin
                        </span>
                      )}
                      {it.requireAuth && (
                        <span className="text-[10px] uppercase tracking-wider bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                          auth
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate font-mono">
                      → {resolved.href}
                      {resolved.external && " (external)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <IconBtn onClick={() => move(it.id, -1)} disabled={i === 0} label="Up">
                      ↑
                    </IconBtn>
                    <IconBtn
                      onClick={() => move(it.id, 1)}
                      disabled={i === items.length - 1}
                      label="Down"
                    >
                      ↓
                    </IconBtn>
                    <button
                      onClick={() => setEditing(it.id)}
                      className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(it.id)}
                      className="px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NavForm({
  initial,
  onSubmit,
  onCancel,
  categories,
  articles,
}: {
  initial: {
    label: string;
    kind: string;
    target: string;
    order: number;
    requireAuth: boolean;
    adminOnly: boolean;
    openInNew: boolean;
    isPublished: boolean;
  };
  onSubmit: (v: typeof initial) => void;
  onCancel: () => void;
  categories: Ref[];
  articles: Ref[];
}) {
  const [v, setV] = useState(initial);

  function targetField() {
    if (v.kind === "category") {
      return (
        <select
          value={v.target}
          onChange={(e) => setV({ ...v, target: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          required
        >
          <option value="">— select category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name} ({c.slug})
            </option>
          ))}
        </select>
      );
    }
    if (v.kind === "article") {
      return (
        <select
          value={v.target}
          onChange={(e) => setV({ ...v, target: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          required
        >
          <option value="">— select article —</option>
          {articles.map((a) => (
            <option key={a.id} value={a.slug}>
              {a.title} ({a.slug})
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        type="text"
        required
        value={v.target}
        onChange={(e) => setV({ ...v, target: e.target.value })}
        placeholder={
          v.kind === "external" ? "https://example.com" : "/about"
        }
        className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono"
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="rounded-lg border-2 border-violet-300 dark:border-violet-700 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-3"
    >
      <div className="grid sm:grid-cols-[1fr_180px] gap-3">
        <label className="block">
          <span className="text-sm font-medium">Label</span>
          <input
            type="text"
            required
            maxLength={60}
            value={v.label}
            onChange={(e) => setV({ ...v, label: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Kind</span>
          <select
            value={v.kind}
            onChange={(e) => setV({ ...v, kind: e.target.value, target: "" })}
            className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          >
            {NAV_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Target</span>
        <p className="text-xs text-zinc-500 mt-0.5">
          {v.kind === "page" && "Internal path — e.g. /about"}
          {v.kind === "category" && "Pick a category to link to"}
          {v.kind === "article" && "Pick an article to link to"}
          {v.kind === "external" && "Full URL — e.g. https://example.com"}
        </p>
        {targetField()}
      </label>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={v.isPublished}
            onChange={(e) => setV({ ...v, isPublished: e.target.checked })}
          />
          <span>Published</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={v.requireAuth}
            onChange={(e) => setV({ ...v, requireAuth: e.target.checked })}
          />
          <span>Require login</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={v.adminOnly}
            onChange={(e) => setV({ ...v, adminOnly: e.target.checked })}
          />
          <span>Admin only</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={v.openInNew}
            onChange={(e) => setV({ ...v, openInNew: e.target.checked })}
          />
          <span>Open in new tab</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          className="px-5 py-2 rounded-md text-white text-sm font-medium shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          Save nav item
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

function IconBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-7 h-7 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
