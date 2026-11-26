# TinyRobot Chat

这是通过 `add chat` 接入现有 Vue 项目的聊天功能说明。CLI 将本文档生成到 `src/tiny-robot-chat/README.md`；以下路径均以宿主项目根目录为基准。

## 接入组件

安装或更新项目依赖：

```bash
pnpm install
```

在应用中引入并渲染组件，例如 `src/App.vue`：

```vue
<script setup lang="ts">
import TinyRobotChat from './tiny-robot-chat/TinyRobotChat.vue'
</script>

<template>
  <TinyRobotChat />
</template>
```

组件已导入所需样式。CLI 不会修改宿主项目的 `src/main.ts`、`src/main.js`、`src/App.vue` 或 `vite.config.*`，需要手动挂载组件。

## 接入真实模型

1. 复制项目根目录的 `.env.example` 为 `.env.local`。
2. 配置所选模型的 API Key。
3. 重启 Vite，在模型选择器中选择对应模型。

**模型密钥（按需配置）**

| 模型 | 环境变量 |
| --- | --- |
| Qwen | `VITE_ALIYUN_DASHSCOPE_KEY` |
| DeepSeek | `VITE_DEEPSEEK_API_KEY` |

**自定义地址（可选）**

| 用途 | 环境变量 |
| --- | --- |
| Qwen Provider 代理地址 | `VITE_QWEN_API_URL` |
| DeepSeek Provider 代理地址 | `VITE_DEEPSEEK_API_URL` |
| 高德 MCP 地址 | `VITE_AMAP_MCP_URL` |

模板仅提供 `.env.example`，不会自动创建 `.env`。

配置读取逻辑：`src/tiny-robot-chat/config/chat-runtime.ts`。

`VITE_*` 变量会被写入浏览器产物，仅限开发使用，禁止配置生产密钥；生产环境应通过服务端代理保护 Provider 凭证。

## 模型配置

模型配置中的 `icon` 用于模型选择器触发器；在窄容器中，带图标的模型会只显示图标。Qwen 模型通过 `features` 配置思考强度和联网搜索，DeepSeek 模型通过 `features` 配置思考强度。

模型字段通过 `defaultValue` 设置默认值。每个模型可通过自己的 `mapFeatureValues` 将有效设置值转换为请求参数。必须思考的模型省略「关闭」选项。

## MCP 代理

使用 Model Context MCP 示例时，在宿主项目的 `vite.config.*` 中将以下配置添加到 `server.proxy`；如果已有配置，只追加该路由，保留现有配置。修改后重启 Vite。

```ts
export default defineConfig({
  server: {
    proxy: {
      '/modelcontextprotocol-mcp': {
        target: 'https://modelcontextprotocol.io/mcp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/modelcontextprotocol-mcp/, ''),
      },
    },
  },
})
```

该代理仅用于 Vite 开发服务器；部署环境需配置对应的服务端代理。

## 启动与构建

完成接入和配置后，使用宿主项目已有的启动、类型检查和构建命令，例如 `pnpm dev` 和 `pnpm build`。

## 目录职责

- `src/tiny-robot-chat/config/chat-ui.ts`: Chat UI、提示词、模板和菜单配置。
- `src/tiny-robot-chat/config/chat-runtime.ts`: MCP 示例和模型配置。
- `src/tiny-robot-chat/TinyRobotChat.vue`: Chat 入口组件及其样式依赖。
- `src/tiny-robot-chat/components`: 窗口头部和输入区工具。
- `src/tiny-robot-chat/composables/useWindow.ts`: floating、fullscreen 窗口状态。
- `src/tiny-robot-chat/index.css`: 仅作用于 Chat 容器的组件样式和 Surface 样式变量，不重置宿主页面的全局样式。

## 替换数据

直接修改 `src/tiny-robot-chat/config/chat-ui.ts` 和 `src/tiny-robot-chat/config/chat-runtime.ts` 中导出的数据；组件通过 props 使用这些配置。

## 切换窗口模式

默认显示 AI 头像按钮，点击后展开 Chat。窗口头部提供 floating、fullscreen 两种模式。floating 支持拖拽、缩放和位置恢复；fullscreen 铺满对应区域，可使用 Escape 返回悬浮窗口。点击关闭后返回 AI 头像按钮。
