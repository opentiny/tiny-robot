<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import TrBasePopper from '../base-popper'
import { usePopperHover } from './composables/usePopperHover'
import { DropdownMenuEmits, DropdownMenuItem, DropdownMenuProps } from './index.type'

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  trigger: 'click',
})

const emit = defineEmits<DropdownMenuEmits>()

const showModel = defineModel<boolean>('show', { default: false })

// 如果 trigger 是 manual，则 show 由外部控制，此时组件内部无法修改 show 的值
const show = computed({
  get: () => {
    if (props.trigger === 'manual') {
      return props.show
    }
    return showModel.value
  },
  set: (newValue) => {
    if (props.trigger === 'manual') {
      return
    }
    showModel.value = newValue
  },
})

const basePopperRef = ref<InstanceType<typeof TrBasePopper> | null>(null)
const triggerRef = computed(() => basePopperRef.value?.triggerRef)
const dropdownMenuRef = computed(() => basePopperRef.value?.popperRef)

watchEffect(() => {
  const trigger = triggerRef.value
  if (!trigger) return

  trigger.setAttribute('aria-haspopup', 'menu')
  trigger.setAttribute('aria-expanded', String(Boolean(show.value)))
})

if (props.trigger === 'click' || props.trigger === 'manual') {
  onClickOutside(
    dropdownMenuRef,
    (ev) => {
      emit('click-outside', ev as MouseEvent)
      show.value = false
    },
    { ignore: [triggerRef] },
  )
} else if (props.trigger === 'hover') {
  const isHovering = usePopperHover(triggerRef, dropdownMenuRef, { delayEnter: 100, delayLeave: 100 })

  watch(isHovering, (isHovering) => {
    show.value = isHovering
  })
}

const handleTriggerClick = () => {
  if (props.trigger === 'click') {
    show.value = !show.value
  }
}

const focusTrigger = async () => {
  await nextTick()
  triggerRef.value?.focus()
}

const getMenuItems = () => {
  return Array.from(dropdownMenuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') || [])
}

const focusMenuItem = async (position: 'first' | 'last') => {
  await nextTick()
  const items = getMenuItems()
  items[position === 'first' ? 0 : items.length - 1]?.focus()
}

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (props.trigger === 'manual' && !show.value) return

    event.preventDefault()
    if (props.trigger !== 'manual') show.value = true
    focusMenuItem(event.key === 'ArrowDown' ? 'first' : 'last')
  } else if ((event.key === 'Enter' || event.key === ' ') && props.trigger !== 'manual') {
    event.preventDefault()
    show.value = true
    focusMenuItem('first')
  } else if (event.key === 'Escape' && show.value) {
    event.preventDefault()
    show.value = false
  }
}

const handleMenuKeydown = (event: KeyboardEvent) => {
  const items = getMenuItems()
  const currentIndex = items.indexOf(document.activeElement as HTMLElement)

  if (event.key === 'Tab') {
    if (props.trigger !== 'manual') show.value = false
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    show.value = false
    focusTrigger()
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

const handleItemClick = (item: DropdownMenuItem) => {
  show.value = false
  emit('item-click', item)
  focusTrigger()
}

defineExpose({
  update: () => {
    basePopperRef.value?.update()
  },
})
</script>

<template>
  <TrBasePopper
    :show="show"
    class="tr-dropdown-menu"
    ref="basePopperRef"
    placement="top-left"
    :append-to="props.appendTo"
    :offset="8"
    :transition-props="{ name: 'tr-dropdown-menu' }"
    :prevent-overflow="true"
    :trigger-events="{ onClick: handleTriggerClick, onKeydown: handleTriggerKeydown }"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>
    <template #content>
      <ul class="tr-dropdown-menu__list" role="menu" @keydown="handleMenuKeydown">
        <li
          class="tr-dropdown-menu__list-item"
          v-for="item in props.items"
          :key="item.id"
          role="menuitem"
          tabindex="-1"
          @click="handleItemClick(item)"
        >
          {{ item.text }}
        </li>
      </ul>
    </template>
  </TrBasePopper>
</template>

<style lang="less">
:root {
  --tr-dropdown-menu-min-width: 130px;
  --tr-dropdown-menu-item-font-weight: normal;

  --tr-dropdown-menu-min-top: 0px;
  --tr-dropdown-menu-max-bottom: 100%;
  --tr-dropdown-menu-min-left: 0px;
  --tr-dropdown-menu-max-right: 100%;
}

.tr-dropdown-menu {
  --tr-base-popper-min-top: var(--tr-dropdown-menu-min-top);
  --tr-base-popper-max-bottom: var(--tr-dropdown-menu-max-bottom);
  --tr-base-popper-min-left: var(--tr-dropdown-menu-min-left);
  --tr-base-popper-max-right: var(--tr-dropdown-menu-max-right);

  z-index: var(--tr-z-index-dropdown);
  min-width: var(--tr-dropdown-menu-min-width);
  padding: 8px;
  border-radius: 12px;
  background-color: var(--tr-dropdown-menu-bg-color);
  box-shadow: var(--tr-dropdown-menu-box-shadow);

  &-enter-active,
  &-leave-active {
    transition-property: opacity;
    transition-duration: 0.3s;
    transition-timing-function: ease;
    pointer-events: none;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-to,
  &-leave-from {
    opacity: 1;
  }
}
</style>

<style lang="less" scoped>
.tr-dropdown-menu__list {
  padding: 0;
  margin: 0;
  list-style: none;
  scrollbar-width: thin;
  scrollbar-color: var(--tr-dropdown-menu-scrollbar-thumb-color) transparent;

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--tr-dropdown-menu-scrollbar-thumb-color);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  .tr-dropdown-menu__list-item {
    color: var(--tr-dropdown-menu-item-color);
    font-size: 14px;
    line-height: 24px;
    font-weight: var(--tr-dropdown-menu-item-font-weight);
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--tr-dropdown-menu-item-hover-bg-color);
    }
  }
}
</style>
