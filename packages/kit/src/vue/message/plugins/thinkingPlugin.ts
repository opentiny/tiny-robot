import { thinkingPlugin as createCoreThinkingPlugin } from '../../../message/plugins'
import type { VueMessagePluginRuntime } from '../types.internal'
import type { UseMessagePlugin } from '../types'

export const thinkingPlugin = (options: UseMessagePlugin = {}): UseMessagePlugin => {
  return {
    name: 'thinking',
    __corePluginFactory(runtime: VueMessagePluginRuntime) {
      return createCoreThinkingPlugin(runtime.createCorePlugin(options))
    },
  } as UseMessagePlugin
}
