# chat-add

`chat-add` 是一个独立的 Chat 扩展模板，提供通用工作助手场景的最小工程结构。

## 启动

```powershell
pnpm --filter chat-add dev
```

## 构建

```powershell
pnpm --filter chat-add type-check
pnpm --filter chat-add build
```

## 接入真实模型

在 `packages/chat-add/.env.local` 中配置 `VITE_QWEN_API_URL`、`VITE_ALIYUN_DASHSCOPE_KEY`、`VITE_DEEPSEEK_API_URL` 和 `VITE_DEEPSEEK_API_KEY`，重启 Vite 后即可使用模型选择器中的真实模型。配置读取逻辑位于 `src/config/chat-runtime.ts`。

## 目录职责

- `src/config/chat-ui.ts`: Chat UI、提示词、模板和菜单配置。
- `src/config/chat-runtime.ts`: MCP 示例和模型配置。
- `src/components`: 窗口头部和输入区工具。
- `src/composables/useWindow.ts`: floating、fullscreen 窗口状态。
- `src/index.css`: 模板公共样式和 Surface 样式变量。

## 替换数据

直接修改 `src/config/chat-ui.ts` 和 `src/config/chat-runtime.ts` 中导出的数据；组件通过 props 使用这些配置。

## 切换窗口模式

默认显示 AI 头像按钮，点击后展开 Chat。窗口头部提供 floating、fullscreen 两种模式。floating 支持拖拽、缩放和位置恢复；fullscreen 铺满对应区域，可使用 Escape 返回悬浮窗口。点击关闭后返回 AI 头像按钮。
