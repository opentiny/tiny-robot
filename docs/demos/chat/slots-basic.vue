<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrChat, useChatRuntime } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'

const markedAnswers = shallowRef<string[]>([])
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    useMessageOptions: {
      initialMessages: [
        { role: 'assistant', content: '这个示例通过插槽自定义页头、添加消息按钮，并在输入框下方显示提示。' },
      ],
    },
  },
})

runtime.actions.createConversation({ title: '插槽定制' })

function answerKey(indexes: readonly number[]) {
  return `${runtime.activeConversation.value?.id}:${indexes.join(',')}`
}

function markAnswer(indexes: readonly number[]) {
  markedAnswers.value = [...markedAnswers.value, answerKey(indexes)]
}
</script>

<template>
  <section class="chat-slots-demo">
    <TrChat :runtime="runtime">
      <template #layout-header="{ title, isLeftAsideOpen, toggleLeftAside, createConversation }">
        <div class="chat-slots-demo__header">
          <button
            class="chat-slots-demo__button"
            type="button"
            :aria-expanded="isLeftAsideOpen"
            @click="toggleLeftAside"
          >
            {{ isLeftAsideOpen ? '收起会话列表' : '展开会话列表' }}
          </button>
          <strong class="chat-slots-demo__title">{{ title }}</strong>
          <button class="chat-slots-demo__button" type="button" @click="createConversation">新建会话</button>
        </div>
      </template>
      <template #bubble-content-footer="{ role, messageIndexes }">
        <button
          v-if="role === 'assistant'"
          class="chat-slots-demo__button chat-slots-demo__button--feedback"
          type="button"
          :disabled="markedAnswers.includes(answerKey(messageIndexes))"
          @click="markAnswer(messageIndexes)"
        >
          {{ markedAnswers.includes(answerKey(messageIndexes)) ? '已标记' : '有帮助' }}
        </button>
      </template>
      <template #composer-after>
        <p class="chat-slots-demo__tip">内容由 AI 生成，请仔细甄别。</p>
      </template>
    </TrChat>
  </section>
</template>

<style scoped>
.chat-slots-demo {
  --tr-layout-height: 100%;
  height: 600px;
}

.chat-slots-demo__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.chat-slots-demo__title {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.chat-slots-demo__button {
  min-height: 32px;
  padding: 4px 12px;
  border: 1px solid var(--tr-color-primary, #1476ff);
  border-radius: 6px;
  color: var(--tr-color-primary, #1476ff);
  background: var(--tr-container-bg-default, #fff);
  font: inherit;
  cursor: pointer;
}

.chat-slots-demo__button--feedback {
  margin-top: 8px;
}

.chat-slots-demo__button:disabled {
  color: var(--tr-text-secondary, #575d6c);
  border-color: var(--tr-color-border, #dcdfe6);
  cursor: default;
}

.chat-slots-demo__tip {
  margin: 8px 0 0;
  color: var(--tr-text-tertiary);
  font-size: 12px;
  line-height: 16px;
  text-align: center;
}

.chat-slots-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
