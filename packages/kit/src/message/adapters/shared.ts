import { MessageUpdateKind, MessageUpdateKinds, PublicMessageState } from '../types'

type ListenerEntry = {
  kinds: Set<MessageUpdateKind> | null
  listener: (currentState: PublicMessageState) => void
}

const normalizeKinds = (kindsOrListener: MessageUpdateKinds | ((currentState: PublicMessageState) => void)) => {
  if (typeof kindsOrListener === 'function') {
    return null
  }

  if (Array.isArray(kindsOrListener)) {
    return kindsOrListener.length > 0 ? new Set(kindsOrListener) : null
  }

  return new Set([kindsOrListener])
}

export const createStateSubscriptionController = (getState: () => PublicMessageState) => {
  const listeners = new Set<ListenerEntry>()

  const dispatch = (entry: ListenerEntry, snapshot: PublicMessageState) => {
    try {
      entry.listener(snapshot)
    } catch (error) {
      console.error('Error in message state subscriber:', error)
    }
  }

  const notify = (kindsOrKind: MessageUpdateKinds) => {
    const kinds = new Set(Array.isArray(kindsOrKind) ? kindsOrKind : [kindsOrKind])
    const snapshot = getState()
    const currentListeners = Array.from(listeners)

    for (const entry of currentListeners) {
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

      dispatch(entry, snapshot)
    }
  }

  const subscribe = (
    kindsOrListener: MessageUpdateKinds | ((currentState: PublicMessageState) => void),
    maybeListener?: (currentState: PublicMessageState) => void,
  ) => {
    const listener = typeof kindsOrListener === 'function' ? kindsOrListener : maybeListener

    if (!listener) {
      throw new Error('subscribe listener is required')
    }

    const entry: ListenerEntry = {
      kinds: normalizeKinds(kindsOrListener),
      listener,
    }

    listeners.add(entry)
    dispatch(entry, getState())

    return () => {
      listeners.delete(entry)
    }
  }

  return {
    notify,
    subscribe,
  }
}
