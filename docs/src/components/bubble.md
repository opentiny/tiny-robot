---
outline: [1, 3]
---

# Bubble 气泡组件

Bubble 气泡组件用于展示消息气泡，支持流式文本、头像、位置、加载中、终止状态、操作按钮等功能。

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

通过 `shape` 设置气泡形状。目前提供了 `rounded` 和 `corner` 两个选项。默认为 `corner`，可以使用 css 变量来设置圆角

- rounded 形状气泡圆角 `--tr-bubble-box-shape-rounded-radius`
- corner 形状气泡圆角 `--tr-bubble-box-shape-corner-radius`。这个 CSS 变量只会设置 corner 一个角的圆角，另外3个角则使用的 `--tr-bubble-box-shape-rounded-radius` 的值
- none 形状气泡圆角 `--tr-bubble-box-border-radius`

<demo vue="../../demos/bubble/shape.vue" />

### 加载中

通过 `loading` 设置加载中状态

<demo vue="../../demos/bubble/loading.vue"  />

### 渲染 markdown

Bubble 组件提供了 `markdown` 渲染器，可以渲染 markdown 内容。需要安装 `markdown-it` 和 `dompurify` 依赖

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

### 插槽

气泡组件提供了多个插槽，分别是 `prefix` 插槽, `suffix` 插槽、`content-footer` 插槽 和 `after` 插槽

<demo vue="../../demos/bubble/slots.vue" />

### schema 卡片渲染

<demo vue="../../demos/bubble/schema-render.vue" :vueFiles="['../../demos/bubble/schema-render.vue', '../../demos/bubble/schema-card.ce.vue']" playground="false" />

### 列表

<demo vue="../../demos/bubble/list.vue" />

### 隐藏角色

角色配置中使用 `hidden` 来隐藏这个角色的所有消息

<demo vue="../../demos/bubble/list-hidden.vue" />

### 自定义渲染器

**设置默认渲染器**

`Bubble`、`BubbleList`、`BubbleProvider` 组件都提供了 `fallback-box-renderer` 和 `fallback-content-renderer` 属性，用于设置默认渲染器。这里实际上是 fallback 机制，当无法匹配到合适的渲染器时，会使用默认渲染器。

上面的[渲染 markdown 示例](#渲染-markdown)中，就是通过 `fallback-content-renderer` 属性设置的 `BubbleRenderers.Markdown` 渲染器。

**自定义渲染器**

`BubbleProvider` 组件提供了 `box-renderer-matches` 和 `content-renderer-matches` 属性，用于设置渲染器匹配规则。

比如内置的 `BubbleRenderers.Reasoning` 渲染器，就是通过 `content-renderer-matches` 属性设置的。

```ts
const contentRendererMatches = [
  {
    find: (message) => typeof message.reasoning_content === 'string',
    renderer: markRaw(Reasoning),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
]
```

匹配规则可以使用 `priority` 属性来设置优先级，值越小优先级越高。

默认的匹配规则优先级如下：

- `BubbleRendererMatchPriority.LOADING`: -1

  通常基于 `message.loading` 判断。比如: `{ loading: true }`

- `BubbleRendererMatchPriority.NORMAL`: 0

  普通渲染器的默认优先级。未设置优先级时，默认使用该优先级

- `BubbleRendererMatchPriority.CONTENT`: 10

  通常基于 `message.content` 判断。比如: `{ content: [{ type: 'image_url', image_url: 'xxx' }] }`

- `BubbleRendererMatchPriority.ROLE`: 20

  通常基于 `message.role` 判断。比如: `{ role: 'tool' }`

内置渲染器有： `Image`、`Markdown`、`Reasoning`、`Text`、`Tool` 等。为了不修改源数据内部内容和结构，ui数据或者其他与后端无关的数据，单独放在了消息的 `state` 属性中。

<demo vue="../../demos/bubble/reasoning.vue" />

<demo vue="../../demos/bubble/tools.vue" />

实现一个自定义渲染器，Box 组件的 Props类型为 `BubbleBoxRendererProps`，内容渲染器为 `BubbleContentRendererProps`。比如：

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

## Props

**BubbleProps** - 单个气泡的属性配置

| 属性                      | 类型                                    | 默认值     | 说明                                                                                     |
| ------------------------- | --------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `role`                    | `string`                                | -          | 气泡角色标识，用于关联 `roleConfigs` 配置                                                |
| `content`                 | `string \| ChatMessageContentItem[]`    | -          | 气泡内容                                                                                 |
| `reasoning_content`       | `string`                                | -          | 推理内容（用于 Reasoning 渲染器）                                                        |
| `tool_calls`              | `ToolCall[]`                            | -          | 工具调用列表（用于 Tool 渲染器）                                                         |
| `tool_call_id`            | `string`                                | -          | 工具调用 ID                                                                              |
| `name`                    | `string`                                | -          | 消息名称                                                                                 |
| `id`                      | `string \| number \| symbol`            | -          | 气泡唯一标识                                                                             |
| `loading`                 | `boolean`                               | `false`    | 是否显示加载状态                                                                         |
| `state`                   | `Record<string, unknown>`               | -          | 消息状态数据（用于存储 UI 相关的数据，不会影响消息内容）                                 |
| `hidden`                  | `boolean`                               | `false`    | 是否隐藏气泡                                                                             |
| `avatar`                  | `VNode \| Component`                    | -          | 气泡头像部分的自定义 Vue 节点或组件                                                      |
| `placement`               | `'start' \| 'end'`                      | `'start'`  | 气泡对齐位置                                                                             |
| `shape`                   | `'corner' \| 'rounded' \| 'none'`       | `'corner'` | 气泡形状                                                                                 |
| `contentRenderMode`       | `'single' \| 'split'`                   | `'single'` | 内容渲染模式。`'single'` 表示所有内容在一个 box 中，`'split'` 表示每个内容项单独一个 box |
| `fallbackBoxRenderer`     | `Component<BubbleBoxRendererProps>`     | -          | 默认 box 渲染器（当无法匹配到合适的渲染器时使用）                                        |
| `fallbackContentRenderer` | `Component<BubbleContentRendererProps>` | -          | 默认内容渲染器（当无法匹配到合适的渲染器时使用）                                         |

**BubbleListProps** - 气泡列表组件的属性配置

| 属性                | 类型                                                | 默认值        | 说明                                                                                                                              |
| ------------------- | --------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `messages`          | `BubbleMessage[]`                                   | -             | **必填**，消息数组                                                                                                                |
| `groupStrategy`     | `'consecutive' \| 'divider' \| BubbleGroupFunction` | `'divider'`   | 分组策略：<br/>- `'consecutive'`: 连续相同角色的消息合并为一组<br/>- `'divider'`: 按分割角色分组<br/>- 自定义函数: 自定义分组逻辑 |
| `dividerRole`       | `string`                                            | `'user'`      | `'divider'` 策略的分割角色，具有此角色的消息将作为分割线                                                                          |
| `fallbackRole`      | `string`                                            | `'assistant'` | 当消息没有角色或角色为空时，使用此角色                                                                                            |
| `roleConfigs`       | `Record<string, BubbleRoleConfig>`                  | -             | 每个角色的默认配置项（头像、位置、形状等）                                                                                        |
| `contentRenderMode` | `'single' \| 'split'`                               | -             | 内容渲染模式                                                                                                                      |
| `autoScroll`        | `boolean`                                           | `false`       | 是否自动滚动到底部。需要满足以下条件：<br/>- BubbleList 是可滚动容器（需要 scrollHeight > clientHeight）<br/>- 滚动容器接近底部   |

**BubbleProviderProps** - 气泡提供者组件的属性配置

| 属性                      | 类型                                    | 默认值 | 说明                                                       |
| ------------------------- | --------------------------------------- | ------ | ---------------------------------------------------------- |
| `boxRendererMatches`      | `BubbleBoxRendererMatch[]`              | -      | Box 渲染器匹配规则数组                                     |
| `contentRendererMatches`  | `BubbleContentRendererMatch[]`          | -      | 内容渲染器匹配规则数组                                     |
| `fallbackBoxRenderer`     | `Component<BubbleBoxRendererProps>`     | -      | 默认 box 渲染器（当无法匹配到合适的渲染器时使用）          |
| `fallbackContentRenderer` | `Component<BubbleContentRendererProps>` | -      | 默认内容渲染器（当无法匹配到合适的渲染器时使用）           |
| `store`                   | `Record<string, unknown>`               | -      | 全局状态存储，用于在 BubbleList 和 Bubble 组件之间共享数据 |

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
  id?: string | number | symbol
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
  find: (messages: BubbleMessage[], contentIndex?: number) => boolean
  renderer: Component<BubbleBoxRendererProps>
  priority?: number
  attributes?: Record<string, string>
}
```

**BubbleContentRendererMatch** - 内容渲染器匹配规则

```typescript
type BubbleContentRendererMatch = {
  find: (message: BubbleMessage, contentIndex?: number) => boolean
  renderer: Component<BubbleContentRendererProps>
  priority?: number
  attributes?: Record<string, string>
}
```

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
  contentIndex?: number
}
```

**BubbleGroupFunction** - 自定义分组函数类型

```typescript
type BubbleGroupFunction = (messages: BubbleMessage[], dividerRole?: string) => BubbleMessageGroup[]
```

## CSS 变量

**Bubble 根元素**

| 变量名                  | 说明           |
| ----------------------- | -------------- |
| `--tr-bubble-gap`       | 头像与内容间距 |
| `--tr-bubble-max-width` | 气泡最大宽度   |

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

| 变量名                            | 说明                         |
| --------------------------------- | ---------------------------- |
| `--tr-bubble-tool-call-space-y`   | 工具调用之间的垂直间距       |
| `--tr-bubble-tool-call-min-width` | 工具调用的最小宽度           |
| `--tr-bubble-tool-call-max-width` | 工具调用的最大宽度           |
| `--tr-bubble-tool-key-color`      | 工具调用 JSON 中 key 的颜色  |
| `--tr-bubble-tool-number-color`   | 工具调用 JSON 中数字的颜色   |
| `--tr-bubble-tool-string-color`   | 工具调用 JSON 中字符串的颜色 |
| `--tr-bubble-tool-boolean-color`  | 工具调用 JSON 中布尔值的颜色 |
| `--tr-bubble-tool-null-color`     | 工具调用 JSON 中 null 的颜色 |

**BubbleList 容器变量**

| 变量名                     | 说明             |
| -------------------------- | ---------------- |
| `--tr-bubble-list-gap`     | 气泡项之间的间距 |
| `--tr-bubble-list-padding` | 容器内边距       |
