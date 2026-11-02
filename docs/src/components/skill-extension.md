---
outline: [1, 3]
---

# Skill 扩展导入与详情

`SkillImportForm` 提供本地文件夹和 GitHub 两种 Skill 导入界面，并在解析成功后把 Skill 定义交给应用；`SkillExtensionDetail` 展示已取得的定义、说明和资源，并允许编辑 Skill 正文或文本资源。应用可以将两者放在自己的页面、Dialog 或 Drawer 中，并自行决定数据来源、保存方式及容器行为。

## 概览

### 适用场景

- 从本地文件夹或 GitHub 仓库路径取得一个 Skill 定义。
- 展示 Skill 的说明与资源清单，让用户了解已加载的内容。
- 与 [ExtensionManager](./extension-manager.md) 组合时，由应用处理通用操作事件，打开对应界面并更新扩展列表。

### 职责边界

导入表单管理输入、校验、解析中的加载状态和错误反馈；默认解析器由 kit 提供。**解析不等于持久化**：应用收到 Skill 定义后，仍需自行保存并更新扩展列表。详情组件只展示应用传入的定义，不读取资源内容或加载远程数据；弹窗标题、关闭和焦点管理由应用负责。

## 快速开始

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

下面的示例不传 `resolve-skill`，由组件使用 kit 默认解析器读取 GitHub 上的真实 Skill。复制示例地址并粘贴进 URL 输入框，点击“导入”后可查看解析出的名称、`SKILL.md` 正文和资源文件。示例需要能访问 GitHub；网络请求或限流失败时，表单会显示错误。导入结果只保存在当前页面内，刷新后不会保留。

<demo
  vue="../../demos/skill-import-form/basic.vue"
  title="从 GitHub 地址导入"
  description="使用 kit 默认解析器导入真实 Skill，并查看应用收到的定义。"
/>

## 用法示例

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

### 观察加载、失败与重试

`source="github"` 接受带 Skill 子目录的 HTTPS GitHub `tree` 地址，或直接指向 `SKILL.md` 的 `blob` 地址。点击“导入”后，组件先把规范化的 `url` 和 `owner/repo` 形式的 `repo` 交给解析器；成功时直接触发 `submit`，失败时在组件内显示错误。默认解析器会查询仓库真实的分支和标签，按最长匹配确定 `ref` 与目录边界，也支持 40 位 commit SHA。自定义解析器若需要 `ref` 和目录，必须自行解析，或调用 kit 的加载能力。示例用手动完成的本地 Promise 展示加载、成功和失败，并可再次导入或重置。

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

在编辑模式中，选中文本资源后右侧文件标题栏显示“编辑”按钮；二进制资源只显示预览或下载。资源项可通过 `editable: false` 单独禁用编辑。根目录 `SKILL.md` 在编辑模式下允许编辑。点击“编辑”后：

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

#### 文件级编辑权限与文件树操作

文件内容编辑权限按文件判断，不应与文件树上的新增、删除和重命名权限合并成一个组件级 `editable` 开关。`mode="view"` 控制详情是否展示编辑能力；`mode="edit"` 下，资源项的 `editable: false` 可以单独禁用该文件编辑，未设置时文本资源可编辑，二进制资源仍只读。根目录 `SKILL.md` 跟随详情模式允许编辑。

文件树操作是另一类配置。新增文件/文件夹、删除、重命名由组件提供通用交互，并通过 `file-action` 报告操作；应用负责持久化和处理空目录等 `SkillDefinition` 未表达的数据。若后续需要按文件或文件夹定制菜单，建议参考 `ExtensionCard` 的 action 模型，为树节点提供 `actions` 列表（例如稳定的 `id`、文案、隐藏、禁用和危险态），并通过一个带节点路径和 action 信息的统一事件回传。不要为每种操作分别增加 `canCreateFile`、`canDeleteFile` 等布尔属性。当前文件树菜单仍由组件固定生成，尚不支持自定义 action 列表。

后续扩展可以按下面的结构落地：

```ts
type SkillTreeAction = {
  id: string
  label: string
  type: SkillFileActionType | 'custom'
  hidden?: boolean
  disabled?: boolean
  danger?: boolean
}

type SkillTreeNode = {
  type: 'file' | 'folder'
  path: string
  resource?: SkillResourceDescriptor
}

type SkillTreeActionsResolver = (node: SkillTreeNode) => SkillTreeAction[]

interface SkillTreeActionEvent {
  id: string
  type: SkillFileActionType | 'custom'
  target: 'file' | 'folder'
  path: string
  nextPath?: string
  payload?: unknown
}
```

后续实现 `file-actions` 后，该属性可以接收 `SkillTreeActionsResolver`；操作触发时沿用 `file-action` 事件，并按 `ExtensionCardActionEvent` 的习惯发送归一化的 `id`、`type` 和可选 `payload`，同时附带节点路径。未来的 `SkillResourceDescriptor.editable` 只决定当前文件能否编辑正文；`SkillTreeActionsResolver` 决定该节点显示哪些树操作。两者可以独立配置，例如文件允许编辑但不允许重命名，或者文件只读但仍允许删除。组件只负责展示、校验和发出意图，具体权限判断和持久化仍由应用负责。

## 可访问性与设计约束

本地文件选择区支持键盘访问；移除文件夹后焦点回到上传入口。GitHub 地址无效时输入框会标记错误并获得焦点，解析错误以可见提示呈现。解析期间提交按钮不可用，用户可以在失败后修改输入并重试。

查看模式下，文件树中的文件和文件夹按钮支持键盘操作。当前文件内容位于可聚焦、可滚动的只读区域，保留原有换行和空格；光标进入后可选中、复制，按 Ctrl+A（macOS 上按 Command+A）可全选正文，长文本可以用键盘阅读。文件树和内容预览区域在自身区域内滚动，不会无限拉长详情。文件浏览区域默认最大高度为 `520px`，可用下方 CSS 变量调整。导入器将 YAML 头部解析为名称和描述，因此此处展示的是 `instructions` 正文。资源路径允许换行。查看模式下详情只展示内容；页面或弹窗的标题、关闭按钮、焦点返回和持久化由宿主及应用负责。

## API

组件和以下类型均从 `@opentiny/tiny-robot` 导入；示例使用 `TrSkillImportForm`、`TrSkillExtensionDetail` 及对应的 `<tr-skill-import-form>`、`<tr-skill-extension-detail>` 标签。组件没有公开 Expose 方法。

### SkillImportForm

#### Props

| 属性名            | 说明                                                                                           | 类型                    | 默认值              | 必填 |
| ----------------- | ---------------------------------------------------------------------------------------------- | ----------------------- | ------------------- | ---- |
| `source`          | 导入来源；切换时重置组件内的草稿、解析结果和错误。                                             | `SkillImportFormSource` | `'local'`           | 否   |
| `max-upload-size` | 本地文件夹允许的文件总字节数，超过时不调用解析器。                                             | `number`                | `10485760`（10 MB） | 否   |
| `resolve-timeout` | 解析超时毫秒数；`0` 表示不超时。超时不取消在途请求，但组件会忽略其晚到结果。                   | `number`                | `30000`（30 秒）    | 否   |
| `resolve-skill`   | 自定义异步解析器；未提供时使用 kit 默认解析器，并在线解析 GitHub URL 中的真实 ref 与目录边界。 | `SkillResolver`         | kit 默认解析器      | 否   |

#### Events

| 事件名   | 触发时机                                                                           | 回调参数                                |
| -------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| `submit` | 本地文件夹解析成功且用户点击“确定”，或 GitHub 地址解析成功后；应用需自行保存定义。 | `(definition: SkillDefinition) => void` |
| `cancel` | 用户在本地导入界面点击“取消”时；组件不自行关闭宿主或清空草稿。                     | `() => void`                            |

#### CSS Variables

| 变量名                                      | 说明                                         | 默认值                                 |
| ------------------------------------------- | -------------------------------------------- | -------------------------------------- |
| `--tr-skill-import-form-primary-color`      | 导入表单的强调色；未设置时跟随主题主文本色。 | `var(--tr-text-primary, #191919)`      |
| `--tr-skill-import-form-primary-text-color` | 导入表单主按钮的文字色。                     | `var(--tr-container-bg-default, #fff)` |

#### Types

| 类型名                    | 类型或签名 | 说明                                                      |
| ------------------------- | ---------- | --------------------------------------------------------- |
| `SkillFileKind`           | union      | `'text' \| 'binary'`。                                    |
| `SkillResourceDescriptor` | union      | 资源路径、标识、元数据及按种类区分的内容读取方式。        |
| `SkillDefinition`         | interface  | 解析完成的 Skill 定义。                                   |
| `SkillImportFormSource`   | union      | `'local' \| 'github'`。                                   |
| `SkillImportFormInput`    | union      | 解析器收到的本地文件，或 GitHub URL 与仓库标识。          |
| `SkillResolver`           | function   | 接收 `SkillImportFormInput`，异步返回 `SkillDefinition`。 |
| `SkillImportFormProps`    | interface  | 导入组件的公开 Props。                                    |
| `SkillImportFormEmits`    | interface  | `submit` 和 `cancel` 的公开事件签名。                     |

以下是 `SkillDefinition`、`SkillImportFormInput` 与 `SkillResolver` 的完整定义：

```ts
interface SkillDefinition {
  name: string
  description: string
  instructions: string
  resources?: SkillResourceDescriptor[]
  metadata?: Record<string, unknown>
}

type SkillImportFormInput = { source: 'local'; files: File[] } | { source: 'github'; url: string; repo: string }

type SkillResolver = (input: SkillImportFormInput) => Promise<SkillDefinition>
```

`SkillResourceDescriptor` 的公共字段与按种类区分的内容要求如下。资源需要稳定的 `resourceId` 和相对路径 `path`；文本资源至少提供 `text` 或 `readText()`，二进制资源至少提供 `binary` 或 `readBinary()`。两种资源均可补充另一种内容表示。

| 字段                    | 类型                                       | 说明                                         | 必填         |
| ----------------------- | ------------------------------------------ | -------------------------------------------- | ------------ |
| `path`                  | `string`                                   | 资源相对路径。                               | 是           |
| `kind`                  | `SkillFileKind`                            | 文本或二进制种类。                           | 是           |
| `resourceId`            | `string`                                   | 稳定的资源标识。                             | 是           |
| `editable`              | `boolean`                                  | 编辑模式下是否允许编辑该文本资源；默认允许。 | 否           |
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
| `SkillFileAction`            | interface  | 文件树操作的目标类型、原路径和可选的新路径。                                         |
| `SkillResourceDescriptor`    | union      | 资源文件描述，支持逐文件配置 `editable`。                                            |
| `SkillExtensionDetailSlots`  | interface  | Skill 详情组件插槽的类型。                                                           |
| `SkillVisualEditorSlotProps` | interface  | 可视化编辑器插槽接收的草稿、当前文件路径和更新方法。                                 |

#### Slots

| 插槽名          | 说明                                                           | 作用域参数                   |
| --------------- | -------------------------------------------------------------- | ---------------------------- |
| `visual-editor` | 自定义 Markdown 可视化编辑器；未提供时使用内置 Tiptap 编辑器。 | `SkillVisualEditorSlotProps` |

#### Events

| 事件名        | 什么时候触发                                                                                             | 参数                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `save`        | 用户在编辑状态下点击“保存”时；应用应保存定义并更新传入的 `definition`。                                  | `(definition: SkillDefinition) => void` |
| `file-action` | 用户执行新增、删除或重命名文件/文件夹后。文件操作同时会触发 `save`；文件夹操作可由应用根据此事件持久化。 | `(action: SkillFileAction) => void`     |

文件树中的文件夹支持新增文件夹、新增文件、删除和重命名；文件支持删除和重命名。名称只能包含英文字母、数字、下划线、中划线和点号；新增文本文件及文本文件重命名仅支持 `.md`、`.txt`、`.json` 后缀。删除操作会显示危险色菜单项，根目录 `SKILL.md` 不提供这些操作。文件变更会立即反映在组件的文件树中，并通过 `save` 事件交给业务持久化；文件夹操作通过 `file-action` 事件通知业务。由于 `SkillDefinition` 只描述文件资源，空文件夹的持久化由业务处理。

`updated-at` 只展示传入文本，不自行格式化日期。选择资源文件时，组件会读取定义提供的内容；Markdown 文本按格式化内容显示，其他文本显示为纯文本，图片可预览，其他二进制文件提供下载。

#### CSS Variables

| 变量名                                           | 说明                                         | 默认值  |
| ------------------------------------------------ | -------------------------------------------- | ------- |
| `--tr-skill-extension-detail-content-max-height` | 文件浏览区域（目录树和内容预览）的最大高度。 | `520px` |

开发者可在组件或外层容器上设置此变量，例如：

```vue
<tr-skill-extension-detail :definition="definition" style="--tr-skill-extension-detail-content-max-height: 320px" />
```
