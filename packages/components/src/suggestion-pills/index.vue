<script setup lang="ts">
import { IconArrowDown, IconArrowUp } from '@opentiny/tiny-robot-svgs'
import { useElementSize, useScroll, watchDebounced } from '@vueuse/core'
import { computed, CSSProperties, onBeforeUnmount, ref, watch } from 'vue'
import DropdownMenu from '../dropdown-menu'
import SuggestionPopover from '../suggestion-popover'
import { PillButton } from './components'
import { SuggestionPillsEmits, SuggestionPillsProps, SuggestionPillsSlots } from './index.type'

const props = defineProps<SuggestionPillsProps>()

const emit = defineEmits<SuggestionPillsEmits>()

defineSlots<SuggestionPillsSlots>()

const containerRef = ref<HTMLDivElement | null>(null)

const { width, height } = useElementSize(containerRef)
const { arrivedState } = useScroll(containerRef)

const initialHeight = ref(0)
const showMoreBtn = ref(false)
const isShowingMore = defineModel<SuggestionPillsProps['showMore']>('showMore', { default: false })

watch(height, () => {
  if (initialHeight.value === 0 && height.value > 0) {
    initialHeight.value = height.value
  }
})

const maskImage = computed(() => {
  if (arrivedState.left) {
    return 'linear-gradient(to right, black 90%, transparent)'
  }

  if (arrivedState.right) {
    return 'linear-gradient(to left, black 90%, transparent)'
  }

  return 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
})

const containerStyles = computed<CSSProperties>(() => {
  if (showMoreBtn.value && isShowingMore.value) {
    return {
      position: 'absolute',
      flexWrap: 'wrap-reverse',
    }
  }
  return {
    position: 'relative',
    flexWrap: 'nowrap',
  }
})

const listeners: (() => void)[] = []

const removeAllListeners = () => {
  listeners.forEach((removeListener) => removeListener())
  listeners.length = 0
}

watchDebounced(
  width,
  (value) => {
    if (value === 0) {
      return
    }

    const container = containerRef.value!
    const containerRight = container.scrollLeft + container.clientWidth
    const children = Array.from(container.children) as HTMLElement[]

    removeAllListeners()

    let hasHiddenChildren = false

    children.forEach((child) => {
      const childRight = child.offsetLeft + child.offsetWidth

      const isHidden = childRight > containerRight
      if (isHidden) {
        hasHiddenChildren = true
        child.addEventListener('click', onHiddenChildClick, { capture: true })
        listeners.push(() => {
          child.removeEventListener('click', onHiddenChildClick)
        })
      }
    })

    showMoreBtn.value = hasHiddenChildren
  },
  { debounce: 100 },
)

const onHiddenChildClick = (event: Event) => {
  if (!isShowingMore.value) {
    event.stopPropagation()
    toggleIsShowingMore()
  }
}

const toggleIsShowingMore = () => {
  isShowingMore.value = !isShowingMore.value
}

onBeforeUnmount(() => {
  removeAllListeners()
})
</script>

<template>
  <div class="tr-suggestion-pills__wrapper">
    <div class="tr-suggestion-pills__container" ref="containerRef" :style="containerStyles">
      <slot>
        <template v-for="item in props.items" :key="item.id">
          <SuggestionPopover
            v-if="item.action?.type === 'popover'"
            v-bind="item.action.props"
            @item-click="item.action.events?.itemClick"
            @group-click="item.action.events?.groupClick"
            @close="item.action.events?.close"
          >
            <PillButton :item="item" @click="emit('item-click', item)"></PillButton>
            <template v-for="(slotVNode, slotName) in item.action.slots" :key="slotName" #[slotName]>
              <component :is="slotVNode" />
            </template>
          </SuggestionPopover>
          <DropdownMenu
            v-else-if="item.action?.type === 'menu'"
            v-bind="item.action.props"
            @item-click="item.action.events?.itemClick"
          >
            <PillButton :item="item" @click="emit('item-click', item)"></PillButton>
          </DropdownMenu>
          <PillButton v-else :item="item" @click="emit('item-click', item)"></PillButton>
        </template>
      </slot>
    </div>
    <button v-if="showMoreBtn" class="tr-suggestion-pills__expand" @click="toggleIsShowingMore">
      <IconArrowUp v-if="!isShowingMore" />
      <IconArrowDown v-else />
    </button>
  </div>
</template>

<style lang="less" scoped>
.tr-suggestion-pills__wrapper {
  position: relative;
  width: calc(100% - 6px);
  height: v-bind('initialHeight + "px"');
}

.tr-suggestion-pills__container {
  display: flex;
  gap: 8px;
  overflow-x: hidden;
  left: 0;
  bottom: 0;

  mask-image: v-bind('maskImage');
  mask-repeat: no-repeat;

  & > * {
    flex-shrink: 0;
  }
}

.tr-suggestion-pills__expand {
  position: absolute;
  top: 6px;
  right: 0;
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
}
</style>
