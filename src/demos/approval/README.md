# 工具调用确认

[Demo.vue](Demo.vue) 使用 Kit 的 `useMessage` 与 `toolPlugin`，由 `TrBubbleList` 展示确认卡片，`TrSender` 提交请求。

发送“请保存周报”，等待确认后选择“允许”或“拒绝”。也可以在等待确认时刷新页面，继续处理同一条请求。

- `shouldPauseToolCall` 让模拟保存工具在执行前暂停。
- `TOOL_RESUME_COMMAND` 和 `TOOL_REJECT_COMMAND` 接收用户选择。
- `onTurnPause` 将待确认的消息存入 `sessionStorage`，用户选择后清除。
- 在 `callTool` 中接入实际的保存操作。
