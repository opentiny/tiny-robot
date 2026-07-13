# TinyRobot Chat MVP 实施方案

补充阅读：

- [architecture.md](./architecture.md)：当前真实协议与默认装配
- [evolution-path.md](./evolution-path.md)：未来扩展判断与演进顺序

## 1. MVP 目标

MVP 只验证 chat 套件核心架构是否成立。

核心验证：

- `TrChat` 能作为默认完整聊天应用入口
- `ChatRuntime` 能作为数据层 adapter 协议
- `TrChat` 内部 `ChatComposer` 能承接输入交互状态
- `ChatUi` 能作为原子组件展示配置协议
- kit 新项目能通过 `useLocalChatRuntime()` 快速接入
- 已有 kit runtime 能通过 `useKitChatRuntime()` 只迁移 UI
- 用户已有数据层能通过自定义 `ChatRuntime` 只接入 TinyRobot UI
- slots 能做局部区域替换

MVP 接入：

- `TrLayout`
- `TrHistory`
- `TrBubbleProvider`
- `TrBubbleList`
- `TrWelcome`
- `TrPrompts`
- `TrSender`
- `TrLayout.ProxyScrollbar`

## 2. 目录约束

```txt
packages/chat/
  src/
    index.ts
    Chat.vue
    context.ts
    types.ts
    composables/
      useChatContext.ts
      useChatComposer.ts
      useKitChatRuntime.ts
      useLocalChatRuntime.ts
    components/
      Header.vue
      Conversations.vue
      Messages.vue
      Sender.vue
      ScrollToBottom.vue
  demo/
    cases/
      built-in-kit.vue
      existing-kit.vue
      custom-runtime.vue
      minimal-custom-runtime.vue
      shared.ts
      useCustomRuntime.ts
    scenario.ts
```

约束：

- `src/types.ts` 只放公共协议类型
- `src/context.ts` 只定义 context key 和上下文结构
- `src/composables/useKitChatRuntime.ts` 只做 `kit -> ChatRuntime` 映射
- `src/composables/useLocalChatRuntime.ts` 只补齐 kit quick start 行为
- `src/components/*` 只做内部映射，不作为 v1 public API
- `src/components/*` 内部负责把 `ChatRuntime` 数据映射成默认 UI 组件输入
- demo 分别验证 Built-in Kit Runtime、Existing Kit Runtime、Custom Runtime、Minimal Custom Runtime
- demo 只保留最小 mock 回复，不引入日志面板或场景控制
- 真实 LLM 只作为协议冻结前的可选 smoke，不作为默认 Demo 依赖

## 3. 阶段 1：公共协议

目标：先把主协议定稳。

实现内容：

- 定义 `ChatRuntime`
- 定义 `ChatRuntimeConversations / ChatRuntimeMessages / ChatRuntimeSender`
- 定义 `ChatSubmitPayload`
- 定义 `ChatConversationItem / ChatMessageItem`
- 定义 `ChatMessagePart` 和最小 `parts / metadata` 扩展口
- 定义 `ChatUi`
- 定义内部 `ChatComposer`
- 定义 `ChatContext`
- 定义稳定的 slot props 类型

关键调整：

- `ChatRuntimeSender` 只保留 `disabled / loading`
- `ChatRuntimeActions` 移除 `setInputValue`
- 输入草稿、提交禁用、Prompt 回填归 `ChatComposer`
- 不在 MVP 阶段引入公开 `ChatCapabilities/Adapters`
- 不在 MVP 阶段把复杂发送上下文做成业务字段扩展

验证点：

- `runtime` 只暴露只读 state + actions
- `ui` 只负责原子组件 props 配置
- `ui` 不包含数据源字段
- 输入状态不要求 external runtime 提供

## 4. 阶段 2：Context 与 Composer

目标：建立 `TrChat` 内部统一上下文。

实现内容：

- `Chat.vue` 接收 `runtime` 和 `ui`
- `Chat.vue` 内部创建最小 `composer`
- `Chat.vue` provide `runtime + composer + ui`
- `useChatContext()` 提供统一读取入口

验证点：

- 内部组件共享同一份 `runtime + composer + ui`
- `Chat.vue` 不接管 transport
- `composer` 不作为 public API 导出

## 5. 阶段 3：Sender

目标：打通输入、提交、取消。

实现内容：

- 内部 `Sender.vue` 使用 `TrSender`
- `composer.inputValue -> TrSender.modelValue`
- `runtime.sender.loading -> TrSender.loading`
- `runtime.sender.disabled -> TrSender.disabled`
- `composer.submitDisabled -> TrSender.defaultActions.submit.disabled`
- `composer.setInputValue -> update:modelValue`
- `composer.send -> submit(text, structuredData)`
- `composer.abort -> cancel`
- `ui.sender` 透传给 `TrSender`

验证点：

- 输入状态由 `composer` 管理
- `structuredData` 原样进入 `runtime.actions.send`
- `loading=true` 时取消能调用 `runtime.actions.abort`
- 发送成功清空输入，发送失败保留输入

## 6. 阶段 4：Messages

目标：打通消息展示、空状态和快捷提示。

实现内容：

- 内部 `Messages.vue` 使用 `TrBubbleProvider / TrBubbleList / TrWelcome / TrPrompts`
- `runtime.messages.items -> BubbleDisplayMessage[] -> TrBubbleList.messages`
- `ui.bubbleProvider -> TrBubbleProvider`
- `ui.bubbleList -> TrBubbleList`
- `ui.welcome -> TrWelcome`
- `ui.prompts -> TrPrompts`
- 无消息时显示 `Welcome + Prompts`
- 有消息时显示 `BubbleList`
- 点击 Prompt 默认调用 `composer.setInputValue(item.label)`

验证点：

- 消息来源只有 `runtime.messages.items`
- 默认 UI 只消费内部 `BubbleDisplayMessage`
- Prompt 只依赖 `composer.setInputValue`
- `ui` 能透传 Bubble、Welcome、Prompts 配置

## 7. 阶段 5：Conversations 与 Header

目标：补齐多会话最小闭环。

实现内容：

- 内部 `Conversations.vue` 使用 `TrHistory`
- `runtime.conversations.items -> HistoryDisplayItem[] -> TrHistory.data`
- `runtime.conversations.currentId -> TrHistory.selected`
- `item-click -> runtime.actions.switchConversation`
- `item-title-change -> runtime.actions.renameConversation`
- `item-action(delete) -> runtime.actions.deleteConversation`
- 内部 `Header.vue` 显示标题和可选新建会话按钮

验证点：

- `History` 只消费 runtime conversations
- 编辑态依赖稳定 item identity，因此 `HistoryDisplayItem` 不能用简单 `computed(map)` 替代
- 无 `runtime.conversations` 时不报错
- 菜单动作根据 runtime actions 自动收敛

## 8. 阶段 6：TrChat 默认装配

目标：验证 `TrChat` 黑盒入口成立。

实现内容：

- `Chat.vue` 默认装配 `Header / Conversations / Messages / Sender`
- `ui.layout` 透传给 `TrLayout`
- 内置 `ProxyScrollbar / ScrollToBottom`
- 支持 `header / left-aside / main / footer` slots

验证点：

- 默认装配能表达完整聊天应用
- slot 能替换区域
- 覆盖 slot 后对应默认组件不再渲染

## 9. 阶段 7：Built-in Kit Runtime

目标：验证 kit 作为 TinyRobot 托管状态的官方路径。

实现内容：

- `useLocalChatRuntime` 创建 `useConversation()`
- `useLocalChatRuntime` 组合 `useKitChatRuntime()`
- 首次发送前没有会话时自动建会话
- 支持 title fallback
- 维护 `messages.lastError`

验证点：

- 发送、流式、取消正常
- 会话切换后消息更新
- 首次发送自动建会话
- external runtime 能力不被破坏

## 10. 阶段 8：Existing Kit Runtime

目标：验证老项目可以保留已有 kit runtime，只迁移到 `TrChat` UI。

实现内容：

- `useKitChatRuntime` 作为公开 adapter
- 输入已有 `useConversation()` 返回值
- 输出 `ChatRuntime`
- `lastError` 改为可选入参
- 不要求用户传输入框状态

验证点：

- 不重新创建 `useConversation`
- 不覆盖用户已有 transport / plugins / storage 配置
- 会话切换、消息展示、取消生成仍走原有 kit runtime

## 11. 阶段 9：Custom Runtime

目标：验证用户自有数据层可以只接 TinyRobot UI。

实现内容：

- demo 内实现一个自定义 `ChatRuntime`
- 用户数据层负责 messages、conversations、loading、send、abort
- `TrChat` 内部负责输入草稿和提交交互

验证点：

- custom runtime 不需要提供输入框 ref
- custom runtime 只需要适配消息、会话和请求生命周期
- 发送成功后输入框由 `TrChat` 清空

## 12. 阶段 10：Minimal Custom Runtime

目标：验证 `runtime.conversations` 不是默认接入的强制字段。

实现内容：

- demo 内实现一个最小 `ChatRuntime`
- 只提供 `messages / sender / actions.send`
- 不提供 `conversations`

验证点：

- 默认 UI 不因为缺少 `conversations` 报错
- 单会话接入路径可以正常发送和展示消息
- 输入草稿仍由 `TrChat` 内部处理

## 13. MVP 验收清单

- 没有修改原子组件已有 props
- runtime state 只读，变更只走 actions
- `ui` 只负责 UI 配置，不接管数据源字段
- 输入草稿不属于 `ChatRuntime`
- `TrChat` 能作为默认主入口工作
- 对外解释为两类状态归属：TinyRobot kit 或用户外部数据层
- `kit` 只在 runtime adapter 层出现
- 已有 kit runtime 可以通过 `useKitChatRuntime` 迁移 UI
- external runtime 可以只接 UI
- minimal custom runtime 可以不提供 `conversations`
- Prompt 回填、发送、取消、消息渲染、会话切换能闭环

## 14. 后续测试沉淀

MVP 初期先用 `type-check + dev demo` 验证架构。当前优先把 Demo 作为 Runtime 路径的最小示例，协议稳定后再沉淀自动化测试。

协议和实现稳定后，再沉淀：

- 类型约束：`ui.sender` 不能传 `modelValue / defaultValue / loading / disabled`
- 类型约束：`ui.bubbleList` 不能传 `messages`
- 类型约束：`ui.history` 不能传 `data / selected`
- existing kit runtime 交互验证
- external runtime 交互验证
- kit quick start 集成验证

## 15. E2E 验证注意

任何 e2e / Playwright 测试前必须先构建 components 包。

推荐流程：

```txt
pnpm build:components
重启测试服务
pnpm -F tiny-robot-test test
```

## 16. 范围外说明

下面这些不属于当前 MVP 实现范围：

- `runConfig?.custom` 这类中性发送上下文扩展
- `parts / metadata` 的稳定公开渲染约定
- 公开 `ChatCapabilities/Adapters`

这部分统一放在 [evolution-path.md](./evolution-path.md) 里讨论。
