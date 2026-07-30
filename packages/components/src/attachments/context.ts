import type { InjectionKey, Ref } from 'vue'
import type { Attachment } from './index.type'

export type AttachmentsContentSourceId = string

export interface AttachmentsContentRegistration {
  id: AttachmentsContentSourceId
  hasContent: Ref<boolean> | (() => boolean)
  getAttachments: () => Attachment[]
}

export interface AttachmentsContentContext {
  registerAttachmentsContent: (registration: AttachmentsContentRegistration) => () => void
}

export const ATTACHMENTS_CONTENT_CONTEXT_KEY: InjectionKey<AttachmentsContentContext> =
  Symbol('attachments-content-context')
