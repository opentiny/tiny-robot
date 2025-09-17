<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import Bubble from './Bubble.vue'
import { BubbleListProps } from './index.type'

const props = withDefaults(defineProps<BubbleListProps>(), {})

const scrollContainerRef = ref<HTMLDivElement | null>(null)
const { y } = useScroll(scrollContainerRef, {
  behavior: 'smooth',
  throttle: 100,
})
const lastBubble = computed(() => props.items.at(-1))
const lastBubbleCustomContentLength = computed(() => {
  if (!lastBubble.value) {
    return 0
  }

  const customContentField =
    lastBubble.value.customContentField || props.roles?.[lastBubble.value.role || '']?.customContentField

  if (!customContentField) {
    return 0
  }

  const bubble = lastBubble.value as Record<string, unknown>

  if (Array.isArray(bubble[customContentField])) {
    const lastItem = bubble[customContentField].at(-1)
    if (lastItem && typeof lastItem === 'object' && 'content' in lastItem) {
      try {
        return JSON.stringify(lastItem.content).length
      } catch {}
    }

    return bubble[customContentField].length
  }

  return 0
})

watch(
  () => [props.autoScroll, props.items.length, lastBubble.value?.content, lastBubbleCustomContentLength.value] as const,
  ([autoScroll]) => {
    nextTick(() => {
      if (!autoScroll || !scrollContainerRef.value) {
        return
      }

      y.value = scrollContainerRef.value.scrollHeight
    })
  },
  { deep: true },
)

const processedItems = computed(() => {
  return props.items
    .map((item) => {
      const roleConfig = item.role ? props.roles?.[item.role] || {} : {}
      if (roleConfig.hidden) {
        return null
      }

      const { slots: roleSlots, hidden: _hidden, ...restConfig } = roleConfig
      const { slots: itemSlots, ...restItem } = item

      return {
        id: item.id,
        props: { ...restConfig, ...restItem, 'data-role': item.role },
        slots: { ...roleSlots, ...itemSlots },
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
})

const loadingBubble = computed(() => {
  if (!(props.loading && props.loadingRole && props.roles?.[props.loadingRole])) {
    return null
  }

  const { slots, ...rest } = props.roles[props.loadingRole]

  return { props: { ...rest, loading: true }, slots }
})
</script>

<template>
  <div class="tr-bubble-list" ref="scrollContainerRef">
    <Bubble v-for="(item, index) in processedItems" :key="item.id || index" v-bind="item.props">
      <template v-for="(slot, slotName) in item.slots" #[slotName]="slotProps" :key="slotName">
        <component :is="slot" v-bind="slotProps" />
      </template>
    </Bubble>

    <Bubble v-if="loadingBubble" v-bind="loadingBubble.props">
      <template v-for="(slot, slotName) in loadingBubble.slots" #[slotName]="slotProps" :key="slotName">
        <component :is="slot" v-bind="slotProps" />
      </template>
    </Bubble>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble-list {
  --gap: var(--tr-bubble-list-gap);
  --padding: var(--tr-bubble-list-padding);
}

.tr-bubble-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  overflow-y: auto;
  padding: var(--padding);
}
</style>
