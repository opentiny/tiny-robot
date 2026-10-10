<script setup lang="ts">
import { computed } from 'vue'
import { TrChat, type ChatHistoryData, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const groups = ['置顶', '昨天', '30天内']
const initialConversations = [
  { title: '初次问候与自我介绍', group: '置顶' },
  { title: 'square-pen 含义解释', group: '昨天' },
  { title: '浏览器 Agent 视觉操作优化', group: '30天内' },
  { title: 'VSCode 重启 TS 服务快捷键', group: '30天内' },
  { title: '如何制定英语学习计划', group: '30天内' },
]
const runtime = useChatCaseRuntime({
  storageKey: 'tiny-robot-demo-history-groups-v1',
  initialConversations: initialConversations.map(({ title, group }) => ({
    title,
    metadata: { group },
    messages: [
      { role: 'user', content: title },
      { role: 'assistant', content: `这是“${title}”的示例回答。切换左侧会话，可查看对应的消息。` },
    ],
  })),
})

const historyData = computed<ChatHistoryData>(() =>
  groups
    .map((group) => ({
      group,
      items: runtime.conversations.value.filter((item) => (item.metadata?.group ?? '30天内') === group),
    }))
    .filter(({ items }) => items.length > 0),
)

const ui: ChatUIOptions = {
  layout: { leftAside: { width: 260, defaultOpen: true } },
  history: { showRenameControls: true },
}
</script>

<template>
  <section class="history-groups-demo">
    <p class="history-groups-demo__tip">
      展开会话列表后，可切换、重命名或删除会话。分组为预设示例，不包含自动日期归类或置顶操作；新会话显示在“30天内”。
    </p>
    <div class="history-groups-demo__chat">
      <TrChat :runtime="runtime" :ui="ui" :history-data="historyData" />
    </div>
  </section>
</template>

<style scoped>
.history-groups-demo__tip {
  margin: 0 0 12px;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.history-groups-demo__chat {
  --tr-layout-height: 100%;
  --tr-history-group-space-y: 14px;
  --tr-history-group-title-font-size: 12px;
  --tr-history-group-title-line-height: 18px;
  --tr-history-group-title-padding: 0 8px 6px;
  --tr-history-group-title-color: var(--tr-text-tertiary);
  --tr-history-item-padding: 7px 8px;
  --tr-history-item-padding-editing: 7px 8px;
  --tr-history-item-border-radius: 8px;
  --tr-history-item-space-y: 2px;
  --tr-history-item-selected-bg: #e4edfd;
  --tr-history-item-selected-color: #3964fe;
  height: 600px;
}

.history-groups-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
