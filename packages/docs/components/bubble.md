# Bubble

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const streamingRef = ref()

const strings = [
  'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，',
  '专为企业级应用设计，由华为开源团队开发维护。',
  '它聚焦于 极简设计 和 极致性能，同时提供丰富的开箱即用组件，',
  '适用于复杂后台管理系统、数据密集型和跨端应用场景。',
]

onMounted(async () => {
  for (const str of strings) {
    streamingRef.value?.streamAppendText(str)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
})

const typedRef = ref()
const reset = () => {
  typedRef.value?.typedInstance?.reset()
}

// markdown
const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`
</script>

## 简单示例

设置 `content` 展示简单文本

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <TinyBubble role="ai" content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"/>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <TinyBubble
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    />
  </div>
</template>
```

## 角色

`role` 属性可设置成 `ai` 或者 `user`，头像分别在左侧和右侧

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <TinyBubble role="ai" content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"/>
  <TinyBubble role="user" content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"/>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <TinyBubble
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    />
    <TinyBubble
      role="user"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    />
  </div>
</template>
```

## 渲染 markdown

设置 `type` 属性为 `markdown`，会以 markdown 格式渲染。`type` 属性可选值为 `text` 或`markdown`，默认为 `text` 。markdown 渲染使用 [markdown-it](https://github.com/markdown-it/markdown-it) 库实现，`mdConfig` 属性是 markdown 配置，配置会传递给内部的 `markdown-it`。具体配置项可查看 markdown-it 的[options](https://markdown-it.github.io/markdown-it/#MarkdownIt.new)

<div style="background: #f9f9f9; padding: 24px; border-radius: 8px">
  <TinyBubble role="ai" :content="mdContent" type="markdown" />
</div>

```vue
<template>
  <TinyBubble role="ai" :content="mdContent" type="markdown" />
</template>

<script setup lang="ts">
const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`
</script>
```

## 打字效果

打字效果使用 [typed.js](https://github.com/mattboldt/typed.js/) 库实现，`typedConfig` 属性

<div class="language-vue" style="padding: 20px">
  <TinyBubble
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :typedConfig="{ enable: true }"
    ref="typedRef"
  />
  <hr/>
  <button @click="reset">重置</button>
</div>

```vue
<template>
  <TinyBubble
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :typedConfig="{ enable: true }"
    ref="typedRef"
  />
  <hr />
  <button @click="reset">重置</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const typedRef = ref()
const reset = () => {
  typedRef.value?.typedInstance?.reset()
}
</script>
```

## 流式文本

TODO

## 自定义头像

TODO

## 气泡底部内容

TODO
