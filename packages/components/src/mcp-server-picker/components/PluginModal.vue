<script setup lang="ts">
import { IconClose } from '@opentiny/tiny-robot-svgs'
import { onClickOutside } from '@vueuse/core'
import { ref, defineEmits } from 'vue'
import type { PluginModalEmits, PluginFormData } from '../index.type'
import McpAddForm from '../../mcp-add-form'

const emit = defineEmits<PluginModalEmits>()

const visible = defineModel<boolean>('visible', { required: true })
const dialogRef = ref<HTMLDivElement | null>(null)

const handleClose = () => {
  visible.value = false
}

onClickOutside(dialogRef, () => {
  if (visible.value) {
    handleClose()
  }
})

const handleConfirm = (addType: 'form' | 'code', formData: PluginFormData | string) => {
  if (addType === 'form') {
    emit('confirm', 'form', formData)
  } else {
    emit('confirm', 'code', formData)
  }

  handleClose()
}
</script>

<template>
  <div v-if="visible" class="plugin-editor__backdrop"></div>
  <Transition name="plugin-editor">
    <div v-if="visible" class="plugin-editor" ref="dialogRef">
      <div class="plugin-editor__header">
        <h3 class="plugin-editor__title">添加插件</h3>
        <IconClose class="plugin-editor__close" @click="handleClose" />
      </div>

      <McpAddForm @confirm="handleConfirm" @cancel="handleClose" />
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.plugin-editor__backdrop {
  position: fixed;
  z-index: 9998;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.15);
}

.plugin-editor {
  position: fixed;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 570px;
  width: 100%;
  background-color: var(--tr-container-bg-default);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;

  &-enter-active,
  &-leave-active {
    transition-property: opacity, transform;
    transition-duration: 0.3s;
    transition-timing-function: ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }

  &-enter-to,
  &-leave-from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 32px 0 32px;
    box-sizing: content-box;
    height: 24px;
  }

  &__title {
    margin: 0;
    color: var(--tr-text-primary);
    font-size: 18px;
    line-height: 24px;
    font-weight: 700;
  }

  &__close {
    width: 28px;
    height: 28px;
    padding: 4px;
    cursor: pointer;
    box-sizing: border-box;
  }

  &__close:hover {
    background: var(--tr-container-bg-hover);
    border-radius: 8px;
  }
}

@media (max-width: 768px) {
  .plugin-editor {
    &__header {
      padding: 20px 16px 0;
    }
  }
}
</style>
