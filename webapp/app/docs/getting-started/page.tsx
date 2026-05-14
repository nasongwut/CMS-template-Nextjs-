import CodeBlock from "../_components/code-block";

export default function GettingStartedPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Start here
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">Getting started</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Five steps from a fresh clone to a running app with a working admin
          account.
        </p>
      </header>

      <Step n={1} title="Prerequisites">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Node 20.19+ (or 22.13+), npm 10+, and a PostgreSQL database
          (Neon / Supabase / RDS / local). SQLite is{" "}
          <strong>not</strong> supported because the schema uses an{" "}
          <code className="font-mono">enum</code>.
        </p>
      </Step>

      <Step n={2} title="Install">
        <CodeBlock
          lang="bash"
          code={`git clone <your-repo> && cd "Nextjs + storage"
npm install`}
        />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          Root <code className="font-mono">npm install</code> pulls in
          dotenv-cli at root, then the <code className="font-mono">postinstall</code>{" "}
          hook installs webapp dependencies.
        </p>
      </Step>

      <Step n={3} title="Configure .env">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Two files live at the project root. Fill in real values:
        </p>
        <CodeBlock
          title=".env.development"
          code={`NODE_ENV=development
AUTH_SECRET="dev-secret-please-change-32-chars-minimum"
DATABASE_URL="postgresql://user:pass@localhost:5432/appdb?schema=public"
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./storage/dev
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@1234`}
        />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          Generate a strong secret:
        </p>
        <CodeBlock lang="bash" code={`openssl rand -base64 32`} />
      </Step>

      <Step n={4} title="Create the database">
        <CodeBlock
          lang="bash"
          code={`npm run prisma:generate     # @prisma/client typings
npm run prisma:migrate      # create tables
npm run db:seed             # create the bootstrap admin`}
        />
      </Step>

      <Step n={5} title="Run the dev server">
        <CodeBlock lang="bash" code={`npm run dev`} />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          Open <code className="font-mono">http://localhost:3000</code> and sign
          in with the admin credentials you set in step 3.
        </p>
      </Step>

      <section>
        <h2 className="text-xl font-medium">Going to production</h2>
        <CodeBlock
          lang="bash"
          code={`# Fill .env.production with real values first
npm run prisma:migrate:prod   # apply migrations with prisma migrate deploy
npm run db:seed:prod          # optional — create initial admin
npm run build                 # builds with .env.production
npm run start                 # production server`}
        />
      </section>

      <section>
        <h2 className="text-xl font-medium">Troubleshooting</h2>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-3">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-left">
              <tr>
                <th className="px-4 py-2">Symptom</th>
                <th className="px-4 py-2">Fix</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              {[
                ["sh: next: command not found", "Run npm install again (postinstall installs webapp deps)"],
                ["@prisma/client did not initialize yet", "npm run prisma:generate"],
                ["enum Role … not supported", "Switch provider to postgresql in prisma/schema.prisma"],
                ["Constant Authorization Required", "Pin a stable AUTH_SECRET in .env.development"],
                ["Uploads ending up in webapp/", "Storage paths resolve to the project root — see docs/storage"],
              ].map(([s, f]) => (
                <tr key={s} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-2 font-mono text-xs">{s}</td>
                  <td className="px-4 py-2">{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white/70 dark:bg-zinc-900/40">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium">
          {n}
        </span>
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
