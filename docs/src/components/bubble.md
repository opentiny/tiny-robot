---
outline: deep
---

# Bubble 气泡组件

Bubble 气泡组件用于展示消息气泡，支持流式文本、头像、位置、加载中、终止状态、操作按钮等功能。

## 代码示例

### 基本示例

基本示例

<demo vue="../../demos/bubble/basic.vue" />

### 头像和位置

通过 `avatar` 设置自定义头像，通过 `placement` 设置位置，提供了 `start`、`end` 两个选项

<demo vue="../../demos/bubble/avatar-and-placement.vue" />

### 气泡形状

通过 `shape` 设置气泡形状。目前提供了 `default` 和 `corner` 两个选项。默认为 `default`

<demo vue="../../demos/bubble/shape.vue" />

### 加载中

通过 `loading` 设置加载中状态

<demo vue="../../demos/bubble/loading.vue" />

### 用户停止

通过 `aborted` 设置用户停止状态

<demo vue="../../demos/bubble/aborted.vue" />

### 最大宽度

通过 `maxWidth` 设置气泡最大宽度

<demo vue="../../demos/bubble/max-width.vue" />

### 渲染 markdown

通过 `type` 设置气泡内容渲染格式，可选值为 `text` 或者 `markdown`

<demo vue="../../demos/bubble/markdown.vue" />

### 流式文本

`content` 属性是响应式的，动态设置 `content` 即可实现流式文本

<demo vue="../../demos/bubble/streaming.vue" />

### 推理

通过 `reasoning` 设置推理相关内容和状态

<demo vue="../../demos/bubble/reasoning.vue" />

### 插槽

气泡组件提供了三个插槽，分别是 默认插槽, `loading` 插槽 和 `footer` 插槽

<demo vue="../../demos/bubble/slots.vue" />

### schema 卡片渲染

SchemaCard 组件代码如下

<demo vue="../../demos/bubble/schema-card.vue" />

<demo vue="../../demos/bubble/schema-render.vue" />

### 列表

<demo vue="../../demos/bubble/list.vue" />

## API

### BubblePlacement

气泡位置类型：

```typescript
type BubblePlacement = 'start' | 'end'
```

- `'start'`: 气泡位于左侧/起始位置
- `'end'`: 气泡位于右侧/结束位置

### BubbleProps

单个气泡的属性配置。

| 属性        | 类型                                                           | 默认值      | 说明                                             |
| ----------- | -------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `content`   | `string`                                                       | -           | 气泡内容文本                                     |
| `id`        | `string \| number \| symbol`                                   | -           | 气泡唯一标识                                     |
| `placement` | `BubblePlacement`                                              | -           | 气泡位置 (`'start'` 或 `'end'`)                  |
| `avatar`    | `VNode`                                                        | -           | 气泡头像部分的自定义 Vue 节点                    |
| `role`      | `string`                                                       | -           | 气泡角色标识，用于关联 `roles` 配置              |
| `type`      | `'text' \| 'markdown'`                                         | `'text'`    | 内容类型：纯文本或 Markdown                      |
| `loading`   | `boolean`                                                      | `false`     | 是否显示加载状态                                 |
| `aborted`   | `boolean`                                                      | `false`     | 是否显示为已中止状态                             |
| `mdConfig`  | `MarkdownItOptions`                                            | -           | 当 `type='markdown'` 时，Markdown 解析器的配置项 |
| `maxWidth`  | `CSSProperties['maxWidth']`                                    | -           | 气泡内容的最大宽度                               |
| `shape`     | `'default' \| 'corner'`                                        | `'default'` | 气泡形状，默认圆角矩形                           |
| `reasoning` | `{ enabled?: boolean; content?: string; completed?: boolean }` | -           | 推理相关内容                                     |

### BubbleSlots

气泡组件的插槽定义。

| 插槽名    | 参数                           | 说明                                 |
| --------- | ------------------------------ | ------------------------------------ |
| `default` | `{ bubbleProps: BubbleProps }` | 默认内容插槽，用于自定义气泡内容     |
| `footer`  | `{ bubbleProps: BubbleProps }` | 底部插槽，用于在气泡底部添加内容     |
| `loading` | `{ bubbleProps: BubbleProps }` | 加载状态插槽，用于自定义加载状态显示 |

### BubbleRoleConfig

角色配置类型，用于定义不同角色的默认气泡配置。

```typescript
type BubbleRoleConfig = Pick<BubbleProps, 'placement' | 'avatar' | 'shape' | 'type' | 'mdConfig' | 'maxWidth'> & {
  slots?: BubbleSlots
}
```

### BubbleListProps

气泡列表组件的属性配置。

| 属性         | 类型                                        | 默认值  | 说明                           |
| ------------ | ------------------------------------------- | ------- | ------------------------------ |
| `items`      | `(BubbleProps & { slots?: BubbleSlots })[]` | -       | **必填**，气泡项数组           |
| `roles`      | `Record<string, BubbleRoleConfig>`          | -       | 角色默认配置字典，key 为角色名 |
| `autoScroll` | `boolean`                                   | `false` | 是否自动滚动到最新内容         |
