import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import { useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'

interface ImportMetaEnv {
  BASE_URL?: string
}
interface ImportMetaWithEnv extends ImportMeta {
  env?: ImportMetaEnv
}
const meta = typeof import.meta !== 'undefined' ? (import.meta as ImportMetaWithEnv) : null
const baseUrl = meta?.env?.BASE_URL || ''
const apiUrl = window.parent?.location.origin || location.origin + baseUrl

// 插件：在 onBeforeRequest 中修改 requestBody，注入 system 消息和 temperature
const modifyRequestPlugin: UseMessagePlugin = {
  name: 'modifyRequest',
  onBeforeRequest({ requestBody }) {
    requestBody.messages = [
      { role: 'system', content: '你是一个简洁的助手，请用简短的话回复。' },
      ...requestBody.messages,
    ]
    ;(requestBody as Record<string, unknown>).temperature = 0.7
  },
}

/**
 * useMessage onBeforeRequest：插件在请求前修改 requestBody（注入 system、追加参数等）
 */
export function useMessageOnBeforeRequest() {
  return useMessage({
    responseProvider: async (requestBody, abortSignal) => {
      const response = await fetch(`${apiUrl}/api/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestBody, stream: true }),
        signal: abortSignal,
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return sseStreamToGenerator(response, { signal: abortSignal })
    },
    plugins: [modifyRequestPlugin],
    initialMessages: [
      {
        content: '本示例通过 onBeforeRequest 插件在请求前注入 system 消息和 temperature 参数。',
        role: 'assistant',
      },
    ],
  })
}
