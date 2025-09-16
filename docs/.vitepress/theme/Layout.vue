<template>
  <div class="tiny-robot-layout">
    <!-- 自定义顶部导航栏 -->
    <CustomHeader />

    <!-- 主内容区域 -->
    <div class="main-content">
      <ThemeProvider :color-mode="colorMode">
        <DefaultLayout />
      </ThemeProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ThemeProvider } from '@opentiny/tiny-robot'
import DefaultTheme from 'vitepress/theme'
import { onMounted, onUnmounted, ref } from 'vue'
import { colorModeSubject } from './color-mode'
import CustomHeader from './components/CustomHeader.vue'

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

<style scoped>
.tiny-robot-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
