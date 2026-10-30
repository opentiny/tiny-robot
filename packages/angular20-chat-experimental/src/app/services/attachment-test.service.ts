import { signal } from '@angular/core';
import type { ProcessedAttachment } from '../models/processed-attachment';

interface AttachmentTestServiceOptions {
  delayMs: number;
}

export class AttachmentTestService {
  readonly records = signal<ProcessedAttachment[]>([]);
  private readonly attempts = new Map<string, number>();
  private sequence = 0;
  private readonly delayMs: number;

  constructor(options: Partial<AttachmentTestServiceOptions> = {}) {
    this.delayMs = options.delayMs ?? 120;
  }

  async add(files: readonly File[]): Promise<void> {
    for (const file of files) {
      const id = `attachment-${++this.sequence}`;
      const record: ProcessedAttachment = { id, file, state: 'selected', progress: 0 };
      if (file.type.startsWith('image/')) {
        record.previewUrl = URL.createObjectURL(file);
        record.state = 'previewed';
      }
      this.records.update((records) => [...records, record]);
      await this.process(id);
    }
  }

  async retry(id: string): Promise<void> {
    this.patch(id, { error: undefined, progress: 0, state: 'selected' });
    await this.process(id);
  }

  cancel(id: string): void {
    this.patch(id, { state: 'cancelled', progress: 0 });
  }

  remove(id: string): void {
    const record = this.records().find((item) => item.id === id);
    if (record?.previewUrl) URL.revokeObjectURL(record.previewUrl);
    this.records.update((records) => records.filter((item) => item.id !== id));
    this.attempts.delete(id);
  }

  clear(): void {
    for (const record of this.records()) {
      if (record.previewUrl) URL.revokeObjectURL(record.previewUrl);
    }
    this.records.set([]);
    this.attempts.clear();
  }

  destroy(): void {
    this.clear();
  }

  private async process(id: string): Promise<void> {
    const record = this.records().find((item) => item.id === id);
    if (!record) return;
    const attempt = (this.attempts.get(id) ?? 0) + 1;
    this.attempts.set(id, attempt);
    this.patch(id, { state: 'uploading', progress: 35 });
    await this.wait();
    try {
      if (record.file.name.includes('force-fail') && attempt === 1) {
        throw new Error('模拟附件处理失败');
      }
      if (record.file.type.startsWith('text/')) {
        const textContent = await record.file.text();
        this.patch(id, { state: 'parsed', progress: 80, textContent });
      } else if (record.file.type === 'image/png' || record.file.type === 'image/jpeg') {
        const dataUrl = await this.readDataUrl(record.file);
        this.patch(id, { progress: 80, dataUrl });
      } else {
        throw new Error(`不支持的附件类型：${record.file.type || record.file.name}`);
      }
      await this.wait();
      this.patch(id, { state: 'ready', progress: 100 });
    } catch (error) {
      this.patch(id, {
        state: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private patch(id: string, patch: Partial<ProcessedAttachment>): void {
    this.records.update((records) =>
      records.map((record) => (record.id === id ? { ...record, ...patch } : record)),
    );
  }

  private wait(): Promise<void> {
    return this.delayMs > 0
      ? new Promise((resolve) => setTimeout(resolve, this.delayMs))
      : Promise.resolve();
  }

  private readDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(String(reader.result)), { once: true });
      reader.addEventListener('error', () => reject(reader.error ?? new Error('读取图片失败')), {
        once: true,
      });
      reader.readAsDataURL(file);
    });
  }
}

export const defaultAttachmentTestService = new AttachmentTestService();
