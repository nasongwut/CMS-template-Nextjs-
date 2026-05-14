export default function EnvDocsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Configuration
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">
          Environment variables
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-3xl">
          Every env var the app reads, organised by area. Both{" "}
          <code className="font-mono">.env.development</code> and{" "}
          <code className="font-mono">.env.production</code> live at the project
          root.
        </p>
      </header>

      <Section title="Application">
        <EnvRow name="NODE_ENV" def="development" req={false} desc="Auto-set by Next.js for dev/build. The value in the file is honored elsewhere." />
        <EnvRow name="APP_NAME" def={`"Next.js + Storage"`} req={false} desc="Shown in the nav and document title" />
        <EnvRow name="APP_URL" def="http://localhost:3000" req={false} desc="Reserved for email links, OAuth callbacks, etc." />
      </Section>

      <Section title="Auth / sessions">
        <EnvRow name="AUTH_SECRET" def="—" req desc="HMAC key for the JWT. Use openssl rand -base64 32." />
        <EnvRow name="SESSION_COOKIE_NAME" def="app_session" req={false} desc="Name of the HttpOnly cookie carrying the JWT" />
        <EnvRow name="SESSION_MAX_AGE_SECONDS" def="604800" req={false} desc="Cookie + JWT exp lifetime (7 days default)" />
      </Section>

      <Section title="Bootstrap admin (used by db:seed)">
        <EnvRow name="ADMIN_EMAIL" def="admin@example.com" req={false} desc="Only created if not already in the DB" />
        <EnvRow name="ADMIN_PASSWORD" def="Admin@1234" req={false} desc="Hashed with bcrypt at seed time" />
        <EnvRow name="ADMIN_NAME" def="Site Administrator" req={false} desc="Display name" />
      </Section>

      <Section title="Database">
        <EnvRow name="DATABASE_URL" def="—" req desc="Postgres connection string. Neon: append sslmode=require&channel_binding=require" />
      </Section>

      <Section title="Storage">
        <EnvRow name="STORAGE_DRIVER" def="local" req={false} desc='"local" or "s3"' />
        <EnvRow name="STORAGE_MAX_FILE_MB" def="25" req={false} desc="Hard upload cap (413 file_too_large)" />
        <EnvRow name="STORAGE_LOCAL_PATH" def="./storage" req={false} desc="Resolved relative to PROJECT ROOT, not webapp/" />
        <EnvRow name="STORAGE_LOCAL_PUBLIC_URL" def="/files" req={false} desc="Public URL prefix written into File.url" />
        <EnvRow name="STORAGE_S3_BUCKET" def="—" req={false} desc="Required when STORAGE_DRIVER=s3" />
        <EnvRow name="STORAGE_S3_REGION" def="—" req={false} desc="Required when STORAGE_DRIVER=s3" />
        <EnvRow name="STORAGE_S3_ACCESS_KEY_ID" def="—" req={false} desc="Required when STORAGE_DRIVER=s3" />
        <EnvRow name="STORAGE_S3_SECRET_ACCESS_KEY" def="—" req={false} desc="Required when STORAGE_DRIVER=s3" />
        <EnvRow name="STORAGE_S3_ENDPOINT" def="—" req={false} desc="Optional — for MinIO, R2, custom endpoints" />
        <EnvRow name="STORAGE_S3_PUBLIC_URL" def="—" req={false} desc="Optional CDN / public URL prefix" />
      </Section>

      <Section title="Advanced">
        <EnvRow name="STORAGE_PROJECT_ROOT" def="—" req={false} desc="Absolute path override for the storage base. Useful in containers." />
        <EnvRow name="INIT_CWD" def="set by npm" req={false} desc="Where you ran `npm run …`. Used as storage base when STORAGE_PROJECT_ROOT is unset." />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/70 dark:bg-zinc-900/40">
      <h2 className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 font-medium">
        {title}
      </h2>
      <table className="w-full text-sm">
        <thead className="bg-zinc-50/60 dark:bg-zinc-900/60 text-left text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-5 py-2 w-64">Name</th>
            <th className="px-5 py-2 w-40">Default</th>
            <th className="px-5 py-2 w-24">Required</th>
            <th className="px-5 py-2">Description</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </section>
  );
}

function EnvRow({
  name,
  def,
  req,
  desc,
}: {
  name: string;
  def: string;
  req: boolean;
  desc: string;
}) {
  return (
    <tr className="border-t border-zinc-200 dark:border-zinc-800">
      <td className="px-5 py-2 font-mono">{name}</td>
      <td className="px-5 py-2 font-mono text-zinc-500">{def}</td>
      <td className="px-5 py-2">
        {req ? (
          <span className="text-xs text-rose-600 dark:text-rose-400">yes</span>
        ) : (
          <span className="text-xs text-zinc-500">no</span>
        )}
      </td>
      <td className="px-5 py-2 text-zinc-600 dark:text-zinc-400">{desc}</td>
    </tr>
  );
}
