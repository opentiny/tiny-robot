---
outline: deep
---

# SuggestionPills 建议按钮组

## 代码示例

### 使用插槽

<demo vue="../../demos/suggestion/pills-popper.vue" />

## Props

**SuggestionPillsProps** - 药丸组件属性配置

| 属性              | 类型                      | 必填 | 默认值     | 说明                                                             |
| ----------------- | ------------------------- | ---- | ---------- | ---------------------------------------------------------------- |
| `showAll`         | `boolean`                 | 否   | -          | 是否展开全部元素 (v-model)                                       |
| `showAllButtonOn` | `'hover' \| 'always'`     | 否   | `'hover'`  | 显示"更多"按钮的时机                                             |
| `overflowMode`    | `'expand' \| 'scroll'`    | 否   | `'expand'` | 控制多余项的展示方式：`expand`为展开显示，`scroll`为横向滚动显示 |
| `autoScrollOn`    | `'mouseenter' \| 'click'` | 否   | -          | 鼠标悬停或点击时是否自动滚动到可见区域                           |

**SuggestionPillButtonProps** - 药丸按钮属性配置

| 属性   | 类型                 | 必填 | 说明       |
| ------ | -------------------- | ---- | ---------- |
| `item` | `SuggestionPillItem` | 是   | 药丸项数据 |

## Slots

**SuggestionPillsSlots** - 药丸组件插槽定义

| 插槽名    | 类型            | 说明           |
| --------- | --------------- | -------------- |
| `default` | `() => VNode[]` | 自定义内容插槽 |

**SuggestionPillButtonSlots** - 药丸按钮插槽定义

| 插槽名    | 类型            | 说明           |
| --------- | --------------- | -------------- |
| `default` | `() => unknown` | 自定义内容插槽 |
| `icon`    | `() => unknown` | 自定义图标插槽 |

## Events

| 事件名          | 参数                | 说明                   |
| --------------- | ------------------- | ---------------------- |
| `click-outside` | `event: MouseEvent` | 点击组件外部区域时触发 |

## Types

**SuggestionPillItem** - 建议药丸项类型

```typescript
type SuggestionPillItem = { text: string; icon?: VNode | Component } | { text?: string; icon: VNode | Component }
```

表示每个药丸项必须包含：

- `text` 或 `icon` 至少一个
- 支持自定义 Vue 组件或虚拟节点作为图标
