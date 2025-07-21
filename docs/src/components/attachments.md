---
outline: deep
---

# Attachments 附件卡片

Attachments 组件用于展示文件列表，并支持图片预览、文件下载、状态显示等一系列交互功能。

## 代码示例

最基本的用法是使用 `v-model:items` 绑定一个附件列表数组。

<demo vue="../../demos/attachments/basic.vue" />

## 基本特性

### 展示形式（variant）

组件通过 `variant` 属性控制附件列表的展示形式，默认为 `'auto'`。

- **`'auto'` (默认)**: 组件会自动检测 `items` 列表中的文件类型。如果全部为图片，则渲染为图片墙（`picture`）；否则，渲染为文件卡片列表（`card`）。
- **`'picture'`**: 强制渲染为图片墙。
- **`'card'`**: 强制渲染为文件卡片列表。

### 文件状态

文件卡片会根据 `file.status` 属性的值自动切换显示内容，直观地展示每个文件的当前状态。

- `success`: 上传成功，显示文件元信息（如大小）。
- `uploading`: 上传中，显示加载状态。
- `error`: 上传失败，显示错误信息和“重试”按钮。

<demo vue="../../demos/attachments/status.vue" />

图片列表同样支持状态展示：

<demo vue="../../demos/attachments/picture-list.vue" />

### 列表换行

通过设置 `wrap` 属性，可以控制文件列表是否在达到容器宽度时自动换行。

<demo vue="../../demos/attachments/wrap.vue" />

### 预览和下载

> 本地文件 和 网络文件 的下载方式不同

- **本地文件**（有 `rawFile`）：组件内部自动处理下载，创建 Blob URL 并使用 `a` 标签下载
- **网络文件**（有 `url`）：触发 `download` 事件，由开发者自定义下载逻辑

你可以使用 `@download.prevent` 来阻止组件的默认下载行为，完全自定义下载逻辑。  
你也可以使用 `@preview.prevent` 来阻止组件的默认预览行为，完全自定义预览逻辑。

<demo vue="../../demos/attachments/download.vue" />

### 自定义操作按钮 (actions)

通过 `actions` 属性可以定义在文件卡片上显示的操作按钮。对于图片类型，组件内置了“预览”和“下载”操作。你可以覆盖或添加新的操作。

当 `actions` 中包含 `type` 为 `preview` 或 `download` 的按钮时，会使用组件内置的逻辑。你也可以提供自定义的 `handler` 函数来覆盖默认行为。

### 自定义图标 (fileIcons)

如果想替换默认的某个文件类型的图标，可以使用 `fileIcons` 属性进行覆盖。

<demo vue="../../demos/attachments/custom-icon.vue" />

### 自定义文件类型 (fileMatchers)

当内置的文件类型不满足需求时，可以通过 `fileMatchers` 属性定义新的文件类型、匹配逻辑和专属图标。这在需要支持特殊格式或业务特定文件时非常有用。

<demo vue="../../demos/attachments/custom-file-type.vue" />

## API 参考

### Props

| 属性名       | 类型                            | 默认值                              | 说明                                                                        |
| ------------ | ------------------------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| items        | `Attachment[]`                  | []                                  | 附件列表，支持 `v-model:items` 双向绑定。                                   |
| disabled     | boolean                         | false                               | 是否禁用整个组件，禁用后所有交互操作（如删除、下载）将不可用。              |
| wrap         | boolean                         | false                               | 文件列表是否换行，详见 [列表换行](#列表换行)。                              |
| variant      | `'picture' \| 'card' \| 'auto'` | `'auto'`                            | 附件列表的展示形式，详见 [展示形式](#展示形式-variant)。                    |
| actions      | `ActionButton[]`                | 图片默认: `['preview', 'download']` | 自定义操作按钮，详见 [自定义操作按钮](#自定义操作按钮-actions)。            |
| fileIcons    | `Record<string, Component>`     | -                                   | 自定义文件类型图标，详见 [自定义图标](#自定义图标-fileicons)。              |
| fileMatchers | `FileTypeMatcher[]`             | []                                  | 自定义文件类型匹配器，详见 [自定义文件类型](#自定义文件类型-filematchers)。 |

### Types

#### Attachment

这是描述一个附件对象的核心类型。

```typescript
// 基础附件类型
export interface BaseAttachment {
  id?: string
  name?: string
  status?: FileStatus
  fileType?: FileType
  message?: string // 上传过程中提示信息
}

// URL 文件类型 - 已有远程URL的文件
export interface UrlAttachment extends BaseAttachment {
  url: string
  size: number
  rawFile?: File
}

// 本地文件类型 - 本地上传的文件
export interface RawFileAttachment extends BaseAttachment {
  rawFile: File
  url?: string
  size?: number
}

export type Attachment = UrlAttachment | RawFileAttachment
```

#### ActionButton

用于定义操作按钮。

```typescript
interface ActionButton {
  type: string // 操作类型，如 'preview', 'download' 等
  label: string // 按钮显示文本
  handler?: (file: Attachment) => void // 可选的点击处理函数，用于覆盖默认行为或实现新功能
}
```

#### FileTypeMatcher

用于自定义文件类型匹配规则。

```typescript
interface FileTypeMatcher {
  type: string // 唯一类型标识
  matcher: (file: File | string) => boolean // 匹配函数，返回 true 则表示匹配成功
  icon?: Component // 该类型对应的图标
}
```

### Events

| 事件名       | 参数类型                                     | 说明                       |
| ------------ | -------------------------------------------- | -------------------------- |
| update:items | `Attachment[]`                               | 附件列表更新时触发。       |
| remove       | `Attachment`                                 | 文件被移除时触发。         |
| download     | `(event: MouseEvent, file: Attachment)`      | 点击内置下载按钮时触发。   |
| preview      | `(event: MouseEvent, file: Attachment)`      | 点击内置预览按钮时触发。   |
| retry        | `Attachment`                                 | 点击重试按钮时触发。       |
| action       | `{ action: ActionButton, file: Attachment }` | 点击自定义操作按钮时触发。 |

## 内置附件类型

组件内置了以下文件类型，并提供了默认图标。通过 `fileMatchers` 属性可以扩展或覆盖这些类型。

- `image`: 图片 (png, jpg, jpeg, gif, webp, svg)
- `pdf`: PDF 文档
- `word`: Word 文档 (doc, docx)
- `excel`: Excel 表格 (xls, xlsx)
- `ppt`: 演示文稿 (ppt, pptx)
- `folder`: 文件夹
- `other`: 其他未知类型
