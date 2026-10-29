<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrChat, useChatRuntime, type ChatMcpServers } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import BusinessRightAside from './business-right-aside.vue'
import { modelProviders } from './shared/modelProviders'

const mcpServers: ChatMcpServers = [
  {
    id: 'project-knowledge',
    name: '项目知识库',
    description: '检索需求、设计和项目约定。',
    baseUrl: `${import.meta.env.BASE_URL}api/mcp/project-knowledge`,
    installed: true,
  },
  {
    id: 'release-calendar',
    name: '发布日历',
    description: '查询发布窗口和冻结时间。',
    baseUrl: `${import.meta.env.BASE_URL}api/mcp/release-calendar`,
    installed: true,
  },
]

const rightAsideOpen = shallowRef(true)
const activeRightAsidePanelId = shallowRef<string | undefined>('preview')

const runtime = useChatRuntime({
  modelProviders,
  mcpServers,
  conversation: {
    useMessageOptions: {
      initialMessages: [
        {
          role: 'assistant',
          content: '发布方案已整理完成。你可以打开右侧预览，或查看引用资料。',
        },
      ],
    },
  },
})

runtime.actions.createConversation({ title: '发布方案协作' })

function openPanel(panelId: 'preview' | 'sources') {
  activeRightAsidePanelId.value = panelId
  rightAsideOpen.value = true
}
</script>

<template>
  <section class="chat-workbench">
    <TrChat
      class="chat-workbench__chat"
      :runtime="runtime"
      :ui="{
        layout: {
          rightAside: {
            width: 344,
            resizable: true,
            minWidth: 300,
            maxWidth: 480,
            panels: [
              { id: 'preview', title: '发布方案预览' },
              { id: 'sources', title: '引用资料' },
            ],
          },
        },
      }"
      :right-aside-open="rightAsideOpen"
      :active-right-aside-panel-id="activeRightAsidePanelId"
      @update:right-aside-open="rightAsideOpen = $event"
      @update:active-right-aside-panel-id="activeRightAsidePanelId = $event"
    >
      <template #bubble-content-footer="{ role, messageIndexes }">
        <div v-if="role === 'assistant' && messageIndexes.includes(0)" class="message-actions">
          <button class="message-actions__button" type="button" @click="openPanel('preview')">查看发布方案</button>
          <button class="message-actions__button" type="button" @click="openPanel('sources')">查看引用资料</button>
        </div>
      </template>

      <template #layout-right-aside-panel="{ panelId }">
        <BusinessRightAside :panel-id="panelId" @open-panel="openPanel" />
      </template>
    </TrChat>
  </section>
</template>

<style scoped>
.chat-workbench {
  --tr-layout-height: 100%;
  height: min(700px, calc(100vh - 240px));
  min-height: 480px;
}

.chat-workbench__chat {
  height: 100%;
}

.message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.message-actions__button {
  border: 1px solid #c8d6e6;
  border-radius: 8px;
  color: #27567e;
  background: #fff;
  cursor: pointer;
  font: inherit;
}

.message-actions__button {
  padding: 6px 10px;
  font-size: 13px;
}

.message-actions__button:hover {
  border-color: #5d8db7;
  background: #f1f7fc;
}

:deep(h2.chat-right-aside-title) {
  padding: 0;
  border-top: none;
}

:deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .chat-workbench {
    height: 620px;
  }
}
</style>
