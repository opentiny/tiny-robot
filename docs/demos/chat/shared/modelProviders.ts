import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import type { ModelSelectorField } from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const runtimeOrigin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
const defaultApiUrl = new URL(`${import.meta.env.BASE_URL}api`, runtimeOrigin).toString()

const reasoningFields: readonly ModelSelectorField[] = [
  {
    key: 'reasoning',
    label: '思考强度',
    type: 'select',
    defaultValue: 'off',
    options: [
      { value: 'off', label: '关闭' },
      { value: 'low', label: '低' },
      { value: 'high', label: '高' },
      { value: 'max', label: '最高' },
    ],
  },
]
const qwenFields: readonly ModelSelectorField[] = [
  ...reasoningFields,
  { key: 'search', label: '联网搜索', type: 'switch' },
]

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
        features: qwenFields,
      },
      {
        id: 'qwen3.7-plus',
        label: 'Qwen3.7 Plus',
        icon: IconBailian,
        features: qwenFields,
      },
      {
        id: 'qwen3.7-max',
        label: 'Qwen3.7 Max',
        icon: IconBailian,
        features: qwenFields,
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
        features: reasoningFields,
      },
      {
        id: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        icon: IconDeepseek,
        features: reasoningFields,
      },
    ],
  },
]
