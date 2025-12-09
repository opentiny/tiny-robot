<template>
  <div style="padding: 0 16px">
    <div>
      <input id="use-markdown-renderer" type="checkbox" v-model="useMarkdownRenderer" style="margin-right: 14px" />
      <label for="use-markdown-renderer">使用Markdown渲染器</label>
    </div>
    <div>
      <input id="enable-html-in-markdown" type="checkbox" v-model="enableHtmlInMarkdown" style="margin-right: 14px" />
      <label for="enable-html-in-markdown">启用HTML标签</label>
    </div>
    <Divider />
    <div>
      <input
        id="all-selection"
        type="checkbox"
        v-model="allSelection"
        :indeterminate="isIndeterminate"
        style="margin-right: 14px"
      />
      <label for="all-selection">全选</label>
    </div>
  </div>
  <BubbleProvider :content-renderer-matches="contentRendererMatches" :initial-store="bubbleStore">
    <BubbleList class="bubble-list" :messages="messages" :role-configs="roleConfigs" :split-polymorphic="true">
      <template #prefix="slotProps">
        <input
          class="checkbox"
          type="checkbox"
          :checked="isIndexesSelected(slotProps.messageIndexes)"
          @change="toggleIndexes(slotProps.messageIndexes)"
        />
        <div class="selected-background" :class="{ active: isIndexesSelected(slotProps.messageIndexes) }"></div>
      </template>
    </BubbleList>
  </BubbleProvider>
</template>

<script setup lang="ts">
import {
  BubbleList,
  BubbleMarkdownRenderer,
  BubbleProvider,
  type BubbleContentRendererMatch,
  type BubbleMessage,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { computed, h, markRaw, reactive, ref, watchEffect } from 'vue'
import Avatar from './Avatar.vue'

const Divider = h('hr', { style: { width: '100%', border: 'none', borderTop: '1px solid #ddd', marginBlock: '16px' } })

const rawContent = `二进制中1+1的结果是10。`

const rawReasoningContent = `首先，用户的问题是：“二进制中1+1的结果是多少，请给出简要回答”。这是一个关于二进制加法的问题。

在二进制系统中，只有两个数字：0和1。当我们将1和1相加时，根据二进制加法规则，1 + 1等于10。这是因为在二进制中，1 + 1产生一个进位，所以结果为0，并进位1，因此写作10。

所以，二进制中1+1的结果是10。

用户要求简要回答，所以我应该直接给出答案，不需要过多解释。

最终回答：二进制中1+1的结果是10。`

const reasoningMessage = {
  role: 'assistant',
  content: rawContent,
  reasoning_content: rawReasoningContent,
  extras: {
    thinking: false,
    open: true,
  },
}

const useMarkdownRenderer = ref(false)
const bubbleStore = reactive({ mdConfig: { html: false } })

const enableHtmlInMarkdown = computed({
  get() {
    return bubbleStore.mdConfig.html
  },
  set(value) {
    bubbleStore.mdConfig.html = value
  },
})

const contentRendererMatches = computed<BubbleContentRendererMatch[]>(() => {
  if (!useMarkdownRenderer.value) {
    return []
  }

  return [
    {
      find: (message) => message.role === 'assistant',
      renderer: markRaw(BubbleMarkdownRenderer),
      priority: 30,
    },
  ]
})

const messages = computed(() => {
  const msgs: BubbleMessage[] = [
    { role: 'system', content: '你是一个数学老师，擅长计算和解答数学问题。' },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Hello' },
        { type: 'image_url', image_url: 'https://picsum.photos/400' },
      ],
    },
    {
      role: 'user',
      content: '帮我同时计算两个算式\n1. 4+4\n2. 4x4',
    },
    {
      role: 'assistant',
      content: '我来帮您同时计算这两个算式。',
      tool_calls: [
        {
          id: 'call_00_wy0r2VgGNvzUp1tIfCfSnGPO',
          type: 'function',
          function: { name: 'add', arguments: '{"a": 4, "b": 4}' },
        },
        {
          id: 'call_01_ZaQqGi3jCXr1iJ308Yu1hJkj',
          type: 'function',
          function: { name: 'multiply', arguments: '{"a": 4, "b": 4}' },
        },
      ],
    },
    {
      role: 'tool',
      tool_call_id: 'call_00_wy0r2VgGNvzUp1tIfCfSnGPO',
      content: '{"type":"text","text":"8"}',
    },
    {
      role: 'tool',
      tool_call_id: 'call_01_ZaQqGi3jCXr1iJ308Yu1hJkj',
      content: '{"type":"text","text":"16"}',
    },
    {
      role: 'assistant',
      content:
        '计算结果如下：\n\n1. 4 + 4 = 8\n2. 4 × 4 = 16\n\n两个算式的结果分别是 8 和 16。<strong>注意：这是一个测试</strong>',
    },
    {
      role: 'user',
      content: '二进制中1+1的结果是多少，请给出简要回答',
    },
  ]

  return msgs.concat(reasoningMessage)
})

const roleConfigs: Record<string, BubbleRoleConfig> = {
  system: {
    hidden: true,
  },
  user: {
    avatar: Avatar,
    placement: 'end',
    shape: 'rounded',
  },
  assistant: {
    placement: 'start',
    shape: 'none',
  },
}

const selection = ref<number[]>([])

// Check if all indexes in the array are selected
const isIndexesSelected = (indexes: number[]): boolean => {
  return indexes.length > 0 && indexes.every((index) => selection.value.includes(index))
}

// Toggle selection for all indexes in the array
const toggleIndexes = (indexes: number[]) => {
  const allSelected = isIndexesSelected(indexes)
  if (allSelected) {
    // Remove all indexes from selection
    selection.value = selection.value.filter((index) => !indexes.includes(index))
  } else {
    // Add all indexes to selection (avoid duplicates)
    const newIndexes = indexes.filter((index) => !selection.value.includes(index))
    selection.value = [...selection.value, ...newIndexes]
  }
}

const allSelection = computed({
  get() {
    return selection.value.length === messages.value.length
  },
  set(value) {
    if (value) {
      selection.value = messages.value.map((_, index) => index)
    } else {
      selection.value = []
    }
  },
})

const isIndeterminate = computed(() => {
  return selection.value.length > 0 && selection.value.length < messages.value.length
})

const selectedMessages = computed(() => {
  return selection.value.map((index) => messages.value[index])
})

watchEffect(() => {
  console.log(selectedMessages.value)
})
</script>

<style lang="less" scoped>
.bubble-list {
  :deep([data-role='user']) {
    --tr-bubble-box-bg: #f0f0f0;
  }

  :deep([data-role]:not([data-role='user'])) {
    --tr-bubble-box-bg: transparent;
    --tr-bubble-box-padding: 8px 0;
  }

  :deep(.tr-bubble) {
    position: relative;
  }
}

.checkbox {
  margin-top: 14px;
  margin-right: 14px;
}

.selected-background {
  position: absolute;
  pointer-events: none;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  border-radius: 4px;
  margin: -4px;
  z-index: -1;
  transition: background-color 0.3s ease;
  background-color: transparent;

  &.active {
    background-color: color-mix(in srgb, var(--tr-color-primary-light) 80%, transparent);
  }
}
</style>
