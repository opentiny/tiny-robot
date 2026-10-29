<script setup lang="ts" generic="T">
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { onClickOutside } from '@vueuse/core'
import { nextTick, ref, watch } from 'vue'
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

const threshold = 4

watch(
  [trigger, menuRef, () => props.menuListGap],
  ([reference, floating], _, onCleanup) => {
    if (!reference || !floating) return

    let active = true
    const cleanup = autoUpdate(reference, floating, async () => {
      const { x, y } = await computePosition(reference, floating, {
        placement: 'bottom-start',
        strategy: 'fixed',
        middleware: [
          offset(props.menuListGap),
          flip({ fallbackPlacements: ['top-start'] }),
          shift({ padding: threshold }),
        ],
      })

      if (!active || trigger.value !== reference || menuRef.value !== floating) return

      Object.assign(floating.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })

    onCleanup(() => {
      active = false
      cleanup()
    })
  },
  { flush: 'post' },
)

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
  if (event.key === 'Tab') {
    trigger.value = null
    data.value = null
    return
  }

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
  <ul class="tr-history__menu-list" ref="menuRef" role="menu" @keydown="handleKeydown">
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
