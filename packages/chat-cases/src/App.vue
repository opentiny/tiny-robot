<script setup lang="ts">
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import DoubaoCase from './cases/doubao/DoubaoCase.vue'
import TinyRobotFullscreenCase from './cases/tiny-robot/FullscreenCase.vue'

const isDoubaoCase = window.location.pathname.includes('doubao')
</script>

<template>
  <TrTheme>
    <DoubaoCase v-if="isDoubaoCase" />
    <TinyRobotFullscreenCase v-else />
  </TrTheme>
</template>
