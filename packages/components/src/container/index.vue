<script setup lang="ts">
import { IconClose, IconFullScreen, IconWindowDocked, IconWindowFloating } from '@opentiny/tiny-robot-svgs'
import { computed, CSSProperties, watch } from 'vue'
import IconButton from '../icon-button'
import { toCssUnit } from '../shared/utils'
import { ContainerEmits, ContainerProps, ContainerSlots } from './index.type'

const props = withDefaults(defineProps<ContainerProps>(), {
  width: 480,
})

const show = defineModel<ContainerProps['show']>('show', { required: true })
const displayMode = defineModel<ContainerProps['displayMode']>('displayMode', { default: 'docked' })

defineSlots<ContainerSlots>()

const emit = defineEmits<ContainerEmits>()

const handleClose = () => {
  show.value = false
}

watch(show, (value) => {
  if (value) {
    emit('open')
  } else {
    emit('close')
  }
})

const styles = computed<CSSProperties>(() => {
  if (displayMode.value === 'fullscreen') {
    return {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }
  } else {
    return {
      width: toCssUnit(props.width),
      right: 0,
      top: 0,
      bottom: 0,
    }
  }
})

const displayModesIcons = [
  { mode: 'fullscreen', icon: IconFullScreen },
  { mode: 'docked', icon: IconWindowDocked },
  { mode: 'floating', icon: IconWindowFloating },
] satisfies { mode: ContainerProps['displayMode']; icon: unknown }[]

const handleChangeDisplayMode = (mode: ContainerProps['displayMode']) => {
  if (displayMode.value !== mode) {
    displayMode.value = mode
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-show="show" class="tr-container" :style="styles">
      <div class="tr-container__dragging-bar-wrapper">
        <div class="tr-container__dragging-bar"></div>
      </div>
      <div class="tr-container__header">
        <slot name="title">
          <h3 class="tr-container__title">{{ props.title }}</h3>
        </slot>
        <div class="tr-container__header-actions">
          <slot name="header-actions"></slot>
          <template v-for="(item, index) in displayModesIcons" :key="index">
            <icon-button
              v-if="item.mode !== displayMode"
              size="28"
              svg-size="20"
              :icon="item.icon"
              @click="handleChangeDisplayMode(item.mode)"
            ></icon-button>
          </template>
          <icon-button size="28" svg-size="20" :icon="IconClose" @click="handleClose"></icon-button>
        </div>
      </div>
      <slot></slot>
      <div class="tr-container__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </Teleport>
</template>

<style lang="less" scoped>
.tr-container {
  background-color: rgb(248, 248, 248);
  border: 1px solid rgba(0, 0, 0, 0.08);
  position: fixed;
  z-index: var(--tr-z-index-fixed);
  display: flex;
  flex-direction: column;

  .tr-container__dragging-bar-wrapper {
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;

    // TODO 拖拽条的逻辑
    .tr-container__dragging-bar {
      width: 40px;
      height: 4px;
      background-color: rgb(217, 217, 217);
      border-radius: 999px;
      cursor: grab;
    }
  }

  .tr-container__header {
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 24px;
  }

  .tr-container__title {
    margin: 0;
    padding: 0;
    color: rgb(25, 25, 25);
    font-weight: 600;
    font-size: 14px;
    line-height: 22px;
  }

  .tr-container__header-actions {
    display: flex;
    gap: 8px;
  }

  .tr-container__header + :slotted(*) {
    flex: 1;
    overflow-y: auto;
  }

  .tr-container__footer {
    flex-shrink: 0;
  }
}
</style>
