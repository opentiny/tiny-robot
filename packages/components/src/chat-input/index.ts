/**
 * Chat-Input 组件入口
 *
 * 提供两种扩展使用方式：
 * 1. 静态属性：ChatInput.Mention.configure() - 用于扩展继承
 * 2. 便捷函数：ChatInput.mention() - 用于简单场景
 */

import type { App } from 'vue'
import ChatInputComponent from './index.vue'
import { Mention, Suggestion, Template, mention, suggestion, template } from './extensions'
import './index.less'

// 设置组件名称
ChatInputComponent.name = 'TrChatInput'

// Vue 插件安装函数
const install = function <T>(app: App<T>) {
  app.component(ChatInputComponent.name!, ChatInputComponent)
}

// 扩展组件，添加静态属性和便捷函数
const ChatInput = Object.assign(ChatInputComponent, {
  install,
  // 扩展类（用于继承）
  Mention,
  Suggestion,
  Template,
  // 便捷函数（用于简单场景）
  mention,
  suggestion,
  template,
})

export default ChatInput

export type {
  ChatInputProps,
  ChatInputEmits,
  ChatInputSlots,
  ChatInputContext,
  UseEditorReturn,
  UseModeSwitchReturn,
  UseSuggestionReturn,
  UseKeyboardShortcutsReturn,
  TemplateItem,
  MentionItem,
  DefaultActions,
} from './index.type'

export { useChatInputContext } from './context'

// ========== 扩展类型导出 ==========
export type { TemplateAttrs, TemplateOptions } from './extensions/template'
export type { MentionAttrs, MentionOptions } from './extensions/mention'
export type {
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './extensions/suggestion'
