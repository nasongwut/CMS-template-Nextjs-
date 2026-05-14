import Link from "next/link";

export default function DocsIndexPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Developer Documentation
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">
          Build, deploy, extend.
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-2xl">
          A complete reference for the Next.js + Storage starter — covering setup,
          architecture, authentication, role-based access, the pluggable storage
          layer, and every API endpoint with example payloads.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card href="/docs/getting-started" eyebrow="Start here" title="Getting started"
          desc="Install dependencies, configure your two env files, run prisma migrate, and start the dev server." />
        <Card href="/docs/environment" eyebrow="Configuration" title="Environment variables"
          desc="Every supported env key, where it's read, and sensible defaults." />
        <Card href="/docs/auth" eyebrow="Concept" title="Authentication"
          desc="JWT cookie sessions, password hashing, middleware, and how to add a protected route." />
        <Card href="/docs/rbac" eyebrow="Concept" title="Roles & permissions"
          desc="ADMIN, USER, and GUEST roles with the full capability matrix." />
        <Card href="/docs/storage" eyebrow="Concept" title="Storage drivers"
          desc="The local driver, S3 implementation, and how to write your own backend." />
        <Card href="/docs/api" eyebrow="Reference" title="API endpoints"
          desc="Every endpoint with request body, query params, response shape, and example payloads."
          highlight />
      </div>

      <section>
        <h2 className="text-lg font-medium">Quick links</h2>
        <ul className="mt-3 grid sm:grid-cols-2 gap-y-1 text-sm">
          <Li href="/docs/api#post-api-auth-register">POST /api/auth/register</Li>
          <Li href="/docs/api#post-api-auth-login">POST /api/auth/login</Li>
          <Li href="/docs/api#post-api-files">POST /api/files (upload)</Li>
          <Li href="/docs/api#get-api-files">GET /api/files</Li>
          <Li href="/docs/api#post-api-folders">POST /api/folders</Li>
          <Li href="/docs/api#delete-api-folders-id">DELETE /api/folders/:id</Li>
          <Li href="/docs/api#get-api-admin-users">GET /api/admin/users</Li>
          <Li href="/docs/api#patch-api-admin-users-id">PATCH /api/admin/users/:id</Li>
        </ul>
      </section>
    </div>
  );
}

function Card({
  href,
  eyebrow,
  title,
  desc,
  highlight = false,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl border p-5 transition-colors ${
        highlight
          ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/70 dark:bg-zinc-900/40"
      }`}
    >
      <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
        {eyebrow}
      </p>
      <h3 className="mt-1 font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-6">{desc}</p>
    </Link>
  );
}

function Li({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="font-mono text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        {children}
      </Link>
    </li>
  );
}
