export interface IAvatarStorage {
  upload(userId: string, fileBuffer: Buffer, mimeType: string): Promise<string>;
  getUrl(userId: string): Promise<string | null>;
  delete(userId: string): Promise<void>;
}
