<script setup lang="ts">
import { computed } from 'vue'
import { useBubbleContentRenderer } from '../composables'
import { BubbleChatMessageItem, BubbleRendererMessage } from '../index.type'
import CollapsibleContent from './CollapsibleContent.vue'

const props = defineProps<
  BubbleRendererMessage<
    string | BubbleChatMessageItem,
    {
      thinking: boolean
      open?: boolean
    }
  >
>()

const restProps = computed(() => {
  const { reasoning_content: _, ...rest } = props
  return rest
})

const renderer = useBubbleContentRenderer(restProps)
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
  <component :is="renderer" v-bind="restProps" />
</template>
