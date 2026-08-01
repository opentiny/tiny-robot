# Chat Review Checklist

## 当前结论

- [x] `ChatRuntime` 保持 `conversations + activeConversation + composer + actions` 四域。
- [x] Model、MCP 和 `runConfig` 只作为 `composer` 子协议。
- [x] 默认 UI 只消费公共 runtime 协议。
- [x] `MCPSelector`、`ModelSelector`、`ModelFeatures` 作为能力组件导出。
- [x] 不新增 `DefaultSenderControls`。
- [x] 不引入 MCP mock server。

## 阶段 5 验收

- [x] `ModelSelector` 只读取 `runtime.composer.model`。
- [x] `ModelFeatures` 从选中模型 `capabilities` 派生 thinking/search。
- [x] `MCPSelector` 只读取 `runtime.composer.mcp`。
- [x] MCP Picker 的 installed/enabled 状态从统一 `servers` 派生。
- [x] 无对应子协议时不显示入口。
- [x] 异步操作期间有稳定 loading。
- [x] action 失败后默认 UI 不直接改写或反向回滚 Runtime，只清理 pending 并以 Runtime 实际状态重新渲染。
- [x] Tool 状态只由 `runtime.composer.mcp.tools` 提供，UI 不维护业务 Tool 副本。
- [x] Tool 开关进入 `runConfig.mcp.toolIds`，请求前过滤、调用时再次校验。
- [x] 本轮 Tool catalog 与 Composer 可变缓存隔离，递归请求和 Tool Call 复用同一快照。
- [x] 历史 catalog 恢复不写回当前 `runtime.composer.mcp.tools`。
- [x] 空 Tool 选择不连接对应 MCP Server。
- [x] 历史快照中的 Tool 已被远端删除或改名时明确失败，不静默缩减本轮 Tool 能力。
- [x] 关闭最后一个 Tool 后重新开启 Server，一次操作即可恢复可用 Tool。
- [x] 同一 Server 的级联 action 在前序失败后停止，不继续应用因果后续状态。
- [x] 默认 UI 不依赖 `useModel`、`useMcp`、Provider 或 transport。
- [x] 保留 sender 窄插槽和完整 `footer` 自定义出口。

## 手动验证

- [ ] 无 Model/MCP runtime：footer 不出现默认选择入口。
- [ ] 只有 Model runtime：显示模型选择与当前模型支持的 features。
- [ ] 只有 MCP runtime：显示 MCP 入口并可添加、启用、禁用、删除 Server。
- [ ] Model+MCP runtime：三个能力组件可同时工作。
- [ ] 发送中切换模型或 MCP：只影响下一轮请求。
- [ ] MCP Server/Tool 启用状态变化：`runConfig.mcp.serverIds/toolIds` 快照和工具列表一致。
- [ ] 禁用 Server 后恢复时保留原 Tool 选择。
- [ ] 关闭全部 Tool 后本轮请求不暴露该 Server 的 Tool。
- [ ] 历史消息重试使用保存的 MCP 快照，不依赖当前 UI 选择。
- [ ] 多 Server 中单个 Tool 加载失败不影响其它 Server；全部失败时请求明确报错。
- [ ] 异步失败：按钮恢复可点，runtime 状态不被错误 UI 状态污染。
- [ ] 自定义 `sender-footer`：完全替换默认能力区。
- [ ] 自定义 `sender-footer-right`：与默认能力区共存。

## 后续

- [ ] 阶段 6：删除 CLI basic 本地重复 UI 和临时兼容分支。
- [ ] 阶段 7：执行 Built-in Kit、Existing Kit、Custom Runtime、basic-integration 集成验证。
- [ ] 阶段 7：执行 type-check、build 和 e2e。
