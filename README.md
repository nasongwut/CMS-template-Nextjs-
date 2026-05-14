# Next.js + Storage

📚 **Developer docs**: [`docs/README.md`](./docs/README.md) — full guides for
[setup](./docs/getting-started.md),
[architecture](./docs/architecture.md),
[env vars](./docs/environment.md),
[auth](./docs/auth.md),
[RBAC](./docs/rbac.md),
[database](./docs/database.md),
[storage drivers](./docs/storage.md),
[API reference with example payloads](./docs/api.md),
[frontend tour](./docs/frontend.md),
and [deployment](./docs/deployment.md).

A Next.js 16 starter with:

- Run from the **root** folder: `npm install && npm run dev`
- **All `.env` files live at the root** — they are loaded into `webapp/` by every script
- **Membership system** with Prisma — roles: `ADMIN`, `USER`, `GUEST`
- **Pluggable storage** chosen via `STORAGE_DRIVER` in `.env`
  - `local` — filesystem
  - `s3` — stub, install `@aws-sdk/client-s3` and complete `webapp/lib/storage/s3.ts`

## Layout

```
.
├── .env.development      ← used by `npm run dev` / prisma:migrate / db:seed
├── .env.production       ← used by `npm run build` / `npm run start` / *:prod
├── package.json          ← root scripts (load env, then proxy into ./webapp)
└── webapp/
    ├── prisma/
    │   ├── schema.prisma ← User + File models
    │   └── seed.ts       ← creates the bootstrap admin
    ├── lib/
    │   ├── env.ts        ← typed env access
    │   ├── auth.ts       ← JWT session + bcrypt helpers
    │   ├── prisma.ts
    │   └── storage/      ← local + s3 drivers + factory
    ├── app/
    │   ├── api/auth/...
    │   ├── api/files/...
    │   ├── api/admin/users/...
    │   ├── login, register, dashboard, files, admin pages
    │   └── layout.tsx, page.tsx
    ├── middleware.ts     ← protects /dashboard /files /admin
    └── package.json      ← bare scripts (env is pre-loaded by root)
```

## How env loading works

Root scripts use **dotenv-cli** to load the right env file at the root, then
spawn `next` / `prisma` with that env:

```
dev    →  .env.development
build  →  .env.production
start  →  .env.production
```

Because env is pre-loaded into `process.env` before Next.js boots, Next.js'
own loader treats them as already-set and doesn't override.

## First-time setup

```bash
# from this folder (root)
# 1. Set a real DATABASE_URL in .env.development (Postgres — Neon / Supabase / local).
npm install                 # installs root (dotenv-cli) + webapp (via postinstall)
npm run prisma:generate     # generates @prisma/client from schema
npm run prisma:migrate      # creates tables via `prisma migrate dev`
npm run db:seed             # creates the bootstrap admin from ADMIN_* in .env.development
npm run dev                 # http://localhost:3000
```

> Database must be PostgreSQL (or MySQL with a provider change). SQLite is not
> supported because the schema uses an `enum` for the user role.

Default admin (development): `admin@example.com` / `Admin@1234` — change after first login.

## Common commands (all run from root)

| Command                       | Env file            |
|-------------------------------|---------------------|
| `npm run dev`                 | `.env.development`  |
| `npm run build`               | `.env.production`   |
| `npm run start`               | `.env.production`   |
| `npm run prisma:migrate`      | `.env.development`  |
| `npm run prisma:migrate:prod` | `.env.production`   |
| `npm run prisma:studio`       | `.env.development`  |
| `npm run db:seed`             | `.env.development`  |
| `npm run db:seed:prod`        | `.env.production`   |

## Storage configuration (in `.env.*`)

```env
STORAGE_DRIVER=local          # or s3
STORAGE_LOCAL_PATH=./storage/dev
STORAGE_LOCAL_PUBLIC_URL=/files
STORAGE_MAX_FILE_MB=25

# only if STORAGE_DRIVER=s3
STORAGE_S3_BUCKET=...
STORAGE_S3_REGION=...
STORAGE_S3_ACCESS_KEY_ID=...
STORAGE_S3_SECRET_ACCESS_KEY=...
STORAGE_S3_ENDPOINT=          # optional (MinIO, R2)
STORAGE_S3_PUBLIC_URL=        # optional CDN/public prefix
```

The driver is read at runtime via `lib/storage/index.ts → getStorage()`, so swapping
backends needs only an env change + redeploy (and S3 SDK install for `s3`).

## Roles

| Role    | Can sign in | Manage own files | Manage all files / users |
|---------|-------------|------------------|--------------------------|
| ADMIN   | ✓           | ✓                | ✓                        |
| USER    | ✓           | ✓                |                          |
| GUEST   | ✓           |                  |                          |

Promote users by going to **/admin** as an admin, or use `POST /api/admin/users` /
`PATCH /api/admin/users/:id` directly.

## API reference

```
POST   /api/auth/register     { email, password, name? }
POST   /api/auth/login        { email, password }
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/files             # own files (USER) or all (ADMIN)
POST   /api/files             # multipart, field "file"
GET    /api/files/:id         # download
DELETE /api/files/:id

GET    /api/admin/users       # admin only
POST   /api/admin/users       # admin: create a user with a role
PATCH  /api/admin/users/:id   # admin: change role / activate / set password
DELETE /api/admin/users/:id   # admin
```

## Notes on relative paths

`STORAGE_LOCAL_PATH=./storage/dev` is resolved relative to where `next` runs
(`webapp/`), so files end up under `webapp/storage/dev/`. That folder is gitignored.
