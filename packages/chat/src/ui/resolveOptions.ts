import { createDefaultChatUIOptions } from './defaults'
import type {
  ChatAsideOptions,
  ChatBrandOptions,
  ChatBubbleOptions,
  ChatCssSize,
  ChatHistoryOptions,
  ChatLabels,
  ChatPromptsOptions,
  ChatRightAsideOptions,
  ChatSenderOptions,
  ChatUIOptions,
  ChatWelcomeOptions,
} from '../types'

export interface ResolvedChatLayoutOptions {
  contentMaxWidth: ChatCssSize
  panelPadding: ChatCssSize
  panelGap: ChatCssSize
  leftAside: false | ResolvedChatAsideOptions
  rightAside: false | ResolvedChatRightAsideOptions
}

export type ResolvedChatBrandOptions = ChatBrandOptions & {
  name: string
  logo: unknown
}

export type ResolvedChatAsideOptions = Required<ChatAsideOptions>
export type ResolvedChatRightAsideOptions = Required<Omit<ChatRightAsideOptions, 'open' | 'onOpenChange'>> &
  Pick<ChatRightAsideOptions, 'open' | 'onOpenChange'>

export type ResolvedChatHistoryOptions = ChatHistoryOptions & {
  menuItems: NonNullable<ChatHistoryOptions['menuItems']>
}

export type ResolvedChatBubbleOptions = ChatBubbleOptions & {
  autoScroll: boolean
  bubbleList: NonNullable<ChatBubbleOptions['bubbleList']>
}

export type ResolvedChatWelcomeOptions = ChatWelcomeOptions & {
  title: string
  description: string
}

export type ResolvedChatPromptsOptions = Omit<ChatPromptsOptions, 'items'> & {
  items: NonNullable<ChatPromptsOptions['items']>
}

export type ResolvedChatSenderOptions = Omit<ChatSenderOptions, 'clearOnSubmit' | 'onInput' | 'onFocus' | 'onBlur'> & {
  clearOnSubmit: boolean
  onInput: (value: string) => void
  onFocus: (event: FocusEvent) => void
  onBlur: (event: FocusEvent) => void
}

export interface ResolvedChatModelOptions {
  onSelect: (payload: { id: string | null }) => void
  onFeatureChange: (payload: { id: string; enabled: boolean }) => void
}

export interface ResolvedChatMcpOptions {
  onAddServer: (payload: { id: string }) => void
  onRemoveServer: (payload: { id: string }) => void
  onServerEnabledChange: (payload: { id: string; enabled: boolean }) => void
  onToolEnabledChange: (payload: { serverId: string; toolId: string; enabled: boolean }) => void
}

export interface ResolvedChatUIOptions {
  layout: ResolvedChatLayoutOptions
  brand: ResolvedChatBrandOptions
  labels: ChatLabels
  header: boolean
  history: false | ResolvedChatHistoryOptions
  bubble: ResolvedChatBubbleOptions
  welcome: false | ResolvedChatWelcomeOptions
  prompts: false | ResolvedChatPromptsOptions
  sender: false | ResolvedChatSenderOptions
  model: false | ResolvedChatModelOptions
  mcp: false | ResolvedChatMcpOptions
}

function noop() {}

export function resolveChatUIOptions(
  options: ChatUIOptions | undefined,
  slots: { hasRightAside?: boolean } = {},
): ResolvedChatUIOptions {
  const defaults = createDefaultChatUIOptions()
  const labels = {
    ...defaults.labels,
    ...withoutUndefined(options?.labels),
  }
  const layoutOverrides = options?.layout
  const leftAsideOverrides = layoutOverrides?.leftAside === false ? undefined : layoutOverrides?.leftAside
  const rightAsideOverrides = layoutOverrides?.rightAside === false ? undefined : layoutOverrides?.rightAside
  const historyOverrides = options?.history === false ? undefined : options?.history
  const historyDefaults = {
    ...defaults.history,
    menuItems: [
      { id: 'rename', text: labels.renameConversation },
      { id: 'delete', text: labels.deleteConversation },
    ],
  }
  const welcomeOverrides = options?.welcome === false ? undefined : options?.welcome
  const welcomeDefaults = {
    ...defaults.welcome,
    title: labels.welcomeTitle,
    description: labels.welcomeDescription,
  }
  const promptsOverrides = options?.prompts === false ? undefined : options?.prompts
  const senderOverrides = options?.sender === false ? undefined : options?.sender

  return {
    layout: {
      contentMaxWidth: layoutOverrides?.contentMaxWidth ?? defaults.layout.contentMaxWidth,
      panelPadding: layoutOverrides?.panelPadding ?? defaults.layout.panelPadding,
      panelGap: layoutOverrides?.panelGap ?? defaults.layout.panelGap,
      leftAside:
        layoutOverrides?.leftAside === false
          ? false
          : {
              mode: leftAsideOverrides?.mode ?? defaults.layout.leftAside.mode,
              width: leftAsideOverrides?.width ?? defaults.layout.leftAside.width,
              collapsedWidth: leftAsideOverrides?.collapsedWidth ?? defaults.layout.leftAside.collapsedWidth,
              defaultOpen: leftAsideOverrides?.defaultOpen ?? defaults.layout.leftAside.defaultOpen,
            },
      rightAside:
        layoutOverrides?.rightAside === false
          ? false
          : rightAsideOverrides || slots.hasRightAside
            ? {
                open: rightAsideOverrides?.open,
                mode: rightAsideOverrides?.mode ?? 'dock',
                width: rightAsideOverrides?.width ?? 320,
                collapsedWidth: rightAsideOverrides?.collapsedWidth ?? 0,
                defaultOpen: rightAsideOverrides?.defaultOpen ?? true,
                showClose: rightAsideOverrides?.showClose ?? true,
                onOpenChange: rightAsideOverrides?.onOpenChange,
              }
            : false,
    },
    brand: {
      ...defaults.brand,
      ...withoutUndefined(options?.brand),
    },
    labels,
    header: options?.header !== false,
    history:
      options?.history === false
        ? false
        : {
            ...historyDefaults,
            ...withoutUndefined(historyOverrides),
            menuItems: historyOverrides?.menuItems ? [...historyOverrides.menuItems] : [...historyDefaults.menuItems],
          },
    bubble: {
      ...defaults.bubble,
      ...withoutUndefined(options?.bubble),
      autoScroll: options?.bubble?.autoScroll ?? defaults.bubble.autoScroll,
      bubbleProvider: options?.bubble?.bubbleProvider ?? defaults.bubble.bubbleProvider,
      bubbleList: {
        ...defaults.bubble.bubbleList,
        ...withoutUndefined(options?.bubble?.bubbleList),
        roleConfigs: {
          ...defaults.bubble.bubbleList?.roleConfigs,
          ...withoutUndefinedRecord(options?.bubble?.bubbleList?.roleConfigs),
        },
      },
    },
    welcome:
      options?.welcome === false
        ? false
        : {
            ...welcomeDefaults,
            ...withoutUndefined(welcomeOverrides),
            title: welcomeOverrides?.title ?? welcomeDefaults.title,
            description: welcomeOverrides?.description ?? welcomeDefaults.description,
          },
    prompts:
      options?.prompts === false
        ? false
        : {
            ...defaults.prompts,
            ...withoutUndefined(promptsOverrides),
            items: [...(promptsOverrides?.items ?? defaults.prompts.items)],
          },
    sender:
      options?.sender === false
        ? false
        : {
            ...defaults.sender,
            ...withoutUndefined(senderOverrides),
            clearOnSubmit: senderOverrides?.clearOnSubmit ?? defaults.sender.clearOnSubmit,
            onInput: senderOverrides?.onInput ?? noop,
            onFocus: senderOverrides?.onFocus ?? noop,
            onBlur: senderOverrides?.onBlur ?? noop,
          },
    model:
      options?.model === false
        ? false
        : {
            onSelect: options?.model?.onSelect ?? noop,
            onFeatureChange: options?.model?.onFeatureChange ?? noop,
          },
    mcp:
      options?.mcp === false
        ? false
        : {
            onAddServer: options?.mcp?.onAddServer ?? noop,
            onRemoveServer: options?.mcp?.onRemoveServer ?? noop,
            onServerEnabledChange: options?.mcp?.onServerEnabledChange ?? noop,
            onToolEnabledChange: options?.mcp?.onToolEnabledChange ?? noop,
          },
  }
}

function withoutUndefined<T extends object>(value: T | undefined): Partial<T> {
  const result: Partial<T> = {}

  if (!value) {
    return result
  }

  for (const key of Object.keys(value) as Array<keyof T>) {
    if (value[key] !== undefined) {
      result[key] = value[key]
    }
  }

  return result
}

function withoutUndefinedRecord<T>(value: Readonly<Record<string, T | undefined>> | undefined): Record<string, T> {
  const result: Record<string, T> = {}

  if (!value) {
    return result
  }

  for (const [key, nextValue] of Object.entries(value)) {
    if (nextValue !== undefined) {
      result[key] = nextValue
    }
  }

  return result
}
