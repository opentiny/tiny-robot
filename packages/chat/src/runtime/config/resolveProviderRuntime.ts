import { useChatKit } from '@/runtime/engine/useChatKit'
import type { TrChatProviderProps, ResponseProvider, TrChatProviderRuntimeOptions } from '@/types'
import type { UseChatKitReturn } from '@/types/core'

interface ProviderRuntimeResolution {
  providerRuntimeOptions: Omit<TrChatProviderRuntimeOptions, 'transportAdapter'> & {
    responseProvider: ResponseProvider
  }
}

type ResolvedProviderRuntimeOptions = ProviderRuntimeResolution['providerRuntimeOptions']

export function getProviderRuntimeResolution(
  componentName: string,
  props: TrChatProviderProps,
): ProviderRuntimeResolution {
  const hasTransportAdapter = 'transportAdapter' in props && Boolean(props.transportAdapter)
  const hasResponseProvider = 'responseProvider' in props && Boolean(props.responseProvider)

  if (hasTransportAdapter && hasResponseProvider) {
    throw new Error(`[${componentName}] transportAdapter and responseProvider cannot be provided together`)
  }

  const responseProvider = props.transportAdapter ?? props.responseProvider

  if (!responseProvider) {
    throw new Error(`[${componentName}] transportAdapter or responseProvider must be provided`)
  }

  return {
    providerRuntimeOptions: {
      responseProvider,
      plugins: props.plugins,
      storage: props.storage,
      initialMessages: props.initialMessages,
      messageTransforms: props.messageTransforms,
      onFinish: props.onFinish,
      onError: props.onError,
    },
  }
}

export function resolveProviderRuntime(
  componentName: string,
  props: TrChatProviderProps,
  createChatKit: (options: ResolvedProviderRuntimeOptions) => UseChatKitReturn = useChatKit,
): UseChatKitReturn {
  const resolution = getProviderRuntimeResolution(componentName, props)
  return createChatKit(resolution.providerRuntimeOptions)
}
