/**
 * Template 扩展定义（统一入口）
 */

import { Extension } from '@tiptap/core'
import type { TemplateOptions } from './types'
import { templateCommands } from './commands'
import { TemplateBlock } from './block/extension'
import { TemplateSelect } from './select/extension'
import './block/index.less'
import './select/index.less'

/**
 * Template 扩展（统一入口，包含 TemplateBlock 和 TemplateSelect）
 */
export const Template = Extension.create<TemplateOptions>({
  name: 'templateExtension',

  addExtensions() {
    return [TemplateBlock.configure(this.options), TemplateSelect]
  },

  // 添加命令（统一命令入口）
  addCommands() {
    return templateCommands
  },
})
