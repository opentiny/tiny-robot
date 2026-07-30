import type { ChatMessageItem, ChatRunConfig } from '../types'

export const CHAT_RUN_CONFIG_METADATA_KEY = '__chat_run_config'

export function cloneRunConfig(runConfig?: ChatRunConfig): ChatRunConfig | undefined {
  if (!runConfig) {
    return undefined
  }

  return {
    ...runConfig,
    mcpServerIds: runConfig.mcpServerIds ? [...runConfig.mcpServerIds] : undefined,
    features: runConfig.features ? { ...runConfig.features } : undefined,
    reasoning: runConfig.reasoning ? { ...runConfig.reasoning } : undefined,
  }
}

export function readRunConfigFromMessage(message?: ChatMessageItem): ChatRunConfig | undefined {
  const raw = message?.metadata?.[CHAT_RUN_CONFIG_METADATA_KEY]

  if (!raw || typeof raw !== 'object') {
    return undefined
  }

  return cloneRunConfig(raw as ChatRunConfig)
}
