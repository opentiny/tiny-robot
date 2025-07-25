---
outline: deep
---

# MCPAddModal 插件添加弹窗

## 代码示例

### 基本示例

<demo vue="../../demos/mcp-add-modal/basic.vue" />

## API

### Props

| Prop Name          | Description  | Type      | Required | Default |
| ------------------ | ------------ | --------- | -------- | ------- |
| `model:show`       | 是否显示弹窗 | `boolean` | ✅       | —       |
| `title`            | 弹窗标题     | `string`  | ❌       | `'添加插件'` |
| `defaultMode` | 默认添加方式 | `'form' \| 'code'` | ❌       | `'form'` |

### Emits

| Event Name | Description | Type |
| ---------- | ----------- | ---- |
| `confirm`  | 确认事件    | `(type: 'form' \| 'code', data: IPluginCreationData) => void` |
---

### Slots

| Slot Name    | Description        |
| ------------ | ------------------ |
| `default`    | 弹窗主体内容       |
| `title`      | 自定义标题区域内容 |