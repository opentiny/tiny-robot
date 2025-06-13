<script setup lang="ts">
import { IconClose } from '@opentiny/tiny-robot-svgs'
import { onClickOutside } from '@vueuse/core'
import { ref, computed, defineProps, defineEmits } from 'vue'
import IconButton from '../../icon-button'
import type { CreatePluginDialogProps, CreatePluginDialogEmits } from '../index.type'

const props = withDefaults(defineProps<CreatePluginDialogProps>(), {
  title: '创建插件',
})

const emit = defineEmits<CreatePluginDialogEmits>()

const dialogRef = ref<HTMLDivElement | null>(null)

const aiPluginCode = ref(`{
  "schema_version": "v1",
  "name_for_model": "example_plugin",
  "name_for_human": "示例插件",
  "description_for_model": "这是一个示例插件的描述",
  "description_for_human": "这是一个供人类阅读的插件描述",
  "auth": {
    "type": "none"
  },
  "api": {
    "type": "openapi",
    "url": "http://localhost:3000/openapi.yaml"
  }
}`)

const openapiCode = ref(`openapi: 3.0.0
info:
  title: 示例插件 API
  version: 1.0.0
  description: 这是一个示例插件的 OpenAPI 规范
servers:
  - url: http://localhost:3000
paths:
  /example:
    get:
      summary: 示例接口
      description: 这是一个示例接口
      responses:
        '200':
          description: 成功响应
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Hello World"`)

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
  emit('confirm', {
    aiPlugin: aiPluginCode.value,
    openapi: openapiCode.value,
  })
  show.value = false
}

const handleCancel = () => {
  handleClose()
}
</script>

<template>
  <div v-if="show" class="create-plugin-dialog__backdrop"></div>
  <Transition name="create-plugin-dialog">
    <div v-if="show" class="create-plugin-dialog" ref="dialogRef">
      <div class="create-plugin-dialog__header">
        <h3 class="create-plugin-dialog__title">{{ props.title }}</h3>
        <IconButton
          class="create-plugin-dialog__close"
          :icon="IconClose"
          size="24"
          svg-size="20"
          @click="handleClose"
        />
      </div>

      <div class="create-plugin-dialog__content">
        <div class="create-plugin-dialog__editor-container">
          <div class="create-plugin-dialog__editor-section">
            <div class="create-plugin-dialog__editor-header">
              <span class="create-plugin-dialog__editor-title">ai_plugin（填写json）</span>
            </div>
            <div class="create-plugin-dialog__editor">
              <textarea
                v-model="aiPluginCode"
                class="create-plugin-dialog__textarea"
                placeholder="请输入 JSON 配置..."
              ></textarea>
            </div>
          </div>

          <div class="create-plugin-dialog__editor-section">
            <div class="create-plugin-dialog__editor-header">
              <span class="create-plugin-dialog__editor-title">openapi（填写yaml）</span>
            </div>
            <div class="create-plugin-dialog__editor">
              <textarea
                v-model="openapiCode"
                class="create-plugin-dialog__textarea"
                placeholder="请输入 YAML 配置..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="create-plugin-dialog__footer">
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
.create-plugin-dialog__backdrop {
  position: fixed;
  z-index: 9998;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.15);
}

.create-plugin-dialog {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 765px;
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

  &__close {
    color: #595959;
  }

  &__editor-container {
    display: flex;
    gap: 32px;
    width: 100%;
    padding: 0 32px;
    border-radius: 8px;
    box-sizing: border-box;
  }

  &__editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__editor-header {
    padding-bottom: 8px;
  }

  &__editor-title {
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: #191919;
  }

  &__editor {
    flex: 1;
    border-radius: 12px;
    overflow: hidden;
  }

  &__textarea {
    width: 100%;
    height: 571px;
    border: none;
    outline: none;
    resize: none;
    padding: 12px;
    font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.4;
    color: #191919;
    background-color: #f5f5f5;
    box-sizing: border-box;

    &::placeholder {
      color: #999999;
    }

    &:focus {
      box-shadow: none;
    }
  }

  &__footer {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding: 0 32px;
    height: 88px;
    box-sizing: border-box;
    align-items: center;
    gap: 8px;

    & > .button {
      display: flex;
      justify-content: center;
      border-radius: 999px;
      padding: 5px 24px;
      font-size: 14px;
      width: 28px;
      line-height: 22px;
      cursor: pointer;
      border: 1px solid #595959;
      box-sizing: content-box;

      &.confirm {
        background-color: #000000;
        color: #ffffff;
      }
    }
  }
}
</style>
