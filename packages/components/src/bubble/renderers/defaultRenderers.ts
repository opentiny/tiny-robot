import { markRaw } from 'vue'
import type { BubbleBoxRendererMatch, BubbleContentBoxProps, BubbleContentRendererMatch } from '../index.type'
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
    find: (props: BubbleContentBoxProps) =>
      props.messages.length === 1 &&
      typeof props.messages[0].content === 'object' &&
      props.messages[0].content !== null &&
      props.messages[0].content.type === 'image_url',
    renderer: markRaw(ImageBox),
    priority: 10,
  },
]

export const defaultContentRendererMatches: Array<BubbleContentRendererMatch> = [
  {
    find: (message) => Boolean(message.loading),
    renderer: markRaw(Loading),
    priority: -1,
  },
  {
    find: (message) => typeof message.reasoning_content === 'string',
    renderer: markRaw(Reasoning),
    priority: 10,
  },
  {
    find: (message) => Array.isArray(message.tool_calls) && message.tool_calls.length > 0,
    renderer: markRaw(Tools),
    priority: 10,
  },
  {
    find: (message) => typeof message.content === 'object' && message.content?.type === 'image_url',
    renderer: markRaw(Image),
    priority: 20,
  },
  {
    find: (message) => message.role === 'tool',
    renderer: markRaw(ToolRole),
    priority: 30,
  },
]

export const defaultFallbackBoxRenderer = markRaw(Box)
export const defaultFallbackContentRenderer = markRaw(Text)
