import type { BasePluginContext as CoreBasePluginContext, MessageEnginePlugin } from '../../message/types'
import type { ChatMessage } from '../../types'
import type { BasePluginContext, UseMessagePlugin } from './types'

export interface VueMessagePluginRuntime {
  createCorePlugin: (plugin: UseMessagePlugin) => MessageEnginePlugin
  createVueBaseContext: (context: CoreBasePluginContext) => BasePluginContext
  resolveReactiveMessage: (message: ChatMessage) => ChatMessage
}
