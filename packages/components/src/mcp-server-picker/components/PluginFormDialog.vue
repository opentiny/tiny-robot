<script setup lang="ts">
import { IconClose } from '@opentiny/tiny-robot-svgs'
import { IconEditorCode } from '@opentiny/vue-icon'
import { onClickOutside } from '@vueuse/core'
import { ref, computed, defineProps, defineEmits } from 'vue'
import IconButton from '../../icon-button'
import type { AddPluginDialogProps, AddPluginDialogEmits, AddPluginFormData } from '../index.type'

const props = withDefaults(defineProps<AddPluginDialogProps>(), {
  title: '添加插件',
})

const emit = defineEmits<AddPluginDialogEmits>()

const dialogRef = ref<HTMLDivElement | null>(null)

const EditorCode = IconEditorCode()

// 表单数据
const formData = ref<AddPluginFormData>({
  name: '对话agent',
  description: '',
  types: [],
  url: '',
  headers: '',
  thumbnail: null,
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

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formData.value.thumbnail = target.files[0]
  }
}

const handleTypeChange = (typeValue: string) => {
  if (formData.value.types.includes(typeValue)) {
    formData.value.types = formData.value.types.filter((t) => t !== typeValue)
  } else {
    formData.value.types.push(typeValue)
  }
}

const handleOpenCodeEditor = () => {
  emit('open-code-editor')
}
</script>

<template>
  <div v-if="show" class="plugin-form-dialog__backdrop"></div>
  <Transition name="plugin-form-dialog">
    <div v-if="show" class="plugin-form-dialog" ref="dialogRef">
      <div class="plugin-form-dialog__header">
        <h3 class="plugin-form-dialog__title">{{ props.title }}</h3>
        <div class="plugin-form-dialog__actions">
          <EditorCode style="font-size: 21px" @click="handleOpenCodeEditor" />
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
              rows="3"
            ></textarea>
          </div>

          <!-- 类型 -->
          <div class="plugin-form-dialog__form-item">
            <label class="plugin-form-dialog__label">类型</label>
            <div class="plugin-form-dialog__checkbox-group">
              <label v-for="option in typeOptions" :key="option.value" class="plugin-form-dialog__checkbox-item">
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
            <div class="plugin-form-dialog__file-upload">
              <input
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="plugin-form-dialog__file-input"
                id="thumbnail-upload"
              />
              <label for="thumbnail-upload" class="plugin-form-dialog__file-label">
                {{ formData.thumbnail ? formData.thumbnail.name : '选择图片文件' }}
              </label>
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
    padding: 20px 24px;
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
    gap: 20px;
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
    width: 16px;
    height: 16px;

    border-radius: 999px;

    cursor: pointer;
  }

  &__checkbox-label {
    font-size: 14px;
    line-height: 22px;
    color: #191919;
  }

  &__file-upload {
    position: relative;
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
    padding: 16px 24px;
    gap: 8px;

    & > .button {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 6px;
      padding: 8px 16px;
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
}
</style>
