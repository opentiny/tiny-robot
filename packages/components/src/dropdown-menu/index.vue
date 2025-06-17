<script setup lang="ts">
import { onClickOutside, useElementBounding } from '@vueuse/core'
import { computed, CSSProperties, ref, StyleValue, useAttrs, watch } from 'vue'
import { toCssUnit } from '../shared/utils'
import { DropdownMenuEmits, DropdownMenuItem, DropdownMenuProps, DropdownMenuSlots } from './index.type'

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  trigger: 'click',
  topOffset: 0,
  minWidth: 160,
})

const attrs = useAttrs()
const attrsStyle = computed(() => attrs.style as StyleValue)

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

onClickOutside(
  dropdownMenuRef,
  (ev) => {
    emit('click-outside', ev as MouseEvent)
    show.value = false
  },
  { ignore: [dropDownTriggerRef] },
)

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
    @pointerup="handleToggleShow"
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
