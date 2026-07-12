<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import DemoWorkbench from '../components/DemoWorkbench.vue'
import { demoPathInfo } from '../demoPaths'
import { instrumentDemoRuntime } from '../instrumentRuntime'
import { createDemoResponseProvider, useDemoScenarioController } from '../scenario'
import { useKitChatRuntime } from '../../src'
import { createDemoStorage, useDemoChatUi } from './shared'

const controller = useDemoScenarioController()
const lastError = shallowRef<unknown | null>(null)
const conversation = useConversation({
  storage: createDemoStorage(),
  useMessageOptions: {
    responseProvider: createDemoResponseProvider('Existing Kit Runtime', controller),
  },
})

conversation.createConversation({
  title: '已有 Kit 会话',
})

const baseRuntime = useKitChatRuntime(conversation, {
  lastError,
  send: async ({ text }) => {
    const content = text.trim()

    if (!content) {
      return
    }

    const active = conversation.activeConversation.value

    if (!active) {
      return
    }

    try {
      lastError.value = null
      await active.engine.sendMessage(content)
    } catch (error) {
      lastError.value = error
      throw error
    }
  },
})
const runtime = instrumentDemoRuntime(baseRuntime, controller)
const { isMobile, ui } = useDemoChatUi({
  title: 'Existing Kit Runtime',
  description: '复用已有 useConversation()，只迁移到 TrChat UI。',
  placeholder: '输入消息验证已有 Kit 复用路径',
})
</script>

<template>
  <DemoWorkbench
    v-model:scenario="controller.scenario.value"
    :info="demoPathInfo.existingKit"
    :runtime="runtime"
    :ui="ui"
    :is-mobile="isMobile"
    :events="controller.events.value"
    :clear-events="controller.clearEvents"
  />
</template>
