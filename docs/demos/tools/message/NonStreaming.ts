import type { ChatCompletion } from '@opentiny/tiny-robot-kit'
import { useMessage } from '@opentiny/tiny-robot-kit'

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
 * useMessage 非流式：responseProvider 返回 Promise<ChatCompletion>，一次性得到完整结果
 */
export function useMessageNonStreaming() {
  return useMessage({
    responseProvider: async (requestBody, abortSignal): Promise<ChatCompletion> => {
      const response = await fetch(`${apiUrl}/api/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestBody, stream: false }),
        signal: abortSignal,
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },
    initialMessages: [
      {
        content: '本示例使用非流式接口（stream: false），一次性返回完整结果。',
        role: 'assistant',
      },
    ],
  })
}
