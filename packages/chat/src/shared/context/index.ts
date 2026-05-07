import { getCurrentInstance, inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type {
  ChatAttachmentsFeaturePreset,
  ChatBubbleRenderers,
  ChatContentLayout,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatMessageActionPayload,
  ChatMessages,
  ChatSenderActionsFeaturePreset,
  BrandConfig,
  ChatAppearanceConfig,
  ChatListVariant,
  ChatRuntime,
  ModelOption,
  WelcomeConfig,
  ChatWorkspaceShellConfig,
} from '@/types'
import type { UseMcpManagerReturn } from '@/components/mcp/useMcpManager'
import type { UseChatAttachmentsReturn } from '@/components/attachments/useChatAttachments'
import type { BubbleListProps, PromptProps } from '@opentiny/tiny-robot'
import type { ChatUiContextValue } from '@/shared/context/chatUiContext'
import type { UseChatKitReturn } from '@/types/core'

export { createChatUiContext } from '@/shared/context/chatUiContext'
export type {
  ChatHistoryDisplayMode,
  ChatUiContextValue,
  ChatWorkspaceRegionState,
  ChatWorkspaceState,
  CreateChatUiContextOptions,
} from '@/shared/context/chatUiContext'

export const CHAT_KIT_KEY: InjectionKey<UseChatKitReturn> = Symbol('chatKit')

export function useRequiredInject<T>(
  key: InjectionKey<T>,
  dependencyName: string,
  componentName?: string,
): NonNullable<T> {
  const value = inject(key, null as T | null)
  const resolvedComponentName = componentName ?? getCurrentInstance()?.type.name ?? 'AnonymousComponent'

  if (value == null) {
    throw new Error(`[${resolvedComponentName}] Missing required ${dependencyName} context`)
  }

  return value as NonNullable<T>
}

export const CHAT_UI_KEY: InjectionKey<ChatUiContextValue> = Symbol('chatUI')
export const CHAT_RUNTIME_KEY: InjectionKey<ChatRuntime> = Symbol('chatRuntime')

export interface ChatPageWelcomeInput {
  title: string
  description?: string
  icon?: WelcomeConfig['icon'] | BrandConfig['logo']
  prompts?: PromptProps[]
}

export interface ChatPageHeaderInput {
  title?: string
  showHistory?: boolean
  showClose?: boolean
}

export interface ChatPageLayoutInput {
  show?: boolean
  roleConfigs?: BubbleListProps['roleConfigs']
  contentLayout?: ChatContentLayout
  bubbleRenderers?: ChatBubbleRenderers
}

export interface ChatPageMessageListInput {
  autoScroll?: boolean
  variant?: ChatListVariant
  messageActions?: ChatMessageActionsInput
  messageActionsMode?: ChatMessageActionsMode
  onActionClick?: (payload: ChatMessageActionPayload) => void
  groupStrategy?: BubbleListProps['groupStrategy']
  showFeedback?: boolean
}

export interface ChatPageModelSelectorInput {
  enabled: boolean
  models?: ModelOption[]
  defaultModel?: string
}

export interface ChatPageHistoryInput {
  enabled: boolean
}

export interface ChatPageInputsValue {
  header?: ChatPageHeaderInput
  layout?: ChatPageLayoutInput
  welcome?: ChatPageWelcomeInput
  messageList?: ChatPageMessageListInput
  history?: ChatPageHistoryInput
  appearance?: ChatAppearanceConfig
  shell?: ChatWorkspaceShellConfig
  modelSelector?: ChatPageModelSelectorInput
  updateModel?: (model: ModelOption) => void
}

export const CHAT_PAGE_INPUTS_KEY: InjectionKey<ComputedRef<ChatPageInputsValue>> = Symbol('chatPageInputs')

export const MCP_MANAGER_KEY: InjectionKey<UseMcpManagerReturn> = Symbol('mcpManager')

export const CHAT_ATTACHMENTS_KEY: InjectionKey<{
  manager: UseChatAttachmentsReturn
  feature: ChatAttachmentsFeaturePreset
}> = Symbol('chatAttachments')

export const CHAT_SENDER_ACTIONS_KEY: InjectionKey<{
  feature: ChatSenderActionsFeaturePreset
}> = Symbol('chatSenderActions')

export const CHAT_MESSAGES_KEY: InjectionKey<ComputedRef<ChatMessages>> = Symbol('chatMessages')

export const MESSAGE_ACTION_KEY: InjectionKey<((payload: ChatMessageActionPayload) => void) | undefined> =
  Symbol('messageAction')

export const MESSAGE_ACTIONS_KEY: InjectionKey<{
  messageActions: ComputedRef<ChatMessageActionsInput | undefined>
  messageActionsMode: ComputedRef<ChatMessageActionsMode | undefined>
}> = Symbol('messageActions')

export const BUBBLE_CONFIG_KEY: InjectionKey<{
  roleConfigs: ComputedRef<BubbleListProps['roleConfigs'] | undefined>
}> = Symbol('bubbleConfig')

export const BUBBLE_LIST_SLOTS = ['prefix', 'suffix', 'after', 'content-footer'] as const

export const CHAT_HISTORY_KEY: InjectionKey<{
  isManagementMode: Ref<boolean>
  selectedItems: Ref<string[]>
  searchQuery: Ref<string>
  toggleItemSelection: (itemId: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
}> = Symbol('chatHistory')

export function useChatPageInputs() {
  return inject(CHAT_PAGE_INPUTS_KEY, null)
}
