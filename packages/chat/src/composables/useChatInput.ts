import { computed, shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { ChatReadable, ChatRuntime, ChatSubmitPayload } from '../types'

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
        currentRuntime.activeConversation.value?.requestState === 'processing' ||
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
