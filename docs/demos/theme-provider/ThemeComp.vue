<template>
  <tr-prompts :items="items" vertical></tr-prompts>
  <p>当前主题：{{ theme }}</p>
  <div style="display: flex; gap: 10px">
    <SuggestionPillButton @click="setTheme('')">切换到默认主题</SuggestionPillButton>
    <SuggestionPillButton @click="setTheme('custom-theme')">切换到自定义主题</SuggestionPillButton>
  </div>
</template>

<script setup lang="ts">
import { PromptProps, SuggestionPillButton, TrPrompts, useTheme } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const { setTheme, theme } = useTheme()

const items: PromptProps[] = [
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
]
</script>
