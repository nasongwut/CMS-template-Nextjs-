import { promises as fs, createReadStream } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { env } from "../env";
import type { StorageDriver, SaveInput, SavedFile } from "./types";

/**
 * Resolve the storage root.
 *
 *  - Absolute path in .env       → used as-is.
 *  - STORAGE_PROJECT_ROOT in env → used as the base (set by root scripts).
 *  - Otherwise                   → one level above `process.cwd()`, i.e. the
 *                                  folder that contains `webapp/`.
 *
 * The goal: `STORAGE_LOCAL_PATH=./storage/dev` always lands at
 * `<project-root>/storage/dev/`, never inside `webapp/`.
 */
function resolveRoot(): string {
  const p = env.storage.local.path || "./storage";
  if (path.isAbsolute(p)) return p;
  // Prefer explicit STORAGE_PROJECT_ROOT, then npm's INIT_CWD (the dir where
  // the user actually ran `npm run …`), then fall back to one-level-up from
  // process.cwd() (which assumes next is running inside `webapp/`).
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

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

function safeExt(name: string): string {
  const ext = path.extname(name).toLowerCase();
  if (!ext) return "";
  if (!/^\.[a-z0-9]{1,8}$/.test(ext)) return "";
  return ext;
}

export const localDriver: StorageDriver = {
  name: "local",

  async save({ buffer, filename, ownerId }: SaveInput): Promise<SavedFile> {
    const root = resolveRoot();
    const ownerDir = path.join(root, ownerId);
    await ensureDir(ownerDir);

    const id = crypto.randomBytes(12).toString("hex");
    const ext = safeExt(filename);
    const key = path.posix.join(ownerId, `${id}${ext}`);
    const full = path.join(root, key);
    await fs.writeFile(full, buffer);

    const publicPrefix = env.storage.local.publicUrl.replace(/\/$/, "");
    return {
      key,
      url: `${publicPrefix}/${key}`,
      driver: "local",
      size: buffer.byteLength,
    };
  },

  async read(key) {
    const full = path.join(resolveRoot(), key);
    const stat = await fs.stat(full);
    const node = createReadStream(full);
    // Convert Node stream to Web ReadableStream
    const stream = Readable.toWeb(node) as unknown as ReadableStream;
    return { stream, size: stat.size };
  },

  async delete(key) {
    const full = path.join(resolveRoot(), key);
    await fs.rm(full, { force: true });
  },
};
