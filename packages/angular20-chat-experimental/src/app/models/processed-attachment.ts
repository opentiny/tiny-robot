export type AttachmentProcessState =
  'selected' | 'previewed' | 'uploading' | 'parsed' | 'ready' | 'failed' | 'cancelled';

export interface ProcessedAttachment {
  id: string;
  file: File;
  state: AttachmentProcessState;
  progress: number;
  previewUrl?: string;
  dataUrl?: string;
  textContent?: string;
  error?: string;
}
