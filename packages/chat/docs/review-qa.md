# TinyRobot Chat 评审 QA

本文用于评审前复习。设计事实以 [architecture.md](./architecture.md) 为准，待决策项以 [review-checklist.md](./review-checklist.md) 为准。

## 1. TrChat 的定位是什么？为什么需要这一层？

**标准回答：**

`TrChat` 是 `components + kit` 的应用集成层，也可以理解为两者之上的高级装配。

- `components` 提供 `Layout`、`History`、`BubbleList`、`Sender` 等原子 UI。
- `kit` 提供会话、消息、流式请求、存储、插件和取消请求等数据能力。
- `chat` 把这些能力装配成可直接使用的聊天应用，并统一 UI 与数据层之间的接入协议。

它解决两个明确问题：

1. 新项目不必从零组合 `components + kit`，可以快速创建聊天应用。
2. 已有 Kit 项目可以保留原数据层，只迁移到新的应用 UI。

`TrChat` 不是新的消息引擎，也不替代 `kit` 的 transport、storage、plugin 和 conversation 生命周期。

**评审时一句话：**

> `TrChat` 是应用装配层，目标是同时解决新项目快速创建和已有 Kit 项目只迁移 UI 两类需求。

## 2. 为什么需要 ChatRuntime？它到底负责什么？

**标准回答：**

`ChatRuntime` 是 UI 与数据层之间的公开协议。它同时提供 UI 要读取的状态和 UI 动作对应的回调，但不负责规定底层如何实现。

当前职责包括：

- 会话状态：会话列表、当前会话、加载状态。
- 消息状态：消息列表、请求状态、处理状态、错误状态。
- Sender 派生状态：是否禁用、是否加载中。
- 业务动作：发送、取消、创建、切换、重命名和删除会话。

数据层可以是 Kit、AI SDK、Pinia、自研 store 或老系统。它们只要适配成 `ChatRuntime`，`TrChat` 就不需要知道底层来源。

需要修正一个容易混淆的说法：`ChatRuntime` 不只是“动作协议”，它是 UI 所需的“状态 + 动作”协议；否则状态和动作会分散到多套接口中。

**边界：**

- state 对 UI 只读。
- 修改必须通过 actions。
- 不直接暴露 transport、storage、plugin、API Key 或供应商私有参数。
- 不管理输入框草稿。

## 3. ChatRuntime 和内部输入编排如何分工？

**标准回答：**

`ChatRuntime` 管理会话、消息和请求生命周期；内部输入编排管理当前输入区域的交互状态。

内部输入编排当前负责：

- `inputValue`
- 输入更新
- Prompt 回填
- 提交禁用状态
- 发送成功后清空输入
- 发送失败后恢复输入
- 调用 `runtime.actions.send`

输入草稿属于 UI 临时状态，不属于业务会话数据。把它放进 `ChatRuntime` 会要求所有外部 runtime 额外维护输入框状态，也会让会话协议和 UI 草稿耦合。

`send` 和 `abort` 最终仍是 runtime 的业务动作。内部输入编排可以转发它们，但不拥有底层请求生命周期。

**关于是否公开内部输入编排：**

当前保持内部实现更合适。只有当自定义 footer、附件、队列、单次运行配置等场景反复证明需要稳定访问输入状态时，才适合公开。公开意味着需要长期保证命名、状态语义和兼容性。

## 4. 一次发送的完整数据链路是什么？

**标准回答：**

```txt
TrSender submit
  -> internal send(payload)
    -> ChatRuntime.actions.send(payload)
      -> runtime adapter
        -> Kit engine / AI SDK / 自研后端
```

各层职责：

- `Sender` 采集输入并触发提交。
- 内部输入编排处理输入草稿和提交交互。
- `ChatRuntime.actions.send` 定义 UI 可调用的统一动作。
- runtime adapter 把通用 payload 转换成底层数据层需要的调用。
- Kit 场景最终由 conversation engine、provider、transport 和 plugin 完成真实请求。

因此，`ChatRuntime` 不是实际消息引擎；它规范了调用入口。真正复杂的发送、流式、插件和取消仍由底层 Kit 或外部数据层执行。

## 5. 三种 Runtime 接入路径分别解决什么场景？

**标准回答：**

### `useLocalChatRuntime`

面向新项目。它内部创建 Kit conversation，再通过 `useKitChatRuntime` 映射为 `ChatRuntime`，同时提供首次发送建会话、标题 fallback 和默认错误处理。

### `useKitChatRuntime`

面向已有 `useConversation()` 项目。它接收现有 conversation 实例并做协议映射，不重新创建 engine，也不替换 transport、storage、plugins 和生命周期。

### 自定义 `ChatRuntime`

面向 AI SDK、Pinia、自研 store 和老系统。业务侧负责消息请求、stream、abort、错误和持久化，`TrChat` 只消费统一协议。

需要修正的表达：

- `useLocalChatRuntime` 和 `useKitChatRuntime` 是 adapter/composable，不是两套 Runtime 协议。
- 三种路径最终都输出同一种 `ChatRuntime`。

## 6. 已有 Kit Runtime 迁移时，具体复用什么、不复用什么？

**标准回答：**

复用的数据层能力：

- `conversation.conversations`
- `conversation.activeConversation`
- 当前 active conversation engine 的 messages、requestState、processingState
- create、switch、rename、delete、update、abort 等生命周期动作
- transport、storage、plugins
- 已有会话和消息持久化数据

不复用的 UI 装配：

- 旧页面结构
- 原来的 History、Bubble、Sender 绑定方式
- 旧输入框草稿管理
- 原组件之间的事件胶水代码

迁移的本质是：保留数据层实例和生命周期，用 `useKitChatRuntime` 将其映射为新 UI 协议，再由 `TrChat` 渲染。

这条路径的价值不是“减少学习一个 API”，而是避免用户为了升级 UI 重写已稳定运行的会话、存储、插件和后端链路。

## 7. 为什么默认 UI 内部还需要 adapter？

**标准回答：**

公共 `ChatRuntime` 类型不应该直接等同于 `TrHistory` 或 `TrBubbleList` 的 props。默认 UI 需要明确映射：

```txt
ChatConversationInfo -> HistoryDisplayItem -> TrHistory
ChatMessageItem      -> BubbleDisplayMessage -> TrBubbleList
```

这层 adapter 的价值：

- 隔离公共协议和原子组件类型。
- 允许以后替换默认 UI，而不修改 Runtime。
- 集中处理展示字段、fallback 和格式转换。
- 保证 `TrHistory` 的 item identity 稳定。

`TrHistory` 的重命名状态依赖当前 item 对象引用。每次 computed 都创建新对象时，列表刷新会破坏编辑对象 identity。因此需要本地可写列表、按 id 复用旧 item 引用，并用 watch 同步外部变化。

需要修正的表达：不是“`TrHistory -> conversations` 映射”，而是 Runtime 的 conversation 数据映射成 `TrHistory` 所需展示数据。

## 8. ChatUi 和 slots 的职责边界是什么？

**标准回答：**

`ChatUi` 配置默认原子组件的展示属性，例如 layout、history、bubble、welcome、prompts 和 sender 的 UI props。

`slots` 用于按布局区域替换默认实现：

- `header`
- `left-aside`
- `main`
- `footer`

slot 按区域命名，而不是绑定内部组件名，这样内部默认组件可以替换而不破坏 slot API。

运行时数据不能同时从 `ChatRuntime` 和 `ChatUi` 两处配置。例如 `messages`、`selected conversation`、`modelValue`、`loading` 只能来自 runtime/内部输入状态，否则会出现两个状态源不一致。

高度定制不一定需要完全从零开始。用户可以先用区域 slot 替换局部；只有页面结构和交互模型都发生根本变化时，才回到 `components + kit` 自行装配。

## 9. 自定义 Runtime 的最小接入要求是什么？

**标准回答：**

最小接入仍需输出完整公共协议：

- `conversations`
- `activeConversation`
- `sender.disabled`
- `actions.send`
- 四个会话 actions

其中 `activeConversation` 可以暂时为 `null`，但 `conversations + activeConversation + sender + actions` 四个核心域必须始终存在。

运行时实现和公共请求状态类型均已与 Kit 解耦：外部 runtime 不需要依赖 Kit 实例或 Kit 请求状态类型。Sender loading 由 `activeConversation?.requestState` 派生，避免两个状态源不一致。

## 10. 当前能把 CLI basic 迁移到什么程度？

**标准回答：**

当前可以迁移：

- 消息列表和流式展示
- 会话历史和生命周期操作
- Sender 基础输入、发送和取消
- `useConversation()` 及其 transport、storage、plugins
- 默认 Layout，或通过 slots 复用已有局部 UI

当前还不能无改造替换：

- 模型列表和当前模型
- thinking/search 能力开关
- MCP Server 选择
- MCP Tool 级开关和管理
- 模型/MCP 到单次请求的稳定配置语义

因此准确结论是：当前已完成 CLI basic 的“基础聊天 UI 和 Kit 数据层迁移”，尚未完成“模型和 MCP 业务能力的完整替换”。

业务侧的模型供应商配置、API Key、MCP 凭证和业务插件不应该迁进 `TrChat` 公共协议。

## 11. 模型选择和 MCP 选择应该怎么扩展？

**标准回答：**

首期建议放在窄的可选 capability 中，而不是直接平铺到 `ChatRuntimeActions`：

```txt
ChatRuntime
  -> core state/actions
  -> optional model capability
  -> optional MCP capability
```

分工：

- `ChatRuntimeActions` 处理消息和会话生命周期。
- model capability 提供模型列表、当前选择和选择动作。
- MCP capability 提供 Server 列表、当前选择和选择动作。
- 内部输入编排在提交时读取这些选择并生成单次配置快照。
- UI 选择器只展示状态并调用 capability actions。

MCP 首期建议只支持 Server 级选择。Tool 级开关、市场、安装和连接池涉及权限、发现和调用生命周期，不能仅凭 CLI 当前 UI 状态直接抽象成通用协议。

暂不建立通用 capability registry。只有上传、建议、语音等多种能力反复出现，并证明存在统一生命周期后，再抽象更高层协议。

## 12. ChatRunConfig 解决什么问题？发送时有什么语义？

**标准回答：**

`ChatRunConfig` 用来表达“本次发送使用什么运行配置”，避免把 `modelId`、`pluginIds`、供应商参数等业务字段直接塞进 `send()`。

候选形态：

```ts
interface ChatRunConfig {
  modelId?: string
  mcpServerIds?: readonly string[]
  features?: Record<string, boolean>
  custom?: Record<string, unknown>
}
```

关键语义：

- 发送时生成不可变快照。
- 发送过程中切换模型只影响下一次请求。
- 重试默认使用原请求快照。
- 多会话请求各自持有快照。
- 单次 payload 覆盖 runtime 当前选择，runtime 当前选择覆盖 adapter 默认值。

如果请求执行期间继续读取全局可变选择状态，会导致模型切换、重试和并发会话行为不确定。因此配置必须在发送边界固定下来。

`custom` 只承载暂未标准化的中性上下文，不允许放 API Key、Headers 或 MCP 凭证。

## 13. 当前有哪些必须在评审中决定的关键问题？

**标准回答：**

本次评审需要决定的是边界和语义，不是一次性设计全部未来能力：

1. `ChatRuntime` 是否继续保持瘦。
2. `ChatSubmitPayload` 和 `ChatRunConfig` 哪些字段进入稳定协议。
3. 模型和 MCP 选择状态的作用域：全局、按会话还是允许单次覆盖。
4. 发送快照、重试、并发和会话切换语义。
5. MCP 首期只到 Server 级，还是包含 Tool 级。
6. `ChatRuntime` 是否继续依赖 Kit 请求状态类型。
7. `structuredData` 是否由默认 Kit 链路完整支持。
8. 哪些 API 稳定、实验性或仅内部使用。

建议状态：

- `TrChat`、核心 `ChatRuntime`、`ChatUi`：稳定候选。
- 内部输入编排：内部。
- `ChatRunConfig`：待评审。
- Model/MCP capability：实验性。
- 通用 capability registry：后置。

## 14. 当前 MVP 验收什么？完整替换 CLI basic 还缺什么？为什么模型和 MCP 不阻塞 MVP？

**标准回答：**

当前 MVP 验收的是基础架构和迁移路径：

- `TrChat` 能稳定装配 `components + kit`。
- 基础消息、会话、输入、取消和布局可以工作。
- Built-in Kit、Existing Kit、Custom Runtime 三类接入成立。
- 已有 Kit 项目可以保留 conversation、transport、storage 和 plugins，只迁移 UI。
- 外部 runtime 不需要提供输入框草稿状态。
- 默认 UI 不直接依赖 Kit 原始结构或业务 store。

完整替换 CLI basic 还缺：

- 模型列表和选择。
- thinking/search feature。
- MCP Server 选择。
- MCP Tool 级管理。
- `ChatRunConfig` 及其快照、重试和并发语义。
- 模型/MCP capability 与 Kit provider/plugin 的动态衔接。

模型和 MCP 不阻塞当前 MVP，因为 MVP 首先要证明的是应用装配边界、UI 与数据层解耦，以及三类迁移路径成立。模型和 MCP 属于可选的下一阶段能力，可以建立在稳定的核心协议上；如果现在直接塞进核心 Runtime，反而会扩大范围、模糊职责并增加协议返工风险。

**评审时一句话：**

> 当前 MVP 先验收基础聊天和 Runtime 迁移闭环；模型与 MCP 是完整替换 CLI basic 的下一阶段能力，不应反向污染核心协议。

## 15. 请求期间切换或删除会话、并发发送和 abort 应该是什么语义？

**当前事实：**

Kit 当前允许切换会话时保留原会话正在执行的请求；删除会话时会先取消该会话的请求；`abortActiveRequest()` 只取消当前活动会话。Kit engine 不允许同一会话同时发送两个请求，取消后状态会进入 `aborted`，并结束 processing 状态。

**标准答案：**

- 切换会话不应默认取消原会话请求，原请求可以在后台完成。
- 删除会话必须先取消该会话请求，再移除消息、engine 和持久化数据。
- 同一会话只允许一个进行中的请求。
- 不同会话是否允许并发由 runtime 实现决定，`TrChat` 不自行制造并发。
- `abort` 只处理当前活动会话，完成后 `loading` 必须恢复，`requestState` 必须离开 `processing`。
- 外部 runtime 必须保证 action 完成后 state 最终收敛，UI 不自行猜测请求是否结束。

核心原则是：请求生命周期属于 runtime，UI 只根据公开状态渲染。

**评审时一句话：**

> 切换不等于取消，删除必须取消；同会话单请求，不同会话并发由 runtime 决定。

## 16. 哪些 API 应该冻结？后续破坏性变更怎么处理？

**标准答案：**

本次评审不应该一次冻结所有扩展设计，只冻结已经被三类接入 Demo 验证的基础协议。

建议分级：

- 稳定候选：`TrChat`、核心 `ChatRuntime`、`ChatUi`、区域 slots。
- 冻结前补齐：`ChatSubmitPayload` 的 `structuredData` 传递语义。
- 内部 API：内部输入编排、内部 UI adapter。
- 实验性 API：`ChatRunConfig`、Model/MCP capability。
- 暂不设计：通用 capability registry。

稳定 API 的字段删除、改名和语义变化都属于破坏性变更；新增可选字段通常可以兼容。实验性 API 可以调整，但必须明确标记，不能让用户误认为已经稳定。

在正式冻结前至少需要通过 Built-in Kit、Existing Kit 和 Custom Runtime 三类契约验证。MVP 阶段允许调整，但评审通过后应通过版本记录说明变更，不能静默改变行为。

## 17. 为什么除了 Demo 还需要 runtime adapter 契约测试？

**标准答案：**

Demo 证明“某个页面能运行”，契约测试证明“不同 runtime 都遵守同一协议语义”。两者验证目标不同。

契约测试至少应覆盖：

- `actions.send` 能驱动消息和请求状态变化。
- 失败后 `lastError`、请求状态和输入恢复行为一致。
- `abort` 后请求状态不再是 `processing`。
- 会话切换后 `activeConversation`、messages 和标题同步变化。
- 重命名和删除后 conversations 正确更新。
- `activeConversation === null` 时 UI 回到空态，且不出现悬空会话。

实现上不需要先建设大型测试框架。先把这些行为做成一组共享测试断言，分别运行在 Local Kit、Existing Kit 和最小 Custom Runtime 上即可。

**评审时一句话：**

> Demo 验证接入案例，契约测试验证所有 adapter 是否遵守同一套运行语义。

## 18. content、metadata 和复杂消息渲染应该由谁负责？

**当前事实：**

公共 `ChatMessageItem` 当前使用 `content` 内容项和 `metadata`，内部消息 adapter 会保留它们，但当前没有稳定公开的 renderer registry。独立 `parts` 字段尚未形成实际渲染链路，因此不进入 MVP 协议。

**标准答案：**

- runtime 负责提供中性的消息数据。
- 内部 adapter 负责保留并转换为默认 UI 可消费的结构。
- 默认 `TrChat` 只保证当前基础消息展示。
- 当前复杂渲染通过 `main` slot 替换消息区域，业务侧自行使用 `content` 和 `metadata`。
- 当 tool call、data part、generative UI 等至少被多个真实场景验证后，再建立稳定的 renderer 注册协议。

不建议让模型直接输出任意 HTML 交给 UI 执行。更稳妥的方式是输出结构化 part，由已注册组件根据 `type` 渲染，避免安全问题和业务字段污染核心消息协议。

## 19. 模型和 MCP 选择状态应该是全局、按会话还是单次覆盖？

**标准答案：**

MVP 下一阶段建议先采用最小语义：

- 选择状态由 runtime capability 持有，不由 UI 组件持有。
- 默认按当前应用/runtime 实例全局生效，与 CLI basic 当前使用方式对齐。
- 发送时把当前选择复制进单次 `ChatRunConfig` 快照。
- 发送后切换只影响下一次请求。
- 暂不承诺按会话持久化和单次发送覆盖，等真实迁移场景验证后再加入。

这样既能完成 CLI basic 的模型和 MCP Server 选择迁移，也不会过早引入复杂的状态优先级。后续若增加按会话状态，优先级应明确为：单次配置 > 会话配置 > runtime 默认配置。

## 20. capability 不存在、加载中或失败时，UI 应该怎么处理？

**标准答案：**

- capability 不存在：不渲染对应入口，表示 runtime 不支持该能力。
- capability 正在加载：入口显示加载状态并禁用操作。
- 切换失败：保留上一次有效选择，展示错误，不写入失败值。
- MCP Server 不可用：只在它是本次请求必需能力时阻止发送；否则允许基础聊天继续工作。
- capability 恢复后：清除错误并恢复操作，不要求重建整个 `ChatRuntime`。

UI 只消费 capability 暴露的状态和动作，不直接探测后端、读取凭证或自行重试连接。错误恢复策略由 capability/runtime adapter 负责。

**评审时一句话：**

> 不支持就隐藏，加载中就禁用，失败保留旧值；是否阻止发送由该能力是否为本次请求必需决定。

## 21. 为什么 `ChatUi` 需要事件，computed 为什么不需要 `markRaw`？

**标准答案：**

`ChatUi` 不只是静态样式配置，还需要承接原子组件产生的 UI 事件通知，例如 History 点击、Sender focus 和 Bubble 自定义事件。但这些 listener 不是业务 action：会话、消息和请求状态仍然只能由 Runtime action 修改。

内部执行顺序固定为：

```txt
原子组件事件
  -> internal input state 或 Runtime action
  -> ui.onXxx 同步通知
```

`Chat.vue` 通过只读 ref 向 context 提供最新 `runtime` 和 `ui`，内部 handler 在触发时读取当前 listener。因此父组件可以用 `computed<ChatUi>` 生成响应式配置；函数本身不需要 `markRaw`，viewport 变化也不需要通过 `:key` 重建组件。强制重建会清空输入草稿，并掩盖 context 捕获旧 props 的真实问题。

事件 API 的演进遵循三步：先在 Basic 单文件中验证原子事件和业务动作，再抽取为 `ChatUi` 强类型 listener，最后用 Built-in、Existing 和 Custom 三类 Runtime 验证复用。这样评审看到的是可追溯的抽取过程，而不是只有最终封装。

**评审时一句话：**

> Runtime action 改业务状态，`ChatUi.onXxx` 只发通知；computed 依靠最新 ref 生效，不依赖 `markRaw` 或组件重建。
