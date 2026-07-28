import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'

const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-v4-flash'

export function createDeepSeekResponseProvider(): ResponseProvider {
  return async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY?.trim()

    if (!apiKey) {
      throw new Error('Missing VITE_DEEPSEEK_API_KEY for DeepSeek streaming demo.')
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...requestBody,
        model: DEEPSEEK_MODEL,
        stream: true,
      }),
      signal: abortSignal,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${response.statusText}${detail ? ` - ${detail}` : ''}`)
    }

    return sseStreamToGenerator(response, { signal: abortSignal })
  }
}
