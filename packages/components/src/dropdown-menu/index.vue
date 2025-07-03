<script setup lang="ts">
import { onClickOutside, unrefElement, useElementHover } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import TrBasePopper from '../base-popper'
import { DropdownMenuEmits, DropdownMenuItem, DropdownMenuProps } from './index.type'

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  trigger: 'click',
})

const emit = defineEmits<DropdownMenuEmits>()

const showRef = ref(false)

// 如果 trigger 是 manual，则 show 由外部控制，此时组件内部无法修改 show 的值
const show = computed({
  get: () => {
    if (props.trigger === 'manual') {
      return props.show
    }
    return showRef.value
  },
  set: (newValue) => {
    if (props.trigger === 'manual') {
      return
    }
    showRef.value = newValue
  },
})

const basePopperRef = ref<InstanceType<typeof TrBasePopper> | null>(null)
const triggerRef = computed(() => basePopperRef.value?.triggerRef)
const dropdownMenuRef = computed(() => basePopperRef.value?.popperRef)

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
  // TODO 使用 @floating-ui/dom 提供的 safePolygon() 工具。实现鼠标从触发元素（trigger）移动到弹出框时，即使中间有空隙，也不会马上关闭
  const isTriggerHovered = useElementHover(
    computed(() => unrefElement(triggerRef.value)),
    { delayEnter: 100, delayLeave: 300 },
  )
  const isDropdownMenuHovered = useElementHover(dropdownMenuRef, { delayEnter: 100, delayLeave: 300 })

  watch(
    () => [isTriggerHovered.value, isDropdownMenuHovered.value],
    ([isTriggerHovered, isDropdownMenuHovered]) => {
      show.value = isTriggerHovered || isDropdownMenuHovered
    },
  )
}

const handleTriggerClick = () => {
  if (props.trigger === 'click') {
    show.value = !show.value
  }
}

const handleItemClick = (item: DropdownMenuItem) => {
  show.value = false
  emit('item-click', item)
}
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
    :trigger-events="{ onClick: handleTriggerClick }"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>
    <template #content>
      <ul class="tr-dropdown-menu__list">
        <li
          class="tr-dropdown-menu__list-item"
          v-for="item in props.items"
          :key="item.id"
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
  --tr-dropdown-menu-bg-color: #ffffff;
  --tr-dropdown-menu-box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
  --tr-dropdown-menu-min-width: 130px;
  --tr-dropdown-menu-item-color: rgb(25, 25, 25);
  --tr-dropdown-menu-item-hover-bg-color: #f5f5f5;
  --tr-dropdown-menu-item-font-weight: normal;
}

.tr-dropdown-menu {
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
  scrollbar-color: #dbdbdb transparent;

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
