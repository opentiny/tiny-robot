---
outline: deep
---

# Feedback 气泡反馈

<style scoped>
.vitepress-demo-plugin__container {
  background-color: rgb(248, 248, 248);
}
</style>

## 代码示例

### 基本示例

基本示例

注意：`operations` 和 `actions` 中的 `name` 属性必须唯一。点击后，会响应 `operation` 或 `action` 事件，参数则为 `name`

另外，`operations` 和 `actions` 的每一项可以单独设置 `onClick` 回调，和 `operation` 或 `action` 事件会同时触发

<demo vue="../../demos/feedback/basic.vue" />

### 控制显示数量

使用 `operations-limit`，`actions-limit`，`sources-lines-limit` 来分别控制左侧操作按钮、右侧动作按钮和底部来源展开后显示的最大数量或行数

<demo vue="../../demos/feedback/limit.vue" />

### 自定义动作图标

`action` 内置支持的图标有：`copy`、`refresh`、`like`、`dislike`。可设置 `action.icon` 传入自定义图标，支持 `VNode` 或 `Component`

<demo vue="../../demos/feedback/custom-action-icon.vue" />

## API

### FeedbackProps

| 属性                | 类型                                                                                                                                   | 必填 | 说明                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------- |
| `operations`        | `Array<{ name: string; label: string; onClick?: () => void }>`                                                                         | 否   | 操作按钮配置数组                       |
| `operationsLimit`   | `number`                                                                                                                               | 否   | 默认显示的操作按钮数量，超出部分会折叠 |
| `actions`           | `Array<{ name: string; label: string; icon?: 'copy' \| 'refresh' \| 'like'\| 'dislike' \| VNode \| Component; onClick?: () => void }>` | 否   | 动作按钮配置数组                       |
| `actionsLimit`      | `number`                                                                                                                               | 否   | 默认显示的动作按钮数量，超出部分会折叠 |
| `sources`           | `Array<{ label: string; link: string }>`                                                                                               | 否   | 数据来源链接配置数组                   |
| `sourcesLinesLimit` | `number`                                                                                                                               | 否   | 默认显示的数据来源行数，超出部分会折叠 |

### FeedbackEvents

| 事件名      | 参数           | 说明                               |
| ----------- | -------------- | ---------------------------------- |
| `operation` | `name: string` | 当点击操作按钮时触发，返回操作名称 |
| `action`    | `name: string` | 当点击动作按钮时触发，返回动作名称 |
