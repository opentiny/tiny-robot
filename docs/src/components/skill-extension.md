---
outline: [1, 3]
---

# Skill 扩展导入与详情

`SkillImportForm` 提供本地文件夹、ZIP/TAR 系列压缩包和 GitHub 三种 Skill 导入界面，并在解析成功后把 Skill 定义交给应用；`SkillExtensionDetail` 展示已取得的定义、说明和资源，并允许编辑 Skill 正文或文本资源。应用可以将两者放在自己的页面、Dialog 或 Drawer 中，并自行决定数据来源、保存方式及容器行为。

## 概览

### 适用场景

- 从本地文件夹、ZIP/TAR 系列压缩包或 GitHub 仓库路径取得一个 Skill 定义。
- 展示 Skill 的说明与资源清单，让用户了解已加载的内容。
- 与 [ExtensionManager](./extension-manager.md) 组合时，由应用处理通用操作事件，打开对应界面并更新扩展列表。

### 职责边界

导入表单管理输入、校验、解析中的加载状态和错误反馈；默认解析器由 kit 提供。**解析不等于持久化**：应用收到 Skill 定义后，仍需自行保存并更新扩展列表。详情组件负责读取定义提供的文本、二进制或懒加载资源，维护编辑状态并通过 `save` 输出新定义；长期持久化、弹窗标题、关闭和焦点管理由应用负责。

Loader、Storage 和运行时 `skillPlugin` 的职责见 [Skill 技能接入](../tools/skill.md)；本页只说明 Vue 导入与详情组件。

## 快速开始：先看一个 Skill 定义

`@opentiny/tiny-robot-kit` 是组件库的 peer dependency。使用默认解析器前应安装两个包：

::: code-group

```bash [pnpm]
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-kit
```

```bash [yarn]
yarn add @opentiny/tiny-robot @opentiny/tiny-robot-kit
```

```bash [npm]
npm install @opentiny/tiny-robot @opentiny/tiny-robot-kit
```

:::

最小接入可以先直接准备一个内联 `SkillDefinition`，理解 `instructions`、`resources` 与详情组件之间的关系；这个示例不需要 GitHub 网络。

<demo
  vue="../../demos/skill-import-form/basic.vue"
  title="最小 Skill 定义"
  description="使用内联 SkillDefinition 查看 SKILL.md 和文本资源，不依赖网络。"
/>

实际应用通常把 `SkillDefinition` 放在应用状态或 Storage 中，再传给 `SkillExtensionDetail`。导入表单和详情组件通过 `submit` 事件连接，不由组件自动持久化。

## 导入 Skill

### 导入本地文件夹

`source="local"` 时，用户选择或拖入一个包含根目录 `SKILL.md` 的文件夹。组件先检查目录结构及文件总大小，再立即调用解析器；解析成功后仍需点击“确定”才触发 `submit`。默认上限是 10 MB，可用 `max-upload-size` 调整。

可准备一个 `example-skill/SKILL.md` 文件来体验下面的 Demo：

```md
---
name: example-skill
description: 用于试用 Skill 导入。
---

# 使用说明

请总结输入文档的要点。
```

此 Demo 使用 kit 默认解析器。移除已选择的文件夹可重新选择；“取消”只通知应用，不清空组件内部草稿。示例外部的“重置示例”可恢复初始界面。

<demo
  vue="../../demos/skill-import-form/local-import.vue"
  title="本地文件夹与默认解析器"
  description="选择包含 SKILL.md 的文件夹，确认后查看应用收到的定义。"
/>

### 导入压缩包

`source="archive"` 接受 `.zip`、`.tar`、`.tar.gz` 和 `.tgz`。归档根目录直接包含 `SKILL.md`，或唯一顶层目录直接包含它；选择或拖入归档，解析成功后点击“确定”提交。Kit 的归档 API 和资源限制详见[Skill 工具文档](../tools/skill.md#归档加载)。默认解析器会执行 Kit 的展开大小限制；自定义 `resolve-skill` 收到 `{ source: 'archive', file, maxUncompressedSize }`，应遵守传入的解压限制。`max-upload-size` 同时限制选择的压缩文件大小，以及本地文件夹文件总大小；使用 Kit 默认解析器时，它也作为解压内容大小限制。应用收到定义后仍需自行保存。

可[下载 Skill 示例压缩包](/skill-import-example.zip)体验下方 Demo。

<demo
  vue="../../demos/skill-import-form/archive-import.vue"
  title="导入 Skill 压缩包"
  description="选择或拖入归档，解析成功后点击确定查看 Skill 定义。"
/>

示例包采用单层包装目录；也可以将 `SKILL.md` 和资源直接放在压缩包根目录，结构如下。

```text
根目录入口
├── SKILL.md
└── references/
    └── 说明.md

单层包装目录入口
example-skill/
├── SKILL.md
└── references/
    └── 说明.md
```

### 从 GitHub 导入

`source="github"` 接受带 Skill 子目录的 HTTPS GitHub `tree` 地址，或直接指向 `SKILL.md` 的 `blob` 地址。默认解析器会查询仓库真实的分支和标签，按最长匹配确定 `ref` 与目录边界，也支持 40 位 commit SHA。示例需要能访问 GitHub；网络请求或限流失败时，表单会显示错误。

<demo
  vue="../../demos/skill-import-form/github-import.vue"
  title="从 GitHub 地址导入并查看"
  description="导入成功后直接把 SkillDefinition 传给详情组件查看正文和资源。"
/>

### 自定义解析器的状态、失败与重试

点击“导入”后，组件把规范化的输入交给解析器；成功时触发 `submit`，失败时在组件内显示错误。自定义解析器若需要 `ref` 和目录边界，必须自行解析，或调用 kit 的加载能力。下面的示例用手动完成的本地 Promise 展示加载、成功和失败，不依赖真实网络，并可再次导入或重置。

<demo
  vue="../../demos/skill-import-form/resolver-states.vue"
  title="解析状态与重试"
  description="控制本地解析结果，观察加载、错误、成功以及重试路径。"
/>

默认解析超时为 30 秒，可通过 `resolve-timeout` 调整；设为 `0` 表示不超时。超时后组件停止等待并忽略晚到结果，但不会取消已经发出的请求。切换 `source` 会清空组件内的文件选择、GitHub 地址和错误。若容器关闭后任务仍要继续，应用应自行持有任务并提供后续通知；组件卸载后不再显示解析反馈。

### 查看 Skill 详情

将已取得的 `SkillDefinition` 传给 `SkillExtensionDetail`，即可显示 Skill 名称、描述、更新时间和文件浏览区。左侧目录树包含 `SKILL.md` 及 Skill 的资源文件；选择文件后，右侧查看内容。Markdown 文件会渲染为格式化内容，文本资源支持按需读取；图片资源可预览，其他二进制资源可下载。组件不会自动获取远程资源，内容由定义中的 `text`、`binary` 或惰性读取器提供。

<demo
  vue="../../demos/skill-extension-detail/basic.vue"
  title="查看 Skill 详情"
  description="浏览 Skill 文件树并查看说明正文和资源文件。"
/>

### Skill 编辑与文件管理

下面的示例单独展示编辑流程。示例默认选中 `SKILL.md`，可以直接点击右侧文件标题栏的“编辑”进入编辑态；保存后，示例会更新传入的定义并显示保存提示。

<demo
  vue="../../demos/skill-extension-detail/editing.vue"
  title="编辑 Skill 正文"
  description="点击右侧文件标题栏的“编辑”，切换可视化或源码模式并保存；也可以选择文本资源编辑。"
/>

#### 编辑入口

`SkillExtensionDetail` 默认使用 `mode="view"`，只展示文件和内容，不显示编辑按钮或文件树操作。需要启用编辑界面时，显式传入 `mode="edit"`：

```vue
<tr-skill-extension-detail mode="edit" :definition="definition" @save="handleSave" />
```

在编辑模式中，选中文本资源后右侧文件标题栏显示“编辑”按钮；二进制资源只显示预览或下载。根目录 `SKILL.md` 在编辑模式下允许编辑。点击“编辑”后：

1. Markdown 文件进入可视化编辑，切换“源码编辑”可以直接修改 Markdown。
2. 其他文本文件进入文本编辑框。
3. 点击“保存”触发 `save` 事件，应用需要保存事件中的新 `SkillDefinition`，并将它重新传给组件。

```vue
<tr-skill-extension-detail mode="edit" :definition="definition" @save="handleSave" />
```

```ts
const handleSave = (nextDefinition: SkillDefinition) => {
  saveDefinition(nextDefinition)
}
```

“编辑”入口位于右侧文件标题栏；左侧文件树中的新增、删除和重命名操作也只在 `mode="edit"` 时出现。

编辑期间切换文件时，如果当前文件有未保存修改，会显示确认提示，用户可以选择保存并切换、放弃修改或取消。

#### 编辑模式与文件树操作

`mode="view"` 控制详情是否展示编辑能力；`mode="edit"` 下，文本资源可以编辑，二进制资源仍只读。根目录 `SKILL.md` 跟随详情模式允许编辑。

文件树操作由组件提供固定交互，包括新增文件、新增文件夹、删除文件、删除文件夹和重命名。每次操作都会立即更新组件状态，并通过 `save` 事件提供新的 `SkillDefinition`；同时通过 `file-action` 事件通知应用操作类型，应用通常只需要在 `save` 中统一持久化。`SkillDefinition.directories` 用于持久化空目录。

文件树操作统一由 `mode="edit"` 控制；当前组件不支持自定义文件树 action 列表或 action resolver。

## 可访问性与设计约束

本地文件选择区支持键盘访问；移除文件夹后焦点回到上传入口。GitHub 地址无效时输入框会标记错误并获得焦点，解析错误以可见提示呈现。解析期间提交按钮不可用，用户可以在失败后修改输入并重试。

查看模式下，文件树中的文件和文件夹按钮支持键盘操作；内容预览区域可聚焦并在自身区域内滚动，适合阅读和复制长文本。不要把预览区域的 Ctrl+A/Command+A 当作“只选正文”的契约；需要精确编辑或全选正文时，请切换到源码编辑或文本编辑控件。文件树和内容预览区域在自身区域内滚动，不会无限拉长详情。文件浏览区域默认最小高度为 `500px`、最大高度为 `600px`，可用下方 CSS 变量调整。导入器将 YAML 头部解析为名称和描述，因此此处展示的是 `instructions` 正文。资源路径允许换行。查看模式下详情只展示内容；页面或弹窗的标题、关闭按钮、焦点返回和持久化由宿主及应用负责。

## API

组件和以下类型均从 `@opentiny/tiny-robot` 导入；示例使用 `TrSkillImportForm`、`TrSkillExtensionDetail` 及对应的 `<tr-skill-import-form>`、`<tr-skill-extension-detail>` 标签。组件没有公开 Expose 方法。

### SkillImportForm

#### Props

| 属性名            | 说明                                                                                                    | 类型                    | 默认值              | 必填 |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------- | ---- |
| `source`          | 导入来源；切换时重置组件内的草稿、解析结果和错误。                                                      | `SkillImportFormSource` | `'local'`           | 否   |
| `max-upload-size` | 文件夹文件总大小及所选压缩包大小上限；默认 Kit 解析器也将其作为解压内容上限。自定义解析器应遵守传入值。 | `number`                | `10485760`（10 MB） | 否   |
| `resolve-timeout` | 解析超时毫秒数；`0` 表示不超时。超时不取消在途请求，但组件会忽略其晚到结果。                            | `number`                | `30000`（30 秒）    | 否   |
| `resolve-skill`   | 自定义异步解析器；未提供时使用 kit 默认解析器，并在线解析 GitHub URL 中的真实 ref 与目录边界。          | `SkillResolver`         | kit 默认解析器      | 否   |

#### Events

| 事件名   | 触发时机                                                                                   | 回调参数                                |
| -------- | ------------------------------------------------------------------------------------------ | --------------------------------------- |
| `submit` | 本地文件夹或压缩包解析成功且用户点击“确定”，或 GitHub 地址解析成功后；应用需自行保存定义。 | `(definition: SkillDefinition) => void` |
| `cancel` | 用户在本地文件夹或压缩包导入界面点击“取消”时；组件不自行关闭宿主或清空草稿。               | `() => void`                            |

#### CSS Variables

| 变量名                                      | 说明                                         | 默认值                                 |
| ------------------------------------------- | -------------------------------------------- | -------------------------------------- |
| `--tr-skill-import-form-primary-color`      | 导入表单的强调色；未设置时跟随主题主文本色。 | `var(--tr-text-primary, #191919)`      |
| `--tr-skill-import-form-primary-text-color` | 导入表单主按钮的文字色。                     | `var(--tr-container-bg-default, #fff)` |

#### Types

| 类型名                    | 类型或签名 | 说明                                                       |
| ------------------------- | ---------- | ---------------------------------------------------------- |
| `SkillFileKind`           | union      | `'text' \| 'binary'`。                                     |
| `SkillResourceDescriptor` | union      | 资源路径、标识、元数据及按种类区分的内容读取方式。         |
| `SkillDefinition`         | interface  | 解析完成的 Skill 定义。                                    |
| `SkillImportFormSource`   | union      | `'local' \| 'archive' \| 'github'`。                       |
| `SkillImportFormInput`    | union      | 解析器收到的本地文件、归档文件，或 GitHub URL 与仓库标识。 |
| `SkillResolver`           | function   | 接收 `SkillImportFormInput`，异步返回 `SkillDefinition`。  |
| `SkillImportFormProps`    | interface  | 导入组件的公开 Props。                                     |
| `SkillImportFormEmits`    | interface  | `submit` 和 `cancel` 的公开事件签名。                      |

以下是 `SkillDefinition`、`SkillImportFormInput` 与 `SkillResolver` 的完整定义：

```ts
interface SkillDefinition {
  name: string
  description: string
  instructions: string
  resources?: SkillResourceDescriptor[]
  directories?: string[]
  metadata?: Record<string, unknown>
}

type SkillImportFormInput =
  | { source: 'local'; files: File[] }
  | { source: 'archive'; file: File; maxUncompressedSize: number }
  | { source: 'github'; url: string; repo: string }

type SkillResolver = (input: SkillImportFormInput) => Promise<SkillDefinition>
```

`SkillResourceDescriptor` 的公共字段与按种类区分的内容要求如下。资源需要稳定的 `resourceId` 和相对路径 `path`；文本资源至少提供 `text` 或 `readText()`，二进制资源至少提供 `binary` 或 `readBinary()`。两种资源均可补充另一种内容表示。

| 字段                    | 类型                                       | 说明                                         | 必填         |
| ----------------------- | ------------------------------------------ | -------------------------------------------- | ------------ |
| `path`                  | `string`                                   | 资源相对路径。                               | 是           |
| `kind`                  | `SkillFileKind`                            | 文本或二进制种类。                           | 是           |
| `resourceId`            | `string`                                   | 稳定的资源标识。                             | 是           |
| `text` / `readText`     | `string` / `() => Promise<string>`         | 文本资源至少提供一种。                       | 文本资源是   |
| `binary` / `readBinary` | `Uint8Array` / `() => Promise<Uint8Array>` | 二进制资源至少提供一种。                     | 二进制资源是 |
| `mimeType`              | `string`                                   | MIME 类型。                                  | 否           |
| `size`                  | `number`                                   | 文件大小，字节。                             | 否           |
| `lastModified`          | `number`                                   | 最后修改时间数值。                           | 否           |
| `metadata`              | `Record<string, unknown>`                  | 附加元数据。                                 | 否           |

### SkillExtensionDetail

#### Props

| 属性名       | 说明                                                       | 类型               | 默认值   | 必填 |
| ------------ | ---------------------------------------------------------- | ------------------ | -------- | ---- |
| `definition` | 要展示的完整 Skill 定义；组件不加载或修改它。              | `SkillDefinition`  | —        | 是   |
| `updated-at` | 已格式化的更新时间文本；未提供时不显示。                   | `string`           | —        | 否   |
| `mode`       | 详情模式。`view` 只查看；`edit` 显示编辑和文件树操作入口。 | `'view' \| 'edit'` | `'view'` | 否   |

#### Types

| 类型名                       | 类型或签名 | 说明                                                                                 |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| `SkillExtensionDetailProps`  | interface  | 详情的公开 Props。                                                                   |
| `SkillFileActionType`        | union      | `'create-file' \| 'create-folder' \| 'delete-file' \| 'delete-folder' \| 'rename'`。 |
| `SkillFileAction`            | interface  | 文件树操作的完整载荷：`type`、`target`、`path` 和可选的 `nextPath`。                 |
| `SkillResourceDescriptor`    | union      | 资源文件描述，区分文本/二进制内容，并支持直接或懒加载读取。                              |
| `SkillExtensionDetailSlots`  | interface  | Skill 详情组件插槽的类型。                                                           |
| `SkillVisualEditorSlotProps` | interface  | 可视化编辑器插槽接收的草稿、当前文件路径和更新方法。                                 |

#### Slots

| 插槽名          | 说明                                                           | 作用域参数                   |
| --------------- | -------------------------------------------------------------- | ---------------------------- |
| `visual-editor` | 自定义 Markdown 可视化编辑器；未提供时使用内置 Tiptap 编辑器。 | `SkillVisualEditorSlotProps` |

`visual-editor` 插槽参数：

```ts
interface SkillVisualEditorSlotProps {
  content: string
  filePath: string
  updateContent: (content: string) => void
}
```

文件树操作事件的载荷示例：

```ts
type SkillFileAction =
  | { type: 'create-file'; target: 'file'; path: string }
  | { type: 'create-folder'; target: 'folder'; path: string }
  | { type: 'delete-file'; target: 'file'; path: string }
  | { type: 'delete-folder'; target: 'folder'; path: string }
  | { type: 'rename'; target: 'file' | 'folder'; path: string; nextPath: string }
```

#### Events

| 事件名        | 什么时候触发                                                                                             | 参数                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `save`        | 编辑内容或文件树操作产生新定义时；应用应保存定义并更新传入的 `definition`。                                | `(definition: SkillDefinition) => void` |
| `file-action` | 用户执行新增、删除或重命名文件/文件夹后触发；组件同时通过 `save` 提供更新后的定义，应用可据此完成持久化。 | `(action: SkillFileAction) => void`     |

文件树中的文件夹支持新增文件夹、新增文件、删除和重命名；文件支持删除和重命名。名称只能包含英文字母、数字、下划线、中划线和点号；新增文本文件及文本文件重命名仅支持 `.md`、`.txt`、`.json` 后缀。删除操作会显示危险色菜单项，根目录 `SKILL.md` 不提供这些操作。文件树操作会立即反映在组件中，并通过 `save` 事件提供更新后的定义，同时通过 `file-action` 事件通知业务。`directories` 用于保留没有文件的空目录，删除目录中的最后一个文件不会自动删除该目录。

`updated-at` 只展示传入文本，不自行格式化日期。选择资源文件时，组件会读取定义提供的内容；Markdown 文本按格式化内容显示，其他文本显示为纯文本，图片可预览，其他二进制文件提供下载。

#### CSS Variables

| 变量名                                         | 说明                                                   | 默认值  |
| ---------------------------------------------- | ------------------------------------------------------ | ------- |
| `--tr-skill-extension-detail-content-min-height` | 文件浏览区域的最小高度，避免切换到编辑态时页面跳动。   | `500px` |
| `--tr-skill-extension-detail-content-max-height` | 文件浏览区域（目录树和内容预览）的最大高度。           | `600px` |

开发者可在组件或外层容器上设置此变量，例如：

```vue
<tr-skill-extension-detail
  :definition="definition"
  style="--tr-skill-extension-detail-content-min-height: 500px; --tr-skill-extension-detail-content-max-height: 600px"
/>
```
