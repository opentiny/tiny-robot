import { shallowRef } from 'vue'
import type { ChatReadable, ChatSendPayload } from '../types'

export interface ChatDraft {
  inputValue: ChatReadable<string>
  setInputValue: (value: string) => void
  send: (payload: ChatSendPayload) => Promise<boolean> | boolean
  abort?: () => Promise<void> | void
}

export interface UseChatDraftOptions {
  send: (payload: ChatSendPayload) => Promise<boolean>
  abort?: () => Promise<void> | void
}

export function useChatDraft(options: UseChatDraftOptions): ChatDraft {
  const inputValue = shallowRef('')

  function setInputValue(value: string) {
    inputValue.value = value
  }

  async function send(payload: ChatSendPayload): Promise<boolean> {
    const text = payload.text.trim()

    if (!text) {
      return false
    }

    const previousInputValue = payload.text

    try {
      inputValue.value = ''
      await Promise.resolve()
      const accepted = await options.send({
        ...payload,
        text,
      })

      if (!accepted && inputValue.value === '') {
        inputValue.value = previousInputValue
      }

      return accepted
    } catch (error) {
      if (inputValue.value === '') {
        inputValue.value = previousInputValue
      }
      throw error
    }
  }

  return {
    inputValue,
    setInputValue,
    send,
    abort: options.abort,
  }
}
