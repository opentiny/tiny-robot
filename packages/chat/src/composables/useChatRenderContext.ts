import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'
import type { ChatMessageItem } from '../types'

export interface ChatRenderEnvironment {
  scrollRoot: ComputedRef<HTMLElement | null>
  conversationId: ComputedRef<string | null | undefined>
}

export interface ChatRenderContext extends ChatRenderEnvironment {
  messageKey: ComputedRef<string>
  contentIndex: ComputedRef<number>
  streamState: ComputedRef<NonNullable<ChatMessageItem['streamState']>>
}

export const CHAT_RENDER_ENVIRONMENT: InjectionKey<ChatRenderEnvironment> = Symbol('chat-render-environment')

export function useChatRenderContext(props: Readonly<BubbleContentRendererProps>): ChatRenderContext | undefined {
  const environment = inject(CHAT_RENDER_ENVIRONMENT, undefined)
  if (!environment) return undefined
  return {
    ...environment,
    messageKey: computed(() => (props.message as ChatMessageItem).renderKey ?? ''),
    contentIndex: computed(() => props.contentIndex),
    streamState: computed(() => (props.message as ChatMessageItem).streamState ?? 'unknown'),
  }
}
