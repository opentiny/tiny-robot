import { computed, shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { ChatReadable, ChatRuntime, ChatSubmitPayload } from '../types'
import { cloneRunConfig } from '../utils/runConfig'

export interface ChatInput {
  inputValue: ChatReadable<string>
  submitDisabled: ChatReadable<boolean>
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
    const previousInputValue = inputValue.value

    const runConfig = cloneRunConfig(payload.runConfig ?? currentRuntime.composer.runConfig.value)

    // Optimistically clear the draft so long-running sends keep the composer responsive.
    inputValue.value = ''

    try {
      await getRuntime().actions.send({
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
    submitDisabled: computed(() => getRuntime().composer.disabled.value),
    setInputValue,
    send,
    get abort() {
      return getRuntime().actions.abort
    },
  }
}
