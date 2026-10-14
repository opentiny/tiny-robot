---
outline: [1, 3]
---

<script setup>
import { defineClientComponent } from 'vitepress'

const ChatExperimentalGallery = defineClientComponent(() =>
  import('../../demos/chat-experimental/ChatExperimentalGallery.vue'),
)
</script>

# TrChat Web Component 原型

此页面用于验证将 Vue `TrChat` / `TrChatUI` 包装为 Web Component 的功能完整性。当前 API 属于实验功能，不承诺稳定版本兼容；原型入口是 `@opentiny/tiny-robot-chat/experimental`（注意拼写为 **experimental**，不是 `experiment`）。

```ts
import { defineTrChatElements, type TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import '@opentiny/tiny-robot-chat/experimental/web-component.css'

defineTrChatElements()

const chat = document.createElement('tr-chat') as TrChatHTMLElement
chat.runtimeOptions = { responseProvider }
document.body.append(chat)
```

原型使用 Vue 3 `defineCustomElement()`、Light DOM 和显式注册。复杂值通过 DOM 属性传递，响应式属性更新时重新赋值；事件使用标准 `CustomEvent`，`detail` 直接承载 payload；无上下文内容使用命名 slot，带上下文内容通过 `renderers` 属性返回 DOM Node。`runtimeOptions` 是 owned Runtime 的配置，可在连接元素前设置，也兼容 Angular 等框架先连接元素、随后绑定属性的初始化顺序；重新赋值会重建并释放旧的 owned Runtime。需要由宿主控制生命周期时，应改用 `runtime` 注入属性。

`experimental/web-component.css` 已包含 Web Component 所需的 TinyRobot 基础组件样式，外部框架无需再单独导入 `@opentiny/tiny-robot/dist/style.css`。若宿主为元素设置固定高度，同时设置 `--tr-layout-height: 100%`，可让内部布局以宿主而不是视口为高度基准；若宿主可能窄于默认的 320px 主列，可按产品需求覆盖 `--tr-layout-main-min-width`，Angular 验证工程使用 `0` 并覆盖了 320px 视口。

下面固定列出 PR source 分支中的 18 个 Vue 文档示例及对应实验实现。每项显示基线源码、当前 Web Component 结果与后续自动化使用的稳定 matrix ID。

<ClientOnly>
  <ChatExperimentalGallery />
</ClientOnly>
