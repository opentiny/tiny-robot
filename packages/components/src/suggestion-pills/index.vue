<script setup lang="ts">
import { IconArrowDown, IconArrowUp } from '@opentiny/tiny-robot-svgs'
import { useElementSize, watchDebounced } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import { PillButtonWrapper } from './components'
import { SuggestionPillItem, SuggestionPillsEmits, SuggestionPillsProps, SuggestionPillsSlots } from './index.type'

const props = defineProps<SuggestionPillsProps>()

const emit = defineEmits<SuggestionPillsEmits>()

defineSlots<SuggestionPillsSlots>()

const containerRef = ref<HTMLDivElement | null>(null)

const { width } = useElementSize(containerRef)

const hiddenIndex = ref(-1)
const hasShowMoreBtn = computed(() => hiddenIndex.value !== -1)
const showAll = defineModel<SuggestionPillsProps['showAll']>('showAll', { default: false })
const staticItems = computed(() => {
  if (!hasShowMoreBtn.value || !showAll.value) {
    return props.items || []
  }
  return (props.items || []).slice(0, hiddenIndex.value)
})
const floatingItems = computed(() => {
  if (!hasShowMoreBtn.value || !showAll.value) {
    return []
  }
  return (props.items || []).slice(hiddenIndex.value)
})

const updateHiddenIndex = () => {
  nextTick(() => {
    const container = containerRef.value

    if (!container) {
      return
    }

    const children = Array.from(container.children) as HTMLElement[]
    hiddenIndex.value = children.findIndex((el) => el.offsetLeft + el.offsetWidth > container.clientWidth)
  })
}

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

const handleClick = (item: SuggestionPillItem, index: number) => {
  if (hasShowMoreBtn.value && index >= hiddenIndex.value) {
    toggleIsShowingMore()
    return
  }
  emit('item-click', item)
}

const toggleIsShowingMore = () => {
  showAll.value = !showAll.value
}
</script>

<template>
  <div class="tr-suggestion-pills__wrapper">
    <div class="tr-suggestion-pills__container" ref="containerRef">
      <slot>
        <template v-for="(item, index) in staticItems" :key="item.id">
          <PillButtonWrapper :item="item" @click="handleClick(item, index)"></PillButtonWrapper>
        </template>
      </slot>
    </div>
    <div class="tr-suggestion-pills__more-wrapper">
      <Transition name="tr-suggestion-pills__more">
        <div v-if="floatingItems.length" class="tr-suggestion-pills__more">
          <template v-for="item in floatingItems" :key="item.id">
            <PillButtonWrapper :item="item" @click="emit('item-click', item)"></PillButtonWrapper>
          </template>
        </div>
      </Transition>
    </div>
    <button v-if="hasShowMoreBtn" class="tr-suggestion-pills__expand" @click="toggleIsShowingMore">
      <IconArrowUp v-if="!showAll" />
      <IconArrowDown v-else />
    </button>
  </div>
</template>

<style lang="less" scoped>
.tr-suggestion-pills__wrapper {
  position: relative;
}

.tr-suggestion-pills__container {
  position: relative;
  display: flex;
  gap: 8px;
  overflow-x: hidden;

  & > * {
    flex-shrink: 0;
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
}
</style>
