/**
 * Chat-Input 组件模块扩展
 *
 * 为 ChatInput 组件添加静态属性和便捷函数的类型声明
 */

import type { Mention, Suggestion, TemplateBlock } from '../extensions'
import type { mention, suggestion, template } from '../helpers/extension-helpers'

declare module '../index.vue' {
  interface ChatInputComponent {
    // 扩展类（用于继承）
    Mention: typeof Mention
    Suggestion: typeof Suggestion
    TemplateBlock: typeof TemplateBlock

    // 便捷函数（用于简单场景）
    mention: typeof mention
    suggestion: typeof suggestion
    template: typeof template
  }
}
