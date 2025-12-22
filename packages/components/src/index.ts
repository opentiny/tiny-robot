import './styles/root.css'
import './styles/components/index.css'

import { App } from 'vue'
import Attachments from './attachments'
import { Bubble, BubbleList, BubbleProvider, BubbleMarkdownContentRenderer, BubbleContentClassRenderer } from './bubble'
import Container from './container'
import Conversations from './conversations'
import DragOverlay from './drag-overlay'
import DropdownMenu from './dropdown-menu'
import Feedback from './feedback'
import History from './history'
import IconButton from './icon-button'
import { Prompt, Prompts } from './prompts'
import Sender from './sender'
import SenderCompat from './sender-compat'
import SuggestionPills, { SuggestionPillButton } from './suggestion-pills'
import SuggestionPopover from './suggestion-popover'
import ThemeProvider from './theme-provider'
import Welcome from './welcome'
import McpServerPicker from './mcp-server-picker'
import McpAddForm from './mcp-add-form'
import {
  ActionButton,
  SubmitButton,
  ClearButton,
  UploadButton,
  VoiceButton,
  WordCounter,
  DefaultActionButtons,
} from './chat-input-actions'

export * from './attachments/index.type'
export * from './bubble/index.type'
export * from './container/index.type'
export * from './drag-overlay/index.type'
export * from './dropdown-menu/index.type'
export * from './feedback/index.type'
export * from './history/index.type'
export * from './icon-button/index.type'
export * from './prompts/index.type'
export * from './sender/index.type'
export * from './suggestion-pills/index.type'
export * from './suggestion-popover/index.type'
export * from './theme-provider/index.type'
export * from './welcome/index.type'
export * from './mcp-server-picker/index.type'
export * from './mcp-add-form/index.type'

// 扩展类型导出（供 Sender 使用）
export type { TemplateAttrs, TemplateOptions } from './chat-input/extensions/template'
export type { MentionAttrs, MentionOptions, MentionItem } from './chat-input/extensions/mention'
export type {
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './chat-input/extensions/suggestion'

// 其他 ChatInput 相关类型
export type { TemplateItem, DefaultActions } from './chat-input/index.type'

// ChatInputActions 类型导出
export type { ActionButtonProps } from './chat-input-actions'
export type { UploadButtonProps, UploadButtonEmits } from './chat-input-actions'
export type { VoiceButtonProps, VoiceButtonEmits } from './chat-input-actions'

export { useTheme } from './theme-provider/useTheme'
export { useSenderContext } from './sender'
export { vDropzone } from './drag-overlay/directives/vDropzone'
export { useTouchDevice } from './shared/composables/useTouchDevice'

const components = [
  Attachments,
  Bubble,
  BubbleList,
  BubbleProvider,
  Container,
  Conversations,
  DragOverlay,
  DropdownMenu,
  Feedback,
  History,
  IconButton,
  Prompt,
  Prompts,
  Sender,
  SenderCompat,
  SuggestionPills,
  SuggestionPillButton,
  SuggestionPopover,
  ThemeProvider,
  Welcome,
  McpServerPicker,
  McpAddForm,
  ActionButton,
  SubmitButton,
  ClearButton,
  UploadButton,
  VoiceButton,
  WordCounter,
  DefaultActionButtons,
]

export default {
  install<T>(app: App<T>) {
    components.forEach((component) => {
      const name = component.name!.replace(/^Tiny/, '').replace(/^Tr/, '')
      app.component(`Tr${name}`, component)
    })
  },
}

export {
  Attachments,
  Attachments as TrAttachments,
  Bubble,
  Bubble as TrBubble,
  BubbleList,
  BubbleList as TrBubbleList,
  BubbleProvider,
  BubbleProvider as TrBubbleProvider,
  BubbleMarkdownContentRenderer,
  BubbleContentClassRenderer,
  Container,
  Container as TrContainer,
  Conversations,
  Conversations as TrConversations,
  DragOverlay,
  DragOverlay as TrDragOverlay,
  DropdownMenu,
  DropdownMenu as TrDropdownMenu,
  Feedback,
  Feedback as TrFeedback,
  History,
  History as TrHistory,
  IconButton,
  IconButton as TrIconButton,
  Prompt,
  Prompt as TrPrompt,
  Prompts,
  Prompts as TrPrompts,
  Sender,
  Sender as TrSender,
  SenderCompat,
  SenderCompat as TrSenderCompat,
  SuggestionPillButton,
  SuggestionPillButton as TrSuggestionPillButton,
  SuggestionPills,
  SuggestionPills as TrSuggestionPills,
  SuggestionPopover,
  SuggestionPopover as TrSuggestionPopover,
  ThemeProvider,
  ThemeProvider as TrThemeProvider,
  Welcome,
  Welcome as TrWelcome,
  McpServerPicker,
  McpServerPicker as TrMcpServerPicker,
  McpAddForm,
  McpAddForm as TrMcpAddForm,
  ActionButton,
  ActionButton as TrActionButton,
  SubmitButton,
  SubmitButton as TrSubmitButton,
  ClearButton,
  ClearButton as TrClearButton,
  UploadButton,
  UploadButton as TrUploadButton,
  VoiceButton,
  VoiceButton as TrVoiceButton,
  WordCounter,
  WordCounter as TrWordCounter,
  DefaultActionButtons,
  DefaultActionButtons as TrDefaultActionButtons,
}
