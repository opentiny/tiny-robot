<script setup lang="ts">
import { useTheme, useToolCall, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { IconCancelled, IconError, IconLoading, IconPlugin } from '@opentiny/tiny-robot-svgs'
import { MarkdownCodeBlockNode } from 'markstream-vue'
import { computed, reactive, useAttrs, watchEffect, type Component } from 'vue'
import { useResolvedChatMessages } from '@/shared/messages'

const props = defineProps<BubbleContentRendererProps & { toolCallIndex: number }>()

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const { toolCall, toolCallWithResult, state } = useToolCall(props)
const chatMessages = useResolvedChatMessages()

const node = reactive({
  type: 'code_block' as const,
  language: 'json',
  code: '',
  raw: '',
})

watchEffect(() => {
  const code = JSON.stringify(toolCallWithResult.value, null, 2)

  node.code = code
  node.raw = code
})

const { resolvedColorMode } = useTheme()
const isDarkMode = computed(() => resolvedColorMode?.value === 'dark')

const textAndIcon = computed(() => {
  const textAndIconMap = new Map<string, { text: string; icon: Component }>([
    ['running', { text: chatMessages.value.toolCall.running, icon: IconLoading }],
    ['success', { text: chatMessages.value.toolCall.success, icon: IconPlugin }],
    ['failed', { text: chatMessages.value.toolCall.failed, icon: IconError }],
    ['cancelled', { text: chatMessages.value.toolCall.cancelled, icon: IconCancelled }],
  ])

  return textAndIconMap.get(state.value?.status || '') || { text: '', icon: IconPlugin }
})
</script>

<template>
  <div class="markstream-vue" v-bind="attrs">
    <MarkdownCodeBlockNode :node="node" :stream="true" :is-dark="isDarkMode" :showFontSizeButtons="false">
      <template #header-left>
        <div class="header-left">
          <component :is="textAndIcon.icon" class="header-icon" :class="`icon-${state.status}`" />
          <span>
            <span>{{ textAndIcon.text }}&nbsp;</span>
            <span class="title">{{ toolCall?.function.name || chatMessages.toolCall.untitled }} </span>
          </span>
        </div>
      </template>
    </MarkdownCodeBlockNode>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__box .markstream-vue:first-child > * {
  margin-top: 0;
}

.markstream-vue {
  :deep(pre),
  :deep(code) {
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    max-width: 100%;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-size: 14px;

  .title {
    color: var(--tr-text-primary);
    font-weight: 600;
  }

  .header-icon {
    font-size: 20px;
    flex-shrink: 0;

    &.icon-running {
      color: var(--chat-icon-muted);
      animation: spin 1s linear infinite;
    }

    &.icon-success {
      color: var(--chat-icon-muted);
    }

    &.icon-failed,
    &.icon-cancelled {
      color: var(--tr-color-error);
    }
  }
}
</style>
