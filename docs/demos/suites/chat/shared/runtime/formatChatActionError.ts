import type { ChatRuntimeActionErrorPayload } from '@opentiny/tiny-robot-chat'

const actionLabels: Record<ChatRuntimeActionErrorPayload['action'], string> = {
  send: '发送消息',
  abort: '取消请求',
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
  return `${actionLabels[action]}失败，请重试`
}
