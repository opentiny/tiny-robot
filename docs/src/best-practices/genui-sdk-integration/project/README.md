# TrChat 接入 GenUI SDK 示例

需要 Node.js 22 和 pnpm 10。

```bash
pnpm install
```

复制 `.env.example` 为 `.env.local`，填写所选模型对应的 `VITE_ALIYUN_DASHSCOPE_KEY` 或 `VITE_DEEPSEEK_API_KEY`，然后启动项目：

```bash
pnpm dev
```

打开页面后，在输入区启用“生成式 UI”，即可请求模型生成界面。

[最佳实践文章](../docs/index.md)
