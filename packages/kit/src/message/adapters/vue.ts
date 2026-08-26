import { ComputedRef, Ref, computed, isProxy, reactive, ref, toRaw } from 'vue'
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

export interface VueMessageStateAdapter extends MessageStateAdapter {
  requestState: Ref<RequestState>
  processingState: Ref<RequestProcessingState | undefined>
  messages: Ref<ChatMessage[]>
  isProcessing: ComputedRef<boolean>
  isPaused: ComputedRef<boolean>
}

const toReactiveMessage = (message: ChatMessage) => reactive(message) as ChatMessage

const toPlainValue = <T>(value: T): T => {
  const rawValue = isProxy(value) ? toRaw(value) : value

  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => toPlainValue(item)) as T
  }

  if (rawValue && typeof rawValue === 'object') {
    const result: Record<string, unknown> = {}

    for (const [key, item] of Object.entries(rawValue)) {
      result[key] = toPlainValue(item)
    }

    return result as T
  }

  return rawValue
}

export const createVueMessageAdapter = (): VueMessageStateAdapter => {
  let initialized = false

  const requestState = ref<RequestState>('idle')
  const processingState = ref<RequestProcessingState | undefined>(undefined)
  const messages = ref<ChatMessage[]>([])
  const isProcessing = computed(() => requestState.value === 'processing' || requestState.value === 'paused')
  const isPaused = computed(() => requestState.value === 'paused')

  const initialize = (initialState: InternalMessageState) => {
    if (initialized) {
      throw new Error('Message state adapter is already initialized')
    }

    requestState.value = initialState.requestState
    processingState.value = initialState.processingState
    messages.value = initialState.messages.map(toReactiveMessage)
    initialized = true
  }

  const createMessage = <T extends ChatMessage>(message: T): T => {
    return toReactiveMessage(message) as T
  }

  const getState = () => {
    if (!initialized) {
      throw new Error('Message state adapter is not initialized')
    }

    return {
      requestState: requestState.value,
      processingState: processingState.value,
      messages: toPlainValue(messages.value),
      isProcessing: isProcessing.value,
      isPaused: isPaused.value,
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
    initialize,
    getState,
    createMessage,
    mutate,
    subscribe: subscriptions.subscribe,
  }
}
