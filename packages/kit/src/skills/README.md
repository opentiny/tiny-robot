# Skill Toolchain Architecture

本文档面向维护者，用于说明 `packages/kit/src/skills` 中各模块的职责边界。面向使用者的 API 文档和交互示例放在 `docs/src/tools/skill.md`。

## 目标

skill 是一组可复用的能力模板。它可以从文件加载，被业务侧管理和选择，并在请求前转换为模型可消费的 instructions 和基础文件工具。

skill 核心能力不依赖 Vue，浏览器安全 API 从 `@opentiny/tiny-robot-kit/core` 导出；Node 文件系统能力从 `@opentiny/tiny-robot-kit/node` 导出。

## 核心数据

`SkillDefinition` 是 loader、manager、compiler 之间流转的核心数据结构：

```ts
interface SkillDefinition {
  name: string
  description: string
  instructions: string
  files?: SkillFile[]
  metadata?: Record<string, unknown>
}
```

- `name`：skill 唯一名称，由 manager 负责集合层面的覆盖和选择。
- `description`：用于展示、搜索或后续自动选择。
- `instructions`：注入模型请求的核心指令。
- `files`：随 skill 携带的附加文件资源，可由基础文件工具读取。
- `metadata`：应用侧和 loader 保留的扩展信息。

## 模块职责

### `types.ts`

定义 skill 工具链的共享类型：

- `SkillDefinition`
- `SkillFile`
- 文本和二进制 skill 文件类型

该文件不包含运行逻辑。

### `utils.ts`

提供 skill 文件路径和文本文件判断工具：

- `normalizeSkillPath`
- `isTextSkillFilePath`
- `getExtension`

这些工具只处理文件路径和扩展名，不解析 skill 语义。

### `browserSkillFiles.ts`

浏览器文件适配器。负责把浏览器文件来源转换为标准 `SkillFile[]`：

- `loadSkillFilesFromFileList`
- `loadSkillFilesFromDirectoryHandle`

该模块只读取文件内容并标准化路径，不解析 `SKILL.md`。

### `fsSkillFiles.ts`

Node 文件适配器。负责把本地目录转换为标准 `SkillFile[]`：

- `loadSkillFilesFromFs`

该模块依赖 Node `fs/path`，只能从 `@opentiny/tiny-robot-kit/node` 子入口导出，不能从浏览器根入口导出。

### `skillLoader.ts`

loader 层。负责把 `SkillFile[]` 解析为 `SkillDefinition`：

- 查找入口文件，默认 `SKILL.md`
- 解析 frontmatter
- 将正文转换为必填 `instructions`
- 将其他支持的文件转换为 `files`
- 收集非致命 warnings

loader 不负责：

- 读取文件系统或浏览器文件
- 保存 skill 集合
- 选择 skill
- 编译 message 请求

### `manager.ts`

manager 层。负责 skill 集合和选择状态：

- `set(skill)`：新增或覆盖同名 skill
- `remove(name)` / `clear()`
- `get(name)` / `has(name)` / `list()`
- `select(names)` / `unselect(names)`
- `getSelectedSkillNames()` / `getSelectedSkills()`
- `import(files, options)`：通过 `SkillLoader` 导入 skill

manager 不负责编译 instructions 或 runtime tools。

### `compiler.ts`

compiler 层只保留两个纯转换函数：

- `compileSkillInstructions(skills)`
- `createSkillRuntimeTools(skills, options?)`

`compileSkillInstructions` 将已选择的 skills 转换为 system message。

`createSkillRuntimeTools` 根据 `skill.files` 创建基础文件工具：

- `list_skill_files`
- `read_skill_file`

当传入 `options.executeSkillCommand` 时，它会额外创建命令执行工具：

- `execute_skill_command`

compiler 不负责：

- skill 去重
- 选择状态
- 持久化
- 集合管理

### `index.ts`

skill core 的统一导出口。该入口会被 `@opentiny/tiny-robot-kit/core` 重新导出。

不要在这里导出 Node-only API，例如 `loadSkillFilesFromFs`。

## Message 接入

message 接入代码不放在 `src/skills` 下：

- core message adapter：`packages/kit/src/message/plugins/skillPlugin.ts`
- Vue message adapter：`packages/kit/src/vue/message/plugins/skillPlugin.ts`

`skillPlugin` 的职责是把调用方传入的当前 skills 接入 message 生命周期：

1. `onTurnStart` 读取 `getSkills()` 或 Vue 侧响应式 `skills`。
2. 创建 `runtimeTools = createSkillRuntimeTools(skills, options)`。
3. 将 `{ skills, skillNames, runtimeTools }` 写入 `customContext.__tiny_robot_skill`。
4. `provideTools` 暴露 `runtimeTools`。
5. `onBeforeRequest` 调用 `compileSkillInstructions(skills)` 并 prepend system message。

`skillPlugin` 不加载、不缓存、不选择、不管理 skill 集合。

## 数据流

```mermaid
flowchart TD
  A["File source<br/>FileList / DirectoryHandle / fs directory"] --> B["file adapter"]
  B -->|"SkillFile[]"| C["SkillLoader"]
  C -->|"SkillDefinition"| D["SkillManager"]
  D -->|"selected SkillDefinition[]"| E["skillPlugin"]
  E --> F["compileSkillInstructions"]
  E --> G["createSkillRuntimeTools"]
  F --> H["system message"]
  G --> I["runtime tools"]
```

## Sandbox Command Execution

部分 skill 需要专门的后端运行环境才能执行命令，例如 PPT、PDF、浏览器自动化或文档处理。`kit` 不内置这些后端能力；当前设计是让模型根据已启用 skill 的 instructions 自行规划命令和参数，再由应用侧 executor 转发到后端沙箱执行。

推荐工具形态：

```ts
execute_skill_command({
  skillName: string
  command: string
  args: string[]
})
```

该阶段不要求从 `SKILL.md` 提取命令 allowlist，也不要求 compiler 生成命令枚举。`SKILL.md` 仍然是自然语言说明，模型可以根据说明决定 `command` 和 `args`。

职责边界：

- `createSkillRuntimeTools(skills, { executeSkillCommand })` 创建 `execute_skill_command` runtime tool。
- `skillPlugin` 在传入 `executeSkillCommand` 时暴露 `execute_skill_command`。
- 应用侧 executor 负责选择后端运行环境、鉴权、沙箱、超时、日志、产物管理和错误返回。
- 后端必须把模型返回的 `command` / `args` 视为不可信输入。

后端执行约束：

- 在隔离环境中执行，例如容器、临时 workspace、受限用户或专用任务服务。
- 使用 argv 方式执行命令，例如 `spawn(command, args, { shell: false })`。
- 不把 `command` 和 `args` 拼接成 shell 字符串执行。
- 设置超时、输出大小限制和并发限制。
- 限制可访问的文件目录和网络能力。
- 对危险命令、高成本命令或写入性操作保留业务侧确认能力。

推荐返回结构：

```ts
type SkillArtifact = {
  id: string
  name: string
  mimeType?: string
  size?: number
  url?: string
  textAvailable?: boolean
  previewAvailable?: boolean
  metadata?: Record<string, unknown>
}

type SkillCommandResult = {
  ok: boolean
  exitCode?: number
  stdout?: string
  stderr?: string
  artifacts?: SkillArtifact[]
  error?: {
    code: string
    message: string
  }
}
```

### Artifact 产物模型

命令执行可能生成 PDF、PPTX、图片、压缩包等二进制文件。这些内容不应通过 tool message 直接传给模型，也不应以 base64 放进 `stdout`。后端沙箱应把文件写入受控的 artifact store，再在 `SkillCommandResult.artifacts` 中返回引用信息。

artifact store 可以是：

- 应用后端的临时目录和下载接口。
- 对象存储，例如 S3、OSS、MinIO。
- 专用任务服务提供的产物访问接口。

artifact 必须绑定用户、会话、请求或 sandbox run，不能只依赖裸 `artifactId` 做访问控制。`url` 应由应用侧决定是内部代理地址、短期 signed URL，还是仅供前端预览使用的下载地址。

推荐链路：

```mermaid
sequenceDiagram
  participant Model as 大模型
  participant App as kit / 应用侧 executor
  participant Sandbox as 后端沙箱
  participant Store as Artifact store

  Model->>App: execute_skill_command(skillName, command, args)
  App->>Sandbox: 按 skill runtime 执行 argv 命令
  Sandbox->>Store: 写入二进制产物
  Store-->>Sandbox: artifact metadata / url
  Sandbox-->>App: stdout / stderr / artifacts
  App-->>Model: tool result: artifact 引用和摘要
  Model->>App: 可选：读取 artifact 文本或摘要
  App->>Store: 可选：读取已提取文本 / 预览信息
  Store-->>App: artifact text / info
  App-->>Model: 可选：artifact text / info
```

后续如果模型需要继续理解产物内容，可以在 `createSkillRuntimeTools` 中扩展 artifact 读取能力，例如：

- `list_skill_artifacts`
- `get_skill_artifact_info`
- `read_skill_artifact_text`

这些工具应返回文本、摘要或元数据，不返回原始二进制内容。第一阶段可以只让 `execute_skill_command` 返回 `artifacts` 引用，由前端或应用侧负责展示、下载和预览。

后续如果 skill 命令逐渐稳定，可以再引入机器可读 manifest，把自由命令收敛为 command allowlist 和参数 schema。这个 manifest 属于后续增强，不影响当前基于沙箱的第一阶段设计。

## Auto Skill Selection

auto skill selection 是一个未来的 selector 层能力，用于让模型根据用户问题从候选 skills 中选择本次请求要启用的 skills。它不属于 `skillPlugin`、compiler 或 manager 的当前职责。

推荐链路：

```mermaid
sequenceDiagram
  participant App as 用户 / 应用
  participant Model as 大模型

  App->>Model: 用户问题 + 候选 skill descriptions
  Model->>App: 调用 selectSkills(skillNames)
  App->>App: 记录请求级 selected skill names
  App->>App: skillPlugin 编译已选 skills
  App->>Model: execution turn + instructions + 基础文件工具
  Model->>App: 基于已启用 skills 生成回答
```

职责边界：

- `SkillManager` 管理全部可用 skills。
- `SkillSelector` 根据用户问题和候选 skill descriptions 产出本次请求的 selected skill names。
- `skillPlugin` 只读取 selected `SkillDefinition[]`，并编译 instructions 和基础文件工具。
- auto selection 的结果应写入请求级状态，例如 `customContext.__tiny_robot_selected_skills`，不能直接写入 manager 的长期选择状态。

selector 阶段只提供候选摘要，不提供完整 instructions：

```txt
Available skills:
- weather: Get current weather information.
- vue-best-practices: Vue.js best practices workflow.
```

selector 工具可以设计为：

```ts
selectSkills({
  skillNames: string[]
})
```

工具 JSON schema 应使用候选 skill names 限制可选范围：

```json
{
  "type": "object",
  "properties": {
    "skillNames": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["weather", "vue-best-practices"]
      }
    }
  },
  "required": ["skillNames"],
  "additionalProperties": false
}
```

selector 工具返回值建议是结构化结果，便于调试和日志记录：

```json
{
  "selectedSkillNames": ["vue-best-practices"]
}
```

execution 阶段再把 selected skill definitions 交给 `skillPlugin`：

```ts
skillPlugin({
  getSkills: (context) => context.customContext.__tiny_robot_selected_skills ?? [],
})
```

为了避免循环调用，selector 层应维护请求级状态，例如：

```ts
selectionStatus: 'pending' | 'done'
```

- `pending` 阶段提供 `selectSkills` 工具。
- `done` 阶段不再提供 selector 工具。
- `selectSkills` 每个请求最多调用一次。

## 后续事项

- 为 `read_skill_file` 增加大小限制和截断策略。
- 为重复 skill 名称增加诊断能力，优先放在 manager 或选择逻辑中。
- 评估 auto skill selection 是否需要独立 selector 层。
- search text tool
- 消息模型
  system skill name + description, prompt提示当前环境
  user message
  llm select，直接获取skill file
- mcp沙盒
- 手动@选择一个skill，system prompt提示优先使用当前skill
- 文件存储 storageStrategy
- 文档描述优化
