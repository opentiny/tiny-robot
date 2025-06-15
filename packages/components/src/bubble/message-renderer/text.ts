import { h } from 'vue'
import { BubbleMessageFunctionRenderer } from '../types'

export const BubbleTextMessageRenderer: BubbleMessageFunctionRenderer = {
  type: 'text',
  renderer: (message) => {
    return h('span', { style: { display: 'block' } }, message.content)
  },
}
