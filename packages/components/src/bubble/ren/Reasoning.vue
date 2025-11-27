<script setup lang="ts">
import { computed } from 'vue'
import { BubbleRendererMessage, ChatMessageItem } from '../index.type'
import CollapsibleContent from './CollapsibleContent.vue'
import { getContentRenderer } from './renderers'

const props = defineProps<
  BubbleRendererMessage<
    string | ChatMessageItem,
    {
      thinking: boolean
      open?: boolean
    }
  >
>()

const renderer = computed(() => {
  const { reasoning_content: _, ...restProps } = props
  return getContentRenderer(restProps)
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
