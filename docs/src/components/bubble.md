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

通过 `shape` 设置气泡形状。目前提供了 `rounded` 和 `corner` 两个选项。默认为 `corner`

<demo vue="../../demos/bubble/shape.vue" />

### 加载中

通过 `loading` 设置加载中状态

BubbleList 除了需要设置 `loading`，还需要设置 `loading-role`。需要注意的是，列表的加载中气泡实际上并没有新增一条消息，`loading` 设置为 `false` 后，加载中的气泡不会渲染

<demo vue="../../demos/bubble/loading.vue" />

### 用户停止

通过 `aborted` 设置用户停止状态

<demo vue="../../demos/bubble/aborted.vue" />

### 最大宽度

通过 `maxWidth` 设置气泡最大宽度

<demo vue="../../demos/bubble/max-width.vue" />

### 渲染 markdown

<demo vue="../../demos/bubble/markdown.vue" />

### 流式文本

`content` 属性是响应式的，动态设置 `content` 即可实现流式文本

<demo vue="../../demos/bubble/streaming.vue" />

### 多种消息格式

`BubbleProvider` 管理和注册消息渲染器。渲染器注册机制

当 Bubble 组件的 `content` 是长度大于0的数组时，系统会：

1.检查每数组项的 `type` 字段  
2.在 `BubbleProvider` 中查找匹配的渲染器  
3.使用找到的渲染器渲染消息内容  
4.如果未找到匹配的渲染器，则使用默认渲染方式

有三种方式可以实现自定义消息渲染器：

1.**函数式渲染器**：

```typescript
const myRenderer: BubbleContentFunctionRenderer = (options) => {
  return h('div', options.content)
}
```

2.**类式渲染器**：

必须继承 `BubbleContentClassRenderer` 类

类渲染器通常用来复用复杂度较高的渲染器，比如MarkdownIt实例

```typescript
class MyRenderer extends BubbleContentClassRenderer {
  render(options) {
    return h('div', options.content)
  }
}
```

注册时记得 new 一个实例，否则会导致渲染失败

```vue
<template>
  <tr-bubble-provider :content-renderers="contentRenderers">
    <!-- other codes... -->
  </tr-bubble-provider>
</template>

<script>
const contentRenderers = { 'my-render': new MyRenderer() }
</script>
```

3.**Vue 组件**：

content 对象中的所有属性都将传递给组件，onXXX会当作事件传递给组件，非props属性会当作attrs传递给组件

```vue
<template>
  <div>{{ props.content }}</div>
</template>
```

目前内置直接可用的的渲染器类型有

- `text`(默认渲染器)
- `collapsible-text`
- `tool`

内置需要自行导入的渲染有

- `BubbleMarkdownContentRenderer` 类渲染器

<demo vue="../../demos/bubble/messages.vue" />

### 指定渲染属性

和大模型交互数据时，交互的原始数据中的 content 字段可能需要经过前端二次处理再展示到UI上，但此时我们又不想改动原始的 content 字段。此时可以通过 `customContentField` 属性来在前端指定你需要渲染的属性

<demo vue="../../demos/bubble/custom-content-field.vue" />

### 插槽

气泡组件提供了三个插槽，分别是 默认插槽, `loading` 插槽 和 `footer` 插槽

<demo vue="../../demos/bubble/slots.vue" />

### schema 卡片渲染

SchemaCard 组件代码如下

<demo vue="../../demos/bubble/schema-card.ce.vue" />

<demo vue="../../demos/bubble/schema-render.vue" />

### 列表

<demo vue="../../demos/bubble/list.vue" />

### 隐藏角色

角色配置中使用 `hidden` 来隐藏这个角色的所有消息

<demo vue="../../demos/bubble/list-hidden.vue" />

## API

### BubblePlacement

气泡位置类型：

```typescript
type BubblePlacement = 'start' | 'end'
```

- `'start'`: 气泡位于左侧/起始位置
- `'end'`: 气泡位于右侧/结束位置

### BubbleCommonProps

气泡通用属性配置。

| 属性                 | 类型                    | 默认值     | 说明                                                                                                          |
| -------------------- | ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| `placement`          | `BubblePlacement`       | -          | 气泡对齐位置 (`'start'` 或 `'end'`)                                                                           |
| `avatar`             | `VNode`                 | -          | 气泡头像部分的自定义 Vue 节点                                                                                 |
| `shape`              | `'rounded' \| 'corner'` | `'corner'` | 气泡形状                                                                                                      |
| `contentRenderer`    | `BubbleContentRenderer` | -          | 气泡内容渲染器（当 content 是非空数组时无效，使用 BubbleProvider 注册的渲染器）                               |
| `customContentField` | `string`                | -          | 自定义气泡内容字段。比如 customContentField 设置为 'my-content'，则 Bubble 优先渲染 my-content 属性到气泡内容 |
| `hidden`             | `boolean`               | -          | 是否隐藏气泡                                                                                                  |
| `maxWidth`           | `string \| number`      | -          | 气泡内容的最大宽度                                                                                            |

### BubbleProps

单个气泡的属性配置（继承自 BubbleCommonProps）。

| 属性      | 类型                            | 默认值  | 说明                                |
| --------- | ------------------------------- | ------- | ----------------------------------- |
| `content` | `string \| BubbleContentItem[]` | -       | 气泡内容                            |
| `id`      | `string \| number \| symbol`    | -       | 气泡唯一标识                        |
| `role`    | `string`                        | -       | 气泡角色标识，用于关联 `roles` 配置 |
| `loading` | `boolean`                       | `false` | 是否显示加载状态                    |
| `aborted` | `boolean`                       | `false` | 是否显示为已中止状态                |

---

### BubbleSlots

气泡组件的插槽定义。

| 插槽名    | 参数                           | 说明                                 |
| --------- | ------------------------------ | ------------------------------------ |
| `default` | `{ bubbleProps: BubbleProps }` | 默认内容插槽，用于自定义气泡内容     |
| `footer`  | `{ bubbleProps: BubbleProps }` | 底部插槽，用于在气泡底部添加内容     |
| `loading` | `{ bubbleProps: BubbleProps }` | 加载状态插槽，用于自定义加载状态显示 |

### BubbleRoleConfig

角色配置类型（继承自 BubbleCommonProps）。

```ts
type BubbleRoleConfig = BubbleCommonProps & {
  hidden?: boolean
  slots?: BubbleSlots
}
```

### BubbleListProps

气泡列表组件的属性配置。

| 属性          | 类型                                        | 默认值  | 说明                         |
| ------------- | ------------------------------------------- | ------- | ---------------------------- |
| `items`       | `(BubbleProps & { slots?: BubbleSlots })[]` | -       | **必填**，气泡项数组         |
| `roles`       | `Record<string, BubbleRoleConfig>`          | -       | 每个角色的默认配置项         |
| `loading`     | `boolean`                                   | `false` | 列表是否加载中               |
| `loadingRole` | `string`                                    | -       | 指定哪个角色可以有加载中状态 |
| `autoScroll`  | `boolean`                                   | `false` | 是否自动滚动到最新内容       |

### BubbleContentItem

单条消息对象的结构。

```typescript
interface BubbleContentItem {
  type: string
  [key: string]: any
}
```

| 属性            | 类型     | 说明                                             |
| --------------- | -------- | ------------------------------------------------ |
| `type`          | `string` | 消息类型，用于选择对应的渲染器                   |
| `[key: string]` | `any`    | 其他字段可自由扩展，用于携带消息所需的自定义数据 |

### BubbleContentRenderer

用于渲染气泡消息内容的渲染器类型。

```typescript
type BubbleContentRenderer = BubbleContentFunctionRenderer | BubbleContentClassRenderer | Component
```

- `BubbleContentFunctionRenderer`: 函数式渲染器，返回 `VNode`
- `BubbleContentClassRenderer`: 基于类的渲染器，需实现 `.render()` 方法
- `Component`: 任意 Vue 组件，也可以用作渲染器

### BubbleContentFunctionRenderer

函数式消息渲染器：

```typescript
type BubbleContentFunctionRenderer = (options: { [key: string]: any }) => VNode
```

| 参数      | 类型                     | 说明                                        |
| --------- | ------------------------ | ------------------------------------------- |
| `options` | `{ [key: string]: any }` | 与消息类型 (`BubbleContentItem`) 对应的数据 |
| 返回值    | `VNode`                  | 渲染结果                                    |

### BubbleContentClassRenderer

基于类的消息渲染器：

```typescript
abstract class BubbleContentClassRenderer {
  abstract render(options: { [key: string]: any }): VNode
}
```
