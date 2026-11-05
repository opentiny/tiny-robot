# TinyRobot Chat 接入

## Model Context MCP 代理

Model Context MCP 示例使用 `/modelcontextprotocol-mcp`。在项目的 `vite.config.*` 中将以下配置添加到 `server.proxy`；如果已有配置，只追加该路由，保留现有配置。修改后重启 Vite。

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
