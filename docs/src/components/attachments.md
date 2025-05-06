---
outline: deep
---

# Attachments 附件上传组件

一个功能强大的附件上传组件，支持文件类型图标展示和增强的拖拽上传功能。

## 代码示例

#### 基本示例

<demo vue="../../demos/attachments/basic.vue" />

### 溢出控制

<demo vue="../../demos/attachments/file-card-list.vue" title="上传卡片列表" description="卡片列表溢出控制" />

### 卡片状态

<demo vue="../../demos/attachments/file-card-status.vue" title="文件卡片状态类型" description="文件卡片可以展示不同类型的状态：文件信息、进度状态、状态消息和自定义操作按钮" />

文件卡片支持多种状态类型展示，可以通过 `statusType` 属性进行配置：

1. **信息状态 (info)**：默认状态，显示文件类型和大小。
2. **进度状态 (progress)**：显示文件上传/下载进度条，需要设置 `file.progress` 属性。
3. **状态消息 (message)**：显示状态文本，可以通过 `file.messageType` 指定消息类型（error/warning/success/info）。
4. **自定义操作 (operate)**：显示自定义操作按钮，需要提供 `customActions` 属性。

## API

### Props

| 属性名        | 类型                          | 默认值 | 说明                                                     |
| ------------- | ----------------------------- | ------ | -------------------------------------------------------- |
| items         | `Attachment[]`                | []     | 附件列表，支持v-model:items双向绑定                      |
| disabled      | boolean                       | false  | 是否禁用组件                                             |
| overflow      | 'wrap'/'scrollX'/'scrollY'    | 'wrap' | 文件列表溢出展示方式                                     |
| drag          | `boolean/DragConfig`          | false  | 拖拽上传配置                                             |
| fileIcons     | `Record<FileType, Component>` | -      | 自定义文件类型图标                                       |
| iconSize      | `number`                      | 24     | 图标大小                                                 |
| rootClass     | `string`                      | -      | 根元素自定义类名                                         |
| styles        | `{ root, card, overlay }`     | -      | 自定义样式                                               |
| statusType    | `string`                      | 'info' | 文件卡片状态类型 (info/progress/operate/message/default) |
| customActions | `ActionButton[]`              | []     | 自定义操作按钮列表                                       |

#### Attachment 类型

```typescript
interface Attachment {
  id: string
  name: string
  fileType?: FileType
  size?: number
  status?: string
  progress?: number // 上传/下载进度 (0-100)
  isUploading?: boolean
  messageType?: 'error' | 'warning' | 'success' | 'info' // 状态消息类型
  // ... 其他属性
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

#### DragConfig 类型

```typescript
interface DragConfig {
  mode?: 'fullscreen' | 'container' // 拖拽模式
  target?: string | HTMLElement // 拖拽目标元素
  overlay?: {
    // 遮罩层配置
    zIndex?: number // 层级
    enterDelay?: number // 进入动画延迟
    leaveDelay?: number // 离开动画延迟
    className?: string // 自定义类名
  }
}
```

### Events

| 事件名        | 参数类型                                     | 说明                     |
| ------------- | -------------------------------------------- | ------------------------ |
| update:items  | `Attachment[]`                               | 附件列表更新时触发       |
| files-dropped | `Attachment[]`                               | 文件拖拽上传时触发       |
| file-remove   | `Attachment`                                 | 文件被移除时触发         |
| file-preview  | `Attachment`                                 | 文件预览时触发           |
| action        | `{ action: ActionButton, file: Attachment }` | 自定义操作按钮点击时触发 |

## 附件类型

组件支持以下文件类型，每种类型都有对应的默认图标：

- image: 图片文件（png, jpg, jpeg, gif, webp等）
- pdf: PDF文档
- word: Word文档（doc, docx）
- excel: Excel表格（xls, xlsx）
- ppt: 演示文稿（ppt, pptx）
- folder: 文件夹
- text: 文本文件（txt等）
- zip: 压缩文件（zip, rar, 7z等）
- other: 其他类型文件
