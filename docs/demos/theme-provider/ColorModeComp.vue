<template>
  <tr-prompts :items="items" vertical></tr-prompts>
  <p>当前颜色模式：{{ colorMode }}</p>
  <p>当前解析后的颜色模式：{{ resolvedColorMode }}</p>
  <div style="display: flex; gap: 10px">
    <SuggestionPillButton @click="toggleColorMode">toggle</SuggestionPillButton>
    <SuggestionPillButton @click="setColorMode('dark')">set dark</SuggestionPillButton>
    <SuggestionPillButton @click="setColorMode('light')">set light</SuggestionPillButton>
    <SuggestionPillButton @click="setColorMode('auto')">set auto</SuggestionPillButton>
  </div>
</template>

<script setup lang="ts">
import { PromptProps, SuggestionPillButton, TrPrompts, useTheme } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const { colorMode, resolvedColorMode, toggleColorMode, setColorMode } = useTheme()

const items: PromptProps[] = [
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
]
</script>
