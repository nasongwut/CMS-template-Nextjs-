import { env } from "../env";
import { localDriver } from "./local";
import { s3Driver } from "./s3";
import type { StorageDriver } from "./types";

export type { StorageDriver, SaveInput, SavedFile } from "./types";

let cached: StorageDriver | null = null;

export function getStorage(): StorageDriver {
  if (cached) return cached;
  switch (env.storage.driver) {
    case "s3":
      cached = s3Driver;
      break;
    case "local":
    default:
      cached = localDriver;
      break;
  }
  return cached;
}

export function maxUploadBytes(): number {
  return env.storage.maxFileMb * 1024 * 1024;
}
