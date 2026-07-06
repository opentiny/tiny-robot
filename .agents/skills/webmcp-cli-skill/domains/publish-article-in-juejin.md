# 掘金 (Juejin) 文章发布指南

掘金文章编辑器网址：`https://juejin.cn/editor/drafts/new?v=2`

> [!IMPORTANT]
> 阅读本文档前，请先阅读通用指南中的 **"避坑准则"** 部分：[publish-article.md](./publish-article.md)

---

## 可用工具

掘金页面已注入以下 WebMCP 工具，直接调用即可完成操作，无需手动操作编辑器 DOM。

| 工具名 | 描述 | 参数 |
|--------|------|------|
| `create_article` | 填写标题和正文 | `title`（标题字符串）、`content`（正文的 **Base64** 编码） |
| `get_article_info` | 在编辑器中获取当前草稿的标题和正文 | 无 |
| `publish_current_draft` | 自动填写分类、标签和摘要并发布 | `category`、`tag`、`summary`（50~100 字） |

---

## 连续发布流程

### 第一步：打开编辑器

```bash
webmcp-cli tabs open "https://juejin.cn/editor/drafts/new?v=2"
webmcp-cli state
```

> [!IMPORTANT]
> **标签页定位（必读）**
>
> 1. `tabs open` 会返回 `tabid`，后续 `run` 建议始终带上 `-t <tabid>`。
> 2. 掘金打开 `/new?v=2` 后，填写标题时会**自动跳转**为 `/editor/drafts/{id}`——属正常现象。
> 3. 发布前务必 `tabs switch` 到含文章内容的编辑器标签页，再执行 `publish_current_draft`。

### 第二步：填写标题和正文

将文章内容写入 `.md` 文件后，通过 `@base64file:` 内联引用传入：

```bash
# TAB_ID 来自 tabs open 的返回值
webmcp-cli run create_article -t TAB_ID '{"title":"你的文章标题","content":"@base64file:./article.md"}'
```

PowerShell 推荐用 JSON 文件传参：

```json
{
  "title": "你的文章标题",
  "content": "@base64file:./article.md"
}
```

```bash
webmcp-cli run create_article -t TAB_ID -f ./article_args.json
```

> [!WARNING]
> - `title` 不能含有特殊引号等字符，否则 JSON 解析会失败
> - `@base64file:` 由 CLI 展开，无需手动 Base64 编码正文

### 第三步：一键发布

> [!IMPORTANT]
> - **切勿盲目使用默认值（"前端" 和 "Vue.js"）**！
> - 必须先调用 `get_article_info` 获取标题和正文。
> - 基于正文智能推断 `category` 与 `tag`，并总结 **50~100 字**摘要传入 `summary`。
> - 摘要字数超出范围会导致 `publish_current_draft` 报错停止。

```bash
webmcp-cli run get_article_info -t TAB_ID

webmcp-cli run publish_current_draft -t TAB_ID '{"category":"开发工具","tag":"AI Agent","summary":"本指南详细介绍了如何使用 WebMCP 让 AI 助手精准操控浏览器，涵盖了安装配置、核心工具集的使用方法以及多种实际应用场景，是一篇极具实用价值的 AI Agent 实战教程。"}'
```
