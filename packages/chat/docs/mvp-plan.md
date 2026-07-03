# TinyRobot Chat MVP 实施方案

## 1. MVP 目标

MVP 只验证 chat 套件的核心架构是否成立，不追求完整功能。

核心验证：

- `TrChat` 能否作为默认完整聊天应用入口。
- `ChatRuntime` 能否作为唯一数据与动作协议。
- `ChatUi` 能否作为唯一原子组件展示配置协议。
- `kit` 能否作为官方 local runtime。
- 已有 kit runtime 能否通过 adapter 快速接入 `TrChat`。
- 用户已有数据层时，能否通过 external runtime adapter 只接入 TinyRobot UI。
- slots 能否作为局部扩展机制，而不需要第二套白盒区域组件体系。

MVP 只接入：

- `TrLayout`
- `TrHistory`
- `TrBubbleProvider`
- `TrBubbleList`
- `TrWelcome`
- `TrPrompts`
- `TrSender`
- `TrLayout.ProxyScrollbar`

## 2. 预期目录

```text
packages/chat/
  package.json
  AGENTS.md
  docs/
    architecture.md
    mvp-plan.md
    pre-research.md
  src/
    index.ts
    Chat.vue
    context.ts
    types.ts
    composables/
      useChatContext.ts
      useKitChatRuntime.ts
      useLocalChatRuntime.ts
    components/
      Header.vue
      Conversations.vue
      Messages.vue
      Sender.vue
      ScrollToBottom.vue
  demo/
    App.vue
    main.ts
    style.css
    cases/
      basic.vue
      external-runtime.vue
      useDemoRuntime.ts
```

目录约束：

- `src/types.ts` 只放公共协议类型。
- `src/context.ts` 只定义 context key 和上下文结构。
- `src/composables/useChatContext.ts` 只负责读取上下文。
- `src/composables/useKitChatRuntime.ts` 只做 `kit -> ChatRuntime` 映射。
- `src/composables/useLocalChatRuntime.ts` 只补齐 chat 应用层行为。
- `src/components/*` 只做内部映射，不作为 v1 稳定 API 承诺。
- `demo/cases/basic.vue` 验证 local runtime 黑盒入口。
- 后续补充 existing kit runtime demo，验证已有 `useConversation()` 接入 `TrChat`。
- `demo/cases/external-runtime.vue` 验证 external runtime 只接 UI。

## 3. 阶段 1：公共协议收口

目标：先把主协议定稳，不急着扩展 UI 行为。

实现内容：

- 定义 `ChatRuntime`。
- 定义 `ChatRuntimeConversations / ChatRuntimeMessages / ChatRuntimeSender`。
- 定义 `ChatSubmitPayload`。
- 定义 `ChatConversationItem / ChatMessageItem`。
- 定义 `ChatUi`。
- 定义 `ChatContext`。

验证点：

- `runtime` 是否只暴露只读 state + actions。
- `ui` 是否只负责原子组件 props 配置。
- `ui` 是否没有包含 runtime 接管字段。

验证方案：

- 执行 chat 包类型检查。
- 写类型用例，确认 `ui.sender` 不能配置 `modelValue / defaultValue / loading / disabled`。
- 写类型用例，确认 `ui.bubbleList` 不能配置 `messages`。
- 写类型用例，确认 `ui.history` 不能配置 `data / selected`。

通过标准：

- 类型可导出。
- 协议不依赖内部实现。
- 不新增 transport、新消息模型、新会话模型。

## 4. 阶段 2：Context 与基础映射

目标：建立 `TrChat` 内部统一上下文，不引入白盒根组件。

实现内容：

- `Chat.vue` 接收 `runtime` 和 `ui`。
- `Chat.vue` provide `runtime + ui`。
- `useChatContext()` 提供统一读取入口。
- 内部组件从 context 读取协议，不直接依赖 `kit` 原始结构。

验证点：

- 内部组件是否共享同一份 `runtime + ui`。
- `Chat.vue` 是否没有变成巨型状态管理层。

验证方案：

- 用调试组件读取 `runtime.messages.items`、`runtime.sender.inputValue`、`ui.sender`。
- 确认内部映射只消费上下文，不单独创建状态源。

通过标准：

- context 结构稳定。
- 内部组件不直接碰 `kit` 原始返回值。

## 5. 阶段 3：Sender

目标：先打通最核心事件流：输入、提交、取消。

实现内容：

- 内部 `Sender.vue` 使用 `TrSender`。
- `runtime.sender.inputValue -> TrSender.modelValue`。
- `runtime.sender.loading -> TrSender.loading`。
- `runtime.sender.disabled -> TrSender.disabled`。
- `runtime.sender.submitDisabled -> TrSender.defaultActions.submit.disabled`。
- `runtime.actions.setInputValue -> update:modelValue`。
- `runtime.actions.send -> submit(text, structuredData)`。
- `runtime.actions.abort -> cancel`。
- `ui.sender` 透传给 `TrSender`。

验证点：

- 输入状态是否完全由 runtime 管理。
- `structuredData` 是否能原样进入 runtime。
- `loading` 时取消是否能调用 `abort`。

验证方案：

- 用 external mock runtime 渲染 `Sender`。
- 输入后确认 `setInputValue()` 被调用。
- 提交后确认 `send({ text })` 被调用。
- `loading=true` 时触发取消，确认 `abort()` 被调用。

通过标准：

- `Sender` 不维护自己的输入源。
- 所有变更只走 `runtime.actions`。

## 6. 阶段 4：Messages

目标：打通消息展示、空状态和快捷提示。

实现内容：

- 内部 `Messages.vue` 使用 `TrBubbleProvider`、`TrBubbleList`、`TrWelcome`、`TrPrompts`。
- `runtime.messages.items -> TrBubbleList.messages`。
- `ui.bubbleProvider -> TrBubbleProvider`。
- `ui.bubbleList -> TrBubbleList`。
- `ui.welcome -> TrWelcome`。
- `ui.prompts -> TrPrompts`。
- 无消息时显示 `Welcome + Prompts`。
- 有消息时显示 `BubbleList`。
- 点击 Prompt 默认调用 `runtime.actions.setInputValue(item.label)`。

验证点：

- 消息来源是否只有 `runtime.messages.items`。
- 空状态是否独立于消息列表。
- `ui` 是否能透传 Bubble、Welcome、Prompts 配置。

验证方案：

- `messages=[]` 时显示 `Welcome + Prompts`。
- `messages=[...]` 时显示 `BubbleList`。
- 点击 Prompt 后确认 `setInputValue(prompt.label)` 被调用。
- 修改 `ui.bubbleList.roleConfigs` 后确认角色样式生效。

通过标准：

- `Messages` 不发请求。
- `Messages` 不创建消息。
- Bubble 渲染仍使用现有 `BubbleProvider / BubbleList`。

## 7. 阶段 5：Conversations 与 Header

目标：补齐多会话最小闭环。

实现内容：

- 内部 `Conversations.vue` 使用 `TrHistory`。
- `runtime.conversations.items -> TrHistory.data`。
- `runtime.conversations.currentId -> TrHistory.selected`。
- `item-click -> runtime.actions.switchConversation`。
- `item-title-change -> runtime.actions.renameConversation`。
- `item-action(delete) -> runtime.actions.deleteConversation`。
- 内部 `Header.vue` 显示标题和可选新建会话按钮。

验证点：

- `History` 是否只消费 runtime conversations。
- 无 `runtime.conversations` 时是否可降级。
- 菜单动作是否根据 runtime actions 自动收敛。

验证方案：

- 点击历史项后确认 `switchConversation(id)` 被调用。
- 重命名后确认 `renameConversation(id, title)` 被调用。
- 删除后确认 `deleteConversation(id)` 被调用。
- 点击新建后确认 `createConversation()` 被调用。

通过标准：

- `ui.history` 不允许覆盖 `data / selected`。
- 无 conversations 时组件不报错。

## 8. 阶段 6：TrChat 默认装配

目标：验证 `TrChat` 作为默认黑盒入口是否成立。

实现内容：

- `Chat.vue` 默认使用 `TrLayout` 装配 `Header / Conversations / Messages / Sender`。
- `ui.layout` 透传给 `TrLayout`。
- 内置 `ProxyScrollbar / ScrollToBottom`。
- 支持 `header / left-aside / main / footer` slots。

默认结构：

```text
TrChat
  -> TrLayout
    -> header
    -> left-aside
    -> main
    -> footer
```

验证点：

- 默认装配是否足够表达完整聊天应用。
- slot 是否能替换区域，但不破坏 `runtime + ui` 协议。
- 覆盖 slot 后，对应默认组件是否不再渲染。

验证方案：

```vue
<TrChat :runtime="runtime" :ui="ui" />
```

```vue
<TrChat :runtime="runtime" :ui="ui">
  <template #footer="{ inputValue, loading, send, abort, setInputValue }">
    <CustomSender
      :model-value="inputValue"
      :loading="loading"
      @update:model-value="setInputValue"
      @submit="send"
      @cancel="abort"
    />
  </template>
</TrChat>
```

通过标准：

- `TrChat` 作为默认黑盒入口可用。
- slot 替换不需要第二套白盒组件体系。

## 9. 阶段 7：接入 Local Runtime

目标：验证 `kit` 可以作为官方 runtime core。

实现内容：

- `useKitChatRuntime` 映射 `useConversation + useMessage` 到 `ChatRuntime`。
- `useLocalChatRuntime` 补齐：
  - `sender.inputValue`
  - `sender.submitDisabled`
  - 首次发送自动建会话
  - title fallback
  - `messages.lastError`

验证点：

- `kit` 生命周期是否能映射到 `ChatRuntime`。
- 发送、流式、取消是否正常。
- 会话切换后消息是否更新。
- external runtime 能力是否没有被破坏。

验证方案：

- 用 mock `responseProvider` 流式返回内容。
- 首次发送前没有会话时自动建会话。
- assistant 消息能流式更新。
- `loading` 时 `TrSender` 显示取消行为。
- cancel 后调用 `kit` abort。
- 切换会话后消息列表变化。
- external runtime demo 继续可用。

通过标准：

- `chat` 不新增 transport。
- `chat` 不复制 `kit` 的 stream / abort 生命周期。
- external runtime demo 仍然工作。

## 10. 阶段 8：接入已有 Kit Runtime

目标：验证老项目可以保留已有 kit runtime，只迁移到 `TrChat` UI。

实现内容：

- `useKitChatRuntime` 作为公开 adapter。
- 输入已有 `useConversation()` 返回值。
- 输出 `ChatRuntime`。
- 用户自行传入 `sender.inputValue` 和 `messages.lastError`。

验证点：

- 不重新创建 `useConversation`。
- 不覆盖用户已有 transport / plugins / storage 配置。
- 会话切换、消息展示、取消生成仍走原有 kit runtime。

验证方案：

```ts
const conversation = useConversation(options)
const runtime = useKitChatRuntime(conversation, {
  inputValue,
  lastError,
})
```

通过标准：

- 已有 kit runtime 可以直接接入 `TrChat`。
- `useKitChatRuntime` 不包含 local runtime 的首发建会话等产品默认行为。

## 11. MVP 总验收清单

- 没有修改原子组件已有 props。
- runtime state 只读，变更只走 actions。
- `ui` 只负责 UI 配置，不接管数据源字段。
- `TrChat` 能作为默认主入口工作。
- `kit` 只在 local runtime 层出现，UI 组件不直接依赖 `kit` 返回结构。
- 已有 kit runtime 可以通过 `useKitChatRuntime` 迁移 UI。
- MVP 能覆盖发送、取消、消息渲染、空状态、Prompt 回填、会话切换、黑盒装配、external runtime 接入。

## 12. 后续测试沉淀

MVP 初期先用 `type-check + build + demo` 验证架构，不在第一轮强制引入完整自动化测试目录。

协议和实现稳定后，再沉淀以下测试：

- `chat-runtime` 类型约束验证：确认 `ui` 不能传入被 runtime 接管的字段，例如 `sender.modelValue`、`bubbleList.messages`、`history.data`。
- existing kit runtime 交互验证：验证已有 `useConversation()` 可以通过 `useKitChatRuntime` 接入 `TrChat`。
- external runtime 交互验证：验证用户自有 runtime 只接 UI 时能展示、输入和发送。
- local runtime 集成验证：验证 `useLocalChatRuntime` 基于 `kit` 完成发送、流式更新、取消和首次自动建会话。

## 13. E2E 验证注意

任何 e2e / Playwright 测试前必须先构建 components 包。

重新构建 components 后，最好重启测试服务，避免旧服务复用缓存影响判断。

推荐流程：

```text
pnpm build:components
重启测试服务
pnpm -F tiny-robot-test test
```
