<script setup lang="ts">
import { IconClose } from '@opentiny/tiny-robot-svgs'
import TinyRadioGroup from '@opentiny/vue-radio-group'
import { onClickOutside } from '@vueuse/core'
import { ref, defineEmits } from 'vue'
import type { PluginModalProps, IPluginModalEmits, IFormData } from './index.type'
import { FormEditor, CodeEditor } from './components'

const props = withDefaults(defineProps<PluginModalProps>(), {
  title: '添加插件',
  defaultMode: 'form',
})

const emit = defineEmits<IPluginModalEmits>()

const show = defineModel<boolean>('show', { required: true })
const dialogRef = ref<HTMLDivElement | null>(null)

const initFormData = (): IFormData => {
  return {
    name: '',
    description: '',
    type: '',
    url: '',
    headers: '',
    thumbnail: null,
  }
}

const formData = ref<IFormData>(initFormData())

const codeData = ref<string>('')

const defaultActiveMode = ref(props.defaultMode)
const addTypeOptions = [
  { label: 'form', text: '表单添加' },
  { label: 'code', text: '代码添加' },
]

const resetModalData = () => {
  formData.value = initFormData()
  codeData.value = ''
  defaultActiveMode.value = props.defaultMode
}

const handleClose = () => {
  show.value = false
  resetModalData()
}

onClickOutside(dialogRef, () => {
  if (show.value) {
    handleClose()
  }
})

const handleConfirm = () => {
  if (defaultActiveMode.value === 'form') {
    emit('confirm', 'form', formData.value)
  } else {
    emit('confirm', 'code', codeData.value)
  }

  handleClose()
}
</script>

<template>
  <div v-if="show" class="tr-mcp-add-modal__backdrop"></div>
  <Transition name="tr-mcp-add-modal">
    <div v-if="show" class="tr-mcp-add-modal" ref="dialogRef">
      <div class="tr-mcp-add-modal__header">
        <h3 class="tr-mcp-add-modal__title">{{ title }}</h3>
        <IconClose class="tr-mcp-add-modal__close" @click="handleClose" />
      </div>

      <div class="tr-mcp-add-modal__content">
        <!-- 添加插件方式-->
        <div class="tr-mcp-add-modal__add-type">
          <span class="tr-mcp-add-modal__add-type-label">添加方式</span>
          <tiny-radio-group v-model="defaultActiveMode" type="button" :options="addTypeOptions" />
        </div>

        <div v-if="defaultActiveMode === 'form'" class="tr-mcp-add-modal__form-editor">
          <FormEditor v-model:form-data="formData" />
        </div>

        <div v-if="defaultActiveMode === 'code'" class="tr-mcp-add-modal__code-editor">
          <CodeEditor v-model:code-data="codeData" />
        </div>
      </div>

      <div class="tr-mcp-add-modal__footer">
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
.tr-mcp-add-modal__backdrop {
  position: fixed;
  z-index: 9998;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.15);
}

.tr-mcp-add-modal {
  position: fixed;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
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
    box-sizing: border-box;
  }

  &__title {
    margin: 0;
    color: #191919;
    font-size: 18px;
    line-height: 24px;
    font-weight: 700;
  }

  &__close {
    cursor: pointer;
    font-size: 24px;
    color: #595959;
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
    padding: 26px 32px 32px 32px;
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
