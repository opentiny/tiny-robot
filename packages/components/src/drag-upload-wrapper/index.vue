<script setup lang="ts">
import { computed } from 'vue'
import { DragUploadWrapperProps, DragUploadWrapperEmits } from './index.type'
import { useDragUpload } from './composables'

const props = withDefaults(defineProps<DragUploadWrapperProps>(), {
  disabled: false,
  multiple: true,
  accept: '',
  enableDragOverlay: true,
  overlayTitle: '',
  overlayDescription: () => [],
})

const emit = defineEmits<DragUploadWrapperEmits>()

// 使用拖拽 Hook
const { isDragging, wrapperClass, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, resetDragState } =
  useDragUpload({ props, emit })

// 计算覆盖层的描述文本
const overlayDescriptionLines = computed(() => {
  if (props.overlayDescription.length > 0) {
    return props.overlayDescription
  }
  return ['总计最多上传50个附件（每个100MB以内）', '支持附件格式 PDF/Word/Excel/PPT/Markdown']
})

// 暴露方法给外部调用
defineExpose({
  isDragging,
  resetDragState,
})
</script>

<template>
  <div
    :class="wrapperClass"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <slot :is-dragging="isDragging" :disabled="disabled"></slot>

    <!-- 默认的拖拽覆盖层 -->
    <Transition name="tr-fade">
      <div v-if="enableDragOverlay && isDragging" class="tr-drag-upload-wrapper__overlay">
        <slot name="overlay" :is-dragging="isDragging">
          <div class="tr-drag-upload-wrapper__overlay-content">
            <div class="tr-drag-upload-wrapper__overlay-icon">
              <img src="../assets/svgs/add-file.svg" alt="上传文件" />
            </div>
            <div class="tr-drag-upload-wrapper__overlay-text">
              <div class="tr-drag-upload-wrapper__overlay-title">
                {{ overlayTitle || '将附件拖到此处完成上传' }}
              </div>
              <div class="tr-drag-upload-wrapper__overlay-description">
                <span v-for="(line, index) in overlayDescriptionLines" :key="index">
                  {{ line }}
                </span>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<style lang="less" scoped>
// 导入 attachments 的样式变量
@import '../attachments/vars.less';

.tr-drag-upload-wrapper {
  position: relative;
  transition: outline 0.2s ease;

  &--dragging {
    outline: 2px dashed var(--tr-attachments-drag-border-color-active);
    outline-offset: -4px; /* 让边框在内部，不影响布局 */
  }

  &--disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  &__overlay {
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
    pointer-events: none; /* 非常重要！允许 drag 事件穿透浮层，到达下面的 wrapper */
    z-index: var(--tr-attachments-z-index-overlay);
  }

  &__overlay-content {
    display: flex;
    min-width: 320px;
    min-height: 200px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: var(--tr-overlay-padding);
    border: var(--tr-overlay-border);
    border-radius: var(--tr-overlay-border-radius);
    text-align: center;
  }

  &__overlay-icon {
    color: var(--tr-overlay-icon-color);
    margin-bottom: var(--tr-overlay-icon-margin-bottom);
    font-size: var(--tr-overlay-icon-size);
  }

  &__overlay-text {
    display: flex;
    flex-direction: column;
    gap: var(--tr-overlay-text-gap);
    justify-content: center;
  }

  &__overlay-title {
    color: var(--tr-overlay-title-color);
    font-size: var(--tr-overlay-title-font-size);
    font-weight: var(--tr-overlay-title-font-weight);
    line-height: var(--tr-overlay-desc-line-height);
    letter-spacing: 0;
    text-align: center;
  }

  &__overlay-description {
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
    transition: opacity 0.2s ease;
  }
  &-leave-active {
    transition: opacity 0.2s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
