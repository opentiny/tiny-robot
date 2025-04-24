# 文档

## 注意事项

### TinyRobot组件库组件导出格式说明
考虑到组件名可能存在的命名冲突、业界组件库通常做法与Vue 官方推荐的风格( kebab-case（如 <tr-button>）), 现有如下规范：
- 组件库同时导出不带前缀与带前缀两种格式的组件：如Bubble、TrBubble
- 推荐用户使用带前缀的组件名，如TrBubble，推荐用户使用kebab-case格式模板标签（如 <tr-button>），推荐用户按需引入组件
- 组件库全局注册组件时，使用带前缀的组件名：如TrBubble

### 示例代码中编写规范

demo推荐写在`demos`目录下，无需引入组件库（但需要在代码中通过注释体现）：
```vue
<!-- Xxx.vue -->
<template>
  <tr-bubble/> <!-- 使用 -->
  <bubble/>    <!-- 不推荐 -->
  <TrBubble/>  <!-- 不推荐 -->
  <Bubble/>    <!-- 不推荐 -->
</template>
<script setup>
// import { TrBubble } from '@opentiny/tiny-robot'
</script>
```


对于简短Demo可以写在markdown中，需要注意标签规范：
markdown文件中可以直接引用模板标签，无需引入组件库：
```vue
<!-- xxx.md -->
<tr-bubble/> <!-- 使用 -->
<bubble/>    <!-- 不使用，构建报错 -->
<TrBubble/>  <!-- 不使用，构建报错 -->
<Bubble/>    <!-- 不使用，构建报错 -->
```
