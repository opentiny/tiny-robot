<script setup lang="ts">
import type { SenderProps, SenderEmits, SenderSlots } from './index.type'
import { useSenderCore } from './composables/useSenderCore'
import SingleLineLayout from './components/layouts/SingleLineLayout.vue'
import MultiLineLayout from './components/layouts/MultiLineLayout.vue'

const props = withDefaults(defineProps<SenderProps>(), {
  placeholder: '请输入内容...',
  mode: 'single',
  size: 'normal',
  submitType: 'enter',
  enterkeyhint: 'send',
  hasExternalContent: false,
  extensions: () => [],
  autoSize: () => ({ minRows: 1, maxRows: 5 }),
})

export type SenderPropsWithDefaults = typeof props

const emit = defineEmits<SenderEmits>()

defineSlots<SenderSlots>()

const { context, expose } = useSenderCore(props, emit)

defineExpose(expose)
</script>

<template>
  <div
    :class="[
      'tr-sender',
      `tr-sender--${context.mode.value}`,
      `tr-sender--${context.size.value}`,
      {
        'is-auto-switching': context.isAutoSwitching.value,
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
      <template v-if="$slots['actions-inline']" #actions-inline="slotProps">
        <slot name="actions-inline" v-bind="slotProps" />
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
      <template v-if="$slots.footer" #footer="slotProps">
        <slot name="footer" v-bind="slotProps" />
      </template>
      <template v-if="$slots['footer-right']" #footer-right="slotProps">
        <slot name="footer-right" v-bind="slotProps" />
      </template>
    </MultiLineLayout>
  </div>
</template>

<style lang="less" scoped>
.tr-sender {
  display: flex;
  flex-direction: column;
  background-color: var(--tr-sender-bg-color);
  border-radius: var(--tr-sender-border-radius);
  box-shadow: var(--tr-sender-box-shadow);
  transition: box-shadow var(--tr-sender-transition-duration);

  // 禁用状态样式
  &.is-disabled {
    background-color: var(--tr-sender-bg-color-disabled);
    cursor: not-allowed;
    box-shadow: none;

    :deep(.ProseMirror) {
      cursor: not-allowed;
      pointer-events: none;
      -webkit-text-fill-color: var(--tr-sender-text-color-disabled);
      color: var(--tr-sender-text-color-disabled);
      opacity: 1;

      &.is-empty::before {
        -webkit-text-fill-color: var(--tr-sender-placeholder-color-disabled);
        color: var(--tr-sender-placeholder-color-disabled);
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
:deep(.tr-sender-editor-content) {
  .ProseMirror {
    transition: height 0.2s ease;
    overflow-y: auto;
    overflow-x: hidden;

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
