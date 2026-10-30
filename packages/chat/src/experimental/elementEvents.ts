import type {
  Attachment,
  ExtensionManagerActionEvent,
  ExtensionManagerNameClickEvent,
  ExtensionManagerTabChangeEvent,
} from '@opentiny/tiny-robot'
import type {
  ChatAsideOpenChangePayload,
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatHistoryActionPayload,
  ChatMcpAddServerPayload,
  ChatMcpCreateServerPayload,
  ChatMcpRemoveServerPayload,
  ChatMcpServerEnabledChangePayload,
  ChatMcpToolEnabledChangePayload,
  ChatModelFeatureChangePayload,
  ChatModelReasoningEffortChangePayload,
  ChatModelSelectPayload,
  ChatPromptClickPayload,
  ChatRenameConversationPayload,
  ChatRightAsidePanelId,
  ChatRuntimeActionErrorPayload,
  ChatSendPayload,
  ChatSwitchConversationPayload,
  LayoutFloatingDragDetail,
  LayoutFloatingResizeDetail,
  LayoutFloatingState,
} from '../types'
import {
  dispatchExperimentalEvent,
  dispatchTrChatError,
  type ExperimentalErrorDetail,
  type TrChatErrorDetail,
} from './events'
import type { TrChatRuntimeSnapshot } from './runtime/runtimeSnapshot'

export interface TrChatCommonElementEventMap {
  ready: CustomEvent<void>
  'experimental-error': CustomEvent<ExperimentalErrorDetail>
  'tr-chat-error': CustomEvent<TrChatErrorDetail>
  'floating-state-update': CustomEvent<LayoutFloatingState>
  'floating-drag-start': CustomEvent<LayoutFloatingDragDetail>
  'floating-drag': CustomEvent<LayoutFloatingDragDetail>
  'floating-drag-end': CustomEvent<LayoutFloatingDragDetail>
  'floating-resize-start': CustomEvent<LayoutFloatingResizeDetail>
  'floating-resize': CustomEvent<LayoutFloatingResizeDetail>
  'floating-resize-end': CustomEvent<LayoutFloatingResizeDetail>
  'history-action': CustomEvent<ChatHistoryActionPayload>
  'prompt-click': CustomEvent<ChatPromptClickPayload>
  'bubble-state-change': CustomEvent<ChatBubbleStateChangePayload>
  'bubble-event': CustomEvent<ChatBubbleEventPayload>
  'left-aside-open-change': CustomEvent<ChatAsideOpenChangePayload>
  'right-aside-open-change': CustomEvent<ChatAsideOpenChangePayload>
  'right-aside-open-update': CustomEvent<boolean>
  'active-right-aside-panel-id-update': CustomEvent<ChatRightAsidePanelId | undefined>
  'extension-action': CustomEvent<ExtensionManagerActionEvent>
  'extension-name-click': CustomEvent<ExtensionManagerNameClickEvent>
  'extension-tab-change': CustomEvent<ExtensionManagerTabChangeEvent>
}

export interface TrChatElementEventMap extends TrChatCommonElementEventMap {
  'runtime-action-error': CustomEvent<ChatRuntimeActionErrorPayload>
  'runtime-state-change': CustomEvent<TrChatRuntimeSnapshot>
  'mcp-create-server': CustomEvent<ChatMcpCreateServerPayload>
  'attachments-select': CustomEvent<File[]>
  'attachments-update': CustomEvent<Attachment[]>
  'attachment-error': CustomEvent<Error>
}

export interface TrChatUIElementEventMap extends TrChatCommonElementEventMap {
  'input-value-update': CustomEvent<string>
  submit: CustomEvent<ChatSendPayload>
  cancel: CustomEvent<void>
  clear: CustomEvent<void>
  'attachments-select': CustomEvent<File[]>
  'attachments-update': CustomEvent<Attachment[]>
  'attachment-error': CustomEvent<Error>
  'create-conversation': CustomEvent<void>
  'switch-conversation': CustomEvent<ChatSwitchConversationPayload>
  'rename-conversation': CustomEvent<ChatRenameConversationPayload>
  'model-select': CustomEvent<ChatModelSelectPayload>
  'model-feature-change': CustomEvent<ChatModelFeatureChangePayload>
  'model-reasoning-effort-change': CustomEvent<ChatModelReasoningEffortChangePayload>
  'mcp-add-server': CustomEvent<ChatMcpAddServerPayload>
  'mcp-create-server': CustomEvent<ChatMcpCreateServerPayload>
  'mcp-remove-server': CustomEvent<ChatMcpRemoveServerPayload>
  'mcp-server-enabled-change': CustomEvent<ChatMcpServerEnabledChangePayload>
  'mcp-tool-enabled-change': CustomEvent<ChatMcpToolEnabledChangePayload>
}

export const TR_CHAT_EVENT_NAMES = [
  'update:floating-state',
  'floating-drag-start',
  'floating-drag',
  'floating-drag-end',
  'floating-resize-start',
  'floating-resize',
  'floating-resize-end',
  'runtime-action-error',
  'history-action',
  'attachments-select',
  'update:attachments',
  'attachment-error',
  'mcp-create-server',
  'extension-action',
  'extension-name-click',
  'extension-tab-change',
  'prompt-click',
  'bubble-state-change',
  'bubble-event',
  'left-aside-open-change',
  'right-aside-open-change',
  'update:right-aside-open',
  'update:active-right-aside-panel-id',
] as const

export const TR_CHAT_UI_EVENT_NAMES = [
  'update:floating-state',
  'floating-drag-start',
  'floating-drag',
  'floating-drag-end',
  'floating-resize-start',
  'floating-resize',
  'floating-resize-end',
  'update:inputValue',
  'submit',
  'cancel',
  'clear',
  'attachments-select',
  'update:attachments',
  'attachment-error',
  'create-conversation',
  'switch-conversation',
  'rename-conversation',
  'history-action',
  'prompt-click',
  'bubble-state-change',
  'bubble-event',
  'model-select',
  'model-feature-change',
  'model-reasoning-effort-change',
  'mcp-add-server',
  'mcp-create-server',
  'mcp-remove-server',
  'mcp-server-enabled-change',
  'mcp-tool-enabled-change',
  'extension-action',
  'extension-name-click',
  'extension-tab-change',
  'left-aside-open-change',
  'right-aside-open-change',
  'update:right-aside-open',
  'update:active-right-aside-panel-id',
] as const

export type TrChatSourceEventName = (typeof TR_CHAT_EVENT_NAMES)[number]
export type TrChatUISourceEventName = (typeof TR_CHAT_UI_EVENT_NAMES)[number]

export function forwardElementEvent(target: EventTarget, name: string, detail: unknown): boolean {
  const dispatched = dispatchExperimentalEvent(target, name, detail, {
    cancelable: name === 'history-action',
  })

  if (!dispatched && name === 'history-action') {
    ;(detail as ChatHistoryActionPayload).preventDefault()
  }

  if (name === 'runtime-action-error') {
    const error = detail as ChatRuntimeActionErrorPayload
    dispatchTrChatError(target, {
      source: 'runtime',
      code: 'runtime_action_failed',
      cause: error.error,
      recoverable: true,
      action: error.action,
      payload: error.payload,
    })
  } else if (name === 'attachment-error') {
    dispatchTrChatError(target, {
      source: 'attachment',
      code: 'attachment_failed',
      cause: detail,
      recoverable: true,
    })
  } else if (name === 'experimental-error') {
    const error = detail as ExperimentalErrorDetail
    dispatchTrChatError(target, {
      source: error.source,
      code: error.source === 'renderer' ? 'renderer_failed' : 'element_failed',
      cause: error.error,
      recoverable: true,
    })
  }

  return dispatched
}
