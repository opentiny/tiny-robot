---
outline: deep
---

# DragOverlay 拖拽浮层

一个提供拖拽上传能力的组件，通过自定义指令 `v-dropzone` 和一个纯展示的浮层组件 `<tr-drag-overlay>` 协同工作。

本功能由两部分组成：

- `v-dropzone`: 一个自定义 Vue 指令，负责监听和处理DOM元素的拖拽事件。
- `<tr-drag-overlay>`: 一个纯展示组件，根据传入的 `is-dragging` prop 显示或隐藏一个全屏的拖拽浮层。

## 代码示例

### 基本用法

将 `v-dropzone` 指令附加到任何你希望响应拖拽的元素上。同时，在页面中放置一个 `<tr-drag-overlay>` 组件，并通过一个状态变量将其 `is-dragging` prop 与指令的状态同步。

<demo vue="../../demos/drag-overlay/basic.vue" />

### 自定义拖拽层

<demo vue="../../demos/drag-overlay/custom-overlay.vue" />

### 状态禁用

<demo vue="../../demos/drag-overlay/disabled.vue" />

## API

### Attributes

**v-dropzone** 指令传递的参数

| 名称          | 类型                                 | 说明                                                           |
| ------------- | ------------------------------------ | -------------------------------------------------------------- |
| accept        | `string`                             | 文件类型过滤规则（如 `'.png,.jpg'`），默认接收所有类型。       |
| multiple      | `boolean`                            | 是否允许多文件拖拽，默认 `true`。                              |
| maxSize       | `number`                             | 最大文件大小（字节），默认 `10485760`（10 MB）。               |
| maxFiles      | `number`                             | 最大文件数量，默认 `3`。                                       |
| disabled      | `boolean`                            | 是否禁用拖拽，默认 `false`。                                   |
| onDrop        | `(files: File[]) => void`            | **必须**。当符合条件的文件被放下时触发的回调。                 |
| onError       | `(rejection: FileRejection) => void` | **必须**。当文件被拒绝或发生错误时触发的回调。                 |
| onDraggingChange | `(dragging: boolean, element: HTMLElement \| null) => void` | 拖拽状态变化时触发的回调。 |

### Props

| 名称                | 类型              | 默认值  | 说明                                     |
| ------------------- | ----------------- | ------- | ---------------------------------------- |
| is-dragging         | `boolean`         | `false` | 是否显示拖拽浮层。                       |
| drag-target         | `Element \| null` | `null`  | 目标元素的 Element，用于定位覆盖层。     |
| overlay-title       | `string`          | `''`    | 浮层的主标题。                           |
| overlay-description | `string[]`        | `[]`    | 浮层的描述文本，数组中的每个元素为一行。 |
| fullscreen          | `boolean`         | `false` | 是否全屏模式，控制覆盖层的边框显示。     |

### Slots

| 名称    | 说明             |
| ------- | ---------------- |
| overlay | 自定义浮层内容。 |

### Types

**FileRejection**

```typeScript
export interface RejectionReason {
  code: DragZoneErrorCode
  message: string
}

export interface FileRejection extends RejectionReason {
  files: File[]
}
```
