import { AttachmentTestService } from './attachment-test.service';
import { transformAttachmentPayload } from '../attachment-payload';

describe('AttachmentTestService', () => {
  it('parses text and prepares image previews with deterministic ready states', async () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test-image');
    const service = new AttachmentTestService({ delayMs: 0 });
    const text = new File(['hello attachment'], 'notes.txt', { type: 'text/plain' });
    const image = new File([new Uint8Array([137, 80, 78, 71])], 'screen.png', {
      type: 'image/png',
    });

    await service.add([text, image]);
    expect(service.records().map((record) => record.state)).toEqual(['ready', 'ready']);
    expect(service.records()[0].textContent).toBe('hello attachment');
    expect(service.records()[1].previewUrl).toBe('blob:test-image');
    expect(service.records()[1].dataUrl).toContain('data:image/png;base64,');
  });

  it('supports failure, retry, cancellation, removal, and object URL cleanup', async () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:failed-image');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const service = new AttachmentTestService({ delayMs: 0 });
    const failed = new File(['bad'], 'force-fail.png', { type: 'image/png' });
    await service.add([failed]);
    expect(service.records()[0].state).toBe('failed');
    await service.retry(service.records()[0].id);
    expect(service.records()[0].state).toBe('ready');
    service.cancel(service.records()[0].id);
    expect(service.records()[0].state).toBe('cancelled');
    service.remove(service.records()[0].id);
    expect(revoke).toHaveBeenCalledWith('blob:failed-image');
    expect(service.records()).toEqual([]);
  });

  it('builds stable text/image parts for attachment-only and combined sends', async () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:image');
    const service = new AttachmentTestService({ delayMs: 0 });
    await service.add([
      new File(['context'], 'context.txt', { type: 'text/plain' }),
      new File(['png'], 'screen.png', { type: 'image/png' }),
    ]);

    const attachmentOnly = transformAttachmentPayload({ text: '' }, service.records());
    expect(attachmentOnly.structuredData?.map((part) => part.type)).toEqual(['text', 'image_url']);
    const combined = transformAttachmentPayload({ text: 'question' }, service.records());
    expect(combined.structuredData?.[0]).toEqual({ type: 'text', text: 'question' });
    expect(combined.structuredData).toHaveSize(3);
  });
});
