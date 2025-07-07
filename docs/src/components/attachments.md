---
outline: deep
---

# Attachments 附件上传组件

文件上传卡片

## 代码示例

#### 基本示例

<demo vue="../../demos/attachments/basic.vue" />

### 是否换行

<demo vue="../../demos/attachments/file-card-list.vue" title="卡片列表布局" description="卡片列表布局" />

**文件卡片状态显示模式**

| 状态类型          | 属性配置            | 说明                              | 相关属性                  | 交互/备注                                                                 |
|-------------------|---------------------|-----------------------------------|--------------------------|--------------------------------------------------------------------------|
| 信息状态          | `statusMode="info"` | 默认状态，显示文件类型和大小      | -                        | 无特殊交互                                                              |                                         |
| 状态消息          | `statusMode="message"` | 显示预设状态消息文本          | `file.messageType`<br>`file.status` | 需配合 `file.messageType` 定义消息类型，`file.status` 可扩展交互功能    |
| 自定义操作        | `statusMode="actions"` | 显示自定义操作按钮            | `actions` (必填)   | 需通过数组提供按钮配置                                                  |
| 默认状态          | 不设置或默认配置    | 仅显示 `file.status` 的文本内容   | `file.status`            | 纯文本展示无交互                                                        |

**状态消息类型 (file.messageType 可选值):**
| 消息类型          | 触发条件                                | 典型场景              | 特殊交互                         |
|-------------------|---------------------------------------|---------------------|----------------------------------|
| error             | `file.messageType="error"`<br>且 `file.status="error"` | 上传失败            | 自动显示重试按钮                 |
| warning           | `file.messageType="warning"`          | 文件校验警告         | 仅显示警示图标和文本             |
| success           | `file.messageType="success"`          | 传输成功            |                   |
| info              | `file.messageType="info"`             | 常规提示信息         | 基础文本展示                     |
| uploading         | `file.messageType="uploading"`        | 上传中              | 可配合进度条使用                 |

**特点说明：**
1. 状态消息支持组合控制：通过 `messageType` 定义样式，`status` 控制交互状态
2. 错误重试逻辑：当同时满足 `messageType="error"` 和 `status="error"` 时自动激活
3. 扩展性设计：自定义操作可通过 `actions` 注入任意按钮组件
4. 渐进式显示：未设置特殊状态时自动降级为默认信息展示模式

## API

### Props

| 属性名        | 类型                          | 默认值 | 说明                                                     |
| ------------- | ----------------------------- | ------ | -------------------------------------------------------- |
| items         | `Attachment[]`                | []     | 附件列表，支持v-model:items双向绑定                      |
| disabled      | boolean                       | false  | 是否禁用组件                                             |
| layout      | 'wrap'/'no-wrap'    | 'wrap' | 文件列表布局方式，`no-wrap` 为水平滚动                                     |
| variant       | `'picture'/'card'/'auto'`     | 'auto' | 附件列表的展示变体                                       |
| fileIcons     | `Record<FileType, Component>` | -      | 自定义文件类型图标                                       |
| statusMode    | `'info'/'actions'/'message'/'default'`                      | 'info' | 文件卡片状态类型 (info/progress/operate/message/default) |
| actions | `ActionButton[]`              | []     | 自定义操作按钮列表                                       |

#### Attachment 类型

```typescript
interface Attachment {
  uid: string // 唯一标识符
  name: string // 文件名
  status: 'uploading' | 'success' | 'error' // 文件状态
  fileType?: 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'other' // 文件类型
  size?: number // 文件大小（字节）
  isUploading?: boolean // 是否正在上传
  messageType?: 'error' | 'warning' | 'success' | 'info' | 'uploading' // 状态消息类型
  rawFile?: File // 原始文件对象
  previewUrl?: string // 预览URL (仅图片类型)
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
| file-download   | `Attachment`                               | 文件下载时触发         |
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