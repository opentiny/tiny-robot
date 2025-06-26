<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, ref } from 'vue'
import TrBasePopper from '../base-popper'
import { toCssUnit } from '../shared/utils'
import { DropdownMenuEmits, DropdownMenuItem, DropdownMenuProps } from './index.type'

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  trigger: 'click',
  minWidth: 160,
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

onClickOutside(
  dropdownMenuRef,
  (ev) => {
    emit('click-outside', ev as MouseEvent)
    show.value = false
  },
  { ignore: [triggerRef] },
)

const toggleShow = () => {
  show.value = !show.value
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
    :style="{ minWidth: toCssUnit(props.minWidth) }"
    ref="basePopperRef"
    placement="top-left"
    :offset="8"
    :transition-props="{ name: 'tr-dropdown-menu' }"
    :prevent-overflow="true"
    :trigger-events="{ onPointerup: toggleShow }"
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
.tr-dropdown-menu {
  z-index: var(--tr-z-index-dropdown);
  padding: 8px;
  border-radius: 12px;
  color: rgb(25, 25, 25);
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);

  &-enter-active,
  &-leave-active {
    transition-property: opacity;
    transition-duration: 0.3s;
    transition-timing-function: ease;
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
    font-size: 14px;
    line-height: 24px;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    font-weight: 600;

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
