---
outline: [1, 3]
---

# Skill 技能接入

Skill 以 `SKILL.md` 中的任务说明（instructions）为核心，并可以附带参考资料、模板等资源文件。在 Kit 中，这些附加文件统一表示为 `SkillDefinition.resources`。Vue 应用可以根据用户选择或当前问题启用 skill，再通过 `skillPlugin` 将本次请求所需的 instructions 和运行时工具接入 `useMessage`。

Kit 负责加载、保存和解析 skill，但不管理业务界面中的长期选择状态，也不会固定 instructions 的承载方式。应用负责决定展示哪些 skill、当前选中哪些 skill，以及 instructions 如何发送、是否进入消息历史。

## 快速开始

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

## 在 Vue 中启用 Skill

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

本节的局部代码省略了“快速开始”中已定义的 `responseProvider` 和 `injectSkillInstructions`。

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

`auto` 依赖模型工具调用，并且需要启用 `toolPlugin`，以收集并执行 `skillPlugin` 提供的 `select_skills`。如果完整候选 skills 已经在内存中，可以直接使用响应式 `skills`：

```typescript
const docsSkill: SkillDefinition = {
  name: 'docs',
  description: '回答项目文档相关问题。',
  instructions: '优先依据项目文档回答，并标明不确定的信息。',
}

const allSkills = ref<SkillDefinition[]>([weatherSkill, docsSkill])
const preferredSkillNames = ref(['weather'])

useMessage({
  responseProvider,
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
```

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

Storage 不拥有 UI 选择状态。应用通常只保存选中的名称，再通过 `storage.get(name)` 为 `skillPlugin` 提供完整定义。

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

| 字段 | 用途 |
| --- | --- |
| `name` | 唯一名称，也是 selection 和 resolver 使用的键 |
| `description` | UI 展示、搜索和 auto 候选摘要 |
| `instructions` | 当前 skill 提供给模型的核心指令 |
| `resources` | 可由运行时资源工具列出和读取的附加文件 |
| `metadata` | 应用或 Loader 保留的扩展信息 |

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

启用的 skill 含有 resources 时，`skillPlugin` 会生成：

- `list_skill_files`：列出当前 skills 的文件摘要，可以按 `skillName` 过滤。
- `read_skill_file`：通过明确的 `skillName` 和相对路径读取文本资源。

应用必须注册启用的 `toolPlugin`，这些运行时工具才会进入模型请求。`read_skill_file` 只读取 `kind: 'text'` 的资源；二进制资源会出现在文件列表中，但不能通过该工具读取为文本。

## 请求状态与生命周期

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

| 回调 | 触发时机 | 常见用途 |
| --- | --- | --- |
| `onSkillsResolved` | manual 解析完成；auto 模型完成选择并解析 skill 后 | 同步已启用和未解析名称 |
| `onInstructionsResolved` | manual 解析完成；auto 进入 `selecting` 和 `ready` 时分别触发 | 将当前 instructions 同步到 UI、日志、应用状态或持久消息管理逻辑 |
| `onSkillSelectionResolved` | auto 模型调用 `select_skills` 后、解析完整 skill 前 | 记录模型请求启用的名称 |
| `onBeforeRequest` | 每次 request body 组装完成、发送给 provider 前 | 临时调整本次 `requestBody`，例如添加 instructions 或 provider 专用字段 |

`onInstructionsResolved` 发生在 request body 创建之前，适合同步应用状态；应用可以根据同步结果创建或更新持久 system/user message。只有需要临时修改本次 `requestBody` 时，才使用 `onBeforeRequest`。

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

:::warning 持久化 instructions
如果应用将 instructions 保存为 message，不要在每轮请求中重复追加新消息。应使用稳定标识更新或删除已有 skill message，并在 skill 选择变化时同步内容。auto 模式还包含 `selecting` 和 `ready` 两个阶段，通常只应持久化最终业务需要保留的内容，避免把临时选择指令长期写入消息历史。
:::

## 安全与生产注意事项

- **只启用可信来源**：从 GitHub、本地目录或用户上传导入的 instructions 会直接影响模型行为，应限制来源并在必要时审核内容。
- **保护敏感数据**：模型调用 `read_skill_file` 后，文本资源可能进入模型上下文。不要在 resources 中存放未经授权发送给 provider 的凭据、个人信息或内部数据。
- **由应用控制导入**：Kit 不替应用决定文件大小、用户权限或来源白名单。生产环境应在导入前后实施相应限制。
- **控制 auto 成本**：auto 依赖 tool calling，通常包含选择阶段和后续执行阶段，会增加延迟和 token 消耗。候选较多时先由应用过滤。
- **区分选择责任**：`manual` 直接使用用户或应用已经确定的结果；`auto` 会让模型额外执行一次选择流程。应用可以根据产品交互动态切换，而不是把它当成固定的接入方案。

## 常见问题

| 现象 | 原因 | 处理方式 |
| --- | --- | --- |
| instructions 没有出现在模型请求中 | `skillPlugin` 只生成 instructions，不决定承载方式 | 选择承载策略：请求级注入可使用 `onBeforeRequest`；需要持久化时由应用创建或更新消息 |
| manual + `skillNames` 报 resolver 错误 | 缺少 `getSkillByName` | 提供能按名称返回完整 `SkillDefinition` 的 resolver |
| auto 在发送请求前失败 | 缺少或禁用了 `toolPlugin` | 注册一个启用的 `toolPlugin` |
| auto 报候选来源错误 | 没有 `skills` 或 `getSkillCandidates` | 提供内存候选集合或候选摘要 provider |
| auto 报 skill resolver 错误 | 缺少 `getSkillByName` 且没有可作为默认 resolver 的 `skills` | 提供 `getSkillByName` 或顶层 `skills` |
| 某些名称没有启用 | resolver 失败、返回 `undefined`，或返回的 `skill.name` 不匹配 | 查看 `unresolvedSkillNames` 并检查 resolver |
| 资源工具没有进入请求 | 没有启用 `toolPlugin`，或所选 skill 没有 resources | 注册 `toolPlugin` 并检查最终解析的 skill |
| `read_skill_file` 返回二进制不可读错误 | 目标资源是 `kind: 'binary'` | 使用应用提供的二进制处理流程；当前工具只读取文本 |
| `showDirectoryPicker` 不可用 | 浏览器不支持 File System Access API | 回退到 `<input type="file" webkitdirectory>` |
| 想显示 warning，但 Loader 直接抛错 | 启用了 `strict: true` | 关闭 strict 并使用 `loadSkillWithDetails` 读取 warnings |

## API 参考

以下是面向 Vue 使用者的常用公开 API 摘要。复杂联合类型和继承的 message plugin hooks 以 `@opentiny/tiny-robot-kit` 实际导出类型为准。

### Loader

| API | 导入入口 | 环境 | 返回值 | 说明 |
| --- | --- | --- | --- | --- |
| `loadSkill(options)` | 包根入口 | 浏览器 | `SkillLoadJob<SkillDefinition>` | 支持 browser/GitHub source |
| `loadSkillWithDetails(options)` | 包根入口 | 浏览器 | `SkillLoadJob<SkillLoadResult>` | 同时返回 skill 和 warnings |
| `loadSkill(options)` | `/node` | Node.js | `SkillLoadJob<SkillDefinition>` | 支持 fs/GitHub source |
| `loadSkillWithDetails(options)` | `/node` | Node.js | `SkillLoadJob<SkillLoadResult>` | Node 侧 details 版本 |

所有 `SkillLoadJob` 都是带 `cancel(): void` 的 Promise。通用选项包括自定义入口文件 `entryFile` 和严格模式 `strict`；`onProgress` 目前是实验性预留，Loader 尚未上报进度事件。

### Storage

| API | 说明 |
| --- | --- |
| `add(skill)` | 保存已经完整加载的 `SkillDefinition` |
| `get(name)` | 恢复完整定义；不存在时返回 `undefined` |
| `has(name)` | 判断 storage entry 是否存在，不验证内容能否完整读取 |
| `delete(name)` | 删除指定 skill |
| `list()` | 返回 `SkillSummary[]`，用于 UI 或 auto 候选摘要 |
| `import(options)` | 执行 Loader + add，返回可取消的 `SkillImportJob` |

| Storage 实现 | 导入入口 | 适用环境 |
| --- | --- | --- |
| `createIndexedDBSkillStorage` | 包根入口 | 浏览器持久化 |
| `createMemorySkillStorage` | 包根入口或 `/node` | 临时状态与测试 |
| `createFsSkillStorage` | `/node` | Node.js 文件系统持久化 |

### Vue skillPlugin

| 参数 | 模式 | 必需条件/默认值 | 说明 |
| --- | --- | --- | --- |
| `mode` | 全部 | 默认 `manual` | 支持普通值、`ref`、`computed` |
| `skills` | manual/auto | 可选 | manual 表示已选完整 skills；auto 表示候选并作为默认 resolver 来源 |
| `skillNames` | manual | 使用非空 names 时需要 `getSkillByName` | 已选名称，支持响应式值 |
| `preferredSkillNames` | auto | 可选 | 选择偏好，不是最终启用结果 |
| `maxSelectedSkills` | auto | 默认不超过候选数量 | 限制模型最多选择的数量 |
| `selection` | 全部 | 高级入口 | plain object 或请求级函数；覆盖顶层 `mode`、names、preference 和数量限制 |
| `getSkillCandidates` | auto | 未提供 `skills` 时需要 | 返回候选摘要 |
| `getSkillByName` | manual/auto | 按配置决定 | 按名称解析完整定义 |
| `onInstructionsResolved` | manual/auto | 可选 | instructions 更新后触发，用于同步 UI、应用状态或持久消息逻辑 |
| `onSkillsResolved` | manual/auto ready | 可选 | 完整 skill 解析后触发 |
| `onSkillSelectionResolved` | auto | 可选 | 模型完成名称选择后触发 |
| `onBeforeRequest` | 全部 | 需要临时修改本次请求时使用 | 继承自 message plugin，用于修改最终 request body，不会自动写回消息历史 |

选择配置的说明性结构如下：

```typescript
type SkillSelection =
  | { mode: 'manual'; skills: SkillDefinition[] }
  | { mode: 'manual'; skillNames: string[] }
  | { mode: 'auto'; preferredSkillNames?: string[]; maxSelectedSkills?: number }
  | { mode: 'none' }
```

### SkillRequestContext 字段

| 字段 | 说明 |
| --- | --- |
| `skills` | 成功启用的完整 skill definitions |
| `skillNames` | 成功启用的名称 |
| `requestedSkillNames` | manual 或 auto 请求启用的名称 |
| `unresolvedSkillNames` | 请求启用但未成功解析的名称 |
| `instructions` | 当前 selection 阶段生成的 instructions |
| `selection` | 当前模式、阶段、候选和偏好信息 |
