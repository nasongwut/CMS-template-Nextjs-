"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NAV_KINDS, resolveHref, type NavKind } from "@/lib/nav";

interface NavItemRow {
  id: string;
  label: string;
  kind: string;
  target: string;
  parentId: string | null;
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

  // Build a render tree: top-level rows first, with their children attached.
  const tree = useMemo(() => buildTree(items), [items]);
  const parentChoices = useMemo(
    () => items.filter((i) => !i.parentId), // only top-level can be a parent (depth limit 1)
    [items],
  );

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
    if (!confirm("ลบ nav item นี้? (children ที่อยู่ใต้จะถูกลบไปด้วย)")) return;
    const r = await fetch(`/api/admin/nav/${id}`, { method: "DELETE" });
    if (r.ok) {
      await reload();
      router.refresh();
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    // Re-order within siblings only.
    const siblings = items
      .filter((x) => x.parentId === item.parentId)
      .sort((a, b) => a.order - b.order);
    const i = siblings.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= siblings.length) return;
    const a = siblings[i];
    const b = siblings[j];
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
          parentChoices={parentChoices}
          initial={{
            label: "",
            kind: "page",
            target: "",
            parentId: "",
            order: items.length,
            requireAuth: false,
            adminOnly: false,
            openInNew: false,
            isPublished: true,
          }}
        />
      )}

      <ul className="space-y-2">
        {tree.length === 0 && editing !== "new" && (
          <li className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-zinc-500 text-sm">
            ยังไม่มี nav item — เมื่อเพิ่มอันแรกแล้ว defaults จะหายไป
          </li>
        )}
        {tree.map((node, idx) => (
          <NavTreeRow
            key={node.id}
            node={node}
            siblingCount={tree.length}
            siblingIndex={idx}
            editing={editing}
            setEditing={setEditing}
            onSave={onSave}
            onDelete={onDelete}
            move={move}
            categories={categories}
            articles={articles}
            parentChoices={parentChoices}
          />
        ))}
      </ul>
    </div>
  );
}

interface TreeNode extends NavItemRow {
  children: NavItemRow[];
}

function buildTree(items: NavItemRow[]): TreeNode[] {
  const byParent = new Map<string | null, NavItemRow[]>();
  for (const it of items) {
    const key = it.parentId ?? null;
    const arr = byParent.get(key) ?? [];
    arr.push(it);
    byParent.set(key, arr);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.order - b.order);
  }
  const top = byParent.get(null) ?? [];
  return top.map((t) => ({
    ...t,
    children: byParent.get(t.id) ?? [],
  }));
}

function NavTreeRow({
  node,
  siblingCount,
  siblingIndex,
  editing,
  setEditing,
  onSave,
  onDelete,
  move,
  categories,
  articles,
  parentChoices,
}: {
  node: TreeNode;
  siblingCount: number;
  siblingIndex: number;
  editing: string | "new" | null;
  setEditing: (v: string | "new" | null) => void;
  onSave: (v: Partial<NavItemRow> & { label: string }) => void;
  onDelete: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
  categories: Ref[];
  articles: Ref[];
  parentChoices: NavItemRow[];
}) {
  const isEditing = editing === node.id;
  return (
    <li>
      {isEditing ? (
        <NavForm
          onCancel={() => setEditing(null)}
          onSubmit={(v) => onSave(v)}
          categories={categories}
          articles={articles}
          parentChoices={parentChoices.filter((p) => p.id !== node.id)}
          initial={{
            label: node.label,
            kind: node.kind,
            target: node.target,
            parentId: node.parentId ?? "",
            order: node.order,
            requireAuth: node.requireAuth,
            adminOnly: node.adminOnly,
            openInNew: node.openInNew,
            isPublished: node.isPublished,
          }}
        />
      ) : (
        <Row
          item={node}
          isParent={node.children.length > 0}
          move={move}
          siblingCount={siblingCount}
          siblingIndex={siblingIndex}
          onEdit={() => setEditing(node.id)}
          onDelete={() => onDelete(node.id)}
        />
      )}

      {node.children.length > 0 && (
        <ul className="ml-6 mt-2 space-y-2 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3">
          {node.children.map((c, ci) => (
            <li key={c.id}>
              {editing === c.id ? (
                <NavForm
                  onCancel={() => setEditing(null)}
                  onSubmit={(v) => onSave(v)}
                  categories={categories}
                  articles={articles}
                  parentChoices={parentChoices}
                  initial={{
                    label: c.label,
                    kind: c.kind,
                    target: c.target,
                    parentId: c.parentId ?? "",
                    order: c.order,
                    requireAuth: c.requireAuth,
                    adminOnly: c.adminOnly,
                    openInNew: c.openInNew,
                    isPublished: c.isPublished,
                  }}
                />
              ) : (
                <Row
                  item={c}
                  isChild
                  move={move}
                  siblingCount={node.children.length}
                  siblingIndex={ci}
                  onEdit={() => setEditing(c.id)}
                  onDelete={() => onDelete(c.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function Row({
  item,
  move,
  siblingCount,
  siblingIndex,
  onEdit,
  onDelete,
  isParent,
  isChild,
}: {
  item: NavItemRow;
  move: (id: string, dir: -1 | 1) => void;
  siblingCount: number;
  siblingIndex: number;
  onEdit: () => void;
  onDelete: () => void;
  isParent?: boolean;
  isChild?: boolean;
}) {
  const resolved = resolveHref(item.kind as NavKind, item.target);
  return (
    <div
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
        isChild ? "" : ""
      }`}
    >
      <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 w-fit shrink-0">
        {item.kind}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium truncate">{item.label}</h3>
          {isParent && (
            <span
              className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded text-white font-mono"
              style={{
                background:
                  "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
              }}
            >
              dropdown
            </span>
          )}
          {!item.isPublished && (
            <span className="text-[10px] uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
              hidden
            </span>
          )}
          {item.adminOnly && (
            <span className="text-[10px] uppercase tracking-wider bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
              admin
            </span>
          )}
          {item.requireAuth && (
            <span className="text-[10px] uppercase tracking-wider bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
              auth
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-0.5 truncate font-mono">
          → {resolved.href || "(parent-only)"}
          {resolved.external && " (external)"}
        </p>
      </div>
      <div className="flex items-center gap-1 text-sm shrink-0">
        <IconBtn
          onClick={() => move(item.id, -1)}
          disabled={siblingIndex === 0}
          label="Up"
        >
          ↑
        </IconBtn>
        <IconBtn
          onClick={() => move(item.id, 1)}
          disabled={siblingIndex === siblingCount - 1}
          label="Down"
        >
          ↓
        </IconBtn>
        <button
          onClick={onEdit}
          className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function NavForm({
  initial,
  onSubmit,
  onCancel,
  categories,
  articles,
  parentChoices,
}: {
  initial: {
    label: string;
    kind: string;
    target: string;
    parentId: string;
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
  parentChoices: NavItemRow[];
}) {
  const [v, setV] = useState(initial);

  function targetField() {
    if (v.kind === "category") {
      return (
        <select
          value={v.target}
          onChange={(e) => setV({ ...v, target: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
        >
          <option value="">— none (parent-only) —</option>
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
        >
          <option value="">— none (parent-only) —</option>
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
        value={v.target}
        onChange={(e) => setV({ ...v, target: e.target.value })}
        placeholder={
          v.kind === "external"
            ? "https://example.com (empty = parent-only)"
            : "/about (empty = parent-only)"
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
        <span className="text-sm font-medium">Parent</span>
        <p className="text-xs text-zinc-500 mt-0.5">
          เลือก parent ถ้าต้องการให้รายการนี้อยู่ใน dropdown ของรายการอื่น
        </p>
        <select
          value={v.parentId}
          onChange={(e) => setV({ ...v, parentId: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
        >
          <option value="">— None (top-level) —</option>
          {parentChoices.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Target</span>
        <p className="text-xs text-zinc-500 mt-0.5">
          {v.kind === "page" && "Internal path — e.g. /about. ปล่อยว่างถ้าเป็น dropdown parent"}
          {v.kind === "category" && "เลือก category ที่จะลิงก์ไป"}
          {v.kind === "article" && "เลือก article ที่จะลิงก์ไป"}
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
