# AGENTS.md

## 当前主线任务

当前正在完善 `useMessage` 的工具调用确认流程，核心目标是把工具调用从“运行时 Promise 等待确认”改为“通过可序列化的消息状态和 `role: 'tool'` 结果消息继续流程”。

这条线的后续重点是：给 `useMessage` 增加一个等待工具结果提交的 processing 状态，让工具确认流程可以被存储、恢复，并支持 pause/resume。

## 已完成内容

- 新增 `submitToolResult(message | message[])` API。
  - core：`packages/kit/src/message/core/engine.ts`
  - 类型：`packages/kit/src/message/types.ts`
  - Vue 返回值：`packages/kit/src/vue/message/useMessage.ts`
  - Vue 类型：`packages/kit/src/vue/message/types.ts`
- `submitToolResult` 只接受 `role: 'tool'` 消息。
- 提交 tool result 后，会检查最近一个 assistant message 的 `tool_calls` 是否都已有结果。
- 全部 tool result 齐全后，kit 会自动继续下一轮请求。
- `toolPlugin.confirmToolCall` 已改为布尔判断：
  - 返回 `true`：标记工具调用为 `awaiting-approval`，不创建空 tool message，不执行 `callTool`。
  - 返回 `false` 或未传：按原自动工具调用逻辑执行 `callTool`。
- Vue 侧 `toolPlugin` 已同步简化，不再包装旧的 `ToolCallDecision` Promise 等待逻辑。
- Tool 渲染器已支持 `awaiting-approval` 状态下展示“允许 / 拒绝”按钮。
- 按钮点击通过 Bubble 的通用 `state-change` 事件发出 `toolCallDecision`，业务侧再调用 `submitToolResult`。
- 文档 demo 已抽成组件：
  - `docs/demos/tools/message/ToolCallConfirm.ts`
  - `docs/demos/tools/message/ToolCallConfirm.vue`
- 已新增后续设计 TODO：
  - `packages/kit/TODO.md`

## 后续待做

主要 TODO 在 `packages/kit/TODO.md`。

下一步建议实现：

1. 扩展 `RequestProcessingState`，增加 `awaiting-tool-results`。
2. 当 `toolPlugin` 发现有工具调用需要确认时：
   - 设置对应 `state.toolCall[id].status = 'awaiting-approval'`。
   - 设置全局 `processingState = 'awaiting-tool-results'`。
   - 停止本轮自动 `requestNext`。
3. `submitToolResult` 提交部分 tool result 后：
   - 更新对应 tool call 状态。
   - 如果仍有缺失结果，保持 `awaiting-tool-results`。
   - 如果全部结果齐全，进入下一轮请求。
4. 恢复会话时，根据最近一个 assistant message 的 `tool_calls` 和后续 tool messages 差集推导是否仍在等待工具结果。
5. UI 可根据 `processingState === 'awaiting-tool-results'` 展示全局等待状态。

## 关键设计约束

- 不要恢复旧的 `await confirmToolCall` 内存等待方案。页面刷新后 Promise/resolver 无法恢复。
- deny 也应该是一条 `role: 'tool'` 消息，通过 `submitToolResult` 提交。
- 多个并行 tool call 可以部分提交，但只有全部结果齐全后才能继续请求。
- `submitToolResult` 应只针对最近一个带 `tool_calls` 的 assistant message 生效。
- 如果最近一个 assistant message 没有 `tool_calls`，提交 tool result 应拒绝或警告。
- 不要通过监听变量触发工具调用，优先使用 Bubble 现有 `state-change` 事件机制。
- 文档构建很慢，除非明确要求，不要运行 docs build。

## 常用验证命令

```bash
pnpm -F @opentiny/tiny-robot-kit test -- src/vue/message/useMessage.test.ts
pnpm -F @opentiny/tiny-robot-kit build
```

当前相关单测已覆盖：

- 等待外部提交 tool result 后再继续请求。
- 并行 tool calls 支持部分提交，全部提交后再继续。
- Vue 侧 toolPlugin 仍能正常走自动工具调用流程。

## 相关文件

- `packages/kit/src/message/core/engine.ts`
- `packages/kit/src/message/plugins/toolPlugin.ts`
- `packages/kit/src/vue/message/plugins/toolPlugin.ts`
- `packages/kit/src/vue/message/useMessage.ts`
- `packages/kit/src/vue/message/useMessage.test.ts`
- `packages/components/src/bubble/renderers/Tool.vue`
- `packages/components/src/bubble/composables/useToolCall.ts`
- `docs/demos/tools/message/ToolCallConfirm.ts`
- `docs/demos/tools/message/ToolCallConfirm.vue`
- `docs/src/tools/message.md`
- `packages/kit/TODO.md`

## 工作区注意事项

当前工作区可能包含与这条任务无关的已有改动，例如：

- `.gitignore`
- `docs/.vitepress/config.mts`
- `packages/playground/vite.config.ts`

继续工作时不要随意 revert 这些文件，除非明确知道它们属于当前任务并且需要处理。
