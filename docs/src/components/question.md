---
outline: deep
---

# Question 快捷问题组件

> [!CAUTION]
> 本组件准备弃用，请使用 [SuggestionPopover 建议弹出框](./suggestion-popover.html)和 [SuggestionPills 建议按钮组](./suggestion-pills.html) 组件

Question 是一个用于展示问题列表的通用组件，包含两个主要部分：热门问题弹窗和一般问题悬浮胶囊。

组件支持分类展示、问题列表的部分/全部显示切换以及暗色主题适配。

### 代码示例

<demo vue="../../demos/question/Base.vue" />

### 组件功能

1. **热门问题弹窗**：

   - 通过左侧固定按钮触发显示
   - 支持问题分类标签切换
   - 展示当前分类下的问题列表

2. **一般问题悬浮胶囊**：

   - 固定在右下角，可展开/收起
   - 展开后显示一般问题列表
   - 支持问题列表的部分/全部显示切换

3. **主题适配**：
   - 支持亮色/暗色主题切换
   - 所有样式变量都通过 CSS 变量定义，方便定制

### 组件属性 (Props)

| 属性名              | 类型              | 默认值       | 说明                           |
| ------------------- | ----------------- | ------------ | ------------------------------ |
| categories          | `Array<Category>` | 默认示例数据 | 分类数据（包含标签和问题列表） |
| commonQuestions     | `Array<Question>` | 默认示例数据 | 悬浮胶囊的一般问题列表         |
| initialExpanded     | `Boolean`         | `false`      | 悬浮胶囊初始是否展开           |
| modalWidth          | `String`          | `"60vw"`     | 弹窗宽度                       |
| theme               | `"light"｜"dark"` | `"light"`    | 主题配色                       |
| closeOnClickOutside | `Boolean`         | `true`       | 点击弹窗外部是否关闭           |
| loading             | `Boolean`         | `false`      | 数据加载状态                   |

### 组件事件 (Events)

| 事件名          | 参数                   | 说明             |
| --------------- | ---------------------- | ---------------- |
| question-click  | `(question: Question)` | 点击问题项时触发 |
| select-category | `(category: Category)` | 分类切换时触发   |

### 插槽 (Slots)

| 插槽名            | 作用域参数               | 说明                 |
| ----------------- | ------------------------ | -------------------- |
| category-label    | `{ category: Category }` | 自定义分类标签内容   |
| question-item     | `{ question: Question }` | 自定义问题项渲染     |
| loading-indicator | -                        | 数据加载时的加载动画 |
| empty-state       | -                        | 数据为空时的占位提示 |

### 实例方法

| 方法名            | 参数                   | 说明                        |
| ----------------- | ---------------------- | --------------------------- |
| openModal         | -                      | 打开热门问题弹窗            |
| closeModal        | -                      | 关闭热门问题弹窗            |
| toggleFloating    | -                      | 切换悬浮胶囊的展开/收起状态 |
| setActiveCategory | `(categoryId: string)` | 设置当前激活的分类          |
| refreshData       | -                      | 刷新数据                    |

### CSS 变量

所有样式变量都以 `--tr` 开头，主要包括：

- `--tr-question-primary-color`: 主色调
- `--tr-question-background-color`: 背景色
- `--tr-question-text-color`: 文本颜色
- `--tr-question-border-color`: 边框颜色
- `--tr-question-hover-color`: 悬停效果颜色
