# TODO: useMessage 工具结果等待状态

## 背景

当前 `submitToolResult` 已经支持通过追加 `role: 'tool'` 消息来继续工具调用流程：当最近一个 assistant message 的 `tool_calls` 都有对应 tool result 后，kit 会自动发起下一轮请求。

后续还需要把“等待 tool result 提交”显式纳入 `useMessage` 的状态模型，避免只依赖 message state 判断流程位置。这样状态可以被序列化存储，页面关闭、会话切换或应用重启后，也能恢复到可继续处理的 pause/resume 状态。

## 目标

- 为 `useMessage` 增加一个等待工具结果提交的 processing 状态。
- 让等待状态可以随消息一起序列化存储。
- 恢复会话后，UI 能根据状态继续展示待处理工具调用。
- 用户允许或拒绝后，业务侧调用 `submitToolResult`，kit 自动判断是否继续请求。

## 建议状态

当前 `requestState` 仍保持：

- `idle`
- `processing`
- `completed`
- `aborted`
- `error`

建议扩展 `processingState`：

- `requesting`：正在请求模型。
- `completing`：正在消费模型响应。
- `calling-tools`：正在自动执行工具。
- `awaiting-tool-results`：模型已返回 `tool_calls`，但仍有工具结果未提交。

`awaiting-tool-results` 的语义是：当前没有运行中的模型请求，也没有运行中的自动工具调用；流程暂停在等待外部提交 tool result 的阶段。

## 序列化模型

建议最小化存储以下信息：

- `messages`：完整消息列表，包括 assistant message 上的 `tool_calls` 和 `state.toolCall`。
- `requestState`：建议恢复为 `completed` 或新增更明确的暂停态后再决定。
- `processingState`：恢复时可以从消息推导，也可以持久化 `awaiting-tool-results`。
- pending tool call ids：优先从最近一个 assistant message 的 `tool_calls` 与其后的 tool messages 差集推导。

不要在内存里保存 Promise、resolver 或运行时闭包。pause/resume 只能依赖可序列化的数据。

## 实现清单

1. 增加 `RequestProcessingState` 可选值：`awaiting-tool-results`。
2. 当 `toolPlugin` 发现存在需要确认的工具调用时：
   - 标记对应 `state.toolCall[id].status = 'awaiting-approval'`。
   - 将 `processingState` 置为 `awaiting-tool-results`。
   - 停止本轮自动 `requestNext`。
3. `submitToolResult` 提交 tool message 后：
   - 更新对应 tool call 状态。
   - 如果仍有缺失结果，保持 `awaiting-tool-results`。
   - 如果全部结果齐全，进入下一轮 `requesting`。
4. 恢复会话时：
   - 根据最近一个 assistant message 的 `tool_calls` 和后续 tool messages 推导是否仍在等待。
   - 若仍有缺失结果，恢复 `processingState = 'awaiting-tool-results'`。
5. UI 层：
   - 根据 `state.toolCall[id].status === 'awaiting-approval'` 展示允许/拒绝按钮。
   - 根据全局 `processingState === 'awaiting-tool-results'` 展示“等待工具结果”类状态。

## 注意点

- 不要把 `await confirmToolCall` 作为恢复机制，刷新页面后 Promise 无法恢复。
- `submitToolResult` 应只允许提交到最近一个带 `tool_calls` 的 assistant message 后面。
- 如果最近一个 assistant message 没有 `tool_calls`，提交 tool result 应该直接拒绝或警告。
- 多个并行 tool call 可以部分提交，但只有全部结果齐全后才继续请求。
- deny 也应表现为一条 `role: 'tool'` 消息，而不是单纯前端状态。
