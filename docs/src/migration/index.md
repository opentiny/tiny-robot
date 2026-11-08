---
outline: false
---

# 迁移指南

## v1.0：从 v0.5.1 升级

- [Container → Layout](./v1.0/container)：`Container` 弃用；`Layout` 提供页面、侧栏和浮层布局，旧的显隐、全屏状态及关闭事件没有一一对应的 API。
- [McpServerPicker → ExtensionManager](./v1.0/mcp-server-picker)：`McpServerPicker` 弃用；扩展按安装状态分区，弹窗和 MCP 表单由应用提供。

## v0.4：从 v0.3.x 升级

- [Bubble](./v0.4/bubble)：`BubbleList.items` 改为 `messages`，自定义渲染器改用匹配规则。
- [Sender / SenderCompat](./v0.4/sender)：`Sender` API 重构；可先用 `SenderCompat` 过渡，或直接迁移按钮、插槽和扩展配置。
- [useMessage](./v0.4/use-message)：用 `responseProvider` 替代 `client`，并区分请求状态与处理状态。
- [useConversation](./v0.4/use-conversation)：用 `useMessageOptions` 替代 `client`，按会话管理消息并拆分存储接口。
