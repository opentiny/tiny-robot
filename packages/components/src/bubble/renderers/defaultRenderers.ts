import { markRaw } from 'vue'
import { BubbleRendererMatchPriority } from '../constants'
import type { BubbleBoxRendererMatch, BubbleContentRendererMatch } from '../index.type'
import Box from './Box.vue'
import Image from './Image.vue'
import Loading from './Loading.vue'
import Reasoning from './Reasoning.vue'
import Text from './Text.vue'
import ToolRole from './ToolRole.vue'
import Tools from './Tools.vue'

export const defaultBoxRendererMatches: Array<BubbleBoxRendererMatch> = [
  {
    find: (messages, contentIndex) =>
      messages.length === 1 &&
      Array.isArray(messages[0].content) &&
      typeof contentIndex === 'number' &&
      messages[0].content[contentIndex].type === 'image_url',
    renderer: markRaw(Box),
    priority: BubbleRendererMatchPriority.NORMAL,
    attributes: { 'data-box-type': 'image' },
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
    find: (message, contentIndex) =>
      Array.isArray(message.content) &&
      typeof contentIndex === 'number' &&
      message.content[contentIndex].type === 'image_url',
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
