---
outline: deep
---

# Bubble 气泡组件
Bubble 气泡组件用于展示消息气泡，支持流式文本、头像、位置、加载中、终止状态、操作按钮等功能。

<style scoped>
.vitepress-demo-plugin__container {
  background-color: rgb(248, 248, 248);
}
</style>

## 代码示例

### 基本示例

基本示例

<demo vue="../../demos/bubble/basic.vue" />

### 头像和位置

通过 `avatar` 设置自定义头像，通过 `placement` 设置位置，提供了 `start`、`end` 两个选项

<demo vue="../../demos/bubble/avatar-and-placement.vue" />

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

### 操作

通过 `actions` 设置气泡底部的操作。气泡组件内置了 `refresh` 和 `copy` 两个操作。`copy` 已经内置实现了复制功能。自定义操作请查看 [BubbleActionOptions](#BubbleActionOptions) 类型说明

<demo vue="../../demos/bubble/actions.vue" />

### 插槽

气泡组件提供了三个插槽，分别是 默认插槽, `loading` 插槽 和 `footer` 插槽

<demo vue="../../demos/bubble/slots.vue" />

### 列表

<demo vue="../../demos/bubble/list.vue" />

## API

### BubbleProps

| Prop Name   | Type                        | Description                                 | Required | Default |
| ----------- | --------------------------- | ------------------------------------------- | -------- | ------- |
| `content`   | `string`                    | 气泡内容                                    | ❌       | —       |
| `id`        | `string`                    | 气泡唯一标识符（可选）                      | ❌       | —       |
| `placement` | `'start' \| 'end'`          | 气泡位置                                    | ❌       | `start` |
| `avatar`    | `VNode`                     | 自定义头像插槽内容                          | ❌       | —       |
| `role`      | `string`                    | 角色标识符（用于匹配角色配置）              | ❌       | —       |
| `type`      | `'text' \| 'markdown'`      | 内容格式类型                                | ❌       | `text`  |
| `loading`   | `boolean`                   | 是否显示加载中样式                          | ❌       | `false` |
| `aborted`   | `boolean`                   | 是否显示终止状态                            | ❌       | `false` |
| `mdConfig`  | `MarkdownItOptions`         | Markdown 渲染配置（当 type 为 markdown 时） | ❌       | —       |
| `actions`   | `BubbleAction[]`            | 操作按钮配置，支持字符串或配置项            | ❌       | —       |
| `maxWidth`  | `CSSProperties['maxWidth']` | 最大宽度                                    | ❌       | —       |

### BubbleAction

`BubbleAction` 类型为 `'copy' | 'refresh' | BubbleActionOptions`

`BubbleActionOptions` 类型说明如下

| 属性名  | 类型                                         | 描述                         |
| ------- | -------------------------------------------- | ---------------------------- |
| `name`  | `'copy' \| 'refresh' \| string`              | 操作名称                     |
| `vnode` | `VNode \| Component`                         | 自定义渲染内容（可选）       |
| `show`  | `boolean \| (props: BubbleProps) => boolean` | 是否显示操作按钮（支持函数） |

---

### BubbleSlots

| Slot Name | Description      |
| --------- | ---------------- |
| `default` | 气泡主内容       |
| `footer`  | 自定义底部区域   |
| `loading` | 自定义加载中样式 |

---

### BubbleEvents

| Event Name | Parameters                       | Description                |
| ---------- | -------------------------------- | -------------------------- |
| `copy`     | `(result: boolean)`              | 复制内容后的回调结果       |
| `refresh`  | `()`                             | 刷新事件                   |
| `action`   | `(name: string, ...args: any[])` | 通用操作事件，传入操作名称 |

---

### BubbleListProps

| Prop Name    | Type                               | Description        | Required | Default |
| ------------ | ---------------------------------- | ------------------ | -------- | ------- |
| `items`      | `BubbleProps[]`                    | 气泡列表           | ✅       | —       |
| `roles`      | `Record<string, BubbleRoleConfig>` | 各角色默认配置项   | ❌       | —       |
| `autoScroll` | `boolean`                          | 是否自动滚动到底部 | ❌       | `false` |

### BubbleRoleConfig

继承自 `BubbleProps` 的部分字段，用于设置每个角色的默认值：

- `placement`
- `avatar`
- `type`
- `mdConfig`
- `actions`
- `maxWidth`
