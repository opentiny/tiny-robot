<script setup lang="ts">
import { IconCancelFullScreen, IconClose, IconFullScreen } from '@opentiny/tiny-robot-svgs'
import { computed } from 'vue'
import IconButton from '../icon-button'
import { ContainerEmits, ContainerProps, ContainerSlots } from './index.type'

const props = withDefaults(defineProps<ContainerProps>(), {
  title: 'OpenTiny NEXT',
})

const show = defineModel<ContainerProps['show']>('show', { required: true })
const fullscreen = defineModel<ContainerProps['fullscreen']>('fullscreen')

defineSlots<ContainerSlots>()

const IconFullScreenSwitcher = computed(() => (fullscreen.value ? IconCancelFullScreen : IconFullScreen))

const emit = defineEmits<ContainerEmits>()

const handleClose = () => {
  show.value = false
  emit('close')
}
</script>

<template>
  <div v-show="show" class="tr-container" :class="{ fullscreen: fullscreen }">
    <div class="tr-container__dragging-bar-wrapper">
      <div class="tr-container__dragging-bar"></div>
    </div>
    <div class="tr-container__header">
      <slot name="title">
        <h3 class="tr-container__title">{{ props.title }}</h3>
      </slot>
      <div class="tr-container__header-operations">
        <slot name="operations"></slot>
        <icon-button
          size="28"
          svg-size="20"
          :icon="IconFullScreenSwitcher"
          @click="fullscreen = !fullscreen"
        ></icon-button>
        <icon-button size="28" svg-size="20" :icon="IconClose" @click="handleClose"></icon-button>
      </div>
    </div>
    <slot></slot>
    <div class="tr-container__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style lang="less">
// TODO 提取到全局变量中
.tr-container-vars() {
  @prefix: tr-container;

  @vars: {
    /* 不影响布局的变量 */
    bg-color: rgb(248, 248, 248);
    border-color: rgba(0, 0, 0, 0.08);
    title-color: #191919;
    title-font-weight: 600;
    /* 影响布局的变量 */
    width: 480px;
    border-width: 1px;
    header-padding: 0 24px 16px;
    header-operations-gap: 8px;
    title-font-size: 14px;
    title-line-height: 22px;
  };

  @fullscreen-vars: {
    title-font-size: 16px;
    title-line-height: 22px;
    header-padding: 0 160px 16px;
  };

  :root {
    each(@vars, {
    --@{prefix}-@{key}: @value;
  });

    each(@fullscreen-vars, {
    --@{prefix}-@{key}-fullscreen: @value;
  });
  }
}

.tr-container-vars();
</style>

<style lang="less" scoped>
.tr-container {
  /* 不影响布局的变量 */
  --bg-color: var(--tr-container-bg-color);
  --border-color: var(--tr-container-border-color);
  --title-color: var(--tr-container-title-color);
  --title-font-weight: var(--tr-container-title-font-weight);

  /* 影响布局的变量 */
  --left: unset;
  --width: var(--tr-container-width);
  --border-width: var(--tr-container-border-width);
  --header-padding: var(--tr-container-header-padding);
  --header-operations-gap: var(--tr-container-header-operations-gap);
  --title-font-size: var(--tr-container-title-font-size);
  --title-line-height: var(--tr-container-title-line-height);

  &.fullscreen {
    --left: 0;
    --width: unset;
    --title-font-size: var(--tr-container-title-font-size-fullscreen, var(--tr-container-title-font-size));
    --title-line-height: var(--tr-container-title-line-height-fullscreen, var(--tr-container-title-line-height));
    --header-padding: var(--tr-container-header-padding-fullscreen, var(--tr-container-header-padding));
  }
}

.tr-container {
  width: var(--width);
  background-color: var(--bg-color);
  border: var(--border-width) solid var(--border-color);
  position: fixed;
  inset: 0;
  left: var(--left);
  z-index: var(--tr-z-index-fixed);
  display: flex;
  flex-direction: column;

  .tr-container__dragging-bar-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;

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
    padding: var(--header-padding);
  }

  .tr-container__title {
    margin: 0;
    padding: 0;
    color: var(--title-color);
    font-weight: var(--title-font-weight);
    font-size: var(--title-font-size);
    line-height: var(--title-line-height);
  }

  .tr-container__header-operations {
    display: flex;
    gap: var(--header-operations-gap);
  }

  .tr-container__header + * {
    flex: 1;
    overflow-y: auto;
  }

  .tr-container__footer {
    flex-shrink: 0;
  }
}
</style>
