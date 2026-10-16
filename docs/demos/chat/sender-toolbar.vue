<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChat, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { IconGenerativeUi } from '@opentiny/tiny-robot-svgs'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const modelFirst = shallowRef(true)
const searchVisible = shallowRef(true)
const searchDisabled = shallowRef(false)
const narrowPreview = shallowRef(false)
const guiEnabled = shallowRef(false)
const runtime = useChatCaseRuntime({})
const ui = computed<ChatUIOptions>(() => ({
  layout: { leftAside: false },
  welcome: { title: '工具栏配置', description: '调整输入区左侧按钮的顺序、可见性和禁用状态。' },
  sender: {
    toolbar: (defaults, { isNarrow }) => [
      ...(modelFirst.value
        ? [...defaults.filter((item) => item.id === 'model'), ...defaults.filter((item) => item.id !== 'model')]
        : defaults
      ).map((item) =>
        item.id === 'search' ? { ...item, visible: searchVisible.value, disabled: searchDisabled.value } : item,
      ),
      {
        type: 'custom',
        id: 'gui',
        label: isNarrow ? undefined : '生成式 UI',
        icon: IconGenerativeUi,
        active: guiEnabled.value,
        onClick: () => {
          guiEnabled.value = !guiEnabled.value
        },
      },
    ],
  },
}))
</script>

<template>
  <section class="sender-toolbar-demo">
    <div class="sender-toolbar-demo__controls">
      <label class="sender-toolbar-demo__control">
        <input v-model="modelFirst" type="checkbox" />
        模型选择器优先
      </label>
      <label class="sender-toolbar-demo__control">
        <input v-model="searchVisible" type="checkbox" />
        显示联网搜索（visible）
      </label>
      <label class="sender-toolbar-demo__control">
        <input v-model="searchDisabled" type="checkbox" />
        禁用联网搜索（disabled）
      </label>
      <label class="sender-toolbar-demo__control">
        <input v-model="narrowPreview" type="checkbox" />
        窄输入区预览（600px）
      </label>
    </div>

    <div class="sender-toolbar-demo__chat" :class="{ 'is-narrow-preview': narrowPreview }">
      <TrChat :runtime="runtime" :ui="ui" />
    </div>
  </section>
</template>

<style scoped>
.sender-toolbar-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.sender-toolbar-demo__chat {
  --tr-layout-height: 100%;
  height: 520px;
}

.sender-toolbar-demo__chat.is-narrow-preview {
  max-width: 600px;
}

.sender-toolbar-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
