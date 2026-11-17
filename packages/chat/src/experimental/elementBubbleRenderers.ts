import type {
  BubbleContentRendererMatch,
  BubbleEvent,
  BubbleMessage,
  ChatMessageContentItem,
} from '@opentiny/tiny-robot'
import type { ChatRenderer } from './elementRenderers'

/** One resolved content item of a message. Operations follow the existing Bubble event pipeline. */
export interface ChatBubbleContentRendererContext {
  readonly message: Readonly<BubbleMessage>
  readonly content: Readonly<ChatMessageContentItem>
  readonly contentIndex: number
  emit(event: BubbleEvent): void
  setState(key: string, value: unknown): void
}

export interface ChatBubbleContentRendererMatch extends Omit<BubbleContentRendererMatch, 'renderer'> {
  renderer: ChatRenderer<ChatBubbleContentRendererContext>
}

export interface ChatBubbleRenderers {
  readonly contentRendererMatches?: readonly ChatBubbleContentRendererMatch[]
  readonly fallbackContentRenderer?: ChatRenderer<ChatBubbleContentRendererContext>
}
