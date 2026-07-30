# Chat Review Checklist

## 当前结论

- [x] `ChatRuntime` 保持 `conversations + activeConversation + sender + actions` 四域。
- [x] Model、MCP 和 `runConfig` 只作为 `sender` 子协议。
- [x] 默认 UI 只消费公共 runtime 协议。
- [x] `MCPSelector`、`ModelSelector`、`ModelFeatures` 作为能力组件导出。
- [x] 不新增 `DefaultSenderControls`。
- [x] 不引入 MCP mock server。

## 阶段 5 验收

- [x] `ModelSelector` 只读取 `runtime.sender.model`。
- [x] `ModelFeatures` 从选中模型 `capabilities` 派生 thinking/search。
- [x] `MCPSelector` 只读取 `runtime.sender.mcp`。
- [x] MCP Picker 的 installed/enabled 状态从统一 `servers` 派生。
- [x] 无对应子协议时不显示入口。
- [x] 异步操作期间有稳定 loading。
- [x] action 失败后由 Runtime 保留原状态，默认 UI 只清理 pending。
- [x] 默认 UI 不依赖 `useModel`、`useMcp`、Provider 或 transport。
- [x] 保留 sender 窄插槽和完整 `footer` 自定义出口。

## 手动验证

- [ ] 无 Model/MCP runtime：footer 不出现默认选择入口。
- [ ] 只有 Model runtime：显示模型选择与当前模型支持的 features。
- [ ] 只有 MCP runtime：显示 MCP 入口并可添加、启用、禁用、删除 Server。
- [ ] Model+MCP runtime：三个能力组件可同时工作。
- [ ] 发送中切换模型或 MCP：只影响下一轮请求。
- [ ] MCP 启用状态变化：`mcpServerIds` 快照和工具列表一致。
- [ ] 异步失败：按钮恢复可点，runtime 状态不被错误 UI 状态污染。
- [ ] 自定义 `sender-footer`：完全替换默认能力区。
- [ ] 自定义 `sender-footer-right`：与默认能力区共存。

## 后续

- [ ] 阶段 6：删除 CLI basic 本地重复 UI 和临时兼容分支。
- [ ] 阶段 7：执行 Built-in Kit、Existing Kit、Custom Runtime、basic-integration 集成验证。
- [ ] 阶段 7：执行 type-check、build 和 e2e。
