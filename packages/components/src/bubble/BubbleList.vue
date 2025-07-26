<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import Bubble from './Bubble.vue'
import { BubbleListProps, BubbleProps, BubbleSlots } from './index.type'

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

const getItemProps = (item: BubbleProps & { slots?: BubbleSlots }): BubbleProps => {
  const defaultConfig = item.role ? props.roles?.[item.role] || {} : {}
  const { slots: _roleSlots, ...rest } = defaultConfig
  const { slots: _itemSlots, ...restItem } = item
  return { ...rest, ...restItem }
}

const getItemSlots = (item: BubbleProps & { slots?: BubbleSlots }): BubbleSlots => {
  const defaultConfig = item.role ? props.roles?.[item.role] || {} : {}
  return { ...defaultConfig.slots, ...item.slots }
}

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
    <template v-for="(item, index) in props.items" :key="item.id || index">
      <Bubble v-if="!item.hidden" v-bind="getItemProps(item)">
        <template v-for="(slot, slotName) in getItemSlots(item)" #[slotName]="slotProps" :key="slotName">
          <component :is="slot" v-bind="slotProps" />
        </template>
      </Bubble>
    </template>
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
