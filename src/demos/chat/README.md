# 会话与附件

[Demo.vue](Demo.vue) 使用 `TrChat` 和 `useChatRuntime` 组合会话列表、消息区和输入区。

操作：切换历史会话，上传、拖入或粘贴图片，再发送问题。支持一张 2 MB 以内的 PNG 或 JPEG。

- `source` 为 `mock` 时使用本地 SSE 接口，为 `live` 时使用本地百炼代理。
- `createDemoStorage` 来自 [fixtures/data.ts](../../fixtures/data.ts)，演示在内存中读写会话和消息。
- 应用读取图片并将附件交给输入区；Kit 插件在回合开始时将图片转换为 OpenAI 兼容的 `image_url` 消息内容。
- 复用时，替换模型接口和会话存储，并接入应用的鉴权。

真实模型配置见[工程 README](../../../README.md#试用真实视觉模型)。
