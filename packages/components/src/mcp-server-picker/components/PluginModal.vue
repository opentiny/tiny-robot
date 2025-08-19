<script setup lang="ts">
import { IconClose } from '@opentiny/tiny-robot-svgs'
import { TinyRadioGroup } from '@opentiny/vue'
import { onClickOutside } from '@vueuse/core'
import { ref, defineEmits } from 'vue'
import type { PluginModalEmits, PluginFormData } from '../index.type'
import CodeEditor from './CodeEditor.vue'
import FormEditor from './FormEditor.vue'

const emit = defineEmits<PluginModalEmits>()

const visible = defineModel<boolean>('visible', { required: true })
const dialogRef = ref<HTMLDivElement | null>(null)

const formData = ref<PluginFormData>({
  name: '',
  description: '',
  type: 'sse',
  url: '',
  headers: '',
  thumbnail: null,
})
const codeData = ref<string>('')

const addType = ref('form')
const addTypeOptions = [
  { label: 'form', text: '表单添加' },
  { label: 'code', text: '代码添加' },
]

const handleClose = () => {
  visible.value = false
}

onClickOutside(dialogRef, () => {
  if (visible.value) {
    handleClose()
  }
})

const handleConfirm = () => {
  if (addType.value === 'form') {
    emit('confirm', 'form', formData.value)
  } else {
    emit('confirm', 'code', codeData.value)
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

      <div class="plugin-editor__content">
        <!-- 添加插件方式-->
        <div class="plugin-editor__add-type">
          <span class="plugin-editor__add-type-label">添加方式</span>
          <tiny-radio-group v-model="addType" type="button" :options="addTypeOptions" />
        </div>

        <div v-if="addType === 'form'" class="plugin-editor__form-editor">
          <FormEditor v-model:form-data="formData" />
        </div>

        <div v-if="addType === 'code'" class="plugin-editor__code-editor">
          <CodeEditor v-model:code-data="codeData" />
        </div>
      </div>

      <div class="plugin-editor__footer">
        <div class="button cancel" @click="handleClose">
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
  width: 700px;
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
    box-sizing: content-box;
    height: 24px;
  }

  &__title {
    margin: 0;
    color: #191919;
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
    background: #f5f5f5;
    border-radius: 8px;
  }

  &__content {
    flex: 1;
    padding: 0 32px;
  }

  &__add-type {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-label {
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #191919;
    }
  }

  &__form-editor {
    margin-top: 16px;
  }

  &__code-editor {
    margin-top: 20px;
  }

  &__footer {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding: 20px 32px 32px 32px;
    gap: 8px;

    & > .button {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 999px;
      padding: 5px 24px;
      font-size: 14px;
      height: 32px;
      line-height: 22px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 60px;
      box-sizing: border-box;

      &.cancel {
        background-color: #ffffff;
        border: 1px solid #595959;
        color: #191919;

        &:hover {
          border-color: #c2c2c2;
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
