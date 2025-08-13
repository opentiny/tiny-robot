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

<style>
[data-tr-theme='custom-theme'][data-tr-color-mode='light'] {
  --tr-prompt-bg-color: #fff7ed;
  --tr-prompt-hover-color: rgba(249, 115, 22, 0.08);
  --tr-prompt-active-color: rgba(249, 115, 22, 0.15);
  --tr-prompt-disabled-color: rgba(249, 115, 22, 0.04);
  --tr-prompt-box-shadow: 0 2px 12px rgba(249, 115, 22, 0.08);
  --tr-prompt-title-color: #c2410c;
  --tr-prompt-description-color: #92400e;
  --tr-prompt-badge-bg-color: #fed7aa;
  --tr-prompt-badge-color: #ea580c;
}
[data-tr-theme='custom-theme'][data-tr-color-mode='dark'] {
  --tr-prompt-bg-color: #1c1917;
  --tr-prompt-hover-color: rgba(249, 115, 22, 0.15);
  --tr-prompt-active-color: rgba(249, 115, 22, 0.25);
  --tr-prompt-disabled-color: rgba(249, 115, 22, 0.08);
  --tr-prompt-box-shadow: 0 2px 12px rgba(249, 115, 22, 0.15);
  --tr-prompt-title-color: #fed7aa;
  --tr-prompt-description-color: #fbbf24;
  --tr-prompt-badge-bg-color: #92400e;
  --tr-prompt-badge-color: #fed7aa;
}
</style>
