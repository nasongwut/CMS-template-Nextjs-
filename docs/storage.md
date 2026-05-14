# Storage

## Driver interface

Every backend implements the same surface (`webapp/lib/storage/types.ts`):

```ts
interface StorageDriver {
  readonly name: "local" | "s3";
  save(input: SaveInput): Promise<SavedFile>;
  read(key: string): Promise<{ stream: ReadableStream; size: number; mimeType?: string }>;
  delete(key: string): Promise<void>;
}

interface SaveInput {
  buffer:   Buffer;
  filename: string;        // original
  mimeType: string;
  ownerId:  string;        // used to namespace the key
}

interface SavedFile {
  key:    string;          // backend storage key/path
  url:    string | null;   // public URL, or null
  driver: "local" | "s3";
  size:   number;
}
```

The factory at `webapp/lib/storage/index.ts` picks a driver at runtime:

```ts
const storage = getStorage();           // reads STORAGE_DRIVER once
const saved = await storage.save({ buffer, filename, mimeType, ownerId });
```

## `local` driver

- File contents go to `<projectRoot>/<STORAGE_LOCAL_PATH>/<ownerId>/<random>.<ext>`
- `<projectRoot>` is determined by, in order:
  1. `STORAGE_PROJECT_ROOT` env var (must be absolute)
  2. `INIT_CWD` env var (npm sets this to where you ran `npm run …`)
  3. One level above `process.cwd()` (assumes `next` runs in `webapp/`)
- The `File.url` column is `"<STORAGE_LOCAL_PUBLIC_URL>/<key>"` so downloads
  still go through `/api/files/:id` for permission checks.

### Where files end up
```
.env.development
  STORAGE_LOCAL_PATH=./storage/dev
                       ↓
<root>/storage/dev/clx0…<userId>/9f3e…hash.docx
```

### Why not let `next` serve files from `/public`?
Serving from `/public` skips all RBAC. Going through `/api/files/:id`
guarantees we verify the cookie, look up ownership, and only stream the bytes
if the caller is allowed.

## `s3` driver

Currently a **stub** — every method throws "not implemented". To activate it:

1. `npm --prefix webapp install @aws-sdk/client-s3`
2. Open `webapp/lib/storage/s3.ts` and replace `notImplemented()` calls with
   `PutObjectCommand` / `GetObjectCommand` / `DeleteObjectCommand`.
3. Set the env vars (see [environment.md](./environment.md)).

A working implementation skeleton:

```ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand }
  from "@aws-sdk/client-s3";

const client = new S3Client({
  region: env.storage.s3.region,
  endpoint: env.storage.s3.endpoint || undefined,
  credentials: {
    accessKeyId: env.storage.s3.accessKeyId,
    secretAccessKey: env.storage.s3.secretAccessKey,
  },
});

export const s3Driver: StorageDriver = {
  name: "s3",
  async save({ buffer, filename, mimeType, ownerId }) {
    const id = crypto.randomBytes(12).toString("hex");
    const key = `${ownerId}/${id}${path.extname(filename)}`;
    await client.send(new PutObjectCommand({
      Bucket: env.storage.s3.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));
    const publicUrl = env.storage.s3.publicUrl ||
      `https://${env.storage.s3.bucket}.s3.${env.storage.s3.region}.amazonaws.com`;
    return { key, url: `${publicUrl}/${key}`, driver: "s3", size: buffer.byteLength };
  },
  async read(key) {
    const out = await client.send(new GetObjectCommand({
      Bucket: env.storage.s3.bucket,
      Key: key,
    }));
    return {
      stream: out.Body as unknown as ReadableStream,
      size: Number(out.ContentLength ?? 0),
      mimeType: out.ContentType,
    };
  },
  async delete(key) {
    await client.send(new DeleteObjectCommand({
      Bucket: env.storage.s3.bucket,
      Key: key,
    }));
  },
};
```

## Writing your own driver

1. Create `webapp/lib/storage/your-driver.ts` exporting an object that
   implements `StorageDriver`.
2. Add the driver to the factory in `webapp/lib/storage/index.ts`:
   ```ts
   case "yours":
     cached = yoursDriver;
     break;
   ```
3. Add the driver value to the `STORAGE_DRIVER` union in `lib/env.ts`.
4. Document its env vars in `docs/environment.md`.

## Migrating between drivers

There's no built-in migrator. If you need to move from `local` → `s3`:

```ts
// scripts/migrate-storage.ts
import { prisma } from "@/lib/prisma";
import { localDriver } from "@/lib/storage/local";
import { s3Driver }    from "@/lib/storage/s3";

const files = await prisma.file.findMany({ where: { driver: "local" } });
for (const f of files) {
  const { stream } = await localDriver.read(f.key);
  // convert stream → buffer, then s3Driver.save(...)
  // update f.driver/key/url
}
```
