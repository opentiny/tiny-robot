import type { Component, Ref, VNode } from 'vue'
import type {
  Attachment,
  AttachmentListProps,
  BubbleBoxRendererMatch,
  BubbleContentRendererMatch,
  BubbleListProps,
  BubbleListSlots,
  PromptProps,
  SenderProps,
  UploadButtonProps,
  VoiceButtonProps,
} from '@opentiny/tiny-robot'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { UseMcpManagerReturn } from '../components/mcp/useMcpManager'
import type { UseChatAttachmentsReturn } from '../components/attachments/useChatAttachments'
import type {
  BrandConfig,
  ChatAppearanceConfig,
  ChatContentLayout,
  ChatErrorInfo,
  ChatListVariant,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatMessageActionPayload,
  ChatStatus,
  TrChatProviderRuntimeOptions,
} from './core'
import type { ModelOption } from './model'
import type { TrChatConfigEntryInput } from './config'
import type { ChatWorkspaceShellConfig } from './workspace'

type ReadonlyRef<T> = Readonly<Ref<T>>

export interface WelcomeConfig {
  title: string
  description?: string
  icon?: VNode | Component
  prompts?: PromptProps[]
}

export interface ChatMessages {
  header: {
    newChat: string
    openHistory: string
    closeHistory: string
    close: string
  }
  history: {
    newSession: string
    manage: string
    done: string
    defaultConversationTitle: string
    searchPlaceholder: string
    deleteSelected: string
    cancel: string
  }
  sender: {
    placeholder: string
  }
  workspace: {
    expandLeftSidebar: string
    expandRightSidebar: string
    historyRailLabel: string
    previewRailLabel: string
    toggleRightPanel: string
    rightPanelTitle: string
    closeRightPanel: string
  }
  modelSelector: {
    triggerLabel: string
  }
  attachments: {
    uploadTooltip: string
  }
  senderActions: {
    uploadTooltip: string
    voiceTooltip: string
  }
  feedback: {
    copy: string
    edit: string
    regenerate: string
  }
  editMessage: {
    placeholder: string
    cancel: string
    save: string
    saving: string
  }
  toolCall: {
    running: string
    success: string
    failed: string
    cancelled: string
    untitled: string
  }
  error: {
    defaultMessage: string
    retry: string
  }
  mcp: {
    triggerLabel: string
    triggerActiveTitle: string
    triggerInactiveTitle: string
    addPlugin: string
    installPlugin: string
  }
  sidebar: {
    collapse: string
    close: string
    emptyTitle: string
    emptyDescription: string
  }
}

export type ChatMessagesOverrides = {
  [K in keyof ChatMessages]?: Partial<ChatMessages[K]>
}

export interface ChatAttachmentsUploadConfig extends Pick<
  UploadButtonProps,
  'accept' | 'multiple' | 'maxCount' | 'maxSize' | 'tooltip' | 'tooltipPlacement'
> {
  enabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ChatAttachmentsListConfig extends Pick<
  AttachmentListProps,
  'variant' | 'wrap' | 'actions' | 'fileIcons' | 'fileMatchers' | 'disabled'
> {}

export interface ChatAttachmentsFeaturePreset {
  enabled?: boolean
  upload?: ChatAttachmentsUploadConfig
  list?: ChatAttachmentsListConfig
}

export interface ChatSenderActionUploadConfig extends Pick<
  UploadButtonProps,
  'accept' | 'multiple' | 'maxCount' | 'maxSize' | 'tooltip' | 'tooltipPlacement'
> {
  enabled?: boolean
}

export interface ChatSenderActionVoiceConfig extends Pick<
  VoiceButtonProps,
  'tooltip' | 'tooltipPlacement' | 'size' | 'speechConfig' | 'autoInsert' | 'onButtonClick'
> {
  enabled?: boolean
  icon?: VoiceButtonProps['icon']
  recordingIcon?: VoiceButtonProps['recordingIcon']
}

export interface ChatSenderActionsFeaturePreset {
  enabled?: boolean
  upload?: ChatSenderActionUploadConfig
  voice?: ChatSenderActionVoiceConfig
  wordCount?: boolean
  defaultActions?: SenderProps['defaultActions']
}

export interface UseChatAttachmentsOptions {
  initialItems?: Attachment[]
}

export interface ChatBubbleRenderers {
  contentMatches?: BubbleContentRendererMatch[]
  boxMatches?: BubbleBoxRendererMatch[]
}

export interface TrChatPresetOverrides {
  mcpManager?: UseMcpManagerReturn
  attachmentsManager?: UseChatAttachmentsReturn
  appearance?: ChatAppearanceConfig
  shell?: ChatWorkspaceShellConfig
  brand?: BrandConfig
  welcome?: WelcomeConfig
  prompts?: PromptProps[]
  attachmentsFeature?: ChatAttachmentsFeaturePreset
  senderActionsFeature?: ChatSenderActionsFeaturePreset
  messages?: ChatMessagesOverrides
  placeholder?: string
  maxLength?: number
  senderMode?: 'single' | 'multiple'
  autoScroll?: boolean
  messageListVariant?: ChatListVariant
  contentLayout?: ChatContentLayout
  bubbleRenderers?: ChatBubbleRenderers
  showHistory?: boolean
  showFeedback?: boolean
  show?: boolean
  messageActions?: ChatMessageActionsInput
  messageActionsMode?: ChatMessageActionsMode
  onMessageAction?: (payload: ChatMessageActionPayload) => void
  roleConfigs?: BubbleListProps['roleConfigs']
  groupStrategy?: BubbleListProps['groupStrategy']
  senderProps?: SenderProps
  bubbleListProps?: Omit<BubbleListProps, 'roleConfigs' | 'groupStrategy' | 'messages'>
  historyProps?: Record<string, unknown>
  onModelChange?: (model: ModelOption) => void
}

export interface TrChatProps {
  config: TrChatConfigEntryInput
  mcpManager?: UseMcpManagerReturn
}

export type TrChatProviderSharedProps = {
  mcpManager?: UseMcpManagerReturn
  attachmentsManager?: UseChatAttachmentsReturn
  attachmentsFeature?: ChatAttachmentsFeaturePreset
  senderActionsFeature?: ChatSenderActionsFeaturePreset
  messages?: ChatMessagesOverrides
  shell?: ChatWorkspaceShellConfig
}

export type TrChatProviderProps = TrChatProviderSharedProps & TrChatProviderRuntimeOptions

export interface TrChatHeaderProps {
  showHistory?: boolean
  showNewChat?: boolean
  showClose?: boolean
  title?: string
  shell?: ChatWorkspaceShellConfig
}

export interface TrChatHeaderEmits {
  (e: 'close'): void
}

export interface TrChatHeaderSlots {
  title?: () => unknown
  extra?: () => unknown
}

export interface TrChatWelcomeProps {
  title?: string
  description?: string
  icon?: VNode | Component
  prompts?: PromptProps[]
}

export interface TrChatWelcomeEmits {
  (e: 'prompt-click', description: string): void
}

export interface TrChatHistoryProps {
  enabled?: boolean
  appearance?: ChatAppearanceConfig
}

export interface TrChatMessageListProps {
  autoScroll?: boolean
  variant?: ChatListVariant
  messageActions?: ChatMessageActionsInput
  messageActionsMode?: ChatMessageActionsMode
  onActionClick?: (payload: ChatMessageActionPayload) => void
  groupStrategy?: BubbleListProps['groupStrategy']
  roleConfigs?: BubbleListProps['roleConfigs']
  bubbleListProps?: Partial<TrChatMessageListForwardedProps>
}

export interface TrChatSenderProps {
  mode?: 'single' | 'multiple'
  placeholder?: string
  maxLength?: number
  extensions?: SenderProps['extensions']
  senderProps?: Partial<TrChatSenderForwardedProps>
}

export interface TrChatSenderFooterRightSlotProps {
  [key: string]: unknown
}

export interface TrChatSenderSlots {
  'footer-right'?: (props?: TrChatSenderFooterRightSlotProps) => unknown
  footer?: (props?: TrChatSenderFooterRightSlotProps) => unknown
  [name: string]: ((props?: TrChatSenderFooterRightSlotProps) => unknown) | undefined
}

export type TrChatSenderForwardedProps = Omit<
  SenderProps,
  | 'modelValue'
  | 'defaultValue'
  | 'loading'
  | 'mode'
  | 'placeholder'
  | 'maxLength'
  | 'extensions'
  | 'defaultActions'
  | 'showWordLimit'
>

export interface TrChatPageProps {
  messageListVariant?: ChatListVariant
}

export interface TrChatPageEmits {
  (e: 'update:show', value: boolean): void
  (e: 'update:model', value: string): void
}

export interface TrChatPageMessageListSlotProps {
  messages: ReadonlyRef<ChatMessage[]>
}

export interface TrChatPageSenderSlotProps {
  send: (content: string) => void
  abort: () => Promise<void>
  status: ReadonlyRef<ChatStatus>
  lastError: ReadonlyRef<ChatErrorInfo | null>
  retry: () => Promise<boolean>
}

export interface TrChatPageBubbleSlotProps {
  [key: string]: unknown
}

export interface TrChatPageSlots {
  left?: () => unknown
  'left-rail'?: () => unknown
  right?: () => unknown
  'mobile-left'?: () => unknown
  'mobile-right'?: () => unknown
  header?: () => unknown
  'header-extra'?: () => unknown
  'message-list'?: (props: TrChatPageMessageListSlotProps) => unknown
  welcome?: () => unknown
  empty?: () => unknown
  prefix?: (props: TrChatPageBubbleSlotProps) => unknown
  suffix?: (props: TrChatPageBubbleSlotProps) => unknown
  after?: (props: TrChatPageBubbleSlotProps) => unknown
  'content-footer'?: (props: TrChatPageBubbleSlotProps) => unknown
  sender?: (props: TrChatPageSenderSlotProps) => unknown
  'footer-extra'?: () => unknown
}

export type TrChatMessageListForwardedProps = Omit<
  BubbleListProps,
  'messages' | 'autoScroll' | 'groupStrategy' | 'roleConfigs'
>

export type TrChatMessageListSlots = BubbleListSlots
