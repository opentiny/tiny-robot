import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental';
import type { ProcessedAttachment } from './models/processed-attachment';

type ChatSendPayload = Parameters<TrChatHTMLElement['send']>[0];

export function transformAttachmentPayload(
  payload: ChatSendPayload,
  records: readonly ProcessedAttachment[],
): ChatSendPayload {
  const ready = records.filter((record) => record.state === 'ready');
  if (ready.length === 0) return payload;

  const structuredData: NonNullable<ChatSendPayload['structuredData']> = [];
  if (payload.text.trim()) structuredData.push({ type: 'text', text: payload.text.trim() });
  for (const record of ready) {
    if (record.textContent !== undefined) {
      structuredData.push({
        type: 'text',
        text: `[附件 ${record.file.name}]\n${record.textContent}`,
      });
    } else if (record.dataUrl) {
      structuredData.push({ type: 'image_url', image_url: { url: record.dataUrl } });
    }
  }
  return { ...payload, structuredData };
}
