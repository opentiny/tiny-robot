import { shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { ChatReadable, ChatRuntime, ChatSubmitPayload } from '../types'

export interface ChatInput {
  inputValue: ChatReadable<string>
  setInputValue: (value: string) => void
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
}

export function useChatInput(runtime: MaybeRefOrGetter<ChatRuntime>): ChatInput {
  const inputValue = shallowRef('')

  function setInputValue(value: string) {
    inputValue.value = value
  }

  function getRuntime() {
    return toValue(runtime)
  }

  async function send(payload: ChatSubmitPayload) {
    const text = payload.text.trim()

    if (!text) {
      return
    }

    const currentRuntime = getRuntime()
    const previousInputValue = payload.text

    try {
      inputValue.value = ''
      await Promise.resolve()
      const accepted = await currentRuntime.actions.send({
        ...payload,
        text,
      })

      if (!accepted && inputValue.value === '') {
        inputValue.value = previousInputValue
      }
    } catch {
      if (inputValue.value === '') {
        inputValue.value = previousInputValue
      }
    }
  }

  return {
    inputValue,
    setInputValue,
    send,
    get abort() {
      return getRuntime().actions.abort
    },
  }
}
