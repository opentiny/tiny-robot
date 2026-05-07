import type { TrChatConfig } from '@/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseSerializedConfig(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`
  }

  if (isRecord(value)) {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)

    return `{${entries.join(',')}}`
  }

  return JSON.stringify(value)
}

export function isTargetTrChatConfig(value: unknown): value is TrChatConfig {
  const parsedValue = parseSerializedConfig(value)

  if (!isRecord(parsedValue) || !isRecord(parsedValue.request)) {
    return false
  }

  return Array.isArray(parsedValue.request.models) && isRecord(parsedValue.request.providers)
}

function resolveParsedTargetTrChatConfig(config: unknown): TrChatConfig | null {
  const resolvedConfig = parseSerializedConfig(config)
  if (!isTargetTrChatConfig(resolvedConfig)) {
    return null
  }

  return resolvedConfig
}

export function resolveTrChatConfigEntry(config: unknown): TrChatConfig | null {
  return resolveParsedTargetTrChatConfig(config)
}

export function resolveTrChatConfigEntryInput(config: unknown): { config: TrChatConfig; key: string } | null {
  const resolvedConfig = resolveParsedTargetTrChatConfig(config)
  if (!resolvedConfig) {
    return null
  }

  return {
    config: resolvedConfig,
    key: stableSerialize(resolvedConfig),
  }
}
