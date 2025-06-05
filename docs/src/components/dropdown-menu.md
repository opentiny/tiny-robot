---
outline: deep
---

# DropdownMenu 下拉菜单

此组件目前仅针对 SuggestionPills 组件开发，可配置项暂不全面

## 代码示例

### 基本示例

<demo vue="../../demos/dropdown-menu/basic.vue" />

## API

### Props

下拉菜单属性配置。

| 属性        | 类型                 | 说明                     |
| ----------- | -------------------- | ------------------------ |
| `items`     | `DropdownMenuItem[]` | **必填**，菜单项数据数组 |
| `minWidth`  | `string \| number`   | 下拉菜单最小宽度         |
| `topOffset` | `string \| number`   | 下拉菜单顶部偏移量       |

### Slots

下拉菜单插槽定义。

| 插槽名    | 类型            | 说明           |
| --------- | --------------- | -------------- |
| `default` | `() => unknown` | 自定义内容插槽 |

### Events

下拉菜单事件定义。

| 事件名       | 参数                     | 说明             |
| ------------ | ------------------------ | ---------------- |
| `item-click` | `item: DropdownMenuItem` | 点击菜单项时触发 |

### Types

#### DropdownMenuItem

菜单项数据结构。

| 属性   | 类型     | 说明       |
| ------ | -------- | ---------- |
| `id`   | `string` | 项唯一标识 |
| `text` | `string` | 显示文本   |
