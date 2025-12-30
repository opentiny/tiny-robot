import { markRaw } from 'vue'
import type { BubbleBoxRendererMatch, BubbleContentRendererMatch } from '../index.type'
import Box from './Box.vue'
import Text from './Text.vue'

export const defaultBoxRendererMatches: Array<BubbleBoxRendererMatch> = []

export const defaultContentRendererMatches: Array<BubbleContentRendererMatch> = []

export const defaultFallbackBoxRenderer = markRaw(Box)
export const defaultFallbackContentRenderer = markRaw(Text)
