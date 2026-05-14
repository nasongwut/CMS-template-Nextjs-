import CodeBlock from "../_components/code-block";

export default function StorageDocsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Concept
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">Storage drivers</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-3xl">
          A single <code className="font-mono">StorageDriver</code> interface
          backed today by a local-filesystem driver and an S3 stub. The active
          driver is picked at runtime by{" "}
          <code className="font-mono">STORAGE_DRIVER</code>.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-medium">Interface</h2>
        <CodeBlock
          lang="ts"
          code={`interface StorageDriver {
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
}`}
        />
        <CodeBlock
          lang="ts"
          code={`// usage
const storage = getStorage();             // picks once based on STORAGE_DRIVER
const saved = await storage.save({ buffer, filename, mimeType, ownerId });`}
        />
      </section>

      <section>
        <h2 className="text-xl font-medium">Local driver</h2>
        <ul className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
          <li>Files saved to <code className="font-mono">&lt;projectRoot&gt;/&lt;STORAGE_LOCAL_PATH&gt;/&lt;ownerId&gt;/&lt;random&gt;.&lt;ext&gt;</code></li>
          <li>Project root is determined in order: <code className="font-mono">STORAGE_PROJECT_ROOT</code> → <code className="font-mono">INIT_CWD</code> → one level above <code className="font-mono">process.cwd()</code></li>
          <li><code className="font-mono">File.url</code> = <code className="font-mono">{`<STORAGE_LOCAL_PUBLIC_URL>/<key>`}</code> — downloads still go through <code className="font-mono">/api/files/:id</code> for permission checks</li>
        </ul>
        <CodeBlock
          title="example resolution"
          code={`.env.development
  STORAGE_LOCAL_PATH=./storage/dev
                       ↓
<root>/storage/dev/clx0…<userId>/9f3e…hash.docx`}
        />
        <p className="text-sm text-zinc-500 mt-2">
          Storage is intentionally not served from <code className="font-mono">/public</code>{" "}
          — that would bypass RBAC. Going through{" "}
          <code className="font-mono">/api/files/:id</code> ensures the cookie is
          checked first.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-medium">S3 driver</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Currently a stub — every method throws. Activate it in three steps:
        </p>
        <CodeBlock
          lang="bash"
          code={`# 1. install the AWS SDK
npm --prefix webapp install @aws-sdk/client-s3

# 2. fill in the s3 env keys in .env.production:
#    STORAGE_DRIVER=s3
#    STORAGE_S3_BUCKET, STORAGE_S3_REGION,
#    STORAGE_S3_ACCESS_KEY_ID, STORAGE_S3_SECRET_ACCESS_KEY

# 3. replace notImplemented() calls in lib/storage/s3.ts`}
        />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">
          A working skeleton:
        </p>
        <CodeBlock
          lang="ts"
          code={`import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand }
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
    const key = \`\${ownerId}/\${id}\${path.extname(filename)}\`;
    await client.send(new PutObjectCommand({
      Bucket: env.storage.s3.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));
    const publicUrl = env.storage.s3.publicUrl ||
      \`https://\${env.storage.s3.bucket}.s3.\${env.storage.s3.region}.amazonaws.com\`;
    return { key, url: \`\${publicUrl}/\${key}\`, driver: "s3", size: buffer.byteLength };
  },
  async read(key) { /* GetObjectCommand */ },
  async delete(key) { /* DeleteObjectCommand */ },
};`}
        />
      </section>

      <section>
        <h2 className="text-xl font-medium">Writing your own driver</h2>
        <ol className="list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
          <li>Create <code className="font-mono">webapp/lib/storage/your-driver.ts</code></li>
          <li>Export an object implementing <code className="font-mono">StorageDriver</code></li>
          <li>Add it to the factory in <code className="font-mono">webapp/lib/storage/index.ts</code></li>
          <li>Add the driver value to the union in <code className="font-mono">lib/env.ts</code></li>
          <li>Document its env vars in the env reference</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-medium">Migrating between drivers</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          There is no built-in migrator. A small script does the trick:
        </p>
        <CodeBlock
          lang="ts"
          code={`// scripts/migrate-storage.ts
import { prisma } from "@/lib/prisma";
import { localDriver } from "@/lib/storage/local";
import { s3Driver }    from "@/lib/storage/s3";

const files = await prisma.file.findMany({ where: { driver: "local" } });
for (const f of files) {
  const { stream } = await localDriver.read(f.key);
  // → buffer
  // → s3Driver.save(...)
  // → update f.driver / f.key / f.url
}`}
        />
      </section>
    </div>
  );
}
