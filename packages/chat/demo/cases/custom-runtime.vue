<script setup lang="ts">
import DemoWorkbench from '../components/DemoWorkbench.vue'
import { demoPathInfo } from '../demoPaths'
import { instrumentDemoRuntime } from '../instrumentRuntime'
import { useDemoScenarioController } from '../scenario'
import { useCustomRuntime } from './useCustomRuntime'

const controller = useDemoScenarioController()
const { isMobile, runtime: baseRuntime, ui } = useCustomRuntime(controller)
const runtime = instrumentDemoRuntime(baseRuntime, controller)
</script>

<template>
  <DemoWorkbench
    v-model:scenario="controller.scenario.value"
    :info="demoPathInfo.customRuntime"
    :runtime="runtime"
    :ui="ui"
    :is-mobile="isMobile"
    :events="controller.events.value"
    :clear-events="controller.clearEvents"
  />
</template>
