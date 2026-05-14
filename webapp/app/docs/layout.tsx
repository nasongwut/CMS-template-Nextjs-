import Link from "next/link";

const nav = [
  {
    title: "Overview",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/getting-started", label: "Getting started" },
      { href: "/docs/environment", label: "Environment vars" },
    ],
  },
  {
    title: "Concepts",
    items: [
      { href: "/docs/auth", label: "Authentication" },
      { href: "/docs/rbac", label: "Roles & permissions" },
      { href: "/docs/storage", label: "Storage drivers" },
    ],
  },
  {
    title: "Reference",
    items: [
      { href: "/docs/api#auth", label: "Auth API" },
      { href: "/docs/api#files", label: "Files API" },
      { href: "/docs/api#folders", label: "Folders API" },
      { href: "/docs/api#admin", label: "Admin API" },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[220px_1fr] gap-10">
      <aside className="lg:sticky lg:top-6 self-start space-y-6 text-sm">
        {nav.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
              {g.title}
            </p>
            <ul className="space-y-1">
              {g.items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="block px-2 py-1 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/files"
            className="block px-2 py-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs"
          >
            ← Back to app
          </Link>
        </div>
      </aside>
      <article className="min-w-0 prose-zinc">{children}</article>
    </div>
  );
}
