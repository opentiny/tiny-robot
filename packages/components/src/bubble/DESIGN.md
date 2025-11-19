# Bubble 气泡组件设计文档

## 概述

Bubble 组件系列用于构建 AI 对话界面的消息气泡，支持文本和多模态内容（图片等），提供灵活的分组和渲染能力。

## 核心设计

### 分层架构

```txt
BubbleList (消息流管理)
  └─ BubbleItem (分组提供)
      └─ Bubble (气泡渲染)
          └─ BubbleRenderer (内容分发)
              ├─ Box / ImageBox (容器)
              ├─ Text (文本渲染器)
              └─ Image (图片渲染器)
```

**职责划分：**

- `BubbleList`: 管理消息数组，根据策略分组
- `BubbleItem`: 通过 provide/inject 传递分组数据
- `Bubble`: 渲染气泡外观（头像、容器），处理多态消息展开
- `BubbleRenderer`: 根据内容类型选择渲染器和容器

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
  polymorphic-content-mode="split"
/>
```

**渲染效果：** 每个内容项渲染为独立气泡

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
  polymorphic-content-mode="merged"
/>
```

**渲染效果：** 所有内容在同一气泡内

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
<!-- ren/Audio.vue -->
<script setup>
defineProps<{ content: { type: 'audio', audio_url: string } }>()
</script>

<template>
  <audio :src="content.audio_url" controls />
</template>
```

```typescript
// BubbleRenderer.vue
import Audio from './ren/Audio.vue'

const contentRendererMatches = [
  {
    find: (message) => message.content?.type === 'audio',
    renderer: Audio,
  },
  // ... existing matchers
]
```

### 添加新容器渲染器

```typescript
// BubbleRenderer.vue
const boxRendererMatches = [
  {
    find: (props) => props.messages.length === 1 && props.messages[0].content?.type === 'video',
    renderer: VideoBox,
  },
  // ... existing matchers
]
```

---

## 实现机制

### Provide/Inject 数据传递

```typescript
// BubbleItem: Provide message group
provide(BUBBLE_MESSAGE_GROUP_KEY, props.messageGroup)

// Bubble: Inject and immediately provide undefined to prevent recursion
const messageGroup = inject(BUBBLE_MESSAGE_GROUP_KEY)
provide(BUBBLE_MESSAGE_GROUP_KEY, undefined)
```

### 递归渲染保护

Split 模式下，多态消息会递归渲染 Bubble：

```vue
<template v-if="shouldSplitPolymorphic">
  <Bubble
    v-for="(content, index) in splitedPolymorphicItems"
    :key="index"
    :content="[content]"
    polymorphic-content-mode="merged"
  />
</template>
```

通过 provide `undefined` 阻止无限递归。

### 分组密封逻辑

```typescript
// Check if can merge into last group
if (lastGroup && lastGroup.role === message.role && !lastGroup.isPolymorphic) {
  lastGroup.messages.push(message)
} else {
  // Create new group
}
```

---

## 样式定制

### CSS 变量

```css
/* List spacing */
--tr-bubble-list-gap: 16px;
--tr-bubble-list-padding: 16px;

/* Bubble layout */
--tr-bubble-gap: 8px;
--tr-bubble-max-width: 80%;

/* Box appearance */
--tr-bubble-box-bg: #f5f5f5;
--tr-bubble-box-padding: 8px 16px;
--tr-bubble-box-border-radius: 18px;
```

### 形状选项

- `rounded`: 全圆角
- `corner`: 顶部小圆角（对话感）
- `none`: 无圆角

---

## 设计优势

1. **灵活性** - 支持 BubbleList 整体管理或 Bubble 独立使用
2. **类型安全** - TypeScript 类型定义，`isPolymorphic` 标记
3. **扩展性** - 渲染器匹配机制，易于添加新内容类型
4. **性能** - 计算属性缓存，递归保护
5. **关注点分离** - 清晰的职责划分
