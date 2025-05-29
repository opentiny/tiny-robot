---
outline: deep
---

# SuggestionPills 建议按钮组

## 代码示例

### 基本示例

`SuggestionPills` 是一个横向容器，内部建议使用 `SuggestionPillButton` 元素

元素超长会隐藏，会自动显示更多按钮。更多按钮也可以通过 `v-model:show-more` 控制

> 如果是使用默认插槽，`TrSuggestionPills` 的 `item-click` 事件是无效的。因为 `TrSuggestionPills` 无法得知插槽元素具体的数据结构。如果需要统一通过 `item-click` 事件来处理点击，需要[使用配置式](#使用配置式)

<demo vue="../../demos/suggestion/pills-basic.vue" />

### 结合弹出框

<demo vue="../../demos/suggestion/pills-popper.vue" />

### 使用配置式

使用配置式时，内部按钮点击事件可以通过 `item-click` 统一处理。目前按钮支持3种类型，分别是：`popover`, `menu` 和默认的普通按钮

<demo vue="../../demos/suggestion/pills-popper-config.vue" />

### 综合示例

下面的综合示例将星星按钮单独放到左侧，与文本按钮分隔开

<demo vue="../../demos/suggestion/pills-popper-full.vue" />

## API

### SuggestionPillsProps

药丸组件属性配置。

| 属性             | 类型                   | 说明                                   |
| ---------------- | ---------------------- | -------------------------------------- |
| `items`          | `SuggestionPillItem[]` | 建议药丸项数据数组                     |
| `model:showMore` | `boolean`              | 是否展开更多内容，当内部元素超长时有效 |

### SuggestionPillsSlots

药丸组件插槽定义。

| 插槽名    | 类型                     | 说明           |
| --------- | ------------------------ | -------------- |
| `default` | `() => VNode \| VNode[]` | 自定义内容插槽 |

### SuggestionPillsEmits

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
