import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

export const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'DashScope',
    apiUrl: import.meta.env.VITE_QWEN_API_URL?.trim() || undefined,
    apiKey: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim(),
    models: [
      {
        id: 'qwen3.7-flash',
        label: 'Qwen3.7 Flash',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
      {
        id: 'qwen3.7-plus',
        label: 'Qwen3.7 Plus',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
      {
        id: 'qwen3.7-max',
        label: 'Qwen3.7 Max',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
    ],
  },
  {
    type: 'deepseek',
    apiUrl: import.meta.env.VITE_DEEPSEEK_API_URL?.trim() || undefined,
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY?.trim(),
    models: [
      {
        id: 'deepseek-v4-flash',
        label: 'DeepSeek V4 Flash',
        icon: IconDeepseek,
        capabilities: { thinking: true },
      },
      {
        id: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        icon: IconDeepseek,
        capabilities: { thinking: true },
      },
    ],
  },
]
