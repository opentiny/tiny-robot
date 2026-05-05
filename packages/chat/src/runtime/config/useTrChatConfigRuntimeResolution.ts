import { computed, shallowRef, watch, type WatchSource } from 'vue'
import { createRuntimeFromConfig } from './createRuntimeFromConfig'
import { resolveTrChatConfigEntryInput } from './trchatConfigEntry'
import type { CreateRuntimeFromConfigResult, TrChatConfigEntryInput } from '@/types'

const TR_CHAT_CONFIG_ENTRY_ERROR =
  '[TrChat] The TrChat config entry accepts only target TrChatConfig or serialized target TrChatConfig. Use TrChat.Root + TrChat.Page or TrChat.Root + primitives for composed integration.'

export function useTrChatConfigRuntimeResolution(
  configSource: WatchSource<TrChatConfigEntryInput>,
  options?: {
    createRuntime?: (config: Parameters<typeof createRuntimeFromConfig>[0]) => CreateRuntimeFromConfigResult
  },
) {
  const createRuntime = options?.createRuntime ?? createRuntimeFromConfig
  const runtimeResolutionRef = shallowRef<CreateRuntimeFromConfigResult | null>(null)
  const runtimeResolutionError = shallowRef<Error | null>(null)
  const activeConfigKey = shallowRef<string | null>(null)

  watch(
    configSource,
    (nextConfig) => {
      const resolved = resolveTrChatConfigEntryInput(nextConfig)
      if (!resolved) {
        activeConfigKey.value = null
        runtimeResolutionRef.value = null
        runtimeResolutionError.value = new Error(TR_CHAT_CONFIG_ENTRY_ERROR)
        return
      }

      if (runtimeResolutionRef.value && activeConfigKey.value === resolved.key) {
        runtimeResolutionError.value = null
        return
      }

      const previousResolution = runtimeResolutionRef.value
      activeConfigKey.value = resolved.key
      runtimeResolutionError.value = null
      runtimeResolutionRef.value = createRuntime(resolved.config)
      previousResolution?.dispose?.()
    },
    { immediate: true },
  )

  return computed(() => {
    if (runtimeResolutionError.value) {
      throw runtimeResolutionError.value
    }

    if (!runtimeResolutionRef.value) {
      throw new Error('[TrChat] Failed to initialize the TrChat config runtime resolution.')
    }

    return runtimeResolutionRef.value
  })
}
