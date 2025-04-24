<script setup lang="ts">
import { IconMenu } from '@opentiny/tiny-robot-svgs'
import { onClickOutside } from '@vueuse/core'
import { computed, ref, useTemplateRef, VNode } from 'vue'
import IconButton from '../icon-button'

const props = defineProps<{
  maxNum?: number
}>()

const slots = defineSlots<{
  default: () => VNode | VNode[]
}>()

const emit = defineEmits<{
  (e: 'click', name: string): void
}>()

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

const moreBtn = useTemplateRef('moreBtnRef')
const dropDown = useTemplateRef('dropDownRef')
const showDropdown = ref(false)

const handleMoreClick = () => {
  showDropdown.value = !showDropdown.value
}

onClickOutside(dropDown, (ev) => {
  if (moreBtn.value?.contains(ev.target as Node)) {
    return
  }

  showDropdown.value = false
})

const handleItemClick = (name: string) => {
  console.log('handleItemClick', name)
  emit('click', name)
  showDropdown.value = false
}
</script>

<template>
  <div class="tr-action-group">
    <component :is="item" v-for="(item, index) in list" :key="index" />
    <span v-if="showMore" ref="moreBtnRef" class="tr-action-group__more">
      <tiny-tooltip content="更多" effect="dark" placement="top" :open-delay="500">
        <icon-button :icon="IconMenu" @click="handleMoreClick" />
      </tiny-tooltip>
      <ul v-show="showDropdown" ref="dropDownRef" class="tr-action-group__dropdown">
        <li
          class="tr-action-group__dropdown-item"
          v-for="(item, index) in moreList"
          :key="index"
          @click="handleItemClick(item.props?.name)"
        >
          <component :is="item" />
          <span class="tr-action-group__dropdown-item-text">{{ item.props?.label }}</span>
        </li>
      </ul>
    </span>
  </div>
</template>

<style lang="less" scoped>
.tr-action-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .tr-action-group__more {
    display: inline-flex;
    line-height: 0;
    position: relative;
  }

  .tr-action-group__dropdown {
    width: max-content;
    position: absolute;
    top: calc(100% + 8px);
    z-index: 100;
    right: 0;
    background-color: white;
    padding: 4px;
    border-radius: 12px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);

    .tr-action-group__dropdown-item {
      border-radius: 8px;
      cursor: pointer;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 4px;
      padding-right: 16px;
      gap: 4px;
      transition: background-color 0.3s;

      &:not(:first-child) {
        margin-top: 4px;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.15);
      }

      & > * {
        flex-shrink: 0;
      }

      .tr-action-group__dropdown-item-text {
        font-size: 12px;
        line-height: 20px;
        color: rgb(25, 25, 25);
      }

      :deep(button) {
        --tr-icon-button-hover-bg: unset;
        --tr-icon-button-active-bg: unset;
      }
    }
  }
}
</style>
