import { CSSProperties, h } from 'vue'
import { BubbleMessageFunctionRenderer } from '../types'

export const BubbleTextMessageRenderer: BubbleMessageFunctionRenderer = {
  type: 'text',
  renderer: (message) => {
    return h(
      'span',
      {
        style: {
          display: 'block',
          fontSize: '14px',
          lineHeight: '24px',
          wordBreak: 'break-word',
          whiteSpace: 'pre-line',
        } as CSSProperties,
      },
      message.content,
    )
  },
}
