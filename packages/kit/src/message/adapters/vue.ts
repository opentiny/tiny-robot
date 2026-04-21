import { ComputedRef, Ref, computed, isProxy, reactive, ref, toRaw, watch } from 'vue'
import {
  ChatMessage,
  InternalMessageState,
  MessageStateAdapter,
  MessageUpdateKind,
  MessageUpdateKinds,
  MutateMessageStateFn,
  PublicMessageState,
  RequestProcessingState,
  RequestState,
} from '../types'

export interface VueMessageStateAdapter extends MessageStateAdapter {
  requestState: Ref<RequestState>
  processingState: Ref<RequestProcessingState | undefined>
  messages: Ref<ChatMessage[]>
  isProcessing: ComputedRef<boolean>
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
  const isProcessing = computed(() => requestState.value === 'processing')

  const initialize = (initialState: InternalMessageState) => {
    if (initialized) {
      return
    }

    requestState.value = initialState.requestState
    processingState.value = initialState.processingState
    messages.value.push(...initialState.messages)
    initialized = true
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
    } satisfies PublicMessageState
  }

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
        messages.value = value.map(toReactiveMessage)
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
  }

  const getWatchSources = (kinds: Set<MessageUpdateKind> | null) => {
    if (!kinds) {
      return [requestState, processingState, messages]
    }

    const sources = []

    if (kinds.has('requestState')) {
      sources.push(requestState, processingState)
    }

    if (kinds.has('messages')) {
      sources.push(messages)
    }

    return sources
  }

  const subscribe = (
    kindsOrListener: MessageUpdateKinds | ((currentState: PublicMessageState) => void),
    maybeListener?: (currentState: PublicMessageState) => void,
  ) => {
    if (!initialized) {
      throw new Error('Message state adapter is not initialized')
    }

    const listener = typeof kindsOrListener === 'function' ? kindsOrListener : maybeListener
    const kinds =
      typeof kindsOrListener === 'function'
        ? null
        : Array.isArray(kindsOrListener)
          ? kindsOrListener.length > 0
            ? new Set(kindsOrListener)
            : null
          : new Set([kindsOrListener])

    if (!listener) {
      throw new Error('subscribe listener is required')
    }

    const stopWatcher = watch(
      getWatchSources(kinds),
      () => {
        listener(getState())
      },
      { flush: 'sync' },
    )

    listener(getState())

    return () => {
      stopWatcher()
    }
  }

  return {
    requestState,
    processingState,
    messages,
    isProcessing,
    initialize,
    getState,
    mutate,
    subscribe,
  }
}
