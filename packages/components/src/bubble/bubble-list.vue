<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed, useTemplateRef, watch } from 'vue'
import Bubble from './bubble.vue'
import { BubbleListProps, BubbleProps } from './index.type'

const props = withDefaults(defineProps<BubbleListProps>(), {})

const scrollContainerRef = useTemplateRef<HTMLDivElement>('scrollContainer')
const { y } = useScroll(scrollContainerRef, {
  behavior: 'smooth',
  throttle: 100,
})
const lastBubble = computed(() => props.items.at(-1))

watch([() => props.items.length, () => lastBubble.value?.content], () => {
  if (!props.autoScroll || !scrollContainerRef.value) {
    return
  }

  y.value = scrollContainerRef.value.scrollHeight
})

const getItemProps = (item: BubbleProps): BubbleProps => {
  const defaultConfig = item.role ? props.roles?.[item.role] || {} : {}
  return { ...defaultConfig, ...item }
}
</script>

<template>
  <div class="tr-bubble-list" ref="scrollContainer">
    <Bubble v-for="(item, index) in props.items" :key="item.id || index" v-bind="getItemProps(item)"></Bubble>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 16px;
}
</style>
