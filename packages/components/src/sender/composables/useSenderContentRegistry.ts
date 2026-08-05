import { computed, shallowReactive, toValue, type ComputedRef } from 'vue'
import type { SenderExternalPayload } from '../types/submit-extra'

export type SenderContentRegister = (source: string, payload: unknown) => () => void

interface RegisteredSenderContent {
  readonly source: string
  readonly payload: unknown
}

export interface UseSenderContentRegistryReturn {
  hasRegisteredContent: ComputedRef<boolean>
  registerContent: SenderContentRegister
  collectExternalPayloads: () => SenderExternalPayload[]
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

const collectRegisteredPayload = (source: string, payload: unknown): SenderExternalPayload | undefined => {
  const payloadValue = toValue(payload)

  if (!hasPayloadContent(payloadValue)) {
    return undefined
  }

  return {
    source,
    payload: payloadValue,
  }
}

export function useSenderContentRegistry(): UseSenderContentRegistryReturn {
  const registeredContent = shallowReactive(new Map<symbol, RegisteredSenderContent>())

  const hasRegisteredContent = computed(() => {
    for (const content of registeredContent.values()) {
      if (collectRegisteredPayload(content.source, content.payload)) return true
    }

    return false
  })

  const registerContent: SenderContentRegister = (source, payload) => {
    const registrationId = Symbol('sender-content')
    registeredContent.set(registrationId, { source, payload })

    return () => {
      registeredContent.delete(registrationId)
    }
  }

  const collectExternalPayloads = (): SenderExternalPayload[] => {
    const payloads: SenderExternalPayload[] = []

    for (const content of registeredContent.values()) {
      const payload = collectRegisteredPayload(content.source, content.payload)
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
