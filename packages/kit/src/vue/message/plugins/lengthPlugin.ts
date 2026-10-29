import { lengthPlugin as createCoreLengthPlugin } from '../../../message/plugins'
import type { VueMessagePluginRuntime } from '../types.internal'
import type { UseMessagePlugin } from '../types'

export const lengthPlugin = (options: UseMessagePlugin & { continueContent?: string } = {}): UseMessagePlugin => {
  const { continueContent = 'Please continue with your previous answer.', ...restOptions } = options

  return {
    name: 'length',
    __corePluginFactory(runtime: VueMessagePluginRuntime) {
      return createCoreLengthPlugin({
        ...runtime.createCorePlugin(restOptions),
        continueContent,
      })
    },
  } as UseMessagePlugin
}
