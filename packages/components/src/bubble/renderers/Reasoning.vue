<script setup lang="ts">
import { useBubbleContentRenderer } from '../composables/useBubbleContentRenderer'
import { BubbleRendererMessage, ChatMessageItem } from '../index.type'
import CollapsibleContent from './CollapsibleContent.vue'

const props = defineProps<
  BubbleRendererMessage<
    string | ChatMessageItem,
    {
      thinking: boolean
      open?: boolean
    }
  >
>()

const renderer = useBubbleContentRenderer(() => {
  const { reasoning_content: _, ...restProps } = props
  return restProps
})
</script>

<template>
  <CollapsibleContent
    v-bind="props"
    :extras="{
      ...props.extras,
      title: props.extras?.thinking ? '正在思考' : '已思考',
      detail: props.reasoning_content ?? '',
      open: props.extras?.open,
    }"
  />
  <component :is="renderer" v-bind="props" />
</template>
