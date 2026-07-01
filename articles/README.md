# articles

文章母稿目录。每篇文章使用 `articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md`。

## 发布记录

`articles/publications.json` 记录新流程文章及其在各平台的成功发布事实。创建 Draft PR 时，`article-hub create-pr` 会先写入文章条目和空 `publications`；文件不管理发布任务，不记录待发布、失败或下架状态。缺少平台记录表示尚未确认发布。

初始结构：

```json
{
  "schema_version": "article-hub.publications.v1",
  "articles": {}
}
```

创建 Draft PR 时，`article-hub create-pr` 会在 `articles` 中按文章目录加入条目。`article_id` 由 `article_file` 派生：去掉 `articles/` 前缀和 `/article.md` 后缀。

```json
{
  "schema_version": "article-hub.publications.v1",
  "articles": {
    "webmcp-sdk/2026-06-19-webmcp-guide": {
      "article_file": "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md",
      "title": "WebMCP SDK 实践指南",
      "topic_issue": 12,
      "source_pr": 34,
      "publications": {
        "juejin": {
          "url": "https://juejin.cn/post/...",
          "published_date": "2026-06-30"
        }
      }
    }
  }
}
```

字段约定：

- `article_file` 指向本仓库 `articles/` 下的母稿文件。
- `title` 是创建或更新 Draft PR 时传入的最终标题。
- `topic_issue` 和 `source_pr` 是当前仓库内的 Issue / PR 编号，可省略。
- `publications` 的 key 是平台标识；当前不设 allowlist，建议使用小写 snake_case。
- 每条平台记录包含 `url` 和 `published_date`。`url` 是完整平台文章 URL；`published_date` 是 UTC+8 日期，格式为 `YYYY-MM-DD`。

编辑约定：

- `articles` 按记录加入时间追加，保留人工添加顺序。
- 单篇文章内的 `publications` 建议按平台 key 字典序排列。
- 文章条目字段建议按 `article_file`、`title`、`topic_issue`、`source_pr`、`publications` 排列；省略不存在的可选字段。
- 平台记录字段建议按 `url`、`published_date` 排列。
