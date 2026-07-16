---
outline: [1, 3]
---

# Skill 技能工具链

Skill 是一组可复用的能力模板。一个 skill 至少包含名称、描述和指令，也可以携带资源文件。`@opentiny/tiny-robot-kit` 面向使用者主要暴露三层：

- **Loader**：从浏览器文件、GitHub 或 Node 文件系统来源加载 skill，输出 `SkillDefinition`。
- **Storage**：持久化和恢复 `SkillDefinition`。storage 与 loader 平级，二者最终都提供 `SkillDefinition`。
- **skillPlugin**：把本次请求要启用的 skill 接入对话请求。

Kit 只负责加载、保存和在请求中启用 skill；具体展示哪些 skill、用户选中了哪些 skill，由业务界面自己维护。

常见接入方式分为两条链路：

- **Loader -> skillPlugin**：临时使用时，通过 loader 得到 `SkillDefinition` 后交给 `skillPlugin`。
- **Storage -> skillPlugin**：需要跨会话保留 skill 时，把 storage 作为 `SkillDefinition` provider，从 storage 读取后交给 `skillPlugin`。storage 的优势是支持持久化和按需恢复资源内容；`storage.import(...)` 是把外部 source 导入 storage 的快捷入口，内部包含 loader 流程。

想先看如何把 skill 接入对话请求，可以直接查看 [skillPlugin](#skillplugin) 章节，那里按手动选择和自动选择给出了完整示例。

## 基本数据模型

```typescript
interface SkillDefinition {
  name: string
  description: string
  instructions: string
  resources?: SkillResourceDescriptor[]
  metadata?: Record<string, unknown>
}
```

- `name`：skill 名称。去重和冲突处理由 storage 或业务侧集合负责。
- `description`：能力描述，适合 UI 展示、搜索或自动选择候选摘要。
- `instructions`：注入模型请求的核心指令。
- `resources`：skill 附加文件资源，可通过资源工具按需读取。
- `metadata`：应用侧和 loader 保留的扩展信息。

资源可以是 eager 内容，也可以是 lazy reader：

```typescript
type SkillResourceDescriptor =
  | {
      path: string
      kind: 'text'
      resourceId: string
      text?: string
      readText?: () => Promise<string>
      mimeType?: string
      size?: number
      lastModified?: number
    }
  | {
      path: string
      kind: 'binary'
      resourceId: string
      binary?: Uint8Array
      readBinary?: () => Promise<Uint8Array>
      mimeType?: string
      size?: number
      lastModified?: number
    }
```

`text` / `readText` 至少提供一个，`binary` / `readBinary` 至少提供一个。storage 恢复资源时通常使用 lazy reader，避免把所有文件内容一次性放入内存。

## Loader

Loader 的职责是把平台相关 source 直接转换为 `SkillDefinition`。加载结果是一个可取消的 job：

```typescript
const job = loadSkill(options)
job.cancel()

const skill = await job
console.log(skill.name)
```

### Browser 加载

浏览器安全入口从 `@opentiny/tiny-robot-kit` 导出。可以从 `<input type="file" webkitdirectory>` 或 `showDirectoryPicker()` 加载。

```typescript
import { loadSkill } from '@opentiny/tiny-robot-kit'

async function importFromInput(input: HTMLInputElement) {
  if (!input.files) {
    return
  }

  const skill = await loadSkill({
    source: 'browser',
    fileList: input.files,
  })

  return skill
}
```

```typescript
import { loadSkill } from '@opentiny/tiny-robot-kit'

const directoryHandle = await window.showDirectoryPicker()
const skill = await loadSkill({
  source: 'browser',
  directoryHandle,
})
```

### GitHub 加载

浏览器和 Node 入口都支持 GitHub source：

```typescript
import { loadSkill } from '@opentiny/tiny-robot-kit'

const skill = await loadSkill({
  source: 'github',
  repo: 'openclaw/openclaw',
  // 可选，支持 branch、tag 或 commit SHA；省略时使用仓库默认分支。
  ref: '58672075219d09495de6489ad0821d276ac84f13',
  path: 'skills/weather',
})
```

### Node 文件系统加载

Node-only loader 从 `@opentiny/tiny-robot-kit/node` 导出：

```typescript
import { loadSkill } from '@opentiny/tiny-robot-kit/node'

const skill = await loadSkill({
  source: 'fs',
  root: '/path/to/weather-skill',
})
```

### Warning 和严格模式

需要读取非致命问题时，使用 `loadSkillWithDetails`。启用 `strict` 后，非致命问题会直接抛出为错误。

```typescript
const { skill, warnings } = await loadSkillWithDetails({
  source: 'browser',
  fileList,
  strict: true,
})
```

## Storage

Storage 负责持久化和恢复 `SkillDefinition`。它不管理长期选择状态，也不决定本次请求启用哪些 skill。

```typescript
interface SkillStorage<TImportOptions> {
  add(skill: SkillDefinition): Promise<SkillDefinition>
  get(name: string): Promise<SkillDefinition | undefined>
  has(name: string): Promise<boolean>
  delete(name: string): Promise<boolean>
  list(): Promise<SkillSummary[]>
  import(options: TImportOptions): SkillImportJob
}
```

`add(skill)` 存储已经完整加载好的 `SkillDefinition`。`import(options)` 是 `loader + add` 的快捷组合，会复用 loader 逻辑。

### Browser IndexedDB Storage

```typescript
import { createIndexedDBSkillStorage } from '@opentiny/tiny-robot-kit'

const storage = createIndexedDBSkillStorage({
  databaseName: 'tiny-robot-skills',
})

const importJob = storage.import({
  source: 'browser',
  fileList,
})

const { skill, warnings } = await importJob

console.log(skill.name, warnings)
console.log(await storage.list())
console.log(await storage.get(skill.name))
```

IndexedDB storage 会把 resource 内容持久化到 IndexedDB。后续 `get(name)` 恢复出的 resources 会优先提供 lazy reader，适合在模型真正调用资源工具时再读取内容。

### Memory Storage

Memory storage 适合测试、临时预览或业务侧已经有其他持久化方案的场景。

```typescript
import { createMemorySkillStorage } from '@opentiny/tiny-robot-kit'

const storage = createMemorySkillStorage()

await storage.add(weatherSkill)
const weather = await storage.get('weather')
```

### Node Fs Storage

Node-only storage 从 `@opentiny/tiny-robot-kit/node` 导出。Fs storage 保持原生 skill 目录结构，因此一个已有的 skills 目录可以直接作为 storage root 使用。

```typescript
import { createFsSkillStorage } from '@opentiny/tiny-robot-kit/node'

const storage = createFsSkillStorage({
  root: '/path/to/skills',
})

await storage.add(weatherSkill)
const summaries = await storage.list()
const weather = await storage.get('weather')
```

下面示例展示从示例或本地目录导入 skill，使用 storage 保存，再选择本次请求启用的 skill。

<demo
  vue="../../demos/tools/skill/SkillInspector.vue"
  :vueFiles="[
    '../../demos/tools/skill/SkillInspector.vue',
    '../../demos/tools/skill/useSkillInspector.ts',
    '../../demos/tools/skill/exampleSkillFiles.ts',
    '../../demos/tools/skill/SkillInspector.css'
  ]"
/>

## skillPlugin

`skillPlugin` 用来把本次请求要启用的 skill 接入对话。它不加载、不缓存、不持久化、不管理 skill 集合，只根据当前请求的选择配置启用对应的 skill。

本文档默认展示 Vue 入口的 `skillPlugin` 参数。Vue 入口支持顶层响应式配置，`mode` 默认是 `manual`。`mode`、`skills`、`skillNames`、`preferredSkillNames` 和 `maxSelectedSkills` 都可以传普通值、`ref` 或 `computed`。`selection` 是高级入口，直接返回本次请求的选择配置；如果需要响应式 selection，请传函数并在函数内读取 ref。

由于这些字段都可以是动态 `ref` 或 `computed`，TypeScript 不能可靠地静态判断所有组合。实际使用时按下面的属性组合传参。

### 手动选择

手动选择适合用户通过 `@skillName`、下拉选择或业务按钮明确启用 skill 的场景。

使用完整 skills：`mode: 'manual'` + `skills`。适合业务侧已经持有完整 `SkillDefinition[]`，不需要 `getSkillByName`。

```typescript
const skill = await loadSkill({
  source: 'browser',
  fileList,
})

skillPlugin({
  mode: manualMode, // 可传 ref / computed，默认 manual 时也可以省略
  skills: [skill], // 也可传 ref / computed
})
```

使用 storage：`mode: 'manual'` + `skillNames` + `getSkillByName`。`skillNames` 保存 UI 选中的 names，`getSkillByName` 按 name 从 storage 读取完整定义。

```typescript
skillPlugin({
  mode: manualMode, // 可传 ref / computed，默认 manual 时也可以省略
  skillNames: selectedSkillNames, // 可传 ref / computed
  getSkillByName: (name) => storage.get(name),
})
```

下面示例展示 Vue `skillPlugin` 如何根据响应式 selected names 启用 skill instructions 和资源读取工具。

<demo
  vue="../../demos/tools/skill/VueSkillPlugin.vue"
  :vueFiles="[
    '../../demos/tools/skill/VueSkillPlugin.vue',
    '../../demos/tools/skill/VueSkillPlugin.css'
  ]"
/>

### 自动选择

自动选择适合应用有多个候选 skills，但用户没有明确指定 skill 的场景。

使用完整 skills：`mode: 'auto'` + `skills`。适合业务侧已经持有完整 `SkillDefinition[]`，并把它作为自动选择候选集合。

```typescript
const weather = await loadSkill({
  source: 'browser',
  fileList: weatherFileList,
})
const docs = await loadSkill({
  source: 'browser',
  fileList: docsFileList,
})

skillPlugin({
  mode: autoMode, // 可传 ref / computed
  skills: [weather, docs], // 也可传 ref / computed
  preferredSkillNames, // 可传 ref / computed
  maxSelectedSkills, // 可传 ref / computed
})
```

使用 storage：`mode: 'auto'` + `getSkillCandidates` + `getSkillByName`。`getSkillCandidates` 从 storage 读取候选摘要，`getSkillByName` 按 name 读取完整定义。

```typescript
skillPlugin({
  mode: autoMode, // 可传 ref / computed
  getSkillCandidates: () => storage.list(),
  getSkillByName: (name) => storage.get(name),
  preferredSkillNames, // 可传 ref / computed
  maxSelectedSkills, // 可传 ref / computed
})
```

auto 模式会先让模型看到候选 skill 的 `name` / `description` / `metadata`，并提供 `select_skills` 工具。模型选择后，插件再解析完整 skill，并把所选 skill 的 `instructions` 和 resource tools 提供给后续请求阶段。

`preferredSkillNames` 是自动选择的偏好，不是最终启用结果。最终启用结果以 `select_skills` 和 `getSkillByName` 的解析结果为准。

### 使用 selection

`selection` 适合在每次请求前动态返回完整选择配置。传入 `selection` 后，会覆盖顶层的 `mode`、`skills`、`skillNames`、`preferredSkillNames` 和 `maxSelectedSkills`。

手动选择：

```typescript
skillPlugin({
  selection: () => ({
    mode: 'manual',
    skillNames: selectedSkillNames.value,
  }),
  getSkillByName: (name) => storage.get(name),
})
```

自动选择：

```typescript
skillPlugin({
  selection: () => ({
    mode: 'auto',
    preferredSkillNames: preferredSkillNames.value,
    maxSelectedSkills: maxSelectedSkills.value,
  }),
  getSkillCandidates: () => storage.list(),
  getSkillByName: (name) => storage.get(name),
})
```

:::info 资源文件工具
当已启用的 skill 带有 `resources` 时，`skillPlugin` 会自动提供 `list_skill_files` 和 `read_skill_file`。插件注入的 system instructions 会要求模型先调用 `list_skill_files` 查看文件列表，再根据明确的 `skillName` 和相对路径调用 `read_skill_file`；`read_skill_file` 用于读取文本资源内容。
:::

## SkillRequestContext

`onSkillsResolved` 可以读取当前请求的 skill 解析结果：

```typescript
skillPlugin({
  mode: 'manual',
  skillNames: ['weather', 'missing-skill'],
  getSkillByName: (name) => storage.get(name),
  onSkillsResolved(skillContext) {
    console.log(skillContext.skillNames)
    console.log(skillContext.requestedSkillNames)
    console.log(skillContext.unresolvedSkillNames)
  },
})
```

```typescript
interface SkillRequestContext {
  skills: SkillDefinition[]
  skillNames: string[]
  requestedSkillNames: string[]
  unresolvedSkillNames: string[]
  runtimeTools: RuntimeTool[]
  selection:
    | { mode: 'manual' | 'none'; phase: 'ready' }
    | {
        mode: 'auto'
        phase: 'selecting'
        candidates: SkillCandidate[]
        preferredSkillNames?: string[]
      }
    | {
        mode: 'auto'
        phase: 'ready'
        candidates: SkillCandidate[]
        preferredSkillNames?: string[]
      }
}
```

- `skillNames`：成功启用的 skill names。
- `requestedSkillNames`：manual 或 auto 请求启用的 skill names。
- `unresolvedSkillNames`：请求启用但没有成功解析的 skill names。
- `runtimeTools`：当前请求阶段提供给模型使用的工具。
- `selection`：当前 selection 阶段状态。

auto 模式下还可以监听模型的选择事件：

```typescript
skillPlugin({
  mode: 'auto',
  getSkillCandidates: () => storage.list(),
  getSkillByName: (name) => storage.get(name),
  onSkillSelectionResolved(event) {
    console.log(event.requestedSkillNames)
  },
})
```

## API

### Loader

```typescript
type SkillLoadJob<T = SkillDefinition> = Promise<T> & {
  cancel(): void
}

interface SkillLoadResult {
  skill: SkillDefinition
  warnings: Array<{
    code: string
    message: string
    path?: string
  }>
}

function loadSkill(options: BrowserSkillLoadOptions | GithubSkillLoadOptions): SkillLoadJob
function loadSkillWithDetails(options: BrowserSkillLoadOptions | GithubSkillLoadOptions): SkillLoadJob<SkillLoadResult>
```

Node 子入口额外支持 `source: 'fs'`：

```typescript
function loadSkill(options: FsSkillLoadOptions | GithubSkillLoadOptions): SkillLoadJob
function loadSkillWithDetails(options: FsSkillLoadOptions | GithubSkillLoadOptions): SkillLoadJob<SkillLoadResult>
```

### Storage

```typescript
interface SkillSummary {
  name: string
  description: string
  resourceCount: number
  metadata?: Record<string, unknown>
}

interface SkillImportResult {
  name: string
  skill: SkillDefinition
  warnings: SkillLoadWarning[]
}

type SkillImportJob = Promise<SkillImportResult> & {
  cancel(): void
}

interface SkillStorage<TImportOptions> {
  add(skill: SkillDefinition): Promise<SkillDefinition>
  get(name: string): Promise<SkillDefinition | undefined>
  has(name: string): Promise<boolean>
  delete(name: string): Promise<boolean>
  list(): Promise<SkillSummary[]>
  import(options: TImportOptions): SkillImportJob
}
```

### skillPlugin

```typescript
type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

type SkillSelection =
  | { mode: 'manual'; skills: SkillDefinition[] }
  | { mode: 'manual'; skillNames: string[] }
  | { mode: 'auto'; preferredSkillNames?: string[]; maxSelectedSkills?: number }
  | { mode: 'none' }

interface UseMessageSkillPluginOptions {
  /**
   * 默认 manual。支持普通值、ref 或 computed。
   */
  mode?: MaybeRef<'manual' | 'auto' | 'none' | undefined>
  /**
   * manual 模式下表示已选中的完整 skills。
   * auto 模式下表示候选 skill 集合，同时作为默认 getSkillByName 来源。
   */
  skills?: MaybeRef<SkillDefinition[] | undefined>
  /**
   * manual 模式下的已选 skill names。使用时需要提供 getSkillByName。
   */
  skillNames?: MaybeRef<string[] | undefined>
  /**
   * auto 模式下的选择偏好，不是最终启用结果。
   */
  preferredSkillNames?: MaybeRef<string[] | undefined>
  /**
   * auto 模式下最多启用的 skill 数。
   */
  maxSelectedSkills?: MaybeRef<number | undefined>
  /**
   * 高级入口。传入后会覆盖顶层 mode / skills / skillNames / preferredSkillNames 配置。
   * plain object 不解包 ref；需要响应式 selection 时请传函数。
   */
  selection?: SkillSelection | ((context: BasePluginContext) => MaybePromise<SkillSelection>)
  getSkillCandidates?: (context: BasePluginContext) => MaybePromise<SkillCandidate[]>
  getSkillByName?: (name: string, context: BasePluginContext) => MaybePromise<SkillDefinition | undefined>
  onSkillsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
  onSkillSelectionResolved?: (
    event: {
      mode: 'auto'
      candidates: SkillCandidate[]
      preferredSkillNames?: string[]
      requestedSkillNames: string[]
    },
    context: BasePluginContext,
  ) => MaybePromise<void>
}
```
