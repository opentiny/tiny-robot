import type { Attachment } from '../../attachments/index.type'

export type SenderExternalPayloadSourceId = string

export interface SenderAttachmentPayload {
  items: Attachment[]
}

export interface SenderCustomPayload {
  [key: string]: unknown
}

export type SenderExternalPayload = (SenderAttachmentPayload | SenderCustomPayload) & {
  readonly sourceId: SenderExternalPayloadSourceId
}

export interface SenderSubmitMeta {
  externalPayloads: SenderExternalPayload[]
}
