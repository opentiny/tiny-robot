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

/**
 * useMessage 请求状态：responseProvider 加延迟，便于观察 processingState 从 requesting 变为 completing
 */
export function useMessageRequestState() {
  return useMessage({
    responseProvider: async (requestBody, abortSignal) => {
      // 延迟 1.5s 再发起请求，便于观察 processingState 从 requesting 变为 completing
      await new Promise((resolve) => setTimeout(resolve, 1500))
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
    initialMessages: [
      {
        content: '发送消息后观察状态条：先为 requesting，收到首包后变为 completing，结束后为 completed。',
        role: 'assistant',
      },
    ],
  })
}
