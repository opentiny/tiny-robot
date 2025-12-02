import { App } from 'vue'
import ChatInput from './index.vue'
import './index.less'

ChatInput.name = 'TrChatInput'

const install = function <T>(app: App<T>) {
  app.component(ChatInput.name!, ChatInput)
}

ChatInput.install = install

export default ChatInput as typeof ChatInput & { install: typeof install }

// 只导出 ChatInput 特有的类型，避免与 Sender 冲突
export type {
  ChatInputProps,
  ChatInputEmits,
  ChatInputSlots,
  ChatInputContext,
  UseEditorReturn,
  UseModeSwitchReturn,
  UseSuggestionReturn,
  UseSpeechReturn,
  UseFileUploadReturn,
  UseKeyboardShortcutsReturn,
  TemplateItem,
  MentionItem,
} from './index.type'

export { useChatInputContext } from './context'

// ========== 扩展导出（供按需引入）==========

/**
 * TemplateBlock 扩展
 *
 * @example 基础使用
 * ```typescript
 * import { TrChatInput, TrTemplateBlock } from '@tiny-robot/components'
 *
 * const extensions = [TrTemplateBlock]
 * ```
 *
 * @example 带响应式数据
 * ```typescript
 * import { TrChatInput, TrTemplateBlock } from '@tiny-robot/components'
 * import { ref } from 'vue'
 *
 * const items = ref([
 *   { type: 'text', content: '帮我分析' },
 *   { type: 'template', content: '' }
 * ])
 *
 * const extensions = [
 *   TrTemplateBlock.configure({ items })
 * ]
 * ```
 */
export { TemplateBlock } from './extensions'

/**
 * Mention 扩展
 *
 * @example
 * ```typescript
 * import { TrChatInput, TrMention } from '@tiny-robot/components'
 * import { ref } from 'vue'
 *
 * const mentions = ref([
 *   { label: '小小画家', preset: '帮我画画', icon: '🎨' }
 * ])
 *
 * const extensions = [
 *   TrMention.configure({
 *     items: mentions,
 *     char: '@',
 *     allowSpaces: false
 *   })
 * ]
 * ```
 */
export { Mention, MentionPluginKey } from './extensions'

/**
 * Suggestion 扩展
 *
 * @example 全局匹配模式
 * ```typescript
 * import { TrChatInput, TrSuggestion } from '@tiny-robot/components'
 * import { ref } from 'vue'
 *
 * const suggestions = ref([
 *   { content: 'ECS-云服务器' },
 *   { content: 'RDS-关系型数据库' }
 * ])
 *
 * const extensions = [
 *   TrSuggestion.configure({
 *     items: suggestions,
 *     char: null,
 *     showAutoComplete: true
 *   })
 * ]
 * ```
 *
 * @example 字符触发模式
 * ```typescript
 * const extensions = [
 *   TrSuggestion.configure({
 *     items: suggestions,
 *     char: '/',
 *     popupWidth: 500
 *   })
 * ]
 * ```
 */
export { Suggestion, SuggestionPluginKey } from './extensions'

// 扩展类型导出
export type { TemplateBlockAttrs } from './extensions/template-block'
export type { MentionOptions } from './extensions/mention'
export type {
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './extensions/suggestion'
