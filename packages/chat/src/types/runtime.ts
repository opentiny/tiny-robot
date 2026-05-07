import type { Ref } from 'vue'
import type { Attachment } from '@opentiny/tiny-robot'
import type {
  ChatMessageActionContext,
  ChatMessageActionDefinition,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatMessageTransforms,
  ChatStatus,
} from './core'
import type { ModelOption } from './model'
import type {
  ChatAttachmentsListConfig,
  ChatAttachmentsUploadConfig,
  ChatBubbleRenderers,
  ChatSenderActionVoiceConfig,
} from './component'
import type { ChatShellVariant, ChatWorkspaceRegionCollapseMode, ChatWorkspaceRegionWidth } from './workspace'
import type {
  ReadonlyRef,
  ChatUIMessage,
  ChatMessageViewState,
  ChatSendInput,
  ChatConversationSummary,
  ChatConversationCreateInput,
} from './message'

// Re-export message types so consumers of '@/types/runtime' don't need a separate '@/types/message' import
export type {
  ReadonlyRef,
  ChatUIMessage,
  ChatMessageViewState,
  ChatSendInput,
  ChatConversationSummary,
  ChatConversationCreateInput,
}

export interface ChatConversationRuntime {
  messages: ReadonlyRef<ChatUIMessage[]>
  status: ReadonlyRef<ChatStatus>
  send: (input: ChatSendInput) => Promise<void> | void
  abort: () => Promise<void> | void
  retry: (messageId?: string) => Promise<boolean> | boolean
  regenerate: (messageId?: string) => Promise<boolean> | boolean
}

export interface ChatSenderRuntime {
  draft: Ref<string>
  pendingAttachments: Ref<Attachment[]>
  canSend: ReadonlyRef<boolean>
  setDraft: (value: string) => void
  send: (input?: Partial<ChatSendInput>) => Promise<void> | void
  addPendingAttachments: (attachments: Attachment[]) => void
  setPendingAttachments: (attachments: Attachment[]) => void
  removePendingAttachment: (attachment: Attachment) => void
  clearPendingAttachments: () => void
  defaults?: {
    placeholder?: string
    mode?: 'single' | 'multiple'
    maxLength?: number
    wordCount?: boolean
    voice?: ChatSenderActionVoiceConfig
  }
}

export interface ChatMessageRuntime {
  getViewState: (messageId: string) => ChatMessageViewState | undefined
  getActions?: (context: ChatMessageActionContext) => ChatMessageActionDefinition[]
  startEdit: (messageId: string) => void
  cancelEdit: (messageId: string) => void
  commitEdit: (messageId: string, nextContent: string) => Promise<boolean> | boolean
  copy: (messageId: string) => Promise<void> | void
  config?: {
    actions?: ChatMessageActionsInput
    actionMode?: ChatMessageActionsMode
    renderers?: ChatBubbleRenderers
    feedback?: { enabled?: boolean }
    transforms?: ChatMessageTransforms
  }
}

export interface ChatAttachmentsRuntime {
  enabled: ReadonlyRef<boolean>
  prepareFiles: (files: File[]) => Attachment[]
  uploadConfig?: ReadonlyRef<ChatAttachmentsUploadConfig | undefined>
  listConfig?: ReadonlyRef<ChatAttachmentsListConfig | undefined>
}

export interface ChatHistoryRuntime {
  conversations: ReadonlyRef<ChatConversationSummary[]>
  activeConversationId: ReadonlyRef<string | null>
  createConversation: (params?: ChatConversationCreateInput) => Promise<string> | string
  switchConversation: (id: string) => Promise<boolean> | boolean
  deleteConversation: (id: string) => Promise<boolean> | boolean
  renameConversation?: (id: string, title: string) => Promise<boolean> | boolean
}

export interface ChatModelRuntime {
  models: ReadonlyRef<ModelOption[]>
  currentModelId: ReadonlyRef<string | null>
  selectModel: (modelId: string) => Promise<boolean> | boolean
}

export interface ChatWorkspaceRegionRuntime {
  enabled: ReadonlyRef<boolean>
  visible: Ref<boolean>
  collapsed: Ref<boolean>
  width: Ref<ChatWorkspaceRegionWidth | undefined>
  collapseMode: ReadonlyRef<ChatWorkspaceRegionCollapseMode>
  collapsible: ReadonlyRef<boolean>
  railLabel: ReadonlyRef<string | undefined>
  open: () => void
  close: () => void
  toggle: () => void
  collapse: () => void
  expand: () => void
  setWidth: (width: number) => void
}

export interface ChatWorkspaceRuntime {
  enabled: ReadonlyRef<boolean>
  variant: ReadonlyRef<ChatShellVariant>
  isMobile: ReadonlyRef<boolean>
  left: ChatWorkspaceRegionRuntime
  right: ChatWorkspaceRegionRuntime
  historyVisible: ReadonlyRef<boolean>
  openHistory: () => void
  closeHistory: () => void
  toggleHistory: () => void
  setResponsiveHost: (element: HTMLElement | null) => void
}

export interface ChatMcpRuntime {
  enabled: ReadonlyRef<boolean>
  openPanel?: () => void
  closePanel?: () => void
  togglePanel?: () => void
  callTool?: (input: unknown) => Promise<unknown>
}

export interface ChatRuntimeInput {
  conversation: ChatConversationRuntime
  sender?: ChatSenderRuntime
  message?: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
  mcp?: ChatMcpRuntime
}

export interface ChatRuntime {
  conversation: ChatConversationRuntime
  sender: ChatSenderRuntime
  message: ChatMessageRuntime
  history?: ChatHistoryRuntime
  models?: ChatModelRuntime
  workspace?: ChatWorkspaceRuntime
  attachments?: ChatAttachmentsRuntime
  mcp?: ChatMcpRuntime
}
