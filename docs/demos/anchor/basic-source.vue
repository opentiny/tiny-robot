<template>
  <section class="demo">
    <div class="controls">
      <span>展开模式</span>

      <label>
        <input v-model="expandTrigger" type="radio" value="hover" />
        hover
      </label>

      <label>
        <input v-model="expandTrigger" type="radio" value="manual" />
        manual
      </label>

      <template v-if="isManualMode">
        <label>
          <input v-model="expanded" type="checkbox" />
          展开目录面板
        </label>

        <button type="button" @click="expanded = false">收起</button>
        <button type="button" @click="expanded = true">展开</button>
      </template>
    </div>

    <p class="tip">
      <template v-if="isManualMode">
        当前为 <code>manual</code> 模式，目录面板不再跟随 hover 自动展开，改由外部 <code>v-model:expanded</code> 控制。
      </template>
      <template v-else> 当前为 <code>hover</code> 模式，鼠标悬浮或聚焦到目录面板时会自动展开。 </template>
    </p>

    <div class="stage">
      <div ref="scrollContainerRef" class="article">
        <section v-for="section in sections" :key="section.id" :data-anchor-id="section.id" class="article-section">
          <h4>{{ section.label }}</h4>
          <p>{{ section.content }}</p>
        </section>
      </div>

      <tr-anchor
        class="nav"
        :items="items"
        :scroll-container="scrollContainerRef"
        :active-offset="20"
        :expand-trigger="expandTrigger"
        v-model:expanded="expanded"
        :search-options="{ placeholder: '搜索章节' }"
        target-feedback-class="article-section--active"
        :target-feedback-duration="1800"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrAnchor } from '@opentiny/tiny-robot'
import { basicSourceMessages } from './basic-source.messages'

function isUserMessage(
  message: (typeof basicSourceMessages)[number],
): message is (typeof basicSourceMessages)[number] & { role: 'user' } {
  return message.role === 'user'
}

const scrollContainerRef = ref<HTMLElement | null>(null)
const expandTrigger = ref<'hover' | 'manual'>('hover')
const expanded = ref(false)
const isManualMode = computed(() => expandTrigger.value === 'manual')
const messages = basicSourceMessages
const userMessages = messages.filter(isUserMessage)
const messageById = new Map(messages.map((message) => [message.id, message]))

const sections = userMessages.map((message) => {
  const assistantReply = messageById.get(`assistant-${message.id}`)

  return {
    id: message.id,
    label: message.content,
    content: String(assistantReply?.content ?? ''),
  }
})

const items = sections.map((section) => ({
  id: section.id,
  label: section.label,
  searchText: `${section.label} ${section.content}`,
}))
</script>

<style scoped src="./demo-shell.css"></style>

<style scoped>
.demo {
  --anchor-demo-gap: 14px;
  --anchor-demo-controls-gap: 10px 12px;
}

.tip {
  margin: 0;
  color: var(--tr-text-secondary);
  line-height: 1.5;
}

.article {
  display: grid;
  gap: 16px;
  height: 100%;
  overflow: auto;
  padding: 24px 28px;
}

.article-section {
  padding: 20px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  color: var(--tr-text-secondary);
  scroll-margin-top: 16px;
}

.article-section--active {
  animation: section-active 1.4s ease-out !important;
}

@keyframes section-active {
  0%,
  25% {
    background-color: #b9d7ff;
  }
  45% {
    background-color: var(--vp-c-bg);
  }
  65%,
  85% {
    background-color: #b9d7ff;
  }
  100% {
    background-color: var(--vp-c-bg);
  }
}

.article-section h4,
.article-section p {
  margin: 0;
}

.article-section h4 {
  font-size: 18px;
  line-height: 1.4;
}

.article-section p {
  white-space: pre-line;
}

.nav {
  top: 0;
  right: 16px;
}
</style>
