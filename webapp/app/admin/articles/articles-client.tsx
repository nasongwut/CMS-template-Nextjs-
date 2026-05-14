"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/app/_components/image-upload";
import { ARTICLE_LAYOUTS } from "@/lib/article-layouts";

interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  layout: string;
  categoryId: string | null;
  categoryName: string | null;
  isPublished: boolean;
  order: number;
  createdAt: string;
}

export default function ArticlesClient({
  initialArticles,
  categories,
}: {
  initialArticles: ArticleRow[];
  categories: CategoryRef[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialArticles);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const r = await fetch("/api/admin/articles");
    if (r.ok) {
      const j = await r.json();
      setItems(
        j.articles.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any) => ({
            ...a,
            categoryName: a.category?.name ?? null,
          }),
        ),
      );
    }
  }

  async function onSave(form: Partial<ArticleRow> & { title: string }) {
    setError(null);
    const isNew = editing === "new";
    const url = isNew ? "/api/admin/articles" : `/api/admin/articles/${editing}`;
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
    if (!confirm("ลบบทความนี้?")) return;
    const r = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    if (r.ok) {
      await reload();
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-zinc-500">
          {items.length} article{items.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => setEditing("new")}
          className="px-3 py-1.5 rounded-md text-white text-sm font-medium shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          + New article
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {editing === "new" && (
        <ArticleForm
          onCancel={() => setEditing(null)}
          onSubmit={onSave}
          categories={categories}
          initial={{
            title: "",
            slug: "",
            excerpt: "",
            body: "",
            coverImage: "",
            layout: "classic",
            categoryId: "",
            isPublished: true,
            order: items.length,
          }}
        />
      )}

      <ul className="space-y-2">
        {items.length === 0 && editing !== "new" && (
          <li className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-zinc-500 text-sm">
            ยังไม่มีบทความ — สร้างอันแรกได้เลย
          </li>
        )}
        {items.map((a) => (
          <li key={a.id}>
            {editing === a.id ? (
              <ArticleForm
                onCancel={() => setEditing(null)}
                onSubmit={onSave}
                categories={categories}
                initial={{
                  title: a.title,
                  slug: a.slug,
                  excerpt: a.excerpt ?? "",
                  body: a.body,
                  coverImage: a.coverImage ?? "",
                  layout: a.layout,
                  categoryId: a.categoryId ?? "",
                  isPublished: a.isPublished,
                  order: a.order,
                }}
              />
            ) : (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                {a.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.coverImage}
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
                    {a.title[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{a.title}</h3>
                    {!a.isPublished && (
                      <span className="text-[10px] uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                        draft
                      </span>
                    )}
                    <span
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                        color: "white",
                      }}
                    >
                      {a.layout}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">
                    <code className="font-mono">/{a.slug}</code>
                    {a.categoryName && <> · {a.categoryName}</>}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm shrink-0">
                  <button
                    onClick={() => setEditing(a.id)}
                    className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(a.id)}
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

function ArticleForm({
  initial,
  onSubmit,
  onCancel,
  categories,
}: {
  initial: {
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    coverImage: string;
    layout: string;
    categoryId: string;
    isPublished: boolean;
    order: number;
  };
  onSubmit: (v: typeof initial) => void;
  onCancel: () => void;
  categories: CategoryRef[];
}) {
  const [v, setV] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="rounded-lg border-2 border-violet-300 dark:border-violet-700 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-4"
    >
      <div className="grid sm:grid-cols-[1fr_240px] gap-3">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input
            type="text"
            required
            maxLength={200}
            value={v.title}
            onChange={(e) => setV({ ...v, title: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Slug</span>
          <input
            type="text"
            placeholder="auto from title"
            maxLength={80}
            value={v.slug}
            onChange={(e) => setV({ ...v, slug: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Excerpt</span>
        <input
          type="text"
          maxLength={400}
          value={v.excerpt}
          onChange={(e) => setV({ ...v, excerpt: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
        />
      </label>

      <ImageUpload
        label="Cover image"
        prefix="articles"
        aspect="wide"
        value={v.coverImage}
        onChange={(s) => setV({ ...v, coverImage: s })}
      />

      <label className="block">
        <span className="text-sm font-medium">Body</span>
        <p className="text-xs text-zinc-500 mt-0.5">
          Plain text — blank lines separate paragraphs.
        </p>
        <textarea
          rows={10}
          maxLength={100000}
          value={v.body}
          onChange={(e) => setV({ ...v, body: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm leading-6 font-mono"
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <select
            value={v.categoryId}
            onChange={(e) => setV({ ...v, categoryId: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Layout</span>
          <select
            value={v.layout}
            onChange={(e) => setV({ ...v, layout: e.target.value })}
            className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          >
            {ARTICLE_LAYOUTS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.description.slice(0, 50)}
              </option>
            ))}
          </select>
        </label>
      </div>

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
          Save article
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
