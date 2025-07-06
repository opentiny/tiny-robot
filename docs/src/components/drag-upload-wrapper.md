# DragUploadWrapper 拖拽上传包装器

`DragUploadWrapper` 是一个高度可复用的拖拽上传逻辑组件，它将**拖拽功能**与**视图展示**完全分离。通过作用域插槽，你可以在任何内容上轻松添加拖拽上传功能。

## 核心特性

- **逻辑与视图分离**：组件只负责拖拽逻辑，视图完全由使用者控制
- **作用域插槽**：通过插槽暴露拖拽状态，实现高度自定义
- **文件类型验证**：支持 `accept` 属性进行文件类型过滤
- **多选支持**：可配置单选或多选模式
- **完整的事件系统**：提供详细的拖拽生命周期事件
- **可选覆盖层**：内置可自定义的拖拽覆盖层

## 基本用法

将任何内容包装在 `DragUploadWrapper` 中，即可获得拖拽上传功能：

```vue
<template>
  <tr-drag-upload-wrapper @files-dropped="handleFilesDropped">
    <template #default="{ isDragging }">
      <div class="my-content" :class="{ 'dragging': isDragging }">
        <h3>我的内容</h3>
        <p>将文件拖拽到这里</p>
      </div>
    </template>
  </tr-drag-upload-wrapper>
</template>

<script setup>
const handleFilesDropped = (files) => {
  console.log('上传的文件:', files)
  // 处理文件上传逻辑
}
</script>
```

## 基础案例

<demo vue="../../demos/drag-upload-wrapper/basic.vue" />

## 综合案例

<demo vue="../../demos/drag-upload-wrapper/container-integration.vue" />

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `disabled` | `boolean` | `false` | 是否禁用拖拽功能 |
| `multiple` | `boolean` | `true` | 是否支持多选文件 |
| `accept` | `string` | `''` | 接受的文件类型，格式同 HTML input accept 属性 |
| `enableDragOverlay` | `boolean` | `true` | 是否启用拖拽覆盖层 |
| `overlayTitle` | `string` | `'将附件拖到此处完成上传'` | 覆盖层标题 |
| `overlayDescription` | `string[]` | `[]` | 覆盖层描述文本数组 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `files-dropped` | `files: File[]` | 文件被拖拽放下时触发 |
| `files-rejected` | `rejection: FileRejection` | 文件被拒绝时触发（不符合条件） |
| `drag-enter` | `event: DragEvent` | 拖拽进入时触发 |
| `drag-over` | `event: DragEvent` | 拖拽经过时触发 |
| `drag-leave` | `event: DragEvent` | 拖拽离开时触发 |
| `drop` | `event: DragEvent` | 拖拽放下时触发（在文件处理之前） |

### Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `default` | `{ isDragging: boolean, disabled?: boolean }` | 默认插槽，接收拖拽状态 |
| `overlay` | `{ isDragging: boolean }` | 覆盖层插槽，用于自定义拖拽时的覆盖层内容 |

### 暴露的方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `resetDragState` | - | `void` | 重置拖拽状态 |

## 高级用法

### 自定义覆盖层内容

```vue
<tr-drag-upload-wrapper 
  accept="image/*,.pdf,.doc,.docx"
  overlay-title="拖拽文件到此处上传"
  :overlay-description="['支持图片、PDF、Word 文档', '可同时上传多个文件']"
  @files-dropped="handleFilesDropped"
  @files-rejected="handleFilesRejected"
>
  <template #default="{ isDragging }">
    <div class="upload-area" :class="{ 'dragging': isDragging }">
      <!-- 你的内容区域 -->
    </div>
  </template>
</tr-drag-upload-wrapper>
```

### 文件类型限制

```vue
<tr-drag-upload-wrapper 
  accept="image/*,.pdf,.doc,.docx"
  @files-dropped="handleFilesDropped"
  @files-rejected="handleFilesRejected"
>
  <template #default="{ isDragging }">
    <div class="upload-area" :class="{ 'dragging': isDragging }">
      只接受图片、PDF、Word 文档
    </div>
  </template>
</tr-drag-upload-wrapper>
```

### 自定义覆盖层

```vue
<tr-drag-upload-wrapper @files-dropped="handleFilesDropped">
  <template #default="{ isDragging }">
    <div class="my-content">
      <!-- 你的内容 -->
    </div>
  </template>
  
  <template #overlay="{ isDragging }">
    <div class="custom-overlay">
      <div class="custom-message">
        🎨 释放鼠标上传文件
      </div>
    </div>
  </template>
</tr-drag-upload-wrapper>
```

### 禁用拖拽功能

```vue
<tr-drag-upload-wrapper :disabled="true">
  <template #default="{ disabled }">
    <div class="content" :class="{ 'disabled': disabled }">
      拖拽功能已禁用
    </div>
  </template>
</tr-drag-upload-wrapper>
```

## 类型定义

```typescript
interface FileRejection {
  files: File[]
  reason: 'invalid-file-type' | 'too-many-files' | 'file-too-large' | 'custom'
  message?: string
}

interface DragUploadWrapperProps {
  disabled?: boolean
  multiple?: boolean
  accept?: string
  enableDragOverlay?: boolean
  overlayTitle?: string
  overlayDescription?: string[]
}
```
