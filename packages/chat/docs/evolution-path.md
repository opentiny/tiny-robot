# TinyRobot Chat 演进路径记录

## 1. 目的

这份文档用于收口已经讨论过、后续还会反复遇到的判断：

- `TrChat` 当前方案到底定到了什么程度
- assistant-ui 的调研结论对我们真正有用的是什么
- 当前阶段为什么不继续抽象
- 后续什么时候才值得引入新的扩展层
- 接下来应该按什么顺序推进

这份文档不替代：

- [architecture.md](./architecture.md)：当前架构定义
- [mvp-plan.md](./mvp-plan.md)：MVP 实施计划
- [review-qa.md](./review-qa.md)：评审口头表达

它的作用是：记录已经形成共识的“方向判断”和“演进条件”，避免后续重复讨论同样的问题。

它不重复承担：

- 当前真实协议定义：见 [architecture.md](./architecture.md)
- 阶段任务和验收清单：见 [mvp-plan.md](./mvp-plan.md)

## 2. 当前已定下来的基础结构

当前 v1 / MVP 方案已经收敛为：

```txt
TrChat + ChatRuntime + internal ChatComposer + ChatUi + slots
```

对应边界：

| 模块 | 当前职责 |
| --- | --- |
| `ChatRuntime` | 会话、消息、请求生命周期 |
| `ChatComposer` | 输入草稿、提交禁用、Prompt 回填、发送清空 |
| `ChatUi` | 默认原子组件展示配置 |
| `slots` | 布局区域替换 |

当前协议落点见：

- [types.ts](../src/types.ts)
- [architecture.md](./architecture.md)

已经明确的关键判断：

1. `ChatRuntime` 是 UI adapter 协议，不是底层 engine/runtime 协议。
2. 输入草稿不属于 `ChatRuntime`，而属于内部 `ChatComposer`。
3. `ChatUi` 只负责默认组件展示配置，不接管数据源。
4. `slots` 只解决布局替换，不承担新的状态协议职责。
5. `chat` 内部负责把 `ChatRuntime` 数据适配为默认 `TrHistory / TrBubbleList / TrSender` 所需输入。

## 3. 当前方案已经解决了什么

当前实现已经完成了下面这些关键收口：

### 3.1 UI 与外部数据层的基础解耦

`TrChat` 对外只依赖 `ChatRuntime`，而不直接依赖：

- `useConversation()`
- AI SDK
- Pinia
- 自研 store

这意味着：

```txt
kit / AI SDK / Pinia / legacy store
  -> ChatRuntime
  -> TrChat
```

这条路径已经成立。

### 3.2 输入草稿已从 runtime 协议中剥离

这一步是当前方案最关键的修正。

现在：

- runtime 只负责业务生命周期
- composer 只负责输入交互

好处：

- 已有 kit runtime 迁移时，不需要额外传 `inputValue`
- external runtime 不需要感知输入框状态
- `ChatRuntime` 边界保持干净

### 3.3 默认 UI 对底层原子组件的耦合已收口到内部

当前 `chat` 内部已经做了两层 adapter：

- 会话列表：`ChatConversationItem -> HistoryDisplayItem`
- 消息列表：`ChatMessageItem -> BubbleDisplayMessage`

这意味着公共协议不再直接依赖 UI 组件类型。

### 3.4 已有 kit runtime 迁移路径已经建立

`useKitChatRuntime()` 的职责已经清楚：

- 输入已有 `useConversation()`
- 输出 `ChatRuntime`
- 保留 transport / storage / plugins / 生命周期
- 只迁移 UI，不重建数据层

这条路径是本项目相对 assistant-ui 更有特色的地方。

## 4. 当前方案还没有完全闭环的地方

当前还没有完全闭环的点，不在“基础架构”，而在“未来扩展表达力”。

主要有两类：

### 4.1 复杂发送上下文

当前 `ChatSubmitPayload` 还是：

```ts
interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
}
```

这对简单聊天已经够用，但对这些场景偏窄：

- 多模态输入
- 上传附件
- 每次发送附带额外上下文
- 发送时附带临时运行配置

注意：

这里缺的是“通用表达力”，不是“业务字段”。

### 4.2 复杂消息渲染的稳定扩展面

当前已经有：

- `ChatMessageItem.parts?`
- `ChatMessageItem.metadata?`

但还没有把“复杂渲染扩展面”定义成稳定公开约定。

也就是说：

- 现在可以留扩展口
- 但还不该在 MVP 阶段建立新的公开扩展框架

### 4.3 这两类缺口不等于业务耦合

这里要明确一个容易跑偏的点：

- “复杂发送上下文”
- “复杂消息渲染扩展面”

这两类问题本身不等于业务耦合。

真正会造成业务耦合的是：

- 把 `modelId / pluginIds / sessionCode / nextRemoterConfig` 这类项目字段直接塞进公共协议
- 把 `uiContent / pluginResult / attachmentsContent` 这类业务渲染字段直接写进消息主类型

因此，后续如果要补扩展能力，方向应该是：

- 继续补“中性表达力”
- 不补“项目专属字段”

## 5. assistant-ui 调研后得到的真正启发

assistant-ui 对我们最有价值的不是“把一切都做成 runtime framework”，而是下面四点。

### 5.1 核心 runtime 保持瘦

assistant-ui 的做法说明：

- 核心 runtime 不应该承担所有可选能力
- 复杂能力应和核心生命周期分层

这和我们当前把 `ChatRuntime` 控制在“state + actions”的方向是一致的。

### 5.2 复杂能力应和核心 runtime 分层

assistant-ui 的做法不是把所有能力继续塞进主 runtime，而是把复杂能力按层拆开。

对我们的启发是：

- 主 `ChatRuntime` 继续只承接核心聊天生命周期
- 上传、suggestions、扩展渲染这类增强能力，不应该反向污染主 runtime
- 真要继续扩展，也应该优先考虑 capability/adapters 这类独立层，而不是继续扩大 `ChatRuntime`

这不是说现在立刻要公开 `ChatCapabilities/Adapters`，而是说后续演进方向应该朝这里收口。

### 5.3 输入增强应优先落在 composer，而不是 runtime

assistant-ui 把复杂输入能力放在 `ComposerRuntime` 一侧，而不是直接膨胀主 runtime。

对我们的启发是：

- 输入草稿、发送前状态、Prompt 回填，应继续放在 `ChatComposer`
- 不应把输入交互重新塞回 `ChatRuntime`

### 5.4 自定义发送上下文应走中性配置，而不是业务字段

assistant-ui 的一个关键做法是：需要给单次发送附带额外上下文时，优先走 `runConfig/custom` 这类中性配置口，而不是不断给 `send()` 增加业务字段。

对我们的启发是：

- 后续如果要补“复杂发送 payload”，优先考虑 `runConfig?: { custom?: Record<string, unknown> }`
- 不要把 `modelId / knowledgeIds / workflowCode` 直接固化进公共 `ChatSubmitPayload`
- 发送协议扩展的目标是提高表达力，不是承载某个项目的业务模型

这也是为什么“复杂发送 payload”不应被理解成业务耦合。

### 5.5 消息扩展的主轴应是 parts，而不是业务字段

assistant-ui 的 message 扩展更偏：

```txt
text / image / tool / data / generative-ui
  -> parts
```

对我们的启发是：

- `parts` 是值得保留的长期方向
- `metadata` 可以作为辅助口
- 不要把 `uiContent`、`attachmentsContent`、`pluginResult` 这种业务字段直接写入公共协议

### 5.6 assistant-ui 的运行时概念如何映射到 TinyRobot

assistant-ui 的核心链路可以简化理解为：

```txt
UI components -> runtime context -> backend / LLM
```

转译到 TinyRobot：

```txt
assistant-ui LocalRuntime
  -> TinyRobot kit + ChatRuntime adapter

assistant-ui ExternalStoreRuntime
  -> 用户外部数据层 + ChatRuntime adapter

assistant-ui ComposerRuntime
  -> TinyRobot Chat 内部最小 ChatComposer
```

这里最关键的结论是：

- 我们不是照搬 assistant-ui runtime 全家桶
- 我们是借它的分层思想来定义 `ChatRuntime + ChatComposer`
- `useKitChatRuntime()` 是已有 kit 项目的迁移 adapter，不是第三种独立 runtime 模型

## 6. assistant-ui 不应该直接照搬的地方

assistant-ui 的完整 runtime 分层很强，但对我们当前阶段过重。

当前不建议照搬：

1. 完整的公开 runtime 体系
2. 完整的公开 `ComposerRuntime`
3. 一开始就建立 capability/adapters 全家桶
4. 过早把所有增强能力协议化

原因很简单：

- 我们现在还是 MVP 阶段
- 真实迁移场景还不够多
- 公开层级越多，未来兼容成本越高

## 7. 现在为什么不引入 `ChatCapabilities/Adapters`

当前不引入公开的 `ChatCapabilities/Adapters`，不是因为这层永远不需要，而是因为：

```txt
现在还没到“被真实场景反复验证”的阶段。
```

### 7.1 现在不引入的原因

1. 当前 `ChatRuntime` 对核心聊天状态已经够用。
2. 当前真实痛点还没有稳定收敛成一组“重复出现的通用能力”。
3. 现在就抽象只会把未来问题提前固化成 API。
4. 这会让 MVP 阶段多出一层还没有被验证的概念负担。

### 7.2 当前阶段更合理的做法

不是增加新层级，而是：

- 保持 `ChatRuntime` 瘦
- 保持 `ChatComposer` 最小
- 保留 `parts / metadata` 这类中性扩展口
- 等真实场景稳定后，再决定是否引入新的公开能力层

如果后续真实场景已经证明需要扩展，优先级建议是：

1. 先补 `ChatSubmitPayload` 的中性上下文字段，例如 `runConfig`
2. 再补 `ChatMessageItem.parts` 的稳定解释和默认渲染约定
3. 最后才考虑把重复出现的增强能力抽成 `ChatCapabilities/Adapters`

### 7.3 未来候选形态

下面这组写法可以作为未来候选方向，但不是当前 MVP 承诺：

```ts
interface ChatRunConfig {
  custom?: Record<string, unknown>
}

interface ChatSubmitPayload {
  text?: string
  parts?: ChatInputPart[]
  structuredData?: ChatStructuredData
  runConfig?: ChatRunConfig
}

interface ChatCapabilities {
  attachments?: ChatAttachmentAdapter
  messageRenderers?: ChatMessageRendererRegistry
  suggestions?: ChatSuggestionAdapter
}
```

这段的意义不是“现在就实现”，而是提前固定未来扩展的判断标准：

- 发送上下文优先走 `runConfig/custom`
- 消息扩展优先走 `parts`
- 重复出现的增强能力再收口到 `capabilities/adapters`

## 8. 到什么程度才值得引入 `ChatCapabilities/Adapters`

建议满足下面至少 2 条，再考虑正式引入：

1. 同一类增强能力在 2 个以上真实项目中重复出现。
2. 这类能力跨越输入、消息、UI，但又不属于核心会话生命周期。
3. 你已经开始反复想把业务字段塞进 `ChatRuntime`。
4. slot 已经足够灵活，但每次都在重复接同一类增强逻辑。
5. `ChatUi` 已经开始被迫承担功能协议，而不只是展示配置。

只有满足这些条件，抽 `Capabilities/Adapters` 才是在“收口复杂度”，而不是在“提前制造复杂度”。

未来如果真的引入，这层更合理的承载对象应优先是：

- attachments
- suggestions
- message renderers

而不是：

- 项目专属表单字段
- 某个应用独有的 send 参数
- 某个业务系统专用的消息结构

## 9. 关于 layout / container 的判断

对当前迁移方向，有一个已经形成的判断：

```txt
Layout 基本可以视为 Container 的增强版。
```

原因：

- `Container` 更偏简单壳层：`show / fullscreen / title / operations / footer`
- `Layout` 已经覆盖：
  - `normal / floating`
  - `left-aside / right-aside`
  - `dock / drawer`
  - `AsideToggle`
  - `ProxyScrollbar`
  - header / main / footer / aside 结构

因此对聊天应用壳层来说：

- `Layout` 基本满足未来主壳层需求
- 壳层不是当前架构闭环的主要阻塞点

需要客观看待的一点是：

- `Layout` 不等于 `Container`
- `Container` 仍然有 `show / close / fullscreen` 这类窗口语义

但这不影响当前结论：

```txt
现阶段不需要为了壳层问题改变 ChatRuntime 主协议方向。
```

## 10. 建议的实现顺序

当前建议的实现路径是：

### 阶段 A：冻结 MVP 基础协议

目标：

- 先把当前主结构定稳

做法：

- 保持 `ChatRuntime + internal ChatComposer + ChatUi + slots`
- 不引入新的公开层级
- 不把业务字段塞进 `ChatRuntime`

### 阶段 B：完成当前 MVP 验证闭环

目标：

- 证明三类入口都成立

重点验证：

- `useLocalChatRuntime`
- `useKitChatRuntime`
- custom `ChatRuntime`

### 阶段 C：用真实迁移项目压测协议边界

目标：

- 不靠猜测，而是靠真实项目压出缺口

重点观察：

- 复杂发送上下文是否重复出现
- 复杂消息渲染扩展是否重复出现
- 输入区增强能力是否重复出现

### 阶段 D：只补最小中性扩展口

如果真实场景已经证明需要增强，优先补：

- `ChatSubmitPayload` 的中性扩展位
- `ChatSubmitPayload.runConfig?.custom`
- `ChatMessageItem.parts / metadata` 的解释和使用方式

注意：

- 先补“表达力”
- 不先补“新层级”

### 阶段 E：最后才考虑 `ChatCapabilities/Adapters`

只有在增强能力已经稳定重复时，才考虑：

- 上传 adapter
- suggestions adapter
- message renderers adapter

这一步必须是“后验收口”，不是“前验设计”。

## 11. 当前最推荐的短期动作

如果要给当前阶段一个明确顺序，建议是：

1. 先不再扩概念层级。
2. 继续把现有 `TrChat` 的基础协议、demo、迁移路径讲清楚。
3. 用真实迁移项目验证 `ChatSubmitPayload` 和 `ChatMessageItem` 的表达力是否够。
4. 不够时先补中性字段，不补业务字段。
5. 只有当增强能力出现稳定复用后，再抽新层。

## 12. 最终结论

当前最重要的不是继续设计新层级，而是：

```txt
先把基础协议定稳，再让真实迁移场景来决定后续抽象时机。
```

一句话概括当前共识：

```txt
现在做“稳协议 + 压真实场景”，以后再做“抽能力层 + 收复杂度”。
```

补一句防止路线偏移：

```txt
assistant-ui 给我们的启发，不是“现在就把 runtime 做大”，而是“未来扩展时要用中性协议和分层收口复杂度”。
```

## 13. 调研参考

- https://www.assistant-ui.com/docs/runtimes/concepts/architecture
- https://www.assistant-ui.com/docs/runtimes/concepts/adapters
- https://www.assistant-ui.com/docs/api-reference/runtimes/composer-runtime
- https://www.assistant-ui.com/docs/primitives/message
- https://www.assistant-ui.com/docs/tools/tool-ui
- https://www.assistant-ui.com/docs/tools/generative-ui
