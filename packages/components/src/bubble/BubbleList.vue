<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Bubble from './Bubble.vue'
import { BubbleListProps, BubbleProps } from './index.type'
import { useElementScroll } from './useScroll'

const props = withDefaults(defineProps<BubbleListProps>(), {})

const scrollContainer = ref<HTMLDivElement>()
const { scrollToBottom } = useElementScroll(scrollContainer)

const lastBubble = computed(() => props.items.at(-1))

watch([() => props.items.length, () => lastBubble.value?.content], () => {
  if (!props.autoScroll) {
    return
  }

  scrollToBottom()
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
