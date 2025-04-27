---
outline: deep
---

# Suggestion 快捷指令

快捷指令组件是一个用于显示快捷指令/提示的复合组件，支持胶囊式快捷指令和弹窗的快捷指令两种形式。

## 代码示例

- 支持胶囊式快捷指令，点击直接完成输入
- 支持下拉式快捷指令，可通过触发字符（默认为 `/`）激活
- 支持分类展示快捷指令
- 支持键盘导航和选择

## 使用示例

### 整合案例

<demo vue="../../demos/suggestion/All.vue" title="整合案例" description="Sender 组件整合 Suggestion 组件的案例" />

## API

### Props

| 属性名              | 类型             | 默认值     | 说明                     |
| ------------------- | ---------------- | ---------- | ------------------------ |
| items               | SuggestionItem[] | []         | 胶囊式快捷指令项列表     |
| categories          | Category[]       | []         | 分类列表（用于指令弹窗） |
| triggerKeys         | string[]         | ['/']      | 触发快捷指令的快捷键     |
| open                | boolean          | undefined  | 是否展开快捷指令弹窗     |
| loading             | boolean          | false      | 是否显示加载状态         |
| title               | string           | '快捷指令' | 下拉面板标题             |
| maxVisibleItems     | number           | 5          | 最大显示条目数           |
| closeOnClickOutside | boolean          | -          | 是否点击外部关闭         |

### Events

| 事件名          | 参数                                         | 说明                       |
| --------------- | -------------------------------------------- | -------------------------- |
| select          | value: string, triggerInfo?: TriggerPosition | 选择快捷指令项时触发       |
| open-change     | value: boolean                               | 指令弹窗打开状态变化时触发 |
| select-category | category: Category                           | 选择分类时触发             |
| close           | -                                            | 关闭指令弹窗时触发         |

### Slots

| 插槽名  | 参数                                                                     | 说明                   |
| ------- | ------------------------------------------------------------------------ | ---------------------- |
| trigger | { onTrigger: `TriggerHandler`, onKeyDown: (e: `KeyboardEvent`) => void } | 触发器插槽             |
| item    | { item: SuggestionItem }                                                 | 建议项自定义渲染       |
| empty   | -                                                                        | 无匹配结果时显示的内容 |

### Types

```typescript
// 快捷指令项
interface SuggestionItem {
  id: string
  text: string
  value: string
  icon?: VNode
  keywords?: string[]
  description?: string
}

// 分类
interface Category {
  id: string
  label: string
  icon?: VNode
  items: SuggestionItem[]
}

// 触发位置信息
interface TriggerPosition {
  text: string
  position: number
}
```
