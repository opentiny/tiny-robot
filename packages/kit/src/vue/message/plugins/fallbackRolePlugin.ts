import type { UseMessagePlugin } from '../types'

export const fallbackRolePlugin = (options: UseMessagePlugin & { fallbackRole?: string } = {}): UseMessagePlugin => {
  const { fallbackRole = 'assistant', ...restOptions } = options

  return {
    name: 'fallbackRole',
    ...restOptions,
    onBeforeRequest(context) {
      const { requestBody, messages } = context
      // 如果消息的 role 为空，则使用 fallbackRole
      requestBody.messages = messages.map((message) => {
        return {
          ...message,
          role: message.role || fallbackRole,
        }
      })

      return restOptions.onBeforeRequest?.(context)
    },
  }
}
