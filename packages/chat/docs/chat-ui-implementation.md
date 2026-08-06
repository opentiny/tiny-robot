# TrChatUI 实施方案与进度

设计依据：[chat-ui-design.md](./chat-ui-design.md)

## 1. 使用规则

- `[ ]`：未开始。
- `[-]`：进行中。
- `[x]`：已完成并具有验证证据。
- 每完成一个步骤立即更新状态。
- 阶段验证未通过时，不进入下一阶段。
- 验证记录写入对应阶段，不集中补记。
- 本阶段不修改 `ChatRuntime` 核心协议。
- 本阶段不修改 shared components 的公共 Props。
- 当前 API 不保留兼容层。

## 2. 优先级

| 优先级 | 含义 |
| --- | --- |
| P0 | 阻塞项，未完成不得开始代码改造 |
| P1 | 核心契约和主链路，必须优先完成 |
| P2 | 布局、Slots、Demo 和完整交互 |
| P3 | 文档回填和最终清理 |

## 3. 当前进度

| 阶段 | 优先级 | 状态 |
| --- | --- | --- |
| 0. 设计冻结 | P0 | 已完成 |
| 1. 公共类型和导出 | P1 | 未开始 |
| 2. 默认值和 Resolver | P1 | 未开始 |
| 3. Sender 输入模型 | P1 | 未开始 |
| 4. 组件级 callbacks | P1 | 未开始 |
| 5. TrChat Model/MCP Adapter | P1 | 未开始 |
| 6. Layout 和 Slots | P2 | 未开始 |
| 7. Demo 和静态验证 | P2 | 未开始 |

## 4. 阶段 0：设计冻结

目标：形成唯一且无冲突的实施依据。

### Todo

- [x] 确认公共 Props 收敛为 `{ data, ui }`。
- [x] 确认删除 `composerValue/defaultComposerValue`。
- [x] 确认不提供受控/非受控双模式。
- [x] 确认组件级事件使用 `onXxx` Props。
- [x] 确认根 Emits 只保留页面级意图。
- [x] 确认 Model/MCP 逻辑内置于 `TrChat` adapter。
- [x] 确认不增加统一 `event` emit。
- [x] 确认 Slots 使用组件前缀。
- [x] 完成 ChatUI 设计文档。
- [x] 完成本实施与验证文档。

### 验证标准

- 设计文档不存在 `state + composerValue` 旧契约。
- 不存在“所有事件放根 emits”的描述。
- 不存在“ChatUI 直接调用 Runtime controller”的描述。
- Data、UI、Emits、Slots 和 adapter 职责无重叠。

## 5. 阶段 1：公共类型和导出

优先级：P1

目标：先建立最终编译契约，后续代码只围绕该契约实现。

### Todo

- [ ] 新建 `src/types/ui/data.ts`。
- [ ] 定义 `ChatUIData`。
- [ ] 定义 `ChatBubbleView`。
- [ ] 定义 `ChatSenderView`。
- [ ] 保留并迁移 Conversation、Model、MCP View 类型。
- [ ] 删除 `ChatViewState`。
- [ ] 删除 `ChatComposerView`。
- [ ] 删除 `src/types/ui/state.ts`。
- [ ] 更新 `ChatUIProps` 为 `{ data?, ui? }`。
- [ ] 删除 `composerValue`。
- [ ] 删除 `defaultComposerValue`。
- [ ] 删除 `update:composerValue`。
- [ ] 精简 `ChatUIEmits`。
- [ ] 定义最终 `ChatLayoutOptions`。
- [ ] 将 Aside 配置迁入 Layout。
- [ ] 定义 `ChatBubbleOptions`。
- [ ] 定义最终 `ChatSenderOptions`。
- [ ] 定义最终 `ChatModelOptions`。
- [ ] 定义最终 `ChatMcpOptions`。
- [ ] 显式定义所有 callback 类型。
- [ ] 更新 `ChatUISlots` 名称。
- [ ] 更新 `src/types/ui/index.ts`。
- [ ] 更新 `src/types/index.ts`。
- [ ] 更新 `src/index.ts`。
- [ ] 删除旧类型导出。

### 类型检查 Fixtures

- [ ] `<TrChatUI />` 可以编译。
- [ ] `<TrChatUI :data="data" />` 可以编译。
- [ ] `<TrChatUI :ui="ui" />` 可以编译。
- [ ] 完整 callback payload 可以编译。
- [ ] 错误 callback payload 通过 `@ts-expect-error` 验证。
- [ ] `state` 旧 Prop 编译失败。
- [ ] `composerValue` 旧 Prop 编译失败。
- [ ] Model/MCP 根事件监听编译失败。
- [ ] 新 Slots 名称可以推导 slot props。
- [ ] 旧 Slots 名称编译失败。

### 验证命令

```powershell
pnpm.cmd -F @opentiny/tiny-robot-chat type-check
```

```powershell
rg "ChatViewState|ChatComposerView|composerValue|defaultComposerValue|update:composerValue" packages/chat/src packages/chat/demo
```

### 阶段门禁

- package type-check 通过。
- 公共导出不存在旧类型。
- 所有 callback 具有显式参数类型。
- UI 类型不导入 Runtime 或 Kit。

## 6. 阶段 2：默认值和 Resolver

优先级：P1

目标：使可选 Data/UI 稳定解析为内部完整结构。

### Todo

- [ ] 将 `resolveState.ts` 改为 `resolveData.ts`。
- [ ] 将 `resolveChatViewState` 改为 `resolveChatUIData`。
- [ ] 更新 `defaults.ts` 类型。
- [ ] 创建每实例默认 Data。
- [ ] 创建每实例默认 UI Options。
- [ ] 实现 `data.conversation` 默认值。
- [ ] 实现 `data.bubble.messages` 默认值。
- [ ] 实现 `data.sender` 默认状态。
- [ ] 保持 `sender.inputValue` 默认 `undefined`。
- [ ] 将 left/right aside 默认值迁入 Layout。
- [ ] 将 messages 默认值迁入 Bubble。
- [ ] 将 composer 默认值迁入 Sender。
- [ ] 显式合并 BubbleProvider。
- [ ] 显式合并 BubbleList。
- [ ] 显式合并 Sender Props。
- [ ] 保证 callback 使用最新函数。
- [ ] 实现 `undefined -> default`。
- [ ] 实现 `false -> disabled`。
- [ ] 实现数组完整替换。
- [ ] 禁止通用 deep merge。
- [ ] 删除旧 resolver 和旧 resolved 类型。

### 验证标准

- 每次调用默认工厂得到不同对象。
- 修改一个实例的默认数组不影响另一个实例。
- `undefined` 不覆盖默认值。
- `false` 能关闭对应区域。
- 空数组覆盖默认数组。
- callback 更新后立即生效。
- Data 不被 resolver 修改。
- UI Options 不覆盖 Data 展示事实。

### 阶段门禁

- type-check 通过。
- resolver 相关旧命名清理完成。
- 默认值测试或静态 fixtures 完成。

## 7. 阶段 3：Sender 输入模型

优先级：P1

目标：删除受控/非受控抽象，由 TrSender 管理实时草稿。

### Todo

- [ ] 删除 `useControllableComposer.ts`。
- [ ] ChatUI 不再创建 composer draft。
- [ ] ChatComposer 使用 TrSender 实际编辑器内容。
- [ ] 将 `data.sender.inputValue` 映射到 Sender `modelValue`。
- [ ] 外部 inputValue 变化时同步编辑器。
- [ ] 外部同步不调用 `onInput`。
- [ ] 用户输入调用一次 `ui.sender.onInput`。
- [ ] 暴露 ChatComposer 内部 `setInputValue`。
- [ ] Prompt 通过 `setInputValue` 回填。
- [ ] 用户 clear 调用一次根 `clear`。
- [ ] clear 内容变化调用一次 `onInput('')`。
- [ ] submit 使用 Sender 实际文本。
- [ ] 实现 `clearOnSubmit`。
- [ ] submit 自动清空不触发根 `clear`。
- [ ] submit 自动清空调用一次 `onInput('')`。
- [ ] loading/disabled 来自 Data。
- [ ] submitDisabled 只作为额外约束。
- [ ] 空输入约束继续由 Sender 保证。
- [ ] viewport 变化不重建 Sender。
- [ ] Aside 变化不重建 Sender。

### 验证矩阵

| 场景 | 预期 |
| --- | --- |
| 零 Props 输入 | 正常输入 |
| 初始 inputValue | 正确显示 |
| 外部更新 inputValue | 编辑器同步 |
| 用户输入 | `onInput` 一次 |
| Prompt 点击 | 内容更新，callback 顺序正确 |
| 用户 clear | `onInput('')` 和根 clear 各一次 |
| submit | payload 使用实际内容 |
| clearOnSubmit=true | 提交后清空 |
| clearOnSubmit=false | 提交后保留 |
| loading=true | 显示取消操作 |
| disabled=true | 不可编辑提交 |
| submitDisabled=true | 不可提交 |
| viewport 切换 | 草稿不丢失 |

### 阶段门禁

- 不存在 `useControllableComposer`。
- 不存在公开 v-model API。
- 所有输入路径行为一致。
- 每个 callback 只触发一次。

## 8. 阶段 4：组件级 Callbacks

优先级：P1

目标：将组件细节事件从根 Emits 下沉到对应 Options。

### Todo

- [ ] focus 改为 `ui.sender.onFocus`。
- [ ] blur 改为 `ui.sender.onBlur`。
- [ ] Prompt 点击改为 `ui.prompts.onItemClick`。
- [ ] Bubble state 改为 `ui.bubble.bubbleList.onStateChange`。
- [ ] Bubble event 改为 `ui.bubble.bubbleList.onBubbleEvent`。
- [ ] History custom action 改为 `ui.history.onItemAction`。
- [ ] Model selection 改为 `ui.model.onSelect`。
- [ ] Model feature 改为 `ui.model.onFeatureChange`。
- [ ] MCP callbacks 全部迁入 `ui.mcp`。
- [ ] Right Aside change 改为 `ui.layout.rightAside.onOpenChange`。
- [ ] 删除对应根 emit 处理函数。
- [ ] 删除对应根 emit 模板监听。
- [ ] callback 调用前检查函数存在。
- [ ] 每次调用读取最新 callback。
- [ ] 保留子组件内部 emits，不作为 ChatUI 公共事件。

### 事件顺序

```txt
Prompt:
  setInputValue
  -> sender.onInput
  -> prompts.onItemClick

History built-in:
  switch/rename/delete root emit

History custom:
  history.onItemAction

Model/MCP:
  child local emit
  -> ChatComposer
  -> model.onXxx / mcp.onXxx

Right Aside:
  layout state intent
  -> rightAside.onOpenChange
```

### 验证标准

- 根 Emits 中不存在组件级事件。
- Prompt 回填先于 `onItemClick`。
- rename/delete 不额外调用 `onItemAction`。
- 自定义 History action 不触发 delete/rename。
- Bubble payload 不被修改。
- 动态替换 callback 后使用新函数。
- 同一用户操作只调用一次 callback。

## 9. 阶段 5：TrChat Model/MCP Adapter

优先级：P1

目标：保留现有业务能力，同时移除 ChatUI Model/MCP 根 Emits。

### Todo

- [ ] 保留 Model View 映射。
- [ ] 保留 MCP View 映射。
- [ ] 保留 `modelSelecting`。
- [ ] 保留 `pendingModelFeatureIds`。
- [ ] 保留 `pendingMcpServerIds`。
- [ ] 保留 `pendingMcpToolIds`。
- [ ] 保留 MCP Tool snapshot。
- [ ] 保留 Server 关闭时 Tool 状态记录。
- [ ] 保留 Server 恢复时 Tool 状态恢复。
- [ ] 保留 `runAdapterAction` 错误捕获。
- [ ] 保留所有 `finally` pending 清理。
- [ ] 创建 adapter UI computed。
- [ ] 注入 `sender.onInput`。
- [ ] 分别合并 `props.ui.model` 和 `props.ui.mcp`。
- [ ] 注入 Model callbacks 到 `ui.model`。
- [ ] 注入 MCP callbacks 到 `ui.mcp`。
- [ ] 删除 ChatUI Model/MCP 事件监听。
- [ ] 删除 `onLoadMcpTools` callback。
- [ ] 将 MCPSelector 自动加载 watcher 迁入 TrChat adapter。
- [ ] adapter 内部串行执行 add/enable 后的 `loadTools`。
- [ ] 合并调用方 sender/model/mcp 配置。
- [ ] 内部 action 先派发。
- [ ] 调用方 callback 后通知。
- [ ] 使用最新调用方 callback。
- [ ] 不等待 action 完成后再通知。
- [ ] 防止 callback 合并产生递归调用。
- [ ] 更新 `useChatInput` 清空和失败恢复逻辑。

### Model 验证

- [ ] 选择 Model 调用 Runtime 一次。
- [ ] 选择相同 Model 不重复调用。
- [ ] selecting 时不重复调用。
- [ ] feature pending 时不重复调用。
- [ ] action reject 被捕获。
- [ ] reject 后 pending 被清理。
- [ ] 调用方 callback 调用一次。

### MCP 验证

- [ ] add Server 调用一次。
- [ ] remove Server 调用一次。
- [ ] enable/disable 调用一次。
- [ ] Tool toggle 调用一次。
- [ ] tools 仅由 adapter 在 add/enable 后加载。
- [ ] 同一轮不重复 loadTools。
- [ ] Server loading 时不触发 loadTools。
- [ ] Server 关闭时记录启用 Tool。
- [ ] Server 恢复时恢复 Tool。
- [ ] action reject 被捕获。
- [ ] reject 后 pending 被清理。
- [ ] 调用方 callback 调用一次。

### 阶段门禁

- ChatUI 不导入 Runtime。
- TrChat 不监听 Model/MCP 根事件。
- Model/MCP 主链路无回归。
- 不产生 unhandled rejection。

## 10. 阶段 6：Layout 和 Slots

优先级：P2

目标：完成结构命名迁移并保留响应式行为。

### Todo

- [ ] 读取 `ui.layout.leftAside`。
- [ ] 读取 `ui.layout.rightAside`。
- [ ] 删除顶层 leftAside/rightAside。
- [ ] 保留 desktop dock。
- [ ] 保留 mobile drawer。
- [ ] 保留左栏 viewport 86% 限制。
- [ ] 修正 Right Aside open 判断。
- [ ] 外部 open 存在时不直接修改展示真相。
- [ ] 开关操作调用 `onOpenChange` 一次。
- [ ] `notice` 改为 `header-notice`。
- [ ] Bubble Slots 增加 `bubble-` 前缀。
- [ ] 保留 Sender Slots 名称。
- [ ] 增加 `right-aside-title`。
- [ ] title slot 参与 Header 显示判断。
- [ ] 删除硬编码右栏默认标题。
- [ ] ChatUI 转发全部新 Slots。
- [ ] TrChat 转发全部新 Slots。
- [ ] 更新 Slot Props 类型。
- [ ] 检查 ScrollToBottom 定位。
- [ ] 检查 ProxyScrollbar scroll target。

### 验证标准

- desktop 左栏展开/收起正常。
- mobile drawer 正常。
- 创建/切换会话后 drawer 关闭。
- Right Aside 受外部 open 驱动时显示正确。
- 关闭按钮调用 callback 一次。
- title slot 正确显示。
- 没有标题且没有关闭按钮时不渲染空 Header。
- 所有新 Slots 可在 ChatUI 和 TrChat 使用。
- 旧 Slots 已全部清理。
- ScrollToBottom 不改变布局尺寸。

## 11. 阶段 7：Demo 和静态验证

优先级：P2

目标：建立可人工复核的完整场景。

### Todo

- [ ] 更新 `DefaultCase.vue`。
- [ ] 更新 `ConfiguredCase.vue`。
- [ ] 将 `ControlledCase.vue` 改为 `DataCase.vue`。
- [ ] 更新 Demo case tabs。
- [ ] DefaultCase 不导入 Runtime。
- [ ] ConfiguredCase 只传 UI。
- [ ] DataCase 只使用普通 refs/computed。
- [ ] DataCase 不导入 Runtime 或 Kit。
- [ ] DataCase 使用 `data`。
- [ ] DataCase 使用独立 `ui.model`、`ui.mcp` 配置验证 `onXxx`。
- [ ] DataCase 删除 Model/MCP 根事件。
- [ ] 增加长标题。
- [ ] 增加长 Model 名称。
- [ ] 增加 empty/messages 切换。
- [ ] 增加 loading/disabled/pending 切换。
- [ ] 增加 Right Aside title slot。
- [ ] 增加最终 Slots 示例。
- [ ] 更新类型 fixtures。

### 静态验证命令

```powershell
pnpm.cmd -F @opentiny/tiny-robot-chat type-check
```

```powershell
rg "composerValue|defaultComposerValue|ChatViewState|ChatComposerView|v-model:composer-value|:state" packages/chat/src packages/chat/demo
```

```powershell
rg "selectModel:|updateModelFeature:|addMcpServer:|removeMcpServer:|loadMcpTools:" packages/chat/src/types/ui/events.ts
```

```powershell
rg "ChatRuntime|ChatReadable|tiny-robot-kit|useConversation" packages/chat/src/ChatUI.vue packages/chat/src/ui packages/chat/src/types/ui
```

### 手工验证

- [ ] DefaultCase desktop。
- [ ] DefaultCase mobile。
- [ ] ConfiguredCase desktop。
- [ ] ConfiguredCase mobile。
- [ ] DataCase desktop。
- [ ] DataCase mobile。
- [ ] 输入草稿不因 viewport 变化丢失。
- [ ] 长文本无重叠。
- [ ] Model/MCP 控件窄屏可用。
- [ ] Right Aside 可开关。
- [ ] 所有 callbacks 单次触发。
