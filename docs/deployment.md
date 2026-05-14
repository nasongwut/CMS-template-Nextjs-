# Deployment

## Checklist before pushing to prod

- [ ] `.env.production` has a real `AUTH_SECRET` (32+ random bytes)
- [ ] `DATABASE_URL` points at a production Postgres (Neon / Supabase / RDS)
- [ ] `ADMIN_EMAIL`/`ADMIN_PASSWORD` set to something you control, OR seed disabled
- [ ] `STORAGE_DRIVER=s3` and the four `STORAGE_S3_*` keys set, **or** durable
      volume mounted where `STORAGE_LOCAL_PATH` resolves
- [ ] `npm run prisma:migrate:prod` has applied all migrations to the prod DB
- [ ] HTTPS in front (`Secure` cookie is automatic when `NODE_ENV=production`)

## Deploying to Vercel

1. Connect the repo. Set **Root directory** = the project root (the folder
   containing both `package.json` and `webapp/`).
2. Override the **Build command** with `npm run build`.
3. Override the **Output directory** with `webapp/.next`.
4. Set all production env vars in the Vercel dashboard (copy from
   `.env.production`). Vercel injects them at build + runtime — dotenv-cli is
   not needed there.
5. **Storage**: Vercel's filesystem is ephemeral. Use the `s3` driver, or a
   provider like Cloudflare R2 / Bunny / Backblaze B2.
6. **Database**: any external Postgres works. Neon / Supabase have a Vercel
   marketplace integration.

## Deploying with Docker

A minimal `Dockerfile` (place at the repo root):

```dockerfile
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY webapp/package*.json webapp/
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3000
# dotenv-cli ships with the repo so the same scripts work in the container
CMD ["npm", "run", "start"]
```

For Postgres, point `DATABASE_URL` at your external instance. For local
storage, mount a persistent volume at `<root>/storage/` and keep `local` as
the driver.

## Deploying to a VPS (PM2 / systemd)

```bash
# one-time
ssh user@host
git clone … && cd Nextjs\ +\ storage
npm install
npm run prisma:migrate:prod

# run with pm2
pm2 start npm --name webapp -- run start
pm2 save
```

PM2 picks up env from the system environment, so either:
- Run `pm2 start` from within the project root so dotenv-cli loads
  `.env.production`, **or**
- Bake env vars into the system unit file and skip dotenv-cli by running
  `next start` directly inside `webapp/`.

## Health check

There isn't a dedicated health endpoint by default — `/api/auth/me` is a
cheap probe that exercises the DB connection too:

```bash
curl -fsS https://your.app/api/auth/me  # returns {"user":null} when no cookie
```

If you want a no-DB health endpoint, drop:

```ts
// webapp/app/api/healthz/route.ts
export const runtime = "nodejs";
export function GET() { return new Response("ok"); }
```
