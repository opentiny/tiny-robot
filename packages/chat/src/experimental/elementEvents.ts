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
import { dispatchExperimentalEvent, type ExperimentalErrorDetail } from './events'

export interface TrChatCommonElementEventMap {
  ready: CustomEvent<void>
  'experimental-error': CustomEvent<ExperimentalErrorDetail>
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
}

export interface TrChatElementEventMap extends TrChatCommonElementEventMap {
  'runtime-action-error': CustomEvent<ChatRuntimeActionErrorPayload>
  'mcp-create-server': CustomEvent<ChatMcpCreateServerPayload>
}

export interface TrChatUIElementEventMap extends TrChatCommonElementEventMap {
  'input-value-update': CustomEvent<string>
  submit: CustomEvent<ChatSendPayload>
  cancel: CustomEvent<void>
  clear: CustomEvent<void>
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
  'mcp-create-server',
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

  return dispatched
}
