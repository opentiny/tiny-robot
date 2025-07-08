# DragOverlay 拖拽浮层

一个提供拖拽上传能力的组件，通过自定义指令 `v-drag-aware` 和一个纯展示的浮层组件 `<tr-drag-overlay>` 协同工作。

## 何时使用

当您需要为一个特定区域或整个页面添加文件拖拽上传功能，并在拖拽时显示一个全局浮层时，可以使用本组件。

## 组件构成

本功能由两部分组成：

-   `v-drag-aware`: 一个自定义 Vue 指令，负责监听和处理DOM元素的拖拽事件。
-   `<tr-drag-overlay>`: 一个纯展示组件，根据传入的 `is-dragging` prop 显示或隐藏一个全屏的拖拽浮层。

## 基本用法

将 `v-drag-aware` 指令附加到任何你希望响应拖拽的元素上。同时，在页面中放置一个 `<tr-drag-overlay>` 组件，并通过一个状态变量将其 `is-dragging` prop 与指令的状态同步。


<demo vue="../../demos/drag-overlay/basic.vue" />

## 综合案例

<demo vue="../../demos/drag-overlay/container-integration.vue" />

## Attributes

### v-drag-aware 指令绑定对象

| 名称             | 类型                                   | 说明                                             |
| ---------------- | -------------------------------------- | ------------------------------------------------ |
| onStateChange    | `(isDragging: boolean) => void`        | **必须**。当拖拽状态改变时触发的回调。         |
| onFilesDropped   | `(files: File[]) => void`              | **必须**。当符合要求的文件被放下时触发的回调。 |
| onFilesRejected  | `(rejection: FileRejection) => void`   | 当文件因类型不符被拒绝时触发的回调。             |
| accept           | `string`                               | 可选。接受的文件类型，同 `<input>` 的 `accept` 属性。 |
| multiple         | `boolean`                              | 可选，默认为 `true`。是否允许上传多个文件。       |
| disabled         | `boolean`                              | 可选，默认为 `false`。是否禁用拖拽功能。          |

### TrDragUploadWrapper Props

| 名称               | 类型      | 默认值 | 说明                                     |
| ------------------ | --------- | ------ | ---------------------------------------- |
| is-dragging        | `boolean` | `false`| 是否显示拖拽浮层。                       |
| overlay-title      | `string`  | `''`   | 浮层的主标题。                           |
| overlay-description| `string[]`| `[]`   | 浮层的描述文本，数组中的每个元素为一行。 |
| targetRect | `DOMRect \| null`| `null`   | 目标元素的 DOMRect，用于定位覆盖层。 |
| fullscreen | `boolean`| `false`   | 是否全屏模式，控制覆盖层的边框显示。 |


## Slots

### TrDragUploadWrapper Slots

| 名称      | 说明           |
| --------- | -------------- |
| overlay   | 自定义浮层内容。 |
