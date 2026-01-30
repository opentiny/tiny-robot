import { ref } from 'vue'
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
 * useMessage 自定义 Chunk 处理：onCompletionChunk 处理每个数据块，调用 runDefault() 执行默认合并
 */
export function useMessageCustomChunk() {
  const chunkCount = ref(0)

  const result = useMessage({
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
    onCompletionChunk(_context, runDefault) {
      chunkCount.value += 1
      runDefault()
    },
    initialMessages: [
      {
        content: '上方会统计本回合收到的数据块数量，可用 onCompletionChunk 做日志或自定义合并。',
        role: 'assistant',
      },
    ],
  })

  return { ...result, chunkCount }
}
