<script setup lang="ts">
import { onClickOutside, useElementBounding } from '@vueuse/core'
import { computed, CSSProperties, ref, StyleValue, useAttrs, watch } from 'vue'
import { toCssUnit } from '../shared/utils'
import { DropdownMenuEmits, DropdownMenuItem, DropdownMenuProps, DropdownMenuSlots } from './index.type'

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  topOffset: 0,
  minWidth: 160,
})

const attrs = useAttrs()
const attrsStyle = computed(() => attrs.style as StyleValue)

const show = ref(false)

defineSlots<DropdownMenuSlots>()

const emit = defineEmits<DropdownMenuEmits>()

const dropDownTriggerRef = ref<HTMLDivElement | null>(null)
const dropdownMenuRef = ref<HTMLDivElement | null>(null)

const { x, y, update } = useElementBounding(dropDownTriggerRef)
const { width: menuWidth, height: menuHeight } = useElementBounding(dropdownMenuRef)

const dropdownStyles = computed<CSSProperties>(() => {
  return {
    left: `min(${toCssUnit(x.value)}, 100% - ${toCssUnit(menuWidth.value)})`,
    top: `max(${toCssUnit(y.value)} - ${toCssUnit(menuHeight.value)} + ${toCssUnit(props.topOffset)} - 8px, 0px)`,
  }
})

onClickOutside(dropdownMenuRef, (ev) => {
  // 如果在外部点到了 trigger，则停止冒泡，防止 triger 被点击然后触发菜单再次开启
  if (dropDownTriggerRef.value?.contains(ev.target as Node)) {
    ev.stopPropagation()
  }
  show.value = false
})

watch(show, (value) => {
  if (value) {
    update()
  }
})

const handleToggleShow = () => {
  show.value = !show.value
}

const handleItemClick = (item: DropdownMenuItem) => {
  show.value = false
  emit('item-click', item)
}
</script>

<template>
  <div
    class="tr-dropdown-menu__wrapper"
    :class="attrs.class"
    :style="attrsStyle"
    ref="dropDownTriggerRef"
    @click="handleToggleShow"
  >
    <slot />
  </div>

  <Transition name="tr-dropdown-menu">
    <div v-if="show" class="tr-dropdown-menu" :style="dropdownStyles" ref="dropdownMenuRef">
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
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.tr-dropdown-menu__wrapper {
  display: inline-block;
}

.tr-dropdown-menu {
  position: fixed;
  min-width: v-bind('toCssUnit(props.minWidth)');
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

  .tr-dropdown-menu__list {
    flex: 1;
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
}
</style>
