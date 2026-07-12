<script setup lang="ts">
import DemoWorkbench from '../components/DemoWorkbench.vue'
import { demoPathInfo } from '../demoPaths'
import { instrumentDemoRuntime } from '../instrumentRuntime'
import { createDemoResponseProvider, useDemoScenarioController } from '../scenario'
import { useLocalChatRuntime } from '../../src'
import { createDemoStorage, useDemoChatUi } from './shared'

const controller = useDemoScenarioController()
const baseRuntime = useLocalChatRuntime(
  {
    storage: createDemoStorage(),
    useMessageOptions: {
      responseProvider: createDemoResponseProvider('Built-in Kit Runtime', controller),
    },
  },
  {
    titleFallback: (text) => text.trim().slice(0, 20) || '新对话',
  },
)
const runtime = instrumentDemoRuntime(baseRuntime, controller)
const { isMobile, ui } = useDemoChatUi({
  title: 'Built-in Kit Runtime',
  description: '由 Chat 创建并装配 Kit 会话状态。',
  placeholder: '输入消息验证内置 Kit 路径',
})
</script>

<template>
  <DemoWorkbench
    v-model:scenario="controller.scenario.value"
    :info="demoPathInfo.builtInKit"
    :runtime="runtime"
    :ui="ui"
    :is-mobile="isMobile"
    :events="controller.events.value"
    :clear-events="controller.clearEvents"
  />
</template>
