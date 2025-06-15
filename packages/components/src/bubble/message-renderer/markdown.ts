import markdownit, { Options as MarkdownItOptions } from 'markdown-it'
import { h } from 'vue'
import { BubbleMessageFunctionRenderer } from '../types'

export const BubbleMarkdownMessageRenderer: BubbleMessageFunctionRenderer<{ mdConfig?: MarkdownItOptions }> = {
  type: 'markdown',
  renderer: (message) => {
    // TODO DOMPurify 处理
    return h('div', { innerHTML: markdownit(message.data?.mdConfig || {}).render(message.content || '') })
  },
}
