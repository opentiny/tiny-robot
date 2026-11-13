# 工具调用确认

[Demo.vue](Demo.vue) 使用 Kit 的 `useMessage` 与 `toolPlugin`，由 `TrBubbleList` 展示确认卡片，`TrSender` 提交请求。

发送“请保存周报”，等待确认后选择“允许”或“拒绝”。也可以在等待确认时刷新页面，继续处理同一条请求。

- `shouldPauseToolCall` 让模拟保存工具在执行前暂停。
- `TOOL_RESUME_COMMAND` 和 `TOOL_REJECT_COMMAND` 接收用户选择。
- `onTurnPause` 把暂停消息存入当前标签页的 `sessionStorage`；用户确认或拒绝时立即清除，回合结束或中止时也会清除。
- `callTool` 返回模拟保存结果，不会写入真实业务系统。

示例重置时中止当前回合并重新初始化。生产应用应按业务要求选择持久化策略，并自行实现工具调用。
