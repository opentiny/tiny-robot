---
outline: [1, 3]
---

# Bubble 气泡组件

:::danger 重大版本升级 v0.4
Bubble 在 v0.4 进行了重大升级。

**从 v0.3.x 升级？** 请查看 [Bubble 迁移指南](../migration/bubble-migration)。

**新项目：** 直接使用下方 v0.4 的 API 和示例即可。
:::

Bubble 气泡组件用于展示消息气泡，支持流式文本、头像、位置、加载中、终止状态、操作按钮等功能。组件采用渲染器架构，支持灵活的内容渲染和自定义扩展。

主要解决以下问题：

- **消息展示**：支持文本、图片、Markdown 等多种内容类型的渲染
- **流式输出**：支持流式文本展示，适用于 AI 对话场景
- **消息分组**：支持将连续相同角色的消息合并显示
- **自定义渲染**：通过渲染器系统支持自定义内容渲染逻辑
- **状态管理**：支持消息状态管理，用于存储 UI 相关的数据

## 代码示例

### 基本示例

基本示例。使用 `content` 属性设置气泡内容，可以使用 css 变量来设置样式，比如：

- 气泡背景 `--tr-bubble-box-bg`
- 气泡文字大小 `--tr-bubble-text-font-size`

> 更多 css 变量请参考 [CSS 变量](#css-变量)

<demo vue="../../demos/bubble/basic.vue" />

### 头像和位置

通过 `avatar` 设置自定义头像，通过 `placement` 设置位置，提供了 `start`、`end` 两个选项

<demo vue="../../demos/bubble/avatar-and-placement.vue" />

### 气泡形状

通过 `shape` 设置气泡形状。目前提供了 `rounded`、`corner` 和 `none` 三个选项。默认为 `corner`，可以使用 css 变量来设置圆角

- rounded 形状气泡圆角 `--tr-bubble-box-shape-rounded-radius`
- corner 形状气泡圆角 `--tr-bubble-box-shape-corner-radius`。这个 CSS 变量只会设置 corner 一个角的圆角，另外3个角则使用的 `--tr-bubble-box-shape-rounded-radius` 的值
- none 形状气泡圆角 `--tr-bubble-box-border-radius`

<demo vue="../../demos/bubble/shape.vue" />

### 加载中

通过 `loading` 设置加载中状态

<demo vue="../../demos/bubble/loading.vue"  />

### 渲染 markdown

Bubble 组件提供了 `markdown` 渲染器，可以渲染 markdown 内容。需要安装 `markdown-it` 和 `dompurify` 依赖

> BubbleList 使用自定义渲染器，需要使用 BubbleProvider 包裹，BubbleProvider 的详细 Props 信息请参考 [Props](#props)。

```bash
# npm
npm install markdown-it dompurify
# yarn
yarn add markdown-it dompurify
# pnpm
pnpm add markdown-it dompurify
```

<demo vue="../../demos/bubble/markdown.vue" />

### 流式文本

`content` 属性是响应式的，动态设置 `content` 即可实现流式文本

<demo vue="../../demos/bubble/streaming.vue" />

### 图片渲染

Bubble 组件支持渲染图片内容。当 `content` 为数组且包含 `type: 'image_url'` 的内容项时，会自动使用 Image 渲染器。

图文混合时，可以通过 `contentRenderMode` 控制渲染方式：

- `'single'` 模式：文本和图片在同一个 box 中渲染
- `'split'` 模式：每个内容项（文本或图片）单独一个 box

<demo vue="../../demos/bubble/image.vue" />

### 内容渲染模式

通过 `contentRenderMode` 设置内容渲染模式：

- `'single'`（默认）：所有内容在一个 box 中渲染
- `'split'`：当 `content` 为数组时，每个内容项单独一个 box

<demo vue="../../demos/bubble/content-render-mode.vue" />

> **注意**：`'single'` 模式会将所有内容在一个 box 中渲染（默认）。`'split'` 模式会在 `content` 为数组时，将每个内容项单独一个 box 渲染。

### 内容解析器

通过 `contentResolver` 可以自定义内容解析逻辑，用于从消息的其他字段提取内容。

<demo vue="../../demos/bubble/content-resolver.vue" />

> **注意**：默认情况下，组件使用 `message.content` 作为内容。如果需要自定义内容解析逻辑（例如从其他字段提取内容），可以通过 `contentResolver` 属性传入自定义函数。

### 插槽

气泡组件提供了多个插槽，分别是 `prefix` 插槽, `suffix` 插槽、`content-footer` 插槽 和 `after` 插槽

<demo vue="../../demos/bubble/slots.vue" />

### schema 卡片渲染

<demo vue="../../demos/bubble/schema-render.vue" :vueFiles="['../../demos/bubble/schema-render.vue', '../../demos/bubble/schema-card.ce.vue']" playground="false" />

### 列表

<demo vue="../../demos/bubble/list.vue" />

### 分组策略

BubbleList 支持多种分组策略。分组时，连续的 `hidden` 消息会归为同一组。

**连续分组（consecutive）**

连续相同角色的消息会被合并为一组。

<demo vue="../../demos/bubble/list-consecutive.vue" />

**自定义分组函数**

可以通过自定义函数实现更灵活的分组逻辑。

<demo vue="../../demos/bubble/list-custom-group.vue" />

**数组内容的展示**

当消息的 `content` 为数组时，每一项的渲染方式由 `contentRenderMode` 与**当前组的消息条数**共同决定：

- 若 `contentRenderMode` 为 `'split'` **且** 当前组仅包含 1 条消息，则数组的每一项会单独渲染为一个 box。
- 若不满足上述条件（例如为 `'single'` 模式，或组内有多条消息），则不会按数组项拆成多个 box，所有内容在同一 box 内渲染。

下方示例中，第一个气泡为单条消息且 `content` 为数组、`contentRenderMode="split"`，因此出现多个 box；其余气泡为单条消息且 `content` 为字符串，或组内有多条消息，因此每个气泡一个 box。

<demo vue="../../demos/bubble/list-array-content.vue" />

### 隐藏角色

角色配置中使用 `hidden` 来隐藏这个角色的所有消息

<demo vue="../../demos/bubble/list-hidden.vue" />

### 自动滚动

通过 `autoScroll` 属性启用自动滚动功能。当新消息添加时，如果滚动容器接近底部，会自动滚动到底部。

<demo vue="../../demos/bubble/list-auto-scroll.vue" />

> **注意**：`autoScroll` 功能有两种触发机制：
>
> 1. **常规自动滚动**：当消息内容变化时（如消息数量、内容、推理内容），如果满足以下条件会自动滚动：
>    - BubbleList 必须是可滚动容器（`scrollHeight > clientHeight`）
>    - 滚动容器需要接近底部
> 2. **用户消息特殊处理**：当最后一条消息的 `role` 为 `'user'` 时，会立即使用平滑滚动（`smooth`）滚动到底部，无需满足上述条件。这确保了用户发送消息后能立即看到自己发送的内容。

### 自定义渲染器

Bubble 组件采用渲染器架构，支持灵活的内容渲染和自定义扩展。渲染器系统分为两种类型：

- **Box 渲染器**：用于渲染消息的外层容器（box），控制气泡的样式和布局
- **Content 渲染器**：用于渲染消息的具体内容，如文本、图片、Markdown 等

#### 渲染器匹配机制

渲染器通过匹配规则来选择，匹配过程如下：

1. 按照优先级排序所有匹配规则（`priority` 值越小优先级越高）
2. 依次执行每个规则的 `find` 函数，找到第一个返回 `true` 的规则
3. 使用该规则对应的渲染器
4. 如果没有匹配到任何规则，使用 fallback 渲染器

#### 渲染器配置层级

渲染器配置支持三个层级，优先级从高到低：

1. **Prop 级别**：通过 `Bubble` 的 `fallback-box-renderer` 和 `fallback-content-renderer` 属性配置，只对当前组件生效
2. **Provider 级别**：通过 `BubbleProvider` 的 `box-renderer-matches`、`content-renderer-matches`、 `fallback-box-renderer` 和 `fallback-content-renderer` 属性配置，在整个组件树中生效
3. **Default 级别**：内置的默认渲染器和匹配规则

**设置 Fallback 渲染器**

当无法匹配到合适的渲染器时，会使用 fallback 渲染器。上面的[渲染 markdown 示例](#渲染-markdown)中，就是通过 `fallback-content-renderer` 属性设置的 `BubbleRenderers.Markdown` 渲染器。

```vue
<template>
  <tr-bubble :content="mdContent" :fallback-content-renderer="BubbleRenderers.Markdown"></tr-bubble>
</template>
```

#### 通过 BubbleProvider 配置渲染器

`BubbleProvider` 组件提供了 `box-renderer-matches` 和 `content-renderer-matches` 属性，用于设置渲染器匹配规则。通过 BubbleProvider 配置的渲染器会在整个组件树中生效，适合全局配置。

<demo vue="../../demos/bubble/provider-renderer.vue" />

#### 渲染器匹配优先级

匹配规则可以使用 `priority` 属性来设置优先级，值越小优先级越高。系统提供了以下优先级常量：

- `BubbleRendererMatchPriority.LOADING`: -1

  通常基于 `message.loading` 判断，用于加载状态渲染器。例如：`{ loading: true }`

- `BubbleRendererMatchPriority.NORMAL`: 0

  普通渲染器的默认优先级。未设置优先级时，默认使用该优先级

- `BubbleRendererMatchPriority.CONTENT`: 10

  通常基于 `message.content` 判断。例如：`{ content: [{ type: 'image_url', image_url: 'xxx' }] }`

- `BubbleRendererMatchPriority.ROLE`: 20

  通常基于 `message.role` 判断。例如：`{ role: 'tool' }`

> **注意**：渲染器匹配时，优先级数值越小优先级越高。自定义渲染器应该根据匹配条件选择合适的优先级。

#### 内置渲染器

组件内置了以下渲染器，可以通过 `BubbleRenderers` 访问：

- `BubbleRenderers.Box` - 默认 Box 渲染器
- `BubbleRenderers.Text` - 文本内容渲染器（默认 Content 渲染器）
- `BubbleRenderers.Image` - 图片渲染器
- `BubbleRenderers.Markdown` - Markdown 渲染器
- `BubbleRenderers.Loading` - 加载状态渲染器
- `BubbleRenderers.Reasoning` - 推理内容渲染器
- `BubbleRenderers.Tool` - 单个工具调用渲染器
- `BubbleRenderers.Tools` - 工具调用列表渲染器
- `BubbleRenderers.ToolRole` - 工具角色消息渲染器

<demo vue="../../demos/bubble/reasoning.vue" />

<demo vue="../../demos/bubble/tools.vue" />

#### 实现自定义渲染器

**Content 渲染器示例**

Content 渲染器接收 `BubbleContentRendererProps` 作为 props，包含 `message` 和可选的 `contentIndex`。

```vue
<script setup lang="ts">
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { defineComponent, markRaw, h } from 'vue'

// 方式一：使用 defineComponent
const CustomContentRenderer = defineComponent({
  props: {
    message: { type: Object, required: true },
    contentIndex: Number,
  },
  setup(props: BubbleContentRendererProps) {
    return () => h('div', { class: 'custom-content' }, props.message.content)
  },
})
</script>
```

或者使用 `.vue` 文件：

```vue
<!-- CustomRenderer.vue -->
<template>
  <div class="custom-content">
    {{ message.content }}
  </div>
</template>

<script setup lang="ts">
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'

defineProps<BubbleContentRendererProps>()
</script>
```

**Box 渲染器示例**

Box 渲染器接收 `BubbleBoxRendererProps` 作为 props，包含 `placement` 和 `shape`，并通过插槽渲染内容。

```vue
<script setup lang="ts">
import type { BubbleBoxRendererProps } from '@opentiny/tiny-robot'

defineProps<BubbleBoxRendererProps>()
</script>

<template>
  <div class="custom-box" :data-placement="placement" :data-shape="shape">
    <slot />
  </div>
</template>
```

**配置自定义渲染器**

配置自定义渲染器有两种方式：

**方式一：通过 BubbleProvider 配置匹配规则**（推荐用于全局配置）

<demo vue="../../demos/bubble/provider-renderer.vue" />

**方式二：通过 fallback 属性配置**（用于单个组件）

<demo vue="../../demos/bubble/custom-renderer.vue" />

**注意事项**

- 使用 `markRaw` 包装渲染器组件，避免 Vue 的响应式处理
- 为了不修改源数据内部内容和结构，UI 相关的数据应放在消息的 `state` 属性中
- Box 渲染器的 `find` 函数签名：`(messages, content, contentIndex) => boolean`，其中 `content` 仅在 split 模式有值
- Content 渲染器的 `find` 函数签名：`(message, content, contentIndex) => boolean`，`content` 为统一化后的 `ChatMessageContentItem`
- 在 Content 渲染器中可使用 `useMessageContent(props)` 获取当前 `content` 和 `contentText`，以正确处理 `contentIndex` 与数组内容

```vue
<template>
  <div>
    <div>这是自定义 content 渲染器</div>
    <div>{{ props.message.content }}</div>
  </div>
</template>

<script setup lang="ts">
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'

const props = defineProps<BubbleContentRendererProps>()
</script>
```

### 状态管理

Bubble 组件支持通过 `state` 属性存储 UI 相关的数据，并通过 `state-change` 事件来更新状态。这对于实现交互功能（如展开/收起、点赞等）非常有用。

<demo vue="../../demos/bubble/state-change.vue" />

> **注意**：消息的 `state` 属性用于存储 UI 相关的数据，不会影响消息内容。可以通过 `state-change` 事件来更新状态。

## Props

**BubbleProps** - 单个气泡的属性配置

| 属性                      | 类型                                                          | 默认值                         | 说明                                                                                     |
| ------------------------- | ------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| `role`                    | `string`                                                      | -                              | 气泡角色标识，用于关联 `roleConfigs` 配置                                                |
| `content`                 | `string \| ChatMessageContentItem[]`                          | -                              | 气泡内容                                                                                 |
| `reasoning_content`       | `string`                                                      | -                              | 推理内容（用于 Reasoning 渲染器）                                                        |
| `tool_calls`              | `ToolCall[]`                                                  | -                              | 工具调用列表（用于 Tool 渲染器）                                                         |
| `tool_call_id`            | `string`                                                      | -                              | 工具调用 ID                                                                              |
| `name`                    | `string`                                                      | -                              | 消息名称                                                                                 |
| `id`                      | `string`                                                      | -                              | 气泡唯一标识                                                                             |
| `loading`                 | `boolean`                                                     | `false`                        | 是否显示加载状态                                                                         |
| `state`                   | `Record<string, unknown>`                                     | -                              | 消息状态数据（用于存储 UI 相关的数据，不会影响消息内容）                                 |
| `hidden`                  | `boolean`                                                     | `false`                        | 是否隐藏气泡                                                                             |
| `avatar`                  | `VNode \| Component`                                          | -                              | 气泡头像部分的自定义 Vue 节点或组件                                                      |
| `placement`               | `'start' \| 'end'`                                            | `'start'`                      | 气泡对齐位置                                                                             |
| `shape`                   | `'corner' \| 'rounded' \| 'none'`                             | `'corner'`                     | 气泡形状                                                                                 |
| `contentRenderMode`       | `'single' \| 'split'`                                         | `'single'`                     | 内容渲染模式。`'single'` 表示所有内容在一个 box 中，`'split'` 表示每个内容项单独一个 box |
| `contentResolver`         | `(message: BubbleMessage) => ChatMessageContent \| undefined` | `(message) => message.content` | 内容解析函数，用于解析消息内容                                                           |
| `fallbackBoxRenderer`     | `Component<BubbleBoxRendererProps>`                           | -                              | 默认 box 渲染器（当无法匹配到合适的渲染器时使用）                                        |
| `fallbackContentRenderer` | `Component<BubbleContentRendererProps>`                       | -                              | 默认内容渲染器（当无法匹配到合适的渲染器时使用）                                         |

**BubbleListProps** - 气泡列表组件的属性配置

| 属性                | 类型                                                          | 默认值                         | 说明                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messages`          | `BubbleMessage[]`                                             | -                              | **必填**，消息数组                                                                                                                                                                                                                      |
| `groupStrategy`     | `'consecutive' \| 'divider' \| BubbleGroupFunction`           | `'divider'`                    | 分组策略：<br/>- `'consecutive'`: 连续相同角色的消息合并为一组<br/>- `'divider'`: 按分割角色分组（每条分割角色消息单独成组，其他消息在两个分割角色之间合并为一组）<br/>- 自定义函数: `(messages, dividerRole?) => BubbleMessageGroup[]` |
| `dividerRole`       | `string`                                                      | `'user'`                       | `'divider'` 策略的分割角色，具有此角色的消息将作为分割线                                                                                                                                                                                |
| `fallbackRole`      | `string`                                                      | `'assistant'`                  | 当消息没有角色或角色为空时，使用此角色                                                                                                                                                                                                  |
| `roleConfigs`       | `Record<string, BubbleRoleConfig>`                            | -                              | 每个角色的默认配置项（头像、位置、形状等）                                                                                                                                                                                              |
| `contentRenderMode` | `'single' \| 'split'`                                         | -                              | 内容渲染模式                                                                                                                                                                                                                            |
| `contentResolver`   | `(message: BubbleMessage) => ChatMessageContent \| undefined` | `(message) => message.content` | 内容解析函数，用于解析消息内容                                                                                                                                                                                                          |
| `autoScroll`        | `boolean`                                                     | `false`                        | 是否自动滚动到底部。需要满足以下条件：<br/>- BubbleList 是可滚动容器（需要 scrollHeight > clientHeight）<br/>- 滚动容器接近底部                                                                                                         |

**BubbleList Expose**

| 方法             | 签名                                           | 说明                                                                                  |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| `scrollToBottom` | `(behavior?: ScrollBehavior) => Promise<void>` | 滚动到底部。传入 `'smooth'` 可平滑滚动。若未启用 `autoScroll`，调用后无实际滚动效果。 |

**BubbleProviderProps** - 气泡提供者组件的属性配置

| 属性                      | 类型                                    | 默认值 | 说明                                                       |
| ------------------------- | --------------------------------------- | ------ | ---------------------------------------------------------- |
| `boxRendererMatches`      | `BubbleBoxRendererMatch[]`              | -      | Box 渲染器匹配规则数组                                     |
| `contentRendererMatches`  | `BubbleContentRendererMatch[]`          | -      | 内容渲染器匹配规则数组                                     |
| `fallbackBoxRenderer`     | `Component<BubbleBoxRendererProps>`     | -      | 默认 box 渲染器（当无法匹配到合适的渲染器时使用）          |
| `fallbackContentRenderer` | `Component<BubbleContentRendererProps>` | -      | 默认内容渲染器（当无法匹配到合适的渲染器时使用）           |
| `store`                   | `Record<string, unknown>`               | -      | 全局状态存储，用于在 BubbleList 和 Bubble 组件之间共享数据 |

## Emits

**Bubble 和 BubbleList 组件的事件**

| 事件名         | 参数类型                                                                      | 说明                                                                                                           |
| -------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `state-change` | `{ key: string; value: unknown; messageIndex: number; contentIndex: number }` | 当消息状态改变时触发。`key` 为状态键名，`value` 为状态值，`messageIndex` 为消息索引，`contentIndex` 为内容索引 |

## Slots

**Bubble 组件插槽**

| 插槽名           | 参数                                                                  | 说明                                     |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `prefix`         | `{ messages: BubbleMessage[]; role?: string }`                        | 前缀插槽，用于在气泡前添加内容           |
| `suffix`         | `{ messages: BubbleMessage[]; role?: string }`                        | 后缀插槽，用于在气泡后添加内容           |
| `after`          | `{ messages: BubbleMessage[]; role?: string }`                        | 尾部插槽，用于在气泡内容外部添加内容     |
| `content-footer` | `{ messages: BubbleMessage[]; role?: string; contentIndex?: number }` | 内容底部插槽，用于在气泡内容底部添加内容 |

**BubbleList 组件插槽**

| 插槽名           | 参数                                                                                            | 说明                                     |
| ---------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `prefix`         | `{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }`                        | 前缀插槽，用于在气泡前添加内容           |
| `suffix`         | `{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }`                        | 后缀插槽，用于在气泡后添加内容           |
| `after`          | `{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }`                        | 尾部插槽，用于在气泡内容外部添加内容     |
| `content-footer` | `{ messages: BubbleMessage[]; role?: string; contentIndex?: number; messageIndexes: number[] }` | 内容底部插槽，用于在气泡内容底部添加内容 |

## Types

**BubbleMessage** - 消息基础类型

```typescript
interface BubbleMessage<
  T extends ChatMessageContent = ChatMessageContent,
  S extends Record<string, unknown> = Record<string, unknown>,
> {
  role?: string
  content?: T
  reasoning_content?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
  name?: string
  id?: string
  loading?: boolean
  state?: S
}
```

**ChatMessageContent** - 消息内容类型

```typescript
type ChatMessageContent = string | ChatMessageContentItem[]
```

**ChatMessageContentItem** - 单条消息内容项的结构

```typescript
interface ChatMessageContentItem {
  type: string
  [key: string]: any
}
```

| 属性            | 类型     | 说明                                             |
| --------------- | -------- | ------------------------------------------------ |
| `type`          | `string` | 消息类型，用于选择对应的渲染器                   |
| `[key: string]` | `any`    | 其他字段可自由扩展，用于携带消息所需的自定义数据 |

**ToolCall** - 工具调用接口

```typescript
interface ToolCall {
  id: string
  type: 'function' | string
  function: {
    name: string
    arguments: string
  }
  [x: string]: any
}
```

**BubbleRoleConfig** - 角色配置类型

```typescript
type BubbleRoleConfig = Pick<
  BubbleProps,
  'avatar' | 'placement' | 'shape' | 'hidden' | 'fallbackBoxRenderer' | 'fallbackContentRenderer'
>
```

**BubbleBoxRendererMatch** - Box 渲染器匹配规则

```typescript
type BubbleBoxRendererMatch = {
  find: (
    messages: BubbleMessage[],
    content: ChatMessageContentItem | undefined,
    contentIndex: number | undefined,
  ) => boolean
  renderer: Component<BubbleBoxRendererProps>
  priority?: number
  attributes?: Record<string, string>
}
```

- `content`: 仅在 `split` 模式（`contentIndex` 为数字）时传入，为当前消息经 `contentResolver` 解析后对应索引的内容项；`contentIndex` 为 `undefined` 时 `content` 也为 `undefined`
- `contentIndex`: 仅在 split 模式下传入，此时 `messages` 长度为 1

**BubbleContentRendererMatch** - 内容渲染器匹配规则

```typescript
type BubbleContentRendererMatch = {
  find: (message: BubbleMessage, content: ChatMessageContentItem, contentIndex: number) => boolean
  renderer: Component<BubbleContentRendererProps>
  priority?: number
  attributes?: Record<string, string>
}
```

- `content`: 当前消息经 `contentResolver` 解析并统一化后的内容项；若为数组则取 `contentIndex` 对应项，若为字符串则转为 `{ type: 'text', text: string }`
- `contentIndex`: 内容索引，字符串解析时为 0

**BubbleBoxRendererProps** - Box 渲染器属性

```typescript
type BubbleBoxRendererProps = Pick<BubbleProps, 'placement' | 'shape'>
```

**BubbleContentRendererProps** - 内容渲染器属性

```typescript
type BubbleContentRendererProps<
  T extends ChatMessageContent = ChatMessageContent,
  S extends Record<string, unknown> = Record<string, unknown>,
> = {
  message: BubbleMessage<T, S>
  contentIndex: number
}
```

**BubbleGroupFunction** - 自定义分组函数类型

```typescript
type BubbleGroupFunction = (messages: BubbleMessage[], dividerRole?: string) => BubbleMessageGroup[]
```

**BubbleMessageGroup** - 消息分组类型

```typescript
type BubbleMessageGroup = {
  role: string
  messages: BubbleMessage[]
  messageIndexes: number[]
  startIndex: number
}
```

## CSS 变量

**Bubble 根元素**

| 变量名                  | 说明           |
| ----------------------- | -------------- |
| `--tr-bubble-gap`       | 头像与内容间距 |
| `--tr-bubble-max-width` | 气泡最大宽度   |
| `--tr-bubble-min-width` | 气泡最小宽度   |

**box 容器**

| 变量名                                 | 说明                                                        |
| -------------------------------------- | ----------------------------------------------------------- |
| `--tr-bubble-box-bg`                   | Box 背景色                                                  |
| `--tr-bubble-box-padding`              | Box 内边距                                                  |
| `--tr-bubble-box-border-radius`        | Box 圆角大小                                                |
| `--tr-bubble-box-shadow`               | Box 阴影效果                                                |
| `--tr-bubble-box-border`               | Box 边框样式                                                |
| `--tr-bubble-box-shape-rounded-radius` | rounded 形状气泡圆角                                        |
| `--tr-bubble-box-shape-corner-radius`  | corner 形状气泡的特定角圆角（start 为左上角，end 为右上角） |
| `--tr-bubble-box-image-padding`        | 图片类型 Box 的内边距                                       |
| `--tr-bubble-box-image-border`         | 图片类型 Box 的边框样式                                     |

**text 文本**

| 变量名                         | 说明         |
| ------------------------------ | ------------ |
| `--tr-bubble-text-color`       | 文本文字颜色 |
| `--tr-bubble-text-font-size`   | 文本字号     |
| `--tr-bubble-text-line-height` | 文本行高     |

**loading 加载**

| 变量名                      | 说明         |
| --------------------------- | ------------ |
| `--tr-bubble-loading-color` | 加载图标颜色 |
| `--tr-bubble-loading-size`  | 加载图标尺寸 |

**image 图片**

| 变量名                                     | 说明                              |
| ------------------------------------------ | --------------------------------- |
| `--tr-bubble-image-max-width`              | 图片最大宽度                      |
| `--tr-bubble-image-max-height`             | 图片最大高度                      |
| `--tr-bubble-image-border-radius`          | 图片圆角大小                      |
| `--tr-bubble-image-space-y`                | 图片之间的垂直间距                |
| `--tr-bubble-image-embedded-border`        | 嵌入在其他 box 中的图片边框样式   |
| `--tr-bubble-image-embedded-border-radius` | 嵌入在其他 box 中的图片圆角大小   |
| `--tr-bubble-image-embedded-margin-block`  | 嵌入在其他 box 中的图片垂直外边距 |

**tool 工具调用**

| 变量名                             | 说明                               |
| ---------------------------------- | ---------------------------------- |
| `--tr-bubble-tool-call-bg`         | 工具调用背景色                     |
| `--tr-bubble-tool-call-space-y`    | 工具调用之间的垂直间距             |
| `--tr-bubble-tool-call-min-width`  | 工具调用的最小宽度                 |
| `--tr-bubble-tool-call-max-width`  | 工具调用的最大宽度                 |
| `--tr-bubble-tool-call-max-height` | 工具调用详情最大高度（默认 300px） |
| `--tr-bubble-tool-key-color`       | 工具调用 JSON 中 key 的颜色        |
| `--tr-bubble-tool-number-color`    | 工具调用 JSON 中数字的颜色         |
| `--tr-bubble-tool-string-color`    | 工具调用 JSON 中字符串的颜色       |
| `--tr-bubble-tool-boolean-color`   | 工具调用 JSON 中布尔值的颜色       |
| `--tr-bubble-tool-null-color`      | 工具调用 JSON 中 null 的颜色       |

**reasoning 推理**

| 变量名                                    | 说明                                                          |
| ----------------------------------------- | ------------------------------------------------------------- |
| `--tr-bubble-reasoning-max-height`        | 推理内容最大高度（默认 300px）                                |
| `--tr-bubble-reasoning-side-border-width` | 推理内容左侧边线宽度（默认 1.5px）                            |
| `--tr-bubble-reasoning-side-border-color` | 推理内容左侧边线颜色（默认使用 `--tr-border-color-disabled`） |

**BubbleList 容器变量**

| 变量名                     | 说明             |
| -------------------------- | ---------------- |
| `--tr-bubble-list-gap`     | 气泡项之间的间距 |
| `--tr-bubble-list-padding` | 容器内边距       |
