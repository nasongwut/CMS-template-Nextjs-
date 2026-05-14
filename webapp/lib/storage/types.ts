export interface SaveInput {
  buffer: Buffer;
  filename: string;       // user-supplied original filename
  mimeType: string;
  ownerId: string;        // used to namespace the key
}

export interface SavedFile {
  key: string;            // backend storage key/path
  url: string | null;     // public URL or null if not directly servable
  driver: "local" | "s3";
  size: number;
}

export interface StorageDriver {
  readonly name: "local" | "s3";
  save(input: SaveInput): Promise<SavedFile>;
  read(key: string): Promise<{ stream: ReadableStream; size: number; mimeType?: string }>;
  delete(key: string): Promise<void>;
}
