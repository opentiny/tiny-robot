---
outline: [1, 3]
---

# 数据与逻辑配置

本文介绍如何为 `TrChat` 配置模型服务、发送消息、取消请求、管理会话和接入 MCP 工具。

根据项目情况，选择以下一种接入方式：

- [`useChatRuntime`](#usechatruntime-配置)：推荐使用，配置模型服务和会话功能。
- [`useChatRuntimeFromConversation`](#usechatruntimefromconversation-配置)：项目已使用 TinyRobot Kit 管理会话时，将已有会话接入 `TrChat`，保留原有请求配置。

两种方式都会返回 `runtime`，其中包含聊天界面需要的数据和操作方法。通过 `<TrChat :runtime="runtime" />` 传入后，即可展示会话和消息，并支持发送、取消请求和切换会话。

> 首次接入见 [快速上手](./quick-start)；复用已有会话、自定义模型请求或发送流程见 [高级用法](#高级用法)。

## 模型服务

通过 `modelProviders` 配置模型服务地址和可选模型。`TrChat` 使用这些配置发送请求，并在输入区提供模型选择。

### 基本配置

`modelProviders` 是传给 `useChatRuntime` 的配置数组，每项配置一个服务，通过 `models` 列出该服务下的模型。

| 字段             | 用途                                                                  | 必填 | 默认值或未配置行为                     |
| ---------------- | --------------------------------------------------------------------- | ---- | -------------------------------------- |
| `type`           | 选择服务的默认地址和请求参数，可选 `'openai'`、`'deepseek'`、`'qwen'` | 是   | 无默认值                               |
| `apiUrl`         | 服务的完整 URL，可填写服务根地址或 `/chat/completions` 地址           | 否   | 使用对应服务的预设地址                 |
| `models`         | 该服务下的模型配置数组                                                | 是   | 无默认值；内置请求需要至少一个可用模型 |
| `models[].id`    | 服务支持的模型 ID，所有服务配置中的模型 ID 不可重复                   | 是   | 无默认值                               |
| `models[].label` | 模型在界面中显示的名称                                                | 是   | 无默认值                               |

`type` 不是模型 ID。兼容 OpenAI `/chat/completions` 接口的服务可使用 `'openai'`。省略 `apiUrl` 时，使用以下预设地址；通过项目服务端转发请求时，应填写转发服务的地址。

| `type`       | 预设服务地址                                                         |
| ------------ | -------------------------------------------------------------------- |
| `'openai'`   | `https://api.openai.com/v1`                                          |
| `'deepseek'` | `https://api.deepseek.com/chat/completions`                          |
| `'qwen'`     | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` |

例如，配置一个兼容 OpenAI 接口的服务：

```ts
import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    apiUrl: 'https://your-service.example.com/v1',
    models: [{ id: 'your-model-id', label: '项目助手' }],
  },
]
```

::: info 示例配置
示例地址不能直接使用，`models[].id` 中的 `'your-model-id'` 也是占位值，请替换为实际服务地址和模型 ID。接入组件的方式见 [快速上手](./quick-start)。
:::

配置多个模型时，默认选择第一个未禁用的模型。

### 模型功能

在 `models[].features` 中配置 `switch` 或 `select` 字段，输入区模型选择器会显示对应控件。下面的示例让 DeepSeek 和阿里云百炼 Qwen3.7 共用同一个 `reasoning` 字段，只为 Qwen3.7 增加联网开关。

```ts
import type { ModelSelectorField } from '@opentiny/tiny-robot'
import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const reasoning: ModelSelectorField = {
  key: 'reasoning',
  label: '思考强度',
  type: 'select',
  defaultValue: 'off',
  options: [
    { value: 'off', label: '关闭' },
    { value: 'low', label: '低' },
    { value: 'high', label: '高' },
    { value: 'max', label: '最高' },
  ],
}

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'deepseek',
    models: [{ id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', features: [reasoning] }],
  },
  {
    type: 'qwen',
    models: [
      {
        id: 'qwen3.7-flash',
        label: 'Qwen3.7 Flash',
        features: [reasoning, { key: 'search', label: '联网搜索', type: 'switch' }],
      },
    ],
  },
]
```

将配置传给 `useChatRuntime({ modelProviders })`。如果请求经项目后端转发，请分别为两个服务填写 `apiUrl`。先将 DeepSeek 的思考强度设为「高」，再切换到 Qwen3.7。Qwen3.7 会沿用「高」，还可以开启联网搜索。发送消息时，两种模型使用的参数如下。

| 模型 | 功能请求参数 |
| --- | --- |
| DeepSeek V4 Pro | `{ thinking: { type: 'enabled' }, reasoning_effort: 'high' }` |
| Qwen3.7 Flash | `{ enable_thinking: true, thinking_budget: 8192, enable_search: true }` |

预设已完成上述转换。Qwen3.5 至 Qwen3.7 的 Flash、Plus 和 Max 型号使用思考预算，`low` 为 1024 Token，`high` 为 8192 Token，`max` 使用模型默认的最大预算。支持 `reasoning_effort` 的 Qwen3.8 型号（包括 Omni Flash）使用强度参数。其他 Qwen 型号由项目按需提供强度映射。[DeepSeek 思考模式](https://api-docs.deepseek.com/guides/thinking_mode/)，[百炼 Chat Completions API](https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions/)

OpenAI 预设将思考强度映射到 `reasoning_effort`。GPT-5.4 和 GPT-5.5 的 `off`、`on` 分别映射到 `none`、`medium`。其他 OpenAI 兼容模型可使用服务接受的档位值，或自定义映射。[ModelSelector 字段配置](../components/model-selector#模型特性字段)

如果项目需要调整某个模型的请求参数，可以在调用 `useChatRuntime` 前为该模型配置 `mapFeatureValues(featureValues)`。例如，将 Qwen3.7 Flash 的「高」改成 4096 Token。

```ts
const qwenFlash = modelProviders[1].models[0]
const thinkingBudgets = { low: 1024, high: 4096 }

qwenFlash.mapFeatureValues = ({ reasoning, search }) => ({
  ...(reasoning !== undefined ? { enable_thinking: reasoning !== 'off' } : {}),
  ...(reasoning === 'low' || reasoning === 'high' ? { thinking_budget: thinkingBudgets[reasoning] } : {}),
  ...(search !== undefined ? { enable_search: search } : {}),
})
```

自定义函数只接收当前模型声明且有效的功能值。它会替换整个预设映射，因此需要返回这个模型所需的全部功能参数。

切换模型时，Runtime 会沿用相同 `key` 的设置值，前提是新模型支持该值。如果该值不可用，Runtime 会按新模型的规则选出并保存替代值。读取 `featureValues` 时，只会看到当前模型能使用的设置。

```ts
const model = runtime.composer.model!
await model.setFeatureValue?.({ modelId: 'your-model-id', key: 'search', value: true })
console.log(model.featureValues?.value)
```

调用时传入目标模型 ID（`modelId`）和设置项名称（`key`）。如果更新是异步的，使用同一 `key` 的控件会暂时禁用。更新失败时，`TrChat` 会触发 `runtime-action-error`。应用自定义的快捷按钮也可以调用 `setFeatureValue`。

发送消息时，Runtime 会记录这次使用的模型 ID 和设置值，并随用户消息保存。如果应用重新提交带有原始元数据的消息，Runtime 会根据原记录生成请求。通过输入框发送新消息时，使用选择器里的当前设置。

### 历史消息迁移

读取历史消息时，Runtime 会按原模型的设置定义，将旧格式的 `features` 和 `reasoning` 转为 `featureValues`。原来的思考强度仍可用时会沿用。旧记录只开启思考、未指定强度时，优先使用可用的 `on` 选项，采用思考预算的 Qwen 型号也可以使用 `max` 保留服务默认预算。否则，优先使用模型的默认开启档位，再尝试第一个可用的开启档位。

原强度失效或关闭选项被移除时，使用当前有效的默认值。找不到原模型的定义时，仍会保留记录里的模型 ID 和 MCP 设置。通过内置服务重新发出请求时，原模型必须可用。

### 其他配置

以下字段均为可选，按需设置。

服务配置，与 `models` 同级：

| 字段      | 用途                                                           | 默认值或未配置行为                                   |
| --------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| `label`   | 服务的显示名称；`models[].label` 则是单个模型的显示名称        | 根据 `type` 使用 `OpenAI`、`DeepSeek` 或 `DashScope` |
| `timeout` | 请求开始到回答接收结束的超时时间，单位为毫秒                   | 不额外设置超时计时器                                 |
| `apiKey`  | 通过 `Authorization: Bearer ...` 请求头提供服务认证            | 不添加认证头，除非通过 `headers` 提供                |
| `headers` | 添加请求头，如业务标识；其中的 `Authorization` 优先于 `apiKey` | 不添加额外请求头                                     |

::: warning 密钥安全
生产环境应由服务端保管模型密钥并转发请求，不要将长期密钥写入前端代码。
:::

以下字段均为可选，放在 `models` 数组中的对应模型上：

| 字段                        | 用途                                 | 默认值或未配置行为                     |
| --------------------------- | ------------------------------------ | -------------------------------------- |
| `models[].disabled`         | 设为 `true` 时禁止选择该模型         | `false`，允许选择                      |
| `models[].features`           | 声明模型支持的开关和选择字段         | 未声明字段不显示，也不会发送对应参数   |
| `models[].mapFeatureValues` | 将有效字段值转换为 Provider 请求参数 | 使用服务预设映射；自定义字段需自行映射 |

`mapFeatureValues` 只接收当前模型声明且有效的字段值。字段值不会直接展开到请求体，思考关闭时由转换函数决定是否省略强度参数。

使用项目自己的请求方法时，不要同时配置 `modelProviders`，见 [自定义模型请求](#自定义模型请求)。

## 常用操作

`TrChat` 已提供发送、取消、会话切换和模型选择操作。需要通过其他按钮或业务逻辑触发这些操作时，可调用以下方法。代码中的 `runtime` 是 `useChatRuntime` 返回的对象，各操作按需使用。

### 发送与取消

通过外部按钮或业务逻辑发送消息，并在回答生成过程中停止请求。

<demo
  vue="../../demos/chat/runtime-actions.vue"
  :vueFiles="[
    '../../demos/chat/runtime-actions.vue',
    '../../demos/chat/shared/modelProviders.ts',
    '../../demos/chat/shared/runtime-demo.css'
  ]"
  title="通过外部按钮发送与取消"
  description="点击外部按钮发送预设问题，在回答生成过程中停止请求。"
/>

`runtime.actions.send()` 用于发送一条消息，`text` 是必填的文本字段。发送完成或发送前检查返回 `'handled'`（项目已自行处理）时返回 `true`；未发送时返回 `false`；失败时抛出错误。直接调用时需处理异常：

```ts
try {
  const sent = await runtime.actions.send({ text: '介绍一下这个项目' })
  if (!sent) console.info('本次消息未发送')
} catch (error) {
  console.error('消息发送失败', error)
}
```

返回 `false` 的情况见 [常见问题](#runtime-actions-send-false)。

当前会话处于 `processing` 时，`TrChat` 会显示停止按钮；处于 `paused`（等待工具确认）时，仅在 Runtime 提供 `actions.abort` 时显示。点击停止按钮调用 `runtime.actions.abort?.()`。也可通过业务代码中止当前回合：

```ts
await runtime.actions.abort?.()
```

### 发送前检查

发送前检查登录状态、权限或输入内容，按检查结果决定是否继续发送。

<demo
  vue="../../demos/chat/runtime-before-send.vue"
  :vueFiles="[
    '../../demos/chat/runtime-before-send.vue',
    '../../demos/chat/shared/modelProviders.ts',
    '../../demos/chat/shared/runtime-demo.css'
  ]"
  title="发送前检查登录状态"
  description="切换“已登录”开关，比较阻止发送与正常发送；不执行真实登录。"
/>

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

### 禁用输入与提交

根据业务状态禁用整个输入区，或仅禁止提交并保留编辑能力。

<demo
  vue="../../demos/chat/runtime-composer.vue"
  :vueFiles="[
    '../../demos/chat/runtime-composer.vue',
    '../../demos/chat/shared/modelProviders.ts',
    '../../demos/chat/shared/runtime-demo.css'
  ]"
  title="禁用输入区与仅禁用提交"
  description="点击“填入预设问题”，切换禁用状态，比较输入编辑和发送按钮的变化。"
/>

通过 `useChatRuntime` 的 `composer` 配置输入区是否可用。以下字段均为可选，可随业务状态更新：

| 字段                      | 用途                         | 类型                                           | 未配置行为       |
| ------------------------- | ---------------------------- | ---------------------------------------------- | ---------------- |
| `composer.disabled`       | 禁用整个输入区               | [`ChatReadable<boolean>`](#runtime-与状态类型) | 不额外禁用输入区 |
| `composer.submitDisabled` | 只禁止提交，输入内容仍可编辑 | [`ChatReadable<boolean>`](#runtime-与状态类型) | 不额外限制提交   |

例如，禁用整个输入区：

```ts
import { shallowRef } from 'vue'

const inputDisabled = shallowRef(true)
const runtime = useChatRuntime({
  modelProviders,
  composer: { disabled: inputDisabled },
})
```

请求进行中或工具加载中时，组件仍会根据状态限制提交。

### 请求失败时的提示

使用 `useChatRuntime` 接入时，`TrChat` 默认在消息中显示请求失败提示，界面配置和效果见 [消息错误提示配置](./chat#消息错误提示配置)。需要记录日志或显示操作失败通知时，监听 `runtime-action-error`：

```vue
<TrChat :runtime="runtime" @runtime-action-error="handleRuntimeError" />
```

`handleRuntimeError` 是项目中记录日志或显示通知的处理函数，事件参数见 [TrChat 事件](./chat#trchat-events)。错误记录的可选配置见 [错误记录配置](#错误记录配置)。直接调用 `runtime.actions.send()` 时，参考 [发送与取消](#发送与取消) 中的异常处理示例。

### 会话管理

通过内置历史列表切换、重命名和删除会话，并按需创建新会话。

<demo
  vue="../../demos/chat/runtime-conversations.vue"
  :vueFiles="[
    '../../demos/chat/runtime-conversations.vue',
    '../../demos/chat/shared/modelProviders.ts',
    '../../demos/chat/shared/mockConversationStorage.ts',
    '../../demos/chat/shared/runtime-demo.css'
  ]"
  title="使用内置历史列表管理会话"
  description="在历史列表中切换、重命名和删除会话，对比两种新建方式。会话保存在浏览器中，刷新后保留。"
/>

开始新会话有两种方式：`clearActiveConversation()` 返回新会话页面，默认在发送首条非空消息时创建会话；`createConversation()` 则立即创建并选中会话。

返回新会话页面：

```ts
await runtime.actions.clearActiveConversation()
```

立即创建并选中一个会话：

```ts
await runtime.actions.createConversation({ title: '项目问答' })
```

> `clearActiveConversation()` 不会删除会话或停止当前请求。需要停止当前请求时，先调用 `abort()`。

切换、重命名或删除已有会话时，传入该会话的 ID。下面三种操作独立使用，其中 `conversationId` 替换为实际 ID：

```ts
await runtime.actions.switchConversation(conversationId)
await runtime.actions.renameConversation(conversationId, '新的会话标题')
await runtime.actions.deleteConversation(conversationId)
```

新建会话未指定 `title` 时，界面显示 `'新对话'`。默认发送自动创建会话时，标题取首条消息去除首尾空格后的前 20 个字符；通过 `useChatRuntime` 的 `titleGenerator` 可自定义：

```ts
const runtime = useChatRuntime({
  modelProviders,
  titleGenerator: (text) => text.trim().slice(0, 10) || '新对话',
})
```

### 接入 MCP 工具

MCP 用于连接外部工具服务，让模型调用工具，例如查询项目资料。需要使用工具时，再配置此项。

通过 `useChatRuntime` 的 `mcpServers` 数组配置工具服务。服务需支持 Streamable HTTP 连接方式，并能从浏览器访问；未配置时不连接工具服务。

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
    },
  ],
})
```

将 `baseUrl` 替换为实际工具服务地址。`installed` 决定服务的初始状态：

| 设置            | 界面与使用效果                                             |
| --------------- | ---------------------------------------------------------- |
| `false`（默认） | 显示在可安装列表；点击安装后加载并启用工具                 |
| `true`          | 显示为已安装并在初始化时加载工具；仍需在界面启用后才能使用 |

> 已启用服务的工具仍在加载时，会暂时禁止发送消息。

复用已有工具连接时，可使用自定义 `mcp`，与 `mcpServers` 二选一，字段见 [`useChatRuntime` 配置](#usechatruntime-配置)。生产环境的凭证和权限应由服务端管理，服务需允许浏览器访问或通过服务端代理连接。

## 高级用法

通常使用 `useChatRuntime` 配置聊天功能。需要复用已有会话、自定义模型请求或发送流程时，参考以下用法。单独使用 `TrChatUI` 的接入方式见本节最后一部分。

### 复用已有会话

项目已通过 `@opentiny/tiny-robot-kit` 的 `useConversation` 管理会话时，可将已有的 `conversation` 传给 `useChatRuntimeFromConversation`，再把返回的 `runtime` 传给 `TrChat`。请求方法和插件继续在 `useConversation` 中配置：

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'
import { useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: { responseProvider: myResponseProvider },
})

const runtime = useChatRuntimeFromConversation({ conversation })
```

`myResponseProvider` 是项目已有的请求方法，其参数和返回格式见 [ResponseProvider](../tools/message#responseprovider)。

> `useChatRuntimeFromConversation` 不会自动安装错误记录插件，配置方式见 [错误记录配置](#错误记录配置)。

### 自定义模型请求

需要使用项目自己的请求方法时，通过 `useChatRuntime` 的 `conversation.useMessageOptions.responseProvider` 配置。会话创建和消息更新仍由 Kit 处理，无需自定义整个发送流程：

```ts
const runtime = useChatRuntime({
  conversation: {
    useMessageOptions: { responseProvider: myResponseProvider },
  },
})
```

`myResponseProvider` 接收请求内容和取消信号，返回完整或流式响应，格式见 [ResponseProvider](../tools/message#responseprovider)。使用此方式时，不要同时配置 `modelProviders`，具体限制见 [常见问题](#模型配置与自定义请求冲突)。

### 自定义发送流程

需要自行处理会话创建、消息保存和请求时，可自定义发送流程。

<demo
  vue="../../demos/chat/runtime-send.vue"
  :vueFiles="['../../demos/chat/runtime-send.vue']"
  title="默认发送与自定义发送"
  description="比较两种发送方式对空文本的处理。示例仅展示这一差异，不包含实际请求和消息保存。"
/>

通过 `useChatRuntimeFromConversation` 的 `send` 替换默认发送方法。默认发送不接受空文本，自定义发送可以处理空文本；未设置 `send` 时使用已有 Kit 会话发送。仅替换模型请求时，使用上一节的 `responseProvider` 即可：

```ts
const runtime = useChatRuntimeFromConversation({
  conversation,
  send: async ({ text, conversationId }) => {
    await sendMessage({ text, conversationId })
  },
})
```

`conversation` 是已有的 Kit 会话实例，`sendMessage` 是项目自己的发送方法，需要负责创建或选择会话、更新和保存消息、执行请求；失败时抛出错误，供调用方处理。`text` 是提交内容，`conversationId` 是当前会话 ID，未选择会话时为 `null`。

> 组件不会在调用自定义 `send` 前自动创建会话；未选择会话时，需由回调自行创建或选择会话。

自定义发送的参数见 [`useChatRuntimeFromConversation` 配置](#usechatruntimefromconversation-配置)。

### 在 TrChatUI 中复用 Runtime

单独使用 `TrChatUI` 时，可复用已有 `runtime`，连接消息展示、发送和会话操作。

<demo
  vue="../../demos/chat/runtime-adapter.vue"
  :vueFiles="['../../demos/chat/runtime-adapter.vue']"
  title="在 TrChatUI 中复用 Runtime"
  description="展示输入、发送及会话切换、重命名、删除的绑定方式。"
/>

`TrChat` 已自动绑定聊天数据和操作，通常无需使用此方法。单独使用 `TrChatUI`，并希望复用已有 `runtime` 时，可通过 `useChatRuntimeAdapter` 获取显示数据和操作方法。

`runtime` 和 `onActionError` 均为必填项。操作失败时，适配器调用 `onActionError`，不再继续抛出原操作错误；回调可通过 `action` 和 `error` 获取操作名称和错误详情：

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

完整返回值见 [`useChatRuntimeAdapter`](#usechatruntimeadapter)。不使用 `runtime`、直接传入项目数据的用法，见 [仅使用界面组件](./chat#仅使用界面组件)。

## API

### 公开函数

| 函数                             | 签名                                                                                                         | 说明                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `useChatRuntime`                 | `useChatRuntime(options: UseChatRuntimeOptions): ChatRuntime`                                                | 创建会话，并配置默认的请求和错误处理。                                                 |
| `useChatRuntimeFromConversation` | `useChatRuntimeFromConversation(options: UseChatRuntimeFromConversationOptions): ChatRuntime`                | 将已有 Kit 会话连接到聊天组件。                                                        |
| `useChatRuntimeAdapter`          | `useChatRuntimeAdapter(options: UseChatRuntimeAdapterOptions)`                                               | 提供 `TrChatUI` 所需的数据、输入内容和操作方法，见[返回字段](#usechatruntimeadapter)。 |
| `useChatHistoryItems`            | `useChatHistoryItems(options: UseChatHistoryItemsOptions): Readonly<ShallowRef<readonly ChatHistoryItem[]>>` | 整理未分组的会话列表。                                                                 |
| `useChatHistoryData`             | `useChatHistoryData(options: UseChatHistoryDataOptions): Readonly<ShallowRef<ChatHistoryDisplayData>>`       | 整理未分组或已分组的会话列表。                                                         |
| `errorStatePlugin`               | `errorStatePlugin(options?: ErrorStatePluginOptions): UseMessagePlugin`                                      | 把请求错误写入所属 assistant 消息。                                                    |

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

| 字段             | 用途                                         | 类型                                                                                                           | 必填 | 默认值或未配置行为                                                                                                 |
| ---------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------ |
| `conversation`   | 提供已有 Kit 会话实例                        | `UseConversationReturn`                                                                                        | 是   | 无默认值                                                                                                           |
| `titleGenerator` | 生成默认发送自动创建的会话标题               | `(text: string) => string`                                                                                     | 否   | 与 `useChatRuntime` 相同                                                                                           |
| `beforeSend`     | 发送前检查                                   | `ChatBeforeSend`                                                                                               | 否   | 不执行自定义检查                                                                                                   |
| `send`           | 自行处理会话创建、消息保存和请求，允许空文本 | `(payload: KitRuntimeSendPayload) => boolean \| void \| Promise<boolean \| void>`；仅严格返回 `false` 表示拒绝 | 否   | 使用已有 Kit 会话执行默认发送                                                                                      |
| `composer`       | 提供输入区状态、模型和 MCP 操作              | `ChatComposerRuntime`                                                                                          | 否   | `{}`；默认发送会根据模型、工具和 Engine 状态限制提交；自定义 `send` 仅受输入区禁用状态及显式 `submitDisabled` 限制 |

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

`ChatModelRuntime` 通过 `options`、`selectedId` 和 `featureValues` 提供当前模型的只读状态。自定义 Runtime 可提供 `renderTriggerText({ model, featureValues })` 设置触发器文本。

| 操作                                         | 返回值                  | 说明                                                                            |
| -------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `select(id)`                                 | `void \| Promise<void>` | 选择 ID 或用 `null` 清空选择；切换时按该模型的功能定义解析共享偏好。ID 未知或模型已禁用时抛错。 |
| `setFeatureValue?.({ modelId, key, value })` | `void \| Promise<void>` | 按指定模型校验并更新设置。若当前模型会把新值回退为其他值，内置 Runtime 会抛错。 |

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
| `setModelFeatureValue`    | `(change: ChatModelFeatureValueUpdate) => Promise<void>`                | 按模型和字段更新配置并处理等待状态与错误。             |
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

| 类型                  | 类别        | 说明                                                 |
| --------------------- | ----------- | ---------------------------------------------------- |
| `ChatReadable<T>`     | `interface` | 只读 `{ readonly value: T }` 结构。                  |
| `ChatWritable<T>`     | `interface` | 可写 `{ value: T }` 结构，通过 `.value` 读取或更新。 |
| `ChatRuntime`         | `interface` | 包含会话状态、输入区状态和 `ChatRuntimeActions`。    |
| `ChatRuntimeActions`  | `interface` | Runtime 的发送、取消和会话操作。                     |
| `ChatComposerRuntime` | `interface` | 输入区禁用状态及模型、MCP 工具的状态与方法。         |
| `ChatModelRuntime`    | `interface` | 模型列表、选择、字段值和字段更新操作。               |
| `ChatMcpRuntime`      | `interface` | MCP 服务、工具的只读状态与安装、启用操作。           |

#### 会话、消息与发送

| 类型                     | 定义                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatConversationInfo`   | `id: string`；`title: string`；`createdAt?: number`；`updatedAt?: number`；`metadata?: Record<string, unknown>`；可添加项目所需的额外字段，字段值类型为 `unknown`。                                                                                                                                                                                        |
| `ChatConversation`       | 包含 `ChatConversationInfo` 的全部字段，另有消息列表 `messages: readonly ChatMessageItem[]`、请求状态 `requestState: ChatRequestState` 和处理状态 `processingState?: ChatProcessingState`。                                                                                                                                                                |
| `ChatMessageItem`        | `role?: string`；`content?: string \| ChatMessagePart[]`；`reasoning_content?: string`；`tool_calls?: ChatToolCall[]`；`tool_call_id?: string`；`name?: string`；`id?: string`；`renderKey?: string`；`streamState?: 'streaming' \| 'finished' \| 'unknown'`；`loading?: boolean`；`state?: Record<string, unknown>`；`metadata?: Record<string, unknown>` |
| `ChatMessageContent`     | `string \| ChatMessagePart[]`                                                                                                                                                                                                                                                                                                                              |
| `ChatMessagePart`        | 消息内容的一部分；`type: string` 标识内容种类，其他字段按该种类提供，字段值类型为 `unknown`。                                                                                                                                                                                                                                                              |
| `ChatStructuredDataItem` | 提交的结构化数据项；`type: string` 标识数据种类，其他字段按该种类提供，字段值类型为 `unknown`。                                                                                                                                                                                                                                                            |
| `ChatStructuredData`     | `ChatStructuredDataItem[]`                                                                                                                                                                                                                                                                                                                                 |
| `ChatToolCall`           | `id: string`；`type: 'function' \| string`；`function: { name: string; arguments: string }`                                                                                                                                                                                                                                                                |
| `ChatSendPayload`        | `text: string`；`structuredData?: ChatStructuredData`；`externalPayloads?: SenderExternalPayload[]`。默认 Kit Runtime 将外部 payload 保留在用户消息的 `externalPayloads` 字段，供消息持久化和 ResponseProvider 使用。                                                                                                                                      |
| `ChatRequestState`       | `'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'`                                                                                                                                                                                                                                                                                |
| `ChatProcessingState`    | `'requesting' \| 'completing' \| string`                                                                                                                                                                                                                                                                                                                   |

消息对象和服务端 ID 都可能变化时，请提供稳定的 `renderKey`。显式 `streamState` 优先；自动流状态仅在请求起点可识别且确认新增助手消息属于当前请求时标记为 `streaming`。请求进行中无法确定归属时为 `unknown`，`loading` 不决定流状态。暂停期间保留本轮身份，结束或切换会话后清理；中途挂载且无法重建归属时使用 `unknown`。自定义渲染器的接入见 [Renderer 上下文](./chat#自定义-renderer-上下文)。

#### 模型与 MCP

| 类型                       | 定义                                                                                                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatModelOption`          | `id: string`；`label: string`；`description?: string`；`icon?: ChatIcon`；`disabled?: boolean`；`group?: string`；`features?: readonly ModelSelectorField[]`；`metadata?: Record<string, unknown>`                                 |
| `ChatMcpServerInfo`        | `id: string`；`name: string`；`description?: string`；`icon?: string`；`category?: string`；`installed: boolean`；`enabled: boolean`；`loading?: boolean`；`error?: unknown`；`metadata?: Record<string, unknown>`               |
| `ChatMcpToolInfo`          | `id: string`；`name: string`；`description?: string`；`enabled: boolean`                                                                                                                                                         |
| `ChatMcpToolState`         | `Partial<Record<string, readonly ChatMcpToolInfo[]>>`，键为 MCP 服务 ID。                                                                                                                                                        |
| `ChatProviderConfig`       | `type: 'openai' \| 'deepseek' \| 'qwen'`；`label?: string`；`apiUrl?: string`；`apiKey?: string`；`headers?: Record<string, string>`；`timeout?: number`；`models: ChatProviderModelConfig[]`                                    |
| `ChatProviderType`         | `'openai' \| 'deepseek' \| 'qwen'`                                                                                                                                                                                               |
| `ChatProviderModelConfig`  | 支持 `ChatModelOption` 中除 `metadata` 外的字段，另有 `mapFeatureValues?: (values: ModelSelectorFeatureValues) => Record<string, unknown>`。                                                                                     |
| `ChatIcon`                 | `ModelSelectorOption['icon']`                                                                                                                                                                                                    |
| `ChatMcpServerConfig`      | `id: string`；`name: string`；`baseUrl: string`；`installed?: boolean`（默认 `false`）；`description?: string`；`icon?: string`；`headers?: Record<string, string>`；`timeout?: number`；`validate?: (serverId: string) => void` |
| `ChatMcpServers`           | `readonly ChatMcpServerConfig[]`                                                                                                                                                                                                 |
| `UseChatRuntimeMcpAdapter` | `runtime` 提供 MCP 状态与操作，`listTools` 获取本次请求使用的工具定义，`callTool` 调用指定服务中的工具；参数和返回值见下表。                                                                                                     |

`UseChatRuntimeMcpAdapter` 的三个字段均为必填：

| 字段        | 类型或参数                                                                             | 用途与返回值                                                                       |
| ----------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `runtime`   | `ChatMcpRuntime`                                                                       | 提供 MCP 服务、工具的状态与操作方法。                                              |
| `listTools` | `(serverIds: readonly string[], toolIds: Readonly<Record<string, readonly string[]>>)` | 根据服务 ID 和每个服务选中的工具 ID 获取工具定义，返回工具定义只读数组的 Promise。 |
| `callTool`  | `(serverId: string, toolName: string, args: Record<string, unknown>)`                  | 使用服务 ID、工具原始名称和调用参数执行工具，返回 `Promise<unknown>`。             |

`listTools` 返回的每项包含 `serverId: string`、`id: string`、`name: string`、`originalName: string`，以及可选的 `description?: string`、`inputSchema?: Record<string, unknown>`。`name` 是提供给模型的工具名称，`originalName` 是服务中的原始名称。

内建 `mcpServers` 适配器会把所有 MCP 服务的初始 `enabled` 设为 `false`。`installed: true` 会在初始化时加载工具定义，但 MCP 服务启用前这些工具仍为禁用状态。

#### 发送参数

| 类型                            | 定义                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatRunConfig`                 | `modelId?: string`；`featureValues?: ModelSelectorFeatureValues`；`mcp?: ChatMcpRunConfig`                                                                                                                                                                                                                                                            |
| `ChatMcpRunConfig`              | `serverIds: readonly string[]`；`toolIds: Readonly<Record<string, readonly string[]>>`                                                                                                                                                                                                                                                                |
| `ChatBeforeSendContext`         | `payload: ChatSendPayload`；`runConfig?: ChatRunConfig`；`model?: ChatModelOption`；`mcp?: { servers: readonly ChatMcpServerInfo[]; tools: ChatMcpToolState }`                                                                                                                                                                                        |
| `ChatBeforeSendResult`          | `'continue' \| 'handled' \| 'reject'`                                                                                                                                                                                                                                                                                                                 |
| `ChatBeforeSend`                | `(context: ChatBeforeSendContext) => 'continue' \| 'handled' \| 'reject' \| Promise<'continue' \| 'handled' \| 'reject'>`                                                                                                                                                                                                                             |
| `ChatRuntimeActionErrorPayload` | `action: 'send' \| 'abort' \| 'clear-active-conversation' \| 'create-conversation' \| 'switch-conversation' \| 'rename-conversation' \| 'delete-conversation' \| 'select-model' \| 'set-model-feature-value' \| 'add-mcp-server' \| 'remove-mcp-server' \| 'set-mcp-server-enabled' \| 'set-mcp-tool-enabled'`；`payload?: unknown`；`error: unknown` |

#### 函数配置类型

| 类型                                    | 定义                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `UseChatRuntimeOptions`                 | `conversation?: Omit<UseConversationOptions, 'useMessageOptions'> & { useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']> }`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`composer?: Pick<ChatComposerRuntime, 'disabled' \| 'submitDisabled'>`；`modelProviders?: readonly ChatProviderConfig[]`；`mcp?: UseChatRuntimeMcpAdapter`；`mcpServers?: ChatMcpServers` |
| `UseChatRuntimeFromConversationOptions` | `conversation: UseConversationReturn`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`send?: (payload: KitRuntimeSendPayload) => boolean \| void \| Promise<boolean \| void>`（仅严格返回 `false` 表示拒绝）；`composer?: ChatComposerRuntime`                                                                                                                                             |
| `KitRuntimeSendPayload`                 | `ChatSendPayload`，另有 `conversationId: string \| null` 和 `runConfig?: ChatRunConfig`。默认发送等待绑定会话的 `engine.send()` 完成后返回 `true`；直接调用 `runtime.actions.send` 时错误会 reject，Adapter 调用会发出 `runtime-action-error` 并按失败处理草稿。                                                                                                                                                         |
| `UseChatRuntimeAdapterOptions`          | `runtime: MaybeRefOrGetter<ChatRuntime>`；`title?: MaybeRefOrGetter<string \| undefined>`；`historyData?: MaybeRefOrGetter<ChatHistoryData \| undefined>`；`onActionError(payload)`                                                                                                                                                                                                                                      |
| `UseChatHistoryItemsOptions`            | `conversations: MaybeRefOrGetter<readonly ChatConversationInfo[] \| undefined>`；`defaultTitle: MaybeRefOrGetter<string>`                                                                                                                                                                                                                                                                                                |
| `UseChatHistoryDataOptions`             | 包含 `UseChatHistoryItemsOptions` 的 `conversations` 和 `defaultTitle`，另有 `history?: MaybeRefOrGetter<ChatHistoryData \| undefined>`，用于提供历史会话列表或分组。                                                                                                                                                                                                                                                    |
| `ChatHistoryItem`                       | 包含 `ChatConversationInfo` 的全部字段；`raw: ChatConversationInfo` 保存原始会话对象。                                                                                                                                                                                                                                                                                                                                   |
| `ChatHistoryDisplayData`                | `ChatHistoryItem[] \| HistoryGroup<ChatHistoryItem>[]`                                                                                                                                                                                                                                                                                                                                                                   |
| `ChatHistoryData`                       | `readonly ChatConversationInfo[] \| readonly ChatHistoryGroup[]`                                                                                                                                                                                                                                                                                                                                                         |
| `ChatUIData`                            | `TrChatUI` 的会话、消息、输入区、请求、模型和 MCP 显示数据；详见 [Chat API](./chat#chatuidata)。                                                                                                                                                                                                                                                                                                                         |

`UseConversationOptions`、`UseConversationReturn`、`UseMessageOptions` 和 `UseMessagePlugin` 来自 `@opentiny/tiny-robot-kit`；`ComputedRef`、`MaybeRefOrGetter` 和 `ShallowRef` 来自 Vue；`ModelSelectorField`、`ModelSelectorFeatureValues`、`HistoryGroup` 和 `ChatIcon` 的底层图标类型来自 `@opentiny/tiny-robot`。这些外部类型请参阅各自的 API。

## 常见问题

### `runtime.actions.send()` 返回 `false` {#runtime-actions-send-false}

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
