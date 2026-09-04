<script setup lang="ts" generic="T">
import { onClickOutside, useElementBounding, useElementSize, useWindowSize } from '@vueuse/core'
import { computed, CSSProperties, nextTick, ref } from 'vue'
import { toCssUnit } from '../../shared/utils'
import { HistoryMenuItem } from '../index.type'

const trigger = defineModel<HTMLButtonElement | null>('trigger', { default: null })
const data = defineModel<T | null>('data', { default: null })

const props = withDefaults(
  defineProps<{
    items: HistoryMenuItem[]
    menuListGap?: number
  }>(),
  {
    menuListGap: 8,
  },
)

const emit = defineEmits<{
  'item-click': [item: HistoryMenuItem]
}>()

const menuRef = ref<HTMLUListElement | null>(null)

onClickOutside(
  menuRef,
  () => {
    trigger.value = null
    data.value = null
  },
  {
    ignore: [trigger],
  },
)

const { top, bottom, left } = useElementBounding(trigger)
const { width: menuListWidth, height: menuListHeight } = useElementSize(menuRef, undefined, { box: 'border-box' })
const { height: viewportHeight } = useWindowSize()

const threshold = 4

const styles = computed(() => {
  const styles: CSSProperties = {
    left: `min(${toCssUnit(left.value)}, calc(100% - ${toCssUnit(menuListWidth.value + threshold)}))`,
  }

  const topValue = bottom.value + props.menuListGap
  if (topValue + menuListHeight.value + threshold > viewportHeight.value) {
    styles.bottom = `calc(100% - ${toCssUnit(top.value - props.menuListGap)})`
  } else {
    styles.top = toCssUnit(topValue)
  }

  return styles
})

const handleItemClick = (item: { id: string; text: string }) => {
  emit('item-click', item)
  trigger.value = null
  data.value = null
}

const getMenuItems = () => Array.from(menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') || [])

const focusFirstItem = () => getMenuItems()[0]?.focus()
const focusLastItem = () => getMenuItems().at(-1)?.focus()

const closeAndFocusTrigger = () => {
  const triggerElement = trigger.value
  trigger.value = null
  data.value = null
  nextTick(() => triggerElement?.focus())
}

const handleKeydown = (event: KeyboardEvent) => {
  const items = getMenuItems()
  const currentIndex = items.indexOf(document.activeElement as HTMLElement)

  if (event.key === 'Escape') {
    event.preventDefault()
    closeAndFocusTrigger()
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    items[currentIndex]?.click()
    return
  }

  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || items.length === 0) return

  event.preventDefault()
  let nextIndex = currentIndex
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = items.length - 1
  if (event.key === 'ArrowDown') nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
  if (event.key === 'ArrowUp') nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
  items[nextIndex]?.focus()
}

defineExpose({ focusFirstItem, focusLastItem })
</script>

<template>
  <ul class="tr-history__menu-list" ref="menuRef" :style="styles" role="menu" @keydown="handleKeydown">
    <li
      class="tr-history__menu-list__item"
      v-for="item in props.items"
      :key="item.id"
      role="menuitem"
      tabindex="-1"
      @click="handleItemClick(item)"
    >
      <component :is="item.icon" />
      <span>{{ item.text }}</span>
    </li>
  </ul>
</template>

<style lang="less" scoped>
.tr-history__menu-list {
  position: fixed;
  z-index: var(--tr-z-index-dropdown);
  list-style: none;
  padding: 8px 0;
  margin: 0;
  border-radius: 8px;
  background: var(--tr-history-menu-list-bg);
  box-shadow: var(--tr-history-menu-list-box-shadow);

  .tr-history__menu-list__item {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--tr-history-menu-item-color);
    white-space: nowrap;

    & > svg {
      font-size: 16px;
    }

    & > span {
      font-size: 12px;
      line-height: 18px;
    }

    &:hover {
      background: var(--tr-history-menu-list-bg-hover);

      & > span {
        color: var(--tr-history-menu-item-text-color-hover);
      }
    }
  }
}
</style>
