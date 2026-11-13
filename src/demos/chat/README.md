# 会话与附件

[Demo.vue](Demo.vue) 使用 `TrChat` 和 `useChatRuntime` 组合会话列表、消息区和输入区。

操作：切换历史会话，上传、拖入或粘贴图片，再发送问题。支持一张 2 MB 以内的 PNG 或 JPEG。

- `source` 属性默认为 `mock`，指向本地 SSE 接口；`live` 指向本地百炼代理。来源变化时，外层通过 `key` 重新创建组件。
- `createDemoStorage` 来自 [fixtures/data.ts](../../fixtures/data.ts)，演示在内存中读写会话和消息。
- 应用读取图片并将附件交给输入区；Kit 插件在回合开始时将图片转换为 OpenAI 兼容的 `image_url` 消息内容。
- `TrChat` 负责界面和 Runtime 交互；真实上传、鉴权、模型接口和持久存储由应用接入。

默认模拟回复明确标明不分析图片。真实模型配置见[工程 README](../../../README.md#试用真实视觉模型)。
