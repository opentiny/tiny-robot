---
outline: deep
---

# SuggestionPopover 建议弹出框

## 代码示例

### 基本示例

使用 `data` 传入数据，

<demo vue="../../demos/suggestion/popover-basic.vue" />

### 触发方式

使用 `trggier` 来决定弹出框的触发方式。目前有 `click` 和 `manual` 两种方式，默认为 `click`。`trggier` 为 `manual` 时，需要你手动修改弹出框显示状态

<demo vue="../../demos/suggestion/popover-trigger.vue" />

### 分组数据

`data` 数组中的项，添加 `group` 字段来表示为分组数据。分组数据和普通数据不能混合

<demo vue="../../demos/suggestion/popover-grouped.vue" />

### 加载中和空数据

<demo vue="../../demos/suggestion/popover-other-status.vue" />

### 移动端适配

> 目前移动端判断逻辑是，视窗宽度小于 768px

将窗口宽度缩小到 768px，可以点击查看上面的示例

## API

### Props

弹出框属性配置。

| 属性                   | 类型                             | 默认值    | 说明                                                           |
| ---------------------- | -------------------------------- | --------- | -------------------------------------------------------------- |
| `data`                 | `SuggestionData`                 | -         | **必填**，建议数据                                             |
| `title`                | `string`                         | -         | 弹出框标题                                                     |
| `icon`                 | `VNode \| Component`             | -         | 标题图标                                                       |
| `show`                 | `boolean`                        | -         | 控制弹出框显示/隐藏，仅在 trigger 为 'manual' 时有效 |
| `trigger`              | `'click' \| 'manual'` | `'click'` | 触发方式：点击或手动控制                                 |
| `selectedGroup`        | `string`                         | -         | 当前选中分组 (v-model)                                         |
| `groupShowMoreTrigger` | `'click' \| 'hover'`             | -         | 分组"显示更多"的触发方式                                       |
| `loading`              | `boolean`                        | `false`   | 是否显示加载状态                                               |
| `popoverWidth`         | `string \| number`               | -         | 弹出框宽度                                                     |
| `popoverHeight`        | `string \| number`               | -         | 弹出框高度                                                     |
| `topOffset`            | `string \| number`               | -         | 顶部偏移量                                                     |

### Slots

弹出框插槽定义。

| 插槽名    | 类型            | 说明               |
| --------- | --------------- | ------------------ |
| `default` | `() => unknown` | 自定义内容插槽     |
| `loading` | `() => unknown` | 自定义加载状态显示 |
| `empty`   | `() => unknown` | 自定义空状态显示   |

### Events

弹出框事件定义。

| 事件名        | 参数                     | 说明             |
| ------------- | ------------------------ | ---------------- |
| `item-click`  | `item: SuggestionItem`   | 点击建议项时触发 |
| `group-click` | `group: SuggestionGroup` | 点击分组时触发   |
| `close`       | -                        | 弹窗关闭时触发   |

### Types

#### SuggestionItem

建议项数据结构。

| 属性   | 类型     | 说明       |
| ------ | -------- | ---------- |
| `id`   | `string` | 项唯一标识 |
| `text` | `string` | 显示文本   |

#### SuggestionGroup

建议分组数据结构。

| 属性    | 类型                 | 说明           |
| ------- | -------------------- | -------------- |
| `group` | `string`             | 分组标识       |
| `label` | `string`             | 分组显示名称   |
| `icon`  | `VNode \| Component` | 分组图标       |
| `items` | `SuggestionItem[]`   | 分组下的建议项 |

#### SuggestionData

建议数据联合类型：

```typescript
type SuggestionData = (SuggestionItem | SuggestionGroup)[]
```

表示数据可以是：

- 平铺的建议项数组 `SuggestionItem[]`
- 分组的建议项数组 `SuggestionGroup[]`
