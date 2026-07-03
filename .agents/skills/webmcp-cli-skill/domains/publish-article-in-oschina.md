# 开源中国文章发布指南

开源中国文章编辑器网址：`https://my.oschina.net/u/${uid}/blog/ai-write`

---

## 可用工具

开源中国页面已注入 `create_article` WebMCP 工具，直接调用即可完成标题和正文填写，无需手动操作编辑器 DOM。

| 工具名           | 描述               | 参数                                                                       |
| ---------------- | ------------------ | -------------------------------------------------------------------------- |
| `create_article` | 填写文章标题和正文，可选上传 manifest 图片 | `uid`、`title`、`content`（Base64）、`upload_images`（可选）、`images_manifest`（可选） |

---

## 阶段一：创建草稿（人工审核前）

> [!IMPORTANT]
> 新文章**不要直接发布**，完成第二步后停止，等待人工审核。审核通过后再执行「阶段二」。

### 第一步：打开编辑器

使用 `state` 检查当前标签。如果未打开开源中国编辑器，先导航过去：

```bash
webmcp-cli tabs open "https://my.oschina.net/u/${uid}/blog/ai-write"
webmcp-cli state
```

${uid} 是用户在开源中国的uid值， 一串数字。 必须要求用户先提供它才能发布文章。

### 第二步：填写标题和正文（完成后停止）

将**步骤 2.5 生成的** `.publish/article-body.md` 与 `.publish/images-manifest.json` 传入，并开启图片上传：

```bash
webmcp-cli run create_article '{"uid":"<用户uid>","title":"你的文章标题","content":"@base64file:./articles/<project>/<slug>/.publish/article-body.md","upload_images":true,"images_manifest":"@file:./articles/<project>/<slug>/.publish/images-manifest.json"}'
```

> [!WARNING]
> - 开源中国编辑器**不支持** `data:` URI 内联；本地图片须通过编辑器上传能力提交到平台图床。

**如果需要传 JSON 文件（高级用法）：**

```json
// article_args.json
{
  "title": "你的文章标题",
  "content": "<正文的Base64编码>"
}
```

```bash
webmcp-cli run create_article -f ./article_args.json
```

> [!NOTE]
> 执行完第二步后，文章会自动保存为草稿。**此时停止，通知用户进行人工审核。**
