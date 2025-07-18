<script setup lang="ts">
import { IconArrowUp } from '@opentiny/tiny-robot-svgs'
import {
  MaybeElement,
  onClickOutside,
  unrefElement,
  useElementSize,
  useEventListener,
  watchDebounced,
} from '@vueuse/core'
import { computed, isVNode, nextTick, ref, watch } from 'vue'
import { useSlotRefs } from '../shared/composables'
import { SuggestionPillsEmits, SuggestionPillsProps, SuggestionPillsSlots } from './index.type'

const props = withDefaults(defineProps<SuggestionPillsProps>(), {
  showAllButtonOn: 'hover',
  overflowMode: 'expand',
})

const slots = defineSlots<SuggestionPillsSlots>()
const emit = defineEmits<SuggestionPillsEmits>()

const { vnodes: itemVnodes } = useSlotRefs(slots.default, true)

const showAll = defineModel<SuggestionPillsProps['showAll']>('showAll', { default: false })

const containerWrapperRef = ref<HTMLDivElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const floatingItemsRef = ref<HTMLDivElement | null>(null)

const { width } = useElementSize(containerRef)
const containerFullWidth = ref(0)

const hasShowMoreBtn = computed(() => props.overflowMode === 'expand' && width.value < containerFullWidth.value)
const hiddenIndex = ref(-1)

const staticVnodes = computed(() => {
  if (hasShowMoreBtn.value && showAll.value) {
    return itemVnodes.value.slice(0, hiddenIndex.value)
  }
  return itemVnodes.value
})

const floatingVnodesWithIndex = computed(() => {
  if (hasShowMoreBtn.value && showAll.value) {
    return itemVnodes.value.slice(hiddenIndex.value).map((vnode, index) => ({
      vnode,
      index: index + hiddenIndex.value,
    }))
  }
  return []
})

const staticMaybeItemRefs = ref<MaybeElement[]>([])
const floatingMaybeItemRefs = ref<MaybeElement[]>([])

const staticItemRefs = computed(() => {
  return staticMaybeItemRefs.value
    .map((el) => unrefElement(el))
    .filter((el): el is HTMLElement | SVGElement => el instanceof Element)
})

const floatingItemRefs = computed(() => {
  return floatingMaybeItemRefs.value
    .map((el) => unrefElement(el))
    .filter((el): el is HTMLElement | SVGElement => el instanceof Element)
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

    hiddenIndex.value = -1
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
    }
  })
}

watch(
  itemVnodes,
  () => {
    nextTick(() => {
      if (!containerRef.value) {
        return
      }
      // 计算容器最大宽度
      const children = getAllItemElements()
      const gap = parseFloat(getComputedStyle(containerRef.value).rowGap) || 0
      containerFullWidth.value = children.reduce((acc, cur, index) => acc + cur.offsetWidth + (index > 0 ? gap : 0), 0)
    })
  },
  { immediate: true },
)

watch(itemVnodes, updateHiddenIndex)

watchDebounced(width, updateHiddenIndex, { debounce: 100 })

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

let cleanup: (() => void) | null = null

watch(
  () => props.autoScrollOn,
  (value) => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }

    if (value) {
      cleanup = useEventListener(staticItemRefs, value, (ev) => {
        if (ev.currentTarget) {
          scrollIntoViewIfPartiallyHidden(ev.currentTarget as HTMLElement)
        }
      })
    }
  },
  {
    immediate: true,
  },
)

defineExpose({
  children: computed(() => staticItemRefs.value.concat(floatingItemRefs.value)),
})
</script>

<template>
  <div class="tr-suggestion-pills__wrapper" ref="containerWrapperRef">
    <div
      class="tr-suggestion-pills__container"
      :class="{ 'overflow-scroll': props.overflowMode === 'scroll' }"
      ref="containerRef"
    >
      <component
        v-for="(vnode, index) in staticVnodes"
        :key="isVNode(vnode) ? vnode.key : index"
        :is="vnode"
        ref="staticMaybeItemRefs"
      />
    </div>
    <div class="tr-suggestion-pills__more-wrapper">
      <Transition name="tr-suggestion-pills__more">
        <div v-if="floatingVnodesWithIndex.length" class="tr-suggestion-pills__more" ref="floatingItemsRef">
          <component
            v-for="{ vnode, index } in floatingVnodesWithIndex"
            :key="isVNode(vnode) ? vnode.key : index"
            :is="vnode"
            ref="floatingMaybeItemRefs"
          />
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

<style lang="less">
:root {
  --tr-suggestion-pills-expand-color: rgb(89, 89, 89);
  --tr-suggestion-pills-expand-bg-color: white;
  --tr-suggestion-pills-expand-hover-bg-color: rgb(235, 235, 235);
  --tr-suggestion-pills-expand-font-size: 14px;
  --tr-suggestion-pills-expand-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
</style>

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
  color: var(--tr-suggestion-pills-expand-color);
  background-color: var(--tr-suggestion-pills-expand-bg-color);
  border-radius: 999px;
  display: flex;
  font-size: var(--tr-suggestion-pills-expand-font-size);
  box-shadow: var(--tr-suggestion-pills-expand-box-shadow);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--tr-suggestion-pills-expand-hover-bg-color);
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
