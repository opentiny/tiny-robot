import { computed, isRef, shallowReactive, type ComputedRef } from 'vue'
import type { Attachment } from '../../attachments/index.type'
import type { SenderExternalPayload } from '../types/submit-meta'

const ATTACHMENTS_CONTENT_SOURCE_ID = 'attachments'

export type SenderContentRegister = (source: string, payload: unknown) => () => void

interface RegisteredSenderContent {
  readonly payload: ComputedRef<SenderExternalPayload | undefined>
}

export interface UseSenderContentRegistryReturn {
  hasRegisteredContent: ComputedRef<boolean>
  registerContent: SenderContentRegister
  collectExternalPayloads: () => SenderExternalPayload[]
}

const getRegisteredPayloadValue = (payload: unknown) => {
  if (isRef(payload)) {
    return payload.value
  }

  return payload
}

const getSubmittableAttachments = (fileList: Attachment[]) => {
  return fileList.filter((file) => file.status === 'success')
}

const hasPayloadContent = (payload: unknown): boolean => {
  if (payload === null || payload === undefined) return false

  if (typeof payload === 'string') {
    return payload.trim().length > 0
  }

  if (typeof payload === 'number') {
    return Number.isFinite(payload)
  }

  if (Array.isArray(payload)) {
    return payload.length > 0
  }

  if (typeof payload === 'object') {
    return Object.keys(payload).length > 0
  }

  return Boolean(payload)
}

const isPlainPayloadObject = (payload: unknown): payload is Record<string, unknown> => {
  return payload !== null && !Array.isArray(payload) && typeof payload === 'object'
}

const collectAttachmentsPayload = (payload: unknown): SenderExternalPayload | undefined => {
  const fileList = getRegisteredPayloadValue(payload)

  if (!Array.isArray(fileList)) return undefined

  const submittableAttachments = getSubmittableAttachments(fileList)

  if (submittableAttachments.length === 0) return undefined

  return {
    items: submittableAttachments,
    sourceId: ATTACHMENTS_CONTENT_SOURCE_ID,
  }
}

const collectRegisteredPayload = (source: string, payload: unknown): SenderExternalPayload | undefined => {
  if (source === ATTACHMENTS_CONTENT_SOURCE_ID) {
    return collectAttachmentsPayload(payload)
  }

  const payloadValue = getRegisteredPayloadValue(payload)

  if (!hasPayloadContent(payloadValue)) {
    return undefined
  }

  if (!isPlainPayloadObject(payloadValue)) {
    return {
      value: payloadValue,
      sourceId: source,
    } as SenderExternalPayload
  }

  return {
    ...payloadValue,
    sourceId: source,
  } as SenderExternalPayload
}

export function useSenderContentRegistry(): UseSenderContentRegistryReturn {
  const registeredContent = shallowReactive(new Map<symbol, RegisteredSenderContent>())

  const hasRegisteredContent = computed(() => {
    for (const content of registeredContent.values()) {
      if (content.payload.value) return true
    }

    return false
  })

  const registerContent: SenderContentRegister = (source, payload) => {
    const registrationId = Symbol('sender-content')
    const normalizedContent: RegisteredSenderContent = {
      payload: computed(() => collectRegisteredPayload(source, payload)),
    }

    registeredContent.set(registrationId, normalizedContent)

    return () => {
      registeredContent.delete(registrationId)
    }
  }

  const collectExternalPayloads = (): SenderExternalPayload[] => {
    const payloads: SenderExternalPayload[] = []

    for (const content of registeredContent.values()) {
      const payload = content.payload.value
      if (payload) {
        payloads.push(payload)
      }
    }

    return payloads
  }

  return {
    hasRegisteredContent,
    registerContent,
    collectExternalPayloads,
  }
}
