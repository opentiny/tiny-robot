<script setup lang="ts">
import { IconClose, IconShell, IconSelected, IconUnselected } from '@opentiny/tiny-robot-svgs'
import { onClickOutside } from '@vueuse/core'
import { ref, computed, defineProps, defineEmits, watch, onUnmounted } from 'vue'
import IconButton from '../../icon-button'
import { useFileDialog } from '@vueuse/core'
import type { AddPluginDialogProps, AddPluginDialogEmits, AddPluginFormData } from '../index.type'

const props = withDefaults(defineProps<AddPluginDialogProps>(), {
  title: '添加插件',
})

const emit = defineEmits<AddPluginDialogEmits>()

const dialogRef = ref<HTMLDivElement | null>(null)

// 图片预览相关
const previewImageUrl = ref<string>('')
const defaultImageUrl = 'https://res.hc-cdn.com/tinyui-design/1.1.0.20250526191525/home/images/tiny-ng.svg'

// 默认表单数据
const getDefaultFormData = (): AddPluginFormData => ({
  name: '',
  description: '',
  types: [],
  url: '',
  headers: '',
  thumbnail: null,
})

// 表单数据
const formData = ref<AddPluginFormData>(getDefaultFormData())

// 清理预览图片URL
const cleanupPreviewUrl = () => {
  if (previewImageUrl.value && previewImageUrl.value !== defaultImageUrl) {
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
  }
}

// 重置表单数据
const resetFormData = () => {
  cleanupPreviewUrl()
  formData.value = getDefaultFormData()
}

// 组件卸载时清理
onUnmounted(() => {
  cleanupPreviewUrl()
})

// 类型选项
const typeOptions = [
  { value: 'stdio', label: '标准输入/输出（stdio）' },
  { value: 'sse', label: '服务器发送事件（sse）' },
  { value: 'streamableHttp', label: '可流式传输的HTTP（streamableHttp）' },
]

const show = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// 监听弹窗显示状态，打开时重置表单数据
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      resetFormData()
    }
  },
)

onClickOutside(dialogRef, () => {
  if (show.value) {
    handleClose()
  }
})

const handleClose = () => {
  show.value = false
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm', { ...formData.value })
  show.value = false
}

const handleCancel = () => {
  handleClose()
}

const handleTypeChange = (typeValue: string) => {
  if (formData.value.types.includes(typeValue)) {
    formData.value.types = formData.value.types.filter((t) => t !== typeValue)
  } else {
    formData.value.types.push(typeValue)
  }
}

const { open: openFileDialog, files } = useFileDialog({
  accept: 'image/*', // 只接受图片文件
  multiple: false, // 只允许选择单个文件
})

// 监听文件选择
watch(files, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    const file = newFiles[0]

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 验证文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('文件大小不能超过5MB')
      return
    }

    // 清理之前的预览URL
    cleanupPreviewUrl()

    // 创建新的预览URL
    previewImageUrl.value = URL.createObjectURL(file)

    // 更新表单数据
    formData.value.thumbnail = file
  }
})

const handleOpenCodeEditor = () => {
  emit('open-code-editor')
}

const handleOpenFileDialog = () => {
  openFileDialog()
}
</script>

<template>
  <div v-if="show" class="plugin-form-dialog__backdrop"></div>
  <Transition name="plugin-form-dialog">
    <div v-if="show" class="plugin-form-dialog" ref="dialogRef">
      <div class="plugin-form-dialog__header">
        <h3 class="plugin-form-dialog__title">{{ props.title }}</h3>
        <div class="plugin-form-dialog__actions">
          <IconShell class="plugin-form-dialog__actions-icon" @click="handleOpenCodeEditor" />
          <div class="plugin-form-dialog__actions-divider"></div>
          <IconButton
            class="plugin-form-dialog__close"
            :icon="IconClose"
            size="24"
            svg-size="20"
            @click="handleClose"
          />
        </div>
      </div>

      <div class="plugin-form-dialog__content">
        <form class="plugin-form-dialog__form">
          <!-- 名称 -->
          <div class="plugin-form-dialog__form-item">
            <label class="plugin-form-dialog__label">名称</label>
            <input v-model="formData.name" class="plugin-form-dialog__input" type="text" placeholder="请输入插件名称" />
          </div>

          <!-- 描述 -->
          <div class="plugin-form-dialog__form-item">
            <label class="plugin-form-dialog__label">描述</label>
            <textarea
              v-model="formData.description"
              class="plugin-form-dialog__textarea"
              placeholder="请输入插件描述"
              rows="4"
            ></textarea>
          </div>

          <!-- 类型 -->
          <div class="plugin-form-dialog__form-item">
            <label class="plugin-form-dialog__label">类型</label>
            <div class="plugin-form-dialog__checkbox-group">
              <label v-for="option in typeOptions" :key="option.value" class="plugin-form-dialog__checkbox-item">
                <IconSelected v-if="formData.types.includes(option.value)" />
                <IconUnselected v-else />
                <input
                  type="checkbox"
                  :value="option.value"
                  :checked="formData.types.includes(option.value)"
                  @change="handleTypeChange(option.value)"
                  class="plugin-form-dialog__checkbox"
                />
                <span class="plugin-form-dialog__checkbox-label">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <!-- URL -->
          <div class="plugin-form-dialog__form-item">
            <label class="plugin-form-dialog__label">URL</label>
            <input v-model="formData.url" class="plugin-form-dialog__input" type="url" placeholder="请输入插件URL" />
          </div>

          <!-- 请求头 -->
          <div class="plugin-form-dialog__form-item">
            <label class="plugin-form-dialog__label">请求头</label>
            <textarea
              v-model="formData.headers"
              class="plugin-form-dialog__textarea"
              placeholder="请输入请求头，格式为JSON"
              rows="4"
            ></textarea>
          </div>

          <!-- 缩略图 -->
          <div class="plugin-form-dialog__form-item">
            <label class="plugin-form-dialog__label">缩略图</label>
            <div class="plugin-form-dialog__file-upload" @click="handleOpenFileDialog">
              <img
                :src="previewImageUrl || defaultImageUrl"
                alt="缩略图预览"
                class="plugin-form-dialog__file-preview-image"
              />
              <!-- 悬浮遮罩层 -->
              <div class="plugin-form-dialog__file-overlay">
                <div class="plugin-form-dialog__file-icon"></div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="plugin-form-dialog__footer">
        <div class="button cancel" @click="handleCancel">
          <span>取消</span>
        </div>
        <div class="button confirm" @click="handleConfirm">
          <span>确定</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.plugin-form-dialog__backdrop {
  position: fixed;
  z-index: 9998;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.15);
}

.plugin-form-dialog {
  position: fixed;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 734px;
  max-height: 90vh;
  background-color: #ffffff;
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
    padding: 32px 32px 20px 32px;
    height: 60px;
    box-sizing: border-box;
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333333;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__actions-icon {
    cursor: pointer;
  }

  &__actions-divider {
    width: 1px;
    height: 16px;
    background-color: #dbdbdb;
  }

  &__close {
    color: #595959;
  }

  &__content {
    flex: 1;
    padding: 0 32px;
    overflow-y: auto;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #191919;
    line-height: 22px;
  }

  &__input {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    height: 32px;
    font-size: 14px;
    line-height: 22px;
    color: #191919;
    background-color: #ffffff;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }

    &::placeholder {
      color: #999999;
    }
  }

  &__textarea {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
    line-height: 22px;
    color: #191919;
    background-color: #ffffff;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }

    &::placeholder {
      color: #999999;
    }
  }

  &__checkbox-group {
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }

  &__checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  &__checkbox {
    display: none;
  }

  &__checkbox-label {
    font-size: 14px;
    line-height: 22px;
    color: #191919;
  }

  &__file-upload {
    position: relative;
    width: 48px;
    height: 48px;
    cursor: pointer;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s ease;
    border: 2px solid transparent;

    & > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.2s ease;
    }

    // 悬浮时显示遮罩
    &:hover {
      .plugin-form-dialog__file-overlay {
        opacity: 1;
      }
    }
  }

  // 悬浮遮罩层
  &__file-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.25s ease;
    pointer-events: none; // 默认不拦截事件
    backdrop-filter: blur(1px); // 添加轻微模糊效果
  }

  // 悬浮图标
  &__file-icon {
    width: 24px;
    height: 24px;
    background-image: url('../../assets/svgs/edit.svg');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
  }

  &__file-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  &__file-label {
    display: inline-block;
    padding: 8px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background-color: #fafafa;
    font-size: 14px;
    line-height: 22px;
    color: #191919;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #1890ff;
      background-color: #f0f9ff;
    }
  }

  &__footer {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding: 20px 32px;
    gap: 8px;

    & > .button {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 999px;
      padding: 7px 24px;
      font-size: 14px;
      line-height: 22px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 60px;

      &.cancel {
        background-color: #ffffff;
        border: 1px solid #d9d9d9;
        color: #595959;

        &:hover {
          border-color: #1890ff;
          color: #1890ff;
        }
      }

      &.confirm {
        background-color: #000000;
        border: 1px solid #000000;
        color: #ffffff;

        &:hover {
          background-color: #333333;
          border-color: #333333;
        }
      }
    }
  }

  &__file-preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;

    // 图片加载失败时的处理
    &:not([src]),
    &[src=''] {
      background-color: #f5f5f5;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='2'%3E%3Cpath d='M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'/%3E%3Ccircle cx='12' cy='13' r='3'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 24px 24px;
    }
  }
}
</style>
