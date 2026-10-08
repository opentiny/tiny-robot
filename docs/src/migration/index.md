---
outline: false
---

# 迁移指南

## v1.0：从 v0.5.1 升级

- [Container → Layout](./v1.0/container)：选择普通页面或可拖拽的浮层布局，调整头部、主体和底部插槽。
- [McpServerPicker → ExtensionManager](./v1.0/mcp-server-picker)：将插件列表改为扩展条目，重新接入安装操作、弹窗和 MCP 表单。

## v0.4：从 v0.3.x 升级

- [Bubble](./v0.4/bubble)：将 `items` 改为 `messages`，迁移渲染器和分组配置。
- [Sender / SenderCompat](./v0.4/sender)：先用兼容组件过渡，或直接迁移输入框的按钮、插槽和扩展。
- [useMessage](./v0.4/use-message)：以 `responseProvider` 替代 `client`，调整请求状态和插件接入。
- [useConversation](./v0.4/use-conversation)：改用独立会话引擎，拆分会话与消息的存储操作。
