---
outline: deep
---

# Attachments 附件卡片

## 代码示例

### 基本示例

<demo vue="../../demos/attachments/basic.vue" />

### 状态展示

<demo vue="../../demos/attachments/status.vue" />

### 图片列表

<demo vue="../../demos/attachments/picture-list.vue" />

### 是否换行

<demo vue="../../demos/attachments/wrap.vue" />

### 自定义文件图标

通过 `fileIcons` 属性可以覆盖默认的文件类型图标。

<demo vue="../../demos/attachments/custom-icon.vue" />

**文件卡片状态显示**

文件卡片会根据 `file.status` 的值自动切换显示内容：

| 状态类型   | 状态值      | 显示内容                   | 交互说明                           |
| ---------- | ----------- | -------------------------- | ---------------------------------- |
| 成功状态   | `success`   | 显示文件类型和大小信息     | 悬浮时显示操作按钮（如预览、下载） |
| 上传中状态 | `uploading` | 显示"上传中..."文本        | 显示文本，无其他交互               |
| 失败状态   | `error`     | 显示"上传失败"和"重试"按钮 | 可点击重试按钮重新上传             |

## API

### Props

| 属性名    | 类型                          | 默认值                                    | 说明                                |
| --------- | ----------------------------- | ----------------------------------------- | ----------------------------------- |
| items     | `Attachment[]`                | []                                        | 附件列表，支持v-model:items双向绑定 |
| disabled  | boolean                       | false                                     | 是否禁用组件                        |
| wrap      | boolean                       | false                                     | 文件列表是否换行                    |
| variant   | `'picture'/'card'/'auto'`     | 'auto'                                    | 附件列表的展示变体                  |
| fileIcons | `Record<FileType, Component>` | -                                         | 自定义文件类型图标                  |
| actions   | `ActionButton[]`              | 文件类型为图片时，默认显示 `下载 \| 预览` | 自定义操作按钮                      |

#### Attachment 类型

```typescript
interface Attachment {
  id: string // 唯一标识符
  name: string // 文件名
  status: 'uploading' | 'success' | 'error' // 文件状态，用于控制卡片的视觉和交互行为
  fileType?: 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'other' // 文件类型
  size?: number // 文件大小（字节）
  rawFile?: File // 原始文件对象
  previewUrl?: string // 预览URL (仅图片类型)
  uploadTimeoutText?: string // 上传超时文本
}
```

#### ActionButton 类型

```typescript
interface ActionButton {
  type: string // 操作类型，如 'preview', 'download' 等
  label: string // 按钮显示文本
  handler?: (file: Attachment) => void // 可选的点击处理函数
}
```

### Events

| 事件名        | 参数类型                                     | 说明                     |
| ------------- | -------------------------------------------- | ------------------------ |
| update:items  | `Attachment[]`                               | 附件列表更新时触发       |
| file-remove   | `Attachment`                                 | 文件被移除时触发         |
| file-download | `Attachment`                                 | 文件下载时触发           |
| file-preview  | `Attachment`                                 | 文件预览时触发           |
| file-retry    | `Attachment`                                 | 文件重试上传时触发       |
| action        | `{ action: ActionButton, file: Attachment }` | 自定义操作按钮点击时触发 |

## 附件类型

组件支持以下文件类型，每种类型都有对应的默认图标：

- image: 图片文件（png, jpg, jpeg, gif, webp等）
- pdf: PDF文档
- word: Word文档（doc, docx）
- excel: Excel表格（xls, xlsx）
- ppt: 演示文稿（ppt, pptx）
- folder: 文件夹
- other: 其他类型文件
