import { BubbleCollapsibleTextContentRenderer } from './collapsible-text'
import { BubbleContentRenderer } from './index.type'
import { BubbleTextContentRenderer } from './text'
import { BubbleToolContentRenderer } from './tool'

export const defaultContentRendererMap = new Map<string, BubbleContentRenderer>([
  ['text', BubbleTextContentRenderer],
  ['tool', BubbleToolContentRenderer],
  ['collapsible-text', BubbleCollapsibleTextContentRenderer],
])

export const RENDERER_MAP_PROVIDER_KEY = Symbol('bubbleContentRendererMap')

export const FALLBACK_RENDERER_PROVIDER_KEY = Symbol('bubbleContentFallbackRenderer')
