<script setup lang="ts">
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import DeepseekCase from './cases/deepseek/DeepseekCase.vue'
import DoubaoCase from './cases/doubao/DoubaoCase.vue'
import GeminiCase from './cases/gemini/GeminiCase.vue'
import TinyRobotFullscreenCase from './cases/tiny-robot/FullscreenCase.vue'
import WorkHelperCase from './cases/worker-helper/WorkHelperCase.vue'

const isDoubaoCase = window.location.pathname.includes('doubao')
const isDeepseekCase = window.location.pathname.includes('deepseek')
const isGeminiCase = window.location.pathname.includes('gemini')
const isWorkHelperCase = window.location.pathname.includes('worker-helper')
</script>

<template>
  <TrTheme>
    <DeepseekCase v-if="isDeepseekCase" />
    <DoubaoCase v-else-if="isDoubaoCase" />
    <GeminiCase v-else-if="isGeminiCase" />
    <WorkHelperCase v-else-if="isWorkHelperCase" />
    <TinyRobotFullscreenCase v-else />
  </TrTheme>
</template>
