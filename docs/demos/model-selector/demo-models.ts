import type { ModelSelectorReasoningEffortOption, ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const providerBases = {
  deepseek: {
    icon: IconDeepseek,
    group: 'DeepSeek V4',
  },
  qwen: {
    icon: IconBailian,
    group: 'Qwen',
  },
} as const

type ModelProvider = keyof typeof providerBases
type EffortRow = readonly [value: string, label: string]

interface ModelRow {
  provider: ModelProvider
  value: string
  label: string
  description: string
  disabled?: boolean
  reasoningEfforts?: readonly EffortRow[]
}

const modelRows = [
  {
    provider: 'deepseek',
    value: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    description: '预览版 · 1M 上下文 · 最大输出 384K',
    reasoningEfforts: [
      ['high', 'High'],
      ['max', 'Max'],
    ],
  },
  {
    provider: 'deepseek',
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    description: 'V4-Flash-0731 Public Beta · 1M 上下文 · 最大输出 384K',
    reasoningEfforts: [
      ['low', 'Low'],
      ['high', 'High'],
      ['max', 'Max'],
    ],
  },
  {
    provider: 'qwen',
    value: 'qwen3.8-max-preview',
    label: 'Qwen3.8 Max Preview',
    description: '需 Token Plan（本示例禁用） · 推理与视觉理解 · 1M 上下文',
    disabled: true,
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-max',
    label: 'Qwen3.7 Max',
    description: '纯文本旗舰 · 1M 上下文 · 最大输出 131K',
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-plus',
    label: 'Qwen3.7 Plus',
    description: '图像、文本与视频输入 · 1M 上下文 · 最大输出 131K',
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-flash',
    label: 'Qwen3.7 Flash',
    description: '轻量低成本多模态 · 1M 上下文 · 最大输出 131K',
  },
] satisfies readonly ModelRow[]

export const modelSelectorDemoModels = modelRows.map(({ provider, reasoningEfforts, ...model }) => ({
  ...model,
  ...providerBases[provider],
  ...(reasoningEfforts
    ? {
        reasoningEfforts: reasoningEfforts.map(([value, label]) => ({
          value,
          label,
        })) satisfies readonly ModelSelectorReasoningEffortOption[],
      }
    : {}),
})) satisfies readonly ModelSelectorOption[]
