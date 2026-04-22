import { thinkingPlugin as createCoreThinkingPlugin } from '../../../message/plugins'
import { MessageEnginePlugin } from '../../../message/types'
import type { UseMessagePlugin } from '../types'

type VuePluginRuntime = {
  createCorePlugin: (plugin: UseMessagePlugin) => MessageEnginePlugin
}

export const thinkingPlugin = (options: UseMessagePlugin = {}): UseMessagePlugin => {
  return {
    name: 'thinking',
    __corePluginFactory(runtime: VuePluginRuntime) {
      return createCoreThinkingPlugin(runtime.createCorePlugin(options))
    },
  } as UseMessagePlugin
}
