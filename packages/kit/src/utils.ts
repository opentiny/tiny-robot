/**
 * 工具函数模块
 * 提供一些实用的辅助函数
 */

import type { ChatMessage, ChatCompletionResponse, ChatCompletionStreamResponse, StreamHandler } from './types'

export const getUniqueStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return undefined
  }

  return [...new Set(value.filter((item): item is string => typeof item === 'string'))]
}

/**
 * 处理SSE流式响应
 * @param response fetch响应对象
 * @param handler 流处理器
 */
export async function handleSSEStream(response: Response, handler: StreamHandler, signal?: AbortSignal): Promise<void> {
  // 获取ReadableStream
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is null')
  }

  // 处理流式数据
  const decoder = new TextDecoder()
  let buffer = ''
  let finishReason: string | undefined
  let latestFinishReason: string | undefined

  if (signal) {
    signal.addEventListener(
      'abort',
      () => {
        reader.cancel().catch((err) => console.error('Error cancelling reader:', err))
      },
      { once: true },
    )
  }

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel()
        break
      }

      const { done, value } = await reader.read()
      if (done) break

      // 解码二进制数据
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // 处理完整的SSE消息
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.trim() === '') continue
        if (line.trim() === 'data: [DONE]') {
          if (latestFinishReason) {
            finishReason = latestFinishReason
          }

          handler.onDone(finishReason)
          continue
        }

        try {
          // 解析SSE消息
          const dataMatch = line.match(/^data: (.+)$/m)
          if (!dataMatch) continue

          const data = JSON.parse(dataMatch[1]) as ChatCompletionStreamResponse
          handler.onData(data)
          latestFinishReason = data.choices?.[0]?.finish_reason || undefined
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }
    }

    if (buffer.trim() === 'data: [DONE]' || signal?.aborted) {
      if (signal?.aborted) {
        finishReason = 'aborted'
      }
      handler.onDone(finishReason)
    }
  } catch (error) {
    if (signal?.aborted) return
    throw error
  }
}

/**
 * 格式化消息
 * 将各种格式的消息转换为标准的ChatMessage格式
 * @param messages 消息数组
 * @returns 标准格式的消息数组
 */
export function formatMessages(messages: Array<ChatMessage | string>): ChatMessage[] {
  return messages.map((msg) => {
    // 如果已经是标准格式，直接返回
    if (typeof msg === 'object' && 'role' in msg && 'content' in msg) {
      return {
        role: msg.role,
        content: String(msg.content),
        ...(msg.name ? { name: msg.name } : {}),
      }
    }

    // 如果是字符串，默认为用户消息
    if (typeof msg === 'string') {
      return {
        role: 'user',
        content: msg,
      }
    }

    // 其他情况，尝试转换为字符串
    return {
      role: 'user',
      content: String(msg),
    }
  })
}

/**
 * 从响应中提取文本内容
 * @param response 聊天完成响应
 * @returns 文本内容
 */
export function extractTextFromResponse(response: ChatCompletionResponse): string {
  if (!response.choices || !response.choices.length) {
    return ''
  }

  return response.choices[0].message?.content || ''
}

// 创建 AbortError 的辅助函数
function createAbortError(message = 'The operation was aborted'): Error {
  const error = new Error(message)
  error.name = 'AbortError'
  return error
}

/**
 * 将 SSE 流转换为异步生成器。
 * 将服务器发送事件（SSE）流式响应转换为异步生成器，逐个产出解析后的数据
 *
 * 当取消信号被触发时，会抛出 name 为 'AbortError' 的错误
 * @param response fetch 响应对象
 * @param options 配置选项
 * @param options.signal 可选的取消信号，用于中断流处理
 * @returns 异步生成器，产出类型为 T 的数据
 * @template T 生成器产出的数据类型，默认为 any
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function* sseStreamToGenerator<T = any>(
  response: Response,
  options: { signal?: AbortSignal } = {},
): AsyncGenerator<T, void, unknown> {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('ReadableStream not supported')
  }

  const { signal } = options
  const decoder = new TextDecoder()
  let buffer = ''

  // Set up abort signal listener
  const abortHandler = () => {
    reader.cancel()
  }

  signal?.addEventListener('abort', abortHandler)

  try {
    while (true) {
      if (signal?.aborted) {
        throw createAbortError()
      }

      let readResult
      try {
        readResult = await reader.read()
      } catch (readError) {
        // If read fails due to abort, throw AbortError
        if (signal?.aborted) {
          throw createAbortError()
        }
        throw readError
      }

      const { done, value } = readResult

      if (done) {
        if (signal?.aborted) {
          throw createAbortError()
        }
        return
      }

      // Decode the chunk and add to buffer
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // Process complete SSE events
      const lines = buffer.split('\n')

      buffer = lines.pop() || '' // Keep incomplete line in buffer

      // Process each complete line
      for (const line of lines) {
        // Skip empty lines (SSE event separators)
        if (line.trim() === '') {
          continue
        }

        // Only process data lines
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // Remove 'data: ' prefix

          if (data === '[DONE]') {
            return
          }

          try {
            const parsedData = JSON.parse(data) as T
            // Yield the parsed data instead of calling callback
            yield parsedData
          } catch (parseError) {
            // Log error but continue processing other events
            console.warn('Failed to parse SSE data:', data, parseError)
          }
        }
      }
    }
  } finally {
    // Clean up abort listener
    signal?.removeEventListener('abort', abortHandler)
    reader.releaseLock()
  }
}
