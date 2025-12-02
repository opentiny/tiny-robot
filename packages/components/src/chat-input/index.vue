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
  submitType: 'enter',
  extensions: () => [],
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
      {
        'is-auto-switching': context.isAutoSwitching.value,
        'is-over-limit': context.isOverLimit.value,
        'is-disabled': context.disabled.value,
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

  // 禁用状态样式
  &.is-disabled {
    background-color: var(--tr-chat-input-bg-color-disabled);
    cursor: not-allowed;
    box-shadow: none;

    :deep(.ProseMirror) {
      cursor: not-allowed;
      pointer-events: none;
      -webkit-text-fill-color: var(--tr-chat-input-text-color-disabled);
      color: var(--tr-chat-input-text-color-disabled);
      opacity: 1;

      &.is-empty::before {
        -webkit-text-fill-color: var(--tr-chat-input-placeholder-color-disabled);
        color: var(--tr-chat-input-placeholder-color-disabled);
        opacity: 1;
      }
    }
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
