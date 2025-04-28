---
outline: deep
---

# History

## 代码示例

### 基本示例

基本示例。`tab-title` 为标题（由于 `title` 属性是内置 html 属性，防止冲突，使用 `tab-title`），`data` 为数据。使用 `selected` 控制选中的项，值为每一项的 `id`

<demo vue="../../demos/history/basic.vue" />

### 搜索框

使用 `search-bar` 控制是否显示搜索框。相应的还有 `search-placeholder`、`search-query`（这是一个双向绑定model）、`search-fn`（自定义搜索函数）

<demo vue="../../demos/history/search-bar.vue" />

### 多个页签

使用 `tab` 传入多个页签，每个 `tab` 有 `title` 和 `id` 两个属性，此时 `data` 是一个对象，key 指向对应的 `tab.id`。使用 `activeTab`（这是一个双向绑定model）来控制显示的哪个页签

<demo vue="../../demos/history/multi-tabs.vue" />

## API

### BaseHistoryProps 基础属性

| 属性                | 类型                                            | 必填 | 说明                         |
| ------------------- | ----------------------------------------------- | ---- | ---------------------------- |
| `activeTab`         | `string`                                        | 否   | 当前激活的标签页ID           |
| `searchBar`         | `boolean`                                       | 否   | 是否显示搜索栏，默认 `false` |
| `searchQuery`       | `string`                                        | 否   | 搜索关键词                   |
| `searchPlaceholder` | `string`                                        | 否   | 搜索框占位文本               |
| `searchFn`          | `(query: string, item: HistoryItem) => boolean` | 否   | 自定义搜索函数               |
| `selected`          | `string`                                        | 否   | 当前选中的历史项ID           |

### SingleTabHistoryProps 单标签页模式

继承 `BaseHistoryProps` 的所有属性，并添加：

| 属性       | 类型             | 必填 | 说明             |
| ---------- | ---------------- | ---- | ---------------- |
| `tabTitle` | `string`         | 是   | 标签页标题       |
| `data`     | `HistoryGroup[]` | 是   | 历史数据分组列表 |

### MultiTabHistoryProps 多标签页模式

继承 `BaseHistoryProps` 的所有属性，并添加：

| 属性   | 类型                              | 必填 | 说明                     |
| ------ | --------------------------------- | ---- | ------------------------ |
| `tabs` | `{ title: string; id: string }[]` | 是   | 标签页配置数组           |
| `data` | `Record<string, HistoryGroup[]>`  | 是   | 按标签页ID分组的历史数据 |

### HistoryGroup

| 属性    | 类型            | 说明                 |
| ------- | --------------- | -------------------- |
| `date`  | `string`        | 分组日期             |
| `items` | `HistoryItem[]` | 该分组下的历史项列表 |

### HistoryItemTagProps

| 属性    | 类型            | 说明       |
| ------- | --------------- | ---------- | ------- | ------ | ---------- | ---------------------- |
| `text`  | `string`        | 标签文本   |
| `type`  | `'success'      | 'warning'  | 'error' | 'info' | 'default'` | 标签类型，决定颜色样式 |
| `style` | `CSSProperties` | 自定义样式 |

### HistoryItem

| 属性    | 类型                  | 说明       |
| ------- | --------------------- | ---------- |
| `id`    | `string`              | 唯一标识   |
| `title` | `string`              | 标题       |
| `tag`   | `HistoryItemTagProps` | 标签配置   |
| `data`  | `T`                   | 自定义数据 |

### HistoryEvents

| 事件名              | 参数                                     | 说明             |
| ------------------- | ---------------------------------------- | ---------------- |
| `close`             | -                                        | 关闭事件         |
| `item-click`        | `item: HistoryItem`                      | 点击历史项时触发 |
| `item-title-change` | `newTitle: string, rawData: HistoryItem` | 标题修改时触发   |
| `item-delete`       | `item: HistoryItem`                      | 删除历史项时触发 |
