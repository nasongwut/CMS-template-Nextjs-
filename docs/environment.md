# Environment Variables

Every env var the app reads, and where it's read.

## Application

| Var | Default | Read in | Notes |
|---|---|---|---|
| `NODE_ENV` | `development` | everywhere | Next.js will override to `development` for `next dev` and `production` for `next build`/`start` regardless of what's in the file |
| `APP_NAME` | `"Next.js + Storage"` | `lib/env.ts`, layout, page title | Used in the navbar and `<title>` |
| `APP_URL` | `http://localhost:3000` | not directly used today | Reserve for email links / OAuth callbacks |

## Auth / Sessions

| Var | Default | Required | Notes |
|---|---|---|---|
| `AUTH_SECRET` | `dev-secret-change-me…` | **yes in prod** | HMAC key for the JWT. Minimum 32 chars, ideally `openssl rand -base64 32` |
| `SESSION_COOKIE_NAME` | `app_session` | no | Name of the HttpOnly cookie carrying the JWT |
| `SESSION_MAX_AGE_SECONDS` | `604800` (7 days) | no | Lifetime of both the cookie and the JWT `exp` claim |

## Bootstrap admin (used by `db:seed`)

| Var | Default | Notes |
|---|---|---|
| `ADMIN_EMAIL` | `admin@example.com` | Account is only created if it doesn't already exist |
| `ADMIN_PASSWORD` | `Admin@1234` | Stored hashed (bcrypt, cost 10) |
| `ADMIN_NAME` | `Site Administrator` | Display name |

## Database

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | **yes** | Postgres connection string. Neon: include `sslmode=require&channel_binding=require` |

## Storage

| Var | Default | Notes |
|---|---|---|
| `STORAGE_DRIVER` | `local` | `local` or `s3` |
| `STORAGE_MAX_FILE_MB` | `25` | Hard cap; uploads above this return `413 file_too_large` |
| `STORAGE_LOCAL_PATH` | `./storage` | Relative paths are resolved against the **project root**, NOT `webapp/` |
| `STORAGE_LOCAL_PUBLIC_URL` | `/files` | Public prefix for the local URL written into the `File.url` column |
| `STORAGE_S3_BUCKET` | — | Required if driver is `s3` |
| `STORAGE_S3_REGION` | — | Required if driver is `s3` |
| `STORAGE_S3_ACCESS_KEY_ID` | — | Required if driver is `s3` |
| `STORAGE_S3_SECRET_ACCESS_KEY` | — | Required if driver is `s3` |
| `STORAGE_S3_ENDPOINT` | — | Optional — for MinIO, R2, custom endpoints |
| `STORAGE_S3_PUBLIC_URL` | — | Optional CDN/public URL prefix; otherwise the URL is constructed from bucket+region |

## Advanced

| Var | Effect |
|---|---|
| `STORAGE_PROJECT_ROOT` | Override the path that relative `STORAGE_LOCAL_PATH` values resolve against. Useful in container deployments where `INIT_CWD` may not be set. |
| `INIT_CWD` | Set automatically by npm to where the user invoked `npm run …`. Used as the storage base if `STORAGE_PROJECT_ROOT` is unset. |
