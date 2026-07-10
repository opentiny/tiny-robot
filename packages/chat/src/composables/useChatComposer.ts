import { computed, shallowRef } from 'vue'
import type { ChatComposer, ChatRuntime, ChatSubmitPayload } from '../types'

export function useChatComposer(runtime: ChatRuntime): ChatComposer {
  const inputValue = shallowRef('')

  function setInputValue(value: string) {
    inputValue.value = value
  }

  async function send(payload: ChatSubmitPayload) {
    const text = payload.text.trim()

    if (!text) {
      return
    }

    const previousInputValue = inputValue.value

    // Optimistically clear the draft so long-running sends keep the composer responsive.
    inputValue.value = ''

    try {
      await runtime.actions.send({
        ...payload,
        text,
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
    submitDisabled: computed(
      () => runtime.sender.disabled.value || runtime.sender.loading.value || inputValue.value.trim().length === 0,
    ),
    setInputValue,
    send,
    abort: runtime.actions.abort,
  }
}
