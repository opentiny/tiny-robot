---
outline: deep
---

# SuggestionPills 建议按钮组

## 代码示例

### 基本示例

<demo vue="../../demos/suggestion/pills-basic.vue" />

### 结合弹出框

<demo vue="../../demos/suggestion/pills-popper.vue" />

### 使用配置式结合弹出框

<demo vue="../../demos/suggestion/pills-popper-config.vue" />

## API

### SuggestionPillProps

药丸组件属性配置。

| 属性    | 类型                   | 说明               |
| ------- | ---------------------- | ------------------ |
| `items` | `SuggestionPillItem[]` | 建议药丸项数据数组 |

### SuggestionPillSlots

药丸组件插槽定义。

| 插槽名    | 类型                     | 说明           |
| --------- | ------------------------ | -------------- |
| `default` | `() => VNode \| VNode[]` | 自定义内容插槽 |

### SuggestionPillEmits

药丸组件事件定义。

| 事件名       | 参数                       | 说明             |
| ------------ | -------------------------- | ---------------- |
| `item-click` | `item: SuggestionPillItem` | 点击药丸项时触发 |

### SuggestionPillButtonProps

药丸按钮属性配置。

| 属性   | 类型                 | 说明       |
| ------ | -------------------- | ---------- |
| `item` | `SuggestionPillItem` | 药丸项数据 |

### SuggestionPillButtonSlots

药丸按钮插槽定义。

| 插槽名    | 类型            | 说明           |
| --------- | --------------- | -------------- |
| `default` | `() => unknown` | 自定义内容插槽 |
| `icon`    | `() => unknown` | 自定义图标插槽 |

### Types

#### SuggestionPillAction

建议药丸动作配置类型：

```typescript
type SuggestionPillAction =
  | {
      type: 'popover'
      props: SuggestionPopoverProps
      slots?: Omit<SuggestionPopoverSlots, 'default'>
      events?: SuggestionPopoverEvents
    }
  | {
      type: 'menu'
      props: DropdownMenuProps
      events?: DropdownMenuEvents
    }
```

表示动作可以是：

1. 弹出框类型 (popover) - 包含弹出框属性、插槽和事件
2. 下拉菜单类型 (menu) - 包含下拉菜单属性和事件

#### SuggestionPillBaseItem

建议药丸基础项类型：

```typescript
type SuggestionPillBaseItem<T> = {
  id: string
  action?: SuggestionPillAction
} & T
```

#### SuggestionPillItem

建议药丸项类型：

```typescript
type SuggestionPillItem<T = Record<string, unknown>> = SuggestionPillBaseItem<T> &
  ({ text: string; icon?: VNode | Component } | { text?: string; icon: VNode | Component })
```

表示每个药丸项必须包含：

- `id`: 唯一标识
- 必须包含 `text` 或 `icon` 至少一个
- 可选的 `action` 配置
