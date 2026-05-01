import type { SecurityHold, SecurityHoldStatus, SubmitHoldResponseDto } from '../services/security/security.types.js';

export interface ISecurityService {
  getHold(holdId: string): Promise<SecurityHold>;
  getHoldStatus(holdId: string): Promise<SecurityHoldStatus>;
  uploadDocument(holdId: string, path: string, fileBuffer: Buffer, contentType: string): Promise<string>;
  submitResponse(holdId: string, dto: SubmitHoldResponseDto, email: string): Promise<void>;
}
