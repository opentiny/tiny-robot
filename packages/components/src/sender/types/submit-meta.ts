import type { Attachment } from '../../attachments/index.type'

export type SenderExternalPayloadSourceId = string

export interface SenderAttachmentPayload {
  type: 'attachments'
  items: Attachment[]
}

export type SenderExternalPayload = SenderAttachmentPayload & {
  readonly sourceId: SenderExternalPayloadSourceId
}

export interface SenderSubmitMeta {
  externalPayloads: SenderExternalPayload[]
}
