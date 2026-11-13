# 长对话导航

[Demo.vue](Demo.vue) 通过 `ui.anchor: {}` 开启 `TrChat` 内置的消息目录，使用 [fixtures/data.ts](../../fixtures/data.ts) 的固定长对话。

悬停在右侧标记上展开目录，点击提问跳到历史消息；手动滚动可观察当前项高亮，再点击“滚动到底部”返回最新消息。

目录默认在视口宽度达到 768px 时显示。会话和请求逻辑仍由 Runtime 管理，示例使用本地模拟模型。
