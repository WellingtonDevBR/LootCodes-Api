export interface VerificationQuestion {
  id: string;
  type: 'text' | 'choice';
  text: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  minLength?: number;
}

export interface VerificationEvidence {
  id: string;
  type: 'file' | 'file_optional';
  text: string;
  instructions: string;
  accept: string;
  required: boolean;
  maxSizeMB: number;
}

export interface SecurityHold {
  id: string;
  status: string;
  questions_asked: {
    questions: VerificationQuestion[];
    evidence: VerificationEvidence[];
  };
  response_deadline: string;
  guest_email: string;
  order_id: string;
}

export type SecurityHoldStatus = string;

export interface SubmitHoldResponseDto {
  responses: Record<string, unknown>;
  evidence_urls: string[];
}
