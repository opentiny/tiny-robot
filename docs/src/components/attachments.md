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

<demo vue="../../demos/attachments/file-card-status.vue" title="文件卡片状态类型" description="文件卡片可以展示不同类型的状态" />


**文件状态消息类型**

| 状态类型          | 属性配置            | 说明                              | 相关属性                  | 交互/备注                                                                 |
|-------------------|---------------------|-----------------------------------|--------------------------|--------------------------------------------------------------------------|
| 信息状态          | `statusType="info"` | 默认状态，显示文件类型和大小      | -                        | 无特殊交互                                                              |
| 进度状态          | `statusType="progress"` | 显示上传/下载进度条           | `file.progress` (必填)   | 需提供进度百分比数值（0-100）                                           |
| 状态消息          | `statusType="message"` | 显示预设状态消息文本          | `file.messageType`<br>`file.status` | 需配合 `file.messageType` 定义消息类型，`file.status` 可扩展交互功能    |
| 自定义操作        | `statusType="operate"` | 显示自定义操作按钮            | `customActions` (必填)   | 需通过数组提供按钮配置                                                  |
| 默认状态          | 不设置或默认配置    | 仅显示 `file.status` 的文本内容   | `file.status`            | 纯文本展示无交互                                                        |

**状态消息类型 (file.messageType 可选值):**
| 消息类型          | 触发条件                                | 典型场景              | 特殊交互                         |
|-------------------|---------------------------------------|---------------------|----------------------------------|
| error             | `file.messageType="error"`<br>且 `file.status="error"` | 上传失败            | 自动显示重试按钮                 |
| warning           | `file.messageType="warning"`          | 文件校验警告         | 仅显示警示图标和文本             |
| success           | `file.messageType="success"`          | 传输成功            | 可配置成功图标                   |
| info              | `file.messageType="info"`             | 常规提示信息         | 基础文本展示                     |
| uploading         | `file.messageType="uploading"`        | 上传中              | 可配合进度条使用                 |

**特点说明：**
1. 状态消息支持组合控制：通过 `messageType` 定义样式，`status` 控制交互状态
2. 错误重试逻辑：当同时满足 `messageType="error"` 和 `status="error"` 时自动激活
3. 扩展性设计：自定义操作可通过 `customActions` 注入任意按钮组件
4. 渐进式显示：未设置特殊状态时自动降级为默认信息展示模式


### 高级功能

<demo vue="../../demos/attachments/file-image-preview.vue" title="附加功能" description="文件卡片支持图片预览和下载以及失败重传功能" />

### 整合案例
<demo vue="../../demos/attachments/integration.vue" title="整合案例" description="整合案例" />

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
  uid: string // 唯一标识符
  name: string // 文件名
  fileType?: FileType // 文件类型
  size?: number // 文件大小（字节）
  status?: string // 文件状态
  progress?: number // 上传/下载进度 (0-100)
  isUploading?: boolean // 是否正在上传
  messageType?: 'error' | 'warning' | 'success' | 'info' | 'uploading' // 状态消息类型
  rawFile?: File // 原始文件对象
  previewUrl?: string // 预览URL (图片文件自动生成)
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
| file-retry    | `Attachment`                                 | 文件重试上传时触发       |
| action        | `{ action: ActionButton, file: Attachment }` | 自定义操作按钮点击时触发 |

### Methods

通过模板引用可以调用以下方法：

| 方法名            | 参数类型      | 返回类型         | 说明                           |
| ----------------- | ------------- | ---------------- | ------------------------------ |
| triggerUpload     | -             | `void`           | 触发文件选择对话框             |
| addFiles          | `File[]`      | `void`           | 添加文件到附件列表             |
| clearFiles        | -             | `void`           | 清空所有附件（会清理预览URL）  |
| getFiles          | -             | `Attachment[]`   | 获取当前附件列表               |
| getFileCount      | -             | `number`         | 获取附件数量                   |
| hasFiles          | -             | `boolean`        | 是否有附件                     |
| formatFileSize    | `number`      | `string`         | 格式化文件大小                 |
| createAttachments | `File[]`      | `Attachment[]`   | 批量创建附件对象               |

## 附件类型

组件支持以下文件类型，每种类型都有对应的默认图标：

- image: 图片文件（png, jpg, jpeg, gif, webp等）
- pdf: PDF文档
- word: Word文档（doc, docx）
- excel: Excel表格（xls, xlsx）
- ppt: 演示文稿（ppt, pptx）
- folder: 文件夹
- other: 其他类型文件