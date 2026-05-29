<script setup lang="ts">
import { IconAi, IconPlugin, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { computed, h, isVNode } from 'vue'
import Welcome from '../../welcome'
import type { ChatLang, ChatPromptItem, ChatWelcomeIcon } from '../index.type'

const props = defineProps<{
  lang: ChatLang
  title: string
  description: string
  icon?: ChatWelcomeIcon
  promptItems?: ChatPromptItem[]
}>()

const emit = defineEmits<{
  (e: 'submit', value: string): void
}>()

const welcomeIcon = computed(() => {
  if (!props.icon) {
    return h(IconAi, { style: { fontSize: '40px' } })
  }

  return isVNode(props.icon) ? props.icon : h(props.icon)
})

const defaultPromptItemsMap: Record<ChatLang, ChatPromptItem[]> = {
  'zh-CN': [
    {
      title: '规划任务',
      description: '把一个功能需求拆成简短的实施计划。',
      message: '帮我把一个功能需求拆解成实施计划。',
      icon: IconSparkles,
    },
    {
      title: '检查模型配置',
      description: '看看我的模型配置是否完整、是否有缺项。',
      message: '帮我检查当前模型配置，告诉我缺了什么。',
      icon: IconAi,
    },
    {
      title: '试用 MCP 工具',
      description: '触发一次真实工具调用，并在对话中查看返回结果。',
      message: '使用一个 MCP 工具查询最新的 Vue 3 发布说明。',
      icon: IconPlugin,
    },
  ],
  'en-US': [
    {
      title: 'Plan a task',
      description: 'Break down a feature request into a short implementation plan.',
      message: 'Help me break down a feature request into an implementation plan.',
      icon: IconSparkles,
    },
    {
      title: 'Review API config',
      description: 'Check whether my model configuration looks correct.',
      message: 'Review my model configuration and tell me what is missing.',
      icon: IconAi,
    },
    {
      title: 'Try MCP tools',
      description: 'Trigger a real tool call and inspect the returned result in chat.',
      message: 'Use an MCP tool to search for the latest Vue 3 release notes.',
      icon: IconPlugin,
    },
  ],
}

const promptItems = computed(() => (props.promptItems?.length ? props.promptItems : defaultPromptItemsMap[props.lang]))
</script>

<template>
  <section class="tr-chat-welcome">
    <Welcome :title="title" :description="description" :icon="welcomeIcon" class="tr-chat-welcome__hero" />

    <div class="tr-chat-welcome__prompt-grid">
      <button
        v-for="item in promptItems"
        :key="item.title"
        class="tr-chat-welcome__prompt-card"
        type="button"
        @click="emit('submit', item.message)"
      >
        <span v-if="item.icon" class="tr-chat-welcome__prompt-icon-shell">
          <component :is="item.icon" :size="18" class="tr-chat-welcome__prompt-icon" />
        </span>
        <span class="tr-chat-welcome__prompt-title">{{ item.title }}</span>
        <span class="tr-chat-welcome__prompt-description">{{ item.description }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped lang="less">
.tr-chat-welcome {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  padding: 16px 0 10px;
}

.tr-chat-welcome__hero {
  justify-content: center;
  max-width: 760px;
  margin: 0 auto;

  &.tr-welcome {
    --title-color: var(--tr-text-primary);
    --description-color: var(--tr-text-secondary);
    --title-font-size: clamp(32px, 4vw, 40px);
    --title-line-height: clamp(42px, 5vw, 56px);
    --description-font-size: clamp(16px, 2.4vw, 18px);
    --description-line-height: clamp(28px, 3vw, 32px);
    --description-font-weight: 500;
  }
}

.tr-chat-welcome__prompt-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
}

.tr-chat-welcome__prompt-card {
  width: 100%;
  min-height: 138px;
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-disabled) 82%, transparent);
  border-radius: 22px;
  background: var(--tr-container-bg-default);
  color: inherit;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.06),
    0 2px 6px rgba(15, 23, 42, 0.03);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.tr-chat-welcome__prompt-card:hover {
  border-color: color-mix(in srgb, var(--tr-color-primary) 22%, var(--tr-border-color-hover));
  background: var(--tr-container-bg-default-2);
  transform: translateY(-1px);
  box-shadow:
    0 16px 32px rgba(15, 23, 42, 0.08),
    0 4px 10px rgba(15, 23, 42, 0.04);
}

.tr-chat-welcome__prompt-icon-shell {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: var(--tr-container-bg-default-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tr-chat-welcome__prompt-icon {
  color: var(--tr-color-primary);
}

.tr-chat-welcome__prompt-title {
  font-size: var(--tr-font-size-md);
  font-weight: var(--tr-font-weight-semibold);
}

.tr-chat-welcome__prompt-description {
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
  line-height: 1.5;
}

@container (min-width: 720px) {
  .tr-chat-welcome__prompt-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (min-width: 1120px) {
  .tr-chat-welcome__prompt-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .tr-chat-welcome {
    gap: 18px;
    padding-top: 8px;
  }

  .tr-chat-welcome__prompt-card {
    min-height: 0;
    padding: 16px;
  }
}
</style>
