# TinyRobot Chat 评审问答稿

## 1. 使用说明

这份文档用于帮助讲清楚 `chat` 套件当前方案。

建议使用方式：

1. 先看“速记版”，建立整体认知。
2. 再看“问答稿”，逐题练习。
3. 最后用“3 句话版本”做口头总结。

这份文档的目标不是替代 [architecture.md](./architecture.md)，而是把正式文档转成更适合口头评审的表达。

## 2. 速记版

一句话：

```txt
chat = components + kit 的应用装配层，用 ChatRuntime 解耦数据层，用内部 ChatComposer 隔离输入交互。
```

核心结构：

```txt
TrChat + ChatRuntime + internal ChatComposer + ChatUi + slots
```

四层职责：

| 层 | 职责 |
| --- | --- |
| `ChatRuntime` | 会话、消息、请求生命周期 |
| `ChatComposer` | 输入草稿、Prompt 回填、提交禁用、成功后清空 |
| `ChatUi` | 默认原子组件展示配置 |
| `slots` | 布局区域替换 |

最关键的设计变化：

```txt
sender 输入草稿不再属于 ChatRuntime，而是收回到 TrChat 内部 ChatComposer。
```

三种入口：

| 入口 | 场景 | 作用 |
| --- | --- | --- |
| `useLocalChatRuntime()` | 新项目 | 快速创建 kit 路径 runtime |
| `useKitChatRuntime()` | 已有 `useConversation()` 项目 | 只迁移 UI，不重建数据层 |
| 自定义 `ChatRuntime` | AI SDK / Pinia / 自研 store / 老系统 | 只接入 TinyRobot UI |

## 3. 问答稿

### Q01. `chat` 套件的定位是什么？它和 `components`、`kit` 的关系是什么？

推荐回答：

`chat` 套件的定位不是新的底层 runtime，也不是新的原子组件库，而是基于 `components + kit` 的 AI 会话应用装配层。`components` 提供 `Layout / History / BubbleList / Sender` 这些原子能力，`kit` 提供消息、会话、请求生命周期等 runtime 能力，`chat` 负责把两者装配成默认可用的 `TrChat`，并定义一层统一的 `ChatRuntime` 协议给 UI 消费。

补充说明：

- 更准确的表达是 `application assembly + UI adapter`。
- “高级封装”这个说法不算错，但不够精确，因为它没有体现 `ChatRuntime` 这层协议价值。

### Q02. 为什么不让用户继续手工拼 `Layout + History + BubbleList + Sender`？

推荐回答：

因为 `chat` 要解决的是“快速交付完整会话应用”的问题，而不是只提供零散组件。用户手工拼虽然能做，但会面临页面结构、状态边界、接入方式都不统一的问题；`TrChat` 的价值是把默认结构、默认映射和接入路径稳定下来，让大部分场景直接有一个公开、易上手、可复用的入口。

补充说明：

- 不是单纯为了“少写代码”。
- 更重要的是统一默认结构和接入方式。

### Q03. `ChatRuntime` 存在的意义是什么？

推荐回答：

`ChatRuntime` 的意义是把不同数据层统一适配成 `TrChat` 能直接消费的协议。这样 `TrChat` 不需要知道底层到底是 `kit`、AI SDK、Pinia，还是老系统数据层，只要符合 `ChatRuntime`，UI 就能工作。

补充说明：

统一链路可以这样讲：

```txt
kit / AI SDK / Pinia / 自研 store
  -> ChatRuntime
  -> TrChat
```

### Q04. 如果没有 `ChatRuntime`，会出现什么问题？

推荐回答：

如果没有 `ChatRuntime`，`TrChat` 就会直接依赖某一种具体数据层返回结构，比如直接依赖 `kit` 的 `useConversation()`。这样 UI 和数据层就绑死了，后续既不能轻松接已有 kit 项目，也不能接 AI SDK、Pinia 或老系统数据层。

### Q05. 为什么说 `ChatRuntime` 是“UI adapter 协议”，而不是“底层 runtime 协议”？

推荐回答：

因为它不是 transport、stream、storage、plugin lifecycle 这些底层能力本身，而是把这些底层能力整理成 UI 好消费的 `state + actions` 形状。底层 runtime 更偏 engine 和生命周期实现，`ChatRuntime` 更偏 UI 看到的会话、消息和动作接口，所以它是 UI adapter，而不是底层 runtime 本身。

### Q06. 为什么 `ChatRuntime` 既要有 state，也要有 actions？如果只有 actions 不行吗？

推荐回答：

不行。`TrChat` 不只是要触发发送，还要渲染消息、会话、请求状态和 loading；如果只有 actions，没有 state，UI 根本不知道当前该显示什么，状态来源就会重新分散到各个组件里，反而失去统一边界。

### Q07. `ChatRuntime` 负责什么？

推荐回答：

它负责业务层的会话、消息和请求生命周期，包括会话列表、当前会话、消息列表、请求状态、发送、取消，以及创建/切换/重命名/删除会话这些动作。简单说，凡是会真正影响消息和会话状态的能力，都属于 `ChatRuntime`。

### Q08. `ChatRuntime` 不负责什么？

推荐回答：

它不负责输入框草稿值、Prompt 回填输入框、空输入时提交按钮禁用、发送成功后清空输入框。这些都属于 `TrChat` 内部的输入交互状态，而不是业务数据层状态。

### Q09. 为什么输入框草稿值不能继续放在 `ChatRuntime` 里？

推荐回答：

因为输入框草稿只是发送前的本地 UI 交互状态，不应该污染对外的 runtime 协议。如果把它放进 `ChatRuntime`，已有 kit runtime 或 external runtime 接入时，就必须额外提供 `inputValue / setInputValue / submitDisabled`，这会让 runtime 协议被 UI 草稿态扩大和污染。

旧方案里会逼出这样的写法：

```ts
const runtime = useKitChatRuntime(conversation, {
  inputValue,
  lastError,
})
```

这个例子里的问题不是 `lastError`，而是为了接 UI 被迫把 `inputValue` 也传进 runtime adapter。现在最新方案已经把这层负担移掉了，`useKitChatRuntime()` 不再接收输入框草稿。

### Q10. 为什么说把 `inputValue` 放进 runtime 会导致 UI 和数据层耦合？

推荐回答：

因为这样 external runtime 或已有 kit runtime 就不只要提供消息和会话状态，还要去感知输入框草稿。也就是说，runtime 协议不再只描述“业务会话状态”，而是被迫感知“输入框本地状态”，边界就变脏了。

### Q11. 为什么要引入内部 `ChatComposer`？

推荐回答：

`ChatComposer` 的作用是把输入框草稿、Prompt 回填、提交禁用、发送成功后清空这些 UI 交互能力统一收口。它不是新的底层模型，而是 `TrChat` 内部最小的输入交互状态，让 `TrSender` 和 footer slot 都有一套稳定的能力来源。

### Q12. `ChatComposer` 是不是过度设计？

推荐回答：

不是，只要把它控制在“内部最小输入交互状态”这个边界内就不算过度设计。它解决的是已经真实出现的问题：输入草稿不应该污染 runtime；但如果现在就把它扩展成完整 public runtime、附件 runtime、事件系统，那才会变成过度设计。

### Q13. `ChatComposer` 现在为什么不公开成 public API？

推荐回答：

因为它现在还主要服务于 `TrChat` 内部装配，它的命名、职责和边界还没有稳定到值得长期承诺。一旦公开，就意味着要承担兼容性和维护成本；目前更合适的做法是先内部验证它的必要性和稳定性，等它真的有独立复用价值时再考虑公开。

### Q14. 那什么时候适合把 `ChatComposer` 公开？

推荐回答：

我建议至少满足四个条件再公开：第一，它不再只是 `TrChat` 内部实现，而是真的有独立复用价值；第二，footer slot 暴露的能力已经不够；第三，它的职责边界已经稳定，不会短期反复改名或拆分；第四，已经有 1 到 2 个真实场景证明公开它比内部化更有价值。

### Q15. `ChatUi` 是什么？

推荐回答：

`ChatUi` 是默认原子组件的展示配置协议。它按组件名作为 key，比如 `ui.sender`、`ui.bubbleList`、`ui.history`，用来配置默认组件的 props，而不是接管数据源。

### Q16. `ChatUi` 和 slots 的区别是什么？

推荐回答：

`ChatUi` 解决的是“默认组件怎么展示”的问题，slots 解决的是“这个布局区域要不要整体换掉”的问题。前者是调默认组件的 props，后者是直接替换区域内容，所以它们的职责完全不同。

例子：

```ts
ui.sender.placeholder = '请输入问题'
```

这是改默认 `TrSender` 的 props。

```vue
<template #footer>
  <CustomSender />
</template>
```

这是把 footer 区整个替换掉。

### Q17. 为什么 `ui.sender` 不能配置 `modelValue / loading / disabled`？

推荐回答：

因为这些字段已经有明确的数据来源了，如果再允许 `ui.sender` 配置，就会出现多数据源冲突。比如 `modelValue` 本来来自 `composer.inputValue`，`loading` 本来来自 `runtime.sender.loading`，如果 `ui.sender` 也能改，就无法确定最终该以谁为准。

冲突例子：

```ts
ui.sender.modelValue = 'A'
composer.inputValue = 'B'
```

这时 `TrSender` 到底应该显示 `A` 还是 `B`？这就是为什么不能开放。

### Q18. 为什么 `ui.history` 不能配置 `data / selected`，`ui.bubbleList` 不能配置 `messages`？

推荐回答：

理由和 `ui.sender` 一样，都是单一数据源原则。`TrHistory.data / selected` 必须由 `runtime.conversations` 提供，`TrBubbleList.messages` 必须由 `runtime.messages.items` 提供，`ui` 只能改展示，不应该改数据源。

### Q19. 为什么 slot 名称按布局区域，而不是按默认组件命名？

推荐回答：

因为 slot 解决的是布局插入点问题，不是组件配置问题。一个区域里未必只有一个默认组件，所以更合理的命名方式是 `header / left-aside / main / footer` 这种布局区域命名，而 `ui` 继续按默认组件名来配置，两者边界更清楚。

### Q20. footer slot 已经能自定义输入区了，为什么还需要内部 `ChatComposer`？

推荐回答：

footer slot 只是暴露自定义入口，它本身不会产生输入状态。内部 `ChatComposer` 的作用，是先把 `inputValue / setInputValue / submitDisabled / send / abort` 这套输入交互能力统一收口，再通过 footer slot props 暴露给外部，所以 slot 是消费这套能力，而不是替代它。

### Q21. 如果 runtime 不管 `inputValue`，自定义 footer slot 时用户怎么拿到输入状态和发送动作？

推荐回答：

用户不需要直接知道内部 `ChatComposer` 类型，而是通过 footer slot props 间接拿到它暴露出来的最小能力。也就是 `inputValue / loading / send / abort / setInputValue` 这些值和动作，已经足够支撑自定义输入区。

例子：

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

### Q22. 为什么 Prompt 回填不放进 `runtime.actions` 里统一处理？

推荐回答：

因为 Prompt 回填本质上只是修改输入框草稿，不会直接改变消息和会话状态。`runtime.actions` 更适合承接真正影响业务生命周期的动作，比如 `send`、`abort`、`switchConversation`；Prompt 回填只是本地输入交互，所以应该放在 `ChatComposer`。

### Q23. `useLocalChatRuntime()` 解决什么问题？

推荐回答：

它解决的是新项目快速接入的问题。用户不需要先有 `useConversation()`，而是直接通过 `useLocalChatRuntime()` 创建官方 kit 路径 runtime，然后接上 `TrChat` 就能跑起来。

### Q24. `useKitChatRuntime()` 解决什么问题？

推荐回答：

它解决的是已有 kit 项目的迁移问题。用户已经有 `useConversation()` 返回值了，只想把旧 UI 换成 `TrChat`，不想重建 transport、storage、plugins 和会话生命周期，这时 `useKitChatRuntime()` 就把已有数据层实例适配成 `ChatRuntime`。

### Q25. 自定义 `ChatRuntime` 解决什么问题？

推荐回答：

它解决的是“用户已有非 kit 数据层，但想接 TinyRobot UI”的问题。用户可以用 AI SDK、Pinia、自研 store 或老系统数据层，自己适配出 `ChatRuntime`，然后直接喂给 `TrChat`。

### Q26. 为什么已有 `useConversation()` 项目更适合走 `useKitChatRuntime()`，而不是 `useLocalChatRuntime()`？

推荐回答：

因为这类项目已经有自己的 `useConversation()` 实例和背后的 transport、storage、plugins 配置了。`useKitChatRuntime()` 的价值就是直接复用这些数据层实例和生命周期能力，只替换 UI；如果走 `useLocalChatRuntime()`，就等于重新创建一套数据层，迁移成本会变高。

### Q27. 迁移已有 kit 项目时，具体复用了什么？

推荐回答：

复用的是已有 `useConversation()` 返回的数据层实例和会话生命周期能力，包括：

- `conversation.conversations`
- `conversation.activeConversationId`
- `activeConversation.engine.messages`
- `activeConversation.engine.requestState`
- `activeConversation.engine.processingState`
- `switchConversation`
- `deleteConversation`
- `updateConversationTitle`
- `abortActiveRequest`
- 背后的 transport、storage、plugins 配置

一句话：

```txt
复用数据层实例和生命周期能力，不复用页面层装配和 UI 绑定方式。
```

### Q28. 迁移已有 kit 项目时，不复用什么？

推荐回答：

不复用的是旧页面结构、旧 UI 装配、旧 sender/history/bubble 的数据绑定方式，以及旧输入框草稿状态管理。换句话说，数据层留下，页面层换成 `TrChat`。

### Q29. `useKitChatRuntime()` 的真正价值是什么？如果没有它会怎样？

推荐回答：

它的本质是“迁移适配器”。它让已有 `useConversation()` 项目可以保留现有数据层，只把结果适配成 `ChatRuntime` 给 `TrChat` 消费；如果没有它，已有 kit 项目就只能重新按新方案重组 runtime，迁移成本和学习成本都会明显升高。

### Q30. external runtime 最小需要适配哪些字段，才能跑起来？

推荐回答：

如果只讲单会话最小闭环，至少要有：

- `messages.items`
- `messages.requestState`
- `messages.processingState`
- `messages.lastError?`
- `sender.disabled`
- `sender.loading`
- `actions.send`
- `actions.abort?`

如果要支持完整默认 `TrChat`，再补：

- `conversations.items`
- `conversations.currentId`
- `actions.createConversation?`
- `actions.switchConversation?`
- `actions.renameConversation?`
- `actions.deleteConversation?`

### Q31. 为什么说 external runtime 不需要适配输入框状态？

推荐回答：

因为 external runtime 只需要适配消息、会话和请求生命周期；输入框草稿、Prompt 回填、提交禁用这些输入交互状态，已经由 `TrChat` 内部 `ChatComposer` 负责了。换句话说，只要 external runtime 符合 `ChatRuntime` 协议，`TrChat` 内部就会自己把 runtime 和 composer 装配到默认 UI 上。

### Q32. “真正解耦”的点是什么？“合理耦合”的点又是什么？

推荐回答：

真正解耦的是 `TrChat` 不直接认识 kit、AI SDK、Pinia 这些具体数据层，而是统一只依赖 `ChatRuntime`。合理耦合的是 `TrSender` 和内部 `ChatComposer` 的关系，因为输入框本来就是 UI 交互域，这种耦合不会反向污染外部 runtime 协议。

### Q33. 如果评审问：“既然内部还有个 `ChatComposer`，那你们是不是根本没做到 UI 和 runtime 解耦？”怎么回答？

推荐回答：

我们做到的是 UI 和外部数据层的解耦，不是把所有 UI 内部状态都消灭掉。`ChatComposer` 只是 `TrChat` 内部为了管理输入交互存在的状态，它不进入 `ChatRuntime` 协议，也不要求 external runtime 感知，所以这属于合理的内部耦合，不影响 runtime 的解耦目标。

### Q34. 为什么不直接让 external runtime 也把 `inputValue` 一起管了？

推荐回答：

不是 external runtime 不能管，而是没必要把它变成协议的一部分。只要把 `inputValue` 放进 runtime 协议，所有 external runtime 都要额外暴露 `inputValue / setInputValue / submitDisabled`，这会扩大协议边界，让所有数据层都被迫感知输入框草稿状态。

### Q35. 这套方案和 assistant-ui 最大的相同点是什么？

推荐回答：

最大的相同点是思想层面的 `UI + runtime` 分层。两者都强调 UI 不直接绑死具体数据层，都区分“官方托管状态”和“外部自有数据层”这两类接入方式。

### Q36. 这套方案和 assistant-ui 最大的不同点是什么？

推荐回答：

assistant-ui 更偏 `primitives + runtime framework`，会把 `ComposerRuntime` 这类能力做成更完整的公开体系；我们更偏基于已有 `components + kit` 的应用装配层，主入口是 `TrChat` 黑盒，不打算在 v1 公开整套白盒 primitives/runtime 体系。另一个很关键的不同点是，我们有 `useKitChatRuntime()`，它专门服务已有 tinyrobot kit 项目迁移 UI，这是本项目特有路径。

### Q37. 为什么 `TrChat` 适合默认场景，但不适合深度定制场景？

推荐回答：

因为 `TrChat` 的价值就在于“约定好的默认 chat 应用结构”，它自带固定装配、默认区域和默认映射。slots 适合轻量替换，但不适合任意重组布局和交互；如果你需要完全不同的页面结构、复杂布局编排、特殊消息区和输入区关系，就应该回到 `components + kit` 这一层。

### Q38. 高度定制是不是就等于从 0 开始？

推荐回答：

不是。更准确地说，高度定制不是从 0 开始，而是从 `TrChat` 往下一层，回到 `components + kit` 自己装配。你复用的仍然是原子组件和 runtime 能力，只是不再使用 `TrChat` 这层默认装配。

### Q39. 为什么不采用“全局 store + 事件队列 + action factory”？

推荐回答：

因为当前 MVP 只需要 `UI event -> runtime.actions` 这一层关系就够了。全局 store、事件队列、action factory 更适合插件系统、DevTools、命令回放、协同这些复杂场景，如果现在放进核心方案，会引入过多概念，超出 MVP 必要边界。

### Q40. 如果用户自己想在 external runtime 内部用 Pinia 或事件队列，可以吗？

推荐回答：

可以。这个设计不是禁止用户在自己的 external runtime 内部使用 Pinia 或事件系统，而是不把这些概念强行放进 `chat` 核心 API。也就是说，external runtime 内部怎么实现是用户自由，`TrChat` 只看最终适配出来的 `ChatRuntime`。

### Q41. 如果别人拿当前 `useExternalRuntime.ts` 质疑“文档和代码对不上”，怎么回答？

推荐回答：

现在这类质疑可以直接用代码回答，因为 demo 已经和文档对齐了。`useExternalRuntime.ts` 里 `sender` 只暴露 `disabled / loading`，`actions` 里也不再有 `setInputValue`，说明输入草稿已经收回到 `TrChat` 内部 `ChatComposer`，external runtime 只负责消息、会话和请求生命周期。

更稳的表述：

```txt
设计和 demo 代码现在是一致的，输入交互归内部 composer，业务状态归 runtime。
```

### Q42. 现在对外最应该强调的核心价值是什么？

推荐回答：

第一，`TrChat` 提供默认完整聊天应用，降低接入门槛。第二，`ChatRuntime` 让 UI 和不同数据层解耦。第三，已有 kit 项目可以通过 `useKitChatRuntime()` 平滑迁移 UI，不需要重建数据层。

## 4. 最后一轮 3 句话版本

### Q43. 请用 3 句话以内，完整介绍这套方案的核心结构和边界。

推荐回答：

这套方案的核心结构是 `TrChat + ChatRuntime + internal ChatComposer + ChatUi + slots`。`ChatRuntime` 负责会话、消息和请求生命周期，`ChatComposer` 负责输入草稿和提交交互，`ChatUi` 负责默认组件展示配置。`TrChat` 对外只依赖 `ChatRuntime`，内部再用 `ChatComposer` 把输入区装配起来。

### Q44. 请用 3 句话以内，解释为什么要把输入框草稿从 `ChatRuntime` 拆到内部 `ChatComposer`。

推荐回答：

输入框草稿只是本地 UI 交互状态，不属于业务会话生命周期。把它放进 `ChatRuntime` 会让已有 kit runtime 和 external runtime 被迫额外感知 `inputValue / setInputValue / submitDisabled`，扩大协议边界。收回到内部 `ChatComposer` 后，runtime 只管业务状态，输入交互由 `TrChat` 自己处理。

### Q45. 请用 3 句话以内，解释 `useLocalChatRuntime`、`useKitChatRuntime`、自定义 `ChatRuntime` 三者分别解决什么问题。

推荐回答：

`useLocalChatRuntime()` 解决新项目快速接入官方 kit 能力的问题。`useKitChatRuntime()` 解决已有 `useConversation()` 项目只迁移 UI、不重建数据层的问题。自定义 `ChatRuntime` 解决 AI SDK、Pinia、自研 store、老系统这些已有数据层只接 TinyRobot UI 的问题。

## 5. 口头总结模板

如果要在评审里快速讲清楚，可以直接用下面这段：

```txt
chat 套件不是新的底层 runtime，而是基于 components + kit 的应用装配层。
它对外提供 TrChat 这个默认完整聊天入口，同时定义 ChatRuntime 作为 UI adapter 协议，让 kit、AI SDK、Pinia、自研 store 都能接进来。
这次方案最关键的修正，是把 sender 输入草稿从 ChatRuntime 拆出来，收回到 TrChat 内部 ChatComposer，这样 runtime 只管会话、消息和请求生命周期，输入交互由 UI 内部处理，已有 kit 项目迁移时也不需要额外传输入框状态。
```

## 6. 配套文档

- [architecture.md](./architecture.md)
- [mvp-plan.md](./mvp-plan.md)
