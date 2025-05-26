<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed, useTemplateRef, watch } from 'vue'
import Bubble from './Bubble.vue'
import { useMarkdownIt } from './composables/useMarkdownIt'
import { BubbleListProps, BubbleProps, BubbleSlots } from './index.type'

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

const { parse: parseMarkdown } = useMarkdownIt()

const getItemProps = (item: BubbleListProps['items'][number]): BubbleProps => {
  const defaultConfig = item.role ? props.roles?.[item.role] || {} : {}
  const { slots: _roleSlots, ...rest } = defaultConfig
  const { slots: _itemSlots, ...restItem } = item
  const mergedProps = { ...rest, ...restItem }

  if (mergedProps.type === 'markdown' && !mergedProps.transformContent) {
    mergedProps.transformContent = (content) =>
      parseMarkdown(content || '', mergedProps.mdConfig, mergedProps.domPurifyConfig)
  }

  return mergedProps
}

const getItemSlots = (item: BubbleListProps['items'][number]): BubbleSlots => {
  const defaultConfig = item.role ? props.roles?.[item.role] || {} : {}
  return { ...defaultConfig.slots, ...item.slots }
}
</script>

<template>
  <div class="tr-bubble-list" ref="scrollContainer">
    <Bubble v-for="(item, index) in props.items" :key="item.id || index" v-bind="getItemProps(item)">
      <template v-for="(_, slotName) in getItemSlots(item)" #[slotName]="slotProps" :key="slotName">
        <component :is="getItemSlots(item)[slotName]" v-bind="slotProps" />
      </template>
    </Bubble>
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
