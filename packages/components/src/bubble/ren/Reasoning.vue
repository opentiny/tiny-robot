<script setup lang="ts">
import { computed } from 'vue'
import { BubbleRendererMessage } from '../index.type'
import ToggleContent from './ToggleContent.vue'
import { getContentRenderer } from './renderers'

const props = defineProps<BubbleRendererMessage>()

const renderer = computed(() => {
  const { reasoning_content: _, ...restProps } = props
  return getContentRenderer(restProps)
})
</script>

<template>
  <ToggleContent
    v-bind="props"
    :extras="{
      ...props.extras,
      title: props.extras?.thinking ? '正在思考' : '已思考',
      detail: props.reasoning_content ?? '',
      defaultOpen: Boolean(props.extras?.reasoningExpandDefault),
    }"
  />
  <component :is="renderer" v-bind="props" />
</template>
