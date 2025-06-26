import { BubbleCollapsibleTextMessageRenderer } from './collapsible-text'
import { BubbleMessageRenderer } from './index.type'
import { BubbleTextMessageRenderer } from './text'
import { BubbleToolMessageRenderer } from './tool'

export const defaultMessageRendererMap = new Map<string, BubbleMessageRenderer>([
  ['text', BubbleTextMessageRenderer],
  ['tool', BubbleToolMessageRenderer],
  ['collapsible-text', BubbleCollapsibleTextMessageRenderer],
])

export const RENDERER_MAP_PROVIDER_KEY = Symbol('bubbleMessageRendererMap')

export const FALLBACK_RENDERER_PROVIDER_KEY = Symbol('bubbleMessageFallbackRenderer')
