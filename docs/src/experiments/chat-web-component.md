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
import '@opentiny/tiny-robot-chat/experimental.css'

defineTrChatElements()

const chat = document.createElement('tr-chat') as TrChatHTMLElement
chat.runtimeOptions = { responseProvider }
document.body.append(chat)
```

原型使用 Vue 3 `defineCustomElement()`、Light DOM 和显式注册。复杂值通过 DOM 属性传递，响应式属性更新时重新赋值；事件使用标准 `CustomEvent`，`detail` 直接承载 payload；无上下文内容使用命名 slot，带上下文内容通过 `renderers` 属性返回 DOM Node。`runtimeOptions` 是 owned Runtime 的初始化配置，必须在连接元素前设置，挂载后不会据此重建 Runtime；需要动态切换时应改写 `runtime` 注入属性或创建新元素。

下面固定列出 PR source 分支中的 18 个 Vue 文档示例及对应实验实现。每项显示基线源码、当前 Web Component 结果与后续自动化使用的稳定 matrix ID。

<ClientOnly>
  <ChatExperimentalGallery />
</ClientOnly>
