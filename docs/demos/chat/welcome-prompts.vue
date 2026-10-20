<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrSender, type TemplateItem } from '@opentiny/tiny-robot'
import { TrChat, type ChatPromptClickPayload, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const showWelcome = shallowRef(true)
const showPrompts = shallowRef(true)
const inputTemplate = shallowRef<TemplateItem[]>([])
const extensions = [TrSender.template(inputTemplate)]
const runtime = useChatCaseRuntime({ storageKey: 'tiny-robot-demo-welcome-prompts-v1' })

const ui = computed<ChatUIOptions>(() => ({
  layout: { leftAside: false },
  welcome: showWelcome.value ? { title: '项目助手', description: '选择一个问题开始，或输入自己的问题。' } : false,
  prompts: showPrompts.value
    ? {
        wrap: true,
        items: [
          { id: 'code', label: '解释代码', description: '请解释这段代码的作用，并给出使用建议。' },
          { id: 'report', label: '撰写周报', description: '请帮我整理本周工作，生成一份简洁的周报。' },
          { id: 'plan', label: '制定学习计划', description: '请为 Vue 初学者制定一份两周学习计划。' },
        ],
      }
    : false,
  sender: { extensions },
}))

function handlePromptClick({ item }: ChatPromptClickPayload) {
  inputTemplate.value = [{ type: 'text', content: item.description || item.label }]
}

async function startNewConversation() {
  await runtime.actions.abort?.()
  await runtime.actions.clearActiveConversation()
  inputTemplate.value = []
}
</script>

<template>
  <section class="welcome-prompts-demo">
    <div class="welcome-prompts-demo__controls">
      <label><input v-model="showWelcome" type="checkbox" /> 显示欢迎区</label>
      <label><input v-model="showPrompts" type="checkbox" /> 显示推荐问题</label>
      <button class="welcome-prompts-demo__button" type="button" @click="startNewConversation">返回新会话</button>
    </div>
    <p class="welcome-prompts-demo__tip">点击推荐问题填入输入框，编辑后发送；返回新会话可再次查看欢迎区。</p>
    <div class="welcome-prompts-demo__chat">
      <TrChat :runtime="runtime" :ui="ui" @prompt-click="handlePromptClick" />
    </div>
  </section>
</template>

<style scoped>
.welcome-prompts-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.welcome-prompts-demo__button {
  min-height: 32px;
  padding: 4px 12px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 6px;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  font: inherit;
  cursor: pointer;
}

.welcome-prompts-demo__tip {
  margin: 12px 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.welcome-prompts-demo__chat {
  --tr-layout-height: 100%;
  height: 600px;
}

.welcome-prompts-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
