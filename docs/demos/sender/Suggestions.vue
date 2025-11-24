<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">高亮模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="auto" v-model="highlightMode" style="cursor: pointer" />
        <span>自动匹配</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="precise" v-model="highlightMode" style="cursor: pointer" />
        <span>精确指定</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="custom" v-model="highlightMode" style="cursor: pointer" />
        <span>自定义函数</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      {{
        highlightMode === 'auto'
          ? '自动高亮匹配的输入内容'
          : highlightMode === 'precise'
            ? '通过 highlights 数组精确指定高亮片段'
            : '通过 highlights 函数自定义高亮逻辑'
      }}
    </div>
    <tr-sender
      :key="highlightMode"
      mode="single"
      :suggestions="currentSuggestions"
      :placeholder="
        highlightMode === 'auto'
          ? '输入 ECS 或 CDN 查看自动高亮...'
          : highlightMode === 'precise'
            ? '输入 ECS 或 CDN 查看精确高亮...'
            : '输入 ECS 或 CDN 查看自定义高亮...'
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender, type SuggestionTextPart } from '@opentiny/tiny-robot'

const highlightMode = ref<'auto' | 'precise' | 'custom'>('auto')

// 自动匹配模式：传入对象数组，自动高亮匹配的输入内容
const autoSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'CDN-权限管理' },
  { content: 'CDN常见问题场景以及解决方法有哪些？' },
]

// 精确指定模式：通过 highlights 数组指定高亮片段
const preciseSuggestions = [
  { content: 'ECS-云服务器卡顿问题', highlights: ['云服务器', '卡顿'] },
  { content: 'ECS-备份弹性云服务器', highlights: ['弹性', '云服务器'] },
  { content: 'CDN-权限管理', highlights: ['权限'] },
  { content: 'CDN常见问题场景以及解决方法有哪些？', highlights: ['问题', '解决方法'] },
]

// 自定义函数模式：通过 highlights 函数完全控制高亮逻辑
const customSuggestions = [
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: (text: string) => {
      const parts: SuggestionTextPart[] = []
      const keyword = '云'
      let lastIndex = 0
      let index = text.indexOf(keyword)

      while (index !== -1) {
        if (index > lastIndex) {
          parts.push({ text: text.substring(lastIndex, index), isMatch: false })
        }
        parts.push({ text: keyword, isMatch: true })
        lastIndex = index + keyword.length
        index = text.indexOf(keyword, lastIndex)
      }

      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), isMatch: false })
      }

      return parts
    },
  },
  { content: 'ECS-备份弹性云服务器', highlights: () => [{ text: 'ECS-备份弹性云服务器', isMatch: true }] },
  { content: 'CDN-权限管理', highlights: () => [{ text: 'CDN-权限管理', isMatch: false }] },
  {
    content: 'CDN常见问题场景以及解决方法有哪些？',
    highlights: () => [
      { text: 'CDN', isMatch: true },
      { text: '常见', isMatch: false },
      { text: '问题', isMatch: true },
      { text: '场景以及', isMatch: false },
      { text: '解决方法', isMatch: true },
      { text: '有哪些？', isMatch: false },
    ],
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const currentSuggestions = computed<any>(() => {
  switch (highlightMode.value) {
    case 'auto':
      return autoSuggestions
    case 'precise':
      return preciseSuggestions
    case 'custom':
      return customSuggestions
    default:
      return autoSuggestions
  }
})
</script>
