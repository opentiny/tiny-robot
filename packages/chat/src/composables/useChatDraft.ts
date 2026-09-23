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
  allowEmptyText?: boolean
  abort?: () => Promise<void> | void
}

export function useChatDraft(options: UseChatDraftOptions): ChatDraft {
  const inputValue = shallowRef('')
  let latestSendId = 0
  let inputRevision = 0

  function setInputValue(value: string) {
    inputRevision++
    inputValue.value = value
  }

  function invalidate() {
    inputRevision++
  }

  async function send(payload: ChatSendPayload): Promise<boolean> {
    const text = payload.text.trim()

    if (!text && !options.allowEmptyText) {
      return false
    }

    const sendId = ++latestSendId
    const revisionAtClear = inputRevision
    const previousInputValue = inputValue.value

    try {
      inputValue.value = ''
      await Promise.resolve()
      const accepted = await options.send({
        ...payload,
        text,
      })

      if (!accepted && sendId === latestSendId && inputRevision === revisionAtClear && inputValue.value === '') {
        inputValue.value = previousInputValue
      }

      return accepted
    } catch (error) {
      if (sendId === latestSendId && inputRevision === revisionAtClear && inputValue.value === '') {
        inputValue.value = previousInputValue
      }
      throw error
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
