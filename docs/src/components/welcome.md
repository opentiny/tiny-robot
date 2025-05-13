---
outline: deep
---

# Welcome

Welcome 是一个用于展示欢迎信息的通用组件，包含标题、描述、图标等内容。
组件支持自定义对齐方向、图标、底部内容等功能。

## 代码示例

### 基本

基础用法

<demo-plugin vue="../../demos/welcome/basic.vue" />

### 对齐方向

通过 `align` 属性设置对齐方向

<demo-plugin vue="../../demos/welcome/align.vue" />

### 底部内容

使用 `footer` 插槽，给 Welcome 底部添加内容

<demo-plugin vue="../../demos/welcome/footer.vue" />

## API

### Props

| 属性名        | 类型                            | 必填 | 默认值     | 说明                                |
| ------------- | ------------------------------- | ---- | ---------- | ----------------------------------- |
| `title`       | `string`                        | ✅   | —          | 标题                                |
| `description` | `string`                        | ✅   | —          | 标题描述                            |
| `align`       | `'left' \| 'center' \| 'right'` | ❌   | `'center'` | 内容对齐方式                        |
| `icon`        | `VNode`                         | ❌   | —          | 自定义图标节点，支持 Vue 组件或 JSX |

### 插槽

| 插槽     | 必填 | 默认值 | 说明             |
| -------- | ---- | ------ | ---------------- |
| `footer` | ❌   | —      | 组件底部内容插槽 |
