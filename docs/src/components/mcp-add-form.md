---
outline: [1, 3]
---

# McpAddForm 插件添加表单

McpAddForm 是一个用于添加插件的表单组件，支持表单添加和代码添加两种方式。

## 代码示例

### 基础用法

<demo vue="../../demos/mcp-add-form/basic.vue" />

## API

### Props

| Prop Name   | Description  | Type        | Required | Default |
| ----------- | ------------ | ----------- | -------- | ------- |
| `addType`   | 当前添加方式 | `AddType`   | ❌       | `form`  |
| `formData`  | 表单数据     | `McpAddFormData` | ❌  | —       |
| `codeData`  | 代码数据     | `string`    | ❌       | —       |

---

### Emits

| Event Name           | Description        | Parameters                           |
| -------------------- | ------------------ | ------------------------------------ |
| `update:addType`     | 添加方式变化时触发 | `(value: AddType)`                   |
| `confirm`            | 确认添加时触发     | `(type: AddType, data: McpAddFormData \| string)` |
| `cancel`             | 取消添加时触发     | —                                    |

---

### 类型定义

#### AddType

```typescript
type AddType = 'form' | 'code'
```

#### McpAddFormData

```typescript
interface McpAddFormData {
  name: string
  description: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers: string
  thumbnail?: File | null
}
```

---

### CSS 变量

McpAddForm 组件支持以下 CSS 变量来自定义样式：

#### 全局变量 (`:root`)

| 变量名                                             | 描述           |
| -------------------------------------------------- | -------------- |
| `--tr-mcp-add-form-max-width`                      | 容器最大宽度   |
| `--tr-mcp-add-form-bg-color`                       | 容器背景色     |
| `--tr-mcp-add-form-border-radius`                  | 容器圆角       |
| `--tr-mcp-add-form-box-shadow`                     | 容器阴影       |
| `--tr-mcp-add-form-content-padding`                | 内容区域内边距 |
| `--tr-mcp-add-form-add-type-gap`                   | 添加类型区域间距 |
| `--tr-mcp-add-form-add-type-margin-bottom`         | 添加类型区域下边距 |
| `--tr-mcp-add-form-add-type-label-font-size`       | 标签字体大小   |
| `--tr-mcp-add-form-add-type-label-font-weight`     | 标签字体粗细   |
| `--tr-mcp-add-form-add-type-label-line-height`     | 标签行高       |
| `--tr-mcp-add-form-add-type-label-color`           | 标签文字颜色   |
| `--tr-mcp-add-form-footer-padding`                 | 底部区域内边距 |
| `--tr-mcp-add-form-footer-gap`                     | 底部按钮间距   |
| `--tr-mcp-add-form-button-border-radius`           | 按钮圆角       |
| `--tr-mcp-add-form-button-padding`                 | 按钮内边距     |
| `--tr-mcp-add-form-button-font-size`               | 按钮字体大小   |
| `--tr-mcp-add-form-button-height`                  | 按钮高度       |
| `--tr-mcp-add-form-button-line-height`             | 按钮行高       |
| `--tr-mcp-add-form-button-min-width`               | 按钮最小宽度   |
| `--tr-mcp-add-form-button-transition`              | 按钮过渡效果   |
| `--tr-mcp-add-form-cancel-bg-color`                | 取消按钮背景色 |
| `--tr-mcp-add-form-cancel-border-color`            | 取消按钮边框色 |
| `--tr-mcp-add-form-cancel-text-color`              | 取消按钮文字颜色 |
| `--tr-mcp-add-form-cancel-hover-border-color`      | 取消按钮悬停边框色 |
| `--tr-mcp-add-form-confirm-bg-color`               | 确认按钮背景色 |
| `--tr-mcp-add-form-confirm-border-color`           | 确认按钮边框色 |
| `--tr-mcp-add-form-confirm-text-color`             | 确认按钮文字颜色 |
| `--tr-mcp-add-form-confirm-hover-bg-color`         | 确认按钮悬停背景色 |
| `--tr-mcp-add-form-confirm-hover-border-color`     | 确认按钮悬停边框色 |

响应式变量：

| 变量名                                             | 描述                 |
| -------------------------------------------------- | -------------------- |
| `--tr-mcp-add-form-add-type-gap-mobile`            | 移动端添加类型区域间距 |

#### 变量覆盖

默认模式

```css
:root {
  --tr-mcp-add-form-max-width: 600px;
  --tr-mcp-add-form-bg-color: #f5f5f5;
}
```

自定义按钮颜色

```css
:root {
  --tr-mcp-add-form-confirm-bg-color: #1890ff;
  --tr-mcp-add-form-confirm-border-color: #1890ff;
  --tr-mcp-add-form-confirm-hover-bg-color: #40a9ff;
}
```