import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { TrChatHTMLElement, TrChatUIHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'tr-chat': DetailedHTMLProps<HTMLAttributes<TrChatHTMLElement>, TrChatHTMLElement>
      'tr-chat-ui': DetailedHTMLProps<HTMLAttributes<TrChatUIHTMLElement>, TrChatUIHTMLElement>
    }
  }
}
