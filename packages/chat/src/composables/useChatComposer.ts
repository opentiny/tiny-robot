import { computed, shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { ChatComposer, ChatRuntime, ChatSubmitPayload } from '../types'

export function useChatComposer(runtime: MaybeRefOrGetter<ChatRuntime>): ChatComposer {
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

    const previousInputValue = inputValue.value

    // Optimistically clear the draft so long-running sends keep the composer responsive.
    inputValue.value = ''

    try {
      await getRuntime().actions.send({
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
    submitDisabled: computed(() => {
      const currentRuntime = getRuntime()

      return (
        currentRuntime.sender.disabled.value ||
        currentRuntime.messages.requestState.value === 'processing' ||
        inputValue.value.trim().length === 0
      )
    }),
    setInputValue,
    send,
    get abort() {
      return getRuntime().actions.abort
    },
  }
}
