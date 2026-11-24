---
outline: [1, 3]
---

# Skill 技能接入

Skill 以 `SKILL.md` 的任务说明（`instructions`）为核心，也可以附带参考资料和模板等资源文件。目录只包含 Skill 的名称和描述，正文按需进入模型上下文，资源在需要具体文件时读取。

Kit 提供两条接入路径：新会话使用 `scope: 'session'`，由插件保存目录和加载结果；省略 `scope` 或使用 `scope: 'turn'` 保留按轮选择，由应用承载 instructions。Loader 和 Storage 为两条路径提供相同的 `SkillDefinition`。

## 会话级接入 {#skill-session}

会话流程要求模型支持工具调用，并注册 `toolPlugin`。目录是首次请求前建立的发现快照；加载某个 Skill 后，目录和加载工具继续保留。应用按业务会话保存和读取完整消息。

### 体验会话 Skill

保留默认选项，直接发送预填问题。本轮会有两次请求。第一次把 Skill 目录和问题交给模型，第二次带上 `load_skills` 返回的正文。演示使用固定的模拟模型，默认请求加载 `weather`。

<demo vue="../../demos/tools/skill/SessionSkillPlugin.vue" />

#### 比较两种 @ 指定

每次比较前点「新对话」，选中 `@weather`，再选择对应的「@ 指定方式」并发送。

| 方式                      | 在本轮请求中观察什么                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 直接加载正文（`preload`） | Kit 在首次请求前加载正文。展开「查看本轮模型请求」，可以看到追加的加载结果。展开「查看 Kit 消息」，可以看到正文结果存于原 User 的 metadata。 |
| 交给模型加载（`model`）   | 首次请求只附加 Skill 名称提示。第二次请求带有 `load_skills` 的 Tool 结果。                                                                   |

两种方式都只在对话里显示一条用户消息。手动选择 `@weather` 时，演示会把名称一并写入消息 metadata。只在输入框里键入 `@weather` 时，按普通文本发送。

#### 体验会话状态和资源读取

| 场景         | 操作                                                                              | 观察结果                                                                                 |
| ------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 对比正文去重 | 保持 `@weather` 和「直接加载正文」，选 `none` 连发两次，再切换到 `context` 发一次 | `none` 每次返回 `loaded` 和全文。历史里仍有相同正文时，`context` 返回 `already_loaded`。 |
| 保存并恢复   | 保持上一步的历史和 `context`，点「模拟保存并恢复」，再发一次                      | 演示用 JSON 重新创建会话，对话保留，重复加载仍返回 `already_loaded`。                    |
| 停用 Skill   | 取消勾选「weather 可用」，继续发送 `@weather`                                     | 新加载返回 `skill_unavailable`，历史仍保存之前的正文。                                   |
| 读取资源     | 勾选「weather 可用」，选择「由模型选择」，在输入框填入「读取参考文件」并发送      | 模拟模型先调用 `list_skill_files`，再调用 `read_skill_file`，助手回复中显示文件内容。    |

### 快速开始

下面是 Vue 应用异步初始化代码中的最小演示。mock provider 固定加载 weather，只验证消息和工具传递；接入真实模型时替换 `responseProvider`。

```typescript
import { createMemorySkillStorage, skillPlugin, toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'
import type { ChatMessage, ResponseProvider, SessionSkillLoadResult } from '@opentiny/tiny-robot-kit'

const storage = createMemorySkillStorage()
await storage.add({
  name: 'weather',
  description: '查询天气和出行建议。',
  instructions: '先确认城市，再整理天气和出行建议。',
})

function describeLoadResult(result: SessionSkillLoadResult) {
  const skill = result.skills[0]
  if (skill?.status === 'loaded') return '已收到 weather 正文。'
  if (skill?.status === 'already_loaded') return '已复用历史中的 weather 正文。'
  const code = skill?.status === 'failed' ? skill.error.code : result.error?.code
  return code ? `无法加载 weather（${code}）。` : '无法加载 weather。'
}

let loadCallId = 0
const responseProvider: ResponseProvider = async (body) => {
  const content = body.messages.at(-1)?.content
  // 本例把预加载或工具加载结果放在请求的最后一条消息里。
  const result = content?.startsWith('{"skills":') ? (JSON.parse(content) as SessionSkillLoadResult) : undefined
  return {
    id: 'skill-demo',
    object: 'chat.completion',
    created: 1,
    model: 'mock',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        delta: undefined,
        logprobs: null,
        finish_reason: result ? 'stop' : 'tool_calls',
        message: result
          ? { role: 'assistant', content: describeLoadResult(result) }
          : {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  index: 0,
                  id: `load-weather-${++loadCallId}`,
                  type: 'function',
                  function: { name: 'load_skills', arguments: '{"skillNames":["weather"]}' },
                },
              ],
            },
      },
    ],
  }
}

const openChat = (initialMessages: ChatMessage[] = []) =>
  useMessage({
    initialMessages,
    responseProvider,
    plugins: [
      toolPlugin({ getTools: () => [], callTool: () => 'Tool not found.' }),
      skillPlugin({
        scope: 'session',
        deduplication: 'none',
        getSkillCandidates: () => storage.list(),
        getSkillByName: (name) => storage.get(name),
      }),
    ],
  })

const chat = openChat()
await chat.sendMessage('杭州今天适合骑车吗？')
console.log(chat.messages.value.at(-1)?.content) // 已收到 weather 正文。
```

首次请求包含 System 摘要目录和用户问题。模型调用 `load_skills` 后，Tool 结果携带正文及资源摘要，随后模型继续处理。与任务无关时，真实模型可以直接回答；也可以在同一轮继续加载其他 Skill。

后续代码片段沿用上例中的 `chat` 和 `storage`。

### 使用 @ 显式指定

输入组件负责识别用户实际选择的 Skill，并通过当前消息 metadata 传入结构化名称：

```typescript
await chat.send({
  role: 'user',
  content: '@weather 查询杭州天气，并整理出行建议',
  metadata: {
    tinyRobotSkill: { requestedSkillNames: ['weather'] },
  },
})
```

在 `skillPlugin({ scope: 'session', ... })` 中用 `explicitSkillLoading` 选择 @ 指定的加载方式：

| 值                | 模型接收什么                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `preload`（默认） | 首次请求前读取正文，结果由 Kit 写入原 User 的 `metadata.tinyRobotSkill.preload`。发给模型时在请求副本里展开为一条独立的 User 上下文消息。  |
| `model`           | 在原 User 消息的请求副本中附加指定名称，例如 `User-requested Skills: ["weather"].`。模型可以调用 `load_skills`，正文随 Tool 结果进入历史。 |

两种方式都保留原 User 消息内容。用 `send(...messages)` 批量发送时，每条带 `requestedSkillNames` 的 User 消息都会单独处理。模型也可以自动加载其他 Skill。`model` 模式由模型决定是否调用工具，`deduplication` 在实际加载时生效。切换方式时重新创建插件实例。只在普通文本中输入 `@weather` 时，按普通文本发送。

预加载或工具读取时，无法解析的 Skill 会作为失败结果交给模型，其他指定项继续处理。Kit 不提供文本 `@` 解析器，也不新增全局手动/自动选择开关。

### 正文去重

`deduplication` 同时用于自动加载与显式指定，实例创建时确定：

| 值             | 返回行为                                                            | 取舍                                                 |
| -------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| `none`（默认） | 每次从当前来源读取并返回完整正文                                    | 由模型决定是否重复调用，可能产生重复正文和额外 token |
| `context`      | 相同正文和资源摘要仍在当前历史时返回 `already_loaded`，否则返回全文 | 避免重复全文；内容变化或正文被移除后可重新加载       |

这项配置不决定模型能否调用工具。`context` 也先检查来源，不会因为历史中有旧正文而绕过删除或禁用。并发请求尚无已提交正文时，可以都返回全文。

加载结果逐项使用 `loaded`、`already_loaded` 或 `failed`。当前来源不存在为 `skill_unavailable`，读取异常为 `skill_load_failed`；工具参数无效返回 `invalid_skill_names`。资源摘要不包含文件全文或读取函数。

### 保存和恢复会话

在浏览器中，保存快速开始的原始 `chat.messages.value`。它包含目录、预加载 metadata、工具调用和结果，以及记录工具执行状态的 `assistant.state.toolCall`。工具加载的正文去重需要这份成功状态。

```typescript
localStorage.setItem('weather-chat', JSON.stringify(chat.messages.value))
```

重新打开时，读取对应会话的消息，并调用快速开始里的 `openChat`。它会把消息传给 `initialMessages`，并用相同配置重新创建插件。继续加载 Skill 或读取资源时，应用仍需提供当前 Skill 来源。

```typescript
const saved = localStorage.getItem('weather-chat')
const restoredChat = openChat(saved ? (JSON.parse(saved) as ChatMessage[]) : [])
```

恢复后可以直接读取 `restoredChat.messages.value` 渲染对话。下一次发送时，插件会沿用已有目录，从 metadata 展开预加载正文。`model` 模式会重建名称提示。配置为 `context` 时，再次加载相同正文可以返回 `already_loaded`。

`sessionId` 可省略。省略时，插件直接从传入的历史恢复，也支持带有旧 ID 的记录。显式传入 `sessionId` 时，插件会标记新记录，并在历史中存在不同 ID 的 Skill 记录时抛错。

同一引擎的当前历史中缺少目录时，下一轮会重新查询候选并建立目录；已有目录不随来源变化而刷新。首次候选为空时，该实例不重复查询空目录；重建引擎后可以再次查询。

`isSkillContextMessage(message)` 可用于从 UI 隐藏目录，也能识别旧历史中单独保存的预加载上下文。新预加载结果存于原 User 的 metadata，原消息正常显示。保存时使用未过滤的 `chat.messages.value`，普通对话分享则只导出用户选中的可见内容。工具结果可由应用原有工具界面处理。

自定义裁剪须保留 Skill 正文，或同步移除当前消息中的旧正文；Kit 不追踪任意 provider 内部的历史投影，也不自动恢复任意摘要丢失的全文。

### 当前来源与资源读取

删除 Skill 后，不重写已有目录，也不追加失效通知：

```typescript
await storage.delete('weather')
```

后续加载、列资源或读资源时会再次检查来源并返回不可用。应用可以在摘要和定义两个回调中一致过滤名称，实现可恢复的禁用。已有正文继续留在历史中，这不代表模型忘记了此前内容。

会话资源工具要求明确的 `skillName`；`read_skill_file` 还需要相对路径 `path`。它们按名称解析当前定义，不依赖正文去重状态，也不冻结旧版本资源。只读取标记为 `text` 的资源，不执行脚本。

## 会话 API 与迁移

| 参数                   | 约束                                | 说明                                            |
| ---------------------- | ----------------------------------- | ----------------------------------------------- |
| `scope`                | 必须是 `session`                    | 显式进入新流程，省略时保持旧按轮流程            |
| `sessionId`            | 可选，传入时须为非空字符串          | 显式配置时标记新记录，并校验已标记的历史记录    |
| `deduplication`        | `none` / `context`，默认 `none`     | 正文重复返回策略，不是选择模式                  |
| `explicitSkillLoading` | `preload` / `model`，默认 `preload` | @ 指定时由 Kit 预加载正文，或由模型调用工具加载 |
| `getSkillCandidates`   | 必填                                | 提供首次目录的名称及描述                        |
| `getSkillByName`       | 必填                                | 从当前来源解析完整定义；不可用返回 undefined    |

根入口导出 Vue 工厂和 `UseMessageSessionSkillPluginOptions`；`/core` 导出 Core 工厂和 `SessionSkillPluginOptions`。共享结果类型为 `SessionSkillLoadResult`，与 Loader 的 `SkillLoadResult` 分开。普通生命周期 hook 保留；`getSkillRequestContext` 及其三个旧 Skill 专用 hook 仍只描述按轮流程。

Core 的 `SkillPluginOptions` 和 Vue 的 `UseMessageSkillPluginOptions` 保留按轮配置类型，Vue 类型也可继续通过 `interface extends` 扩展。两个 `skillPlugin` 工厂分别接受对应的会话配置类型。

迁移时删除原有正文投影和 `injectSkillInstructions`。会话配置不能混用 `mode`、`selection`、`skills`、`skillNames`、`preferredSkillNames`、`maxSelectedSkills` 或旧 Skill 专用 hook。新会话可采用新流程；旧会话继续按轮使用，旧应用快照不自动转为新协议。

缺少 `toolPlugin` 时发送前报配置错误。本轮禁用已注册的工具插件会抑制新增目录、显式正文及工具执行，已有历史目录继续保留；该行为不等同于从请求中移除历史目录。不支持工具调用的模型继续使用现有按轮 manual 入口，由应用选择接入路径。

## 按轮接入（兼容旧 API） {#skill-turn}

下面是一个可独立运行的 Vue 侧最小示例。它使用 `manual` 模式启用一个内联 skill，通过 `onBeforeRequest` 临时修改本次请求，并由 mock provider 显示最终收到的 instructions。

```typescript
import type {
  ChatCompletion,
  MessageRequestBody,
  SkillDefinition,
  UseMessageSkillPluginOptions,
} from '@opentiny/tiny-robot-kit'
import { getSkillRequestContext, skillPlugin, toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'
import { ref } from 'vue'

const weatherSkill: SkillDefinition = {
  name: 'weather',
  description: '回答天气、温度和预报问题。',
  instructions: '先回答当前天气，再补充一条简短预报。',
}

const selectedSkills = ref<SkillDefinition[]>([weatherSkill])

const injectSkillInstructions: NonNullable<UseMessageSkillPluginOptions['onBeforeRequest']> = (context) => {
  const instructions = getSkillRequestContext(context)?.instructions ?? []

  if (instructions.length > 0) {
    context.requestBody.messages.unshift({
      role: 'system',
      content: instructions.join('\n\n'),
    })
  }
}

const responseProvider = async (requestBody: MessageRequestBody): Promise<ChatCompletion> => {
  const systemMessage = requestBody.messages.find((message) => message.role === 'system')

  return {
    id: 'skill-quick-start',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'mock',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: `Provider 收到的 instructions：\n${String(systemMessage?.content ?? '无')}`,
        },
        delta: undefined,
        finish_reason: 'stop',
        logprobs: null,
      },
    ],
  }
}

const { messages, sendMessage } = useMessage({
  responseProvider,
  plugins: [
    toolPlugin({
      getTools: async () => [],
      callTool: async () => 'Tool not found.',
    }),
    skillPlugin({
      mode: 'manual',
      skills: selectedSkills,
      onBeforeRequest: injectSkillInstructions,
    }),
  ],
})

sendMessage('今天适合出门吗？')
```

发送消息时，`skillPlugin` 会解析 `selectedSkills` 并生成请求级 instructions；`injectSkillInstructions` 再把它们临时写入本次 `requestBody`。将 `selectedSkills.value` 设为 `[]` 后，后续请求便不会包含这项 skill 的 instructions。

:::info 为什么不自动写入请求
不同模型或 provider 承载 instructions 的方式并不统一。`skillPlugin` 因此只生成和暴露 instructions，由应用决定是临时写入当前请求，还是作为 system/user message 持久化到消息历史，避免插件固定某一种 provider 语义或擅自改变会话状态。
:::

接入真实模型时，将 mock `responseProvider` 换成应用已有的 provider，并按业务需要选择 instructions 的承载方式。

## 按轮选择配置

`skillPlugin` 是 skill 运行时工具的提供方，`toolPlugin` 负责收集这些工具、写入模型请求并执行模型返回的 tool calls。因此，常规业务接入应同时注册两个插件，并将 `toolPlugin` 放在 `skillPlugin` 前面：

```typescript
useMessage({
  responseProvider,
  plugins: [
    toolPlugin({
      getTools: async () => [],
      callTool: async () => 'Tool not found.',
    }),
    skillPlugin({
      // skill selection 和 instructions 配置
    }),
  ],
})
```

当 skill 带有 resources 时，`toolPlugin` 会把 `list_skill_files` 和 `read_skill_file` 加入请求；使用 `auto` 时，它还负责 `select_skills` 的发送和执行。只有应用能够保证始终不使用 `auto`，并且启用的 skill 只有 instructions、没有 resources（例如只有单个 `SKILL.md`）时，才可以省略 `toolPlugin`。

`mode` 表示当前请求采用哪种 skill 选择机制，而不是必须在接入时写死的应用模式：

- `manual`：使用用户或应用已经明确选择的 skill。
- `auto`：把候选 skill 交给模型，由模型根据当前问题选择。
- `none`：当前请求不启用 skill。

Vue 入口的 `skillPlugin` 支持响应式配置。`mode`、`skills`、`skillNames`、`preferredSkillNames` 和 `maxSelectedSkills` 都可以传普通值、`ref` 或 `computed`，插件会在每轮请求开始时读取当前值。因此应用可以让用户通过界面切换选择机制：

```typescript
const selectionMode = ref<'manual' | 'auto'>('manual')

skillPlugin({
  mode: selectionMode,
  // 根据下面两节配置 skill 数据来源
})
```

如果运行时可能切换到 `auto`，还需要配置候选 skill 来源。下面分别展示两种机制需要的数据；示例中的固定 `mode` 只用于单独说明对应流程。

以下片段沿用[按轮接入示例](#skill-turn)中的 `weatherSkill` 和 `injectSkillInstructions`。Manual 可沿用那里的模拟 `responseProvider`，Auto 使用下面能模拟工具调用的 provider。

### Manual 模式

`manual` 是默认值，表示最终启用结果已经由复选框、下拉框、`@skillName` 或其他业务交互确定。

业务侧已经持有完整 `SkillDefinition[]` 时，直接传 `skills`：

```typescript
const selectedSkills = ref<SkillDefinition[]>([weatherSkill])

skillPlugin({
  skills: selectedSkills,
  onBeforeRequest: injectSkillInstructions,
})
```

业务侧只保存名称时，传 `skillNames`，并使用 `getSkillByName` 从 storage 或其他集合解析完整定义。以下假设已经创建 `storage`：

```typescript
const selectedSkillNames = ref(['weather'])

skillPlugin({
  skillNames: selectedSkillNames,
  getSkillByName: (name) => storage.get(name),
  onBeforeRequest: injectSkillInstructions,
})
```

`getSkillByName` 返回的 `skill.name` 必须与请求名称一致。无法解析的名称不会启用，并会写入 `SkillRequestContext.unresolvedSkillNames`。

下面的端到端演示使用响应式 `selectedSkillNames`。勾选 skill 后发送消息，面板会显示最终送到 mock provider 的 system message 和运行时工具；切换选择后再次发送，可以看到请求内容随之变化。

<demo
  vue="../../demos/tools/skill/VueSkillPlugin.vue"
  :vueFiles="[
    '../../demos/tools/skill/VueSkillPlugin.vue',
    '../../demos/tools/skill/VueSkillPlugin.css'
  ]"
/>

### Auto 模式

`auto` 模式先把候选 skill 摘要和 `select_skills` 工具提供给模型。模型调用 `select_skills` 后，`skillPlugin` 解析完整 skill，并在同一轮消息的后续执行请求中生成所选 skill 的 instructions 和资源工具。

`auto` 需要启用 `toolPlugin`。以下示例复用[按轮接入示例](#skill-turn)的代码：首次请求含 `select_skills` 时，模拟模型选择 `weather`；后续请求沿用原模拟模型显示收到的正文。接入真实模型时，提供支持工具调用的 `responseProvider`。

```typescript
import type { ResponseProvider, Tool } from '@opentiny/tiny-robot-kit'

const docsSkill: SkillDefinition = {
  name: 'docs',
  description: '回答项目文档相关问题。',
  instructions: '优先依据项目文档回答，并标明不确定的信息。',
}

const allSkills = ref<SkillDefinition[]>([weatherSkill, docsSkill])
const preferredSkillNames = ref(['weather'])

let selectionCallId = 0
const autoResponseProvider: ResponseProvider = async (body) => {
  const response = await responseProvider(body)
  const tools: Tool[] = body.tools ?? []
  if (!tools.some((tool) => tool.function.name === 'select_skills')) return response

  return {
    ...response,
    choices: [
      {
        index: 0,
        delta: undefined,
        logprobs: null,
        finish_reason: 'tool_calls',
        message: {
          role: 'assistant',
          content: '',
          tool_calls: [
            {
              id: `select-weather-${++selectionCallId}`,
              index: 0,
              type: 'function',
              function: { name: 'select_skills', arguments: '{"skillNames":["weather"]}' },
            },
          ],
        },
      },
    ],
  }
}

const autoChat = useMessage({
  responseProvider: autoResponseProvider,
  plugins: [
    toolPlugin({
      getTools: async () => [],
      callTool: async () => 'Tool not found.',
    }),
    skillPlugin({
      mode: 'auto',
      skills: allSkills,
      preferredSkillNames,
      maxSelectedSkills: 2,
      onBeforeRequest: injectSkillInstructions,
    }),
  ],
})

await autoChat.sendMessage('今天适合出门吗？')
console.log(autoChat.messages.value.at(-1)?.content)
```

最后一条助手消息会显示 Provider 收到的 `weather` 正文。

候选来自 storage 时，分别提供摘要和完整定义：

```typescript
skillPlugin({
  mode: 'auto',
  getSkillCandidates: () => storage.list(),
  getSkillByName: (name) => storage.get(name),
  preferredSkillNames: ['weather'],
  maxSelectedSkills: 2,
  onBeforeRequest: injectSkillInstructions,
})
```

auto 模式分为两个阶段：

1. `selecting`：instructions 包含候选摘要，运行时工具包含 `select_skills`。
2. `ready`：模型完成选择后，instructions 包含最终 skill 指令，运行时工具换成对应的资源工具。

`preferredSkillNames` 只是选择偏好，不是最终结果。最终启用结果以模型调用 `select_skills` 后的解析结果为准。auto 通常会增加一次模型请求、延迟和 token 消耗；候选很多时，应用应先过滤候选摘要。

### 动态 selection

常用场景优先使用顶层响应式参数。只有需要在请求开始时组合多项业务状态时，才使用 `selection` 高级入口。

```typescript
skillPlugin({
  selection: () =>
    selectionMode.value === 'auto'
      ? {
          mode: 'auto',
          preferredSkillNames: selectedSkillNames.value,
        }
      : {
          mode: 'manual',
          skillNames: selectedSkillNames.value,
        },
  getSkillCandidates: () => storage.list(),
  getSkillByName: (name) => storage.get(name),
  onBeforeRequest: injectSkillInstructions,
})
```

传入 `selection` 后，它会覆盖顶层 `mode`、`skillNames`、`preferredSkillNames` 和 `maxSelectedSkills`。如果需要响应式 selection，应传函数并在函数内读取 ref；plain object 不会解包其中的 ref。顶层 `skills` 仍可作为 auto 模式的默认候选集合和 `getSkillByName` 数据源。

## 导入和保存 Skill

Loader 和 Storage 都提供 `SkillDefinition`，但解决的问题不同：

- **Loader** 将浏览器文件、GitHub 仓库或 Node 文件系统来源解析为一个完整 `SkillDefinition`。
- **Storage** 持久化和恢复已经加载的 `SkillDefinition`。`storage.import(options)` 是 `loader + add` 的快捷组合，会复用 Loader 逻辑。

Storage 保存 Skill 定义与资源，不保存会话。按轮流程可保存选中名称，通过 `storage.get(name)` 解析；会话流程另由应用保存完整消息历史。

### SkillDefinition

运行时只消费统一的 `SkillDefinition`，不关心它来自 Loader、Storage 还是应用内存：

```typescript
interface SkillDefinition {
  name: string
  description: string
  instructions: string
  resources?: SkillResourceDescriptor[]
  metadata?: Record<string, unknown>
}
```

| 字段           | 用途                                          |
| -------------- | --------------------------------------------- |
| `name`         | 唯一名称，也是 selection 和 resolver 使用的键 |
| `description`  | UI 展示、搜索和 auto 候选摘要                 |
| `instructions` | 当前 skill 提供给模型的核心指令               |
| `resources`    | 可由运行时资源工具列出和读取的附加文件        |
| `metadata`     | 应用或 Loader 保留的扩展信息                  |

### 浏览器加载

浏览器入口从 `@opentiny/tiny-robot-kit` 导出。通过 `<input type="file" webkitdirectory>` 读取目录：

```typescript
import { loadSkill } from '@opentiny/tiny-robot-kit'

async function importFromInput(input: HTMLInputElement) {
  if (!input.files?.length) {
    return
  }

  return loadSkill({
    source: 'browser',
    fileList: input.files,
  })
}
```

支持 File System Access API 的浏览器也可以使用目录句柄：

```typescript
const directoryHandle = await window.showDirectoryPicker()
const skill = await loadSkill({
  source: 'browser',
  directoryHandle,
})
```

`showDirectoryPicker()` 并非所有浏览器都支持，生产界面应保留文件 input 作为回退方式。

### GitHub 加载

浏览器和 Node 入口都支持从 GitHub 仓库目录加载：

```typescript
const skill = await loadSkill({
  source: 'github',
  repo: 'openclaw/openclaw',
  // 可选：branch、tag 或 commit SHA；省略时使用默认分支。
  ref: '58672075219d09495de6489ad0821d276ac84f13',
  path: 'skills/weather',
})
```

### 取消加载

`loadSkill` 返回一个带 `cancel()` 的 Promise。正常加载时直接 await：

```typescript
const skill = await loadSkill(options)
```

需要在组件卸载或用户取消操作时终止加载，可以保留 job，并处理取消导致的 reject：

```typescript
import { onUnmounted } from 'vue'

const job = loadSkill(options)
onUnmounted(() => job.cancel())

try {
  const skill = await job
  console.log(skill.name)
} catch (error) {
  console.error('Skill 加载被取消或失败', error)
}
```

### Warnings 和 strict 模式

需要读取非致命问题时，使用 `loadSkillWithDetails`，不要启用 strict：

```typescript
const { skill, warnings } = await loadSkillWithDetails({
  source: 'browser',
  fileList,
})

for (const warning of warnings) {
  console.warn(warning.code, warning.message, warning.path)
}
```

希望任何 warning 都中止导入时，单独启用 `strict: true` 并处理错误：

```typescript
try {
  const { skill } = await loadSkillWithDetails({
    source: 'browser',
    fileList,
    strict: true,
  })
} catch (error) {
  console.error('Skill 未通过严格校验', error)
}
```

### IndexedDB Storage

浏览器需要跨会话保留 skill 时，使用 IndexedDB storage：

```typescript
import { createIndexedDBSkillStorage } from '@opentiny/tiny-robot-kit'

const storage = createIndexedDBSkillStorage({
  databaseName: 'tiny-robot-skills',
})

const { skill, warnings } = await storage.import({
  source: 'browser',
  fileList,
})

const summaries = await storage.list()
const restoredSkill = await storage.get(skill.name)
```

IndexedDB storage 会持久化 resource 内容。后续 `get(name)` 恢复的 resources 通常提供 lazy reader，模型真正调用资源工具时才读取内容。

### Memory Storage

Memory storage 适合测试、临时预览或应用已经拥有其他持久化方案的场景：

```typescript
import { createMemorySkillStorage } from '@opentiny/tiny-robot-kit'

const storage = createMemorySkillStorage()
await storage.add(weatherSkill)
const weather = await storage.get('weather')
```

### Node.js 加载和存储

Node-only API 从 `@opentiny/tiny-robot-kit/node` 导出：

```typescript
import { createFsSkillStorage, loadSkill } from '@opentiny/tiny-robot-kit/node'

const weather = await loadSkill({
  source: 'fs',
  root: '/path/to/weather-skill',
})

const storage = createFsSkillStorage({
  root: '/path/to/skills',
})

await storage.add(weather)
const summaries = await storage.list()
```

Fs storage 保持原生 skill 目录结构，因此已有的 skills 目录可以直接作为 storage root。

下面的演示可以导入内置示例或本地目录，将 skill 保存到 storage，并通过列表查看和选择已保存的 skill。

<demo
  vue="../../demos/tools/skill/SkillInspector.vue"
  :vueFiles="[
    '../../demos/tools/skill/SkillInspector.vue',
    '../../demos/tools/skill/useSkillInspector.ts',
    '../../demos/tools/skill/exampleSkillFiles.ts',
    '../../demos/tools/skill/SkillInspector.css'
  ]"
/>

## 使用资源文件

Resource 可以保存已经加载的内容（eager），也可以提供按需读取函数（lazy）。下面是两个合法的文本资源：

```typescript
import type { SkillResourceDescriptor } from '@opentiny/tiny-robot-kit'

const readGuideFromStorage = async () => '# Large guide'

const eagerResource: SkillResourceDescriptor = {
  path: 'references/format.md',
  kind: 'text',
  resourceId: 'references/format.md',
  text: '先给结论，再列出一个依据。',
  mimeType: 'text/markdown',
}

const lazyResource: SkillResourceDescriptor = {
  path: 'references/large-guide.md',
  kind: 'text',
  resourceId: 'references/large-guide.md',
  readText: () => readGuideFromStorage(),
  mimeType: 'text/markdown',
}
```

文本资源至少提供 `text` 或 `readText` 之一；二进制资源至少提供 `binary` 或 `readBinary` 之一。消费端会优先使用 eager 内容，缺少时再调用 reader。

按轮流程在所选 Skill 含有 resources 时提供以下工具；会话流程始终按名称解析当前来源：

- `list_skill_files`：按轮流程可省略 `skillName` 汇总所选资源；会话流程要求明确的 `skillName`。
- `read_skill_file`：通过明确的 `skillName` 和相对路径读取文本资源。

应用必须注册启用的 `toolPlugin`，这些运行时工具才会进入模型请求。`read_skill_file` 只读取 `kind: 'text'` 的资源；二进制资源会出现在文件列表中，但不能通过该工具读取为文本。

## 按轮请求状态与生命周期

`skillPlugin` 会把当前请求状态写入 `SkillRequestContext`。可以在 plugin 生命周期或回调中通过 `getSkillRequestContext(context)` 读取，也可以直接使用回调参数。

```typescript
const currentSkillInstructions = ref<string[]>([])

skillPlugin({
  skillNames: ['weather', 'missing-skill'],
  getSkillByName: (name) => storage.get(name),
  onSkillsResolved(skillContext) {
    console.log(skillContext.skillNames)
    console.log(skillContext.unresolvedSkillNames)
  },
  onInstructionsResolved(skillContext) {
    currentSkillInstructions.value = skillContext.instructions
  },
  onBeforeRequest: injectSkillInstructions,
})
```

| 回调                       | 触发时机                                                     | 常见用途                                                               |
| -------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `onSkillsResolved`         | manual 解析完成；auto 模型完成选择并解析 skill 后            | 同步已启用和未解析名称                                                 |
| `onInstructionsResolved`   | manual 解析完成；auto 进入 `selecting` 和 `ready` 时分别触发 | 将当前 instructions 同步到 UI、日志、应用状态或持久消息管理逻辑        |
| `onSkillSelectionResolved` | auto 模型调用 `select_skills` 后、解析完整 skill 前          | 记录模型请求启用的名称                                                 |
| `onBeforeRequest`          | 每次 request body 组装完成、发送给 provider 前               | 临时调整本次 `requestBody`，例如添加 instructions 或 provider 专用字段 |

`onInstructionsResolved` 发生在 request body 创建之前，适合同步应用状态。临时修改本次 `requestBody` 时使用 `onBeforeRequest`；需要由插件承载跨轮正文时使用会话流程。

`SkillRequestContext` 的说明性结构如下，具体类型以包导出为准：

```typescript
interface SkillRequestContext {
  skills: SkillDefinition[]
  skillNames: string[]
  requestedSkillNames: string[]
  unresolvedSkillNames: string[]
  instructions: string[]
  selection:
    | { mode: 'manual' | 'none'; phase: 'ready' }
    | {
        mode: 'auto'
        phase: 'selecting' | 'ready'
        candidates: SkillCandidate[]
        preferredSkillNames?: string[]
      }
}
```

这个 context 只描述当前请求。下一轮选择变化或 auto 阶段切换后，内容会更新，不要将完整 context 缓存并复用于后续请求。

:::warning 按轮指令的承载
按轮流程应在请求副本中组装 instructions，避免修改已经发送的历史消息。需要持久化并复用 Skill 正文时，使用会话流程，不再同时运行应用原有正文投影。
:::

## 安全与生产注意事项

- **只启用可信来源**：从 GitHub、本地目录或用户上传导入的 instructions 会直接影响模型行为，应限制来源并在必要时审核内容。
- **保护敏感数据**：模型调用 `read_skill_file` 后，文本资源可能进入模型上下文。不要在 resources 中存放未经授权发送给 provider 的凭据、个人信息或内部数据。
- **由应用控制导入**：Kit 不替应用决定文件大小、用户权限或来源白名单。生产环境应在导入前后实施相应限制。
- **控制请求成本**：按轮 auto 包含选择阶段；会话流程按需加载，none 允许重复全文。候选规模和资源大小由应用按实际预算控制。
- **区分接入路径**：按轮流程使用 manual/auto/none；会话流程将自动加载与消息级 @ 指定结合，复选框可以通过来源回调控制可用性。

## 常见问题

| 现象                                   | 原因                                                          | 处理方式                                                                 |
| -------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 按轮 instructions 没有出现在模型请求中 | `skillPlugin` 只生成 instructions，不决定承载方式             | 请求级注入使用 `onBeforeRequest`；需要持久化并跨轮复用正文时使用会话流程 |
| manual + `skillNames` 报 resolver 错误 | 缺少 `getSkillByName`                                         | 提供能按名称返回完整 `SkillDefinition` 的 resolver                       |
| auto 在发送请求前失败                  | 缺少或禁用了 `toolPlugin`                                     | 注册一个启用的 `toolPlugin`                                              |
| auto 报候选来源错误                    | 没有 `skills` 或 `getSkillCandidates`                         | 提供内存候选集合或候选摘要 provider                                      |
| auto 报 skill resolver 错误            | 缺少 `getSkillByName` 且没有可作为默认 resolver 的 `skills`   | 提供 `getSkillByName` 或顶层 `skills`                                    |
| 某些名称没有启用                       | resolver 失败、返回 `undefined`，或返回的 `skill.name` 不匹配 | 查看 `unresolvedSkillNames` 并检查 resolver                              |
| 按轮资源工具没有进入请求               | 没有启用 `toolPlugin`，或所选 skill 没有 resources            | 注册 `toolPlugin` 并检查最终解析的 skill                                 |
| `read_skill_file` 返回二进制不可读错误 | 目标资源是 `kind: 'binary'`                                   | 使用应用提供的二进制处理流程；当前工具只读取文本                         |
| `showDirectoryPicker` 不可用           | 浏览器不支持 File System Access API                           | 回退到 `<input type="file" webkitdirectory>`                             |
| 想显示 warning，但 Loader 直接抛错     | 启用了 `strict: true`                                         | 关闭 strict 并使用 `loadSkillWithDetails` 读取 warnings                  |

## API 参考

以下是面向 Vue 使用者的常用公开 API 摘要。复杂联合类型和继承的 message plugin hooks 以 `@opentiny/tiny-robot-kit` 实际导出类型为准。

### Loader

| API                             | 导入入口 | 环境    | 返回值                          | 说明                       |
| ------------------------------- | -------- | ------- | ------------------------------- | -------------------------- |
| `loadSkill(options)`            | 包根入口 | 浏览器  | `SkillLoadJob<SkillDefinition>` | 支持 browser/GitHub source |
| `loadSkillWithDetails(options)` | 包根入口 | 浏览器  | `SkillLoadJob<SkillLoadResult>` | 同时返回 skill 和 warnings |
| `loadSkill(options)`            | `/node`  | Node.js | `SkillLoadJob<SkillDefinition>` | 支持 fs/GitHub source      |
| `loadSkillWithDetails(options)` | `/node`  | Node.js | `SkillLoadJob<SkillLoadResult>` | Node 侧 details 版本       |

所有 `SkillLoadJob` 都是带 `cancel(): void` 的 Promise。通用选项包括自定义入口文件 `entryFile` 和严格模式 `strict`；`onProgress` 目前是实验性预留，Loader 尚未上报进度事件。

### Storage

| API               | 说明                                                |
| ----------------- | --------------------------------------------------- |
| `add(skill)`      | 保存已经完整加载的 `SkillDefinition`                |
| `get(name)`       | 恢复完整定义；不存在时返回 `undefined`              |
| `has(name)`       | 判断 storage entry 是否存在，不验证内容能否完整读取 |
| `delete(name)`    | 删除指定 skill                                      |
| `list()`          | 返回 `SkillSummary[]`，用于 UI 或 auto 候选摘要     |
| `import(options)` | 执行 Loader + add，返回可取消的 `SkillImportJob`    |

| Storage 实现                  | 导入入口           | 适用环境               |
| ----------------------------- | ------------------ | ---------------------- |
| `createIndexedDBSkillStorage` | 包根入口           | 浏览器持久化           |
| `createMemorySkillStorage`    | 包根入口或 `/node` | 临时状态与测试         |
| `createFsSkillStorage`        | `/node`            | Node.js 文件系统持久化 |

### Vue skillPlugin（按轮） {#vue-skillplugin}

| 参数                       | 模式              | 必需条件/默认值                        | 说明                                                                     |
| -------------------------- | ----------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `mode`                     | 全部              | 默认 `manual`                          | 支持普通值、`ref`、`computed`                                            |
| `skills`                   | manual/auto       | 可选                                   | manual 表示已选完整 skills；auto 表示候选并作为默认 resolver 来源        |
| `skillNames`               | manual            | 使用非空 names 时需要 `getSkillByName` | 已选名称，支持响应式值                                                   |
| `preferredSkillNames`      | auto              | 可选                                   | 选择偏好，不是最终启用结果                                               |
| `maxSelectedSkills`        | auto              | 默认不超过候选数量                     | 限制模型最多选择的数量                                                   |
| `selection`                | 全部              | 高级入口                               | plain object 或请求级函数；覆盖顶层 `mode`、names、preference 和数量限制 |
| `getSkillCandidates`       | auto              | 未提供 `skills` 时需要                 | 返回候选摘要                                                             |
| `getSkillByName`           | manual/auto       | 按配置决定                             | 按名称解析完整定义                                                       |
| `onInstructionsResolved`   | manual/auto       | 可选                                   | instructions 更新后触发，用于同步 UI、应用状态或持久消息逻辑             |
| `onSkillsResolved`         | manual/auto ready | 可选                                   | 完整 skill 解析后触发                                                    |
| `onSkillSelectionResolved` | auto              | 可选                                   | 模型完成名称选择后触发                                                   |
| `onBeforeRequest`          | 全部              | 需要临时修改本次请求时使用             | 继承自 message plugin，用于修改最终 request body，不会自动写回消息历史   |

选择配置的说明性结构如下：

```typescript
type SkillSelection =
  | { mode: 'manual'; skills: SkillDefinition[] }
  | { mode: 'manual'; skillNames: string[] }
  | { mode: 'auto'; preferredSkillNames?: string[]; maxSelectedSkills?: number }
  | { mode: 'none' }
```

### SkillRequestContext 字段（按轮）

| 字段                   | 说明                                   |
| ---------------------- | -------------------------------------- |
| `skills`               | 成功启用的完整 skill definitions       |
| `skillNames`           | 成功启用的名称                         |
| `requestedSkillNames`  | manual 或 auto 请求启用的名称          |
| `unresolvedSkillNames` | 请求启用但未成功解析的名称             |
| `instructions`         | 当前 selection 阶段生成的 instructions |
| `selection`            | 当前模式、阶段、候选和偏好信息         |
