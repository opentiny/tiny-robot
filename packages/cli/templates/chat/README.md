# chat-add

`chat-add` 是一个可嵌入现有 Vue 应用的 Chat 扩展模板，提供通用工作助手场景的最小工程结构。

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

将生成的 `.env.example` 复制为 `.env.local`，按需配置 `VITE_ALIYUN_DASHSCOPE_KEY` 和 `VITE_DEEPSEEK_API_KEY`，重启 Vite 后即可使用模型选择器中的真实模型。

Qwen 和 DeepSeek 默认使用 `@opentiny/tiny-robot-chat` 内置的官方接口地址。仅在使用代理、私有网关或其他地域接口时，才需要在 `.env.local` 中额外配置 `VITE_QWEN_API_URL` 或 `VITE_DEEPSEEK_API_URL`。配置读取逻辑位于 `src/tiny-robot-chat/config/chat-runtime.ts`。

## 目录职责

- `src/TinyRobotChat.vue`: 悬浮入口、Chat 主体以及组件作用域样式。
- `src/tiny-robot-chat/config/chat-ui.ts`: Chat UI、提示词和模板配置。
- `src/tiny-robot-chat/config/chat-runtime.ts`: 模型配置和留给后续集成的空 MCP Server 列表。
- `src/tiny-robot-chat/components`: 窗口头部和输入区工具。
- `src/tiny-robot-chat/composables/useWindow.ts`: floating、fullscreen 窗口状态。

## 替换数据

直接修改 `src/tiny-robot-chat/config/chat-ui.ts` 和 `src/tiny-robot-chat/config/chat-runtime.ts` 中导出的数据；组件通过 props 使用这些配置。

## 切换窗口模式

默认显示 AI 头像按钮，点击后展开 Chat。窗口头部提供 floating、fullscreen 两种模式。floating 支持拖拽、缩放和位置恢复；fullscreen 铺满对应区域，可使用 Escape 返回悬浮窗口。点击关闭后返回 AI 头像按钮。
