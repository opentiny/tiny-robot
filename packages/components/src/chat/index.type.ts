import type { Component, VNode } from 'vue'
import type { PluginInfo } from '../mcp-server-picker/index.type'

export type ChatLang = 'zh-CN' | 'en-US'

export interface ChatModelCapabilities {
  thinking?: Record<string, unknown> | false
  search?: Record<string, unknown> | false
}

export interface ChatModelOption {
  id: string
  provider: string
  name: string
  model: string
  apiUrl: string
  apiKey?: string
  icon?: Component
  capabilities?: ChatModelCapabilities
}

export type ChatMcpTransportType = 'sse' | 'streamableHttp'

export interface ChatMcpServerConfig {
  name: string
  description: string
  type: ChatMcpTransportType
  url: string
  icon: string
  headers?: Record<string, string>
  category?: string
}

export interface ChatPromptItem {
  title: string
  description: string
  message: string
  icon?: Component
}

export type ChatWelcomeIcon = Component | VNode

export interface ChatLocale {
  newConversation?: string
  historyTitle?: string
  closeHistory?: string
  openHistory?: string
  openMcp?: string
  mcpTitle?: string
  installedTabTitle?: string
  marketTabTitle?: string
  searchPluginsPlaceholder?: string
  marketCategoryPlaceholder?: string
  missingProviderConfig?: string
  unavailableModelConfig?: string
  unavailableModelPrompt?: string
  missingProviderPrompt?: string
  thinkingPrompt?: string
  defaultPrompt?: string
  selectModel?: string
  fallbackConversationTitle?: string
  themeLightMode?: string
  themeDarkMode?: string
}

export interface ChatProps {
  show?: boolean
  fullscreen?: boolean
  selectedModelId?: string
  lang?: ChatLang
  title?: string
  storageKey?: string
  activeConversationStorageKey?: string
  mcpStorageKey?: string
  systemPrompt?: string
  launcher?: boolean
  launcherIcon?: Component
  launcherAriaLabel?: string
  modelOptions: ChatModelOption[]
  modelPlaceholder?: string
  mcpServers?: Record<string, ChatMcpServerConfig>
  defaultInstalledMcpServerIds?: string[]
  marketMcpServerIds?: string[]
  welcomeTitle?: string
  welcomeDescription?: string
  welcomeIcon?: ChatWelcomeIcon
  promptItems?: ChatPromptItem[]
  locale?: ChatLocale
}

export interface ChatSlots {
  welcome?: () => unknown
}

export interface ChatEmits {
  (e: 'close'): void
  (e: 'open'): void
  (e: 'update:show', value: boolean): void
  (e: 'update:fullscreen', value: boolean): void
  (e: 'update:selectedModelId', value: string): void
  (e: 'conversation-change', conversationId: string | null): void
}

export type InstalledChatPlugin = PluginInfo
