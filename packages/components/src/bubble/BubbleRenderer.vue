<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { BubbleRendererMessage, BubbleRendererProps } from './index.type'
import Box from './ren/Box.vue'
import Image from './ren/Image.vue'
import ImageBox from './ren/ImageBox.vue'
import Text from './ren/Text.vue'

const props = defineProps<BubbleRendererProps>()

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

const boxRenderer = computed(() => {
  const foundRenderer = boxRendererMatches.find((match) => match.find(props))?.renderer

  if (!foundRenderer) {
    return Box
  }

  return foundRenderer
})

const contentRendererMatches: Array<{
  find: (message: BubbleRendererMessage) => boolean
  renderer: Component
}> = [
  {
    find: (message) => typeof message.content === 'string',
    renderer: Text,
  },
  {
    find: (message) => typeof message.content === 'object' && message.content?.type === 'image_url',
    renderer: Image,
  },
]

const getContentRenderer = (message: BubbleRendererMessage) => {
  const foundRenderer = contentRendererMatches.find((renderer) => renderer.find(message))?.renderer

  if (!foundRenderer) {
    return Text
  }

  return foundRenderer
}
</script>

<template>
  <component :is="boxRenderer" :placement="props.placement" :shape="props.shape">
    <component
      v-for="(message, index) in props.messages"
      :key="index"
      :is="getContentRenderer(message)"
      v-bind="message"
    ></component>
  </component>
</template>
