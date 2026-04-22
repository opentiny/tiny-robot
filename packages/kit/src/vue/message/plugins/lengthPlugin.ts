import { lengthPlugin as createCoreLengthPlugin } from '../../../message/plugins'
import { MessageEnginePlugin } from '../../../message/types'
import type { UseMessagePlugin } from '../types'

type VuePluginRuntime = {
  createCorePlugin: (plugin: UseMessagePlugin) => MessageEnginePlugin
}

export const lengthPlugin = (options: UseMessagePlugin & { continueContent?: string } = {}): UseMessagePlugin => {
  const { continueContent = 'Please continue with your previous answer.', ...restOptions } = options

  return {
    name: 'length',
    __corePluginFactory(runtime: VuePluginRuntime) {
      return createCoreLengthPlugin({
        ...runtime.createCorePlugin(restOptions),
        continueContent,
      })
    },
  } as UseMessagePlugin
}
