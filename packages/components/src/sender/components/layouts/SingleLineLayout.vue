<script setup lang="ts">
import { useSenderContext } from '../../context'
import { useSlotScope } from '../../composables/useSlotScope'
import EditorContent from '../editor-content/index.vue'
import { DefaultActionButtons, WordCounter } from '../../../sender-actions/index'

const context = useSenderContext()
const slotScope = useSlotScope()
</script>

<template>
  <div class="tr-sender-single-layout">
    <!-- Header 插槽 -->
    <div v-if="$slots.header" class="tr-sender-header">
      <slot name="header" />
    </div>

    <!-- 输入区域容器 -->
    <div class="tr-sender-container">
      <!-- 主输入区（前缀 + 内容） -->
      <div class="tr-sender-main">
        <!-- Prefix 插槽 -->
        <div v-if="$slots.prefix" class="tr-sender-prefix">
          <slot name="prefix" />
        </div>

        <!-- 编辑器内容 -->
        <div class="tr-sender-content">
          <slot name="content" :editor="context.editor">
            <EditorContent />
          </slot>
        </div>
      </div>

      <!-- 单行模式操作按钮 -->
      <div :class="['tr-sender-actions-inline', { 'has-content': context.hasContent.value || context.loading.value }]">
        <WordCounter v-if="context.showWordLimit && context.maxLength" />
        <slot name="actions-inline" v-bind="slotScope" />
        <DefaultActionButtons />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-sender-single-layout {
  .tr-sender-header {
    position: relative;
    padding: var(--tr-sender-header-padding);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: var(--tr-sender-header-divider-inset);
      right: var(--tr-sender-header-divider-inset);
      height: 0;
      border-bottom: var(--tr-sender-header-border-bottom, none);
    }
  }

  .tr-sender-container {
    display: flex;
    align-items: center;
  }

  .tr-sender-main {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    padding: var(--tr-sender-padding);
  }

  .tr-sender-prefix {
    flex-shrink: 0;
    padding-right: var(--tr-sender-prefix-padding-right);
  }

  .tr-sender-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;

    :deep(.ProseMirror) {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .tr-sender-actions-inline {
    display: flex;
    gap: var(--tr-sender-gap);
    align-items: center;
    flex-shrink: 0;
    padding-right: var(--tr-sender-actions-padding-right);
  }
}
</style>
