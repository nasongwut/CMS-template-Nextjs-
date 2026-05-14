# Architecture

## File layout

```
<root>/
├── package.json                  ← thin proxy; loads env then delegates to webapp
├── .env.development
├── .env.production
├── storage/                      ← uploaded files live here (gitignored)
│   └── dev/<userId>/<hash>.<ext>
└── webapp/                       ← the actual Next.js 16 app
    ├── prisma/
    │   ├── schema.prisma         ← User, Role, Folder, File
    │   └── seed.ts               ← bootstrap admin
    ├── lib/
    │   ├── env.ts                ← typed env access + isProd flag
    │   ├── prisma.ts             ← singleton PrismaClient (HMR-safe)
    │   ├── auth.ts               ← signSession / verifySession / require*
    │   └── storage/
    │       ├── index.ts          ← getStorage() driver factory
    │       ├── types.ts          ← StorageDriver interface
    │       ├── local.ts          ← filesystem implementation
    │       └── s3.ts             ← stub for AWS / Cloudflare R2 / MinIO
    ├── app/
    │   ├── layout.tsx            ← header / nav with role badge + Sign out
    │   ├── page.tsx              ← developer-template landing page
    │   ├── login / register / dashboard / files / admin
    │   ├── _components/
    │   │   └── logout-button.tsx ← client component used by the layout
    │   └── api/
    │       ├── auth/{login,register,logout,me}/route.ts
    │       ├── files/route.ts            ← list, upload
    │       ├── files/[id]/route.ts       ← download, delete
    │       ├── folders/route.ts          ← list, create
    │       ├── folders/[id]/route.ts     ← rename, delete (with cascade)
    │       └── admin/users/{route,[id]/route}.ts
    └── middleware.ts             ← Edge-runtime route protection
```

## Request lifecycle (signed-in user uploads a file)

```
Browser ─POST /api/files (multipart)─▶  middleware.ts
                                          │  (Edge runtime)
                                          │  • reads SESSION_COOKIE_NAME
                                          │  • verifies JWT via jose
                                          │  • if no role → redirect /login
                                          ▼
                                     app/api/files/route.ts  (Node.js runtime)
                                          │  • await requireUser()
                                          │    → reads cookie again, loads User
                                          │  • validates folderId ownership
                                          │  • storage.save({ buffer, … })
                                          │  • prisma.file.create({…})
                                          ▼
                                     local.ts (or s3.ts)
                                          • writes to <root>/storage/dev/<userId>/…
                                          ▼
                                     ← JSON { file: {…} }
```

The Edge middleware is **only** for redirecting unauthenticated traffic — it never
talks to the DB. Detailed role checks happen inside route handlers via
`requireUser()` and `requireRole(...)`, which DO touch the DB and confirm the
account is still active.

## Two runtimes, deliberately

| Layer | Runtime | Why |
|---|---|---|
| `middleware.ts` | Edge | Fast cookie verification on every request, no Node APIs needed |
| `app/api/**/route.ts` | Node.js (`export const runtime = "nodejs"`) | Prisma + `fs` + buffers require the Node runtime |
| RSC pages | Node.js | They call `getCurrentUser()` and Prisma directly |

## Env loading order

```
user runs `npm run dev`
   └─ root/package.json: dotenv -e .env.development -- npm --prefix webapp run next:dev
        └─ dotenv-cli sets process.env from .env.development
             └─ npm --prefix webapp: runs `next dev` with INIT_CWD=<root>
                  └─ Next.js auto-loads .env files from webapp/ (finds none — fine)
                  └─ process.env already has every value from .env.development
```

Because dotenv-cli runs **before** Next.js, the values are present when
`lib/env.ts` evaluates, when Prisma reads `DATABASE_URL`, and when middleware
verifies the JWT.

## Key data model relationships

```
User 1──< Folder 1──< File
User 1──< File          (folderId can be null = "root" view)
```

Cascades:

| Action | Effect |
|---|---|
| Delete `User` | Cascades → all `Folder` and `File` rows for that user |
| Delete `Folder` | Files inside have `folderId` set to NULL (`onDelete: SetNull`) |
| Folder API DELETE w/ cascade=1 (default) | API also deletes the files inside, both DB rows and storage blobs |
