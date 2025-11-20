import { Component } from 'vue'
import type { BubbleRendererMessage, BubbleRendererProps } from '../index.type'
import Box from './Box.vue'
import Image from './Image.vue'
import ImageBox from './ImageBox.vue'
import Reasoning from './Reasoning.vue'
import Text from './Text.vue'

const boxRendererMatches: Array<{
  find: (props: BubbleRendererProps) => boolean
  renderer: Component
}> = [
  {
    find: (props: BubbleRendererProps) =>
      props.messages.length === 1 &&
      typeof props.messages[0].content === 'object' &&
      props.messages[0].content?.type === 'image_url',
    renderer: ImageBox,
  },
]

const contentRendererMatches: Array<{
  find: (message: BubbleRendererMessage) => boolean
  renderer: Component
}> = [
  {
    find: (message) => typeof message.content === 'object' && message.content?.type === 'image_url',
    renderer: Image,
  },
  {
    find: (message) => typeof message.reasoning_content === 'string',
    renderer: Reasoning,
  },
  {
    find: (message) => typeof message.content === 'string',
    renderer: Text,
  },
]

export const getBoxRenderer = (props: BubbleRendererProps) => {
  const foundRenderer = boxRendererMatches.find((match) => match.find(props))?.renderer
  if (!foundRenderer) {
    return Box
  }
  return foundRenderer
}

export const getContentRenderer = (message: BubbleRendererMessage) => {
  const foundRenderer = contentRendererMatches.find((renderer) => renderer.find(message))?.renderer

  if (!foundRenderer) {
    return Text
  }

  return foundRenderer
}
