import { useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'

export function useChat() {
  return useMessage({
    initialMessages: [{ role: 'assistant', content: '你好！我是 TinyRobot 示例助手。' }],
    responseProvider: async (requestBody, abortSignal) => {
      // 替换为你的大模型 API 地址
      const url = 'https://api.deepseek.com/chat/completions'

      // 替换为你的大模型 API 密钥
      const apiKey = import.meta.env.VITE_API_KEY

      if (!apiKey) {
        throw new Error('api key is not set')
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          ...requestBody,
          stream: true,
        }),
        signal: abortSignal,
      })
      return sseStreamToGenerator(res, { signal: abortSignal })
    },
    plugins: [
      {
        onError: ({ currentTurn, error }) => {
          currentTurn[currentTurn.length - 1]!.content = String(error)
        },
      },
    ],
  })
}
