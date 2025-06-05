<script setup lang="ts">
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { onClickOutside, useElementSize } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import { FlowLayoutEmits, FlowLayoutProps } from './index.type'

const props = withDefaults(defineProps<FlowLayoutProps>(), {
  linesLimit: Number.MAX_SAFE_INTEGER,
  moreIcon: IconArrowDown,
  showMoreTrigger: 'click',
})

const selected = defineModel<FlowLayoutProps['selected']>('selected')

watch(
  () => props.items,
  (newItems) => {
    if (!newItems.find((item) => item.id === selected.value) && newItems.length) {
      selected.value = newItems[0].id
    }
  },
  { immediate: true },
)

const emit = defineEmits<FlowLayoutEmits>()

const containerRef = ref<HTMLDivElement | null>(null)
const moreButtonRef = ref<HTMLButtonElement | null>(null)
const dropDownRef = ref<HTMLDivElement | null>(null)

const itemRefs = ref<(HTMLElement | null)[]>([])
const moreButtonIndex = ref<number | null>(null)
// 先让 moreButton 渲染，能拿到宽度
const hideMoreButton = ref(false)
const showMore = ref(false)

const setItemRef = (el: HTMLElement | null, idx: number) => {
  if (el) itemRefs.value[idx] = el
}

const updateMoreIndex = () => {
  moreButtonIndex.value = null
  hideMoreButton.value = false

  nextTick(() => {
    const container = containerRef.value
    const moreButton = moreButtonRef.value

    if (!container || !moreButton) {
      return
    }

    const tops = itemRefs.value
      .slice(0, props.items.length)
      .filter((el) => Boolean(el))
      .map((el) => el!.offsetTop)
    const uniqueTops = Array.from(new Set(tops))

    if (uniqueTops.length > props.linesLimit) {
      const lastLineTop = uniqueTops[props.linesLimit - 1]
      const lastIndex = tops.lastIndexOf(lastLineTop)
      const lastItem = itemRefs.value[lastIndex]!
      const spaceLeft = container.clientWidth - lastItem.offsetLeft - lastItem.offsetWidth - 8

      if (spaceLeft < moreButton.offsetWidth) {
        moreButtonIndex.value = lastIndex
      } else {
        moreButtonIndex.value = lastIndex + 1
      }

      hideMoreButton.value = false
    } else {
      moreButtonIndex.value = null
      hideMoreButton.value = true
    }
  })
}

watch(() => props.items, updateMoreIndex)

const { width } = useElementSize(containerRef)
watch(width, (w) => {
  if (w > 0) {
    updateMoreIndex()
  }
})

const leftItems = computed(() => (moreButtonIndex.value !== null ? props.items.slice(moreButtonIndex.value) : []))

const moreButtonSelected = computed(() => {
  if (moreButtonIndex.value === null) {
    return false
  }
  const selectedIndex = props.items.findIndex((item) => item.id === selected.value)
  return selectedIndex >= moreButtonIndex.value
})

const handleClick = (id: string) => {
  selected.value = id
  showMore.value = false
  emit('item-click', id)
}

const handleClickMore = () => {
  if (props.showMoreTrigger === 'click') {
    showMore.value = !showMore.value
  }
}

const handleHoverMore = (val: boolean) => {
  if (props.showMoreTrigger === 'hover') {
    showMore.value = val
  }
}

onClickOutside(dropDownRef, (ev) => {
  if (dropDownRef.value?.contains(ev.target as Node)) {
    return
  }

  if (moreButtonRef.value?.contains(ev.target as Node)) {
    return
  }

  showMore.value = false
})
</script>

<template>
  <div class="tr-flow-layout" ref="containerRef">
    <template v-for="(item, index) in props.items" :key="item.id">
      <button
        :class="['tr-flow-layout__item', { 'icon-only': !item.label }, { selected: item.id === selected }]"
        v-if="moreButtonIndex === null || index < moreButtonIndex"
        :ref="(el) => setItemRef(el as HTMLElement, index)"
        @click="handleClick(item.id)"
      >
        <component :is="item.icon" class="tr-flow-layout__item-icon" />
        <span class="tr-flow-layout__item-label" v-if="item.label">{{ item.label }}</span>
      </button>
    </template>
    <div class="tr-flow-layout__dropdown-wrapper">
      <button
        :class="['tr-flow-layout__item', 'icon-only', { selected: moreButtonSelected }]"
        v-if="!hideMoreButton"
        ref="moreButtonRef"
        @click="handleClickMore"
        @mouseenter="handleHoverMore(true)"
        @mouseleave="handleHoverMore(false)"
      >
        <component :is="props.moreIcon" class="tr-flow-layout__item-icon" />
      </button>
      <div
        class="tr-flow-layout__dropdown-container"
        @mouseenter="handleHoverMore(true)"
        @mouseleave="handleHoverMore(false)"
      >
        <div class="tr-flow-layout__dropdown" v-if="showMore" ref="dropDownRef">
          <button
            :class="['tr-flow-layout__dropdown_item', { selected: item.id === selected }]"
            v-for="item in leftItems"
            :key="item.id"
            @click="handleClick(item.id)"
          >
            <component :is="item.icon" class="tr-flow-layout__item-icon" />
            <span class="tr-flow-layout__item-label">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-flow-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;

  .tr-flow-layout__item {
    padding: 5px 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    border: 1px solid transparent;
    transition: background-color 0.3s ease;

    &.icon-only {
      padding: 9px;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    &.selected {
      background-color: white;
      border-color: black;
    }
  }

  .tr-flow-layout__item-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .tr-flow-layout__item-label {
    font-size: 14px;
    line-height: 24px;
    white-space: nowrap;
  }

  .tr-flow-layout__dropdown-wrapper {
    position: relative;

    .tr-flow-layout__dropdown-container {
      background: transparent;
      position: absolute;
      top: 100%;
      right: 0;
      padding-top: 8px;
      min-width: 150px;
      z-index: var(--tr-z-index-dropdown);
    }

    .tr-flow-layout__dropdown {
      background: white;
      padding: 4px;
      border-radius: 12px;
      box-shadow: 0 0 16px rgba(0, 0, 0, 0.08);

      .tr-flow-layout__dropdown_item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 11px;
        width: 100%;
        border-radius: 8px;
        transition: background-color 0.3s ease;
        border: 1px solid transparent;

        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }

        &.selected {
          background-color: white;
          border-color: black;
        }

        & + .tr-flow-layout__dropdown_item {
          margin-top: 4px;
        }
      }
    }
  }
}
</style>
