# Developer Documentation

Welcome to the Next.js + Storage starter docs.

| Doc | What's inside |
|---|---|
| [Getting Started](./getting-started.md) | Install, configure `.env`, run dev / build |
| [Architecture](./architecture.md) | Project layout, request lifecycle, key modules |
| [Environment Variables](./environment.md) | Every supported env var and its effect |
| [Authentication](./auth.md) | JWT cookie session, password hashing, middleware |
| [Roles & Permissions (RBAC)](./rbac.md) | ADMIN / USER / GUEST, route protection patterns |
| [Database (Prisma)](./database.md) | Schema, migrations, swapping providers |
| [Storage](./storage.md) | Driver model, `local` and `s3`, writing a new driver |
| [API Reference](./api.md) | Every endpoint with example payloads (curl + fetch + JS) |
| [Frontend Tour](./frontend.md) | Pages, layout, client components |
| [Deployment](./deployment.md) | Production checklist & common hosts |

## Conventions used in these docs

- **`<root>`** = the folder that contains both `package.json` (root) and `webapp/`.
- All `npm run` commands are executed from `<root>`.
- Code blocks marked with `# .env.development` are excerpts of that env file.
- JSON responses use `…` to elide unimportant fields.
