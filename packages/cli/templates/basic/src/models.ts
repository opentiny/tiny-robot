import { type Component } from 'vue'
import { IconModelAliyunBailian, IconModelDeepseek } from './components/icons'

export interface ModelCapabilities {
  thinking?: Record<string, unknown> | false
  search?: Record<string, unknown> | false
}

export interface ModelConfigItem {
  name: string
  model: string
  capabilities?: ModelCapabilities
}

export interface ProviderModelConfig {
  apiUrl: string
  icon: Component
  apiKey?: string
  models: ModelConfigItem[]
}

export const ModelConfigs: Record<string, ProviderModelConfig> = {
  aliyun: {
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    icon: IconModelAliyunBailian,
    apiKey: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY,
    models: [
      {
        name: 'Qwen Flash',
        model: 'qwen-flash',
        capabilities: {
          thinking: {
            enable_thinking: true,
          },
          search: {
            enable_search: true,
          },
        },
      },
      {
        name: 'Qwen Plus',
        model: 'qwen-plus',
        capabilities: {
          thinking: {
            enable_thinking: true,
          },
          search: {
            enable_search: true,
          },
        },
      },
      {
        name: 'Qwen Max',
        model: 'qwen-max',
        capabilities: {
          thinking: {
            enable_thinking: true,
          },
          search: {
            enable_search: true,
          },
        },
      },
    ],
  },
  deepseek: {
    apiUrl: 'https://api.deepseek.com/chat/completions',
    icon: IconModelDeepseek,
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
    models: [
      {
        name: 'DeepSeek V4 Flash',
        model: 'deepseek-v4-flash',
      },
      {
        name: 'DeepSeek V4 Pro',
        model: 'deepseek-v4-pro',
      },
    ],
  },
}
