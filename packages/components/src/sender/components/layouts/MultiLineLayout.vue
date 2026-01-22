<script setup lang="ts">
import { useSenderContext } from '../../context'
import { useSlotScope } from '../../composables/useSlotScope'
import EditorContent from '../editor-content/index.vue'
import Footer from '../footer/index.vue'

const context = useSenderContext()
const slotScope = useSlotScope()
</script>

<template>
  <div class="tr-sender-multi-layout">
    <!-- Header 插槽 -->
    <div v-if="$slots.header" class="tr-sender-header">
      <slot name="header" />
    </div>

    <!-- 主输入行 -->
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

    <!-- 底部区域 -->
    <Footer>
      <template #footer>
        <slot name="footer" v-bind="slotScope" />
      </template>
      <template #footer-right>
        <slot name="footer-right" v-bind="slotScope" />
      </template>
    </Footer>
  </div>
</template>

<style lang="less" scoped>
.tr-sender-multi-layout {
  padding: 0;

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

  .tr-sender-main {
    display: flex;
    align-items: flex-start;
    padding: var(--tr-sender-multi-main-padding);
  }

  .tr-sender-prefix {
    flex-shrink: 0;
    padding-left: 0;
    padding-right: var(--tr-sender-prefix-padding-right);
  }

  .tr-sender-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: flex-start;
    padding-left: 0;

    :deep(.ProseMirror) {
      width: 100%;
      white-space: pre-wrap;
      word-break: break-all;
      min-height: var(--tr-sender-line-height, 26px);
    }
  }
}
</style>
