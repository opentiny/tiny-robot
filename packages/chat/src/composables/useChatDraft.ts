import { shallowRef } from 'vue'
import type { ChatReadable, ChatSendPayload } from '../types'

export interface ChatDraft {
  inputValue: ChatReadable<string>
  setInputValue: (value: string) => void
  send: (payload: ChatSendPayload) => Promise<boolean> | boolean
  invalidate: () => void
  abort?: () => Promise<void> | void
}

export interface UseChatDraftOptions {
  send: (payload: ChatSendPayload) => Promise<boolean>
  prepareSend?: () => (payload: ChatSendPayload) => Promise<boolean>
  allowEmptyText?: boolean
  abort?: () => Promise<void> | void
}

export function useChatDraft(options: UseChatDraftOptions): ChatDraft {
  const inputValue = shallowRef('')
  let inputRevision = 0
  const pendingSends = new Map<number, { count: number; accepted: boolean; previousInputValue: string }>()

  function setInputValue(value: string) {
    inputRevision++
    inputValue.value = value
  }

  function invalidate() {
    inputRevision++
  }

  function completeSend(revision: number, accepted: boolean) {
    const pending = pendingSends.get(revision)
    if (!pending) return

    pending.count--
    pending.accepted ||= accepted
    if (pending.count) return

    pendingSends.delete(revision)
    if (!pending.accepted && inputRevision === revision && inputValue.value === '') {
      inputValue.value = pending.previousInputValue
    }
  }

  async function send(payload: ChatSendPayload): Promise<boolean> {
    const text = payload.text.trim()

    if (!text && !options.allowEmptyText) {
      return false
    }

    const revisionAtClear = inputRevision
    const previousInputValue = inputValue.value
    const send = options.prepareSend?.() ?? options.send
    const pending = pendingSends.get(revisionAtClear)
    if (pending) {
      pending.count++
    } else {
      pendingSends.set(revisionAtClear, { count: 1, accepted: false, previousInputValue })
    }
    let accepted = false

    try {
      inputValue.value = ''
      await Promise.resolve()
      accepted = await send({
        ...payload,
        text,
      })
      return accepted
    } finally {
      completeSend(revisionAtClear, accepted)
    }
  }

  return {
    inputValue,
    setInputValue,
    send,
    invalidate,
    abort: options.abort,
  }
}
