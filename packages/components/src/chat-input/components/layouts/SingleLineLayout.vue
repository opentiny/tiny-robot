<template>
  <div class="tr-chat-input-single-layout">
    <!-- Header 插槽 -->
    <div v-if="$slots.header" class="tr-chat-input-header">
      <slot name="header" />
    </div>

    <!-- 主输入行 -->
    <div class="tr-chat-input-main">
      <!-- Prefix 插槽 -->
      <div v-if="$slots.prefix" class="tr-chat-input-prefix">
        <slot name="prefix" />
      </div>

      <!-- 编辑器内容 -->
      <div class="tr-chat-input-content">
        <slot name="content" :editor="context.editor">
          <EditorContent />
        </slot>
      </div>

      <!-- 单行模式操作按钮 -->
      <div
        :class="['tr-chat-input-actions-inline', { 'has-content': context.hasContent.value || context.loading.value }]"
      >
        <slot name="actions-inline">
          <Transition name="tr-slide-right">
            <div v-if="context.hasContent.value || context.loading.value" class="tr-chat-input-actions-group">
              <Transition name="tr-slide-right">
                <div
                  v-if="context.clearable.value && context.hasContent.value && !context.loading.value"
                  class="tr-chat-input-utility-buttons"
                >
                  <ClearButton />
                </div>
              </Transition>
              <div class="tr-chat-input-submit-wrapper">
                <SubmitButton />
              </div>
            </div>
          </Transition>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatInputContext } from '../../context'
import EditorContent from '../editor-content/index.vue'
import SubmitButton from '../submit-button/index.vue'
import ClearButton from '../clear-button/index.vue'

const context = useChatInputContext()
</script>

<style lang="less" scoped>
.tr-chat-input-single-layout {
  .tr-chat-input-header {
    margin-bottom: 12px;
    padding: 15px 20px 0;
  }

  .tr-chat-input-main {
    display: flex;
    align-items: center;
    min-height: var(--tr-chat-input-min-height);
  }

  .tr-chat-input-prefix {
    flex-shrink: 0;
    padding: 15px 0 15px 20px;
  }

  .tr-chat-input-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 15px 0 15px 20px;

    :deep(.ProseMirror) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .tr-chat-input-actions-inline {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding-right: 16px;

    &.has-content {
      padding-right: 10px;
    }
  }

  .tr-chat-input-actions-group {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 12px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .tr-chat-input-utility-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tr-chat-input-submit-wrapper {
    display: flex;
    align-items: center;
  }
}

// 动画样式
.tr-slide-right-enter-active,
.tr-slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 0.69, 0.1, 1);
}

.tr-slide-right-enter-from,
.tr-slide-right-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
