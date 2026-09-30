---
outline: [1, 4]
---

# useMessage 消息数据管理

## 概览

`useMessage` 是管理单个 AI 消息流的 Vue Composable。它持有消息和请求状态，调用应用提供的 `responseProvider`，消费完整或流式响应，并通过插件扩展请求、消息与工具调用生命周期。

### 适用场景

- 管理单个对话中的消息发送、流式合并、错误和取消状态；
- 将自定义后端或 OpenAI 兼容响应适配到 TinyRobot 消息组件；
- 使用插件注入请求参数、处理响应块或执行工具调用；
- 需要把消息状态与 `tr-bubble-list`、`tr-sender` 等界面组件自由组合。

`useMessage` 不负责持久化多个会话。需要创建、切换和恢复会话时，使用 [`useConversation`](./conversation)，由它为每个会话管理一个 `useMessage` 引擎。

## 用法示例

### 发送并接收流式消息

提供 `responseProvider`，再把 `messages`、`isProcessing`、`sendMessage` 和 `abortRequest` 连接到消息列表与输入组件，即可形成完整交互。示例使用本地 AsyncGenerator 返回固定内容，不依赖真实服务。

<demo
  vue="../../demos/tools/message/MockStream.vue"
  :vueFiles="['../../demos/tools/message/MockStream.ts', '../../demos/tools/message/MockStream.vue']"
  title="基础流式消息"
  description="使用本地模拟响应展示发送、增量更新和取消。"
/>

同一时刻只能运行一个用户回合。界面应使用 `canStartTurn` 或 `isProcessing` 控制重复提交；`sendMessage` 本身也会在当前回合不能开始时直接短路。

### 接入响应服务

`responseProvider` 可以返回单个结果，也可以返回 AsyncGenerator。TinyRobot 负责消费响应和更新消息，但请求 URL、鉴权、协议映射、服务端密钥和 HTTP 错误仍由应用负责。

#### SSE 流式响应

下面的集成示例请求文档站的 `/api/chat/completions`，并使用 `sseStreamToGenerator` 把 SSE `Response` 转成 AsyncGenerator。接入自己的服务时，应在服务端保存密钥，并把非 OpenAI 兼容数据映射为 `ChatCompletion`。

<demo
  vue="../../demos/tools/message/Basic.vue"
  :vueFiles="['../../demos/tools/message/Basic.ts', '../../demos/tools/message/Basic.vue']"
  title="接入 SSE 服务"
  description="通过站点 API 获取流式响应；部署时需要提供对应的服务端接口。"
/>

#### 非流式响应

返回 `Promise<ChatCompletion>` 时，`useMessage` 会一次性合并完整响应，适合不支持 SSE 的后端。

<demo
  vue="../../demos/tools/message/NonStreaming.vue"
  :vueFiles="['../../demos/tools/message/NonStreaming.ts', '../../demos/tools/message/NonStreaming.vue']"
  title="非流式响应"
  description="等待完整响应后一次性更新助手消息。"
/>

### 呈现请求状态

`requestState` 描述整个回合，`processingState` 细分正在请求还是正在合并响应。界面可以用这些状态显示进度、禁用输入并提供取消操作。

<demo
  vue="../../demos/tools/message/RequestState.vue"
  :vueFiles="['../../demos/tools/message/RequestState.ts', '../../demos/tools/message/RequestState.vue']"
  title="请求状态"
  description="观察请求、响应合并、完成和取消阶段。"
/>

### 处理错误

`responseProvider` 或生命周期钩子抛错时，当前回合进入 `error`，调用 `sendMessage` / `send` 得到的 Promise 会拒绝。插件的 `onError` 可以追加可见错误消息，但不会吞掉原始错误；调用方仍应按需捕获。

<demo
  vue="../../demos/tools/message/ErrorHandling.vue"
  :vueFiles="['../../demos/tools/message/ErrorHandling.ts', '../../demos/tools/message/ErrorHandling.vue']"
  title="错误处理"
  description="通过 onError 把请求失败转成对话内可见反馈。"
/>

### 调整请求与响应

#### 修改请求参数

`onBeforeRequest` 在消息清洗和请求发送前运行，可以注入 system 消息、模型参数或工具定义。修改只影响当次 `requestBody`；示例把结果显示在页面内，便于验证。

<demo
  vue="../../demos/tools/message/OnBeforeRequest.vue"
  :vueFiles="['../../demos/tools/message/OnBeforeRequest.ts', '../../demos/tools/message/OnBeforeRequest.vue']"
  title="修改请求参数"
  description="在请求前注入额外消息与参数。"
/>

#### 自定义响应块处理

顶层 `onCompletionChunk` 会取代默认合并入口。需要保留默认消息合并时，必须调用 `runDefault()`；插件中的同名钩子则在顶层处理之后继续运行。

<demo
  vue="../../demos/tools/message/CustomChunk.vue"
  :vueFiles="['../../demos/tools/message/CustomChunk.ts', '../../demos/tools/message/CustomChunk.vue']"
  title="自定义响应块处理"
  description="统计响应块，并继续执行默认消息合并。"
/>

### 执行工具调用

`toolPlugin` 把工具 schema 写入请求，在模型返回 `tool_calls` 后执行工具、追加 tool 消息并继续请求。工具执行、审批、权限和副作用由应用负责；`useMessage` 只协调回合状态和消息链。

<demo
  vue="../../demos/tools/message/ToolCall.vue"
  :vueFiles="['../../demos/tools/message/ToolCall.ts', '../../demos/tools/message/ToolCall.vue']"
  title="工具调用"
  description="使用本地模拟工具完成声明、执行和结果回传。"
/>

## API

`useMessage`、插件和 Types 小节列出的类型均从 `@opentiny/tiny-robot-kit` 导入。

```typescript
const message = useMessage(options: UseMessageOptions): UseMessageReturn
```

### 配置

| 配置项                        | 类型                            | 必填 | 默认值                             | 说明                                                                                                    |
| ----------------------------- | ------------------------------- | ---- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `responseProvider`            | `ResponseProvider`              | 是   | —                                  | 接收清洗后的请求体与 `AbortSignal`，返回完整或流式响应。初始化后也可通过返回对象中的同名 Ref 动态替换。 |
| `initialMessages`             | `ChatMessage[]`                 | 否   | `[]`                               | 创建引擎时读取并转为响应式消息；后续替换原数组不会同步。                                                |
| `requestMessageFields`        | `string[]`                      | 否   | `[]`（保留所有字段）               | 请求消息字段白名单。非空时先选择这些字段。                                                              |
| `requestMessageFieldsExclude` | `string[]`                      | 否   | `['state', 'metadata', 'loading']` | 在白名单处理后排除字段，避免把界面状态发给模型。                                                        |
| `plugins`                     | `UseMessagePlugin[]`            | 否   | `[]`                               | 在默认插件之后安装的插件。配置只在初始化时读取；同名插件以后者覆盖前者。                                |
| `onCompletionChunk`           | `(context, runDefault) => void` | 否   | —                                  | 顶层响应块处理入口；提供后不会自动执行默认合并。                                                        |

#### ResponseProvider

```typescript
type ResponseProvider<T = ChatCompletion> = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => Promise<T> | AsyncGenerator<T> | Promise<AsyncGenerator<T>>
```

每次请求都会创建新的 `AbortSignal`。Provider 应把它传给 `fetch` 或自己的异步任务，并在取消后停止继续产出响应块。返回结果需要符合 `ChatCompletion` 的完整响应或流式 chunk 结构；每个 chunk 从 `choices` 中按 `index === 0` 优先选择内容。

### 状态

| 返回字段           | 类型                                         | 写入方      | 说明                                                                                                       |
| ------------------ | -------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `messages`         | `Ref<ChatMessage[]>`                         | 引擎 / 应用 | 当前消息列表。引擎追加用户、助手和工具消息；应用可以用于初始化后的界面调整，但应避免在请求中重排当前回合。 |
| `requestState`     | `Ref<RequestState>`                          | 引擎        | 当前回合状态。                                                                                             |
| `processingState`  | `Ref<RequestProcessingState \| undefined>`   | 引擎        | 仅在 `requestState === 'processing'` 时有值。                                                              |
| `responseProvider` | `Ref<UseMessageOptions['responseProvider']>` | 应用        | 修改 `.value` 后，后续请求使用新的 Provider；正在执行的请求仍使用回合开始时的 Provider。                   |

### 派生状态

| 返回字段       | 类型                   | 说明                                                       |
| -------------- | ---------------------- | ---------------------------------------------------------- |
| `isProcessing` | `ComputedRef<boolean>` | 当前是否正在请求或合并响应；暂停等待外部确认时为 `false`。 |
| `isPaused`     | `ComputedRef<boolean>` | 当前回合是否暂停。                                         |
| `canStartTurn` | `ComputedRef<boolean>` | 是否允许开始新回合。处理或暂停期间为 `false`。             |

### 动作

| 动作              | 签名                                                              | 短路、错误与副作用                                                                                                       |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `sendMessage`     | `(content: string) => Promise<void>`                              | 去除首尾空白后追加一条 user 消息并运行回合。空文本或 `canStartTurn === false` 时警告并直接完成；请求错误会拒绝 Promise。 |
| `send`            | `(...messages: ChatMessage[]) => Promise<void>`                   | 原样追加一组消息并运行回合。当前不能开始回合时警告并直接完成；请求错误会拒绝 Promise。                                   |
| `abortRequest`    | `() => Promise<void>`                                             | 取消正在处理的 Provider 并等待回合离开 processing；暂停时执行插件清理并转为 aborted；没有活动回合时直接完成。            |
| `dispatchCommand` | `<Result>(command: string, payload?: unknown) => Promise<Result>` | 调用注册该命令的插件。未知、禁用或当前状态不允许的命令会拒绝 Promise；命令可以追加消息、恢复暂停回合或请求下一轮。       |

### 请求状态

| `requestState` | 含义                                     | 可开始新回合 |
| -------------- | ---------------------------------------- | ------------ |
| `idle`         | 引擎刚创建，尚未运行回合。               | 是           |
| `processing`   | 正在执行钩子、请求 Provider 或合并响应。 | 否           |
| `paused`       | 当前回合等待工具确认或其他外部恢复。     | 否           |
| `completed`    | 当前回合正常结束。                       | 是           |
| `aborted`      | 当前回合已取消。                         | 是           |
| `error`        | Provider 或生命周期抛错。                | 是           |

`processingState` 的内置值包括：

- `requesting`：准备请求、等待首个有效响应块或发起后续请求；
- `completing`：已经收到响应块并正在合并；
- `pausing`：插件正在把当前回合转换为暂停状态；
- 插件也可以通过 `setRequestState` 使用自定义字符串。

### 插件

默认安装 `thinkingPlugin()` 和 `lengthPlugin()`。传入同名插件可以覆盖默认实例，例如使用 `thinkingPlugin({ disabled: true })` 禁用思考状态处理。`toolPlugin` 不会默认安装。

#### 生命周期

| 钩子                           | 时机与执行规则                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `onInit`                       | 引擎创建时同步执行；必须通过初始化上下文的 setter 修改状态，不能返回 Promise 或其他值。   |
| `onTurnStart`                  | 新用户回合开始后、首个请求前，按插件顺序等待执行。恢复暂停回合时不重复调用。              |
| `onBeforeRequest`              | 每次请求发送前按插件顺序等待执行，包括插件触发的后续请求。                                |
| `onCompletionChunk`            | 顶层响应块处理完成后同步调用；是否已经执行默认合并取决于顶层处理是否调用 `runDefault()`。 |
| `onAfterRequest`               | 一次 Provider 响应消费完成后并行执行；可以追加消息或请求下一轮。                          |
| `onTurnPause` / `onTurnResume` | 回合进入暂停状态后 / 从暂停状态恢复请求前，按插件顺序等待执行。                           |
| `onTurnAbort`                  | 处理或暂停回合被外部取消时按插件顺序等待执行。                                            |
| `onTurnEnd`                    | 回合正常完成后按插件顺序等待执行。取消回合不调用。                                        |
| `onError`                      | 回合出错后按插件顺序等待执行；钩子错误会记录但不替换原始错误。                            |
| `onFinally`                    | 每次回合结束时同步执行；钩子错误只记录。                                                  |
| `commands`                     | 注册供 `dispatchCommand` 调用的命令。命令名全局重复会在初始化时抛错。                     |

`BasePluginContext` 提供当前消息、回合 ID、请求状态、`AbortSignal`、插件列表和 `customContext`。`customContext` 只在当前回合内共享；新回合会重置，暂停与恢复期间保留。

#### lengthPlugin

模型以 `finish_reason: 'length'` 结束时，`lengthPlugin` 追加一条 user 消息并自动请求下一段。它默认启用。

| 配置项            | 类型     | 默认值                                         | 说明                             |
| ----------------- | -------- | ---------------------------------------------- | -------------------------------- |
| `continueContent` | `string` | `'Please continue with your previous answer.'` | 自动续写时追加的 user 消息内容。 |

#### thinkingPlugin

`thinkingPlugin` 根据 `reasoning_content` 更新助手消息的 `state.thinking` 和 `state.open`。收到思考内容时展开，普通内容或回合结束时收起。它默认启用，其他配置来自通用插件字段。

#### skillPlugin

`skillPlugin` 根据应用选择的 Skill 生成当前请求的 instructions，并可向 `toolPlugin` 提供 Skill 资源工具。它不会默认安装，也不会自行决定 instructions 在具体 Provider 请求中的承载位置。选择模式、响应式配置和资源工具的完整说明见 [Skill](./skill#vue-skillplugin)。

#### toolPlugin

`toolPlugin` 需要显式传入 `plugins`。`getTools` 提供工具 schema，`callTool` 执行没有本地 handler 的 function tool；`skillPlugin` 也可以向同一轮请求贡献 Skill 资源工具。

| 配置项                            | 类型                                                                              | 必填 | 默认值                               | 说明                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------- | ---- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `getTools`                        | `(context) => MaybePromise<ToolProviderItem[]>`                                   | 是   | —                                    | 返回当前请求可用的 OpenAI tool schema 或带本地 handler 的 runtime tool。                   |
| `callTool`                        | `(toolCall, context) => MaybeStreamableResult<string \| Record<string, unknown>>` | 是   | —                                    | 执行普通 function tool。结果写入对应 tool 消息；上下文包含 `toolMessage` 和 `toolSource`。 |
| `beforeCallTools`                 | `(toolCalls, context) => Promise<void>`                                           | 否   | —                                    | 执行一批工具前进行校验、鉴权或遥测。                                                       |
| `shouldPauseToolCall`             | `(toolCall, context) => boolean \| Promise<boolean>`                              | 否   | —                                    | 返回 `true` 时仅暂停当前工具并等待外部确认，同批其他工具仍可继续。                         |
| `maxToolRounds`                   | `number`                                                                          | 否   | 不限制                               | 单个用户回合允许的工具调用批次数；必须为非负整数，`0` 表示不执行工具。                     |
| `onLimitExceeded`                 | `(toolCalls, context) => MaybePromise<void>`                                      | 否   | —                                    | 下一批超过轮次上限时调用；不能放行超限工具。                                               |
| `onToolCallStart`                 | `(toolCall, context) => void`                                                     | 否   | —                                    | tool 消息已追加、实际执行前调用。                                                          |
| `onToolCallEnd`                   | `(toolCall, context) => void`                                                     | 否   | —                                    | 工具以 `success`、`failed`、`cancelled` 或 `denied` 结束时调用。                           |
| `toolCallAwaitingApprovalContent` | `string`                                                                          | 否   | `'Tool call awaiting confirmation.'` | 等待确认时写入 tool 消息的内容。                                                           |
| `toolCallCancelledContent`        | `string`                                                                          | 否   | `'Tool call cancelled.'`             | 取消或补齐缺失 tool 消息时使用的内容。                                                     |
| `toolCallFailedContent`           | `string`                                                                          | 否   | `'Tool call failed.'`                | 执行失败或拒绝时使用的内容。                                                               |
| `persistPausedTurn`               | `boolean`                                                                         | 否   | `true`                               | 是否把暂停回合快照写入浏览器 LocalStorage，以便重建引擎后恢复。                            |
| `autoFillMissingToolMessages`     | `boolean`                                                                         | 否   | `false`                              | 下一轮请求前是否为历史中缺失的 tool 结果补充取消消息。                                     |

工具审批通过插件命令完成：

```typescript
await message.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'call-123' })
await message.dispatchCommand(TOOL_REJECT_COMMAND, {
  toolCallId: 'call-456',
  reason: '用户拒绝执行该工具',
})
```

两个命令每次只处理一个 `toolCallId`，并返回 `ToolCallCommandResult`。恢复会执行该工具并继续回合；拒绝会把状态标记为 `denied`，但不会直接中止整个回合。

一个工具调用轮次是一条包含一个或多个 `tool_calls` 的 assistant 响应。同一响应中的多个调用只计一轮。下一批超过 `maxToolRounds` 时，该批工具不会执行；插件补充取消结果后发起不允许再次调用工具的关闭请求。

### Types

| 类型名                                                  | 类别 / 用途 | 说明                                                  |
| ------------------------------------------------------- | ----------- | ----------------------------------------------------- |
| `UseMessageOptions`                                     | 配置        | `useMessage` 初始化配置。                             |
| `UseMessageReturn`                                      | 返回值      | 响应式状态、派生状态和动作。                          |
| `ResponseProvider<T>`                                   | 回调        | 完整或流式响应提供者。                                |
| `MessageRequestBody`                                    | 请求模型    | 至少包含 `messages`，并允许 Provider 所需的其他字段。 |
| `ChatMessage`                                           | 数据模型    | 消息对象；包含角色、内容、元数据和可选工具字段。      |
| `ChatCompletion` / `CompletionChoice`                   | 响应模型    | Provider 返回的完整或增量响应结构。                   |
| `RequestState` / `RequestProcessingState`               | 状态        | 回合状态和处理子状态。                                |
| `UseMessagePlugin`                                      | 扩展接口    | Vue 消息引擎插件及生命周期。                          |
| `UseMessagePluginCommandHandler`                        | 扩展接口    | 插件命令处理函数。                                    |
| `BasePluginContext`                                     | 插件上下文  | 插件读取状态、共享回合数据和响应取消信号的上下文。    |
| `UseMessagePluginInitContext`                           | 插件上下文  | `onInit` 专用的同步初始化上下文。                     |
| `UseMessageErrorContext`                                | 插件上下文  | `onError` 上下文，额外提供错误和追加消息动作。        |
| `UseMessageToolActionContext`                           | 工具上下文  | 批量工具执行前的上下文，包含 assistant 消息。         |
| `UseMessageCallToolContext`                             | 工具上下文  | `callTool` 上下文，额外包含 tool 消息和工具来源。     |
| `UseMessageToolLimitExceededContext`                    | 工具上下文  | 工具轮次超限上下文。                                  |
| `UseMessageToolCallContext`                             | 工具上下文  | 单个工具开始、结束与暂停判断的上下文。                |
| `ToolCallCommandPayload` / `ToolCallCommandResult`      | 命令        | 工具确认和拒绝命令的参数与结果。                      |
| `UseMessageSkillPluginOptions`                          | Skill 配置  | Vue `skillPlugin` 的响应式配置。                      |
| `SkillRequestContext` / `SkillSelection`                | Skill 状态  | 当前请求的 Skill 解析结果和选择模式。                 |
| `Tool` / `ToolCall`                                     | 工具模型    | 请求工具定义和消息中的工具调用结构。                  |
| `Choice` / `DeltaChoice` / `Usage`                      | 响应模型    | 完整选择、增量选择和 token 使用量。                   |
| `AsyncStreamableResult<T>` / `MaybeStreamableResult<T>` | 工具类型    | 描述 Promise、AsyncGenerator 和同步工具结果。         |

`toolPlugin` 的工具项与工具来源当前没有从包根导出独立的命名类型；调用 `toolPlugin` 时应依靠参数推断。插件只为 function tool 建立名称去重、来源记录和 runtime handler 路由。OpenAI `custom` tool 可以保留在请求体中，但不会进入这套本地执行流程。

## 迁移与弃用

本页描述当前公开 API。仍在使用 `client`、`messageState` 或旧事件入口的项目，可参考 [useMessage 迁移](../migration/use-message-migration) 进入以 `responseProvider`、请求状态和插件为核心的当前架构；迁移后请以本页 API 为准。
