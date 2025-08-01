<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import Bubble from './Bubble.vue'
import { BubbleListProps } from './index.type'

const props = withDefaults(defineProps<BubbleListProps>(), {})

const scrollContainerRef = ref<HTMLDivElement | null>(null)
const { y } = useScroll(scrollContainerRef, {
  behavior: 'smooth',
  throttle: 100,
})
const lastBubble = computed(() => props.items.at(-1))

watch(
  [() => props.items.length, () => lastBubble.value?.content],
  () => {
    if (!props.autoScroll || !scrollContainerRef.value) {
      return
    }

    y.value = scrollContainerRef.value.scrollHeight
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
        props: { ...restConfig, ...restItem },
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 16px;
}
</style>
