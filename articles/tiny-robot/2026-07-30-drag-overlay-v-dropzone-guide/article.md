---
schema_version: article-hub.article.v2
title: 拖文件进来会发生什么：TinyRobot DragOverlay 与 v-dropzone 协同指南
summary: 跟着一张图拖进聊天页容器，弄清 TinyRobot 的 v-dropzone 如何更新拖拽态、DragOverlay 如何盖上浮层，以及松手后如何按 accept、大小与数量校验并回调 onDrop / onError。
project: tiny-robot
article_type: practical-guide
style_profile: developer-friendly
sources:
  - id: tiny-robot-drag-overlay-docs
    name: DragOverlay 官方文档
    url: https://docs.opentiny.design/tiny-robot/components/drag-overlay.html
    content_hash: docs-opentiny-design-drag-overlay-2026-07-30
  - id: tiny-robot-source
    name: TinyRobot 源码（DragOverlay / vDropzone）
    repository: https://github.com/opentiny/tiny-robot
    commit: 7648e33ff6f570c477a4a471849e058d5959dea1
approval_snapshot:
  url: https://github.com/hexqi/ai-article-hub/issues/104#issuecomment-5127534344
  approver: wuyiping0628
  plan_comment_id: 5126312422
  approval_comment_id: 5127333559
article_date: "2026-07-30"
tags:
  - TinyRobot
  - Vue3
  - DragOverlay
  - v-dropzone
  - 拖拽上传
issue: 104
---

# 拖文件进来会发生什么：TinyRobot DragOverlay 与 v-dropzone 协同指南

你大概写过「把文件拖进聊天页就上传」——给容器绑 `drop`，再自己画一层半透明提示。结果常常是：浮层闪一下就没了，或者子元素一多，`dragleave` 提前把状态清掉。TinyRobot 把这件事拆成两件套：`v-dropzone` 只管拖拽事件与文件校验，`DragOverlay`（`<tr-drag-overlay>`）只根据 `is-dragging` 做展示。

<!-- 素材待补：开篇 GIF——把文件拖入聊天容器时区域浮层出现与消失 -->

本文跟着**同一张** `photo.png` 拖进 `.chat-area` 走完全程：怎么接到一个 `div`、松手如何被接受或拒绝、浮层盖在哪、怎样换皮。正文停在拿到 `File[]`，不讲对象存储上传。

## 先分清职责：指令听事件，浮层只管亮

把「事件」和「视觉」绑在同一个组件里，嵌套 DOM 上最容易翻车：子节点进出也会触发 `dragleave`，浮层自己还可能挡住后续拖拽。官方文档把能力拆开——`v-dropzone` 负责监听与处理 DOM 拖拽事件；`<tr-drag-overlay>` 是纯展示组件，靠 `is-dragging` 显隐。

你要做的，是用状态把两边串起来：指令经 `onDraggingChange` 报告「正在拖 / 拖完了」，你把布尔值写给浮层的 `is-dragging`，并把回调里的目标元素交给 `drag-target` 做定位。漏掉后半段会踩坑——源码里浮层用 `@vueuse/core` 的 `useElementBounding` 按 `dragTarget` 算 `fixed` 坐标；没有 `drag-target` 时样式直接 `display: none`，即使 `is-dragging` 为 `true` 也看不见浮层。

记一句话就够：**指令产出状态，浮层消费状态；中间那根线是你写的 `ref`。**

## 接到一个聊天容器：最小可跑通示例

前置条件：Vue 3 项目已安装 `@opentiny/tiny-robot`，并能按官方文档引入组件与指令。下面的最小示例对标官方 basic demo：指令挂在聊天容器上，页面里另放浮层，用同一组状态同步。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TrDragOverlay, vDropzone, type FileRejection } from '@opentiny/tiny-robot'

const isDragging = ref(false)
const targetElement = ref<HTMLElement | null>(null)

function handleDraggingChange(dragging: boolean, element: HTMLElement | null) {
  isDragging.value = dragging
  targetElement.value = element
}

function handleDrop(files: File[]) {
  // 预期：松手且校验通过后拿到 File[]，例如 [photo.png]
  console.log('accepted', files)
}

function handleError(rejection: FileRejection) {
  // 预期：类型 / 大小 / 数量不通过时进入这里
  console.error(rejection.code, rejection.message, rejection.files)
}
</script>

<template>
  <div
    class="chat-area"
    v-dropzone="{
      accept: 'image/*',
      multiple: true,
      onDrop: handleDrop,
      onError: handleError,
      onDraggingChange: handleDraggingChange,
    }"
  >
    <!-- 聊天内容 -->
  </div>

  <tr-drag-overlay
    overlay-title="将图片拖到此处完成上传"
    :overlay-description="['总计最多上传3个图片（每个10MB以内）', '支持图片格式 JPG/JPEG/PNG']"
    :is-dragging="isDragging"
    :drag-target="targetElement"
  />
</template>
```

对照一下常见写法：

| 做法 | 结果 |
| --- | --- |
| ❌ 只更新 `isDragging`，不写 `targetElement` | 浮层条件渲染可能为真，但定位样式为 `display: none` |
| ✅ `onDraggingChange` 里同时赋值 `isDragging` 与 `targetElement` | 拖入 `.chat-area` 时浮层盖在容器矩形上 |

拖 `photo.png` 进入容器时，预期：`onDraggingChange(true, el)` 触发，浮层出现；松手且校验通过：`onDrop` 收到文件数组，浮层随 `false` 消失。文档把 `onDrop`、`onError` 标为必需——没有拒绝回调时，类型错误会悄悄丢掉，排查时找不到入口。

指令内部用 `dragCounter` 处理嵌套子元素的 `dragenter` / `dragleave`，只有计数回到 0 才清拖拽态。这比「一离开子节点就关浮层」稳，也是拆分后指令层该扛的活。

## 松手瞬间：photo.png 怎么被收下或拒绝

浮层亮着只说明「正在拖」；决定 `photo.png` 能不能进业务的，是指令在 `drop` 里跑的校验。文档默认值（以官方属性表为准）：

| 参数 | 默认 | 含义 |
| --- | --- | --- |
| `accept` | `''` | 类型过滤，如 `'.png,.jpg'` 或 `image/*` |
| `multiple` | `true` | 是否允许多文件 |
| `maxSize` | `10485760`（10MB） | 单文件最大字节数 |
| `maxFiles` | `3` | 单次最大文件数 |
| `disabled` | `false` | 禁用拖拽 |

源码里校验顺序固定，按这个顺序排查更省事：

1. **先看数量**：整批超过 `maxFiles`，整批拒绝，错误码 `file-count-exceeded`。
2. **再看类型与大小**：按文件逐个过滤；大小超限优先记为 `file-size-exceeded`，否则类型不符为 `file-type-not-allowed`。
3. **`multiple === false` 且通过类型/大小的文件多于 1 个**：按数量超限处理，提示只允许一个文件。

`FileRejection` 形如 `{ code, message, files }`，`code` 取自 `DragZoneErrorCode`（`file-type-not-allowed` / `file-size-exceeded` / `file-count-exceeded`）。

容易误判的一点：**同一次放下，既可能 `onError`，也可能 `onDrop`。** 例如拖入 3 个文件，其中 2 个符合 `image/*`、1 个是 `.pdf`，指令会对拒绝文件调 `onError`，同时把接受的文件交给 `onDrop`。业务不要假设「进了 Error 就一定没有 Drop」——上传队列以 `onDrop` 的 `File[]` 为准，用 `onError` 提示哪些被挡下。

<!-- 素材待补：校验拒绝截图——拖入超大文件或非图片时 onError 提示（若 UI 有） -->

用同一张 `photo.png` 自测三条路径：

- `accept: 'image/*'`，文件小于 10MB → 应走 `onDrop`。
- 改成 `accept: '.pdf'` 再拖同一张图 → 应走 `onError`，`file-type-not-allowed`。
- 一次拖入超过 `maxFiles` 个文件 → 整批 `file-count-exceeded`，不要期待部分成功。

## 浮层盖在哪、显示什么

到这一步，`photo.png` 还悬在指针上，`.chat-area` 已通过 `onDraggingChange` 把自身交给 `drag-target`。浮层不用「父级相对定位」糊一层，而是用目标元素的视口边界算出 `top/left/width/height`，以 `position: fixed` 盖住该矩形。容器滚动或偏移时，只要 `drag-target` 仍指向该节点，覆盖层跟着边界走。

文案用 props 控制：

- `overlay-title`：主标题，例如「将图片拖到此处完成上传」。
- `overlay-description`：`string[]`，每一项一行；官方 basic demo 用两行分别写数量上限与格式提示，和默认 `maxFiles=3`、`maxSize=10MB` 对齐，避免浮层说「随便拖」而指令其实会拒。

`fullscreen` 默认 `false`。打开后主要切换全屏相关 CSS 变量（内容区内边距、边框宽度等），用来控制覆盖层边框一类展示差异，而不是另起一套拖拽协议。区域拖拽上传一般保持默认；需要整页强调投放区时再打开。

浮层根节点带 `pointer-events: none`——视觉盖住了，事件仍落到下面的 dropzone。这是「纯展示」能成立的前提：浮层若自己抢事件，指令层的 `drop` 会丢。

## 换皮：CSS 变量、overlay 插槽与 disabled

默认浮层不够用时，先问要不要换整块 DOM。多数品牌色、圆角、字重用 CSS 变量就能收口，例如：

```css
:root {
  --tr-drag-overlay-bg-color: rgba(0, 0, 0, 0.1);
  --tr-drag-overlay-title-color: #333;
  --tr-drag-overlay-content-padding: 60px;
}
```

全屏模式另有 `--tr-drag-overlay-content-padding-fullscreen`、`--tr-drag-overlay-content-border-width-fullscreen` 等变量，文档有完整列表。变量覆盖优先于重写组件内部 class，升级时更不容易碎。

需要完全自定义视觉时，用 `overlay` 插槽替换默认图标与文案——官方 custom-overlay demo 在插槽里放渐变底与「释放鼠标上传图片」提示，同时把 `accept` 收紧为 `.jpg,.jpeg,.png,.gif`、`multiple: false`。插槽换的是「看起来怎样」，校验规则仍由指令参数决定；**不要只在插槽文案里写限制，却忘了改 `accept` / `maxSize`。**

上传中或只读态设 `disabled: true`：指令在 `dragenter` / `drop` 等路径直接返回，不会再推拖拽态。比「藏掉浮层但指令还在收文件」干净。

<!-- 素材待补：自定义 overlay 插槽效果截图 -->

## 协同数据流：回到 photo.png 的一句话

整条链路是单向的：

1. `photo.png` 进入 `.chat-area` → `v-dropzone` `dragenter` → `onDraggingChange(true, el)`。
2. 你的 `ref` 更新 → `<tr-drag-overlay>` 因 `is-dragging` 显示，并按 `drag-target` 定位。
3. 松手 → 指令清零拖拽态、跑校验 → 接受则 `onDrop(File[])`，拒绝则 `onError(FileRejection)`（同一次仍可能两者都有）。
4. 浮层随 `is-dragging === false` 隐藏；业务只消费回调里的文件，自行决定预览或上传。

指令不渲染浮层，浮层不解析 `dataTransfer`。状态只从指令经你的桥接到浮层，没有反向写入——这就是文档里「协同」的含义。

## 接入自检

照着 `photo.png` + `.chat-area` 勾一遍：

- [ ] `v-dropzone` 挂在真正的投放容器上，且传入 `onDrop`、`onError`、`onDraggingChange`
- [ ] `is-dragging` 与 `drag-target` 同时同步，浮层能看见
- [ ] `accept` / `maxSize` / `maxFiles` 与浮层文案一致
- [ ] 拒绝路径能读到 `rejection.code` 与 `rejection.files`
- [ ] 部分文件合法、部分非法时，同时处理 `onError` 与 `onDrop`
- [ ] 需要停用时走 `disabled`，而不是只藏浮层
- [ ] 业务上传从 `onDrop` 的 `File[]` 开始，不依赖组件内置对象存储

## 关于 OpenTiny NEXT

OpenTiny NEXT 是一套企业智能前端开发解决方案，以生成式 UI 和 WebMCP 两大核心技术为基础，对现有传统的 TinyVue 组件库、TinyEngine 低代码引擎等产品进行智能化升级，构建出面向 Agent 应用的前端 NEXT-SDKs、AI Extension、TinyRobot 智能助手、GenUI 等新产品，实现 AI 理解用户意图自主完成任务，加速企业应用的智能化改造。

欢迎加入 OpenTiny 开源社区。添加微信小助手：opentiny-official 一起参与交流前端技术～
OpenTiny 官网：[opentiny.design](https://opentiny.design)
TinyRobot 代码仓库：[github.com/opentiny/tiny-robot](https://github.com/opentiny/tiny-robot)（欢迎 star ⭐）
如果你也想要共建，可以进入代码仓库，找到 good first issue 标签，一起参与开源贡献～如果你有任何问题，欢迎在评论区留言交流！
