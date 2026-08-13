import { createDefaultChatUIOptions } from './defaults'
import type { DefaultChatUIOptions } from './defaults'
import type {
  ChatAsideOptions,
  ChatBrandOptions,
  ChatBubbleOptions,
  ChatCssSize,
  ChatHistoryOptions,
  ChatLabels,
  ChatLayoutOptions,
  ChatMcpOptions,
  ChatModelOptions,
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

export type ResolvedChatAsideOptions = Required<Omit<ChatAsideOptions, 'open'>> & Pick<ChatAsideOptions, 'open'>
export type ResolvedChatRightAsideOptions = Required<Omit<ChatRightAsideOptions, 'open'>> &
  Pick<ChatRightAsideOptions, 'open'>

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

export type ResolvedChatSenderOptions = ChatSenderOptions
export type ResolvedChatModelOptions = ChatModelOptions
export type ResolvedChatMcpOptions = ChatMcpOptions

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

interface ResolveSlots {
  hasRightAside?: boolean
}

export function resolveChatUIOptions(
  options: ChatUIOptions | undefined,
  slots: ResolveSlots = {},
): ResolvedChatUIOptions {
  const defaults = createDefaultChatUIOptions()
  const labels = resolveLabels(defaults.labels, options?.labels)

  return {
    layout: resolveLayout(defaults.layout, options?.layout, slots),
    brand: resolveBrand(defaults.brand, options?.brand),
    labels,
    header: options?.header !== false,
    history: resolveHistory(defaults.history, options?.history, labels),
    bubble: resolveBubble(defaults.bubble, options?.bubble),
    welcome: resolveWelcome(defaults.welcome, options?.welcome, labels),
    prompts: resolvePrompts(defaults.prompts, options?.prompts),
    sender: resolveSender(defaults.sender, options?.sender),
    model: resolveModel(options?.model),
    mcp: resolveMcp(options?.mcp),
  }
}

function resolveLabels(defaults: ChatLabels, options: Partial<ChatLabels> | undefined): ChatLabels {
  return {
    ...defaults,
    ...withoutUndefined(options),
  }
}

function resolveLayout(
  defaults: DefaultChatUIOptions['layout'],
  options: ChatLayoutOptions | undefined,
  slots: ResolveSlots,
): ResolvedChatLayoutOptions {
  return {
    contentMaxWidth: options?.contentMaxWidth ?? defaults.contentMaxWidth,
    panelPadding: options?.panelPadding ?? defaults.panelPadding,
    panelGap: options?.panelGap ?? defaults.panelGap,
    leftAside: resolveLeftAside(defaults.leftAside, options?.leftAside),
    rightAside: resolveRightAside(options?.rightAside, slots),
  }
}

function resolveLeftAside(
  defaults: DefaultChatUIOptions['layout']['leftAside'],
  options: false | ChatAsideOptions | undefined,
): false | ResolvedChatAsideOptions {
  if (options === false) {
    return false
  }

  return {
    mode: options?.mode ?? defaults.mode,
    width: options?.width ?? defaults.width,
    collapsedWidth: options?.collapsedWidth ?? defaults.collapsedWidth,
    open: options?.open,
    defaultOpen: options?.defaultOpen ?? defaults.defaultOpen,
  }
}

function resolveRightAside(
  options: false | ChatRightAsideOptions | undefined,
  slots: ResolveSlots,
): false | ResolvedChatRightAsideOptions {
  if (options === false) {
    return false
  }

  if (!options && !slots.hasRightAside) {
    return false
  }

  return {
    open: options?.open,
    mode: options?.mode ?? 'dock',
    width: options?.width ?? 320,
    collapsedWidth: options?.collapsedWidth ?? 0,
    defaultOpen: options?.defaultOpen ?? true,
    showClose: options?.showClose ?? true,
  }
}

function resolveBrand(
  defaults: DefaultChatUIOptions['brand'],
  options: ChatBrandOptions | undefined,
): ResolvedChatBrandOptions {
  return {
    ...defaults,
    ...withoutUndefined(options),
  }
}

function resolveHistory(
  defaults: DefaultChatUIOptions['history'],
  options: false | ChatHistoryOptions | undefined,
  labels: ChatLabels,
): false | ResolvedChatHistoryOptions {
  if (options === false) {
    return false
  }

  const nextDefaults = {
    ...defaults,
    menuItems: [
      { id: 'rename', text: labels.renameConversation },
      { id: 'delete', text: labels.deleteConversation },
    ],
  }

  return {
    ...nextDefaults,
    ...withoutUndefined(options),
    menuItems: options?.menuItems ? [...options.menuItems] : [...nextDefaults.menuItems],
  }
}

function resolveBubble(
  defaults: DefaultChatUIOptions['bubble'],
  options: ChatBubbleOptions | undefined,
): ResolvedChatBubbleOptions {
  return {
    ...defaults,
    ...withoutUndefined(options),
    autoScroll: options?.autoScroll ?? defaults.autoScroll,
    bubbleProvider: options?.bubbleProvider ?? defaults.bubbleProvider,
    bubbleList: {
      ...defaults.bubbleList,
      ...withoutUndefined(options?.bubbleList),
      roleConfigs: {
        ...defaults.bubbleList?.roleConfigs,
        ...withoutUndefinedRecord(options?.bubbleList?.roleConfigs),
      },
    },
  }
}

function resolveWelcome(
  defaults: DefaultChatUIOptions['welcome'],
  options: false | ChatWelcomeOptions | undefined,
  labels: ChatLabels,
): false | ResolvedChatWelcomeOptions {
  if (options === false) {
    return false
  }

  const nextDefaults = {
    ...defaults,
    title: labels.welcomeTitle,
    description: labels.welcomeDescription,
  }

  return {
    ...nextDefaults,
    ...withoutUndefined(options),
    title: options?.title ?? nextDefaults.title,
    description: options?.description ?? nextDefaults.description,
  }
}

function resolvePrompts(
  defaults: DefaultChatUIOptions['prompts'],
  options: false | ChatPromptsOptions | undefined,
): false | ResolvedChatPromptsOptions {
  if (options === false) {
    return false
  }

  return {
    ...defaults,
    ...withoutUndefined(options),
    items: [...(options?.items ?? defaults.items)],
  }
}

function resolveSender(
  defaults: DefaultChatUIOptions['sender'],
  options: false | ChatSenderOptions | undefined,
): false | ResolvedChatSenderOptions {
  if (options === false) {
    return false
  }

  return {
    ...defaults,
    ...withoutUndefined(options),
  }
}

function resolveModel(options: false | ChatModelOptions | undefined): false | ResolvedChatModelOptions {
  if (options === false) {
    return false
  }

  return options ?? {}
}

function resolveMcp(options: false | ChatMcpOptions | undefined): false | ResolvedChatMcpOptions {
  if (options === false) {
    return false
  }

  return options ?? {}
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
