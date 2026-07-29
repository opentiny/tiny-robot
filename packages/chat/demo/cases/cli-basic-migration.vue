<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BubbleRenderers, ThemeProvider as TrThemeProvider, TrIconButton, TrLayout } from '@opentiny/tiny-robot'
import { useMediaQuery } from '@vueuse/core'
import { localStorageStrategyFactory, useConversation, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import {
  IconAi,
  IconCollapseLeft,
  IconCollapseRight,
  IconNewSession,
  IconSetting,
  IconUser,
  IconWarning,
} from '@opentiny/tiny-robot-svgs'
import { createDeepSeekResponseProvider } from '../deepseek-provider'
import { TrChat, useKitChatRuntime } from '../../src'
import type { ChatUi } from '../../src'

/** 基于 existing-kit 的 CLI basic 迁移验证案例，只承担迁移过程验证。 */
const prompts = [
  { label: '阶段 1：验证会话、发送、流式与取消' },
  { label: '阶段 2：补齐 Markdown、空态和移动端 Drawer' },
]
const cliBasicTitleFallback = (text: string) => text.trim().slice(0, 24) || '新对话'

const cliBasicOnErrorPlugin: UseMessagePlugin = {
  onError({ currentTurn, error }) {
    const content = String(error)

    // 保留 CLI basic 的错误消息写回，同时继续抛出以同步 runtime.lastError。
    if (currentTurn.length > 0) {
      currentTurn[currentTurn.length - 1].content = content
    }

    throw error instanceof Error ? error : new Error(content)
  },
}

const conversation = useConversation({
  storage: localStorageStrategyFactory({
    key: 'tiny-robot-chat-cli-basic-migration-demo',
  }),
  autoSaveMessages: true,
  useMessageOptions: {
    initialMessages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
    ],
    plugins: [cliBasicOnErrorPlugin],
    responseProvider: createDeepSeekResponseProvider(),
  },
})

const runtime = useKitChatRuntime({
  conversation,
  titleFallback: cliBasicTitleFallback,
})
const isMobile = useMediaQuery('(max-width: 768px)')
const colorMode = ref<'light' | 'dark'>('light')
const hasApiKey = computed(() => Boolean(import.meta.env.VITE_DEEPSEEK_API_KEY?.trim()))
const leftAsideOpen = ref(!isMobile.value)

watch(
  isMobile,
  (nextIsMobile) => {
    leftAsideOpen.value = !nextIsMobile
  },
  { immediate: true },
)

function toggleColorMode() {
  colorMode.value = colorMode.value === 'light' ? 'dark' : 'light'
}

function handleLeftAsideOpenChange(detail: { open: boolean }) {
  leftAsideOpen.value = detail.open
}

function handleHistoryItemClick() {
  if (!isMobile.value) {
    return
  }

  leftAsideOpen.value = false
}

const ui = computed<ChatUi>(() => ({
  layout: {
    leftAside: {
      mode: isMobile.value ? 'drawer' : 'dock',
      open: leftAsideOpen.value,
      expandedWidth: isMobile.value ? 280 : 260,
    },
    onLeftAsideOpenChange: handleLeftAsideOpenChange,
  },
  history: {
    onItemClick: handleHistoryItemClick,
  },
  welcome: {
    title: 'CLI Basic Migration',
    description: '基于 existing-kit 的替换案例。',
  },
  prompts: {
    wrap: true,
    items: prompts,
  },
  bubbleProvider: {
    fallbackContentRenderer: BubbleRenderers.Markdown,
  },
  bubbleList: {
    autoScroll: true,
    roleConfigs: {
      user: { placement: 'end', avatar: IconUser },
      assistant: { placement: 'start', avatar: IconAi },
      system: { hidden: true },
    },
  },
  sender: {
    mode: 'multiple',
    clearable: true,
    maxLength: 4000,
    placeholder: '输入消息验证 CLI basic 替换主链路',
    showWordLimit: true,
  },
}))
</script>

<template>
  <TrThemeProvider v-model:color-mode="colorMode">
    <TrChat :runtime="runtime" :ui="ui">
      <template #header="{ title, createConversation }">
        <div class="cli-basic-migration-header">
          <div class="cli-basic-migration-header__start">
            <TrLayout.AsideToggle side="left">
              <template #default="{ isOpen }">
                <TrIconButton
                  class="cli-basic-migration-header__aside-toggle"
                  :icon="isOpen ? IconCollapseRight : IconCollapseLeft"
                  size="32"
                  svg-size="18"
                  type="button"
                  :aria-label="isOpen ? '收起会话列表' : '展开会话列表'"
                />
              </template>
            </TrLayout.AsideToggle>

            <div class="cli-basic-migration-header__title-wrap">
              <span class="cli-basic-migration-header__title">{{ title }}</span>
              <span v-if="!hasApiKey" class="cli-basic-migration-header__warning">
                <IconWarning :size="14" />
                未配置 VITE_DEEPSEEK_API_KEY
              </span>
            </div>
          </div>

          <div class="cli-basic-migration-header__actions">
            <button class="cli-basic-migration-header__theme" type="button" @click="toggleColorMode">
              <IconSetting :size="14" />
              {{ colorMode === 'light' ? '深色' : '浅色' }}
            </button>

            <TrIconButton
              :icon="IconNewSession"
              size="32"
              svg-size="18"
              type="button"
              aria-label="新建对话"
              @click="createConversation()"
            />
          </div>
        </div>
      </template>

      <template #sender-footer>
        <div>模型选择器</div>
      </template>
    </TrChat>
  </TrThemeProvider>
</template>

<style scoped>
.cli-basic-migration-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  height: 56px;
  padding: 0 24px;
  box-sizing: border-box;
}

.cli-basic-migration-header__start,
.cli-basic-migration-header__actions,
.cli-basic-migration-header__theme,
.cli-basic-migration-header__warning {
  display: inline-flex;
  align-items: center;
}

.cli-basic-migration-header__start,
.cli-basic-migration-header__title-wrap {
  min-width: 0;
}

.cli-basic-migration-header__start,
.cli-basic-migration-header__actions {
  gap: 12px;
}

.cli-basic-migration-header__title-wrap {
  display: grid;
  gap: 4px;
}

.cli-basic-migration-header__title {
  overflow: hidden;
  color: var(--tr-text-primary);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cli-basic-migration-header__warning {
  gap: 6px;
  width: fit-content;
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--tr-color-warning);
  background: var(--tr-color-warning-light);
  font-size: 12px;
  line-height: 1;
}

.cli-basic-migration-header__theme {
  gap: 6px;
  padding: 7px 10px;
  border: 0;
  border-radius: 999px;
  color: var(--tr-text-secondary);
  background: var(--tr-container-bg-default-2);
  font: inherit;
  cursor: pointer;
}

.cli-basic-migration-header__theme:hover {
  color: var(--tr-text-primary);
}

@media (max-width: 720px) {
  .cli-basic-migration-header {
    padding: 0 16px;
  }

  .cli-basic-migration-header__warning {
    display: none;
  }

  .cli-basic-migration-header__theme {
    padding-inline: 8px;
    font-size: 12px;
  }
}
</style>
