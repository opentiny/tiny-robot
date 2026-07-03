# 掘金 (Juejin) 文章发布指南

掘金文章编辑器网址：`https://juejin.cn/editor/drafts/new?v=2`

> [!IMPORTANT]
> 阅读本文档前，请先阅读通用指南中的 **"避坑准则"** 部分：[publish-article.md](./publish-article.md)

---

## 可用工具

掘金页面已注入以下 WebMCP 工具，直接调用即可完成操作，无需手动操作编辑器 DOM。

| 工具名 | 描述 | 参数 |
|--------|------|------|
| `create_article` | 填写标题和正文，并按 manifest 上传图片、替换为 CDN URL | 见下方「图片上传参数」 |
| `get_article_info` | 在编辑器中获取当前草稿的标题和正文 | 无 |
| `publish_current_draft` | 自动填写分类、标签和摘要并发布 | `category`、`tag`、`summary`（50~100 字） |

### `create_article` 图片上传参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题 |
| `content` | ✅ | 正文 Base64；推荐 `@base64file:` 引用 `.publish/article-body.md` |
| `upload_images` | 含本地图时 ✅ | 设为 `true` 时，填入正文后自动触发编辑器图片上传并替换 URL |
| `images_manifest` | 含本地图时 ✅ | `@file:` 引用 `.publish/images-manifest.json` |

> [!WARNING]
> **禁止**向掘金传入含 `data:image/...;base64,...` 的正文——编辑器不会渲染，预览仍为裂图。本地图片必须通过上传按钮走平台 CDN。

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

### 第二步：填写标题、正文并上传图片

先按 [prepare-article-images.md](./prepare-article-images.md) 生成 `.publish/article-body.md` 与 `.publish/images-manifest.json`，再调用 `create_article`：

```bash
# TAB_ID 来自 tabs open 的返回值
webmcp-cli run create_article -t TAB_ID '{
  "title":"你的文章标题",
  "content":"@base64file:./articles/<project>/<slug>/.publish/article-body.md",
  "upload_images": true,
  "images_manifest": "@file:./articles/<project>/<slug>/.publish/images-manifest.json"
}'
```

#### 工具内部图片上传流程（掘金）

`upload_images: true` 时，`create_article` 在 CodeMirror 写入正文后，对 manifest 中每张图片：

1. 在编辑器工具栏定位**图片 / 上传图片**按钮（可用 `searchTree` 查询 `上传` 或 `图片` 作为兜底参考）。
2. 触发隐藏 `input[type=file]` 或通过 DataTransfer 注入文件，提交 `images[].absolute_path` 指向的本地文件。
3. 监听上传完成，从编辑器插入结果或剪贴板回调中获取掘金 CDN URL（通常为 `https://p*-devtool...` 或 `https://p*-passport...` 等域名）。
4. 在正文中将 `![alt](markdown_path)` 替换为 `![alt](CDN_URL)`，触发 CodeMirror change 以保存草稿。

#### 上传后校验（必做）

```bash
webmcp-cli run get_article_info -t TAB_ID
```

检查返回的 `content`：

- ✅ 图片语法应为 `![alt](https://...)`，URL 为掘金 CDN
- ❌ 若仍含 `./assets/`、`data:image` 或相对路径，**停止发布**，排查上传步骤或重试

PowerShell 推荐用 JSON 文件传参：

```json
{
  "title": "你的文章标题",
  "content": "@base64file:./articles/<project>/<slug>/.publish/article-body.md",
  "upload_images": true,
  "images_manifest": "@file:./articles/<project>/<slug>/.publish/images-manifest.json"
}
```

```bash
webmcp-cli run create_article -t TAB_ID -f ./article_args.json
```

> [!WARNING]
> - `title` 不能含有特殊引号等字符，否则 JSON 解析会失败
> - `@base64file:` / `@file:` 由 CLI 展开，无需手动 Base64 编码 manifest

### 第三步：一键发布

> [!IMPORTANT]
> - **切勿盲目使用默认值（"前端" 和 "Vue.js"）**！
> - 必须先调用 `get_article_info` 获取标题和正文，确认图片 URL 已替换为 CDN。
> - 基于正文智能推断 `category` 与 `tag`，并总结 **50~100 字**摘要传入 `summary`。
> - 摘要字数超出范围会导致 `publish_current_draft` 报错停止。

```bash
webmcp-cli run get_article_info -t TAB_ID

webmcp-cli run publish_current_draft -t TAB_ID '{"category":"开发工具","tag":"AI Agent","summary":"本指南详细介绍了如何使用 WebMCP 让 AI 助手精准操控浏览器，涵盖了安装配置、核心工具集的使用方法以及多种实际应用场景，是一篇极具实用价值的 AI Agent 实战教程。"}'
```

---

## 掘金图片相关避坑

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 预览区图片裂图 | 正文含 `./assets/` 相对路径 | 开启 `upload_images: true` 并传入 manifest |
| 预览区图片裂图 | 使用了 `data:` URI 内联 | 重新生成发布副本，禁止 Base64 内联 |
| 上传后 URL 未写入正文 | 仅粘贴 Markdown 未触发上传 | 必须走工具栏上传逻辑，不能 skip `upload_images` |
| 上传按钮 click 无效 | 需操作隐藏 file input | 工具应优先 `input[type=file]` + DataTransfer，再 fallback click 工具栏 |
