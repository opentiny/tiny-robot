# Bubble

<script setup lang="ts">
import { onMounted, ref } from 'vue'
// typed
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

// stream
const streamContent = ref(mdContent)

const chunks: string[] = []
for (let i = 0; i < mdContent.length; i += 3) {
  chunks.push(mdContent.slice(i, i + 3))
}

const sendChunk = async () => {
  for (const chunk of chunks) {
    // 动态地给 content 末尾添加文本
    streamContent.value = streamContent.value + chunk
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

const resetStreamContent = () => {
  streamContent.value = ''
  sendChunk()
}
</script>

## 简单示例

设置 `content` 展示简单文本

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <TinyBubbleItem role="ai" content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"/>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <TinyBubbleItem
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    />
  </div>
</template>
```

## 角色

`role` 属性可设置成 `ai` 或者 `user`，气泡分别靠左和靠右

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <TinyBubbleItem role="user" content="简单介绍TinyVue"/>
  <TinyBubbleItem role="ai" content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"/>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <TinyBubbleItem role="user" content="简单介绍TinyVue" />
    <TinyBubbleItem
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    />
  </div>
</template>
```

## 加载中

设置 `loading` 属性可配置加载效果

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <TinyBubbleItem role="ai" :loading="true"/>
</div>

```vue
<TinyBubbleItem role="ai" :loading="true" />
```

## 渲染 markdown

设置 `type` 属性为 `markdown`，会以 markdown 格式渲染。`type` 属性可选值为 `text` 或`markdown`，默认为 `text` 。markdown 渲染使用 [markdown-it](https://github.com/markdown-it/markdown-it) 库实现，`mdConfig` 属性是 markdown 配置，配置会传递给内部的 `markdown-it`。具体配置项可查看 markdown-it 的[options](https://markdown-it.github.io/markdown-it/#MarkdownIt.new)

<div style="background: #f9f9f9; padding: 24px; border-radius: 8px">
  <TinyBubbleItem role="ai" :content="mdContent" type="markdown" />
</div>

```vue
<template>
  <TinyBubbleItem role="ai" :content="mdContent" type="markdown" />
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

## ~~打字效果~~

> 暂时无法实现流式文本

打字效果使用 [typed.js](https://github.com/mattboldt/typed.js/) 库实现，`typedConfig` 属性

<div class="language-vue" style="padding: 20px">
  <TinyBubbleItem
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :typedConfig="{ enable: true }"
    ref="typedRef"
  />
  <hr />
  <button @click="reset">点击展示打字效果</button>
</div>

```vue
<template>
  <TinyBubbleItem
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :typedConfig="{ enable: true }"
    ref="typedRef"
  />
  <hr />
  <button @click="reset">点击展示打字效果</button>
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

`content` 属性是响应式的，动态地给 `content` 末尾添加文本是实现流式文本的最简单的方法

<div style="background: #f9f9f9; padding: 24px; border-radius: 8px">
  <TinyBubbleItem role="ai" :content="streamContent" type="markdown" />
  <hr />
  <button @click="resetStreamContent">点击展示流式文本</button>
</div>

```vue
<template>
  <TinyBubbleItem role="ai" :content="streamContent" type="markdown" />
  <hr />
  <button @click="resetStreamContent">点击展示流式文本</button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`

const streamContent = ref(mdContent)

const chunks: string[] = []
for (let i = 0; i < mdContent.length; i += 3) {
  chunks.push(mdContent.slice(i, i + 3))
}

const sendChunk = async () => {
  for (const chunk of chunks) {
    // 动态地给 content 末尾添加文本
    streamContent.value = streamContent.value + chunk
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

const resetStreamContent = () => {
  streamContent.value = ''
  sendChunk()
}
</script>
```

## 自定义头像

TODO

## 气泡底部内容

TODO
