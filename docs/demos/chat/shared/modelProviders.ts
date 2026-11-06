import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import type { ModelSelectorField } from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const runtimeOrigin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
const defaultApiUrl = new URL(`${import.meta.env.BASE_URL}api`, runtimeOrigin).toString()

const qwenFields: readonly ModelSelectorField[] = [
  {
    key: 'reasoning',
    label: '思考强度',
    type: 'select',
    defaultValue: 'off',
    summary: true,
    options: [
      { value: 'off', label: '关闭', summary: false },
      { value: 'low', label: '低' },
      { value: 'high', label: '高' },
      { value: 'max', label: '最高' },
    ],
  },
  { key: 'search', label: '联网搜索', type: 'switch' },
]
const deepseekFields: readonly ModelSelectorField[] = [
  {
    key: 'reasoning',
    label: '思考强度',
    type: 'select',
    defaultValue: 'off',
    summary: true,
    options: [
      { value: 'off', label: '关闭', summary: false },
      { value: 'low', label: '低' },
      { value: 'high', label: '高' },
      { value: 'max', label: '最高' },
    ],
  },
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
        fields: qwenFields,
      },
      {
        id: 'qwen3.7-plus',
        label: 'Qwen3.7 Plus',
        icon: IconBailian,
        fields: qwenFields,
      },
      {
        id: 'qwen3.7-max',
        label: 'Qwen3.7 Max',
        icon: IconBailian,
        fields: qwenFields,
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
        fields: deepseekFields,
      },
      {
        id: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        icon: IconDeepseek,
        fields: deepseekFields,
      },
    ],
  },
]
