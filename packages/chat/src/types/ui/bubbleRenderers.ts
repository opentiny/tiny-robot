import type {
  BubbleAttributes,
  BubbleBoxRendererContext,
  BubbleMessage,
  ChatMessageContentItem,
} from '@opentiny/tiny-robot'
import type { ChatRenderer } from '../../renderers/domRenderer'

export type ChatBuiltinBubbleContentRenderer =
  'text' | 'markdown' | 'image' | 'loading' | 'reasoning' | 'tools' | 'tool-role'

export type ChatBuiltinBubbleBoxRenderer = 'box'

export interface ChatBubbleContentRendererContext {
  readonly message: BubbleMessage
  readonly content: ChatMessageContentItem
  readonly contentIndex: number
}

export interface ChatBubbleBoxRendererContext extends BubbleBoxRendererContext {
  readonly messages: readonly BubbleMessage[]
  readonly content?: ChatMessageContentItem
  readonly contentIndex?: number
  readonly placement?: 'start' | 'end'
  readonly shape?: 'corner' | 'rounded' | 'none'
  /** Insert this node into the returned box so TrChat can render the matched Bubble content inside it. */
  readonly contentRoot: HTMLElement
}

export type ChatBubbleContentRenderer =
  ChatBuiltinBubbleContentRenderer | ChatRenderer<ChatBubbleContentRendererContext>

export type ChatBubbleBoxRenderer = ChatBuiltinBubbleBoxRenderer | ChatRenderer<ChatBubbleBoxRendererContext>

export interface ChatBubbleContentRendererMatch {
  readonly find: (message: BubbleMessage, content: ChatMessageContentItem, contentIndex: number) => boolean
  readonly renderer: ChatBubbleContentRenderer
  readonly priority?: number
  readonly attributes?: BubbleAttributes
}

export interface ChatBubbleBoxRendererMatch {
  readonly find: (
    messages: readonly BubbleMessage[],
    content: ChatMessageContentItem | undefined,
    contentIndex: number | undefined,
    context: BubbleBoxRendererContext,
  ) => boolean
  readonly renderer: ChatBubbleBoxRenderer
  readonly priority?: number
  readonly attributes?:
    | BubbleAttributes
    | ((
        messages: readonly BubbleMessage[],
        content: ChatMessageContentItem | undefined,
        contentIndex: number | undefined,
      ) => BubbleAttributes | undefined)
}

export interface ChatBubbleRenderers {
  readonly contentRendererMatches?: readonly ChatBubbleContentRendererMatch[]
  readonly boxRendererMatches?: readonly ChatBubbleBoxRendererMatch[]
}
