/**
 * Template 扩展定义（统一入口）
 */

import { Extension } from '@tiptap/core'
import type { TemplateOptions } from './types'
import { templateCommands } from './commands'
import { TemplateBlock } from './block/extension'
import { TemplateSelect } from './select/extension'
import { EXTENSION_NAMES } from '../constants'

/**
 * Template 扩展（统一入口，包含 TemplateBlock 和 TemplateSelect）
 */
export const Template = Extension.create<TemplateOptions>({
  name: EXTENSION_NAMES.TEMPLATE,

  addExtensions() {
    return [TemplateBlock.configure(this.options), TemplateSelect.configure({ appendTo: this.options.appendTo })]
  },

  // 添加命令（统一命令入口）
  addCommands() {
    return templateCommands
  },
})
