# Chat Presentation

热启动查看宣讲页面：

```bash
pnpm --dir presentation dev
```

打开 `http://127.0.0.1:4173`。

页面入口是 `index.html`，运行逻辑、章节加载和案例配置集中在 `presentation.js`，正文按章节保留在 `chapters/` 中。
