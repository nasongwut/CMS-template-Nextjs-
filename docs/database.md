# Database (Prisma)

## Schema overview

```prisma
enum Role { ADMIN, USER, GUEST }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  role         Role     @default(USER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  files        File[]
  folders      Folder[]
}

model Folder {
  id        String   @id @default(cuid())
  name      String
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  files     File[]
  createdAt DateTime @default(now())
  @@unique([ownerId, name])
}

model File {
  id        String   @id @default(cuid())
  key       String   @unique         // path/key in the storage backend
  name      String                   // original filename
  mimeType  String
  size      Int
  driver    String                   // "local" or "s3"
  url       String?
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  folderId  String?
  folder    Folder?  @relation(fields: [folderId], references: [id], onDelete: SetNull)
  createdAt DateTime @default(now())
}
```

## Why PostgreSQL?

The schema uses an `enum` (`Role`). SQLite cannot store enums, so the
provider must be `postgresql` (or `mysql`). If you absolutely need SQLite,
change `role Role` to `role String @default("USER")` and add an application-
level check.

## Switching providers

1. Edit `prisma/schema.prisma`:
   ```prisma
   datasource db { provider = "mysql"  url = env("DATABASE_URL") }
   ```
2. Update `DATABASE_URL` in `.env.development` / `.env.production`.
3. `npm run prisma:migrate` (will create new migration history).

## Common commands

```bash
npm run prisma:generate      # rebuild @prisma/client typings
npm run prisma:migrate       # create + apply a new migration (dev)
npm run prisma:migrate:prod  # apply pending migrations (deploy mode)
npm run prisma:studio        # open Prisma Studio in your browser
npm run db:seed              # run prisma/seed.ts (creates bootstrap admin)
```

## Adding a new field

```bash
# 1. Edit prisma/schema.prisma — add `bio String?` to User
# 2. Create a migration with a name
npm run prisma:migrate -- --name add_user_bio
# 3. Code that reads User now has the new field typed automatically
```

## Reading & writing — best practices

- **Always import from `@/lib/prisma`** to use the singleton instance:
  ```ts
  import { prisma } from "@/lib/prisma";
  ```
- Use the typed `select` / `include` arguments to avoid pulling huge rows.
- Wrap multi-step writes in `prisma.$transaction([...])` to keep them atomic
  (see the folder cascade delete for an example).

## Reset / wipe

```bash
# Drops all tables and re-applies migrations from scratch — dev DB only!
cd webapp
npx prisma migrate reset
```
