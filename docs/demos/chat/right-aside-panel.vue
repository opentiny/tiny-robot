<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { TrChat, useLocalChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const rightAsideOpen = shallowRef(true)
const activePanelId = shallowRef<string | undefined>('details')
const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    apiUrl: `${import.meta.env.BASE_URL}api`,
    models: [{ id: 'assistant', label: '应用助手' }],
  },
]
const runtime = useLocalChatRuntime({ modelProviders })
const ui = {
  layout: {
    rightAside: {
      width: 320,
      panels: [{ id: 'details', title: '会话详情' }],
    },
  },
}
</script>

<template>
  <TrTheme>
    <section class="right-aside-demo">
      <div class="right-aside-demo__actions">
        <button type="button" @click="rightAsideOpen = !rightAsideOpen">切换详情</button>
      </div>
      <tr-chat
        :runtime="runtime"
        :ui="ui"
        :right-aside-open="rightAsideOpen"
        :active-right-aside-panel-id="activePanelId"
        @update:right-aside-open="rightAsideOpen = $event"
        @update:active-right-aside-panel-id="activePanelId = $event"
      >
        <template #layout-right-aside-panel="{ panelId, closeRightAside }">
          <section v-if="panelId === 'details'" class="detail-panel">
            <h3>会话详情</h3>
            <p>这是应用注册的右侧面板。</p>
            <button type="button" @click="closeRightAside">关闭</button>
          </section>
        </template>
      </tr-chat>
    </section>
  </TrTheme>
</template>

<style scoped>
.right-aside-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  height: min(620px, calc(100vh - 240px));
  min-height: 480px;
}

.right-aside-demo__actions {
  padding: 8px;
}

.right-aside-demo :deep(.tr-chat-ui) {
  flex: 1;
  min-height: 0;
}

.right-aside-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-panel h2 {
  border-top: 0px;
  margin: 0px;
}
</style>
