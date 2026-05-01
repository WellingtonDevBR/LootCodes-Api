export interface IVerificationStorage {
  upload(path: string, fileBuffer: Buffer, contentType: string): Promise<string>;
}
