# 综合示例

## 直接嵌入页面

在页面主体布局中集成 `TrBubbleList`、`TrSender`、`TrHistory`，配合 `useConversation` 与消息引擎，完成多会话与消息收发。

<demo vue="../../demos/examples/AssistantPageExample.vue" :vueFiles="['../../demos/examples/AssistantPageExample.vue', '../../demos/examples/responseProvider.ts', '../../demos/examples/assistantConstants.ts', '../../demos/examples/mockMcp.ts']" />

## 使用悬浮容器

使用 `TrContainer` 的悬浮窗形态，可控制显示与全屏，适合在站点内以浮层嵌入聊天。

<demo vue="../../demos/examples/AssistantContainerExample.vue" :vueFiles="['../../demos/examples/AssistantContainerExample.vue', '../../demos/examples/responseProvider.ts', '../../demos/examples/assistantConstants.ts', '../../demos/examples/mockMcp.ts']" />
