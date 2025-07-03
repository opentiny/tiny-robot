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

| 属性       | 类型                             | 默认值                            | 说明                                              |
| ---------- | -------------------------------- | --------------------------------- | ------------------------------------------------- |
| `appendTo` | `string \| HTMLElement`          | `'body'` 或者 shadow dom 的根节点 | 菜单挂载的目标容器                                |
| `items`    | `DropdownMenuItem[]`             | -                                 | **必填**，菜单项数据数组                          |
| `show`     | `boolean`                        | -                                 | 是否显示菜单，仅在 `trigger` 为 `'manual'` 时有效 |
| `trigger`  | `'click' \| 'hover' \| 'manual'` | `'click'`                         | 菜单触发方式：点击、悬停或手动控制                |

### Slots

下拉菜单插槽定义。

| 插槽名    | 类型                     | 说明               |
| --------- | ------------------------ | ------------------ |
| `trigger` | `() => VNode \| VNode[]` | 自定义触发元素插槽 |

### Events

下拉菜单事件定义。

| 事件名          | 参数                     | 说明                                                                       |
| --------------- | ------------------------ | -------------------------------------------------------------------------- |
| `item-click`    | `item: DropdownMenuItem` | 点击菜单项时触发                                                           |
| `click-outside` | `event: MouseEvent`      | 点击菜单外部区域时触发（仅在 `trigger` 为 `'click'` 或 `'manual'` 时有效） |

### Types

#### DropdownMenuItem

菜单项数据结构。

| 属性   | 类型     | 说明           |
| ------ | -------- | -------------- |
| `id`   | `string` | 菜单项唯一标识 |
| `text` | `string` | 菜单项显示文本 |

### CSS Variables

| 变量名                                   | 说明               | 默认值                         |
| ---------------------------------------- | ------------------ | ------------------------------ |
| `--tr-dropdown-menu-bg-color`            | 下拉菜单背景色     | `#ffffff`                      |
| `--tr-dropdown-menu-box-shadow`          | 下拉菜单阴影       | `0 0 20px rgba(0, 0, 0, 0.08)` |
| `--tr-dropdown-menu-min-width`           | 下拉菜单最小宽度   | `130px`                        |
| `--tr-dropdown-menu-item-color`          | 菜单项文字颜色     | `rgb(25, 25, 25)`              |
| `--tr-dropdown-menu-item-hover-bg-color` | 菜单项悬停时背景色 | `#f5f5f5`                      |
| `--tr-dropdown-menu-item-font-weight`    | 菜单项字体粗细     | `normal`                       |
