<script setup lang="ts">
import { ChatInputProps, ChatInputEmits } from './index.type'
import { useChatInputCore } from './composables/useChatInputCore'
import SingleLineLayout from './components/layouts/SingleLineLayout.vue'
import MultiLineLayout from './components/layouts/MultiLineLayout.vue'

const props = withDefaults(defineProps<ChatInputProps>(), {
  placeholder: '请输入内容...',
  disabled: false,
  loading: false,
  autofocus: false,
  mode: 'single',
  showWordLimit: false,
  clearable: false,
  allowSpeech: false,
  allowFiles: false,
  submitType: 'enter',
  theme: 'light',
})

const emit = defineEmits<ChatInputEmits>()

// 核心逻辑一键引入
const { context, expose } = useChatInputCore(props, emit)

// 暴露方法给父组件
defineExpose(expose)
</script>

<template>
  <div
    :class="[
      'tr-chat-input',
      `tr-chat-input--${context.mode.value}`,
      `tr-chat-input--${theme}`,
      {
        'is-auto-switching': context.isAutoSwitching.value,
        'is-over-limit': context.isOverLimit.value,
      },
    ]"
  >
    <!-- 布局分发 -->
    <SingleLineLayout v-if="context.mode.value === 'single'">
      <!-- 透传所有插槽 -->
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
      <template v-if="$slots.content" #content="slotProps">
        <slot name="content" v-bind="slotProps" />
      </template>
      <template v-if="$slots['actions-inline']" #actions-inline>
        <slot name="actions-inline" />
      </template>
    </SingleLineLayout>

    <MultiLineLayout v-else>
      <!-- 透传所有插槽 -->
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
      <template v-if="$slots.content" #content="slotProps">
        <slot name="content" v-bind="slotProps" />
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
      <template v-if="$slots['footer-right']" #footer-right>
        <slot name="footer-right" />
      </template>
    </MultiLineLayout>
  </div>
</template>

<style lang="less">
:root {
  // 基础颜色
  --tr-chat-input-bg-color: var(--tr-container-bg-default, #ffffff);
  --tr-chat-input-text-color: var(--tr-text-primary, #000000);
  --tr-chat-input-placeholder-color: var(--tr-text-tertiary, #999999);

  // 尺寸
  --tr-chat-input-font-size: 16px;
  --tr-chat-input-line-height: 26px;
  --tr-chat-input-min-height: 42px;
  --tr-chat-input-border-radius: 26px;

  // 间距
  --tr-chat-input-padding: 15px 20px;
  --tr-chat-input-gap: 8px;
  --tr-chat-input-footer-gap: 12px;

  // 按钮
  --tr-chat-input-button-size: 32px;
  --tr-chat-input-button-hover-bg: rgba(0, 0, 0, 0.08);
  --tr-chat-input-button-active-bg: rgba(0, 0, 0, 0.12);

  // 字数限制
  --tr-chat-input-word-limit-color: #808080;
  --tr-chat-input-word-limit-error-color: #f23030;

  // 阴影
  --tr-chat-input-box-shadow: 0 4px 16px 0px rgba(0, 0, 0, 0.08);

  // 动画
  --tr-chat-input-transition-duration: 0.2s;
}
</style>

<style lang="less" scoped>
.tr-chat-input {
  display: flex;
  flex-direction: column;
  background-color: var(--tr-chat-input-bg-color);
  border-radius: var(--tr-chat-input-border-radius);
  box-shadow: var(--tr-chat-input-box-shadow);
  transition: box-shadow var(--tr-chat-input-transition-duration);

  &:focus-within {
    box-shadow: 0 4px 16px 0px rgba(20, 118, 255, 0.15);
  }

  // 自动切换模式时的过渡动画
  &.is-auto-switching {
    :deep(.ProseMirror) {
      transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    }
  }
}

// 编辑器内容区域样式优化
:deep(.tr-chat-input-editor-content) {
  .ProseMirror {
    transition: height 0.2s ease;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>
