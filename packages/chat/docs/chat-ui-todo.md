# TrChatUI 实施清单

设计依据：[chat-ui-design.md](./chat-ui-design.md)

## 使用规则

- `[ ]`：未开始。
- `[x]`：已完成并具有代码、类型检查、Demo 或测试证据。
- 每次实现后立即更新对应 checkbox，不批量补记。
- 若设计发生变化，先更新设计文档，再更新本清单。
- 当前阶段不修改 `architecture.md` 和 `migration-plan.md`。

## 当前进度

| 阶段 | 状态 |
| --- | --- |
| 0. 设计冻结与行为基线 | 已完成 |
| 1. 类型和导出结构 | 实现完成，待 type-check |
| 2. 默认值与零 Props 渲染 | 实现完成，待运行时验证 |
| 3. Composer 状态模型 | 实现完成，待运行时验证 |
| 4. Emits 统一 | 实现完成，待 type-check |
| 5. Model/MCP View 化 | 实现完成，待运行时验证 |
| 6. UI Options 与文案 | 实现完成，待运行时验证 |
| 7. Slots、结构和可访问性 | 实现完成，待手工验证 |
| 8. Demo 验证矩阵 | 实现完成，待手工验证 |
| 9. TrChat adapter | 实现完成，待 type-check |
| 10. 自动化与最终清理 | 进行中 |
| 11. 整体文档回填 | 延后 |

## 0. 设计冻结与行为基线

- [x] 确认项目处于开发阶段，不需要保留旧 ChatUI API 兼容层。
- [x] 确认采用“保留现有视图交互，重写公共契约和解析层”的路线。
- [x] 新建 ChatUI 独立设计文档。
- [x] 定义 `state / ui / composerValue / emits / slots` 五类边界。
- [x] 定义类型命名规范。
- [x] 评审并确认 `chat-ui-design.md` 为本阶段实现依据。
- [x] 记录当前 desktop 行为基线。
- [x] 记录当前 mobile 行为基线。
- [x] 记录当前 empty/messages/loading/disabled 行为基线。
- [x] 记录当前 Prompt、滚动、History、Model/MCP 行为基线。
- [x] 明确 `Ctrl K` 是实现还是移除。

### 阶段 0 基线记录

- 设计依据：本执行任务明确指定 `chat-ui-design.md` 为唯一 ChatUI 设计依据；整体 `architecture.md` 和 `migration-plan.md` 延后，不在本阶段修改。
- Desktop：`ChatUI.vue` 使用 `useBreakpoints({ desktop: 960 })`，左侧栏默认 dock，`defaultOpen` 缺省为 `false`，宽度缺省 `300`，收起宽度缺省 `56`。
- Mobile：小于 `960px` 时左侧栏强制 drawer，切换到 mobile 会关闭左侧栏；drawer 宽度通过 viewport `86%` 上限裁剪，mobile collapsed width 为 `0`；创建/切换会话后关闭 drawer。
- Empty/messages/loading/disabled：空消息显示 `ChatMessages` 默认 Welcome 和可选 Prompts；有消息显示 BubbleList；`system` role 默认隐藏；Composer 将 loading/disabled 透传到 `TrSender`，提交禁用当前由空输入和 `submitDisabled` 共同决定。
- Prompt/滚动/History/Model/MCP：Prompt 点击回填 Composer；BubbleList 默认 autoScroll，用户消息追加后 smooth scroll；History 使用 `historyItemCache` 稳定 item identity；Model/MCP 当前仍是 controls + Promise pending 模型，后续按设计改为 View + Emits。
- `Ctrl K`：当前只是可见提示，没有实现快捷键；本阶段选择移除提示，不新增未经验证的快捷键行为。

## 1. 类型和导出结构

- [x] 创建 `src/types/ui/state.ts`。
- [x] 创建 `src/types/ui/options.ts`。
- [x] 创建 `src/types/ui/events.ts`。
- [x] 创建 `src/types/ui/slots.ts`。
- [x] 创建 `src/types/ui/index.ts`。
- [x] 定义 `ChatUIProps`。
- [x] 定义 `ChatViewState`。
- [x] 定义 `ChatConversationView`。
- [x] 定义 `ChatComposerView`。
- [x] 定义 `ChatModelView` 和 `ChatModelOptionView`。
- [x] 定义 `ChatMcpView`、`ChatMcpServerView`、`ChatMcpToolView`。
- [x] 定义 `ChatUIOptions` 和区域 Options。
- [x] 定义 `ChatUIEmits` 和事件 payload。
- [x] 定义 `ChatUISlots` 和 slot props。
- [x] 将 `ChatSubmitPayload` 移到 UI 公共输入类型。
- [x] 确认 UI 类型不再导入 `runtime.ts`。
- [x] 确认 UI 类型不再使用 `ChatReadable`。
- [x] 更新 `src/types/index.ts` 导出。
- [x] 更新 `src/index.ts` 公共导出。
- [x] 删除旧 `ChatUi`、`ChatUIConfig` 和重复类型。
- [ ] 运行 package type-check 并记录结果。

## 2. 默认值与零 Props 渲染

- [x] 新建 `src/ui/defaults.ts`。
- [x] 实现每实例创建的默认 View state。
- [x] 实现每实例创建的默认 UI options。
- [x] 新建 `src/ui/resolveState.ts`。
- [x] 新建 `src/ui/resolveOptions.ts`。
- [x] 使用显式字段合并，不引入通用 deep merge。
- [x] 实现 `undefined -> default` 规则。
- [x] 实现 `false -> disabled` 规则。
- [x] 实现数组完整替换规则。
- [x] 实现 slot 优先于默认区域渲染规则。
- [x] 将 `state` 改为可选 Prop。
- [x] 将 `ui` 保持为可选 Prop。
- [x] ChatUI 内部统一消费 resolved state/options。
- [x] 将散落在子组件中的默认值迁移到 resolver 或明确保留为区域默认。
- [ ] 验证 `<TrChatUI />` 不抛异常。
- [ ] 验证 `<TrChatUI />` 渲染 Header、Welcome、Composer 和默认左侧栏。
- [ ] 验证零配置渲染。
- [ ] 运行 package type-check 并记录结果。

## 3. Composer 状态模型

- [x] 新建 `useControllableComposer.ts`。
- [x] 添加 `composerValue?: string`。
- [x] 添加 `defaultComposerValue?: string`。
- [x] 添加 `update:composerValue` emit。
- [x] 删除 `state.composer.value`。
- [x] 实现非受控 draft 初始化。
- [x] 实现受控 value 读取和更新意图。
- [x] 统一输入、Prompt、clear、submit 的 setValue 路径。
- [x] 实现 `clearOnSubmit` 默认 true。
- [x] 实现受控模式下的清空意图，不覆盖父值。
- [x] 修正 submitDisabled 公式，不能通过显式 false 绕过空输入。
- [ ] 验证 viewport 和 aside 变化不丢草稿。
- [ ] 验证外部更新 composerValue 后 UI 同步。
- [ ] 运行 package type-check 并记录结果。

## 4. Emits 统一

- [x] 移除 `ui.history.onXxx`。
- [x] 移除 `ui.prompts.onItemClick`。
- [x] 移除 `ui.sender.onXxx`。
- [x] 移除 `ui.bubbleList.onXxx`。
- [x] 添加 focus/blur emits。
- [x] 添加 promptClick emit。
- [x] 添加 bubbleStateChange/bubbleEvent emits。
- [x] 添加 historyAction emit。
- [x] 将 switch/rename/delete 参数改为 object payload。
- [x] 确认 default History rename/delete 只触发一次对应事件。
- [x] 确认自定义 History action 只触发 historyAction。
- [x] 确认 Prompt 先更新 Composer，再发出通知事件。
- [x] 检索 UI Options，确认不存在事件 callbacks。
- [ ] 运行 package type-check 并记录结果。

## 5. Model/MCP View 化

- [x] 将 ModelSelector Props 改为普通 `ChatModelView` 数据。
- [x] 将 ModelSelector 操作改为 emit。
- [x] 将 ModelFeatures Props 改为普通 `ChatModelView` 数据。
- [x] 将 ModelFeatures 操作改为 emit。
- [x] 将 MCPSelector Props 改为普通 `ChatMcpView` 数据。
- [x] 将 MCPSelector add/remove/load/toggle 改为 emit。
- [x] 将 Model selection pending 放入 View。
- [x] 将 Model feature pending 放入 View。
- [x] 将 MCP server/tool pending 放入 View item。
- [x] 删除 `ChatUIModelControls`。
- [x] 删除 `ChatUIMcpControls`。
- [x] 删除 UI 层对 controller Promise 的等待和错误处理。
- [x] 未传 Model View 时不渲染 Model 控件。
- [x] 未传 MCP View 时不渲染 MCP 控件。
- [x] 验证所有 Model/MCP 事件 payload。
- [ ] 运行 package type-check 并记录结果。

## 6. UI Options 与文案

- [x] 按 layout/brand/labels/header/aside/history/messages/welcome/prompts/composer 分组 Options。
- [x] 实现 `header: false`。
- [x] 实现 `leftAside: false`。
- [x] 实现 `rightAside: false | options`。
- [x] 实现 `history: false`。
- [x] 实现 `welcome: false`。
- [x] 实现 `prompts: false`。
- [x] 实现 `composer: false`。
- [x] 将 bubbleProvider/bubbleList 移入 `messages`。
- [x] 将 sender/clearOnSubmit 移入 `composer`。
- [x] Aside width 类型收敛为 number。
- [x] contentMaxWidth/panelPadding/panelGap 保持 CSS size。
- [x] 定义并实现 `ChatBrandOptions`。
- [x] 定义并实现 `ChatLabels`。
- [x] 移除 ChatAside、ChatHeader、ChatMessages、ChatComposer 中的硬编码可见文案。
- [x] 移除硬编码 `aria-label`，改用 Labels。
- [x] 验证调用方 ui object 可以覆盖默认配置。
- [x] 验证数组是替换而不是拼接。
- [ ] 运行 package type-check 并记录结果。

## 7. Slots、结构和可访问性

- [x] 在 ChatUI.vue 中添加 `defineSlots<ChatUISlots>()`。
- [x] 类型化 header slot props。
- [x] 类型化 left-aside slot props。
- [x] 类型化 main slot props。
- [x] 类型化 footer slot props。
- [x] 类型化 Bubble 和 Sender 扩展 slots。
- [x] 确认区域 slot 替换默认内容但保留预期容器。
- [x] 确认 right-aside slot 可以启用右侧栏。
- [x] 保持 History item identity 稳定。
- [x] 保持 desktop dock 行为。
- [x] 保持 mobile drawer 行为。
- [x] 保持自动滚动和 ScrollToBottom 行为。
- [x] 将无点击行为的 Logo button 改为正确语义元素，或实现明确事件。
- [x] 实现或移除 `Ctrl K` 提示。
- [x] 验证所有图标按钮 aria-label。
- [ ] 验证 mobile drawer Escape、focus 和 overlay。
- [ ] 验证长标题、长模型名和窄屏布局。

## 8. Demo 验证矩阵

- [x] 将当前 `demo/cases/chat-ui.vue` 拆到 `demo/cases/chat-ui/`。
- [x] 创建 `DefaultCase.vue`。
- [x] DefaultCase 只渲染 `<TrChatUI />`。
- [x] DefaultCase 不引入 Runtime、Kit 或 ThemeProvider。
- [x] 创建 `ConfiguredCase.vue`。
- [x] ConfiguredCase 验证 UI 覆盖。
- [x] ConfiguredCase 验证 `false` 关闭能力。
- [x] ConfiguredCase 验证 slots。
- [x] 创建 `ControlledCase.vue`。
- [x] ControlledCase 只使用普通 Vue refs/computed。
- [x] ControlledCase 不导入 Runtime 或 Kit 类型。
- [x] ControlledCase 验证 conversations/messages。
- [x] ControlledCase 验证 Composer v-model。
- [x] ControlledCase 验证 Model/MCP View + Emits。
- [x] ControlledCase 验证 loading/disabled/pending。
- [x] `index.vue` 提供三个场景的明确切换。
- [ ] desktop 手工验证完成并记录结果。
- [ ] mobile 手工验证完成并记录结果。
- [ ] 运行 package type-check 并记录结果。

## 9. TrChat Adapter

- [x] 将 Runtime conversation 映射为 `ChatConversationView`。
- [x] 将 Runtime messages 映射为 ChatViewState.messages。
- [x] 将 Runtime request state 映射为 `ChatComposerView`。
- [x] 将 Runtime Model 映射为 `ChatModelView`。
- [x] 将 Runtime MCP 映射为 `ChatMcpView`。
- [x] 将 ChatUI conversation emits 转发到 Runtime actions。
- [x] 将 ChatUI submit/cancel 转发到 Runtime actions。
- [x] 将 ChatUI Model emits 转发到 Runtime settings/actions。
- [x] 将 ChatUI MCP emits 转发到 Runtime settings/actions。
- [x] TrChat 不允许 `ui` 覆盖 Runtime 展示真相。
- [x] TrChat 透传全部 ChatUI slots。
- [x] TrChat 不向 ChatUI 泄漏 Runtime 类型。
- [ ] 运行 package type-check 并记录结果。

## 10. 自动化与最终清理

- [ ] 添加 ChatUI typecheck fixtures。
- [ ] 添加零 Props mount 自动化用例。
- [ ] 添加受控 Composer 自动化用例。
- [ ] 添加非受控 Composer 自动化用例。
- [ ] 添加 Prompt 回填自动化用例。
- [ ] 添加 conversation emits payload 自动化用例。
- [ ] 添加 UI `false` 关闭区域自动化用例。
- [ ] 添加 desktop dock 自动化用例。
- [ ] 添加 mobile drawer 自动化用例。
- [x] 执行 UI/Runtime 边界 rg 检查。
- [ ] 执行 `pnpm -F @opentiny/tiny-robot-chat type-check`。
- [ ] 执行 `pnpm build:components` 后启动全新 test server。
- [ ] 执行相关 Playwright 测试。
- [x] 删除未使用旧类型、imports、helpers 和临时 adapter。
- [x] 检查 `src/index.ts` 最终公共导出。
- [x] 检查 demo 不再引用旧 API。
- [ ] 检查工作区 diff 只包含 ChatUI 方案相关变更。

### 阶段 10 验证记录

- `pnpm -F @opentiny/tiny-robot-chat type-check` 已尝试执行，但当前工作区缺少 `node_modules`，`vue-tsc` 不可用；本任务不执行 install，因此未勾选 type-check 通过项。
- 静态证据：`src/ui/resolveOptions.ts` 中 `historyDefaults` 和 `welcomeDefaults` 由合并后的有效 `labels` 创建，随后再 spread `options.history` / `options.welcome`，因此 labels 覆盖默认文案且显式区域字段仍保持最高优先级。
- 静态证据：`src/composables/useChatInput.ts` 不再主动将 `inputValue` 置空；Runtime action 派发前等待一个 microtask，让 `ChatUI` 先按 `ui.composer.clearOnSubmit` 发出受控值更新，失败恢复仅在当前值仍为空时写回旧值。
- 静态证据：`src/components/MCPSelector.vue` 的 add/toggle handler 不再即时 emit `loadTools`，工具加载仅由 `toolLoadCandidates` watcher 在 View 已反映 `installed + enabled` 且 tools 缺失后触发，避免 add/toggle 异步完成前抢跑。
- 静态证据：`src/Chat.vue` adapter 维护 `modelSelecting`、`pendingModelFeatureIds`、`pendingMcpServerIds` 和 `pendingMcpToolIds`，并映射到 `ChatModelView` / `ChatMcpView` 的 pending/loading 字段；pending 队列留在 adapter 内部，不进入 ChatUI。
- 静态证据：`src/Chat.vue` 使用 `runAdapterAction` 包装 Model/MCP fire-and-forget runtime action，统一 catch/log reject，避免 unhandled rejection；pending 清理仍在 `withModelSelecting`、`withModelFeaturePending`、`withMcpServerPending`、`withMcpToolPending` 的 `finally` 中执行。
- 静态证据：使用主仓库已有 `vue-tsc` 二进制执行 `--noEmit -p packages\chat\tsconfig.json` 后，执行 worktree 仍因依赖缺失报 TS2307；筛选 `resolveOptions.ts` / `defaults.ts` 未再出现 `defaults.messages` 可能为 undefined、`defaults.composer` 可能为 false/undefined 等 TS18048/TS2339 真实 resolver 错误。
- 静态证据：补充 `ResolvedChatUIOptions` 后再次执行同一 `vue-tsc --noEmit -p packages\chat\tsconfig.json`；筛选 `ChatUI.vue`、`ChatMessages.vue`、`ChatHeader.vue`、`resolveOptions.ts`、`options.ts`、`slots.ts` 已无 resolved options、header slot、welcome 重复字段或 prompts items 相关诊断。剩余 `defaults.ts` 诊断为临时 junction 依赖树中 Vue `3.5.34` 与 `3.5.33` 的 VNode 类型来源冲突，未用 `any` 掩盖。
- 静态证据：`ChatWelcomeOptions` 改为输入部分配置，`ResolvedChatWelcomeOptions` 由 resolver 保证 `title` / `description` 必填；`Chat.vue` 不再在无活动会话时硬编码“新对话”，交由 `resolveChatViewState` 使用有效 labels fallback；`ChatUI.vue` 的右侧栏可见性只依赖 resolved `rightAside !== false`，显式 `ui.rightAside` 无 slot 也会启用布局；resolver 对区域 object merge 使用 `withoutUndefined`，保留显式字段覆盖、数组替换和 false 关闭语义。

## 11. 整体文档回填（延后）

- [ ] ChatUI API 稳定后更新 `architecture.md`。
- [ ] ChatUI API 稳定后更新 `migration-plan.md`。
- [ ] 删除整体文档中已失效的 ChatUi/controller 描述。
- [ ] 将最终 Props、Emits、Slots 和默认值同步到整体文档。
- [ ] 将实际验证结果同步到整体文档。

## 完成门禁

- [ ] `<TrChatUI />` 可以独立渲染。
- [ ] UI 类型不依赖 Runtime、Kit、Vue Ref 或 controller actions。
- [ ] `ui` 只包含展示配置。
- [ ] Composer 受控/非受控语义通过验证。
- [ ] Model/MCP 使用 View + Emits。
- [ ] desktop/mobile 现有交互无回归。
- [ ] 三个 ChatUI Demo 场景通过验证。
- [ ] TrChat adapter 接入新契约。
- [ ] 静态检查和相关自动化检查通过。
