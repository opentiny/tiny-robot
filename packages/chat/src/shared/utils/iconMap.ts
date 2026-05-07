import type { Component } from 'vue'
import {
  IconOpenai,
  IconClaude,
  IconDeepseek,
  IconGemini,
  IconBailian,
  IconModelscope,
  IconOpenrouter,
  IconOllama,
} from '@opentiny/tiny-robot-svgs'
import type { ModelOption } from '@/types'

/**
 * Default provider icon registry used by chat-level model selectors.
 * Custom apps can override the icon per model via `ModelOption.icon`.
 */
export const PROVIDER_ICON_MAP: Record<string, Component> = {
  openai: IconOpenai,
  claude: IconClaude,
  deepseek: IconDeepseek,
  gemini: IconGemini,
  bailian: IconBailian,
  modelscope: IconModelscope,
  openrouter: IconOpenrouter,
  ollama: IconOllama,
}

export type KnownProvider = keyof typeof PROVIDER_ICON_MAP

export const KNOWN_PROVIDERS = Object.keys(PROVIDER_ICON_MAP) as KnownProvider[]

export function getProviderIcon(model: ModelOption | string): Component | null {
  if (!model) {
    return null
  }

  if (typeof model === 'object' && model !== null) {
    if (model.icon) {
      return model.icon
    }

    const providerId = model.providerId
    return providerId ? (PROVIDER_ICON_MAP[providerId.toLowerCase()] ?? null) : null
  }

  return PROVIDER_ICON_MAP[model.toLowerCase()] ?? null
}
