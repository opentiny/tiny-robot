---
outline: deep
---

# 主题配置

TinyRobot 提供了灵活的主题系统，支持自定义主题、亮暗色模式切换、主题嵌套和数据持久化等功能，让你轻松打造符合品牌风格的 AI 应用界面。

## 核心概念

TinyRobot 的主题系统基于 CSS 变量实现，通过 `ThemeProvider` 组件和 `useTheme` 组合式函数提供完整的主题管理能力。

主题系统包含两个核心概念：

- **主题（Theme）**：定义应用的整体视觉风格，如品牌色、圆角、间距等
- **颜色模式（Color Mode）**：控制亮色/暗色模式，支持 `light`、`dark` 和 `auto`（跟随系统）三种模式

## 基础用法

### 1. 使用 ThemeProvider

使用 `ThemeProvider` 包裹你的应用：

```vue
<template>
  <ThemeProvider>
    <YourApp />
  </ThemeProvider>
</template>

<script setup>
import { ThemeProvider } from '@opentiny/tiny-robot'
</script>
```

`ThemeProvider` 会在目标元素（默认是 `html`）上添加 `data-tr-theme` 和 `data-tr-color-mode` 属性。

### 2. 自定义主题样式

通过 CSS 属性选择器覆盖主题变量：

```css
/* 亮色模式 */
[data-tr-color-mode='light'] {
  --tr-primary-color: #5e7ce0;
  --tr-background-color: #ffffff;
}

/* 暗色模式 */
[data-tr-color-mode='dark'] {
  --tr-primary-color: #7693f5;
  --tr-background-color: #1a1a1a;
}

/* 自定义主题 */
[data-tr-theme='custom'] {
  --tr-border-radius: 12px;
}
```

## 主题切换

### 通过 Props 控制

```vue
<template>
  <ThemeProvider
    v-model:theme="currentTheme"
    v-model:color-mode="colorMode"
  >
    <YourApp />
  </ThemeProvider>
</template>

<script setup>
import { ref } from 'vue'

const currentTheme = ref('')
const colorMode = ref('auto')
</script>
```

### 通过 useTheme 控制

在 `ThemeProvider` 包裹的组件中使用：

```vue
<script setup>
import { useTheme } from '@opentiny/tiny-robot'

const { setTheme, setColorMode, toggleColorMode } = useTheme()

// 设置主题
setTheme('custom')

// 设置颜色模式
setColorMode('dark')

// 切换亮暗模式
toggleColorMode()
</script>
```

> 注意：`useTheme` 必须在 `ThemeProvider` 包裹的组件中使用。

## 高级功能

### 嵌套主题

支持嵌套使用不同主题，子组件会使用最近的 `ThemeProvider`：

```vue
<ThemeProvider theme="default" color-mode="light">
  <div>外层：默认主题（亮色）</div>
  
  <ThemeProvider theme="custom" color-mode="dark">
    <div>内层：自定义主题（暗色）</div>
  </ThemeProvider>
</ThemeProvider>
```

适用场景：特定区域使用不同主题、主题预览功能、组件级主题隔离。

### 主题持久化

使用 `storage` 属性持久化主题设置：

```vue
<ThemeProvider
  :storage="localStorage"
  storage-key="my-app-theme"
>
  <YourApp />
</ThemeProvider>
```

主题数据会自动保存，刷新页面后恢复。也可以使用自定义存储实现（如 `sessionStorage` 或服务器存储）。

### 自定义目标元素

通过 `target-element` 指定主题应用的根元素：

```vue
<div id="app-container">
  <ThemeProvider target-element="#app-container">
    <YourApp />
  </ThemeProvider>
</div>
```

主题只会影响指定元素及其子元素。

## 最佳实践

1. **使用语义化的 CSS 变量名**，便于维护和扩展
2. **为所有 CSS 变量提供默认值**，确保未自定义时也有良好显示
3. **启用主题持久化**，提升用户体验
4. **使用 `auto` 模式**，自动适配用户的系统设置
5. **避免复杂的 CSS 计算**，保持主题切换流畅

## 更多示例

查看 [Theme 组件文档](/components/theme) 了解：

- 完整的 API 文档和类型定义，
- 主题设置的完整示例
- 颜色模式切换演示
- 嵌套主题的实际应用
- 主题数据持久化示例

## 常见问题

**Q: useTheme 返回 false？**  
A: 确保在 `ThemeProvider` 包裹的组件中使用。

**Q: 主题切换不生效？**  
A: 检查 CSS 变量定义和属性选择器优先级。

**Q: 如何获取所有可用的 CSS 变量？**  
A: 查看 [Theme 组件文档](/components/theme) 或源码中的样式定义。
