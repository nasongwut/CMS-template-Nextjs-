import CodeBlock from "../_components/code-block";

export default function AuthDocsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Concept
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">Authentication</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-3xl">
          A self-contained JWT-cookie session — no external provider, no
          NextAuth, no Auth.js. Passwords are hashed with bcrypt (cost 10) and
          stored alongside the user. The JWT is HS256, signed with{" "}
          <code className="font-mono">AUTH_SECRET</code>, and stored in an{" "}
          <em>HttpOnly, SameSite=Lax, Secure-in-prod</em> cookie.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-medium">JWT payload</h2>
        <CodeBlock
          lang="ts"
          code={`interface SessionPayload {
  sub: string;     // user id (cuid)
  email: string;
  role: "ADMIN" | "USER" | "GUEST";
  name: string | null;
}`}
        />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          Plus the standard registered claims:{" "}
          <code className="font-mono">iss: "webapp"</code>,{" "}
          <code className="font-mono">iat</code>,{" "}
          <code className="font-mono">exp</code>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-medium">File map</h2>
        <ul className="mt-3 space-y-1 text-sm">
          <FileRow path="lib/auth.ts" desc="Sign / verify JWT, cookie helpers, role guards" />
          <FileRow path="lib/prisma.ts" desc="Singleton PrismaClient" />
          <FileRow path="proxy.ts" desc="Edge: redirect unauth'd users from /files, /admin" />
          <FileRow path="app/api/auth/register/route.ts" desc="Create account → set session" />
          <FileRow path="app/api/auth/login/route.ts" desc="Verify password → set session" />
          <FileRow path="app/api/auth/logout/route.ts" desc="Delete the session cookie" />
          <FileRow path="app/api/auth/me/route.ts" desc="Return the current user or null" />
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-medium">Adding an authenticated route</h2>
        <CodeBlock
          lang="ts"
          code={`// app/api/things/route.ts
import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const me = await requireUser();                       // 401 if no session
    const things = await prisma.thing.findMany({
      where: { ownerId: me.id },
    });
    return NextResponse.json({ things });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}`}
        />
      </section>

      <section>
        <h2 className="text-xl font-medium">Admin-only routes</h2>
        <CodeBlock lang="ts" code={`const me = await requireRole("ADMIN");`} />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          <code className="font-mono">requireRole(...roles)</code> accepts a
          variadic list — pass multiple roles like{" "}
          <code className="font-mono">requireRole("ADMIN", "USER")</code> to lock
          out GUESTs.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-medium">Server components</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Use <code className="font-mono">getCurrentUser()</code> to render
          different content for guests rather than throwing 401:
        </p>
        <CodeBlock
          lang="tsx"
          code={`import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <p>Hi {user.email}</p>;
}`}
        />
      </section>

      <section>
        <h2 className="text-xl font-medium">Edge middleware</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <code className="font-mono">middleware.ts</code> runs at the Edge on
          every matched request:
        </p>
        <ol className="list-decimal list-inside mt-2 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          <li>Reads the session cookie</li>
          <li>Verifies the JWT (no DB call)</li>
          <li>Redirects to <code className="font-mono">/login?from=&lt;path&gt;</code> if invalid</li>
          <li>For <code className="font-mono">/admin/*</code>, redirects to <code className="font-mono">/files</code> unless role is ADMIN</li>
        </ol>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">
          The matcher only covers{" "}
          <code className="font-mono">/files</code> and{" "}
          <code className="font-mono">/admin</code>. Public pages and the{" "}
          <code className="font-mono">/api/auth/*</code> endpoints are
          intentionally not gated by middleware.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-medium">Rotating AUTH_SECRET</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Rotating invalidates every existing JWT — users get bounced to{" "}
          <code className="font-mono">/login</code>. To support zero-downtime
          rotation, extend{" "}
          <code className="font-mono">lib/auth.ts</code> to try a list of
          secrets when verifying.
        </p>
      </section>
    </div>
  );
}

function FileRow({ path, desc }: { path: string; desc: string }) {
  return (
    <li className="flex items-baseline gap-3">
      <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
        {path}
      </code>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{desc}</span>
    </li>
  );
}
