<script setup lang="ts">
import { computed, ref, watch, h } from 'vue'
import { ThemeProvider as TrThemeProvider, TrIconButton, TrLayout } from '@opentiny/tiny-robot'
import { useMediaQuery } from '@vueuse/core'
import { localStorageStrategyFactory, useConversation, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import {
  IconAi,
  IconCollapseLeft,
  IconCollapseRight,
  IconNewSession,
  IconMoon,
  IconSun,
  IconUser,
  IconWarning,
} from '@opentiny/tiny-robot-svgs'
import { TrChat, useKitChatRuntime, type ChatRunConfig, type ChatUi } from '@opentiny/tiny-robot-chat'
import { createMcpToolPlugin, createModelRequestPlugin, createRunConfigPlugin } from './plugins'
import { createResponseProvider } from './responseProvider'
import { useModel } from './useModel'
import { useMcp } from './useMcp'

const prompts = [
  { label: '阶段 1：验证会话、发送、流式与取消' },
  { label: '阶段 2：补齐 Markdown、空态和移动端 Drawer' },
]

const cliBasicTitleFallback = (text: string) => text.trim().slice(0, 24) || '新对话'

const cliBasicOnErrorPlugin: UseMessagePlugin = {
  onError({ currentTurn, messages, error }) {
    const content = String(error)
    const assistantMessage = [...currentTurn].reverse().find((message) => message.role === 'assistant')

    if (assistantMessage) {
      assistantMessage.content = content
      assistantMessage.loading = undefined
    } else {
      const now = Math.floor(Date.now() / 1000)
      const errorMessage = {
        role: 'assistant',
        content,
        metadata: {
          createdAt: now,
          updatedAt: now,
        },
      } as const

      messages.push(errorMessage)
    }

    throw error instanceof Error ? error : new Error(content)
  },
}

const model = useModel()
const mcp = useMcp()

const conversation = useConversation({
  storage: localStorageStrategyFactory({
    key: 'tiny-robot-chat-basic-demo',
  }),
  autoSaveMessages: true,
  useMessageOptions: {
    initialMessages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
    ],
    plugins: [
      createRunConfigPlugin(),
      createModelRequestPlugin(model.resolveModel),
      createMcpToolPlugin(mcp.listTools, mcp.callTool),
      cliBasicOnErrorPlugin,
    ],
    responseProvider: createResponseProvider(model.resolveModel),
  },
})

const enabledMcpServers = computed(() => mcp.mcp.servers.value.filter((server) => server.installed && server.enabled))
const mcpToolsReady = computed(() =>
  enabledMcpServers.value.every(
    (server) => !server.loading && Object.prototype.hasOwnProperty.call(mcp.mcp.tools.value, server.id),
  ),
)
const composerDisabled = computed(() => enabledMcpServers.value.length > 0 && !mcpToolsReady.value)
const runConfig = computed<Readonly<ChatRunConfig>>(() => {
  const serverIds = enabledMcpServers.value.map((server) => server.id)

  return {
    modelId: model.model.selectedId.value ?? undefined,
    features: { ...model.model.features.value },
    reasoning: model.reasoning.value,
    mcp:
      serverIds.length > 0 && mcpToolsReady.value
        ? {
            serverIds,
            toolIds: Object.fromEntries(
              serverIds.map((serverId) => [
                serverId,
                (mcp.mcp.tools.value[serverId] ?? []).filter((tool) => tool.enabled).map((tool) => tool.id),
              ]),
            ),
          }
        : undefined,
  }
})

const runtime = useKitChatRuntime({
  conversation,
  composer: {
    disabled: composerDisabled,
    model: model.model,
    mcp: mcp.mcp,
    runConfig,
  },
  titleFallback: cliBasicTitleFallback,
})

const isMobile = useMediaQuery('(max-width: 768px)')
const colorMode = ref<'light' | 'dark'>('light')
const hasApiKey = computed(() => Boolean(model.selectedModel.value?.apiKey))
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

const aiAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

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
  bubbleList: {
    autoScroll: true,
    roleConfigs: {
      user: { placement: 'end', avatar: userAvatar },
      assistant: { placement: 'start', avatar: aiAvatar },
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
                未配置当前模型 Provider API Key
              </span>
            </div>
          </div>

          <div class="cli-basic-migration-header__actions">
            <button class="cli-basic-migration-header__theme" type="button" @click="toggleColorMode">
              <component :is="colorMode === 'light' ? IconSun : IconMoon" :size="14" />
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
    </TrChat>
  </TrThemeProvider>
</template>

<style>
[data-role='user'] {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>

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
