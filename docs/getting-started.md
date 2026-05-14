# Getting Started

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20.19 / 22.13 / 24 | Required by eslint 9 plugins; older 20.x will warn but still run |
| npm | ≥ 10 | Comes with Node |
| PostgreSQL | 14+ | Local, Neon, Supabase, or RDS all work |

The project does **not** support SQLite because the Prisma schema uses an `enum` (`Role`) which SQLite cannot store.

## 2. Install

```bash
git clone <your-repo> && cd "Nextjs + storage"
npm install   # installs dotenv-cli at root + all webapp deps via postinstall
```

If `postinstall` doesn't run for some reason:

```bash
npm run install:app
```

## 3. Configure `.env`

Two files at the **root** (not inside `webapp/`):

```
.env.development    # used by `npm run dev`, prisma:migrate, db:seed
.env.production     # used by `npm run build`, `npm run start`, *:prod
```

Minimum required keys (see [environment.md](./environment.md) for the full list):

```env
# .env.development
NODE_ENV=development
AUTH_SECRET="dev-secret-please-change-32-chars-minimum"
DATABASE_URL="postgresql://user:pass@localhost:5432/appdb?schema=public"
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./storage/dev
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@1234
```

Generate a real auth secret:

```bash
openssl rand -base64 32
```

## 4. Run the database migrations

```bash
npm run prisma:generate     # produces @prisma/client typings
npm run prisma:migrate      # creates User / Folder / File tables
npm run db:seed             # creates the bootstrap admin
```

The seed script reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` from the
loaded env file and skips creation if a user with that email already exists.

## 5. Start the dev server

```bash
npm run dev
```

→ http://localhost:3000

Sign in with the seeded admin credentials, then change the password from the
admin console at `/admin`.

## 6. Going to production

```bash
# Fill .env.production with real values first
npm run prisma:migrate:prod   # applies migrations to prod DB (uses `prisma migrate deploy`)
npm run db:seed:prod          # optional — creates initial admin in prod DB
npm run build                 # builds Next.js with .env.production
npm run start                 # runs the production server
```

See [deployment.md](./deployment.md) for hosting-specific notes.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `sh: next: command not found` | Webapp deps not installed yet | Run `npm install` (triggers webapp install via postinstall) |
| `@prisma/client did not initialize yet` | Schema changed but client not regenerated | `npm run prisma:generate` |
| `enum Role … the current connector does not support enums` | Provider set to `sqlite` | Switch `provider` to `postgresql` (or `mysql`) in `prisma/schema.prisma` |
| `Authorization Required` on every request | `AUTH_SECRET` differs between sessions/restarts | Pin a stable secret in `.env.development` |
| Uploads not appearing | `STORAGE_LOCAL_PATH` resolves into `webapp/` | The storage driver resolves relative paths against the **project root**, see [storage.md](./storage.md) |
