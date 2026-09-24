---
outline: [1, 3]
---

# Chat 运行时

Chat Runtime 统一会话、消息发送、模型和 MCP 状态，并可适配为 `TrChatUI` 需要的数据与动作。

## 概览

### 适用场景

| 任务              | 入口                             | 界面连接   | 状态与默认能力                                                          |
| ----------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------- |
| 创建完整 Runtime  | `useChatRuntime`                 | `TrChat`   | 创建 Kit 会话，安装错误、请求快照及可选模型和 MCP 插件。                |
| 复用已有 Kit 会话 | `useChatRuntimeFromConversation` | `TrChat`   | 保留应用持有的 conversation 与插件，只建立 Runtime 状态和动作。         |
| 适配自定义界面    | `useChatRuntimeAdapter`          | `TrChatUI` | 把 Runtime 状态转为界面数据，并管理草稿失效与模型、MCP 的临时交互状态。 |

`TrChat` 内部已使用 `useChatRuntimeAdapter`。直接使用 `TrChatUI` 时，应用需要把适配器动作连接到对应的界面事件；完整事件见 [TrChatUI API](./chat#trchatui-api)。

## 快速开始

创建 `useChatRuntime` 并传给 `TrChat`。

<demo
  vue="../../demos/chat/basic.vue"
  :vueFiles="[
    '../../demos/chat/basic.vue',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="创建运行时"
  description="配置模型服务后创建 Runtime，发送消息并获得回答。"
/>

## Runtime 场景与配置

### 模型服务

`modelProviders` 支持 `openai`、`deepseek` 和 `qwen`。同一份配置内的模型 ID 必须唯一；至少解析出一个模型时，第一个模型为初始选择。

```ts
import { useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: '团队模型',
    apiUrl: '/api/model',
    headers: { 'X-Client-Name': 'my-chat' },
    timeout: 60_000,
    models: [
      {
        id: 'qwen-plus',
        label: '通义千问',
        capabilities: { thinking: true, search: true },
      },
    ],
  },
]

const runtime = useChatRuntime({ modelProviders })
```

| 字段                               | 说明                                          |
| ---------------------------------- | --------------------------------------------- |
| `apiUrl`                           | 服务根地址或完整 `/chat/completions` 地址。   |
| `apiKey`                           | 默认 Bearer 认证；生产环境不要放入浏览器。    |
| `headers`                          | 额外请求头；`Authorization` 优先于 `apiKey`。 |
| `timeout`                          | 连接和流读取超时，单位为毫秒。                |
| `models[].capabilities`            | 控制 `thinking`、`search` 控件是否可用。      |
| `models[].featureBody` / `efforts` | 覆盖能力请求体或 reasoning effort 选项。      |

`useChatRuntime` 的响应层二选一：让 `modelProviders` 至少解析出一个模型，或在 `conversation.useMessageOptions.responseProvider` 中提供自定义 Provider。只要 `modelProviders` 外层数组非空，它就不能与自定义 Provider 同时配置，即使其中的 `models` 全为空数组。

### 复用已有 Kit 会话

已有 Kit `useConversation` 时使用 `useChatRuntimeFromConversation`。它只适配已有会话、消息和请求状态，不会修改该会话的插件配置，也不会自动安装错误状态插件。

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'
import { useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: { responseProvider: myResponseProvider },
})

const runtime = useChatRuntimeFromConversation({ conversation })
```

将 Runtime 直接传给 `TrChat` 可以使用完整聊天页面。`TrChatUI` 本身不接收 `runtime`，自定义界面需要通过适配器连接状态和事件。

`clearActiveConversation()` 仅把当前会话设为 `null`，不会删除会话或中止请求。默认发送流程会在首条非空消息发送时创建会话；需要取消后开始新会话时，先调用 `abort()`，再调用 `clearActiveConversation()`。

### Runtime 与自定义界面

`useChatRuntimeAdapter` 读取 Runtime 并返回 `TrChatUI` 需要的数据、草稿和标准动作。适配器在会话导航或 Runtime 更换时使草稿失效，并管理模型和 MCP 操作的临时 UI 状态。Runtime 及其会话、持久化与动作副作用仍由应用持有；适配器只调用这些动作，不会替换它们。

<demo
  vue="../../demos/chat/runtime-adapter.vue"
  :vueFiles="['../../demos/chat/runtime-adapter.vue']"
  title="Runtime 适配自定义界面"
  description="将 Runtime 状态转换为 TrChatUI 数据，并连接输入、发送和会话动作。"
/>

### 发送拦截与自定义发送

默认 Runtime 拒绝 trim 后为空的文本。传入自定义 `send` 后，空文本会以 `{ text: '' }` 进入回调，由应用处理附件、会话创建、消息写入和请求。

<demo
  vue="../../demos/chat/runtime-send.vue"
  :vueFiles="['../../demos/chat/runtime-send.vue']"
  title="自定义发送"
  description="比较默认发送与自定义 send 对空文本的处理结果。"
/>

`beforeSend` 在生成本轮 `ChatRunConfig` 后执行：

| 返回值       | 结果                                            |
| ------------ | ----------------------------------------------- |
| `'continue'` | 继续默认发送。                                  |
| `'handled'`  | 应用已处理，不创建消息，也不调用自定义 `send`。 |
| `'reject'`   | 阻止发送并保留草稿。                            |

发送被禁用、已启用 MCP 工具未准备好或 `beforeSend` 返回 `'reject'` 时，`actions.send()` 返回 `false`。请求错误和校验异常会 reject 原始错误。

### 消息错误持久化

`useChatRuntime` 创建 conversation 时会默认安装 `errorStatePlugin()`。Provider 失败后，插件把规范化错误写入当前回合最后一条 assistant 消息的 `state.error`；如果该回合没有 assistant 消息，它会追加一条内容为空且携带 `state.error` 的 assistant 消息。错误与消息一起由 conversation 持久化。Engine 发请求时仍按默认规则排除 `state`、`metadata` 和 `loading`，所以这些界面状态不会发送给模型。

<demo
  vue="../../demos/chat/runtime-error.vue"
  :vueFiles="['../../demos/chat/runtime-error.vue']"
  title="本地 Runtime 错误状态"
  description="触发确定性请求失败，观察错误归属、Promise 传播和后续成功发送。"
/>

`useChatRuntimeFromConversation` 不安装插件。适配已有 conversation 时，需要在创建 conversation 的位置显式加入：

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'
import { errorStatePlugin, useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: {
    responseProvider,
    plugins: [errorStatePlugin()],
  },
})

const runtime = useChatRuntimeFromConversation({ conversation })
```

常用配置：

```ts
import { ERROR_STATE_PLUGIN_NAME, errorStatePlugin, type ChatErrorPluginContext } from '@opentiny/tiny-robot-chat'
import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'

// 禁用 useChatRuntime 的默认错误写入。
const disabled = errorStatePlugin({ disabled: true })

// 返回 null 或 undefined 时，本次不写 message.state.error。
const normalized = errorStatePlugin({
  normalizeError(error, _context) {
    return error instanceof Error ? { message: error.message } : null
  },
})

// 同名用户插件会替换默认 Runtime 的内置插件。
const replacement: UseMessagePlugin = {
  name: ERROR_STATE_PLUGIN_NAME,
  onError(context: ChatErrorPluginContext) {
    // 记录、规范化或写入应用需要的消息状态。
  },
}
```

`normalizeError` 返回 `null` 或 `undefined` 时，插件跳过本次写入。`onError` 完成后，原始请求 Promise 仍会 reject：直接调用 Runtime 动作时，调用方收到该 rejection；`useChatRuntimeAdapter` 则捕获动作错误并调用必填的 `onActionError`。`TrChat` 使用同一适配器发出 `runtime-action-error`，该事件适合遥测或非消息动作反馈，不应再复制一份 send 错误详情到页面顶部。

### MCP 与安全边界

`mcpServers` 与 `mcp` 互斥。前者适用于浏览器可访问的 Streamable HTTP 服务，后者用于自定义 transport、OAuth、权限过滤或连接复用。

```ts
const runtime = useChatRuntime({
  modelProviders,
  mcpServers: [
    {
      id: 'project-tools',
      name: '项目工具',
      baseUrl: '/api/mcp/project-tools',
      installed: false,
      timeout: 30_000,
    },
  ],
})
```

`installed` 表示已安装，`enabled` 表示允许该 Server 的已启用工具进入后续请求。已启用 Server 的工具仍在加载时会阻止发送。每次发送都会生成模型、能力、reasoning 和 MCP 的 `ChatRunConfig` 快照。

生产环境使用 BFF 处理凭证、OAuth、权限、审计、限流和 CORS：

```text
Browser -> /api/mcp/project-tools -> MCP Server
```

Chat 没有稳定的附件传输协议。自定义 `send` 可收到空文本和 `structuredData`，但附件数据应由应用的 Sender、插槽或状态自行传递。

## API

### 公开函数

| 导出                             | 签名                                                                                                         | 任务                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `useChatRuntime`                 | `useChatRuntime(options: UseChatRuntimeOptions): ChatRuntime`                                                | 创建 Kit 会话与带默认插件的 Runtime。             |
| `useChatRuntimeFromConversation` | `useChatRuntimeFromConversation(options: UseChatRuntimeFromConversationOptions): ChatRuntime`                | 把应用持有的 Kit 会话适配为 Runtime。             |
| `useChatRuntimeAdapter`          | `useChatRuntimeAdapter(options: UseChatRuntimeAdapterOptions): /* 源码推断的普通返回对象 */`                 | 把 Runtime 转为 `TrChatUI` 数据、草稿和界面动作。 |
| `useChatHistoryItems`            | `useChatHistoryItems(options: UseChatHistoryItemsOptions): Readonly<ShallowRef<readonly ChatHistoryItem[]>>` | 规范化平铺会话列表。                              |
| `useChatHistoryData`             | `useChatHistoryData(options: UseChatHistoryDataOptions): Readonly<ShallowRef<ChatHistoryDisplayData>>`       | 规范化平铺或分组历史数据。                        |
| `errorStatePlugin`               | `errorStatePlugin(options?: ErrorStatePluginOptions): UseMessagePlugin`                                      | 把请求错误写入所属 assistant 消息。               |

`useChatRuntimeAdapter` 没有公开的命名返回类型；其实际返回字段见“Runtime 界面适配器”。

### `useChatRuntime` 配置

| 字段             | 类型                                                                                                     | 必填 / 默认值                       | 行为                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `conversation`   | `Omit<UseConversationOptions, 'useMessageOptions'> & { useMessageOptions?: Partial<UseMessageOptions> }` | 否；`{}`                            | 创建内部 Kit 会话。`autoSaveMessages` 默认为 `true`，显式传入可覆盖。`useMessageOptions` 与内建值浅合并；内建插件排在用户插件之前。 |
| `titleGenerator` | `(text: string) => string`                                                                               | 否；取 trim 后前 20 个 Unicode 字符 | 生成首次默认发送时的会话标题；结果为空时默认标题为 `新对话`。                                                                       |
| `beforeSend`     | `ChatBeforeSend`                                                                                         | 否                                  | 创建本轮 `ChatRunConfig` 快照后执行的异步门禁。                                                                                     |
| `composer`       | `Pick<ChatComposerRuntime, 'disabled' \| 'submitDisabled'>`                                              | 否；`{}`                            | 只接收外部 `disabled` 和 `submitDisabled` 可读值；模型和 MCP Runtime 分别由下列配置提供。                                           |
| `modelProviders` | `readonly ChatProviderConfig[]`                                                                          | 否                                  | 至少解析出一个模型时创建内建模型 Runtime 与 Provider；否则不提供响应层。                                                            |
| `mcp`            | `UseChatRuntimeMcpAdapter`                                                                               | 否                                  | 使用应用提供的 MCP Runtime、工具列表和工具调用函数；与 `mcpServers` 互斥。                                                          |
| `mcpServers`     | `ChatMcpServers`                                                                                         | 否                                  | 为配置的 Server 创建内建 Streamable HTTP 适配器；与 `mcp` 互斥。                                                                    |

非空 `modelProviders` 外层数组与 `conversation.useMessageOptions.responseProvider` 同时存在时会抛错。空数组或所有 `models` 都为空数组时不会创建响应层；前者可以改用自定义 `responseProvider`，后者会因非空外层数组的冲突检查而不能同时配置自定义 Provider。

### `useChatRuntimeFromConversation` 配置

| 字段             | 类型                                                                                                                  | 必填 / 默认值                | 行为                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `conversation`   | `UseConversationReturn`                                                                                               | 是                           | 应用继续持有会话、插件、存储和请求引擎；Runtime 只读取并调用它。                                                                        |
| `titleGenerator` | `(text: string) => string`                                                                                            | 否；与 `useChatRuntime` 相同 | 为默认发送新建的会话生成标题。                                                                                                          |
| `beforeSend`     | `ChatBeforeSend`                                                                                                      | 否                           | 收到复制后的 payload、选中模型、MCP 状态和 `ChatRunConfig` 快照，可继续、接管或拒绝发送。                                               |
| `send`           | `(payload: ChatSendPayload & { conversationId: string \| null; runConfig?: ChatRunConfig }) => void \| Promise<void>` | 否                           | 收到 trim 后的 `text`、执行钩子前的 `conversationId` 和快照。传入后，应用负责创建会话、持久化消息和执行请求。                           |
| `composer`       | `ChatComposerRuntime`                                                                                                 | 否；`{}`                     | 作为 Composer 状态和动作来源。默认发送时，`submitDisabled` 还会合并无可用模型、MCP 未准备好和活动回合 `canStartTurn === false` 的结果。 |

### `send()` 状态转换

`runtime.actions.send(payload)` 按以下顺序执行：

1. 对 `payload.text` 执行 trim。
2. Composer 已禁用、提交已禁用，或默认发送收到空文本时返回 `false`。自定义 `send` 可以接收空文本。
3. 快照当前会话 ID 以及模型、能力、reasoning 和 MCP 运行配置。
4. 调用 `beforeSend`。
5. 钩子返回 `'reject'` 时返回 `false`。
6. 钩子返回 `'handled'` 时返回 `true`，不创建会话、写入消息或调用自定义 `send`。
7. 其他结果下，钩子执行期间当前会话发生变化时返回 `false`。
8. 仅默认发送会在首条可用消息前创建会话；自定义 `send` 不会代为创建。
9. 调用自定义 `send`，或向活动会话的引擎发送默认用户消息。
10. 完成后 resolve `true`；动作抛错或请求失败时 reject 原始错误。

### 错误状态插件

| 导出                      | 类型或签名                                                                                                                   | 说明                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `ERROR_STATE_PLUGIN_NAME` | `'error-state'`                                                                                                              | 默认插件名；同名用户插件可替换默认 Runtime 的内置实现。          |
| `ErrorStatePluginOptions` | `{ disabled?: UseMessagePlugin['disabled']; normalizeError?: (error: unknown, context: ChatErrorPluginContext) => unknown }` | 控制启用状态和写入 `state.error` 前的规范化。                    |
| `ChatErrorPluginContext`  | `Parameters<NonNullable<UseMessagePlugin['onError']>>[0]`                                                                    | `normalizeError` 与自定义错误插件可使用的完整 `onError` 上下文。 |

`normalizeError` 可返回任意值。默认实现把原生 `Error` 转为 `{ name, message, code? }`，把其他值转为 `{ message: String(error) }`；`null` 或 `undefined` 表示跳过本次写入。插件优先更新当前回合最后一条 assistant 消息；没有 assistant 消息时追加一条内容为空且携带 `state.error` 的消息。插件完成后，原始请求 Promise 仍会 reject。

### Runtime 协议

`ChatReadable<T>` 为只读 `{ readonly value: T }`，当前 `ChatRuntime` 状态使用该结构协议。公开的 `ChatWritable<T>` 是可写 `{ value: T }` 结构，可供兼容适配层使用，但 Runtime 不再通过它暴露请求错误。

#### Runtime 状态

| 字段                             | 类型                                            | 所有权与更新方式                                                                   |
| -------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `conversations`                  | `ChatReadable<readonly ChatConversationInfo[]>` | Runtime 所连会话源维护的只读列表。                                                 |
| `activeConversation`             | `ChatReadable<ChatConversation \| null>`        | 会话源更新的当前会话、消息和请求状态；未选中会话时为 `null`。                      |
| `conversationNavigationRevision` | `ChatReadable<number> \| undefined`             | 可选导航修订号。建立、清空、切换或删除导致活动会话变化时递增，供适配器使草稿失效。 |
| `composer`                       | `ChatComposerRuntime`                           | 组合外部禁用状态以及可选模型、MCP Runtime；字段均为结构化可读值或动作。            |

#### 会话动作

Runtime 动作可以是同步或异步实现。下表记录默认 Kit 适配的可见结果；自定义 Runtime 应保持同一公开契约。

| 动作                            | 返回值                  | 可见副作用、短路与错误                                                                                      |
| ------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `send(payload)`                 | `Promise<boolean>`      | 执行上述发送状态转换。未接受发送时 resolve `false`，已接受时 resolve `true`，请求或动作错误保持 rejection。 |
| `abort?.()`                     | `void \| Promise<void>` | 默认实现中止活动会话的当前请求；Runtime 可不提供该动作。                                                    |
| `clearActiveConversation()`     | `void \| Promise<void>` | 只取消当前会话的选中状态。不删除会话，也不中止正在运行的请求。                                              |
| `createConversation(payload?)`  | `void \| Promise<void>` | 创建并选中会话；可传入 `title` 和 `metadata`。存储副作用由所连会话源负责。                                  |
| `switchConversation(id)`        | `void \| Promise<void>` | 切换到已有会话；默认 Kit 会话对空 ID、当前 ID 或未知 ID 短路，读取存储失败时可 reject。                     |
| `renameConversation(id, title)` | `void \| Promise<void>` | 更新并持久化标题；默认 Kit 会话对未知 ID 短路。                                                             |
| `deleteConversation(id)`        | `void \| Promise<void>` | 先中止被删会话的请求，再移除会话并执行存储删除；删除活动会话会清空选中状态，未知 ID 短路。                  |

#### 模型状态与动作

`ChatModelRuntime` 通过 `options`、`selectedId`、`features` 和可选 `reasoning` 只读值公布当前模型状态。

| 动作                         | 返回值                  | 状态变化与失败条件                                                                                                       |
| ---------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `select(id)`                 | `void \| Promise<void>` | 选择 ID 或用 `null` 清空选择，同时重置新模型不支持的能力和 reasoning effort。内建 Runtime 在 ID 未知或模型已禁用时抛错。 |
| `setFeature(id, enabled)`    | `void \| Promise<void>` | 更新 `thinking` 或 `search`。启用未声明或不支持的能力时抛错；当模型要求 thinking 时，禁用 thinking 也会抛错。            |
| `setReasoningEffort(effort)` | `void \| Promise<void>` | 传 `null` 时恢复当前模型默认 effort；值不在当前模型 `efforts` 中时抛错。                                                 |

#### MCP 状态与动作

`ChatMcpRuntime` 通过 `servers` 和按 Server ID 索引的 `tools` 只读值公布状态。内建 `mcpServers` 适配器在连接和发现工具时设置 `server.loading`；连接、校验或工具发现失败会记录 `server.error`、禁用 Server 并 reject 对应动作。

| 动作                                        | 返回值                  | 状态变化与失败条件                                                                                                     |
| ------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `addServer(id)`                             | `void \| Promise<void>` | 把 Server 标记为已安装且启用，加载并启用工具。未知 ID 或加载失败时抛错。                                               |
| `removeServer(id)`                          | `void \| Promise<void>` | 将 Server 设为未安装、禁用，并清除其工具、错误和加载状态；未知 ID 时抛错。                                             |
| `setServerEnabled(id, enabled)`             | `void \| Promise<void>` | 启用时加载或启用工具，禁用时禁用全部工具。Server 未安装却请求启用、ID 未知或加载失败时抛错。                           |
| `setToolEnabled(serverId, toolId, enabled)` | `void \| Promise<void>` | 启用工具会同时启用 Server；禁用最后一个工具会同时禁用 Server。Server 未安装、工具未加载、Server 或工具 ID 未知时抛错。 |

### Runtime 界面适配器

`UseChatRuntimeAdapterOptions` 接受响应式输入；`runtime`、`title` 和 `historyData` 均可以是普通值、Ref 或 Getter，适配器会持续读取其最新值。

| 字段            | 类型                                               | 必填 | 行为                                                                        |
| --------------- | -------------------------------------------------- | ---- | --------------------------------------------------------------------------- |
| `runtime`       | `MaybeRefOrGetter<ChatRuntime>`                    | 是   | 提供状态和动作；Runtime 值更换时清除适配器的 pending 状态并使草稿失效。     |
| `title`         | `MaybeRefOrGetter<string \| undefined>`            | 否   | 提供界面标题；空值回退到活动会话标题。                                      |
| `historyData`   | `MaybeRefOrGetter<ChatHistoryData \| undefined>`   | 否   | 把应用持有的历史排序或分组透传到 `data.conversation.history`。              |
| `onActionError` | `(payload: ChatRuntimeActionErrorPayload) => void` | 是   | 接收适配器捕获的 Runtime 动作错误；适配器不再向界面事件调用方抛出这些错误。 |

该 Composable 返回一个源码推断的普通对象，没有独立的公开命名类型。

| 返回字段                  | 形态                                                                    | 责任与短路行为                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `data`                    | `ComputedRef<ChatUIData>`                                               | 只读派生 Ref；组合会话、消息、请求、Composer、模型、MCP 与适配器 pending 状态。                                         |
| `inputValue`              | `ChatReadable<string>`                                                  | 适配器持有的草稿可读 Ref；应用通过 `setInputValue` 更新。                                                               |
| `setInputValue`           | `(value: string) => void`                                               | 更新草稿并使正在等待的旧发送不能覆盖新输入。                                                                            |
| `send`                    | `(payload: ChatSendPayload) => Promise<boolean>`                        | 发送前清空草稿；Runtime 返回 `false` 或动作失败时恢复未被后续输入替换的草稿。错误交给 `onActionError`，结果为 `false`。 |
| `abort`                   | `() => Promise<void \| undefined>`                                      | 调用可选 Runtime `abort`；错误交给 `onActionError`。                                                                    |
| `clearActiveConversation` | `() => Promise<void>`                                                   | 先使草稿失效，再调用同名 Runtime 动作。                                                                                 |
| `createConversation`      | `() => Promise<void>`                                                   | 先使草稿失效，再用空 payload 调用 Runtime 创建动作。                                                                    |
| `switchConversation`      | `(id: string) => Promise<void>`                                         | 目标不是当前会话时先使草稿失效，再调用 Runtime。                                                                        |
| `renameConversation`      | `(id: string, title: string) => Promise<void \| undefined>`             | 调用 Runtime 并捕获错误；不更改草稿。                                                                                   |
| `deleteConversation`      | `(id: string) => Promise<void>`                                         | 删除当前会话前使草稿失效，再调用 Runtime。                                                                              |
| `selectModel`             | `(id: string \| null) => Promise<void>`                                 | 目标已选中或选择正在 pending 时忽略重复操作。                                                                           |
| `setModelFeature`         | `(id: ChatBuiltInModelFeature, enabled: boolean) => Promise<void>`      | 值未变化或同一能力正在 pending 时忽略重复操作。                                                                         |
| `setModelReasoningEffort` | `(effort: string \| null) => Promise<void>`                             | 值未变化或 effort 正在 pending 时忽略重复操作。                                                                         |
| `addMcpServer`            | `(id: string) => Promise<void>`                                         | 同一 Server 操作正在 pending 时忽略重复操作。                                                                           |
| `removeMcpServer`         | `(id: string) => Promise<void>`                                         | 与添加、Server 启用状态变更共享 Server 级 pending 门禁。                                                                |
| `setMcpServerEnabled`     | `(id: string, enabled: boolean) => Promise<void>`                       | Server 不存在、值未变化或正在 pending 时忽略。                                                                          |
| `setMcpToolEnabled`       | `(serverId: string, toolId: string, enabled: boolean) => Promise<void>` | 工具不存在、值未变化或同一工具正在 pending 时忽略。                                                                     |

所有调用 Runtime 的适配器动作都在内部捕获错误并调用 `onActionError`。当 `runtime` 响应式输入切换到新实例时，适配器会同步清除模型和 MCP pending 状态、使旧草稿失效并清空当前输入。

### 历史数据 Composable

`useChatHistoryItems` 和 `useChatHistoryData` 的所有输入都通过 `MaybeRefOrGetter` 接受普通值、Ref 或 Getter，并在这些响应式输入变化时重新计算。

| Composable            | 返回值                                             | 输入与归一化行为                                                                         |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `useChatHistoryItems` | `Readonly<ShallowRef<readonly ChatHistoryItem[]>>` | 读取 `conversations` 与必填 `defaultTitle`，按输入顺序生成平铺列表。                     |
| `useChatHistoryData`  | `Readonly<ShallowRef<ChatHistoryDisplayData>>`     | 在相同输入之上接受可选 `history`；传入分组时保留调用方的分组和项目顺序，不按时间戳重排。 |

两者都会按会话 ID 复用已有 `ChatHistoryItem` 对象，同步更新字段与 `raw`，并移除已不存在的缓存项。这让组件持有的项目局部状态可在会话数据刷新后保持稳定。

### 类型索引

本页列出的 Chat 类型默认从 `@opentiny/tiny-robot-chat` 导入。

#### Runtime 与响应式协议

| 类型                  | 类别        | 说明                                                 |
| --------------------- | ----------- | ---------------------------------------------------- |
| `ChatReadable<T>`     | `interface` | 只读 `{ readonly value: T }` 结构。                  |
| `ChatWritable<T>`     | `interface` | 可写 `{ value: T }` 结构；供兼容适配层使用。         |
| `ChatRuntime`         | `interface` | 组合会话状态、Composer 和 `ChatRuntimeActions`。     |
| `ChatRuntimeActions`  | `interface` | Runtime 的发送、取消和会话操作。                     |
| `ChatComposerRuntime` | `interface` | Composer 禁用状态与可选模型、MCP Runtime。           |
| `ChatModelRuntime`    | `interface` | 模型列表、选择、能力和 reasoning effort 状态与动作。 |
| `ChatMcpRuntime`      | `interface` | MCP Server、工具的只读状态与安装、启用动作。         |

#### 会话、消息与发送

| 类型                                         | 字段                                                                                                                                                                                                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatConversationInfo`                       | `id: string`；`title: string`；`createdAt?: number`；`updatedAt?: number`；`metadata?: Record<string, unknown>`；允许额外自定义字段 `[key: string]: unknown`。                                                                                                               |
| `ChatConversation`                           | 继承 `ChatConversationInfo`；`messages: readonly ChatMessageItem[]`；`requestState: 'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'`；`processingState?: 'requesting' \| 'completing' \| string`                                                   |
| `ChatMessageItem`                            | `role?: string`；`content?: string \| ChatMessagePart[]`；`reasoning_content?: string`；`tool_calls?: ChatToolCall[]`；`tool_call_id?: string`；`name?: string`；`id?: string`；`loading?: boolean`；`state?: Record<string, unknown>`；`metadata?: Record<string, unknown>` |
| `ChatMessageContent`                         | `string \| ChatMessagePart[]`                                                                                                                                                                                                                                                |
| `ChatMessagePart` / `ChatStructuredDataItem` | `type: string`，可追加自定义字段。                                                                                                                                                                                                                                           |
| `ChatStructuredData`                         | `ChatStructuredDataItem[]`                                                                                                                                                                                                                                                   |
| `ChatToolCall`                               | `id: string`；`type: 'function' \| string`；`function: { name: string; arguments: string }`                                                                                                                                                                                  |
| `ChatSendPayload`                            | `text: string`；`structuredData?: ChatStructuredData`                                                                                                                                                                                                                        |
| `ChatRequestState`                           | `'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'`                                                                                                                                                                                                  |
| `ChatProcessingState`                        | `'requesting' \| 'completing' \| string`                                                                                                                                                                                                                                     |

#### 模型与 MCP

| 类型                       | 字段                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatModelOption`          | `id: string`；`label: string`；`description?: string`；`icon?: ChatIcon`；`disabled?: boolean`；`group?: string`；`efforts?: readonly ModelSelectorReasoningEffortOption[]`；`defaultEffort?: string`；`thinkingRequired?: boolean`；`capabilities?: Partial<Record<'thinking' \| 'search', boolean>>`；`metadata?: Record<string, unknown>` |
| `ChatMcpServerInfo`        | `id: string`；`name: string`；`description?: string`；`icon?: string`；`category?: string`；`installed: boolean`；`enabled: boolean`；`loading?: boolean`；`error?: unknown`；`metadata?: Record<string, unknown>`                                                                                                                           |
| `ChatMcpToolInfo`          | `id: string`；`name: string`；`description?: string`；`enabled: boolean`                                                                                                                                                                                                                                                                     |
| `ChatMcpToolState`         | `Partial<Record<string, readonly ChatMcpToolInfo[]>>`，键为 Server ID。                                                                                                                                                                                                                                                                      |
| `ChatProviderConfig`       | `type: 'openai' \| 'deepseek' \| 'qwen'`；`label?: string`；`apiUrl?: string`；`apiKey?: string`；`headers?: Record<string, string>`；`timeout?: number`；`models: ChatProviderModelConfig[]`                                                                                                                                                |
| `ChatProviderType`         | `'openai' \| 'deepseek' \| 'qwen'`                                                                                                                                                                                                                                                                                                           |
| `ChatProviderModelConfig`  | 继承 `ChatModelOption`，不含 `metadata`；`featureBody?: Partial<Record<'thinking' \| 'search', ChatProviderFeatureBody>>`；`effortParam?: string`                                                                                                                                                                                            |
| `ChatProviderFeatureBody`  | `enabled?: Record<string, unknown>`；`disabled?: Record<string, unknown>`                                                                                                                                                                                                                                                                    |
| `ChatBuiltInModelFeature`  | `'thinking' \| 'search'`                                                                                                                                                                                                                                                                                                                     |
| `ChatIcon`                 | `ModelSelectorOption['icon']`                                                                                                                                                                                                                                                                                                                |
| `ChatMcpServerConfig`      | `id: string`；`name: string`；`baseUrl: string`；`installed?: boolean`（默认 `false`）；`description?: string`；`icon?: string`；`headers?: Record<string, string>`；`timeout?: number`；`validate?: (serverId: string) => void`                                                                                                             |
| `ChatMcpServers`           | `readonly ChatMcpServerConfig[]`                                                                                                                                                                                                                                                                                                             |
| `UseChatRuntimeMcpAdapter` | `runtime: ChatMcpRuntime`；`listTools`；`callTool`。后两项来自 Chat 的 MCP Tool 插件协议。                                                                                                                                                                                                                                                   |

内建 `mcpServers` 适配器会把所有 Server 的初始 `enabled` 设为 `false`。`installed: true` 会在初始化时加载工具定义，但 Server 启用前这些工具仍为禁用状态。

#### 发送与请求快照

| 类型                            | 字段                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatRunConfig`                 | `modelId?: string`；`features?: Partial<Record<'thinking' \| 'search', boolean>>`；`reasoning?: ChatRunConfigReasoning`；`mcp?: ChatMcpRunConfig`                                                                                                                                                                                                                               |
| `ChatRunConfigReasoning`        | `enabled: boolean`；`effort?: string`                                                                                                                                                                                                                                                                                                                                           |
| `ChatMcpRunConfig`              | `serverIds: readonly string[]`；`toolIds: Readonly<Record<string, readonly string[]>>`                                                                                                                                                                                                                                                                                          |
| `ChatBeforeSendContext`         | `payload: ChatSendPayload`；`runConfig?: ChatRunConfig`；`model?: ChatModelOption`；`mcp?: { servers: readonly ChatMcpServerInfo[]; tools: ChatMcpToolState }`                                                                                                                                                                                                                  |
| `ChatBeforeSendResult`          | `'continue' \| 'handled' \| 'reject'`                                                                                                                                                                                                                                                                                                                                           |
| `ChatBeforeSend`                | `(context: ChatBeforeSendContext) => 'continue' \| 'handled' \| 'reject' \| Promise<'continue' \| 'handled' \| 'reject'>`                                                                                                                                                                                                                                                       |
| `ChatRuntimeActionErrorPayload` | `action: 'send' \| 'abort' \| 'clear-active-conversation' \| 'create-conversation' \| 'switch-conversation' \| 'rename-conversation' \| 'delete-conversation' \| 'select-model' \| 'set-model-feature' \| 'set-model-reasoning-effort' \| 'add-mcp-server' \| 'remove-mcp-server' \| 'set-mcp-server-enabled' \| 'set-mcp-tool-enabled'`；`payload?: unknown`；`error: unknown` |

#### Composable 配置

| 类型                                    | 字段                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `UseChatRuntimeOptions`                 | `conversation?: Omit<UseConversationOptions, 'useMessageOptions'> & { useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']> }`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`composer?: Pick<ChatComposerRuntime, 'disabled' \| 'submitDisabled'>`；`modelProviders?: readonly ChatProviderConfig[]`；`mcp?: UseChatRuntimeMcpAdapter`；`mcpServers?: ChatMcpServers` |
| `UseChatRuntimeFromConversationOptions` | `conversation: UseConversationReturn`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`send?: (payload: ChatSendPayload & { conversationId: string \| null; runConfig?: ChatRunConfig }) => void \| Promise<void>`；`composer?: ChatComposerRuntime`                                                                                                                                        |
| `UseChatRuntimeAdapterOptions`          | `runtime: MaybeRefOrGetter<ChatRuntime>`；`title?: MaybeRefOrGetter<string \| undefined>`；`historyData?: MaybeRefOrGetter<ChatHistoryData \| undefined>`；`onActionError(payload)`                                                                                                                                                                                                                                      |
| `UseChatHistoryItemsOptions`            | `conversations: MaybeRefOrGetter<readonly ChatConversationInfo[] \| undefined>`；`defaultTitle: MaybeRefOrGetter<string>`                                                                                                                                                                                                                                                                                                |
| `UseChatHistoryDataOptions`             | 继承 `UseChatHistoryItemsOptions`；`history?: MaybeRefOrGetter<ChatHistoryData \| undefined>`                                                                                                                                                                                                                                                                                                                            |
| `ChatHistoryItem`                       | 继承 `ChatConversationInfo`；`raw: ChatConversationInfo`                                                                                                                                                                                                                                                                                                                                                                 |
| `ChatHistoryDisplayData`                | `ChatHistoryItem[] \| HistoryGroup<ChatHistoryItem>[]`                                                                                                                                                                                                                                                                                                                                                                   |
| `ChatHistoryData`                       | `readonly ChatConversationInfo[] \| readonly ChatHistoryGroup[]`                                                                                                                                                                                                                                                                                                                                                         |
| `ChatUIData`                            | `TrChatUI` 的只读会话、消息、Sender、请求、模型和 MCP 数据结构；详见 [Chat API](./chat#chatuidata)。                                                                                                                                                                                                                                                                                                                     |

`UseConversationOptions`、`UseConversationReturn`、`UseMessageOptions` 和 `UseMessagePlugin` 来自 `@opentiny/tiny-robot-kit`；`ComputedRef`、`MaybeRefOrGetter` 和 `ShallowRef` 来自 Vue；`ModelSelectorReasoningEffortOption`、`HistoryGroup` 和 `ChatIcon` 的底层图标类型来自 `@opentiny/tiny-robot`。这些外部类型请参阅各自的 API。

## 常见问题

### `send()` 返回 `false`

检查以下条件：

- 默认发送的 trim 后文本为空；自定义 `useChatRuntimeFromConversation({ send })` 可以接收空文本。
- Composer 的 `disabled` 或外部 `submitDisabled` 为 `true`。
- 默认发送没有可用的已选模型。
- 已启用的 MCP Server 正在加载工具，或 `tools` 尚无该 Server 的条目。`server.error` 是诊断状态，不会被发送门禁直接检查。
- 活动会话的当前回合不允许开始新请求。
- `beforeSend` 返回 `'reject'`，或在未返回 `'handled'` 时，钩子执行期间切换、清空或删除了活动会话。

### 模型服务与自定义 Provider 冲突

非空 `modelProviders` 外层数组与 `conversation.useMessageOptions.responseProvider` 不能同时配置。内建响应层还要求配置至少解析出一个模型；空外层数组可以改用自定义 Provider，而非空外层数组中的 `models` 全为空数组时则会抛出缺少响应层的错误。

### MCP Server 无法连接

确认地址可从浏览器访问、服务允许 CORS，或改为通过 BFF 代理。不要把生产凭证写入浏览器配置。
