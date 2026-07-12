import type { ChatRuntime, ChatRuntimeActions } from '../src'
import type { DemoScenarioController } from './scenario'

export function instrumentDemoRuntime(runtime: ChatRuntime, controller: DemoScenarioController): ChatRuntime {
  const actions: ChatRuntimeActions = {
    send: async (payload) => {
      controller.record('action', 'send', payload)
      await runtime.actions.send(payload)
    },
    abort: runtime.actions.abort
      ? async () => {
          controller.record('action', 'abort')
          await runtime.actions.abort?.()
        }
      : undefined,
    createConversation: runtime.actions.createConversation
      ? async (payload) => {
          controller.record('action', 'createConversation', payload)
          await runtime.actions.createConversation?.(payload)
        }
      : undefined,
    switchConversation: runtime.actions.switchConversation
      ? async (id) => {
          controller.record('action', 'switchConversation', { id })
          await runtime.actions.switchConversation?.(id)
        }
      : undefined,
    renameConversation: runtime.actions.renameConversation
      ? async (id, title) => {
          controller.record('action', 'renameConversation', { id, title })
          await runtime.actions.renameConversation?.(id, title)
        }
      : undefined,
    deleteConversation: runtime.actions.deleteConversation
      ? async (id) => {
          controller.record('action', 'deleteConversation', { id })
          await runtime.actions.deleteConversation?.(id)
        }
      : undefined,
  }

  return {
    ...runtime,
    actions,
  }
}
