export interface ChatTokenUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

export function isChatTokenUsage(value: unknown): value is ChatTokenUsage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const usage = value as Record<string, unknown>
  const keys = ['prompt_tokens', 'completion_tokens', 'total_tokens'] as const
  let hasValue = false

  for (const key of keys) {
    if (!(key in usage)) continue
    const amount = usage[key]
    if (typeof amount !== 'number' || !Number.isSafeInteger(amount) || amount < 0) return false
    hasValue = true
  }

  return hasValue
}
