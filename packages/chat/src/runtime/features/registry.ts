import type { TrChatPresetOverrides } from '@/types'
import type {
  BuiltInChatFeatureKey,
  ChatAttachmentsFeatureResolution,
  ChatFeatureConfigMap,
  ChatFeatureInput,
  ChatMcpFeatureConfig,
  ChatMcpFeatureResolution,
  ChatFeaturePresetProps,
  ChatFeedbackFeatureConfig,
  ChatFeedbackFeatureResolution,
  ChatHistoryFeatureConfig,
  ChatHistoryFeatureResolution,
  ChatSenderActionsFeatureResolution,
  ChatWelcomePromptsFeatureResolution,
  ResolvedChatFeatures,
} from './featureTypes'

interface ChatFeatureDefinition<TKey extends BuiltInChatFeatureKey, TConfig, TResolution> {
  key: TKey
  resolve: (config: TConfig | undefined) => TResolution
}

export function isChatFeatureExplicitlyDisabled(config: ChatFeatureInput | undefined): boolean {
  if (config === false) {
    return true
  }

  if (typeof config === 'object' && config !== null) {
    return config.enabled === false
  }

  return false
}

function isFeatureEnabled(config: ChatFeatureInput | undefined): boolean {
  if (config === undefined) {
    return false
  }

  if (typeof config === 'boolean') {
    return config
  }

  return config.enabled ?? true
}

function mergePresetProps(...parts: ChatFeaturePresetProps[]): ChatFeaturePresetProps {
  return Object.assign({}, ...parts)
}

const attachmentsFeature: ChatFeatureDefinition<
  'attachments',
  ChatFeatureConfigMap['attachments'],
  ChatAttachmentsFeatureResolution
> = {
  key: 'attachments',
  resolve(config) {
    const enabled = isFeatureEnabled(config)
    const resolvedConfig = typeof config === 'object' && config !== null ? config : undefined

    return {
      key: 'attachments',
      enabled,
      config: resolvedConfig,
      presetProps: enabled
        ? {
            attachmentsFeature: {
              enabled: true,
              upload: {
                enabled: resolvedConfig?.upload?.enabled ?? true,
                accept: resolvedConfig?.upload?.accept ?? '*',
                multiple: resolvedConfig?.upload?.multiple ?? true,
                maxCount: resolvedConfig?.upload?.maxCount,
                maxSize: resolvedConfig?.upload?.maxSize,
                tooltip: resolvedConfig?.upload?.tooltip,
                tooltipPlacement: resolvedConfig?.upload?.tooltipPlacement ?? 'top',
              },
              list: {
                variant: resolvedConfig?.list?.variant ?? 'card',
                wrap: resolvedConfig?.list?.wrap ?? true,
                actions: resolvedConfig?.list?.actions,
                fileIcons: resolvedConfig?.list?.fileIcons,
                fileMatchers: resolvedConfig?.list?.fileMatchers,
                disabled: resolvedConfig?.list?.disabled,
              },
            },
          }
        : {},
    }
  },
}

const senderActionsFeature: ChatFeatureDefinition<
  'senderActions',
  ChatFeatureConfigMap['senderActions'],
  ChatSenderActionsFeatureResolution
> = {
  key: 'senderActions',
  resolve(config) {
    const enabled = isFeatureEnabled(config)
    const resolvedConfig = typeof config === 'object' && config !== null ? config : undefined

    return {
      key: 'senderActions',
      enabled,
      config: resolvedConfig,
      presetProps: enabled
        ? {
            senderActionsFeature: {
              enabled: true,
              upload:
                resolvedConfig?.upload === undefined
                  ? undefined
                  : {
                      enabled: resolvedConfig.upload.enabled ?? true,
                      accept: resolvedConfig.upload.accept ?? '*',
                      multiple: resolvedConfig.upload.multiple ?? true,
                      maxCount: resolvedConfig.upload.maxCount,
                      maxSize: resolvedConfig.upload.maxSize,
                      tooltip: resolvedConfig.upload.tooltip,
                      tooltipPlacement: resolvedConfig.upload.tooltipPlacement ?? 'top',
                    },
              voice:
                resolvedConfig?.voice === undefined
                  ? undefined
                  : {
                      enabled: resolvedConfig.voice.enabled ?? true,
                      tooltip: resolvedConfig.voice.tooltip,
                      tooltipPlacement: resolvedConfig.voice.tooltipPlacement ?? 'top',
                      size: resolvedConfig.voice.size,
                      speechConfig: resolvedConfig.voice.speechConfig,
                      autoInsert: resolvedConfig.voice.autoInsert,
                      onButtonClick: resolvedConfig.voice.onButtonClick,
                      icon: resolvedConfig.voice.icon,
                      recordingIcon: resolvedConfig.voice.recordingIcon,
                    },
              wordCount: resolvedConfig?.wordCount ?? false,
              defaultActions: resolvedConfig?.defaultActions,
            },
          }
        : {},
    }
  },
}

const welcomePromptsFeature: ChatFeatureDefinition<
  'welcomePrompts',
  ChatFeatureConfigMap['welcomePrompts'],
  ChatWelcomePromptsFeatureResolution
> = {
  key: 'welcomePrompts',
  resolve(config) {
    const hasConfig = config !== undefined
    const enabled = isFeatureEnabled(config)
    const resolvedConfig = typeof config === 'object' && config !== null ? config : undefined
    const welcomePrompts = resolvedConfig?.welcome

    return {
      key: 'welcomePrompts',
      enabled,
      config: resolvedConfig,
      presetProps: enabled
        ? welcomePrompts?.length
          ? {
              prompts: welcomePrompts,
            }
          : {}
        : hasConfig
          ? {
              prompts: [],
            }
          : {},
    }
  },
}

const mcpFeature: ChatFeatureDefinition<'mcp', ChatMcpFeatureConfig, ChatMcpFeatureResolution> = {
  key: 'mcp',
  resolve(config) {
    const enabled = isFeatureEnabled(config)
    const resolvedConfig = typeof config === 'object' && config !== null ? config : undefined

    return {
      key: 'mcp',
      enabled,
      config: resolvedConfig,
      presetProps:
        enabled && resolvedConfig?.manager
          ? {
              mcpManager: resolvedConfig.manager,
            }
          : {},
    }
  },
}

const historyFeature: ChatFeatureDefinition<'history', ChatHistoryFeatureConfig, ChatHistoryFeatureResolution> = {
  key: 'history',
  resolve(config) {
    const enabled = isFeatureEnabled(config)
    const resolvedConfig = typeof config === 'object' && config !== null ? config : undefined

    return {
      key: 'history',
      enabled,
      config: resolvedConfig,
      presetProps: enabled
        ? {
            showHistory: true,
            historyProps: resolvedConfig?.props as TrChatPresetOverrides['historyProps'],
          }
        : {},
    }
  },
}

const feedbackFeature: ChatFeatureDefinition<'feedback', ChatFeedbackFeatureConfig, ChatFeedbackFeatureResolution> = {
  key: 'feedback',
  resolve(config) {
    const enabled = isFeatureEnabled(config)
    const resolvedConfig = typeof config === 'object' && config !== null ? config : undefined

    return {
      key: 'feedback',
      enabled,
      config: resolvedConfig,
      presetProps: enabled
        ? {
            showFeedback: true,
          }
        : {},
    }
  },
}

export const CHAT_FEATURE_REGISTRY = {
  attachments: attachmentsFeature,
  senderActions: senderActionsFeature,
  welcomePrompts: welcomePromptsFeature,
  mcp: mcpFeature,
  history: historyFeature,
  feedback: feedbackFeature,
} as const

export function resolveChatFeatures(config: ChatFeatureConfigMap | undefined): ResolvedChatFeatures {
  const entries = {
    attachments: CHAT_FEATURE_REGISTRY.attachments.resolve(config?.attachments),
    senderActions: CHAT_FEATURE_REGISTRY.senderActions.resolve(config?.senderActions),
    welcomePrompts: CHAT_FEATURE_REGISTRY.welcomePrompts.resolve(config?.welcomePrompts),
    mcp: CHAT_FEATURE_REGISTRY.mcp.resolve(config?.mcp),
    history: CHAT_FEATURE_REGISTRY.history.resolve(config?.history),
    feedback: CHAT_FEATURE_REGISTRY.feedback.resolve(config?.feedback),
  }

  const enabledKeys = Object.values(entries)
    .filter((entry) => entry.enabled)
    .map((entry) => entry.key)

  return {
    entries,
    enabledKeys,
    presetProps: mergePresetProps(
      entries.attachments.presetProps,
      entries.senderActions.presetProps,
      entries.welcomePrompts.presetProps,
      entries.mcp.presetProps,
      entries.history.presetProps,
      entries.feedback.presetProps,
    ),
  }
}
