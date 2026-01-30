---
outline: [1, 3]
---

# Bubble 迁移指南

本文档用于将 **v0.3.x** 的 Bubble 组件用法迁移到 **0.4.x Bubble**。

## 核心变化概览

- **数据模型变化（最重要）**：
  - v0.3.x：`BubbleList` 使用 `items`（每条 item 就是一条 bubble）
  - 0.4.x：`BubbleList` 使用 `messages`（聊天消息模型，支持分组、状态、推理、工具调用等）
- **渲染体系升级**：
  - v0.3.x：`BubbleProvider` 通过 `contentRenderers: Record<type, renderer>` 注册内容渲染器（按 `content[i].type` 命中）
  - 0.4.x：`BubbleProvider` 通过 **match rules** 配置渲染器：
    - **Box 渲染器**：控制外层容器（样式/布局）
    - **Content 渲染器**：控制内容（文本/图片/markdown/工具/推理等）
    - 通过 `priority` + `find()` 进行匹配，未命中使用 `fallback*Renderer`
- **分组与插槽语义变化**：
  - 0.4.x `BubbleList` 默认会把消息**按策略分组**（同角色连续/分割角色/自定义函数）
  - 插槽从“单条 bubble”切换为“分组 messages / messageIndexes”语义
- **能力增强**：
  - 新增 `state` + `state-change`（存储 UI 状态且不污染原始消息）
  - 新增 `contentResolver` / `contentRenderMode`（支持从任意字段解析内容、支持数组内容 split 渲染）
  - 新增内置 renderers：`Image / Markdown / Loading / Reasoning / Tool / Tools / ToolRole ...`

## API 对照表（常用项）

### BubbleList

| v0.3.x | 0.4.x | 说明 |
| --- | --- | --- |
| `items: (BubbleProps & { slots? })[]` | `messages: BubbleMessage[]` | **必改**：数据结构变化 |
| `roles?: Record<string, BubbleRoleConfig>` | `roleConfigs?: Record<string, BubbleRoleConfig>` | 命名变更 + 配置项变化 |
| `loading?: boolean` + `loadingRole?: string` | `messages` 中使用 `{ loading: true }` 或使用渲染器匹配 | **推荐**：把 loading 当作一条消息 |
| `autoScroll?: boolean` | `autoScroll?: boolean` | 行为增强：会监听 content/reasoning 等变化 |
| （无） | `groupStrategy?: 'consecutive' \| 'divider' \| (fn)` | **新增**：分组策略（默认 `divider`） |
| （无） | `dividerRole?: string` | `'divider'` 策略分割角色（默认 `'user'`） |
| （无） | `fallbackRole?: string` | 消息 role 缺失时使用（默认 `'assistant'`） |
| （无） | `contentResolver?: (message) => content` | 替代 v0.3.x 的 `customContentField` 思路 |
| （无） | `contentRenderMode?: 'single' \| 'split'` | 数组内容可“单框/多框”渲染 |

### Bubble

| v0.3.x | 0.4.x | 说明 |
| --- | --- | --- |
| `content?: string \| BubbleContentItem[]` | `content?: string \| ChatMessageContentItem[]` | 类型名变化（语义相同） |
| `avatar?: VNode` | `avatar?: VNode \| Component` | 支持直接传组件 |
| `shape?: 'rounded' \| 'corner'` | `shape?: 'corner' \| 'rounded' \| 'none'` | **新增** `none` |
| `aborted?: boolean` + `abortedText?: string` | （无同名） | 旧“aborted 文案”不再是核心能力，建议用自定义渲染器/插槽实现 |
| `customContentField?: string` | `contentResolver?: (message) => content` | **替代**：从任意字段解析内容 |
| `maxWidth?: string \| number` | 使用 CSS 变量 `--tr-bubble-max-width` 等 | 0.4.x 把宽度控制放到 box 变量体系 |
| `contentRenderer?: BubbleContentRenderer` | `fallbackContentRenderer?: Component` | 单组件 fallback（仅当没有匹配到规则时使用） |
| （无） | `fallbackBoxRenderer?: Component` | 新增：box fallback |
| （无） | `state?: Record<string, unknown>` | 新增：UI 状态 |

### Slots（命名与参数变化）

#### v0.3.x（Bubble）

- `default / footer / loading / trailer`
- slot 参数：`{ bubbleProps, index? }`

#### 0.4.x（Bubble）

- `prefix / suffix / after / content-footer`
- slot 参数：`{ messages: BubbleMessage[]; role?: string; contentIndex? }`

#### 0.4.x（BubbleList）

- `prefix / suffix / after / content-footer`
- slot 参数额外包含：`messageIndexes: number[]`（该分组对应的原始消息索引集合）

## 迁移步骤

### 1) 将 `items` 迁移为 `messages`

v0.3.x 示例（可直接参考写法）：

```vue
<template>
  <tr-bubble-list :items="items" :roles="roles" :loading="loading" loading-role="assistant" auto-scroll />
</template>

<script setup lang="ts">
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { h } from 'vue'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'

const loading = true

const items: BubbleListProps['items'] = [
  { id: 1, role: 'user', content: 'User message 1' },
  { id: 2, role: 'ai', content: 'AI answer 1' },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: { placement: 'start', avatar: h(IconAi, { style: { fontSize: '32px' } }) },
  user: { placement: 'end', avatar: h(IconUser, { style: { fontSize: '32px' } }) },
}
</script>
```

0.4.x 推荐写法：把 loading 变成一条消息（或由匹配规则处理）：

```vue
<template>
  <tr-bubble-list :messages="messages" :role-configs="roleConfigs" auto-scroll />
</template>

<script setup lang="ts">
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { h } from 'vue'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'

const messages: BubbleListProps['messages'] = [
  { role: 'user', content: 'User message 1' },
  { role: 'ai', content: 'AI answer 1' },
  { role: 'ai', loading: true }, // Loading as a message (recommended)
]

const roleConfigs: Record<string, BubbleRoleConfig> = {
  ai: { placement: 'start', avatar: h(IconAi, { style: { fontSize: '32px' } }) },
  user: { placement: 'end', avatar: h(IconUser, { style: { fontSize: '32px' } }) },
}
</script>
```

消息结构示例：

```ts
const messages = [
  { role: 'assistant', content: 'Hello' },
  { role: 'assistant', loading: true }, // Loading as a message (recommended)
]
```

> 提示：0.4.x `BubbleMessage` 还支持 `reasoning_content / tool_calls / tool_call_id / name / state`，可直接承载大模型输出结构（OpenAI 风格）。

### 2) `roles` → `roleConfigs`，并迁移 `hidden`

v0.3.x：

- `roles[role].hidden`：隐藏该 role 所有消息

0.4.x：

- 仍支持 `roleConfigs[role].hidden`
- 但**分组规则**会对 hidden 做特殊处理：连续 hidden 消息可归为同组（与非 hidden 分开）

### 3) `customContentField` → `contentResolver`

v0.3.x 的 `customContentField` 是“从 attrs 的某个字段取内容优先渲染”。

0.4.x 推荐用 `contentResolver` 来统一解决“从原始消息中抽取/派生要渲染的 content”：

```vue
<tr-bubble-list
  :messages="messages"
  :content-resolver="(m) => m['my-content'] ?? m.content /* Prefer derived field */"
/>
```

对应 v0.3.x `customContentField` 的常见迁移（从“item attrs”迁移到“message 字段”）：

```ts
// v0.3.x idea:
// - bubble.customContentField = 'my-content'
// - bubble['my-content'] is the real content to render
//
// latest idea:
// - put it into the message directly, and resolve it via contentResolver
const messages = [
  {
    role: 'ai',
    content: 'Raw model content (kept untouched)',
    'my-content': [{ type: 'text', content: 'UI-ready content' }],
  },
]
```

### 4) loading 的迁移（`loadingRole` 移除）

v0.3.x：

- `BubbleList` 的 loading 并不是一条消息，而是额外渲染一个 loading bubble，并由 `loadingRole` 决定样式/slot。

0.4.x 建议：

- **方式 A（推荐）**：把 loading 当作一条消息：`{ role: 'assistant', loading: true }`
- **默认行为**：0.4.x **内置**了 loading 的匹配规则与渲染器（基于 `message.loading` 命中），通常**不需要**你手动配置。
- **只有在你想自定义 loading UI**（样式/结构/动画等）时，才需要用 `BubbleProvider` 覆盖 loading 的匹配规则或 fallback 渲染器。

自定义 loading UI 示例（provider 覆盖默认 loading 渲染）：

```vue
<template>
  <tr-bubble-provider :content-renderer-matches="contentRendererMatches">
    <tr-bubble-list :messages="messages" :role-configs="roleConfigs" />
  </tr-bubble-provider>
</template>

<script setup lang="ts">
import { defineComponent, h, markRaw } from 'vue'
import type { BubbleContentRendererMatch, BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { BubbleRendererMatchPriority } from '@opentiny/tiny-robot'

const messages: BubbleListProps['messages'] = [
  { role: 'ai', content: 'AI answer 1' },
  { role: 'ai', loading: true },
]

const roleConfigs: Record<string, BubbleRoleConfig> = {
  ai: { placement: 'start' },
}

// Custom loading renderer (example)
const MyLoadingRenderer = defineComponent({
  props: {
    message: { type: Object, required: true },
    contentIndex: Number,
  },
  setup() {
    return () => h('div', { style: { padding: '8px 10px', opacity: 0.7 } }, 'Loading...')
  },
})

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    // Use a higher priority (smaller number) than normal content renderers.
    priority: BubbleRendererMatchPriority.LOADING,
    find: (message) => Boolean(message.loading),
    renderer: markRaw(MyLoadingRenderer),
  },
]
</script>
```

### 5) “中止 aborted” 的迁移建议

v0.3.x 通过 `aborted` / `abortedText` 内置展示“（用户停止）”。

0.4.x 没有同名 API。建议做法：

- 将“停止”视为一种消息状态/内容类型：比如在消息 `state` 或 `content` 中携带标记
- 用 **Content renderer match** 或 `content-footer` 插槽来渲染“已停止/已取消”等 UI

示例（思路）：

```ts
{ role: 'assistant', content: '...', state: { aborted: true } }
```

然后在自定义 renderer / 插槽里判断 `message.state?.aborted`。

一个最小可用的“aborted 文案”迁移示例（用 `content-footer` 插槽渲染）：

```vue
<template>
  <tr-bubble :content="message.content" :state="message.state">
    <template #content-footer="{ messages }">
      <div v-if="messages[0]?.state?.aborted" style="margin-top: 6px; font-size: 12px; opacity: 0.7">
        (User stopped)
      </div>
    </template>
  </tr-bubble>
</template>

<script setup lang="ts">
const message = {
  role: 'assistant',
  content: 'Partial answer...',
  state: { aborted: true },
}
</script>
```

### 6) 渲染器迁移：`contentRenderers` Map → `contentRendererMatches`

#### v0.3.x 机制

- 仅当 `content` 是非空数组时，按 `content[i].type` 在 provider 的 `contentRenderers` Map 中找 renderer。
- 找不到时 fallback 为 `text`。

#### 0.4.x 机制（match rules）

通过 `BubbleProvider` 提供 `contentRendererMatches`（以及可选的 `boxRendererMatches`）：

- `find(message, resolvedContent, contentIndex) => boolean`
- 按 `priority` 从小到大执行，命中第一个即使用
- 未命中使用 `fallbackContentRenderer`

迁移思路（把 “按 type 命中” 变成 “按 type 匹配”）：

```ts
const matches = [
  {
    // priority 可不写，默认 0；建议按需求设置更细的优先级
    find: (_message, resolvedContent, contentIndex) => {
      const item = Array.isArray(resolvedContent) ? resolvedContent[contentIndex ?? 0] : null
      return Boolean(item && typeof item === 'object' && item.type === 'my-type')
    },
    renderer: MyRendererComponent,
  },
]
```

完整示例（把 v0.3.x 的 `contentRenderers['my-type']` 迁移到 provider match）：

```vue
<template>
  <tr-bubble-provider :content-renderer-matches="contentRendererMatches">
    <tr-bubble :content="content" />
  </tr-bubble-provider>
</template>

<script setup lang="ts">
import { defineComponent, h, markRaw } from 'vue'
import type { BubbleContentRendererMatch, BubbleContentRendererProps, ChatMessageContentItem } from '@opentiny/tiny-robot'

const MyTypeRenderer = defineComponent({
  props: {
    message: { type: Object, required: true },
    contentIndex: Number,
  },
  setup(props: BubbleContentRendererProps) {
    return () => {
      const content = props.message.content
      const item = Array.isArray(content) ? (content[props.contentIndex ?? 0] as ChatMessageContentItem) : null
      return h('div', {}, `MyType: ${item ? JSON.stringify(item) : ''}`)
    }
  },
})

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (_message, resolvedContent, contentIndex) => {
      const item = Array.isArray(resolvedContent) ? resolvedContent[contentIndex ?? 0] : null
      return Boolean(item && typeof item === 'object' && item.type === 'my-type')
    },
    renderer: markRaw(MyTypeRenderer),
  },
]

const content = [{ type: 'my-type', foo: 1 }, { type: 'text', content: 'hello' }]
</script>
```

> 注意：0.4.x 内置了不少 renderer（图片/markdown/工具/推理等），如果你在 v0.3.x 自己实现过这些类型，迁移时可以优先改为直接使用 `BubbleRenderers.*`。

### 7) 插槽迁移（slot 名称与参数变化）

常见迁移：

- v0.3.x `footer` / `trailer` → 0.4.x `content-footer` / `after`
- v0.3.x `loading` slot → 用 loading message + renderer/slot 实现

因为 0.4.x slot 参数是 **分组 messages**（不是单条 bubbleProps），如果你需要单条 message：

- 单 bubble：`messages[0]` 就是当前消息
- list 分组：遍历 `messages`，或配合 `messageIndexes` 反查原始消息数组

slot 改名示例（v0.3.x `footer` → 0.4.x `content-footer`）：

```vue
<!-- v0.3.x -->
<tr-bubble :content="content">
  <template #footer="{ bubbleProps }">
    <div style="margin-top: 8px; font-size: 12px; opacity: 0.7">id: {{ bubbleProps.id }}</div>
  </template>
</tr-bubble>
```

```vue
<!-- 0.4.x -->
<tr-bubble :content="content">
  <template #content-footer="{ messages }">
    <div style="margin-top: 8px; font-size: 12px; opacity: 0.7">id: {{ messages[0]?.id }}</div>
  </template>
</tr-bubble>
```

### 8) CSS 变量迁移（最常用的几个）

v0.3.x 主要围绕 `content`：

- `--tr-bubble-content-bg`
- `--tr-bubble-content-border-radius`
- `--tr-bubble-content-padding`

0.4.x 改为围绕 `box`：

- `--tr-bubble-box-bg`
- `--tr-bubble-box-border-radius`
- `--tr-bubble-box-padding`

> 注意：如果你在项目里像 demo 那样写了 `--tr-bubble-content-bg`，迁移到新版后应优先改为 `--tr-bubble-box-bg`（新版的“气泡背景”属于 box 层）。

并新增：

- `--tr-bubble-min-width`
- `--tr-bubble-box-shape-rounded-radius / --tr-bubble-box-shape-corner-radius`
- 图片/工具/推理相关变量（详见 `bubble.md`）

## 推荐迁移检查清单

- [ ] `BubbleList.items` 全部替换为 `messages`
- [ ] `roles` 重命名为 `roleConfigs`
- [ ] `loading + loadingRole` 改为 “loading message” 或 provider match
- [ ] `customContentField` 改为 `contentResolver`
- [ ] `aborted` 逻辑改为 `state` + 自定义渲染/插槽
- [ ] 旧插槽名全部替换为新插槽名，并适配 slot 参数（`messages` / `messageIndexes`）
- [ ] 样式变量从 `content-*` 迁移到 `box-*`
