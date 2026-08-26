import { InternalMessageState, MessageStateAdapter, MutateMessageStateFn, PublicMessageState } from '../types'
import { createStateSubscriptionController } from './shared'

export const createNativeMessageAdapter = (): MessageStateAdapter => {
  let initialized = false
  let state: InternalMessageState

  const initialize = (initialState: InternalMessageState) => {
    if (initialized) {
      throw new Error('Message state adapter is already initialized')
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
      messages: [...state.messages],
      isProcessing: state.requestState === 'processing' || state.requestState === 'paused',
      isPaused: state.requestState === 'paused',
    } satisfies PublicMessageState
  }

  const subscriptions = createStateSubscriptionController(getState)

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
      subscriptions.notify(kind)
    }
  }

  return {
    initialize,
    getState,
    createMessage(message) {
      return message
    },
    mutate,
    subscribe: subscriptions.subscribe,
  }
}
