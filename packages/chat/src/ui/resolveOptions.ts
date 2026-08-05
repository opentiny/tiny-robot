import { createDefaultChatUIOptions } from './defaults'
import type {
  ChatAsideOptions,
  ChatBrandOptions,
  ChatComposerOptions,
  ChatCssSize,
  ChatHeaderOptions,
  ChatHistoryOptions,
  ChatLabels,
  ChatMessagesOptions,
  ChatPromptsOptions,
  ChatUIOptions,
  ChatWelcomeOptions,
} from '../types'

export interface ResolvedChatLayoutOptions {
  contentMaxWidth: ChatCssSize
  panelPadding: ChatCssSize
  panelGap: ChatCssSize
}

export type ResolvedChatBrandOptions = ChatBrandOptions & {
  name: string
  logo: unknown
}

export interface ResolvedChatHeaderOptions extends ChatHeaderOptions {
  showThemeToggle: boolean
}

export type ResolvedChatAsideOptions = Required<ChatAsideOptions>

export type ResolvedChatHistoryOptions = ChatHistoryOptions & {
  menuItems: NonNullable<ChatHistoryOptions['menuItems']>
}

export type ResolvedChatMessagesOptions = ChatMessagesOptions & {
  autoScroll: boolean
  bubbleList: NonNullable<ChatMessagesOptions['bubbleList']>
}

export type ResolvedChatWelcomeOptions = ChatWelcomeOptions & {
  title: string
  description: string
}

export type ResolvedChatPromptsOptions = Omit<ChatPromptsOptions, 'items'> & {
  items: NonNullable<ChatPromptsOptions['items']>
}

export type ResolvedChatComposerOptions = Omit<ChatComposerOptions, 'clearOnSubmit' | 'sender'> & {
  clearOnSubmit: boolean
  sender: NonNullable<ChatComposerOptions['sender']>
}

export interface ResolvedChatUIOptions {
  layout: ResolvedChatLayoutOptions
  brand: ResolvedChatBrandOptions
  labels: ChatLabels
  header: false | ResolvedChatHeaderOptions
  leftAside: false | ResolvedChatAsideOptions
  rightAside: false | ResolvedChatAsideOptions
  history: false | ResolvedChatHistoryOptions
  messages: ResolvedChatMessagesOptions
  welcome: false | ResolvedChatWelcomeOptions
  prompts: false | ResolvedChatPromptsOptions
  composer: false | ResolvedChatComposerOptions
}

export function resolveChatUIOptions(
  options: ChatUIOptions | undefined,
  slots: { hasRightAside?: boolean } = {},
): ResolvedChatUIOptions {
  const defaults = createDefaultChatUIOptions()
  const labels = {
    ...defaults.labels,
    ...withoutUndefined(options?.labels),
  }
  const headerOverrides = options?.header === false ? undefined : options?.header
  const leftAsideOverrides = options?.leftAside === false ? undefined : options?.leftAside
  const rightAsideOverrides = options?.rightAside === false ? undefined : options?.rightAside
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
  const composerOverrides = options?.composer === false ? undefined : options?.composer

  return {
    layout: {
      ...defaults.layout,
      ...withoutUndefined(options?.layout),
    },
    brand: {
      ...defaults.brand,
      ...withoutUndefined(options?.brand),
    },
    labels,
    header:
      options?.header === false
        ? false
        : {
            showThemeToggle: headerOverrides?.showThemeToggle ?? defaults.header.showThemeToggle ?? true,
          },
    leftAside:
      options?.leftAside === false
        ? false
        : {
            mode: leftAsideOverrides?.mode ?? defaults.leftAside.mode,
            width: leftAsideOverrides?.width ?? defaults.leftAside.width,
            collapsedWidth: leftAsideOverrides?.collapsedWidth ?? defaults.leftAside.collapsedWidth,
            defaultOpen: leftAsideOverrides?.defaultOpen ?? defaults.leftAside.defaultOpen,
          },
    rightAside:
      options?.rightAside === false
        ? false
        : rightAsideOverrides || slots.hasRightAside
          ? {
              mode: rightAsideOverrides?.mode ?? 'dock',
              width: rightAsideOverrides?.width ?? 320,
              collapsedWidth: rightAsideOverrides?.collapsedWidth ?? 0,
              defaultOpen: rightAsideOverrides?.defaultOpen ?? true,
            }
          : false,
    history:
      options?.history === false
        ? false
        : {
            ...historyDefaults,
            ...withoutUndefined(historyOverrides),
            menuItems: historyOverrides?.menuItems ?? historyDefaults.menuItems,
          },
    messages: {
      ...defaults.messages,
      ...withoutUndefined(options?.messages),
      autoScroll: options?.messages?.autoScroll ?? defaults.messages.autoScroll,
      bubbleProvider: options?.messages?.bubbleProvider ?? defaults.messages.bubbleProvider,
      bubbleList: {
        ...defaults.messages.bubbleList,
        ...withoutUndefined(options?.messages?.bubbleList),
        roleConfigs: {
          ...defaults.messages.bubbleList?.roleConfigs,
          ...withoutUndefinedRecord(options?.messages?.bubbleList?.roleConfigs),
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
    composer:
      options?.composer === false
        ? false
        : {
            ...defaults.composer,
            ...withoutUndefined(composerOverrides),
            clearOnSubmit: composerOverrides?.clearOnSubmit ?? defaults.composer.clearOnSubmit,
            sender: {
              ...defaults.composer.sender,
              ...withoutUndefined(composerOverrides?.sender),
            },
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
