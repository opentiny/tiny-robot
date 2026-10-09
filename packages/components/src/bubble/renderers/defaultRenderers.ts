import { markRaw } from 'vue'
import { BubbleRendererMatchPriority } from '../constants'
import { hasUniqueAskUserIds, isAskUserContent } from '../composables/useAskUser'
import type { BubbleBoxRendererMatch, BubbleContentRendererMatch } from '../index.type'
import AskUser from './AskUser.vue'
import Box from './Box.vue'
import Image from './Image.vue'
import Loading from './Loading.vue'
import Reasoning from './Reasoning.vue'
import Text from './Text.vue'
import ToolRole from './ToolRole.vue'
import Tools from './Tools.vue'

const containsImagesExclusively = (content: unknown) =>
  Array.isArray(content) && content.length > 0 && content.every((item) => item?.type === 'image_url')

export const defaultBoxRendererMatches: Array<BubbleBoxRendererMatch> = [
  {
    find: (_, content, _contentIndex, context) =>
      context.contentRenderMode === 'split'
        ? content?.type === 'image_url'
        : containsImagesExclusively(context.resolvedMessageContent),
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
    find: (message) => typeof message.reasoning_content === 'string' && message.reasoning_content.trim() !== '',
    renderer: markRaw(Reasoning),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
  {
    find: (message) => Array.isArray(message.tool_calls) && message.tool_calls.length > 0,
    renderer: markRaw(Tools),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
  {
    find: (_, content, _contentIndex, context) =>
      isAskUserContent(content) && hasUniqueAskUserIds(context?.resolvedMessageContent),
    renderer: markRaw(AskUser),
    priority: BubbleRendererMatchPriority.CONTENT,
  },
  {
    find: (_, content) => content.type === 'image_url',
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
