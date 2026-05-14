/**
 * Lower-level storage helpers that don't go through the `prisma.file` table.
 * Used for:
 *   - Public images attached to /about content (uploaded by admin)
 *   - CV / photo / portfolio files attached to job applications
 *
 * We still funnel everything through the StorageDriver (local or s3), but we
 * pick the "key" ourselves so different content types live in tidy folders
 * (`public/about/`, `careers/<applicationId>/`, …) and we can build the public
 * URL accordingly.
 */
import path from "node:path";
import crypto from "node:crypto";
import { promises as fs, createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { env } from "../env";
import { getStorage } from "./index";

/** Public folder prefix for assets that anyone can fetch (about images, etc). */
export const PUBLIC_PREFIX = "public";

/** Folder prefix for job-application files (admin-only download). */
export const CAREERS_PREFIX = "careers";

function safeExt(name: string): string {
  const ext = path.extname(name).toLowerCase();
  if (!ext) return "";
  if (!/^\.[a-z0-9]{1,8}$/.test(ext)) return "";
  return ext;
}

function newId(): string {
  return crypto.randomBytes(12).toString("hex");
}

/** Resolve the on-disk root for the local driver — mirrors local.ts logic. */
function resolveLocalRoot(): string {
  const p = env.storage.local.path || "./storage";
  if (path.isAbsolute(p)) return p;
  const explicit = process.env.STORAGE_PROJECT_ROOT;
  const initCwd = process.env.INIT_CWD;
  const base =
    explicit && path.isAbsolute(explicit)
      ? explicit
      : initCwd && path.isAbsolute(initCwd)
        ? initCwd
        : path.resolve(process.cwd(), "..");
  return path.resolve(base, p);
}

interface SaveRawInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  /** Folder prefix inside the bucket (no leading or trailing slash). */
  prefix: string;
}

export interface SavedRawFile {
  key: string;
  url: string;
  driver: "local" | "s3";
  size: number;
  mimeType: string;
  filename: string;
}

/**
 * Save a buffer at <prefix>/<random>.<ext> via the configured driver.
 * Returns a `url` that is browser-fetchable:
 *   - local  → /uploads/<key>  (served by app/uploads/[...path]/route.ts)
 *   - s3     → driver.url (already public if bucket is public)
 */
export async function saveRaw({
  buffer,
  filename,
  mimeType,
  prefix,
}: SaveRawInput): Promise<SavedRawFile> {
  const ext = safeExt(filename);
  const id = newId();
  const key = path.posix.join(prefix, `${id}${ext}`);

  if (env.storage.driver === "s3") {
    // The S3 driver builds its own key from ownerId — to keep our custom
    // folder structure we go through it but pass `ownerId = prefix`.
    const storage = getStorage();
    const saved = await storage.save({
      buffer,
      filename,
      mimeType,
      ownerId: prefix, // becomes part of the key in s3Driver
    });
    return {
      key: saved.key,
      url: saved.url ?? "",
      driver: "s3",
      size: saved.size,
      mimeType,
      filename,
    };
  }

  // Local: write directly so we control the exact key.
  const root = resolveLocalRoot();
  const full = path.join(root, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buffer);

  return {
    key,
    url: `/uploads/${key}`,
    driver: "local",
    size: buffer.byteLength,
    mimeType,
    filename,
  };
}

/**
 * Stream a file back. Used by:
 *   - /uploads/[...path]  (public, only for keys under `public/`)
 *   - /api/admin/careers/files/[id]  (admin-only)
 */
export async function readRaw(key: string): Promise<{
  stream: ReadableStream;
  size: number;
}> {
  if (env.storage.driver === "s3") {
    const storage = getStorage();
    return storage.read(key);
  }
  const full = path.join(resolveLocalRoot(), key);
  const stat = await fs.stat(full);
  const node = createReadStream(full);
  const stream = Readable.toWeb(node) as unknown as ReadableStream;
  return { stream, size: stat.size };
}

export async function deleteRaw(key: string): Promise<void> {
  if (env.storage.driver === "s3") {
    const storage = getStorage();
    await storage.delete(key);
    return;
  }
  const full = path.join(resolveLocalRoot(), key);
  await fs.rm(full, { force: true });
}

/** Allowed MIME types for image uploads. */
export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

/** Allowed MIME types for CV / document uploads. */
export const DOC_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
