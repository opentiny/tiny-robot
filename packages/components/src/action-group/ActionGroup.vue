<script setup lang="ts">
import { IconMenu } from '@opentiny/tiny-robot-svgs'
import { TinyTooltip } from '@opentiny/vue'
import { onClickOutside, useWindowSize } from '@vueuse/core'
import { computed, nextTick, ref, VNode, watch } from 'vue'
import IconButton from '../icon-button'
import { ActionGroupEvents, ActionGroupProps, ActionGroupSlots } from './index.type'

const props = defineProps<ActionGroupProps>()

const slots = defineSlots<ActionGroupSlots>()

const emit = defineEmits<ActionGroupEvents>()

const children = computed(() => {
  const defaultSlot = slots.default()

  if (Array.isArray(defaultSlot)) {
    if (defaultSlot.length === 1 && defaultSlot[0].type?.toString() === 'Symbol(v-fgt)') {
      return defaultSlot[0].children as VNode[]
    }

    return defaultSlot
  }

  if (defaultSlot.type?.toString() === 'Symbol(v-fgt)') {
    return defaultSlot.children as VNode[]
  }

  return [defaultSlot]
})

const maxNum = computed(() => {
  const n = props.maxNum ?? Number.MAX_SAFE_INTEGER

  return n > 0 ? n : Number.MAX_SAFE_INTEGER
})

const showMore = computed(() => {
  return children.value.length > maxNum.value
})

const list = computed(() => {
  if (showMore.value) {
    return children.value.slice(0, maxNum.value)
  }

  return children.value
})

const moreList = computed(() => {
  if (showMore.value) {
    return children.value.slice(maxNum.value)
  }

  return []
})

const moreBtnRef = ref<HTMLSpanElement | null>(null)
const dropDownRef = ref<HTMLUListElement | null>(null)
const showDropdown = ref(false)

const handleMoreClick = () => {
  showDropdown.value = !showDropdown.value
}

onClickOutside(
  dropDownRef,
  () => {
    showDropdown.value = false
  },
  { ignore: [moreBtnRef] },
)

const handleItemClick = (name: string) => {
  emit('item-click', name)
  showDropdown.value = false
}

const dropDownPlacement = ref('placement-bottom')
const { height: windowHeight } = useWindowSize()

const updateDropDownPlacement = () => {
  if (!dropDownRef.value || !moreBtnRef.value) {
    return 'placement-bottom'
  }

  const dropDownRect = dropDownRef.value.getBoundingClientRect()
  const moreBtnRect = moreBtnRef.value.getBoundingClientRect()

  dropDownPlacement.value =
    moreBtnRect.bottom + dropDownRect.height + 16 > windowHeight.value ? 'placement-top' : 'placement-bottom'
}

watch(showDropdown, (show) => {
  if (show) {
    nextTick(() => {
      updateDropDownPlacement()
    })
  }
})

watch(windowHeight, () => {
  if (showDropdown.value) {
    updateDropDownPlacement()
  }
})
</script>

<template>
  <div class="tr-action-group">
    <tiny-tooltip
      v-for="(item, index) in list"
      :key="index"
      :content="item.props?.label"
      effect="dark"
      placement="top"
      :open-delay="500"
      :disabled="!props.showTooltip"
    >
      <span class="tr-action-group__btn-wrapper" @click="handleItemClick(item.props?.name)">
        <component :is="item" />
      </span>
    </tiny-tooltip>
    <tiny-tooltip
      v-if="showMore"
      content="更多"
      effect="dark"
      placement="top"
      :open-delay="500"
      :disabled="!props.showTooltip"
    >
      <span ref="moreBtnRef" class="tr-action-group__btn-wrapper" @click="handleMoreClick">
        <slot name="moreBtn">
          <icon-button :icon="IconMenu" />
        </slot>
        <transition name="tr-action-group-dropdown">
          <ul v-show="showDropdown" ref="dropDownRef" :class="['tr-action-group__dropdown', dropDownPlacement]">
            <li
              class="tr-action-group__dropdown-item"
              v-for="(item, index) in moreList"
              :key="index"
              @click.stop="handleItemClick(item.props?.name)"
            >
              <component v-if="!props.dropDownShowLabelOnly" :is="item" />
              <span class="tr-action-group__dropdown-item-text">{{ item.props?.label }}</span>
            </li>
          </ul>
        </transition>
      </span>
    </tiny-tooltip>
  </div>
</template>

<style lang="less" scoped>
.tr-action-group {
  --tr-action-group-dropdown-bg: var(--tr-container-bg-default);
  --tr-action-group-dropdown-shadow: var(--tr-sender-box-shadow);
  --tr-action-group-dropdown-item-bg-hover: var(--tr-container-bg-hover);
  --tr-action-group-dropdown-item-bg-active: var(--tr-container-bg-active);
  --tr-action-group-dropdown-item-text-color: var(--tr-text-primary);

  display: inline-flex;
  align-items: center;
  gap: 4px;

  .tr-action-group__btn-wrapper {
    display: inline-flex;
    line-height: 0;
    position: relative;

    :deep(.tr-icon-button) {
      color: var(--tr-icon-color-default);

      &:hover {
        color: var(--tr-icon-color-hover);
      }

      &:active {
        color: var(--tr-icon-color-active);
      }
    }
  }

  .tr-action-group__dropdown {
    width: max-content;
    position: absolute;
    z-index: var(--tr-z-index-dropdown);
    right: 0;
    background-color: var(--tr-action-group-dropdown-bg);
    padding: 4px;
    border-radius: 12px;
    box-shadow: var(--tr-action-group-dropdown-shadow);

    &.placement-top {
      bottom: calc(100% + 8px);
    }

    &.placement-bottom {
      top: calc(100% + 8px);
    }

    .tr-action-group__dropdown-item {
      border-radius: 8px;
      cursor: pointer;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 4px 16px 4px 8px;
      gap: 4px;
      transition: background-color 0.3s;

      &:not(:first-child) {
        margin-top: 4px;
      }

      &:hover {
        background-color: var(--tr-action-group-dropdown-item-bg-hover);
      }

      &:active {
        background-color: var(--tr-action-group-dropdown-item-bg-active);
      }

      & > * {
        flex-shrink: 0;
      }

      &:has(> *:only-child) {
        padding: 4px 16px;
      }

      .tr-action-group__dropdown-item-text {
        font-size: 12px;
        line-height: 20px;
        color: var(--tr-action-group-dropdown-item-text-color);
      }

      :deep(button) {
        --tr-icon-button-hover-bg: unset;
        --tr-icon-button-active-bg: unset;
      }
    }
  }

  // 下拉动画
  .tr-action-group-dropdown {
    &-enter-active,
    &-leave-active {
      transition: opacity 0.3s ease;
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
}
</style>
