import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const defaultApiUrl = `${import.meta.env.BASE_URL}api`

export const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'DashScope',
    apiUrl: defaultApiUrl,
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
    apiUrl: defaultApiUrl,
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
