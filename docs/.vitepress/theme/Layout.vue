<template>
  <ThemeProvider :color-mode="colorMode">
    <DefaultLayout />
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ThemeProvider } from '@opentiny/tiny-robot'
import DefaultTheme from 'vitepress/theme'
import { onMounted, onUnmounted, ref } from 'vue'
import { colorModeSubject } from './color-mode'

// 创建响应式的 colorMode 值
const colorMode = ref<'light' | 'dark' | 'auto'>('auto')

// 在客户端环境下同步 ColorModeSubject
if (typeof window !== 'undefined') {
  let unsubscribe: (() => void) | undefined = undefined

  onMounted(() => {
    // 订阅 ColorModeSubject 的变化
    unsubscribe = colorModeSubject.subscribe((mode) => {
      colorMode.value = mode
    })
  })

  // 组件卸载时取消订阅
  onUnmounted(() => {
    unsubscribe?.()
  })
}

// 获取 VitePress 默认布局组件
const DefaultLayout = DefaultTheme.Layout
</script>
