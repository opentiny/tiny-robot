# 多行输入首行提示

[Demo.vue](Demo.vue) 独立使用 `TrSender` 的 `input-prefix` 插槽展示当前任务。

选择“起草客户回复”后输入正文，再切换到“生成交接摘要”：标签更新，草稿保留。按 Enter 换行，标签只占第一行；按 Ctrl/Cmd + Enter 提交，可看到发送时所选的任务和正文。

应用分别保存 `task`、`draft` 和 `submitted`。切换任务只更新 `task`，提交时再一起记录任务和正文。示例不调用模型服务。
