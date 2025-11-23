<template>
  <div class="tr-chat-input-multi-layout">
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
    </div>

    <!-- 底部区域 -->
    <Footer>
      <template #footer>
        <slot name="footer" />
      </template>
      <template #footer-right>
        <slot name="footer-right" />
      </template>
    </Footer>
  </div>
</template>

<script setup lang="ts">
import { useChatInputContext } from '../../context'
import EditorContent from '../editor-content/index.vue'
import Footer from '../footer/index.vue'

const context = useChatInputContext()
</script>

<style lang="less" scoped>
.tr-chat-input-multi-layout {
  padding: 0;

  .tr-chat-input-header {
    margin-bottom: 12px;
    padding: 15px 20px 0;
  }

  .tr-chat-input-main {
    display: flex;
    align-items: flex-start;
    padding: 16px 20px 12px;
  }

  .tr-chat-input-prefix {
    flex-shrink: 0;
    padding-left: 0;
  }

  .tr-chat-input-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding-left: 0;

    :deep(.ProseMirror) {
      white-space: pre-wrap;
      overflow-y: auto;
      word-break: break-all;
      min-height: var(--tr-chat-input-line-height, 26px);
    }
  }
}
</style>
