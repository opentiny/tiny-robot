<script setup lang="ts">
import { computed } from 'vue'
import { DropZoneOverlayProps } from '../index.type'

const props = defineProps<DropZoneOverlayProps>()

const overlayStyle = computed(() => {
  return {
    zIndex: props.config?.zIndex ?? 1000,
    '--enter-delay': `${props.config?.enterDelay ?? 200}ms`,
    '--leave-delay': `${props.config?.leaveDelay ?? 200}ms`,
  }
})

const customClass = computed(() => props.config?.className ?? '')

const descriptionLines = computed(() => {
  if (Array.isArray(props.description)) {
    return props.description
  }
  return props.description ? [props.description] : []
})
</script>

<template>
  <Transition name="tr-fade">
    <div
      v-if="visible"
      class="tr-dropzone-overlay"
      :class="[customClass, { 'tr-dropzone-overlay--fullscreen': fullscreen }]"
      :style="overlayStyle"
    >
      <div class="tr-dropzone-overlay__content">
        <div class="tr-dropzone-overlay__icon">
          <component v-if="typeof icon === 'object'" :is="icon" />
          <img v-else-if="typeof icon === 'string'" :src="icon" />
          <img v-else src="../../assets/svgs/add-file.svg" />
        </div>
        <div class="tr-dropzone-overlay__text">
          <div class="tr-dropzone-overlay__title">
            {{ title || '将附件拖到此处完成上传' }}
          </div>
          <div class="tr-dropzone-overlay__description">
            <template v-if="descriptionLines.length > 0">
              <span v-for="(line, index) in descriptionLines" :key="index">{{ line }}</span>
            </template>
            <template v-else>
              <span>总计最多上传50个附件（每个100MB以内）</span>
              <span>支持附件格式 PDF/Word/Excel/PPT/Markdown</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import '../vars.less';

.tr-dropzone-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: var(--tr-overlay-backdrop-filter);
  background: var(--tr-overlay-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--tr-attachments-border-radius);

  &--fullscreen {
    position: fixed;
    border-radius: 0;

    .tr-dropzone-overlay__content {
      border: var(--tr-overlay-border);
    }
  }

  &__content {
    display: flex;
    min-width: var(--tr-overlay-content-min-width);
    min-height: var(--tr-overlay-content-min-height);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: var(--tr-overlay-padding);
    border-radius: var(--tr-overlay-border-radius);
    text-align: center;
  }

  &__icon {
    color: var(--tr-overlay-icon-color);
    margin-bottom: var(--tr-overlay-icon-margin-bottom);
    font-size: var(--tr-overlay-icon-size);
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: var(--tr-overlay-text-gap);
    justify-content: center;
  }

  &__title {
    color: var(--tr-overlay-title-color);
    font-size: var(--tr-overlay-title-font-size);
    font-weight: var(--tr-overlay-title-font-weight);
    line-height: var(--tr-overlay-desc-line-height);
    letter-spacing: 0;
    text-align: center;
  }

  &__description {
    width: 100%;
    color: var(--tr-overlay-desc-color);
    font-size: var(--tr-overlay-desc-font-size);
    font-weight: 400;
    line-height: var(--tr-overlay-desc-line-height);
    letter-spacing: 0;
    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

// 过渡动画
.tr-fade {
  &-enter-active {
    transition: opacity var(--enter-delay) ease;
  }
  &-leave-active {
    transition: opacity var(--leave-delay) ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
