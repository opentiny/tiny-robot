import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'

export const workHelperModelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: '通义千问',
    apiKey: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim(),
    models: [
      {
        id: 'qwen3.7-flash',
        label: 'Qwen3.7 Flash',
        capabilities: { thinking: true },
      },
      {
        id: 'qwen3.7-plus',
        label: 'Qwen3.7 Plus',
        capabilities: { thinking: true },
      },
      {
        id: 'qwen3.7-max',
        label: 'Qwen3.7 Max',
        capabilities: { thinking: true },
      },
    ],
  },
  {
    type: 'deepseek',
    label: 'DeepSeek',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY?.trim(),
    models: [
      {
        id: 'deepseek-v4-flash',
        label: 'DeepSeek V4 Flash',
        capabilities: { thinking: true },
      },
      {
        id: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        capabilities: { thinking: true },
      },
    ],
  },
]
