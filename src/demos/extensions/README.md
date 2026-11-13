# 扩展管理

[Demo.vue](Demo.vue) 独立使用 `TrExtensionManager`，展示 MCP、Skills 和业务工具三个页签；条目来自 [fixtures/data.ts](../../fixtures/data.ts)。

可体验标签筛选、搜索、安装进度、启停、卸载及详情查看。安装和业务工具动作由应用模拟，不连接真实 MCP 服务。

点击“导入本地 Skill”，选择整个 [samples/weekly-report](../../../samples/weekly-report) 文件夹，确认后会出现“周报整理”条目。导入表单和详情组件使用真实的 Skill 文件解析能力，数据只保存在当前示例内存中。

复用时保留组件与事件绑定，将 `handleAction` 中的模拟进度和状态更新替换为自己的业务 API。
