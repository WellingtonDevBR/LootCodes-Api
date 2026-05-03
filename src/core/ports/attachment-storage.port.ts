export interface IAttachmentStorage {
  upload(ticketId: string, fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  uploadPreTicket(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  getSignedUrl(path: string, bucket?: string): Promise<string>;
}
