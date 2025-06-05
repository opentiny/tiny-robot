---
outline: deep
---

# SuggestionPills 建议按钮组

## 代码示例

### 基本示例

使用配置式来配置按钮组的内部元素

元素超长会隐藏，会自动显示展开按钮。展开按钮也可以通过 `v-model:show-all` 控制

目前按钮支持3种类型，分别是：`popover`, `menu` 和默认的普通按钮

<demo vue="../../demos/suggestion/pills-popper-config.vue" />

如果你想自定义弹出容器的边距，使用 `:deep(.tr-suggestion-pills__more-wrapper)` 选择器

```less
:deep(.tr-suggestion-pills__more-wrapper) {
  left: 40px
}
```

由于目前弹窗是位于 SuggestionPills 内部，无法使用 mask 来实现右侧超出的按钮渐变。需要手动加上下面的样式

```less
:deep(.tr-suggestion-pills__container) {
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    // 背景色需要和容器背景色一致
    background: linear-gradient(to right, rgba(rgb(248, 248, 248), 0) 90%, rgba(rgb(248, 248, 248), 1));
    pointer-events: none;
  }
}
```

### 使用插槽（不推荐）

如果是使用默认插槽，`TrSuggestionPills` 的 `item-click` 事件是无效的。而且无法添加展开收起逻辑

<demo vue="../../demos/suggestion/pills-popper.vue" />

## API

### SuggestionPillsProps

药丸组件属性配置。

| 属性      | 类型                   | 说明                       |
| --------- | ---------------------- | -------------------------- |
| `items`   | `SuggestionPillItem[]` | 建议药丸项数据数组         |
| `showAll` | `boolean`              | 是否展开全部元素 (v-model) |

### SuggestionPillsSlots

药丸组件插槽定义。

| 插槽名    | 类型                     | 说明           | 状态   |
| --------- | ------------------------ | -------------- | ------ |
| `default` | `() => VNode \| VNode[]` | 自定义内容插槽 | 已废弃 |

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
