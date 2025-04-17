<script setup lang="ts">
import IconClose from './svgs/IconClose.vue'
import IconCancelFullScreen from './svgs/IconCancelFullScreen.vue'
import IconFullScreen from './svgs/IconFullScreen.vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ fullscreen?: boolean }>(), {})

const IconFullScreenSwitcher = computed(() => (props.fullscreen ? IconCancelFullScreen : IconFullScreen))
</script>

<template>
  <div class="tr-container">
    <div class="tr-container__dragging-bar-wrapper">
      <div class="tr-container__dragging-bar"></div>
    </div>
    <div class="tr-container__header">
      <h3 class="tr-container__title">OpenTiny NEXT</h3>
      <div class="tr-container__header-operations">
        <span class="icon">
          <IconFullScreenSwitcher />
        </span>
        <span class="icon">
          <IconClose />
        </span>
      </div>
    </div>
    <div class="tr-container__body">
      <slot></slot>
    </div>
    <div class="tr-container__footer">
      <div>footer</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-container {
  background-color: rgb(248, 248, 248);
  border: 1px solid rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: v-bind('props.fullscreen? "0" : "unset"');
  width: v-bind('props.fullscreen? "unset" : "480px"');
  z-index: 100;
  display: flex;
  flex-direction: column;

  .tr-container__dragging-bar-wrapper {
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;

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

    .icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    }
  }

  .tr-container__body {
    width: 100%;
    flex: 1;

    overflow-y: auto;
  }

  .tr-container__footer {
    flex-shrink: 0;
    padding: 16px 24px;
    background-color: white;
  }
}
</style>
