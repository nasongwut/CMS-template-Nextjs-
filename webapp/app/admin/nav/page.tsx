import { prisma } from "@/lib/prisma";
import NavClient from "./nav-client";

export const dynamic = "force-dynamic";

function isNavReady(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.navItem?.findMany;
}

export default async function AdminNavPage() {
  const ready = isNavReady();
  const [items, categories, articles] = await Promise.all([
    ready
      ? prisma.navItem.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
      : Promise.resolve([]),
    ready
      ? prisma.category.findMany({
          where: { isPublished: true },
          select: { id: true, slug: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    ready
      ? prisma.article.findMany({
          where: { isPublished: true },
          select: { id: true, slug: true, title: true },
          orderBy: { title: "asc" },
          take: 100,
        })
      : Promise.resolve([]),
  ]);

  return (
    <section>
      <div>
        <h2 className="text-lg sm:text-xl font-medium">Navigation</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Items shown in the top navigation bar. Drag the order with ↑↓ buttons.
        </p>
      </div>

      {!ready && (
        <div className="mt-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 text-sm">
          <p className="font-medium">NavItem table isn&apos;t ready yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run prisma:migrate
            </code>
            .
          </p>
        </div>
      )}

      {ready && (
        <div className="mt-5 sm:mt-6">
          <NavClient
            initial={items.map((i) => ({
              id: i.id,
              label: i.label,
              kind: i.kind,
              target: i.target,
              parentId: (i as { parentId?: string | null }).parentId ?? null,
              order: i.order,
              requireAuth: i.requireAuth,
              adminOnly: i.adminOnly,
              openInNew: i.openInNew,
              isPublished: i.isPublished,
            }))}
            categories={categories}
            articles={articles}
          />
        </div>
      )}
    </section>
  );
}
