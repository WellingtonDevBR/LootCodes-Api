export interface IStorageProvider {
  createSignedUrl(bucket: string, path: string, expiresInSeconds: number): Promise<string>;
}
