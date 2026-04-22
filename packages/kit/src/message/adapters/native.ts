import {
  InternalMessageState,
  MessageStateAdapter,
  MessageUpdateKind,
  MessageUpdateKinds,
  MutateMessageStateFn,
  PublicMessageState,
} from '../types'

export const createNativeMessageAdapter = (): MessageStateAdapter => {
  let initialized = false
  let state: InternalMessageState

  const listeners = new Set<{
    kinds: Set<MessageUpdateKind> | null
    listener: (currentState: PublicMessageState) => void
  }>()

  const initialize = (initialState: InternalMessageState) => {
    if (initialized) {
      return
    }

    state = {
      requestState: initialState.requestState,
      processingState: initialState.processingState,
      messages: [...initialState.messages],
    }
    initialized = true
  }

  const getState = () => {
    if (!initialized) {
      throw new Error('Message state adapter is not initialized')
    }

    return {
      requestState: state.requestState,
      processingState: state.processingState,
      messages: state.messages,
      isProcessing: state.requestState === 'processing',
    } satisfies PublicMessageState
  }

  const notifyListeners = (kind: MessageUpdateKinds) => {
    const kinds = new Set(Array.isArray(kind) ? kind : [kind])
    const snapshot = getState()

    for (const entry of listeners) {
      if (entry.kinds) {
        let matched = false
        for (const item of entry.kinds) {
          if (kinds.has(item)) {
            matched = true
            break
          }
        }

        if (!matched) {
          continue
        }
      }

      entry.listener(snapshot)
    }
  }

  const mutate: MutateMessageStateFn = (kind, recipe) => {
    if (!initialized) {
      throw new Error('Message state adapter is not initialized')
    }

    let notifySkipped = false
    const skipNotify = () => {
      notifySkipped = true
    }

    recipe(state, skipNotify)

    if (!notifySkipped) {
      notifyListeners(kind)
    }
  }

  const subscribe = (
    kindsOrListener: MessageUpdateKinds | ((currentState: PublicMessageState) => void),
    maybeListener?: (currentState: PublicMessageState) => void,
  ) => {
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

    const entry = {
      kinds,
      listener,
    }

    listeners.add(entry)
    listener(getState())

    return () => {
      listeners.delete(entry)
    }
  }

  return {
    initialize,
    getState,
    createMessage(message) {
      return message
    },
    mutate,
    subscribe,
  }
}
