import { sseStreamToGenerator, type ResponseProvider } from '@opentiny/tiny-robot-kit'

export const sseResponseProvider: ResponseProvider = async (requestBody, signal) => {
  const response = await fetch(`${import.meta.env.VITE_LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_LLM_API_KEY}`,
    },
    body: JSON.stringify({
      ...requestBody,
      model: import.meta.env.VITE_LLM_MODEL,
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`模型请求失败：${response.status}`)
  }

  return sseStreamToGenerator(response, { signal })
}
