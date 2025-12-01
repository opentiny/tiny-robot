# Bubble 气泡组件设计文档

## 概述

Bubble 组件系列用于构建 AI 对话界面的消息气泡，支持文本和多模态内容（图片等），提供灵活的分组和渲染能力。

## 核心设计

### 分层架构

```txt
BubbleProvider (渲染器注册)
  └─ BubbleList (消息流管理)
      └─ BubbleItem (分组提供)
          └─ Bubble (气泡渲染 + 内容分发)
              ├─ Box / ImageBox (容器)
              │   └─ BubbleContentWrapper (消息提供)
              │       ├─ Text (文本渲染器)
              │       ├─ Image (图片渲染器)
              │       └─ Reasoning (推理渲染器)
```

**职责划分：**

- `BubbleProvider`: 注册/合并 Box 与内容渲染器匹配关系，并提供 fallback 渲染器
- `BubbleList`: 管理消息数组，根据策略分组
- `BubbleItem`: 通过 provide/inject 传递分组数据
- `Bubble`: 渲染气泡外观（头像、容器），处理多态消息拆分，选择内容渲染器
- `BubbleContentWrapper`: 为每个消息 provide 上下文，使子孙组件可直接访问和修改消息数据

### 消息类型

- **Plain Message（普通消息）**: `content` 为字符串
- **Polymorphic Message（多态消息）**: `content` 为数组，支持多种内容类型

### 分组机制

使用 `isPolymorphic` 标记控制分组：

- `isPolymorphic: false` - 可合并连续相同角色消息
- `isPolymorphic: true` - 密封分组，不再添加新消息

---

## 使用场景

### 场景 1：基础文本对话

```vue
<BubbleList
  :messages="[
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi there!' },
  ]"
  group-strategy="divider"
  :role-configs="{
    user: { placement: 'end', avatar: UserAvatar },
    assistant: { placement: 'start', avatar: AIAvatar },
  }"
/>
```

### 场景 2：多模态内容（Split 模式）

```vue
<BubbleList
  :messages="[
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this image?' },
        { type: 'image_url', image_url: { url: 'https://...' } },
      ],
    },
    { role: 'assistant', content: 'I see a cat.' },
  ]"
  :split-polymorphic="true"
/>
```

**渲染效果：** 开启 `split-polymorphic` 后，每个内容项渲染为独立气泡

### 场景 3：多模态内容（Merged 模式）

```vue
<BubbleList
  :messages="[
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Check this out:' },
        { type: 'image_url', image_url: { url: 'https://...' } },
      ],
    },
  ]"
  :split-polymorphic="false"
/>
```

**渲染效果：** 关闭 `split-polymorphic`，所有内容在同一气泡内

### 场景 4：独立使用 Bubble

```vue
<Bubble role="user" content="Hello, world!" placement="end" shape="rounded" :avatar="UserAvatar" />
```

### 场景 5：连续消息合并

```vue
<!-- consecutive 策略：相同角色连续消息合并 -->
<BubbleList
  :messages="[
    { role: 'user', content: 'First message' },
    { role: 'user', content: 'Second message' }, // 合并到同一组
    { role: 'assistant', content: 'Response 1' },
    { role: 'assistant', content: 'Response 2' }, // 合并到同一组
  ]"
  group-strategy="consecutive"
/>
```

### 场景 6：自定义分组策略

```vue
<script setup>
// Custom grouping: separate every message
const separateAll = (messages) => {
  return messages.map((msg) => ({
    role: msg.role,
    messages: [msg],
    isPolymorphic: Array.isArray(msg.content),
  }))
}
</script>

<template>
  <BubbleList :messages="messages" :group-strategy="separateAll" />
</template>
```

### 场景 7：多角色对话

```vue
<BubbleList
  :messages="[
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi!' },
    { role: 'system', content: 'Connection established' },
  ]"
  :role-configs="{
    user: { placement: 'end', avatar: UserAvatar },
    assistant: { placement: 'start', avatar: AIAvatar },
    system: { placement: 'start', shape: 'none' },
  }"
/>
```

---

## 分组策略详解

### Consecutive 策略

连续相同角色的消息合并为一组：

```javascript
Input: [
  { role: 'user', content: 'A' },
  { role: 'user', content: 'B' },
  { role: 'assistant', content: 'C' },
]

Output: [
  { role: 'user', messages: ['A', 'B'], isPolymorphic: false },
  { role: 'assistant', messages: ['C'], isPolymorphic: false },
]
```

### Divider 策略

按分割角色分组（默认 `user`）：

```javascript
Input: [
  { role: 'user', content: 'Q1' },
  { role: 'user', content: 'Q2' },
  { role: 'assistant', content: 'A1' },
  { role: 'assistant', content: 'A2' },
  { role: 'user', content: 'Q3' },
]

Output: [
  { role: 'user', messages: ['Q1', 'Q2'], isPolymorphic: false },
  { role: 'assistant', messages: ['A1', 'A2'], isPolymorphic: false },
  { role: 'user', messages: ['Q3'], isPolymorphic: false },
]
```

### 多态消息的特殊处理

数组 `content` 会创建密封分组：

```javascript
Input: [
  { role: 'user', content: 'Text 1' },
  { role: 'user', content: [{ type: 'text', text: 'Text 2' }] },
  { role: 'user', content: 'Text 3' }
]

Output: [
  { role: 'user', messages: ['Text 1'], isPolymorphic: false },
  { role: 'user', messages: [[...]], isPolymorphic: true },  // 密封
  { role: 'user', messages: ['Text 3'], isPolymorphic: false }
]
```

---

## 渲染器扩展

### 添加新内容渲染器

```vue
<!-- renderers/Audio.vue -->
<script setup>
defineProps<{ content: { type: 'audio', audio_url: string } }>()
</script>

<template>
  <audio :src="content.audio_url" controls />
</template>
```

```typescript
// 在业务侧通过 BubbleProvider 注入匹配项
import { markRaw } from 'vue'
import Audio from './renderers/Audio.vue'

const audioRendererMatches = [
  {
    find: (message) => message.content?.type === 'audio',
    renderer: markRaw(Audio),
    priority: 5,
  },
]
```

```vue
<script setup lang="ts">
import { BubbleProvider, BubbleList } from '@opentiny/tiny-robot'
import { audioRendererMatches } from './matches'
</script>

<template>
  <BubbleProvider :content-renderer-matches="audioRendererMatches">
    <BubbleList :messages="messages" />
  </BubbleProvider>
</template>
```

`BubbleProvider` 会将自定义匹配与默认匹配合并，并按 `priority` 从小到大排序，当 `find` 返回 `true` 时使用对应渲染器；若无匹配则回退到 `fallback-content-renderer`。

### 添加新容器渲染器

```typescript
import { markRaw } from 'vue'
import VideoBox from './renderers/VideoBox.vue'

const videoBoxMatches = [
  {
    find: (props) => props.messages.length === 1 && props.messages[0].content?.type === 'video',
    renderer: markRaw(VideoBox),
    priority: 5,
  },
]
```

```vue
<BubbleProvider :box-renderer-matches="videoBoxMatches">
  <BubbleList :messages="messages" />
</BubbleProvider>
```

同理，可以通过 `fallback-box-renderer` 覆盖容器回退渲染器。
