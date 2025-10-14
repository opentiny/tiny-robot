---
outline: [1, 3]
---

# Prompts 提示集组件

Prompts 是一个用于展示提示列表的通用组件，包含多个提示项，支持自定义样式、禁用状态、徽章、纵向展示、自动换行、响应式布局、底部内容等功能。

## 代码示例

### 基本

基本用法

<demo vue="../../demos/prompts/basic.vue" />

### 大小

使用 `size` 属性，控制 Prompt 项的大小。默认大小为 `medium`，可选值为 `small`、`medium`、`large`。

<demo vue="../../demos/prompts/size.vue" />

### 禁用状态

要将 Prompt 标记为禁用，请向 Prompt 添加 `disabled` 属性

<demo vue="../../demos/prompts/disabled.vue" />

### 徽章

使用 `badge` 属性，给 Prompt 项右上角添加徽章

<demo vue="../../demos/prompts/badge.vue" />

### 纵向展示

使用 `vertical` 属性，控制 Prompts 展示方向。

<demo vue="../../demos/prompts/vertical.vue" />

### 自动换行

使用 `wrap` 属性，控制 Prompts 超出区域长度时是否可以换行

<demo vue="../../demos/prompts/wrap.vue" />

### 响应式布局

配合 `wrap` 与 `item-style` 或者 `item-class` 实现响应式布局

<demo vue="../../demos/prompts/responsive.vue" />

### 底部内容

使用 `footer` 插槽，给 Prompts 列表底部添加内容

<demo vue="../../demos/prompts/footer.vue" />

## API

### PromptProps

单个提示项的属性配置。

| 属性          | 类型              | 必填 | 说明                                                                                 |
| ------------- | ----------------- | ---- | ------------------------------------------------------------------------------------ |
| `label`       | `string`          | 是   | 提示标签，显示提示的主要内容                                                         |
| `id`          | `string`          | 否   | 唯一标识用于区分每个提示项，用于 Prompts 列表。如果不传此参数，则使用 index 作为 key |
| `description` | `string`          | 否   | 提示描述，提供额外的信息                                                             |
| `icon`        | `VNode`           | 否   | 提示图标，显示在提示项的左侧                                                         |
| `disabled`    | `boolean`         | 否   | 是否禁用，默认 `false`                                                               |
| `badge`       | `string \| VNode` | 否   | 提示徽章，显示在提示项的右上角                                                       |

### PromptsProps

提示列表组件的属性配置。

| 属性        | 类型                      | 必填 | 说明                                 |
| ----------- | ------------------------- | ---- | ------------------------------------ |
| `items`     | `PromptProps[]`           | 是   | 包含多个提示项的列表                 |
| `itemStyle` | `string \| CSSProperties` | 否   | 自定义样式，用于各个提示项的不同部分 |
| `itemClass` | `string \| string[]`      | 否   | 自定义类名，用于各个提示项的不同部分 |
| `vertical`  | `boolean`                 | 否   | 提示列表是否垂直排列，默认 `false`   |
| `wrap`      | `boolean`                 | 否   | 提示列表是否折行，默认 `false`       |

### PromptsEvents

提示列表组件的事件定义。

| 事件名       | 参数                                  | 说明               |
| ------------ | ------------------------------------- | ------------------ |
| `item-click` | `(ev: MouseEvent, item: PromptProps)` | 当点击提示项时触发 |

### PromptsSlots

提示列表组件的插槽定义。

| 插槽名   | 说明                                       |
| -------- | ------------------------------------------ |
| `footer` | 底部插槽，用于在提示列表底部添加自定义内容 |

### CSS 变量

#### Prompt 组件变量

Prompt 根元素

| 变量名                      | 说明             |
| --------------------------- | ---------------- |
| `--tr-prompt-bg`            | 提示项背景色     |
| `--tr-prompt-bg-hover`      | 提示项悬停背景色 |
| `--tr-prompt-bg-active`     | 提示项激活背景色 |
| `--tr-prompt-bg-disabled`   | 提示项禁用背景色 |
| `--tr-prompt-border-radius` | 圆角大小         |
| `--tr-prompt-shadow`        | 阴影效果         |
| `--tr-prompt-width`         | 提示项宽度       |
| `--tr-prompt-padding`       | 内边距           |
| `--tr-prompt-gap`           | 图标与内容间距   |

title 标题

| 变量名                          | 说明         |
| ------------------------------- | ------------ |
| `--tr-prompt-title-color`       | 标题文字颜色 |
| `--tr-prompt-title-font-size`   | 标题字号     |
| `--tr-prompt-title-line-height` | 标题行高     |
| `--tr-prompt-title-font-weight` | 标题字重     |

content 内容

| 变量名                    | 说明           |
| ------------------------- | -------------- |
| `--tr-prompt-content-gap` | 标题与描述间距 |

description 描述

| 变量名                                | 说明         |
| ------------------------------------- | ------------ |
| `--tr-prompt-description-color`       | 描述文字颜色 |
| `--tr-prompt-description-font-size`   | 描述字号     |
| `--tr-prompt-description-line-height` | 描述行高     |

badge 徽章

| 变量名                          | 说明         |
| ------------------------------- | ------------ |
| `--tr-prompt-badge-bg`          | 徽章背景色   |
| `--tr-prompt-badge-color`       | 徽章文字颜色 |
| `--tr-prompt-badge-padding`     | 徽章内边距   |
| `--tr-prompt-badge-font-size`   | 徽章字号     |
| `--tr-prompt-badge-line-height` | 徽章行高     |

#### Prompt 组件尺寸变量

Prompt 组件 `size` 属性可选值有 `small`、`medium`、`large`，默认值为 `medium`。不同尺寸对应的变量是如下变量名后缀加上 `-small`、`-medium`、`-large`。

| 变量名                                | 说明       |
| ------------------------------------- | ---------- |
| `--tr-prompt-padding`                 | 内边距     |
| `--tr-prompt-gap`                     | 图标间距   |
| `--tr-prompt-title-font-size`         | 标题字号   |
| `--tr-prompt-title-line-height`       | 标题行高   |
| `--tr-prompt-content-gap`             | 内容间距   |
| `--tr-prompt-description-font-size`   | 描述字号   |
| `--tr-prompt-description-line-height` | 描述行高   |
| `--tr-prompt-badge-padding`           | 徽章内边距 |
| `--tr-prompt-badge-font-size`         | 徽章字号   |
| `--tr-prompt-badge-line-height`       | 徽章行高   |

比如 `--tr-prompt-padding` 变量，对应不同尺寸的变量如下：

| 变量名                       | size   |
| ---------------------------- | ------ |
| `--tr-prompt-padding-small`  | small  |
| `--tr-prompt-padding-medium` | medium |
| `--tr-prompt-padding-large`  | large  |

#### Prompts 容器变量

| 变量名             | 说明             |
| ------------------ | ---------------- |
| `--tr-prompts-gap` | 提示项之间的间距 |
