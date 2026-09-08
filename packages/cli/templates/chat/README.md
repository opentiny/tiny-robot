# TinyRobot Chat Add

这是一个独立的 Chat 扩展模板，提供通用工作助手场景的最小工程结构。

## 启动

```powershell
pnpm dev
```

## 构建

```powershell
pnpm type-check
pnpm build
```

## 接入真实模型

复制项目根目录的 `.env.example` 为 `.env.local`，配置 `VITE_QWEN_API_URL`、`VITE_ALIYUN_DASHSCOPE_KEY`、`VITE_DEEPSEEK_API_URL` 和 `VITE_DEEPSEEK_API_KEY`，重启 Vite 后即可使用模型选择器中的真实模型。模板只提供 `.env.example`，不会自动创建 `.env`。配置读取逻辑位于 `src/config/chat-runtime.ts`；使用 `add chat` 注入后，对应文件位于 `src/tiny-robot-chat/config/chat-runtime.ts`。

## 模型配置

模型配置中的 `icon` 用于模型选择器触发器；在窄容器中，带图标的模型会只显示图标。Qwen 模型支持深度思考和联网搜索，DeepSeek 模型支持深度思考。

DeepSeek 模型默认继承 `low`、`high`、`max` 三档思考强度，默认值为 `high`。开启 `深度思考` 后，模型选择器才会显示思考等级。业务侧可以在模型对象中通过 `efforts` 和 `defaultEffort` 覆盖选项；只有必须始终思考的模型才配置 `thinkingRequired: true`。

## MCP 代理

独立模板的 `vite.config.ts` 已配置 `/modelcontextprotocol-mcp` 代理。使用 `add chat` 时，CLI 不会复制或修改业务项目的 `vite.config.*`，需要手动把该代理配置添加到业务项目的 `server.proxy` 下，并重启 Vite。

## 目录职责

- `src/config/chat-ui.ts`: Chat UI、提示词、模板和菜单配置。
- `src/config/chat-runtime.ts`: MCP 示例和模型配置。
- `src/components`: 窗口头部和输入区工具。
- `src/composables/useWindow.ts`: floating、fullscreen 窗口状态。
- `src/index.css`: 仅作用于 Chat 容器的组件样式和 Surface 样式变量，不重置宿主页面的全局样式。

## 替换数据

直接修改 `src/config/chat-ui.ts` 和 `src/config/chat-runtime.ts` 中导出的数据；组件通过 props 使用这些配置。

## 切换窗口模式

默认显示 AI 头像按钮，点击后展开 Chat。窗口头部提供 floating、fullscreen 两种模式。floating 支持拖拽、缩放和位置恢复；fullscreen 铺满对应区域，可使用 Escape 返回悬浮窗口。点击关闭后返回 AI 头像按钮。
