<script setup lang="ts">
import {
  BubbleMarkdownMessageRenderer,
  BubbleStepGroupMessageRenderer,
  BubbleTextMessageRenderer,
} from './message-renderer'
import {
  BubbleMessageComponentRenderer,
  BubbleMessageFunctionRenderer,
  BubbleMessageProps,
  BubbleMessageRenderer,
} from './types'

const props = defineProps<BubbleMessageProps>()

// TODO 改成注册式，支持自定义渲染器
const MessageRendererMap: Record<string, BubbleMessageRenderer> = {
  text: BubbleTextMessageRenderer,
  markdown: BubbleMarkdownMessageRenderer,
  'step-group': BubbleStepGroupMessageRenderer as unknown as BubbleMessageRenderer,
}
</script>

<template>
  <template v-if="(MessageRendererMap[props.type] as BubbleMessageFunctionRenderer).renderer">
    <component :is="(MessageRendererMap[props.type] as BubbleMessageFunctionRenderer).renderer(props)"></component>
  </template>
  <template v-else>
    <component
      :is="(MessageRendererMap[props.type] as BubbleMessageComponentRenderer).component"
      v-bind="props"
    ></component>
  </template>
</template>
