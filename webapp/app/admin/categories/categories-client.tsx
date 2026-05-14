"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/app/_components/image-upload";

interface Row {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  order: number;
  isPublished: boolean;
  articleCount: number;
}

export default function CategoriesClient({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const r = await fetch("/api/admin/categories");
    if (r.ok) {
      const j = await r.json();
      setItems(j.categories);
    }
  }

  async function onSave(form: Partial<Row> & { name: string }) {
    setError(null);
    const isNew = editing === "new";
    const url = isNew
      ? "/api/admin/categories"
      : `/api/admin/categories/${editing}`;
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
    if (!confirm("ลบ category นี้? (บทความใน category นี้จะกลายเป็น ‘ไม่มี category’)")) return;
    const r = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (r.ok) {
      await reload();
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-zinc-500">
          {items.length} categor{items.length === 1 ? "y" : "ies"}
        </p>
        <button
          onClick={() => setEditing("new")}
          className="px-3 py-1.5 rounded-md text-white text-sm font-medium shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          + New category
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {editing === "new" && (
        <CategoryForm
          onCancel={() => setEditing(null)}
          onSubmit={onSave}
          initial={{
            name: "",
            slug: "",
            description: "",
            coverImage: "",
            order: items.length,
            isPublished: true,
          }}
        />
      )}

      <ul className="space-y-2">
        {items.length === 0 && editing !== "new" && (
          <li className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-zinc-500 text-sm">
            ยังไม่มี category — สร้างอันแรกได้เลย
          </li>
        )}
        {items.map((c) => (
          <li key={c.id}>
            {editing === c.id ? (
              <CategoryForm
                onCancel={() => setEditing(null)}
                onSubmit={onSave}
                initial={{
                  name: c.name,
                  slug: c.slug,
                  description: c.description ?? "",
                  coverImage: c.coverImage ?? "",
                  order: c.order,
                  isPublished: c.isPublished,
                }}
              />
            ) : (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                {c.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.coverImage}
                    alt=""
                    className="w-14 h-14 rounded-md object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-md shrink-0 grid place-items-center text-white font-semibold text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                    }}
                  >
                    {c.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{c.name}</h3>
                    {!c.isPublished && (
                      <span className="text-[10px] uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                        draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    <code className="font-mono">/{c.slug}</code> · {c.articleCount}{" "}
                    article{c.articleCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm shrink-0">
                  <button
                    onClick={() => setEditing(c.id)}
                    className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
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

function CategoryForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: {
    name: string;
    slug: string;
    description: string;
    coverImage: string;
    order: number;
    isPublished: boolean;
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
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            type="text"
            required
            maxLength={120}
            value={v.name}
            onChange={(e) => setV({ ...v, name: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Slug</span>
          <input
            type="text"
            placeholder="auto from name"
            maxLength={80}
            value={v.slug}
            onChange={(e) => setV({ ...v, slug: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Description</span>
        <textarea
          rows={2}
          maxLength={1000}
          value={v.description}
          onChange={(e) => setV({ ...v, description: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
        />
      </label>
      <ImageUpload
        label="Cover image"
        prefix="categories"
        aspect="wide"
        value={v.coverImage}
        onChange={(s) => setV({ ...v, coverImage: s })}
      />
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={v.isPublished}
          onChange={(e) => setV({ ...v, isPublished: e.target.checked })}
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
          Save category
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
