<script setup lang="ts">
import { IconAi, IconPlugin, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { computed, h, isVNode } from 'vue'
import Welcome from '../../welcome'
import type { ChatPromptItem, ChatWelcomeIcon } from '../index.type'

const props = defineProps<{
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

const defaultPromptItems: ChatPromptItem[] = [
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
]

const promptItems = computed(() => (props.promptItems?.length ? props.promptItems : defaultPromptItems))
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
        <component :is="item.icon" v-if="item.icon" :size="18" class="tr-chat-welcome__prompt-icon" />
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
  gap: 20px;
  padding: 12px 0 8px;
}

.tr-chat-welcome__hero {
  justify-content: center;

  &.tr-welcome {
    --title-color: var(--tr-text-primary);
    --description-color: var(--tr-text-secondary);
  }
}

.tr-chat-welcome__prompt-grid {
  display: grid;
  gap: 12px;
}

.tr-chat-welcome__prompt-card {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-lg);
  background: var(--tr-container-bg-default);
  color: inherit;
  display: grid;
  gap: 6px;
  text-align: left;
  cursor: pointer;
}

.tr-chat-welcome__prompt-card:hover {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
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
</style>
