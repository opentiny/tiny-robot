---
outline: [1, 3]
---

# Skill 扩展导入与详情

`SkillImportForm` 提供本地文件夹和 GitHub 两种 Skill 导入界面，并在解析成功后把 Skill 定义交给应用；`SkillExtensionDetail` 只读展示已取得的定义、说明和资源。应用可以将两者放在自己的页面、Dialog 或 Drawer 中，并自行决定数据来源、保存方式及容器行为。

## 概览

### 适用场景

- 从本地文件夹或 GitHub 仓库路径取得一个 Skill 定义。
- 展示 Skill 的说明与资源清单，让用户了解已加载的内容。
- 与 [ExtensionManager](./extension-manager.md) 组合时，由应用处理通用操作事件，打开对应界面并更新扩展列表。

### 职责边界

导入表单管理输入、校验、解析中的加载状态和错误反馈；默认解析器由 kit 提供。**解析不等于持久化**：应用收到 Skill 定义后，仍需自行保存并更新扩展列表。详情组件只展示应用传入的定义，不读取资源内容或加载远程数据；弹窗标题、关闭和焦点管理由应用负责。

## 快速开始

`@opentiny/tiny-robot-kit` 是组件库的 peer dependency。使用默认解析器前应安装两个包：

```bash
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-kit
```

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

`source="github"` 接受带 Skill 子目录的 HTTPS GitHub `tree` 地址。点击“导入”后，组件解析地址并把 `url`、`repo`、`ref`、`path` 交给解析器；成功时直接触发 `submit`，失败时在组件内显示错误。自定义解析器可以接入应用自己的加载或鉴权流程，示例用手动完成的本地 Promise 展示加载、成功和失败，并可再次导入或重置。

<demo
  vue="../../demos/skill-import-form/resolver-states.vue"
  title="解析状态与重试"
  description="控制本地解析结果，观察加载、错误、成功以及重试路径。"
/>

切换 `source` 会清空组件内的文件选择、GitHub 地址和错误。若容器关闭后任务仍要继续，应用应自行持有任务并提供后续通知；组件卸载后不再显示解析反馈。

### 查看 Skill 详情

将已取得的 `SkillDefinition` 传给 `SkillExtensionDetail`，即可显示名称、描述、`SKILL.md` 正文和资源路径。详情默认打开 `SKILL.md` 页签，用户可切换到“资源文件”查看清单。组件按 `resources.length` 显示数量，并列出每项的路径及可选大小；它不读取 `text`、`binary` 或惰性读取器的内容。

<demo
  vue="../../demos/skill-extension-detail/basic.vue"
  title="展示 Skill 定义"
  description="切换 SKILL.md 与资源文件页签，查看只读正文、资源路径和大小。"
/>

## 可访问性与设计约束

本地文件选择区支持键盘访问；移除文件夹后焦点回到上传入口。GitHub 地址无效时输入框会标记错误并获得焦点，解析错误以可见提示呈现。解析期间提交按钮不可用，用户可以在失败后修改输入并重试。

页签支持点击，以及左右方向键、Home 和 End 切换。`SKILL.md` 正文位于可聚焦、可滚动的只读编辑区，保留原有换行和空格。光标进入后可选中、复制，按 Ctrl+A（macOS 上按 Command+A）可全选正文；长文本可以用键盘阅读。资源清单也在自身区域内滚动，不会无限拉长详情。两处默认最大高度都是 `240px`，可用下方 CSS 变量调整。导入器将 YAML 头部解析为名称和描述，因此此处展示的是 `instructions` 正文。资源路径允许换行。详情只展示内容；页面或弹窗的标题、关闭按钮、焦点返回和持久化由宿主及应用负责。

## API

组件和以下类型均从 `@opentiny/tiny-robot` 导入；示例使用 `TrSkillImportForm`、`TrSkillExtensionDetail` 及对应的 `<tr-skill-import-form>`、`<tr-skill-extension-detail>` 标签。两个组件都没有公开 Slots 或 Expose 方法。

### SkillImportForm

#### Props

| 属性名            | 说明                                               | 类型                    | 默认值              | 必填 |
| ----------------- | -------------------------------------------------- | ----------------------- | ------------------- | ---- |
| `source`          | 导入来源；切换时重置组件内的草稿、解析结果和错误。 | `SkillImportFormSource` | `'local'`           | 否   |
| `max-upload-size` | 本地文件夹允许的文件总字节数，超过时不调用解析器。 | `number`                | `10485760`（10 MB） | 否   |
| `resolve-skill`   | 自定义异步解析器；未提供时使用 kit 的默认解析器。  | `SkillResolver`         | kit 默认解析器      | 否   |

#### Events

| 事件名   | 触发时机                                                                           | 回调参数                                |
| -------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| `submit` | 本地文件夹解析成功且用户点击“确定”，或 GitHub 地址解析成功后；应用需自行保存定义。 | `(definition: SkillDefinition) => void` |
| `cancel` | 用户在本地导入界面点击“取消”时；组件不自行关闭宿主或清空草稿。                     | `() => void`                            |

#### Types

| 类型名                    | 类型或签名 | 说明                                                      |
| ------------------------- | ---------- | --------------------------------------------------------- |
| `SkillFileKind`           | union      | `'text' \| 'binary'`。                                    |
| `SkillResourceDescriptor` | union      | 资源路径、标识、元数据及按种类区分的内容读取方式。        |
| `SkillDefinition`         | interface  | 解析完成的 Skill 定义。                                   |
| `SkillImportFormSource`   | union      | `'local' \| 'github'`。                                   |
| `SkillImportFormInput`    | union      | 解析器收到的本地文件或已拆解的 GitHub 地址。              |
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

type SkillImportFormInput =
  { source: 'local'; files: File[] } | { source: 'github'; url: string; repo: string; ref: string; path: string }

type SkillResolver = (input: SkillImportFormInput) => Promise<SkillDefinition>
```

`SkillResourceDescriptor` 的公共字段与按种类区分的内容要求如下。资源需要稳定的 `resourceId` 和相对路径 `path`；文本资源至少提供 `text` 或 `readText()`，二进制资源至少提供 `binary` 或 `readBinary()`。两种资源均可补充另一种内容表示。

| 字段                    | 类型                                       | 说明                     | 必填         |
| ----------------------- | ------------------------------------------ | ------------------------ | ------------ |
| `path`                  | `string`                                   | 资源相对路径。           | 是           |
| `kind`                  | `SkillFileKind`                            | 文本或二进制种类。       | 是           |
| `resourceId`            | `string`                                   | 稳定的资源标识。         | 是           |
| `text` / `readText`     | `string` / `() => Promise<string>`         | 文本资源至少提供一种。   | 文本资源是   |
| `binary` / `readBinary` | `Uint8Array` / `() => Promise<Uint8Array>` | 二进制资源至少提供一种。 | 二进制资源是 |
| `mimeType`              | `string`                                   | MIME 类型。              | 否           |
| `size`                  | `number`                                   | 文件大小，字节。         | 否           |
| `lastModified`          | `number`                                   | 最后修改时间数值。       | 否           |
| `metadata`              | `Record<string, unknown>`                  | 附加元数据。             | 否           |

#### 旧名称兼容

已有代码中的 `SkillAdd`、`TrSkillAdd` 和 `<tr-skill-add>` 仍可使用；新代码推荐改用 `SkillImportForm`、`TrSkillImportForm` 和 `<tr-skill-import-form>`。更名只涉及导入名称与标签，Props 和 Events 不变。例如：

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrSkillImportForm } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const received = shallowRef<SkillDefinition>()
</script>

<template>
  <tr-skill-import-form source="github" @submit="received = $event" />
  <p v-if="received">已解析 {{ received.name }}</p>
</template>
```

类型别名 `SkillAddSource`、`SkillAddInput`、`SkillAddProps`、`SkillAddEmits` 也继续导出，分别对应 `SkillImportFormSource`、`SkillImportFormInput`、`SkillImportFormProps`、`SkillImportFormEmits`。旧名称目前没有移除计划。

### SkillExtensionDetail

#### Props

| 属性名       | 说明                                          | 类型              | 默认值 | 必填 |
| ------------ | --------------------------------------------- | ----------------- | ------ | ---- |
| `definition` | 要展示的完整 Skill 定义；组件不加载或修改它。 | `SkillDefinition` | —      | 是   |
| `updated-at` | 已格式化的更新时间文本；未提供时不显示。      | `string`          | —      | 否   |

#### Types

| 类型名                      | 类型或签名 | 说明               |
| --------------------------- | ---------- | ------------------ |
| `SkillExtensionDetailProps` | interface  | 详情的公开 Props。 |

`SkillExtensionDetail` 不触发公开事件；说明和资源都是只读内容。`updated-at` 只展示传入文本，不自行格式化日期。

#### CSS Variables

| 变量名                                           | 说明                                        | 默认值  |
| ------------------------------------------------ | ------------------------------------------- | ------- |
| `--tr-skill-extension-detail-content-max-height` | `SKILL.md` 编辑区和资源清单各自的最大高度。 | `240px` |

开发者可在组件或外层容器上设置此变量，例如：

```vue
<tr-skill-extension-detail :definition="definition" style="--tr-skill-extension-detail-content-max-height: 320px" />
```
