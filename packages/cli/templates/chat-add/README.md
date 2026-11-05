# TinyRobot Chat 接入

## 接入组件

安装或更新项目依赖，在应用中引入并渲染组件，例如：

```vue
<script setup lang="ts">
import TinyRobotChat from './tiny-robot-chat/TinyRobotChat.vue'
</script>

<template>
  <TinyRobotChat />
</template>
```

以上路径以 `src/App.vue` 为例；组件已导入所需样式。

## 模型配置

使用真实模型时，复制项目根目录的 `.env.example` 为 `.env.local`，配置所选模型需要的 API Key，然后重启 Vite。自定义地址等配置见 `.env.example`。

`VITE_*` 变量会进入浏览器产物，仅用于开发；生产环境应通过服务端代理保护模型凭证。

## Model Context MCP 代理

使用 Model Context MCP 示例时，在项目的 `vite.config.*` 中将以下配置添加到 `server.proxy`；如果已有配置，只追加该路由，保留现有配置。修改后重启 Vite。

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
