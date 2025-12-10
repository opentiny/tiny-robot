import { markRaw } from 'vue'
import { BubbleRendererMatchPriority } from '../constants'
import type { BubbleBoxRendererMatch, BubbleContentRendererMatch } from '../index.type'
import Box from './Box.vue'
import Image from './Image.vue'
import ImageBox from './ImageBox.vue'
import Loading from './Loading.vue'
import Reasoning from './Reasoning.vue'
import Text from './Text.vue'
import ToolRole from './ToolRole.vue'
import Tools from './Tools.vue'

export const defaultBoxRendererMatches: Array<BubbleBoxRendererMatch> = [
  {
    find: (messages) =>
      messages.length === 1 &&
      typeof messages[0].content === 'object' &&
      messages[0].content !== null &&
      messages[0].content.type === 'image_url',
    renderer: markRaw(ImageBox),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
]

export const defaultContentRendererMatches: Array<BubbleContentRendererMatch> = [
  {
    find: (message) => Boolean(message.loading),
    renderer: markRaw(Loading),
    priority: BubbleRendererMatchPriority.LOADING,
  },
  {
    find: (message) => typeof message.reasoning_content === 'string',
    renderer: markRaw(Reasoning),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
  {
    find: (message) => Array.isArray(message.tool_calls) && message.tool_calls.length > 0,
    renderer: markRaw(Tools),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
  {
    find: (message) => typeof message.content === 'object' && message.content?.type === 'image_url',
    renderer: markRaw(Image),
    priority: BubbleRendererMatchPriority.CONTENT,
  },
  {
    find: (message) => message.role === 'tool',
    renderer: markRaw(ToolRole),
    priority: BubbleRendererMatchPriority.ROLE,
  },
]

export const defaultFallbackBoxRenderer = markRaw(Box)
export const defaultFallbackContentRenderer = markRaw(Text)
