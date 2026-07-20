# TinyRobot Chat 评审决策清单

## 1. 评审目标

本次评审需要确认：

1. `TrChat` 是否满足新项目快速创建目标。
2. 是否能让已有 Kit Runtime 只迁移 UI。
3. 从当前 MVP 到替换 CLI basic 模板还需要补哪些协议和能力。
4. 哪些 API 现在冻结，哪些能力后置。

设计事实和 Demo 证据见 [architecture.md](./architecture.md)。

本次建议批准：

1. 保持 `ChatRuntime` 核心协议瘦，只承接会话、消息和请求生命周期。
2. 完成 CLI basic 的基础聊天 UI 迁移。
3. 将 `ChatRunConfig` 作为下一阶段公共协议候选。
4. 模型和 MCP Server 采用窄 capability，MCP Tool 级管理后置。
5. 先通过 `footer` slot 验证选择器协议，再提供默认选择器 UI。

## 2. 当前已经确定

### 2.1 定位

```txt
TrChat = components + kit 的应用装配层
```

它不是新的底层 Runtime，也不是对所有基础组件的替代，而是提供默认完整聊天应用和统一 UI adapter 协议。

### 2.2 核心边界

| 模块 | 负责 | 不负责 |
| --- | --- | --- |
| `ChatRuntime` | 会话、消息、请求生命周期 | 输入框草稿和 UI 展示细节 |
| `ChatComposer` | 输入草稿、提交交互 | transport、storage、plugin |
| `ChatUi` | 展示配置 | 数据源和业务状态 |
| slots | 区域替换 | 新的数据协议 |
| adapter | 数据层转换和后端执行 | 页面布局 |

### 2.3 接入路径

| 路径 | 目标 |
| --- | --- |
| `useLocalChatRuntime` | 新项目快速接入 Kit |
| `useKitChatRuntime` | 已有 Kit Runtime 只迁移 UI |
| 自定义 `ChatRuntime` | AI SDK、Pinia、自研 store 或老系统接入 |

## 3. 必须评审的问题

### R01. “替换 CLI basic”包含哪些范围？

当前差异：

```txt
已覆盖：消息、会话、输入、取消、基础布局、Kit 迁移
未覆盖：模型选择、thinking、search、MCP Server、MCP Tool
```

当前建议：第一阶段覆盖模型选择和 MCP Server 选择；MCP Tool 级管理、市场和安装流程后置。

评审结论：

```txt
待填写
```

### R02. `ChatRuntime` 是否继续保持瘦？

当前建议：是。核心 Runtime 继续只承接会话、消息和请求生命周期。模型、MCP、上传等可选能力不直接平铺到 `ChatRuntimeActions`。

评审结论：

```txt
待填写
```

### R03. 模型和 MCP 选择状态由谁管理？

当前建议：选择状态属于 runtime capability；`ChatComposer` 只负责提交时转发配置快照；`ChatUi` 只负责展示。

需要确认：

- 是否允许全局级选择状态。
- 是否需要按会话持久化。
- 是否允许单次发送覆盖默认选择。

评审结论：

```txt
待填写
```

### R04. `ChatRunConfig` 是否进入稳定公共协议？

候选形态：

```ts
interface ChatRunConfig {
  modelId?: string
  mcpServerIds?: readonly string[]
  features?: Record<string, boolean>
  custom?: Record<string, unknown>
}
```

建议：`modelId` 和 `mcpServerIds` 表达通用选择结果，`features` 表达模型能力开关，`custom` 承载暂未标准化的中性上下文。供应商参数、凭证和 MCP 连接配置不进入协议。

评审结论：

```txt
待填写
```

### R05. 发送配置的语义是什么？

需要确认：

- 发送时是否生成不可变配置快照。
- 发送中切换模型是否只影响下一次请求。
- 重试是否使用原配置。
- 多会话并发时配置是否互相隔离。

当前建议：每次发送生成 `runConfig` 快照，当前请求不受后续选择变化影响。

评审结论：

```txt
待填写
```

### R06. 模型 capability 首期支持到什么程度？

CLI basic 当前有模型列表、当前模型、深度思考、联网搜索和模型能力限制。

当前建议：首期使用通用 feature 名称，adapter 再转换为供应商参数，不把 `enable_thinking` 之类字段暴露给 UI。

评审结论：

```txt
待填写
```

### R07. MCP 首期支持到 Server 还是 Tool？

CLI basic 实际包含：

```txt
available -> added -> inUse -> tools -> callTool
```

当前建议：首期支持 Server 的添加、删除、启用和禁用；Tool 级开关、连接池和市场流程后置。

当前 CLI 的 Tool 开关主要更新 UI 状态，不能作为新协议的完整行为依据。

评审结论：

```txt
待填写
```

### R08. Kit Runtime 如何支持动态模型和 MCP？

需要确认：

- 是否允许保留原有 `responseProvider`。
- 是否允许保留原有 `toolPlugin`。
- 选择变化后是否需要重建 `useConversation()`。

当前建议：不重建 conversation engine。`responseProvider` 和 `toolPlugin` 在每次请求时读取当前 adapter 状态。

评审结论：

```txt
待填写
```

### R09. 选择器 UI 先通过什么方式交付？

当前建议：先用 `footer` slot 验证协议；协议稳定后再提供默认 ModelSelector 和 McpSelector，避免提前固化默认 UI API。

评审结论：

```txt
待填写
```

### R10. 哪些 API 现在冻结？

当前建议：

| API | 建议状态 |
| --- | --- |
| `TrChat` | MVP 稳定 |
| `ChatRuntime` 核心字段 | 稳定候选 |
| `ChatUi` | MVP 稳定 |
| `ChatSubmitPayload` | 待完成中性扩展后冻结 |
| `ChatComposer` | 内部 |
| `ChatRunConfig` | 待评审 |
| Model/MCP capability | 实验性 |
| 通用 capability registry | 后置 |

评审结论：

```txt
待填写
```

### R11. ChatRuntime 是否允许依赖 Kit 的请求状态类型？

当前情况：`ChatRuntime` 当前使用 `tiny-robot-kit` 的 `RequestState` 和 `RequestProcessingState`。

需要决定：

- 保持 MVP 阶段的 Kit 通用类型依赖；或
- 改为 `chat` 自己定义的中性请求状态类型。

影响：这决定 external runtime 是否实现了类型层面的独立接入。

当前建议：MVP 暂时保留，协议稳定后再评估是否有足够的外部 Runtime 需求推动类型脱离 Kit。

评审结论：

```txt
待填写
```

### R12. 请求期间的选择和会话切换如何处理？

需要决定：

- 模型切换是否只影响下一次请求。
- 重试使用原配置还是最新配置。
- 切换会话是否自动 abort 当前请求。
- 是否允许多个会话并发发送。
- MCP 加载失败时是否允许发送。

当前建议：发送时生成不可变 `runConfig` 快照，后续选择变化只影响下一次请求；会话和请求的并发行为需要由 Runtime 明确提供。

评审结论：

```txt
待填写
```

### R13. `structuredData` 是否是当前已实现协议？

当前情况：`ChatSubmitPayload` 已包含 `structuredData`，但默认 Kit 发送链路当前主要处理 `text`。

需要决定：

- 默认 Kit adapter 是否保证传递 `structuredData`；或
- 明确它暂时只由自定义 Runtime 使用。

当前建议：如果继续作为公共字段保留，就必须保证默认发送链路不丢失该数据。

评审结论：

```txt
待填写
```

## 4. 风险与取舍

### 4.1 过早抽象

不建议立即建立通用 capability registry。模型和 MCP 是当前已经被 CLI basic 验证的具体能力，可以先做窄协议；上传、语音、suggestions 等能力等真实项目重复出现后再抽象。

### 4.2 UI 与数据层重新耦合

以下做法应禁止：

- 选择器直接读取 `useModel()` 或 `useMcp()` 作为公共接入方式。
- UI 直接请求模型接口或 MCP Server。
- 将 API Key、Headers 或连接配置放入 `ChatUi`。
- 将供应商字段直接加入 `ChatSubmitPayload`。

### 4.3 迁移范围失控

“替换 CLI basic”不等于复制 CLI 的所有业务实现。模型供应商配置、MCP 权限、业务插件和凭证仍然可以由应用或 adapter 持有。

## 5. 评审验收标准

### 基础迁移

- 保留已有 `useConversation`、transport、storage 和 plugins。
- 会话切换、消息流式展示和取消请求不回归。
- external runtime 不需要提供输入框草稿状态。
- UI 不直接依赖 Kit 原始返回结构。
- Built-in Kit 验证首次发送建会话、流式消息和取消请求。
- Existing Kit 验证已有 conversation、plugin 和 storage 不被重建。
- Custom Runtime 验证发送、错误、abort，且不提供输入框草稿状态。
- Minimal Custom Runtime 验证没有 conversations 时仍可完成单会话发送。

### 模型能力

- 模型列表可以展示和切换。
- 模型切换影响下一次请求。
- 不支持的 feature 自动禁用。
- UI 不读取 API Key 和供应商私有配置。

### MCP 能力

- MCP Server 可以启用和禁用。
- 启用的 Server 可以进入工具发现和调用链路。
- 连接失败后状态可以恢复。
- MCP 配置和凭证不进入 UI 协议。

### 公共协议

- 每个状态只有一个来源。
- `ChatRuntime` 只暴露只读 state 和 actions。
- `runConfig` 的优先级、快照和重试语义明确。
- 稳定、实验性和内部 API 有明确标记。

## 6. 评审结论记录

| 编号 | 决策 | 结论 | 负责人 | 日期 |
| --- | --- | --- | --- | --- |
| R01 | 替换范围 | 待填写 |  |  |
| R02 | Runtime 边界 | 待填写 |  |  |
| R03 | 状态作用域 | 待填写 |  |  |
| R04 | `ChatRunConfig` | 待填写 |  |  |
| R05 | 发送语义 | 待填写 |  |  |
| R06 | 模型能力 | 待填写 |  |  |
| R07 | MCP 范围 | 待填写 |  |  |
| R08 | Kit 动态配置 | 待填写 |  |  |
| R09 | 选择器交付 | 待填写 |  |  |
| R10 | API 稳定级别 | 待填写 |  |  |
| R11 | Kit 类型依赖 | 待填写 |  |  |
| R12 | 运行语义 | 待填写 |  |  |
| R13 | `structuredData` | 待填写 |  |  |

## 7. 评审结束条件

评审完成的标准不是所有未来能力都有实现方案，而是以下内容已经确定：

```txt
目标范围明确
核心边界不再争议
第一阶段 API 可以冻结
模型/MCP 是否进入下一阶段已经决定
CLI basic 迁移验收标准可执行
后置能力没有反向污染 MVP
```
