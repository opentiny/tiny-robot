/**
 * Sender 组件入口
 *
 * 提供两种扩展使用方式：
 * 1. 静态属性：Sender.Mention.configure() - 用于扩展继承
 * 2. 便捷函数：Sender.mention() - 用于简单场景
 */

import type { App } from 'vue'
import SenderComponent from './index.vue'
import { Mention, Suggestion, Template, mention, suggestion, template } from './extensions'
import './index.less'

// 设置组件名称
SenderComponent.name = 'TrSender'

// Vue 插件安装函数
const install = function <T>(app: App<T>) {
  app.component(SenderComponent.name!, SenderComponent)
}

// 扩展组件，添加静态属性和便捷函数
const Sender = Object.assign(SenderComponent, {
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

export default Sender

export type {
  SenderProps,
  SenderEmits,
  SenderSlots,
  SenderContext,
  SenderExternalPayload,
  SenderSubmitExtra,
  UseEditorReturn,
  UseModeSwitchReturn,
  UseSuggestionReturn,
  UseKeyboardShortcutsReturn,
  TemplateItem,
  MentionItem,
  DefaultActions,
} from './index.type'

export { useSenderContext } from './context'

// ========== 扩展类型导出 ==========
export type { TemplateAttrs, TemplateOptions } from './extensions/template'
export type { MentionAttrs, MentionOptions } from './extensions/mention'
export type {
  SenderSuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './extensions/suggestion'
