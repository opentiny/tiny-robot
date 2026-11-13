# 模型选择

[Demo.vue](Demo.vue) 独立使用 `TrModelSelector`，不调用模型服务。

打开面板可浏览“通用模型”和“推理模型”分组；搜索“推理”并选中“推理助手”后，可将思考强度设置为“深度”。

- `models` 定义分组、模型和可调整的 `features`。
- `searchable` 开启搜索，`close-on-select="false"` 让选中后继续调整设置。
- `renderTriggerText` 根据模型和设置显示当前选择。

实际接入中，应用负责模型请求以及设置到服务参数的转换。
