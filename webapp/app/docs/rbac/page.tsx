import CodeBlock from "../_components/code-block";

export default function RbacDocsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Concept
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">
          Roles &amp; permissions
        </h1>
      </header>

      <section>
        <h2 className="text-xl font-medium">The three roles</h2>
        <CodeBlock
          lang="prisma"
          code={`enum Role {
  ADMIN
  USER
  GUEST
}`}
        />
      </section>

      <section>
        <h2 className="text-xl font-medium">Capability matrix</h2>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-3">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-left">
              <tr>
                <th className="px-4 py-2">Capability</th>
                <th className="px-4 py-2 text-center w-20">ADMIN</th>
                <th className="px-4 py-2 text-center w-20">USER</th>
                <th className="px-4 py-2 text-center w-20">GUEST</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Sign in", true, true, true],
                ["See own profile (/api/auth/me)", true, true, true],
                ["Create folder", true, true, false],
                ["Upload file", true, true, false],
                ["List own files", true, true, "empty"],
                ["Delete own file", true, true, false],
                ["See all users' files", true, false, false],
                ["Delete any file", true, false, false],
                ["/admin console", true, false, false],
                ["Create / update / delete users", true, false, false],
              ].map((row, i) => (
                <tr key={i} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-2">{row[0] as string}</td>
                  {row.slice(1).map((cell, j) => (
                    <td key={j} className="px-4 py-2 text-center">
                      {cell === true ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                      ) : cell === false ? (
                        <span className="text-zinc-400">—</span>
                      ) : (
                        <span className="text-xs text-zinc-500">{cell as string}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          GUEST is currently a placeholder role. The API doesn't reject GUESTs
          from uploading — the UI does. To enforce server-side, change{" "}
          <code className="font-mono">requireUser()</code> in{" "}
          <code className="font-mono">app/api/files/route.ts</code> POST to{" "}
          <code className="font-mono">requireRole("USER", "ADMIN")</code>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-medium">How a role is set</h2>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-3">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-left">
              <tr>
                <th className="px-4 py-2">Path</th>
                <th className="px-4 py-2">Resulting role</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["/register or POST /api/auth/register", "USER (always)"],
                ["Admin via /admin or POST /api/admin/users", "Whatever the admin picked"],
                ["db:seed", "ADMIN (bootstrap account)"],
                ["Admin via /admin → role dropdown", "Whatever the admin picked"],
              ].map(([k, v]) => (
                <tr key={k} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-2 font-mono text-xs">{k}</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium">Self-protection</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Admins cannot demote, disable, or delete themselves. The checks live in{" "}
          <code className="font-mono">app/api/admin/users/[id]/route.ts</code>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-medium">Patterns</h2>

        <h3 className="mt-4 font-medium text-sm">In an API route</h3>
        <CodeBlock
          lang="ts"
          code={`const me = await requireRole("ADMIN", "USER");          // any role except GUEST
if (resource.ownerId !== me.id && me.role !== "ADMIN") {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}`}
        />

        <h3 className="mt-4 font-medium text-sm">In a server component</h3>
        <CodeBlock
          lang="tsx"
          code={`const user = await getCurrentUser();
if (!user) redirect("/login");
if (user.role !== "ADMIN") redirect("/files");`}
        />
      </section>
    </div>
  );
}
