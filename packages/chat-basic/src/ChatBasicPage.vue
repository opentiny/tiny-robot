<script setup lang="ts">
import { computed, h } from 'vue'
import { localStorageStrategyFactory, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser, IconWarning } from '@opentiny/tiny-robot-svgs'
import { TrChat, useLocalChatRuntime, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
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

const runtime = useLocalChatRuntime({
  conversation: {
    storage: localStorageStrategyFactory({
      key: 'tiny-robot-chat-basic-demo',
    }),
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
  },
  composer: {
    model: model.model,
    mcp: mcp.mcp,
  },
  titleFallback: cliBasicTitleFallback,
})

const hasApiKey = computed(() => Boolean(model.selectedModel.value?.apiKey))
const aiAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

const ui = computed<ChatUIOptions>(() => ({
  layout: {
    leftAside: {
      mode: 'dock',
      width: 260,
      defaultOpen: true,
    },
  },
  welcome: {
    title: 'CLI Basic Migration',
    description: '基于 existing-kit 的替换案例。',
  },
  prompts: {
    wrap: true,
    items: prompts,
  },
  bubble: {
    autoScroll: true,
    bubbleList: {
      roleConfigs: {
        user: { placement: 'end', avatar: userAvatar },
        assistant: { placement: 'start', avatar: aiAvatar },
        system: { hidden: true },
      },
    },
  },
  sender: {
    maxLength: 4000,
    placeholder: '输入消息验证 CLI basic 替换主链路',
  },
}))
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui">
    <template v-if="!hasApiKey" #header-notice>
      <div class="cli-basic-migration-header__warning">
        <IconWarning :size="14" />
        未配置当前模型 Provider API Key
      </div>
    </template>
  </TrChat>
</template>

<style>
[data-role='user'] {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>

<style scoped>
.cli-basic-migration-header__warning {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--tr-color-warning);
  background: var(--tr-color-warning-light);
  font-size: 12px;
}
</style>
