---
outline: [1, 3]
---

# Chat 配置与操作

本文介绍如何为 `TrChat` 配置模型服务，以及如何发送消息、取消请求、管理会话和接入 MCP 工具。

通常使用 `useChatRuntime` 配置这些功能，再将返回的 `runtime` 对象传给 `TrChat`。首次接入请先阅读 [Chat 快速开始](./chat#快速开始)；复用已有 Kit 会话或自定义请求时，见 [高级用法](#高级用法)。

## 模型服务

`modelProviders` 是传给 `useChatRuntime` 的模型服务配置数组，每项通过 `models` 数组列出该服务下的模型。基础接入见 [Chat 快速开始](./chat#快速开始)。配置结构和主要字段如下：

| 字段                    | 用途和可选值                                                                  | 必填 | 默认值或未配置行为                     |
| ----------------------- | ----------------------------------------------------------------------------- | ---- | -------------------------------------- |
| `type`                  | 服务类型，可选 `'openai'`、`'deepseek'`、`'qwen'`                             | 是   | 无默认值                               |
| `apiUrl`                | 服务地址；填写时使用完整 URL，可为服务根地址或 `/chat/completions` 地址       | 否   | 使用对应服务的预设地址                 |
| `timeout`               | 从请求开始到回答接收结束的超时时间，单位为毫秒                                | 否   | 不额外设置超时计时器                   |
| `models`                | 该服务下的模型配置数组                                                        | 是   | 无默认值；内置请求需要至少一个可用模型 |
| `models[].id`           | 服务实际支持的模型 ID，所有服务配置中的 ID 不可重复                           | 是   | 无默认值                               |
| `models[].label`        | 模型在界面中显示的名称                                                        | 是   | 无默认值                               |
| `models[].capabilities` | 声明模型是否支持 `thinking`（深度思考）、`search`（联网搜索），并显示对应开关 | 否   | 未声明的功能不显示开关                 |

`'openai'` 也适用于兼容 OpenAI `/chat/completions` 接口的服务。省略 `apiUrl` 时，三个服务类型分别使用以下地址：

| `type`       | 预设服务地址                                                         |
| ------------ | -------------------------------------------------------------------- |
| `'openai'`   | `https://api.openai.com/v1`                                          |
| `'deepseek'` | `https://api.deepseek.com/chat/completions`                          |
| `'qwen'`     | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` |

通过项目自己的服务转发请求时，应设置 `apiUrl`。例如，配置 60 秒超时，并声明模型支持深度思考和联网搜索：

```ts
import { useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    apiUrl: 'https://your-service.example.com/v1',
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

将示例中的服务地址和模型 ID 替换为实际值。配置多个模型时，可在输入区选择模型，默认选择第一个未禁用的模型；`models[].disabled` 默认不禁用，设为 `true` 可禁止选择该模型。

`capabilities` 声明的是模型支持的功能，不表示每次请求都开启这些功能。用户通过输入区开关选择是否开启；深度思考默认关闭，`models[].thinkingRequired: true` 表示必须开启。联网搜索默认关闭。功能需要模型服务支持，配置开关不会为模型增加这些能力。

其他可选字段如下：

| 字段                     | 用途                                          | 默认值或未配置行为                                                   |
| ------------------------ | --------------------------------------------- | -------------------------------------------------------------------- |
| `label`                  | 模型服务的显示名称，与 `models[].label` 区分  | 根据服务类型使用 `OpenAI`、`DeepSeek` 或 `DashScope`                 |
| `apiKey`                 | 用于 Bearer 认证                              | 不添加由该字段生成的认证头；生产密钥应由服务端保管                   |
| `headers`                | 额外请求头，如项目要求的业务标识              | 不添加额外请求头；其中的 `Authorization` 优先于 `apiKey`             |
| `models[].featureBody`   | 指定开启或关闭功能时发送的请求参数            | `deepseek`、`qwen` 使用内置参数；`openai` 没有内置功能参数           |
| `models[].efforts`       | 思考强度选项数组，每项包含 `value` 和 `label` | `deepseek` 预设 `low`、`high`、`max`；其他类型不提供预设选项         |
| `models[].defaultEffort` | 初始思考强度，需对应一个 `efforts[].value`    | `deepseek` 预设 `'high'`；未设置或值不在选项中时选第一项             |
| `models[].effortParam`   | 思考强度在请求参数中的字段名                  | `deepseek` 预设 `'reasoning_effort'`；其他类型未设置时不发送强度参数 |

`featureBody` 中的 `enabled`、`disabled` 分别表示功能开启、关闭时需要添加的请求参数。例如，下面是 `models` 数组中的一个模型配置：

```ts
import type { ChatProviderModelConfig } from '@opentiny/tiny-robot-chat'

const model: ChatProviderModelConfig = {
  id: 'qwen-plus',
  label: '通义千问',
  capabilities: { thinking: true },
  featureBody: {
    thinking: {
      enabled: { enable_thinking: true },
      disabled: { enable_thinking: false },
    },
  },
}
```

`qwen` 已内置上面的深度思考参数，一般无需重复设置；需要匹配其他服务的参数时，可参考该结构修改。

服务支持思考强度时，可参考下面这个独立示例，在 `models` 数组的模型配置中设置选项和请求字段：

```ts
const model: ChatProviderModelConfig = {
  id: 'your-model-id',
  label: '项目助手',
  capabilities: { thinking: true },
  efforts: [
    { value: 'low', label: '低' },
    { value: 'high', label: '高' },
  ],
  defaultEffort: 'high',
  effortParam: 'reasoning_effort',
}
```

模型 ID、强度选项和请求字段名需与实际服务一致。选择思考强度后，只有开启深度思考时才发送对应参数。

生产环境应由服务端保管密钥并转发请求。使用自定义请求实现时，不要同时配置 `modelProviders`，见 [自定义请求与发送](#自定义请求与发送)。

## 常用操作

使用 `TrChat` 时，发送、取消、切换会话和模型选择已连接到 Runtime，不需要额外绑定事件。需要由其他按钮或业务逻辑触发操作时，再调用下面的方法。代码中的 `runtime` 指应用中创建的实例，各操作按需调用，不必依次执行。

### 发送与取消

`runtime.actions.send()` 用于发送一条消息，`text` 是必填的文本字段。发送完成后返回 `true`；空文本、输入被禁用或发送前检查未通过时返回 `false`。请求失败会抛出错误，直接调用时需处理异常：

```ts
try {
  const sent = await runtime.actions.send({ text: '介绍一下这个项目' })
  if (!sent) console.info('本次消息未发送')
} catch (error) {
  console.error('消息发送失败', error)
}
```

全部检查条件见 [常见问题](#runtime-actions-send-返回-false)。

回答还在生成时，可调用 `abort()` 停止当前请求：

```ts
await runtime.actions.abort?.()
```

### 会话管理

返回新会话页面，在发送首条非空消息时创建会话：

```ts
await runtime.actions.clearActiveConversation()
```

立即创建并选中一个会话：

```ts
await runtime.actions.createConversation({ title: '项目问答' })
```

两种方式按需选择。`clearActiveConversation()` 不会删除会话或停止当前请求。

切换、重命名或删除已有会话时，传入该会话的 ID。下面三种操作独立使用，其中 `conversationId` 替换为实际 ID：

```ts
await runtime.actions.switchConversation(conversationId)
await runtime.actions.renameConversation(conversationId, '新的会话标题')
await runtime.actions.deleteConversation?.(conversationId)
```

新建会话未指定 `title` 时，界面显示 `'新对话'`。默认发送自动创建会话时，标题取首条消息去除首尾空格后的前 20 个字符；通过 `useChatRuntime` 的 `titleGenerator` 可自定义：

```ts
const runtime = useChatRuntime({
  modelProviders,
  titleGenerator: (text) => text.trim().slice(0, 10) || '新对话',
})
```

需要先停止当前请求再开始新会话时，调用 `abort()`，再调用 `clearActiveConversation()`。

### 发送前检查

`useChatRuntime` 的 `beforeSend` 用于在发送前检查登录状态、权限或输入内容；未配置时，不执行自定义检查。函数接收本次发送内容 `payload`，也可读取选中的 `model` 和工具配置 `mcp`，支持异步返回。

| 返回值       | 结果                                       |
| ------------ | ------------------------------------------ |
| `'continue'` | 继续发送                                   |
| `'reject'`   | 阻止发送；通过 `TrChat` 提交时保留输入内容 |
| `'handled'`  | 项目已自行处理，不再执行默认发送           |

例如，阻止超过 500 个字符的输入：

```ts
const runtime = useChatRuntime({
  modelProviders,
  beforeSend({ payload }) {
    return payload.text.length > 500 ? 'reject' : 'continue'
  },
})
```

检查函数抛出错误时，`send()` 也会抛出该错误。

需要直接禁用输入或提交时，通过 `composer.disabled`、`composer.submitDisabled` 传入 Vue Ref；未设置时不额外禁用。例如，禁用整个输入区：

```ts
import { shallowRef } from 'vue'

const inputDisabled = shallowRef(true)
const runtime = useChatRuntime({
  modelProviders,
  composer: { disabled: inputDisabled },
})
```

`disabled` 禁用整个输入区；`submitDisabled` 只禁止提交，输入仍可编辑。将 Ref 更新为 `false` 可解除对应限制。

### 请求失败时的提示

默认接入时，`TrChat` 会在消息中显示请求失败提示，界面效果见 [请求失败提示](./chat#请求失败提示)。需要记录日志或显示操作失败通知时，监听 `runtime-action-error`，事件参数见 [TrChat 事件](./chat#事件)。

直接调用 `runtime.actions.send()` 时，需要通过 `try...catch` 处理异常。默认错误记录与可选配置见 [错误记录配置](#错误记录配置)。

### 接入 MCP 工具

MCP 是连接工具服务的协议。例如，模型可以通过工具查询项目资料，而不只生成文本回答。不需要外部工具时，可以跳过此配置。

`useChatRuntime` 的 `mcpServers` 是工具服务配置数组，连接浏览器可访问的 Streamable HTTP MCP 服务。未配置时，不创建内置工具连接。

| 字段        | 用途                                       | 必填 | 默认值或未配置行为        |
| ----------- | ------------------------------------------ | ---- | ------------------------- |
| `id`        | 服务唯一标识，不可重复                     | 是   | 无默认值                  |
| `name`      | 界面中显示的服务名称                       | 是   | 无默认值                  |
| `baseUrl`   | 工具服务地址，浏览器中也可使用同源相对地址 | 是   | 无默认值                  |
| `installed` | 是否在初始化时加载工具并显示为已安装       | 否   | `false`，显示在可安装列表 |
| `timeout`   | 连接和工具操作的超时时间，单位为毫秒       | 否   | `30_000`                  |

例如，配置一个可安装的工具服务：

```ts
const runtime = useChatRuntime({
  modelProviders,
  mcpServers: [
    {
      id: 'project-tools',
      name: '项目工具',
      baseUrl: 'https://your-service.example.com/mcp/project-tools',
      installed: false,
      timeout: 30_000,
    },
  ],
})
```

将 `baseUrl` 替换为实际工具服务地址。`installed: false` 时，服务显示在可安装列表，点击安装后会加载并启用工具。设为 `true` 时，初始化会加载工具，但服务仍默认关闭，需要在界面启用后才能使用。已启用服务的工具仍在加载时，会暂时禁止发送。

内置连接方式与自定义 `mcp` 不能同时配置。需要登录授权、权限过滤或复用已有连接时，使用自定义 `mcp`；生产环境由服务端处理凭证、权限、访问限制和跨域问题，不要将凭证写入浏览器配置。

## 高级用法

需要复用已有 Kit 会话、自定义请求或单独连接 `TrChatUI` 时，可参考以下用法。

### 使用已有会话

项目已使用 `@opentiny/tiny-robot-kit` 的 `useConversation` 管理会话时，可通过 `useChatRuntimeFromConversation` 接入 `TrChat`，保留已有的请求和插件配置。必填的 `conversation` 接收已有的会话实例，没有默认值。

> `useChatRuntimeFromConversation` 不会自动安装错误记录插件，配置方式见 [错误记录配置](#错误记录配置)。

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'
import { useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: { responseProvider: myResponseProvider },
})

const runtime = useChatRuntimeFromConversation({ conversation })
```

`myResponseProvider` 表示应用已有的请求实现。将返回的 `runtime` 传给 `TrChat`，即可使用聊天界面。

### 自定义请求与发送

服务不使用内置模型接口时，可以在 `useChatRuntime` 的 `conversation.useMessageOptions.responseProvider` 中提供项目已有的请求实现。它接收请求内容和取消信号，返回模型回答；具体返回结构见 [useMessage 请求与响应](../tools/message#responseprovider)。

```ts
const runtime = useChatRuntime({
  conversation: {
    useMessageOptions: { responseProvider: myResponseProvider },
  },
})
```

`myResponseProvider` 是项目已有的请求方法。使用此配置时不再提供 `modelProviders`；未提供自定义请求时需要配置模型服务，具体限制见 [常见问题](#模型配置与自定义请求冲突)。

需要自行处理会话创建、消息保存和请求时，在 `useChatRuntimeFromConversation` 中传入 `send`，替换默认发送方法。未设置时使用已有 Kit 会话发送；设置后，项目负责执行实际操作。

```ts
const runtime = useChatRuntimeFromConversation({
  conversation,
  send: async ({ text, conversationId }) => {
    await sendMessage({ text, conversationId })
  },
})
```

`conversation` 是上节创建的会话实例，`sendMessage` 是项目自己的发送方法。`text` 是提交内容，`conversationId` 是当前会话 ID，未选择会话时为 `null`；还可通过参数中的 `runConfig` 读取本次发送的模型和工具配置。默认发送不接受空文本，自定义发送可以处理空文本，下面的演示可比较两者：

<demo
  vue="../../demos/chat/runtime-send.vue"
  :vueFiles="['../../demos/chat/runtime-send.vue']"
  title="自定义发送"
  description="比较默认发送和自定义发送的处理结果。"
/>

自定义发送的参数见 [`useChatRuntimeFromConversation` 配置](#usechatruntimefromconversation-配置)。附件上传需要由应用实现。

### 连接 TrChatUI

`TrChat` 已自动连接聊天数据和相关操作，无需手动绑定。单独使用 `TrChatUI`，但仍希望使用已有 `runtime` 时，可通过 `useChatRuntimeAdapter` 获取界面数据和操作方法，再绑定到组件：

`runtime` 是必填的已有实例；`onActionError` 是必填的操作失败回调，接收 `action`（操作名称）和 `error`（错误详情）：

```ts
import { useChatRuntimeAdapter } from '@opentiny/tiny-robot-chat'

const adapter = useChatRuntimeAdapter({
  runtime,
  onActionError({ action, error }) {
    console.error(`${action} 操作失败`, error)
  },
})
```

`adapter.data` 提供显示数据，`adapter.inputValue` 提供输入内容；以下片段连接输入、发送和取消操作：

```vue
<TrChatUI
  :data="adapter.data.value"
  :input-value="adapter.inputValue.value"
  @update:input-value="adapter.setInputValue"
  @submit="adapter.send"
  @cancel="adapter.abort"
/>
```

`adapter` 是普通对象，模板访问其中的 Ref 时需要使用 `.value`。会话切换、重命名和删除等操作的完整绑定见下面的演示。

<demo
  vue="../../demos/chat/runtime-adapter.vue"
  :vueFiles="['../../demos/chat/runtime-adapter.vue']"
  title="连接 Runtime 与 TrChatUI"
  description="使用 Runtime 提供的数据展示聊天界面，并绑定输入、提交和会话事件。"
/>

将适配器的 `data` 传给组件，将输入和提交等事件绑定到对应方法，完整返回值见 [`useChatRuntimeAdapter`](#usechatruntimeadapter)。不使用 `runtime`、直接传入应用数据的用法，见 [使用 TrChatUI](./chat#使用-trchatui)。

## API

### 公开函数

| 函数                             | 签名                                                                                                         | 说明                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `useChatRuntime`                 | `useChatRuntime(options: UseChatRuntimeOptions): ChatRuntime`                                                | 创建会话，并配置默认的请求和错误处理。           |
| `useChatRuntimeFromConversation` | `useChatRuntimeFromConversation(options: UseChatRuntimeFromConversationOptions): ChatRuntime`                | 将已有 Kit 会话连接到聊天组件。                  |
| `useChatRuntimeAdapter`          | `useChatRuntimeAdapter(options: UseChatRuntimeAdapterOptions): /* 源码推断的普通返回对象 */`                 | 提供 `TrChatUI` 所需的数据、输入内容和操作方法。 |
| `useChatHistoryItems`            | `useChatHistoryItems(options: UseChatHistoryItemsOptions): Readonly<ShallowRef<readonly ChatHistoryItem[]>>` | 整理未分组的会话列表。                           |
| `useChatHistoryData`             | `useChatHistoryData(options: UseChatHistoryDataOptions): Readonly<ShallowRef<ChatHistoryDisplayData>>`       | 整理未分组或已分组的会话列表。                   |
| `errorStatePlugin`               | `errorStatePlugin(options?: ErrorStatePluginOptions): UseMessagePlugin`                                      | 把请求错误写入所属 assistant 消息。              |

### `useChatRuntime` 配置

| 字段             | 用途                                  | 类型                                                                                                     | 必填 | 默认值或未配置行为                                                       |
| ---------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| `conversation`   | 配置会话与消息处理                    | `Omit<UseConversationOptions, 'useMessageOptions'> & { useMessageOptions?: Partial<UseMessageOptions> }` | 否   | `{}`；`autoSaveMessages` 默认为 `true`                                   |
| `titleGenerator` | 生成默认发送自动创建的会话标题        | `(text: string) => string`                                                                               | 否   | 取首条文本去除首尾空格后的前 20 个 Unicode 字符，空文本回退为 `'新对话'` |
| `beforeSend`     | 发送前检查，支持异步                  | `ChatBeforeSend`                                                                                         | 否   | 不执行自定义检查                                                         |
| `composer`       | 通过 Ref 配置输入和提交是否禁用       | `Pick<ChatComposerRuntime, 'disabled' \| 'submitDisabled'>`                                              | 否   | `{}`，不额外禁用输入或提交                                               |
| `modelProviders` | 配置模型选择和内置请求                | `readonly ChatProviderConfig[]`                                                                          | 否   | 不创建内置模型请求；需提供自定义 `responseProvider`                      |
| `mcp`            | 提供已有 MCP 状态、工具列表和调用方法 | `UseChatRuntimeMcpAdapter`                                                                               | 否   | 不使用自定义 MCP；与 `mcpServers` 二选一                                 |
| `mcpServers`     | 配置内置 MCP 服务连接                 | `ChatMcpServers`                                                                                         | 否   | 不创建内置工具连接；与 `mcp` 二选一                                      |

`modelProviders` 与自定义 `responseProvider` 二选一，配置限制见 [常见问题](#模型配置与自定义请求冲突)。

### `useChatRuntimeFromConversation` 配置

| 字段             | 用途                                         | 类型                                                                                                                  | 必填 | 默认值或未配置行为                         |
| ---------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------ |
| `conversation`   | 提供已有 Kit 会话实例                        | `UseConversationReturn`                                                                                               | 是   | 无默认值                                   |
| `titleGenerator` | 生成默认发送自动创建的会话标题               | `(text: string) => string`                                                                                            | 否   | 与 `useChatRuntime` 相同                   |
| `beforeSend`     | 发送前检查                                   | `ChatBeforeSend`                                                                                                      | 否   | 不执行自定义检查                           |
| `send`           | 自行处理会话创建、消息保存和请求，允许空文本 | `(payload: ChatSendPayload & { conversationId: string \| null; runConfig?: ChatRunConfig }) => void \| Promise<void>` | 否   | 使用已有 Kit 会话执行默认发送              |
| `composer`       | 提供输入区状态、模型和 MCP 操作              | `ChatComposerRuntime`                                                                                                 | 否   | `{}`；默认发送会根据模型和工具状态限制提交 |

### 错误记录配置

| 名称                      | 定义                                                                                                                         | 说明                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `ERROR_STATE_PLUGIN_NAME` | `'error-state'`                                                                                                              | 默认插件名；同名用户插件可替换默认 Runtime 的内置实现。          |
| `ErrorStatePluginOptions` | `{ disabled?: UseMessagePlugin['disabled']; normalizeError?: (error: unknown, context: ChatErrorPluginContext) => unknown }` | 控制是否启用，以及写入 `state.error` 前的错误格式。              |
| `ChatErrorPluginContext`  | `Parameters<NonNullable<UseMessagePlugin['onError']>>[0]`                                                                    | `normalizeError` 与自定义错误插件可使用的完整 `onError` 上下文。 |

默认记录请求错误，供聊天界面显示，并随消息保存。`normalizeError` 可自定义错误格式，返回 `null` 或 `undefined` 时不记录本次错误；记录错误不会改变请求失败的结果。

| 配置字段         | 用途                                                  | 未配置行为                                                                |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `disabled`       | 设为 `true` 禁用该插件，也支持 Kit 插件的动态禁用方式 | 启用错误记录                                                              |
| `normalizeError` | 接收错误和上下文，返回需要保存的错误内容              | 使用内置格式，保存错误名称、提示和可用的错误代码；非 Error 值转为提示文字 |

`useChatRuntime` 默认启用此插件。复用已有 Kit 会话时，在创建会话的位置配置：

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

关闭错误记录、调整错误格式或替换插件时，按需选择以下片段，加入 `conversation.useMessageOptions.plugins` 后生效：

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

### 状态与方法

通过 `.value` 读取状态，通过 `runtime.actions` 执行发送和会话操作。模型与工具操作分别位于 `runtime.composer.model` 和 `runtime.composer.mcp`。

#### 状态

| 字段                             | 类型                                            | 说明                                                      |
| -------------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `conversations`                  | `ChatReadable<readonly ChatConversationInfo[]>` | 当前会话管理工具提供的只读列表。                          |
| `activeConversation`             | `ChatReadable<ChatConversation \| null>`        | 当前会话、消息和请求状态；未选中会话时为 `null`。         |
| `conversationNavigationRevision` | `ChatReadable<number> \| undefined`             | 可选的会话变更标记，普通接入无需配置。                    |
| `composer`                       | `ChatComposerRuntime`                           | 提供输入区禁用状态，以及模型和 MCP 工具的状态与操作方法。 |

#### 会话操作

以下方法位于 `runtime.actions`：

| 操作                            | 返回值                  | 说明                                                                                            |
| ------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `send(payload)`                 | `Promise<boolean>`      | 发送消息。未发送时返回 `false`，发送完成或应用已自行处理时返回 `true`，失败时抛出错误。         |
| `abort?.()`                     | `void \| Promise<void>` | 默认实现中止活动会话的当前请求；Runtime 可不提供该操作。                                        |
| `clearActiveConversation()`     | `void \| Promise<void>` | 只取消当前会话的选中状态。不删除会话，也不中止正在运行的请求。                                  |
| `createConversation(payload?)`  | `void \| Promise<void>` | 创建并选中会话；可传入 `title` 和 `metadata`。数据由会话管理工具保存。                          |
| `switchConversation(id)`        | `void \| Promise<void>` | 切换到已有会话；默认 Kit 会话会忽略空 ID、当前 ID 或未知 ID；读取已保存的数据失败时会抛出错误。 |
| `renameConversation(id, title)` | `void \| Promise<void>` | 更新并保存标题；默认 Kit 会话会忽略未知 ID。                                                    |
| `deleteConversation(id)`        | `void \| Promise<void>` | 先中止被删会话的请求，再移除会话并执行存储删除；删除活动会话会清空选中状态，未知 ID 会被忽略。  |

#### 模型状态与操作

`ChatModelRuntime` 通过 `options`、`selectedId`、`features` 和可选 `reasoning` 提供当前模型的只读状态。

| 操作                         | 返回值                  | 说明                                                                                                             |
| ---------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `select(id)`                 | `void \| Promise<void>` | 选择 ID 或用 `null` 清空选择，同时重置新模型不支持的能力和 思考强度。内建 Runtime 在 ID 未知或模型已禁用时抛错。 |
| `setFeature(id, enabled)`    | `void \| Promise<void>` | 更新 `thinking` 或 `search`。启用未声明或不支持的能力时抛错；当模型要求 thinking 时，禁用 thinking 也会抛错。    |
| `setReasoningEffort(effort)` | `void \| Promise<void>` | 传 `null` 时恢复当前模型默认思考强度；值不在当前模型 `efforts` 中时抛错。                                        |

#### MCP 状态与操作

从 `servers.value` 读取服务列表，从 `tools.value` 读取各服务的工具。加载中状态由 `loading` 表示，连接失败信息可从 `error` 读取。

| 操作                                        | 返回值                  | 说明                                                                                                                         |
| ------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `addServer(id)`                             | `void \| Promise<void>` | 把 MCP 服务标记为已安装且启用，加载并启用工具。未知 ID 或加载失败时抛错。                                                    |
| `removeServer(id)`                          | `void \| Promise<void>` | 将 MCP 服务设为未安装、禁用，并清除其工具、错误和加载状态；未知 ID 时抛错。                                                  |
| `setServerEnabled(id, enabled)`             | `void \| Promise<void>` | 启用时加载或启用工具，禁用时禁用全部工具。MCP 服务未安装却请求启用、ID 未知或加载失败时抛错。                                |
| `setToolEnabled(serverId, toolId, enabled)` | `void \| Promise<void>` | 启用工具会同时启用 MCP 服务；禁用最后一个工具会同时禁用 MCP 服务。MCP 服务未安装、工具未加载、MCP 服务或工具 ID 未知时抛错。 |

### `useChatRuntimeAdapter`

`UseChatRuntimeAdapterOptions` 接受响应式输入；`runtime`、`title` 和 `historyData` 均可以是普通值、Ref 或 Getter，适配器会持续读取其最新值。

| 字段            | 类型                                               | 必填 | 说明                                                         |
| --------------- | -------------------------------------------------- | ---- | ------------------------------------------------------------ |
| `runtime`       | `MaybeRefOrGetter<ChatRuntime>`                    | 是   | 提供当前 Runtime。                                           |
| `title`         | `MaybeRefOrGetter<string \| undefined>`            | 否   | 提供界面标题；空值回退到活动会话标题。                       |
| `historyData`   | `MaybeRefOrGetter<ChatHistoryData \| undefined>`   | 否   | 把应用提供的会话排序或分组传入 `data.conversation.history`。 |
| `onActionError` | `(payload: ChatRuntimeActionErrorPayload) => void` | 是   | 接收发送、会话和模型等操作的错误。                           |

| 返回字段                  | 类型                                                                    | 说明                                                   |
| ------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `data`                    | `ComputedRef<ChatUIData>`                                               | 用于显示的会话、消息、输入区、模型和 MCP 数据。        |
| `inputValue`              | `ChatReadable<string>`                                                  | 当前输入内容，通过 `setInputValue` 更新。              |
| `setInputValue`           | `(value: string) => void`                                               | 更新输入内容。                                         |
| `send`                    | `(payload: ChatSendPayload) => Promise<boolean>`                        | 发送消息；发送前清空输入，未发送或失败时返回 `false`。 |
| `abort`                   | `() => Promise<void \| undefined>`                                      | 停止当前请求。                                         |
| `clearActiveConversation` | `() => Promise<void>`                                                   | 返回新会话页面，清空输入。                             |
| `createConversation`      | `() => Promise<void>`                                                   | 创建并选中会话，清空输入。                             |
| `switchConversation`      | `(id: string) => Promise<void>`                                         | 切换到其他会话，清空输入。                             |
| `renameConversation`      | `(id: string, title: string) => Promise<void \| undefined>`             | 修改会话标题。                                         |
| `deleteConversation`      | `(id: string) => Promise<void>`                                         | 删除会话；删除当前会话时清空输入。                     |
| `selectModel`             | `(id: string \| null) => Promise<void>`                                 | 选择模型。                                             |
| `setModelFeature`         | `(id: ChatBuiltInModelFeature, enabled: boolean) => Promise<void>`      | 开启或关闭模型功能。                                   |
| `setModelReasoningEffort` | `(effort: string \| null) => Promise<void>`                             | 设置思考强度。                                         |
| `addMcpServer`            | `(id: string) => Promise<void>`                                         | 安装并启用 MCP 服务。                                  |
| `removeMcpServer`         | `(id: string) => Promise<void>`                                         | 移除 MCP 服务。                                        |
| `setMcpServerEnabled`     | `(id: string, enabled: boolean) => Promise<void>`                       | 开启或关闭 MCP 服务。                                  |
| `setMcpToolEnabled`       | `(serverId: string, toolId: string, enabled: boolean) => Promise<void>` | 开启或关闭指定工具。                                   |

适配器方法执行失败时调用 `onActionError`，不会继续向调用方抛出错误。`send()` 在失败时返回 `false`。

### 会话列表整理

`useChatHistoryItems` 整理普通会话列表，`useChatHistoryData` 还支持分组。两者均接受普通值、Ref 或 Getter，会随输入变化更新。

`conversations` 传入会话数组，`defaultTitle` 是必填的标题回退文案，没有默认值。只需整理普通列表时：

```ts
import { useChatHistoryItems } from '@opentiny/tiny-robot-chat'

const items = useChatHistoryItems({
  conversations: runtime.conversations,
  defaultTitle: '新对话',
})
```

需要分组时，使用 `useChatHistoryData` 并提供 `history`。它支持普通会话数组或 `{ group, items }` 分组数组，未设置时按 `conversations` 的顺序生成普通列表：

```ts
import { useChatHistoryData } from '@opentiny/tiny-robot-chat'

const history = useChatHistoryData({
  conversations: runtime.conversations,
  defaultTitle: '新对话',
  history: [{ group: '项目会话', items: runtime.conversations.value }],
})
```

`group` 是分组标题，`items` 是该组的会话数组。需要随会话变化更新分组时，可将 `history` 改为 Getter：`() => [{ group: '项目会话', items: runtime.conversations.value }]`。返回的 Ref 可以在模板中传给 `TrChat` 的 `history-data`，覆盖默认会话排序或分组：

```vue
<TrChat :runtime="runtime" :history-data="history" />
```

| 函数                  | 返回值                                             | 说明                                                                                     |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `useChatHistoryItems` | `Readonly<ShallowRef<readonly ChatHistoryItem[]>>` | 读取 `conversations` 与必填 `defaultTitle`，按输入顺序生成平铺列表。                     |
| `useChatHistoryData`  | `Readonly<ShallowRef<ChatHistoryDisplayData>>`     | 在相同输入之上接受可选 `history`；传入分组时保留调用方的分组和项目顺序，不按时间戳重排。 |

### 类型索引

本页列出的 Chat 类型默认从 `@opentiny/tiny-robot-chat` 导入。

#### Runtime 与状态类型

| 类型                  | 类别        | 说明                                              |
| --------------------- | ----------- | ------------------------------------------------- |
| `ChatReadable<T>`     | `interface` | 只读 `{ readonly value: T }` 结构。               |
| `ChatWritable<T>`     | `interface` | 可写 `{ value: T }` 结构；供兼容适配层使用。      |
| `ChatRuntime`         | `interface` | 包含会话状态、输入区状态和 `ChatRuntimeActions`。 |
| `ChatRuntimeActions`  | `interface` | Runtime 的发送、取消和会话操作。                  |
| `ChatComposerRuntime` | `interface` | 输入区禁用状态及模型、MCP 工具的状态与方法。      |
| `ChatModelRuntime`    | `interface` | 模型列表、选择、能力和 思考强度 状态与操作。      |
| `ChatMcpRuntime`      | `interface` | MCP 服务、工具的只读状态与安装、启用操作。        |

#### 会话、消息与发送

| 类型                                         | 定义                                                                                                                                                                                                                                                                         |
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

| 类型                       | 定义                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatModelOption`          | `id: string`；`label: string`；`description?: string`；`icon?: ChatIcon`；`disabled?: boolean`；`group?: string`；`efforts?: readonly ModelSelectorReasoningEffortOption[]`；`defaultEffort?: string`；`thinkingRequired?: boolean`；`capabilities?: Partial<Record<'thinking' \| 'search', boolean>>`；`metadata?: Record<string, unknown>` |
| `ChatMcpServerInfo`        | `id: string`；`name: string`；`description?: string`；`icon?: string`；`category?: string`；`installed: boolean`；`enabled: boolean`；`loading?: boolean`；`error?: unknown`；`metadata?: Record<string, unknown>`                                                                                                                           |
| `ChatMcpToolInfo`          | `id: string`；`name: string`；`description?: string`；`enabled: boolean`                                                                                                                                                                                                                                                                     |
| `ChatMcpToolState`         | `Partial<Record<string, readonly ChatMcpToolInfo[]>>`，键为 MCP 服务 ID。                                                                                                                                                                                                                                                                    |
| `ChatProviderConfig`       | `type: 'openai' \| 'deepseek' \| 'qwen'`；`label?: string`；`apiUrl?: string`；`apiKey?: string`；`headers?: Record<string, string>`；`timeout?: number`；`models: ChatProviderModelConfig[]`                                                                                                                                                |
| `ChatProviderType`         | `'openai' \| 'deepseek' \| 'qwen'`                                                                                                                                                                                                                                                                                                           |
| `ChatProviderModelConfig`  | 继承 `ChatModelOption`，不含 `metadata`；`featureBody?: Partial<Record<'thinking' \| 'search', ChatProviderFeatureBody>>`；`effortParam?: string`                                                                                                                                                                                            |
| `ChatProviderFeatureBody`  | `enabled?: Record<string, unknown>`；`disabled?: Record<string, unknown>`                                                                                                                                                                                                                                                                    |
| `ChatBuiltInModelFeature`  | `'thinking' \| 'search'`                                                                                                                                                                                                                                                                                                                     |
| `ChatIcon`                 | `ModelSelectorOption['icon']`                                                                                                                                                                                                                                                                                                                |
| `ChatMcpServerConfig`      | `id: string`；`name: string`；`baseUrl: string`；`installed?: boolean`（默认 `false`）；`description?: string`；`icon?: string`；`headers?: Record<string, string>`；`timeout?: number`；`validate?: (serverId: string) => void`                                                                                                             |
| `ChatMcpServers`           | `readonly ChatMcpServerConfig[]`                                                                                                                                                                                                                                                                                                             |
| `UseChatRuntimeMcpAdapter` | `runtime: ChatMcpRuntime`；`listTools`；`callTool`。后两项来自 Chat 的 MCP Tool 插件协议。                                                                                                                                                                                                                                                   |

内建 `mcpServers` 适配器会把所有 MCP 服务的初始 `enabled` 设为 `false`。`installed: true` 会在初始化时加载工具定义，但 MCP 服务启用前这些工具仍为禁用状态。

#### 发送参数

| 类型                            | 定义                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatRunConfig`                 | `modelId?: string`；`features?: Partial<Record<'thinking' \| 'search', boolean>>`；`reasoning?: ChatRunConfigReasoning`；`mcp?: ChatMcpRunConfig`                                                                                                                                                                                                                               |
| `ChatRunConfigReasoning`        | `enabled: boolean`；`effort?: string`                                                                                                                                                                                                                                                                                                                                           |
| `ChatMcpRunConfig`              | `serverIds: readonly string[]`；`toolIds: Readonly<Record<string, readonly string[]>>`                                                                                                                                                                                                                                                                                          |
| `ChatBeforeSendContext`         | `payload: ChatSendPayload`；`runConfig?: ChatRunConfig`；`model?: ChatModelOption`；`mcp?: { servers: readonly ChatMcpServerInfo[]; tools: ChatMcpToolState }`                                                                                                                                                                                                                  |
| `ChatBeforeSendResult`          | `'continue' \| 'handled' \| 'reject'`                                                                                                                                                                                                                                                                                                                                           |
| `ChatBeforeSend`                | `(context: ChatBeforeSendContext) => 'continue' \| 'handled' \| 'reject' \| Promise<'continue' \| 'handled' \| 'reject'>`                                                                                                                                                                                                                                                       |
| `ChatRuntimeActionErrorPayload` | `action: 'send' \| 'abort' \| 'clear-active-conversation' \| 'create-conversation' \| 'switch-conversation' \| 'rename-conversation' \| 'delete-conversation' \| 'select-model' \| 'set-model-feature' \| 'set-model-reasoning-effort' \| 'add-mcp-server' \| 'remove-mcp-server' \| 'set-mcp-server-enabled' \| 'set-mcp-tool-enabled'`；`payload?: unknown`；`error: unknown` |

#### 函数配置类型

| 类型                                    | 定义                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `UseChatRuntimeOptions`                 | `conversation?: Omit<UseConversationOptions, 'useMessageOptions'> & { useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']> }`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`composer?: Pick<ChatComposerRuntime, 'disabled' \| 'submitDisabled'>`；`modelProviders?: readonly ChatProviderConfig[]`；`mcp?: UseChatRuntimeMcpAdapter`；`mcpServers?: ChatMcpServers` |
| `UseChatRuntimeFromConversationOptions` | `conversation: UseConversationReturn`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`send?: (payload: ChatSendPayload & { conversationId: string \| null; runConfig?: ChatRunConfig }) => void \| Promise<void>`；`composer?: ChatComposerRuntime`                                                                                                                                        |
| `UseChatRuntimeAdapterOptions`          | `runtime: MaybeRefOrGetter<ChatRuntime>`；`title?: MaybeRefOrGetter<string \| undefined>`；`historyData?: MaybeRefOrGetter<ChatHistoryData \| undefined>`；`onActionError(payload)`                                                                                                                                                                                                                                      |
| `UseChatHistoryItemsOptions`            | `conversations: MaybeRefOrGetter<readonly ChatConversationInfo[] \| undefined>`；`defaultTitle: MaybeRefOrGetter<string>`                                                                                                                                                                                                                                                                                                |
| `UseChatHistoryDataOptions`             | 继承 `UseChatHistoryItemsOptions`；`history?: MaybeRefOrGetter<ChatHistoryData \| undefined>`                                                                                                                                                                                                                                                                                                                            |
| `ChatHistoryItem`                       | 继承 `ChatConversationInfo`；`raw: ChatConversationInfo`                                                                                                                                                                                                                                                                                                                                                                 |
| `ChatHistoryDisplayData`                | `ChatHistoryItem[] \| HistoryGroup<ChatHistoryItem>[]`                                                                                                                                                                                                                                                                                                                                                                   |
| `ChatHistoryData`                       | `readonly ChatConversationInfo[] \| readonly ChatHistoryGroup[]`                                                                                                                                                                                                                                                                                                                                                         |
| `ChatUIData`                            | `TrChatUI` 的会话、消息、输入区、请求、模型和 MCP 显示数据；详见 [Chat API](./chat#chatuidata)。                                                                                                                                                                                                                                                                                                                         |

`UseConversationOptions`、`UseConversationReturn`、`UseMessageOptions` 和 `UseMessagePlugin` 来自 `@opentiny/tiny-robot-kit`；`ComputedRef`、`MaybeRefOrGetter` 和 `ShallowRef` 来自 Vue；`ModelSelectorReasoningEffortOption`、`HistoryGroup` 和 `ChatIcon` 的底层图标类型来自 `@opentiny/tiny-robot`。这些外部类型请参阅各自的 API。

## 常见问题

### `runtime.actions.send()` 返回 `false`

检查以下条件：

- 默认发送的文本去除首尾空格后为空；自定义 `useChatRuntimeFromConversation({ send })` 可以接收空文本。
- 输入区的 `disabled` 或外部 `submitDisabled` 为 `true`。
- 默认发送没有可用的已选模型。
- 已启用的 MCP 服务还未加载完工具。
- 当前会话暂时不能开始新请求。
- 发送前检查未通过，或检查期间切换了当前会话。

### 模型配置与自定义请求冲突

使用内置请求时，在 `modelProviders` 中配置至少一个模型，不再提供 `responseProvider`。使用自定义请求时，提供 `conversation.useMessageOptions.responseProvider`，并省略 `modelProviders` 或传入空数组。

仅把每项中的 `models` 设为空数组，并不等于省略 `modelProviders`，仍会触发冲突检查；未提供自定义请求时，则会因缺少模型而报错。

### MCP 服务无法连接

确认服务地址正确，并允许浏览器跨域访问（CORS）；也可以通过服务端代理转发请求。
