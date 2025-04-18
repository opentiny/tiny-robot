<script setup lang="ts">
import { IconCancelFullScreen, IconClose, IconFullScreen } from '@opentiny/tiny-robot-svgs'
import { computed } from 'vue'
import { ContainerProps, ContainerSlots } from './index.type'

const show = defineModel<ContainerProps['show']>('show', { required: true })
const fullscreen = defineModel<ContainerProps['fullscreen']>('fullscreen')

defineSlots<ContainerSlots>()

const IconFullScreenSwitcher = computed(() => (fullscreen.value ? IconCancelFullScreen : IconFullScreen))
</script>

<template>
  <div class="tr-container">
    <div class="tr-container__dragging-bar-wrapper">
      <div class="tr-container__dragging-bar"></div>
    </div>
    <div class="tr-container__header">
      <slot name="title">
        <h3 class="tr-container__title">OpenTiny NEXT</h3>
      </slot>
      <div class="tr-container__header-operations">
        <slot name="operations"></slot>
        <button class="icon-btn" @click="$emit('update:fullscreen', !fullscreen)">
          <IconFullScreenSwitcher />
        </button>
        <button class="icon-btn" @click="$emit('update:show', false)">
          <IconClose />
        </button>
      </div>
    </div>
    <div class="tr-container__body">
      <slot></slot>
    </div>
    <div class="tr-container__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-container {
  --tr-container-width: 480px;

  background-color: rgb(248, 248, 248);
  border: 1px solid rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: v-bind('fullscreen? "0" : "unset"');
  width: v-bind('fullscreen? "unset" : "var(--tr-container-width)"');
  z-index: v-bind('show? "100":"-1"');
  opacity: v-bind('show? "1":"0"');
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

  .tr-container__header-operations {
    display: flex;
    gap: 8px;

    button.icon-btn {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      padding: 0;
      transition: background-color 0.3s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.15);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .tr-container__body {
    flex: 1;
    overflow-y: auto;
  }

  .tr-container__footer {
    flex-shrink: 0;
  }
}
</style>
