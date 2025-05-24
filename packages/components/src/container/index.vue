<script setup lang="ts">
import { IconCancelFullScreen, IconClose, IconFullScreen } from '@opentiny/tiny-robot-svgs'
import { computed, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import IconButton from '../icon-button'
import { ContainerEvents, ContainerProps, ContainerSlots } from './index.type'

const props = withDefaults(defineProps<ContainerProps>(), {
  displayMode: 'docked',
})

const show = defineModel<ContainerProps['show']>('show', { required: true })

const DISPLAY_MODE_PERSISTENCE_KEY = 'tr.continaer.displayMode'
const PREVIOUS_DISPLAY_MODE_PERSISTENCE_KEY = 'tr.continaer.previousDisplayMode'

// TODO 修改为悬浮窗口、侧边窗口、全屏窗口。不需要自带的持久化
const getDisplayMode = () => {
  const defaultPreviousDisplayMode = props.displayMode === 'fullscreen' ? 'docked' : props.displayMode

  if (props.persistDisplayMode) {
    const displayMode = useStorage<ContainerProps['displayMode']>(DISPLAY_MODE_PERSISTENCE_KEY, props.displayMode)
    const previousDisplayMode = useStorage<ContainerProps['displayMode']>(
      PREVIOUS_DISPLAY_MODE_PERSISTENCE_KEY,
      defaultPreviousDisplayMode,
    )
    return { displayMode, previousDisplayMode }
  }

  return { displayMode: ref(props.displayMode), previousDisplayMode: ref(defaultPreviousDisplayMode) }
}

const { displayMode, previousDisplayMode } = getDisplayMode()

const fullscreen = computed(() => displayMode.value === 'fullscreen')

watch(fullscreen, (v) => {
  console.log(v)
})

defineSlots<ContainerSlots>()

const emit = defineEmits<ContainerEvents>()

watch(show, (value) => {
  if (value) {
    emit('open')
  } else {
    emit('close')
  }
})

const IconFullScreenSwitcher = computed(() =>
  displayMode.value === 'fullscreen' ? IconCancelFullScreen : IconFullScreen,
)

function toggleFullscreen() {
  console.log(displayMode.value)
  if (displayMode.value === 'fullscreen') {
    // 恢复上次非 fullscreen 的状态
    displayMode.value = previousDisplayMode.value
  } else {
    // 保存当前模式，然后进入 fullscreen
    previousDisplayMode.value = displayMode.value
    displayMode.value = 'fullscreen'
  }
}
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
      <div class="tr-container__header-actions">
        <slot name="header-actions"></slot>
        <icon-button size="28" svg-size="20" :icon="IconFullScreenSwitcher" @click="toggleFullscreen"></icon-button>
        <icon-button size="28" svg-size="20" :icon="IconClose" @click="$emit('update:show', false)"></icon-button>
      </div>
    </div>
    <slot></slot>
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
