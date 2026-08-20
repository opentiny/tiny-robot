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

在 `packages/chat-add/.env.local` 中配置 `VITE_QWEN_API_URL`、`VITE_ALIYUN_DASHSCOPE_KEY`、`VITE_DEEPSEEK_API_URL` 和 `VITE_DEEPSEEK_API_KEY`，重启 Vite 后即可使用模型选择器中的真实模型。配置读取逻辑位于 `src/data/modelProviders.ts`。

## 目录职责

- `src/config`: Chat UI、提示词、模板和菜单配置。
- `src/data`: MCP 示例数据。
- `src/components`: 窗口头部和输入区工具。
- `src/useWindow.ts`: floating、side、fullscreen 窗口状态。
- `src/styles`: 模板公共样式和 Surface 样式变量。

## 替换数据

直接修改 `src/config/prompts.ts`、`src/config/templates.ts`、`src/config/menus.ts` 和 `src/data/mcp.ts` 中导出的数据；组件通过 props 使用这些配置。

## 切换窗口模式

窗口头部提供 floating、side、fullscreen 三种模式。floating 支持拖拽、缩放和位置恢复；side 与 fullscreen 铺满对应区域，fullscreen 可使用 Escape 返回之前模式。
