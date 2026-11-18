import { effectScope } from 'vue'
import type { ChatRuntime } from '../types'
import { createChatRuntimeResources, type UseChatRuntimeOptions } from './useChatRuntime'

export interface ChatRuntimeHandle {
  readonly runtime: ChatRuntime
  dispose(): Promise<void>
}

/** Creates an independently owned Runtime for any host framework. */
export function createChatRuntime(options: UseChatRuntimeOptions): ChatRuntimeHandle {
  const scope = effectScope(true)
  try {
    const owned = scope.run(() => createChatRuntimeResources(options))!
    let disposed = false
    let closing: Promise<void> | undefined
    const assertActive = () => {
      if (disposed) throw new Error('Chat Runtime has been disposed.')
    }
    const actions = owned.runtime.actions
    const runtime: ChatRuntime = {
      ...owned.runtime,
      actions: {
        async send(payload) {
          assertActive()
          return actions.send(payload)
        },
        abort() {
          assertActive()
          return actions.abort?.()
        },
        clearActiveConversation() {
          assertActive()
          return actions.clearActiveConversation()
        },
        createConversation(payload) {
          assertActive()
          return actions.createConversation(payload)
        },
        switchConversation(id) {
          assertActive()
          return actions.switchConversation(id)
        },
        renameConversation(id, title) {
          assertActive()
          return actions.renameConversation(id, title)
        },
        deleteConversation(id) {
          assertActive()
          return actions.deleteConversation(id)
        },
      },
    }
    return {
      runtime,
      dispose() {
        if (closing) return closing
        disposed = true
        // Stop subscriptions immediately; asynchronous resource cleanup can finish afterwards.
        closing = owned.dispose().finally(() => scope.stop())
        scope.stop()
        return closing
      },
    }
  } catch (error) {
    scope.stop()
    throw error
  }
}
