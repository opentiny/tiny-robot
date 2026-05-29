import type { Component } from 'vue'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import IconModelAliyunBailian from './IconModelAliyunBailian.vue'
import IconModelDeepseek from './IconModelDeepseek.vue'

const MODEL_ICON_MAP: Record<string, Component> = {
  deepseek: IconModelDeepseek,
  aliyun: IconModelAliyunBailian,
  bailian: IconModelAliyunBailian,
  dashscope: IconModelAliyunBailian,
  qwen: IconModelAliyunBailian,
}

export function resolveChatModelIcon(provider?: string) {
  return MODEL_ICON_MAP[provider?.trim().toLowerCase() || ''] || IconAi
}

export { IconModelAliyunBailian, IconModelDeepseek }
