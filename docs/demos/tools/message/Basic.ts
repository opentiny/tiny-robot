import { useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'

// 若有 import.meta 则取 BASE_URL，否则为空字符串
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
 * useMessage 基础用法：responseProvider 发起流式请求，initialMessages 展示欢迎语
 */
export function useMessageBasic() {
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
    initialMessages: [
      {
        content: '你好！我是AI助手，有什么可以帮助你的吗？',
        role: 'assistant',
      },
    ],
  })
}
