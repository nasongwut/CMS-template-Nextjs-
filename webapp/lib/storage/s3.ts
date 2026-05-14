/**
 * Minimal S3 driver stub.
 *
 * Implementing this fully requires the AWS SDK (`@aws-sdk/client-s3`).
 * To keep dependencies light we only stub the surface — flip STORAGE_DRIVER=s3
 * once you've installed `@aws-sdk/client-s3` and finished the TODOs below.
 */
import { env } from "../env";
import type { StorageDriver, SaveInput, SavedFile } from "./types";

function notImplemented(): never {
  throw new Error(
    "S3 storage driver is not fully implemented. " +
      "Install @aws-sdk/client-s3 and complete lib/storage/s3.ts, " +
      "or switch STORAGE_DRIVER=local in your .env file."
  );
}

export const s3Driver: StorageDriver = {
  name: "s3",

  async save(_input: SaveInput): Promise<SavedFile> {
    // TODO: implement with @aws-sdk/client-s3 PutObjectCommand
    void env;
    notImplemented();
  },

  async read(_key: string) {
    notImplemented();
  },

  async delete(_key: string) {
    notImplemented();
  },
};
