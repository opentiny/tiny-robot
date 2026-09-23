import type { ChatRuntimeActionErrorPayload } from '@opentiny/tiny-robot-chat'
import { onScopeDispose, shallowRef } from 'vue'

type GlobalFeedbackAction = Exclude<ChatRuntimeActionErrorPayload['action'], 'send'>

const actionLabels: Record<GlobalFeedbackAction, string> = {
  abort: '取消请求',
  'clear-active-conversation': '清空当前会话',
  'create-conversation': '新建会话',
  'switch-conversation': '切换会话',
  'rename-conversation': '重命名会话',
  'delete-conversation': '删除会话',
  'select-model': '切换模型',
  'set-model-feature': '更新模型能力',
  'set-model-reasoning-effort': '更新思考强度',
  'add-mcp-server': '添加插件',
  'remove-mcp-server': '移除插件',
  'set-mcp-server-enabled': '更新插件状态',
  'set-mcp-tool-enabled': '更新工具状态',
}

export function formatChatActionError(action: ChatRuntimeActionErrorPayload['action']) {
  if (action === 'send') return null

  return `${actionLabels[action]}失败，请重试`
}

export function useChatActionErrorMessage(dismissAfter = 3000) {
  const actionErrorMessage = shallowRef('')
  let dismissTimer: ReturnType<typeof setTimeout> | undefined

  function clearDismissTimer() {
    if (dismissTimer === undefined) return

    clearTimeout(dismissTimer)
    dismissTimer = undefined
  }

  function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
    clearDismissTimer()
    const message = formatChatActionError(payload.action)
    actionErrorMessage.value = message ?? ''

    if (!message) return

    dismissTimer = setTimeout(() => {
      actionErrorMessage.value = ''
      dismissTimer = undefined
    }, dismissAfter)
  }

  onScopeDispose(clearDismissTimer)

  return { actionErrorMessage, handleRuntimeActionError }
}
