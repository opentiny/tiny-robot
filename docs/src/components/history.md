---
outline: [1, 3]
---

# History

## 代码示例

### 基本示例

直接传入数组数据，或者传入分组数据。

<demo vue="../../demos/history/basic.vue" />

### 空状态

<demo vue="../../demos/history/empty.vue" />

### 自定义菜单项

通过 `menuItems` 属性可以自定义历史项的菜单选项。

<demo vue="../../demos/history/custom-menu.vue" />

### 前置图标

通过 `icon` 属性可以为历史项添加前置图标。

<demo vue="../../demos/history/icon.vue" />

### 插槽

通过 `item-prefix` 插槽可以自定义历史项的前置内容。例如：复选框等。

<demo vue="../../demos/history/slot-item-prefix.vue" />

通过 `item-title` 插槽可以自定义历史项的标题显示内容。

<demo vue="../../demos/history/slot-item-title.vue" />

## Props

| 属性                          | 类型                              | 必填 | 默认值                                                                                                    | 说明                                                   |
| ----------------------------- | --------------------------------- | ---- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `data`                        | `HistoryData<T>`                  | 是   | -                                                                                                         | 历史数据（可以是 `HistoryItem[]` 或 `HistoryGroup[]`） |
| `selected`                    | `string`                          | 否   | -                                                                                                         | 当前选中的历史项ID                                     |
| `showRenameControls`          | `boolean`                         | 否   | `false`                                                                                                   | 是否显示重命名控制按钮                                 |
| `renameControlOnClickOutside` | `'confirm' \| 'cancel' \| 'none'` | 否   | `'confirm'`                                                                                               | 点击外部时的重命名控制行为：确认、取消或不处理         |
| `menuItems`                   | `HistoryMenuItem[]`               | 否   | `[{ id: 'rename', text: '重命名', icon: IconEditPen }, { id: 'delete', text: '删除', icon: IconDelete }]` | 自定义菜单项列表                                       |
| `menuListGap`                 | `number`                          | 否   | `8`                                                                                                       | 菜单项之间的间距（像素）                               |

## Slots

| 插槽名        | 参数       | 说明                                       |
| ------------- | ---------- | ------------------------------------------ |
| `item-prefix` | `{ item }` | 自定义历史项的前置内容，例如图标、复选框等 |
| `item-title`  | `{ item }` | 自定义历史项的标题显示内容                 |

## Events

| 事件名              | 参数                               | 说明             |
| ------------------- | ---------------------------------- | ---------------- |
| `item-click`        | `item: T`                          | 点击历史项时触发 |
| `item-title-change` | `newTitle: string, item: T`        | 标题修改时触发   |
| `item-action`       | `action: HistoryMenuItem, item: T` | 点击菜单项时触发 |

## Types

**HistoryData** - 历史数据类型

```typescript
type HistoryData<T extends HistoryItem> = T[] | HistoryGroup<T>[]
```

表示历史数据可以是：

1. 直接的历史项数组 `T[]`
2. 分组的历史项数组 `HistoryGroup<T>[]`

**HistoryGroup** - 历史分组类型

| 属性    | 类型               | 必填 | 说明                 |
| ------- | ------------------ | ---- | -------------------- |
| `group` | `string \| symbol` | 是   | 分组标识             |
| `items` | `T[]`              | 是   | 该分组下的历史项列表 |

**HistoryItem** - 历史项类型

| 属性          | 类型                 | 必填 | 说明           |
| ------------- | -------------------- | ---- | -------------- |
| `id`          | `string`             | 否   | 唯一标识       |
| `title`       | `string`             | 是   | 标题           |
| `icon`        | `Component \| VNode` | 否   | 前置图标       |
| `[x: string]` | `any`                | 否   | 其他自定义属性 |

**HistoryMenuItem** - 菜单项类型

| 属性   | 类型                 | 必填 | 说明           |
| ------ | -------------------- | ---- | -------------- |
| `id`   | `string`             | 是   | 菜单项唯一标识 |
| `text` | `string`             | 是   | 菜单项显示文本 |
| `icon` | `Component \| VNode` | 否   | 菜单项图标     |

## CSS 变量

**分组**

| 变量名                                 | 说明               |
| -------------------------------------- | ------------------ |
| `--tr-history-group-space-y`           | 分组之间的垂直间距 |
| `--tr-history-group-title-font-size`   | 分组标题字体大小   |
| `--tr-history-group-title-line-height` | 分组标题行高       |
| `--tr-history-group-title-padding`     | 分组标题内边距     |
| `--tr-history-group-title-color`       | 分组标题颜色       |

**历史项**

| 变量名                              | 说明                 |
| ----------------------------------- | -------------------- |
| `--tr-history-item-font-size`       | 历史项字体大小       |
| `--tr-history-item-line-height`     | 历史项行高           |
| `--tr-history-item-color`           | 历史项文字颜色       |
| `--tr-history-item-padding`         | 历史项内边距         |
| `--tr-history-item-padding-editing` | 编辑状态下的内边距   |
| `--tr-history-item-space-y`         | 历史项之间的垂直间距 |
| `--tr-history-item-hover-bg`        | 悬停背景色           |
| `--tr-history-item-border-radius`   | 历史项圆角           |
| `--tr-history-item-selected-bg`     | 选中背景色           |
| `--tr-history-item-selected-color`  | 选中文字颜色         |

**操作按钮**

| 变量名                              | 说明               |
| ----------------------------------- | ------------------ |
| `--tr-history-item-actions-gap`     | 操作按钮之间的间距 |
| `--tr-history-item-action-bg-hover` | 按钮悬停背景色     |

**编辑器**

| 变量名                                   | 说明           |
| ---------------------------------------- | -------------- |
| `--tr-history-item-editor-border-color`  | 编辑器边框颜色 |
| `--tr-history-item-editor-border-radius` | 编辑器圆角     |
| `--tr-history-item-editor-border-width`  | 编辑器边框宽度 |
| `--tr-history-item-editor-padding`       | 编辑器内边距   |
| `--tr-history-item-editor-outline`       | 编辑器轮廓线   |
| `--tr-history-item-editor-confirm-color` | 确认按钮颜色   |
| `--tr-history-item-editor-cancel-color`  | 取消按钮颜色   |

**空状态**

| 变量名                       | 说明         |
| ---------------------------- | ------------ |
| `--tr-history-empty-padding` | 空状态内边距 |

**菜单列表**

| 变量名                              | 说明             |
| ----------------------------------- | ---------------- |
| `--tr-history-menu-list-bg`         | 菜单列表背景色   |
| `--tr-history-menu-list-bg-hover`   | 菜单项悬停背景色 |
| `--tr-history-menu-list-box-shadow` | 菜单列表阴影     |

**菜单项**

| 变量名                                    | 说明               |
| ----------------------------------------- | ------------------ |
| `--tr-history-menu-item-color`            | 菜单项文字颜色     |
| `--tr-history-menu-item-text-color-hover` | 菜单项悬停文字颜色 |
