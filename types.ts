
export enum OCRStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum OCREngine {
  DOCTR = 'doctr',
  TESSERACT = 'tesseract',
  MISTRAL = 'mistral',
  GEMINI = 'gemini'
}

export interface OCRFile {
  $id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  ocrEngine: OCREngine;
  status: OCRStatus;
  createdAt: string;
}

export interface OCRLog {
  $id: string;
  fileId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  createdAt: string;
}

export interface APIKey {
  $id: string;
  userId: string;
  provider: string;
  createdAt: string;
}
