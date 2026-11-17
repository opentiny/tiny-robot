import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'tr-chat': DetailedHTMLProps<HTMLAttributes<TrChatHTMLElement>, TrChatHTMLElement>
    }
  }
}
