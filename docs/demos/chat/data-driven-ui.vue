<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type DataSnapshot = 'new' | 'active' | 'tools'

const snapshot = shallowRef<DataSnapshot>('new')
const inputValue = shallowRef('')

const snapshots = {
  new: {
    conversation: {
      items: [],
      activeId: null,
      title: '新会话',
    },
    bubble: { messages: [] },
    sender: { loading: false, disabled: false, submitDisabled: true },
    model: {
      options: [{ id: 'assistant', label: '通用助手', description: '适合日常问答' }],
      selectedId: 'assistant',
    },
    request: { state: 'idle' },
  },
  active: {
    conversation: {
      items: [
        { id: 'release', title: '发布检查清单', updatedAt: 1_726_041_600_000 },
        { id: 'weekly', title: '周报提炼', updatedAt: 1_725_436_800_000 },
      ],
      activeId: 'release',
      title: '发布检查清单',
    },
    bubble: {
      messages: [
        { id: 'question', role: 'user', content: '请给出上线前最需要确认的三件事。' },
        {
          id: 'answer',
          role: 'assistant',
          content: '优先确认回归结果、变更范围和回滚方案，并为每一项指定负责人。',
        },
      ],
    },
    sender: { loading: false, disabled: false, submitDisabled: true },
    model: {
      options: [
        { id: 'assistant', label: '通用助手', description: '适合日常问答' },
        { id: 'reasoner', label: '分析模型', description: '适合复杂推理' },
      ],
      selectedId: 'reasoner',
    },
    request: { state: 'completed' },
  },
  tools: {
    conversation: {
      items: [{ id: 'issue-review', title: '缺陷复盘', updatedAt: 1_726_041_600_000 }],
      activeId: 'issue-review',
      title: '缺陷复盘',
    },
    bubble: {
      messages: [
        { id: 'question', role: 'user', content: '整理最近的缺陷并按模块归类。' },
        {
          id: 'tool-call',
          role: 'assistant',
          content: '我先读取最近的缺陷记录。',
          tool_calls: [
            {
              id: 'call-list-issues',
              type: 'function',
              function: { name: '读取缺陷', arguments: '{"project":"TinyRobot","limit":20}' },
            },
          ],
          state: {
            toolCall: {
              'call-list-issues': { status: 'success', description: '已读取最近 20 条缺陷' },
            },
          },
        },
        {
          id: 'tool-result',
          role: 'tool',
          tool_call_id: 'call-list-issues',
          name: '读取缺陷',
          content: '{"count":20,"modules":["对话框架","Runtime","MCP"]}',
        },
        {
          id: 'answer',
          role: 'assistant',
          content: '已读取 20 条缺陷，可以按对话框架、Runtime 和 MCP 继续归类。',
        },
      ],
    },
    sender: { loading: false, disabled: false, submitDisabled: true },
    model: {
      options: [{ id: 'assistant', label: '通用助手', description: '支持工具调用' }],
      selectedId: 'assistant',
      features: { search: true },
    },
    mcp: {
      servers: [
        {
          id: 'issues',
          name: '缺陷管理',
          description: '读取项目缺陷与处理记录',
          installed: true,
          enabled: true,
        },
      ],
      tools: {
        issues: [{ id: 'list-issues', name: '读取缺陷', description: '查询指定项目的缺陷', enabled: true }],
      },
    },
    request: { state: 'idle' },
  },
} satisfies Record<DataSnapshot, ChatUIData>

const data = computed<ChatUIData>(() => snapshots[snapshot.value])

const snapshotOptions: Array<{ id: DataSnapshot; label: string }> = [
  { id: 'new', label: '新会话' },
  { id: 'active', label: '进行中的会话' },
  { id: 'tools', label: '启用工具的会话' },
]
</script>

<template>
  <section class="chat-data-demo">
    <div class="chat-data-demo__toolbar">
      <span>选择数据快照：</span>
      <button
        v-for="item in snapshotOptions"
        :key="item.id"
        type="button"
        :class="{ 'is-active': snapshot === item.id }"
        :aria-pressed="snapshot === item.id"
        @click="snapshot = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <p class="chat-data-demo__hint">当前示例只演示数据映射，因此输入可编辑，但不会发起请求。</p>

    <TrChatUI :data="data" :input-value="inputValue" @update:input-value="inputValue = $event" />
  </section>
</template>

<style scoped>
.chat-data-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  height: min(660px, calc(100vh - 200px));
  min-height: 520px;
}

.chat-data-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--tr-color-border, #e5e6eb);
  background: var(--tr-container-bg-default-2, #f7f8fa);
}

.chat-data-demo__toolbar span,
.chat-data-demo__hint {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.chat-data-demo__toolbar button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--tr-color-border, #dcdfe6);
  border-radius: 6px;
  color: var(--tr-text-primary, #252b3a);
  background: var(--tr-container-bg-default, #fff);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.chat-data-demo__toolbar button:hover {
  border-color: var(--tr-color-primary, #1476ff);
  color: var(--tr-color-primary, #1476ff);
}

.chat-data-demo__toolbar button.is-active {
  border-color: var(--tr-color-primary, #1476ff);
  color: #fff;
  background: var(--tr-color-primary, #1476ff);
}

.chat-data-demo__hint {
  margin: 0;
  padding: 8px 12px;
  border-bottom: 1px solid var(--tr-color-border, #e5e6eb);
}

.chat-data-demo :deep(.tr-chat-ui) {
  flex: 1;
  min-height: 0;
}

.chat-data-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
