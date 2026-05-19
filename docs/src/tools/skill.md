---
outline: [1, 3]
---

# Skill 技能工具链

Skill 是一组可复用的能力模板。一个 skill 至少包含名称、描述和指令，也可以携带文件资源。`@opentiny/tiny-robot-kit` 中的 skill 工具链分为三层：

- **File Adapters**：把不同平台的文件来源转换为统一的 `SkillFile[]`。
- **Loader / Manager**：把 `SkillFile[]` 解析为 `SkillDefinition`，并管理 skill 集合与选择状态。
- **Compiler**：把已选 `SkillDefinition[]` 编译为 message engine 可消费的 instructions 和运行时文件工具。

## 基本数据模型

```typescript
interface SkillDefinition {
  name: string
  description: string
  instructions: string
  files?: SkillFileResource[]
  metadata?: Record<string, unknown>
}
```

- `name`：skill 唯一名称，用于去重、选择和读取文件资源。
- `description`：能力描述，适合用于 UI 展示、搜索或后续自动选择 skill。
- `instructions`：注入模型请求的核心指令，必填。
- `files`：skill 目录中的附加文件资源，可通过基础文件工具读取。

## Loader

Loader 的职责是把标准化后的 `SkillFile[]` 解析为 `SkillDefinition`。它不负责读取本地文件、浏览器文件或远程资源；这些工作由 file adapters 完成。

### Node.js 目录加载

`loadSkillFilesFromFs` 会把本地目录读取为 `SkillFile[]`，再交给 `SkillLoader` 解析。

```typescript
import { SkillLoader } from '@opentiny/tiny-robot-kit/core'
import { loadSkillFilesFromFs } from '@opentiny/tiny-robot-kit/node'

const files = await loadSkillFilesFromFs('/path/to/weather-skill')
const result = new SkillLoader().load(files)

console.log(result.skill.name)
console.log(result.skill.description)
console.log(result.skill.instructions)
console.log(result.warnings)
```

### Browser 文件加载

浏览器侧可以把 `<input type="file" webkitdirectory>` 选择出的文件列表转换为 `SkillFile[]`。

```typescript
import { SkillLoader, loadSkillFilesFromFileList } from '@opentiny/tiny-robot-kit/core'

async function importFromInput(input: HTMLInputElement) {
  if (!input.files) {
    return
  }

  const files = await loadSkillFilesFromFileList(input.files)
  return new SkillLoader().load(files)
}
```

如果使用 `window.showDirectoryPicker()`，可以使用 `loadSkillFilesFromDirectoryHandle`：

```typescript
import { SkillLoader, loadSkillFilesFromDirectoryHandle } from '@opentiny/tiny-robot-kit/core'

const directoryHandle = await window.showDirectoryPicker()
const files = await loadSkillFilesFromDirectoryHandle(directoryHandle)
const result = new SkillLoader().load(files)
```

### SKILL.md 结构

`SkillLoader` 默认读取 `SKILL.md` 作为入口文件。frontmatter 中的 `name` 和 `description` 会写入 `SkillDefinition`，正文会作为必填 `instructions`。

````markdown
---
name: weather
description: Get current weather and forecast information.
homepage: https://wttr.in/:help
---

# Weather Skill

Use wttr.in when the user asks about current weather or forecasts.
Prefer concise answers and include the location in the response.
````

### Warning 和严格模式

非致命问题会放到 `SkillLoaderResult.warnings` 中，例如重复路径、无法解析工具文件等。

```typescript
const result = new SkillLoader().load(files)

for (const warning of result.warnings) {
  console.warn(warning.code, warning.path, warning.message)
}
```

如果希望 warning 直接抛出为错误，可以启用严格模式：

```typescript
const result = new SkillLoader({ strict: true }).load(files)
```

## Manager

`SkillManager` 是框架无关的 skill 集合管理工具。它只负责保存、删除、导入、选择 skills，不编译 prompt 或 tools，也不接入 message 生命周期。

### 管理 skill 集合

```typescript
import { SkillManager } from '@opentiny/tiny-robot-kit/core'

const manager = new SkillManager()

manager.set({
  name: 'weather',
  description: 'Get current weather information.',
  instructions: 'Use weather context when the user asks about weather.',
})

console.log(manager.has('weather')) // true
console.log(manager.get('weather'))
console.log(manager.list())

manager.remove('weather')
```

`set(skill)` 是唯一写入入口：不存在时新增，同名存在时覆盖。

### 选择本次请求使用的 skills

manager 内部可以维护选择状态。这个状态适合由 UI 或业务逻辑驱动，再交给 `skillPlugin` 读取。

```typescript
manager.set(weatherSkill)
manager.set(vueSkill)

manager.select(['weather', 'vue-best-practices'])

const selectedSkills = manager.getSelectedSkills()
const selectedSkillNames = manager.getSelectedSkillNames()

manager.unselect('weather')
```

选择不存在的 skill 会抛错：

```typescript
manager.select('missing-skill') // throws
```

### 导入 skill

`SkillManager.import()` 会复用 `SkillLoader`，把 `SkillFile[]` 导入为 skill 并写入 manager。

```typescript
import { SkillManager } from '@opentiny/tiny-robot-kit/core'
import { loadSkillFilesFromFs } from '@opentiny/tiny-robot-kit/node'

const manager = new SkillManager()
const files = await loadSkillFilesFromFs('/path/to/weather-skill')
const result = manager.import(files)

console.log(result.skill.name)
console.log(manager.get(result.skill.name))
```

可以透传 `SkillLoaderOptions`：

```typescript
manager.import(files, {
  entryFile: 'README.md',
  strict: true,
})
```

### 搭配 skillPlugin

`SkillManager` 可以和 `skillPlugin` 一起使用。manager 负责选择，`skillPlugin` 负责把已选 skills 编译进 message engine。

```typescript
import { skillPlugin, useMessage } from '@opentiny/tiny-robot-kit'
import { SkillManager } from '@opentiny/tiny-robot-kit/core'

const manager = new SkillManager({
  skills: [weatherSkill, vueSkill],
  selectedSkillNames: ['weather'],
})

const message = useMessage({
  responseProvider,
  plugins: [
    skillPlugin({
      getSkills: () => manager.getSelectedSkills(),
    }),
  ],
})
```

在 Vue 中也可以直接传入响应式的 skills：

<demo
  vue="../../demos/tools/skill/VueSkillPlugin.vue"
  :vueFiles="[
    '../../demos/tools/skill/VueSkillPlugin.vue',
    '../../demos/tools/skill/VueSkillPlugin.css'
  ]"
/>

## Compiler

Compiler 是纯转换层：输入 `SkillDefinition[]`，输出 message engine 可消费的 instructions 和运行时文件工具。

### 编译 instructions

```typescript
import { compileSkillInstructions } from '@opentiny/tiny-robot-kit/core'

const systemMessage = await compileSkillInstructions([weatherSkill, vueSkill])
```

编译后的结果是一个 system message：

```typescript
{
  role: 'system',
  content: 'Apply these skill instructions when generating the response.\n\n## weather\n\n...'
}
```

空白 instructions 会被忽略。如果没有任何可用 instructions，则返回 `undefined`。

### 创建基础文件工具

```typescript
import { createSkillRuntimeTools } from '@opentiny/tiny-robot-kit/core'

const runtimeTools = createSkillRuntimeTools([docsSkill])
```

当任意 skill 带有 `files` 时，会生成两个基础 runtime tools：

- `list_skill_files`：列出当前 skills 携带的文件资源。
- `read_skill_file`：按 `skillName` 和相对路径读取文本文件内容。

```typescript
import { createSkillRuntimeTools } from '@opentiny/tiny-robot-kit/core'

const runtimeTools = createSkillRuntimeTools([docsSkill])
const [listFiles, readFile] = runtimeTools

const listed = await listFiles.handler(
  {
    id: 'call_1',
    type: 'function',
    function: {
      name: 'list_skill_files',
      arguments: JSON.stringify({ skillName: 'docs' }),
    },
  },
  {} as never,
)

const content = await readFile.handler(
  {
    id: 'call_2',
    type: 'function',
    function: {
      name: 'read_skill_file',
      arguments: JSON.stringify({
        skillName: 'docs',
        path: 'references/guide.md',
      }),
    },
  },
  {} as never,
)
```

二进制文件不会返回内容，只返回文件摘要和 `binary_file_not_readable` 错误。

## 与 message 插件体系的关系

`skillPlugin` 是 message runtime adapter。它不加载、不选择、不缓存、不管理 skills，只通过 `getSkills()` 接收本次请求要使用的 skills。

内部流程：

1. `onTurnStart`：读取 `getSkills()`，创建基础文件工具，并把 skills 与 runtime tools 写入 `customContext.__tiny_robot_skill`。
2. `provideTools`：从插件状态中读取 runtime tools，并暴露给 message engine。
3. `onBeforeRequest`：调用 `compileSkillInstructions(skills)`，把 system message 插入到请求消息最前面。

```typescript
import { skillPlugin, useMessage } from '@opentiny/tiny-robot-kit'

useMessage({
  responseProvider,
  plugins: [
    skillPlugin({
      getSkills: () => manager.getSelectedSkills(),
    }),
  ],
})
```
