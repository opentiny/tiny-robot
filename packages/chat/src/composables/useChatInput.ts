import { shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { ChatReadable, ChatRuntime, ChatSubmitPayload } from '../types'
import { resolveComposerRunConfig } from '../utils/runConfig'

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

    const runConfig = resolveComposerRunConfig(currentRuntime.composer)

    try {
      // Let ChatUI apply clearOnSubmit before the Runtime action settles.
      await Promise.resolve()
      await currentRuntime.actions.send({
        ...payload,
        text,
        runConfig,
      })
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
    get abort() {
      return getRuntime().actions.abort
    },
  }
}
