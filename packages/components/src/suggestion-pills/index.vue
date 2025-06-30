<script setup lang="ts">
import { IconArrowUp } from '@opentiny/tiny-robot-svgs'
import { onClickOutside, useElementSize, watchDebounced } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import { PillButtonWrapper } from './components'
import { SuggestionPillItem, SuggestionPillsEmits, SuggestionPillsProps, SuggestionPillsSlots } from './index.type'

const props = withDefaults(defineProps<SuggestionPillsProps>(), {
  showAllButtonOn: 'hover',
  overflowMode: 'expand',
})

const emit = defineEmits<SuggestionPillsEmits>()

defineSlots<SuggestionPillsSlots>()

const showAll = defineModel<SuggestionPillsProps['showAll']>('showAll', { default: false })

const containerWrapperRef = ref<HTMLDivElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const floatingItemsRef = ref<HTMLDivElement | null>(null)

const { width } = useElementSize(containerRef)
const containerFullWidth = ref(0)
const hasShowMoreBtn = computed(() => props.overflowMode === 'expand' && width.value < containerFullWidth.value)
const hiddenIndex = ref(-1)

const staticItems = computed(() => {
  if (hasShowMoreBtn.value && showAll.value) {
    return props.items?.slice(0, hiddenIndex.value) || []
  }
  return props.items || []
})
const floatingItems = computed(() => {
  if (hasShowMoreBtn.value && showAll.value) {
    return props.items?.slice(hiddenIndex.value) || []
  }
  return []
})

const getAllItemElements = () => {
  const container = containerRef.value
  const floatingItems = floatingItemsRef.value
  return Array.from(container?.children || []).concat(Array.from(floatingItems?.children || [])) as HTMLElement[]
}

const updateHiddenIndex = () => {
  nextTick(() => {
    const container = containerRef.value

    if (!container) {
      return
    }

    const children = getAllItemElements()
    const gap = parseFloat(getComputedStyle(container).rowGap) || 0

    let totalWidth = 0
    for (let i = 0; i < children.length; i++) {
      totalWidth += children[i].offsetWidth
      if (i > 0) {
        totalWidth += gap
      }
      if (totalWidth > container.clientWidth) {
        hiddenIndex.value = i
        break
      }
      if (i === children.length - 1) {
        hiddenIndex.value = -1
      }
    }
  })
}

watch(
  () => [props.items, props.items?.length],
  () => {
    nextTick(() => {
      if (!containerRef.value) {
        return
      }

      // 计算容器最大宽度
      const children = getAllItemElements()
      const gap = parseFloat(getComputedStyle(containerRef.value).rowGap) || 0
      containerFullWidth.value = children.map((el) => el.offsetWidth).reduce((acc, cur) => acc + cur + gap)
    })
  },
  { immediate: true },
)

watch(() => [props.items, props.items?.length], updateHiddenIndex)

watchDebounced(
  width,
  (w) => {
    if (w > 0) {
      updateHiddenIndex()
    }
  },
  { debounce: 100 },
)

const handleClick = (ev: MouseEvent, item: SuggestionPillItem, index: number) => {
  if (hasShowMoreBtn.value && index >= hiddenIndex.value) {
    ev.stopPropagation()
    toggleIsShowingMore()
    return
  }
  emit('item-click', item)
}

const toggleIsShowingMore = () => {
  showAll.value = !showAll.value
}

onClickOutside(containerWrapperRef, (event) => {
  if (showAll.value) {
    emit('click-outside', event)
  }
})

const scrollIntoViewIfPartiallyHidden = (item: HTMLElement) => {
  const container = containerRef.value
  if (!container) {
    return
  }

  const offsetLeft = item.offsetLeft
  const offsetRight = offsetLeft + item.offsetWidth

  const scrollLeft = container.scrollLeft
  const containerWidth = container.clientWidth

  const isLeftHidden = offsetLeft < scrollLeft
  const isRightHidden = offsetRight > scrollLeft + containerWidth

  if (isLeftHidden) {
    container.scrollTo({
      left: offsetLeft,
      behavior: 'smooth',
    })
  } else if (isRightHidden) {
    container.scrollTo({
      left: offsetRight - containerWidth,
      behavior: 'smooth',
    })
  }
}

const handleMouseenter = (ev: MouseEvent) => {
  if (props.autoScrollOnHover && ev.currentTarget) {
    scrollIntoViewIfPartiallyHidden(ev.currentTarget as HTMLElement)
  }
}
</script>

<template>
  <div class="tr-suggestion-pills__wrapper" ref="containerWrapperRef">
    <div
      class="tr-suggestion-pills__container"
      :class="{ 'overflow-scroll': props.overflowMode === 'scroll' }"
      ref="containerRef"
    >
      <slot>
        <template v-for="(item, index) in staticItems" :key="item.id">
          <PillButtonWrapper
            :item="item"
            @click="handleClick($event, item, index)"
            @mouseenter="handleMouseenter($event)"
          ></PillButtonWrapper>
        </template>
      </slot>
    </div>
    <div class="tr-suggestion-pills__more-wrapper">
      <Transition name="tr-suggestion-pills__more">
        <div v-if="floatingItems.length" class="tr-suggestion-pills__more" ref="floatingItemsRef">
          <template v-for="item in floatingItems" :key="item.id">
            <PillButtonWrapper :item="item" @click="emit('item-click', item)"></PillButtonWrapper>
          </template>
        </div>
      </Transition>
    </div>
    <button
      v-if="hasShowMoreBtn"
      class="tr-suggestion-pills__expand"
      :class="{ 'show-on-hover': props.showAllButtonOn === 'hover' }"
      @click="toggleIsShowingMore"
    >
      <IconArrowUp class="tr-suggestion-pills__expand-icon" :class="{ rotate: showAll }" />
    </button>
  </div>
</template>

<style lang="less" scoped>
.tr-suggestion-pills__wrapper {
  position: relative;
}

.tr-suggestion-pills__wrapper:hover {
  .tr-suggestion-pills__expand.show-on-hover {
    opacity: 1;
  }
}

.tr-suggestion-pills__container {
  position: relative;
  display: flex;
  gap: 8px;
  overflow-x: hidden;

  & > * {
    flex-shrink: 0;
  }

  &.overflow-scroll {
    overflow-x: auto;
    scroll-behavior: smooth;
  }
}

.tr-suggestion-pills__more-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 8px);
  overflow: hidden;

  .tr-suggestion-pills__more {
    display: flex;
    gap: 8px;
    flex-wrap: wrap-reverse;

    &-enter-active,
    &-leave-active {
      transition: transform 0.3s ease;
      transition-property: transform, opacity;
    }

    &-enter-from,
    &-leave-to {
      opacity: 0;
      transform: translateY(100%);
    }

    &-enter-to,
    &-leave-from {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.tr-suggestion-pills__expand {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  padding: 3px;
  background-color: white;
  border-radius: 999px;
  display: flex;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(235, 235, 235);
  }

  &.show-on-hover {
    opacity: 0;
  }

  .tr-suggestion-pills__expand-icon {
    &.rotate {
      transform: rotate(180deg);
    }
  }
}
</style>
