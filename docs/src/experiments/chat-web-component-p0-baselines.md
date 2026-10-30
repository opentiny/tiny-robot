---
outline: [1, 2]
---

# TrChat Web Component P0 原版基线

本页只用于将原版 Vue `TrChat` / `TrChatUI` 与 Web Component P0 Demo 做浏览器业务和截图对照。

## Runtime 状态订阅

<demo
  vue="../../demos/chat/runtime-subscription.vue"
  :vueFiles="['../../demos/chat/runtime-subscription.vue', '../../demos/chat/shared/runtime-demo.css']"
  title="Runtime 状态订阅基线"
  description="原版 Vue 直接消费 Runtime reactive state。"
/>

## 复杂 Property 更新

<demo
  vue="../../demos/chat/complex-properties.vue"
  :vueFiles="['../../demos/chat/complex-properties.vue', '../../demos/chat/shared/runtime-demo.css']"
  title="复杂 Property 更新基线"
  description="原版 Vue 使用 shallow ref 明确整体替换语义。"
/>

## Runtime 与存储所有权

<demo
  vue="../../demos/chat/runtime-ownership.vue"
  :vueFiles="['../../demos/chat/runtime-ownership.vue', '../../demos/chat/shared/runtime-demo.css']"
  title="Runtime 与存储所有权基线"
  description="原版 Vue 由应用管理 Runtime 的切换、停止、重挂载与隔离存储。"
/>
