import { computed, isRef, shallowReactive, type ComputedRef, type Ref } from 'vue'
import type { AttachmentsContentRegistration } from '../../attachments/context'
import type { SenderExternalPayload, SenderExternalPayloadSourceId } from '../types/submit-meta'

type RegisteredContentHasContent = Ref<boolean> | (() => boolean)

interface RegisteredSenderContent {
  readonly id: SenderExternalPayloadSourceId
  readonly hasContent: ComputedRef<boolean>
  readonly collectPayload: () => SenderExternalPayload | undefined
}

export interface UseSenderContentRegistryReturn {
  hasRegisteredContent: ComputedRef<boolean>
  registerAttachmentsContent: (registration: AttachmentsContentRegistration) => () => void
  collectExternalPayloads: () => SenderExternalPayload[]
}

const normalizeHasContent = (hasContent: RegisteredContentHasContent): ComputedRef<boolean> => {
  if (isRef(hasContent)) {
    return computed(() => Boolean(hasContent.value))
  }

  return computed(() => Boolean(hasContent()))
}

export function useSenderContentRegistry(): UseSenderContentRegistryReturn {
  const registeredContent = shallowReactive(new Map<SenderExternalPayloadSourceId, RegisteredSenderContent>())

  const hasRegisteredContent = computed(() => {
    return Array.from(registeredContent.values()).some((content) => content.hasContent.value)
  })

  const registerContent = (content: RegisteredSenderContent) => {
    const sourceId = content.id.trim()

    if (sourceId.length === 0) {
      throw new TypeError('[Sender] content id must be a non-empty string')
    }

    if (registeredContent.has(sourceId)) {
      throw new Error(`[Sender] duplicated content id: ${sourceId}`)
    }

    const normalizedContent: RegisteredSenderContent = {
      ...content,
      id: sourceId,
    }

    registeredContent.set(sourceId, normalizedContent)

    return () => {
      if (registeredContent.get(sourceId) === normalizedContent) {
        registeredContent.delete(sourceId)
      }
    }
  }

  const registerAttachmentsContent = (registration: AttachmentsContentRegistration) => {
    const sourceId = registration.id.trim()

    return registerContent({
      id: sourceId,
      hasContent: normalizeHasContent(registration.hasContent),
      collectPayload: () => ({
        type: 'attachments',
        items: registration.getAttachments(),
        sourceId,
      }),
    })
  }

  const collectExternalPayloads = (): SenderExternalPayload[] => {
    const payloads: SenderExternalPayload[] = []

    for (const content of registeredContent.values()) {
      if (!content.hasContent.value) continue

      const payload = content.collectPayload()
      if (payload) {
        payloads.push(payload)
      }
    }

    return payloads
  }

  return {
    hasRegisteredContent,
    registerAttachmentsContent,
    collectExternalPayloads,
  }
}
