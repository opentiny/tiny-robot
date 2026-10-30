<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  TrChatUI,
  type ChatBubbleRenderers,
  type ChatRenderers,
  type ChatUIData,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const initialData: ChatUIData = {
  conversation: { activeId: 'v1', title: '属性版本一' },
  bubble: { messages: [{ role: 'assistant', content: '属性版本一' }] },
  sender: { loading: false },
}
const initialUI: ChatUIOptions = { layout: { leftAside: false, rightAside: false }, welcome: false }
const data = shallowRef<ChatUIData>(initialData)
const ui = shallowRef<ChatUIOptions>(initialUI)
const renderers = shallowRef<ChatRenderers>()
const bubbleRenderers = shallowRef<ChatBubbleRenderers>()
const status = shallowRef('等待操作')

function mutateNested() {
  ;(data.value.conversation as { title?: string }).title = '嵌套修改不应显示'
  status.value = '嵌套修改未触发渲染（符合 shallow property 契约）'
}

function replaceAll() {
  data.value = {
    conversation: { activeId: 'v2', title: '属性版本二' },
    bubble: { messages: [{ role: 'assistant', content: [{ type: 'property-card', text: '结构化卡片 v2' }] }] },
    sender: { loading: false },
  }
  ui.value = { layout: { leftAside: false, rightAside: false, contentMaxWidth: 680 }, welcome: false }
  renderers.value = {
    'layout-header': () => {
      const header = document.createElement('div')
      header.className = 'complex-properties-demo__header'
      const rendererLabel = document.createElement('strong')
      rendererLabel.textContent = 'DOM Header v2'
      const title = document.createElement('span')
      title.textContent = '属性版本二'
      header.append(rendererLabel, title)
      return header
    },
  }
  bubbleRenderers.value = {
    contentRendererMatches: [
      {
        find: (_message, content) => content.type === 'property-card',
        renderer: (context) => {
          const card = document.createElement('article')
          card.className = 'complex-properties-demo__card'
          card.textContent = String(context.content.text)
          return card
        },
      },
    ],
  }
  status.value = '整体重新赋值已应用'
}

function restore() {
  data.value = { ...initialData, conversation: { ...initialData.conversation, title: '属性版本一' } }
  ui.value = initialUI
  renderers.value = undefined
  bubbleRenderers.value = undefined
  status.value = '已恢复初始 property'
}
</script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <button class="runtime-demo__button" type="button" @click="mutateNested">嵌套修改</button>
      <button class="runtime-demo__button" type="button" @click="replaceAll">整体替换</button>
      <button class="runtime-demo__button" type="button" @click="restore">恢复初始</button>
    </div>
    <p class="runtime-demo__status" role="status">{{ status }}</p>
    <div class="runtime-demo__chat">
      <TrChatUI :data="data" :ui="ui" :renderers="renderers" :bubble-renderers="bubbleRenderers" />
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>

<style scoped>
:deep(.complex-properties-demo__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 20px;
  border-bottom: 1px solid #dfe5ef;
  background: #f7f9fc;
}

:deep(.complex-properties-demo__card) {
  padding: 12px 16px;
  border: 1px solid #9eb8ff;
  border-radius: 10px;
  background: #eef4ff;
  color: #1f4fa3;
}
</style>
