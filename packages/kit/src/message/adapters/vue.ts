import { ComputedRef, Ref, computed, reactive, ref, toRaw } from 'vue'
import {
  ChatMessage,
  InternalMessageState,
  MessageStateAdapter,
  MutateMessageStateFn,
  PublicMessageState,
  RequestProcessingState,
  RequestState,
} from '../types'
import { createStateSubscriptionController } from './shared'
import { copyMessageData } from '../utils'

export interface VueMessageStateAdapter extends MessageStateAdapter {
  requestState: Ref<RequestState>
  processingState: Ref<RequestProcessingState | undefined>
  messages: Ref<ChatMessage[]>
  isProcessing: ComputedRef<boolean>
  isPaused: ComputedRef<boolean>
  canStartTurn: ComputedRef<boolean>
}

const toReactiveMessage = (message: ChatMessage) => reactive(message) as ChatMessage

export const createVueMessageAdapter = (): VueMessageStateAdapter => {
  let initialized = false

  const requestState = ref<RequestState>('idle')
  const processingState = ref<RequestProcessingState | undefined>(undefined)
  const messages = ref<ChatMessage[]>([])
  const isProcessing = computed(() => requestState.value === 'processing')
  const isPaused = computed(() => requestState.value === 'paused')
  const canStartTurn = computed(() => requestState.value !== 'processing' && requestState.value !== 'paused')

  const initialize = (initialState: InternalMessageState) => {
    if (initialized) {
      throw new Error('Message state adapter is already initialized')
    }

    requestState.value = initialState.requestState
    processingState.value = initialState.processingState
    messages.value = initialState.messages
    initialized = true
  }

  const createMessage = <T extends ChatMessage>(message: T): T => {
    return toReactiveMessage(message) as T
  }

  const resolveMessage = (message: ChatMessage) =>
    messages.value.find((item) => item === message || toRaw(item) === message || toRaw(item) === toRaw(message))
  const getMessageIndex = (message: ChatMessage) =>
    messages.value.findIndex((item) => item === message || toRaw(item) === message || toRaw(item) === toRaw(message))

  const getState = () => {
    if (!initialized) {
      throw new Error('Message state adapter is not initialized')
    }

    return {
      requestState: requestState.value,
      processingState: processingState.value,
      messages: copyMessageData(messages.value, toRaw),
      isProcessing: isProcessing.value,
      isPaused: isPaused.value,
      canStartTurn: canStartTurn.value,
    } satisfies PublicMessageState
  }

  const subscriptions = createStateSubscriptionController(getState)

  const mutate: MutateMessageStateFn = (kinds, recipe) => {
    if (!initialized) {
      throw new Error('Message state adapter is not initialized')
    }

    const draft: InternalMessageState = {
      get requestState() {
        return requestState.value
      },
      set requestState(value) {
        requestState.value = value
      },
      get processingState() {
        return processingState.value
      },
      set processingState(value) {
        processingState.value = value
      },
      get messages() {
        return messages.value
      },
      set messages(value) {
        messages.value = value.map(createMessage)
      },
    }

    let notifySkipped = false
    const skipNotify = () => {
      notifySkipped = true
    }

    recipe(draft, skipNotify)

    if (notifySkipped) {
      return
    }

    const updateKinds = Array.isArray(kinds) ? kinds : [kinds]
    if (updateKinds.includes('messages')) {
      messages.value = [...messages.value]
    }

    subscriptions.notify(kinds)
  }

  return {
    requestState,
    processingState,
    messages,
    isProcessing,
    isPaused,
    canStartTurn,
    initialize,
    getState,
    resolveMessage,
    getMessageIndex,
    createMessage,
    mutate,
    subscribe: subscriptions.subscribe,
  }
}
