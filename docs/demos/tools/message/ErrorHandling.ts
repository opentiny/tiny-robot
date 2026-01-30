import type { MessageRequestBody } from '@opentiny/tiny-robot-kit'
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

// 插件：根据 error.name 区分处理；ErrorRenderer 时设置 state.error 供自定义渲染
const errorHandlingPlugin: UseMessagePlugin = {
  name: 'errorHandling',
  onError({ currentTurn, error }) {
    const message = error instanceof Error ? error.message : String(error)
    const lastMessage = currentTurn.at(-1)!
    if (error instanceof Error && error.name === 'ErrorRenderer') {
      if (!lastMessage.state) lastMessage.state = {}
      lastMessage.state.error = { message, name: error.name }
    } else {
      lastMessage.content = `抱歉，出错了：${message}`
    }
  },
}

/**
 * useMessage 错误处理：plugins 中 onError 根据 error.name 区分；ErrorRenderer 时设置 state.error 供自定义渲染
 */
export function useMessageErrorHandling() {
  const responseProvider = async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
    const lastUser = requestBody.messages.filter((m) => m.role === 'user').pop()
    const content = (lastUser?.content as string) || ''
    if (content.trim().toLowerCase() === 'error') {
      await new Promise((r) => setTimeout(r, 300))
      throw new Error('示例：模拟 API 错误')
    }
    if (content.trim().toLowerCase() === 'error-renderer') {
      await new Promise((r) => setTimeout(r, 300))
      const err = new Error('渲染错误示例：此消息通过 state.error 匹配自定义 error 渲染器。')
      err.name = 'ErrorRenderer'
      throw err
    }
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
  }
  return useMessage({
    responseProvider: responseProvider as Parameters<typeof useMessage>[0]['responseProvider'],
    plugins: [errorHandlingPlugin],
    initialMessages: [
      {
        content: '发送任意消息可正常回复；输入「error」模拟 API 错误；输入「error-renderer」使用自定义 error 渲染器。',
        role: 'assistant',
      },
    ],
  })
}
