# 从 ai-article-hub 发布文章到外部平台

本指南面向 AI Agent，串联 **仓库准备 → 解析发布记录 → 平台发布 → 回写 `publications.json` 并提 PR** 的完整流程。

> 平台侧浏览器操作仍须遵守 [publish-article.md](./publish-article.md) 与各平台子指南；本文只描述与 `ai-article-hub` 仓库相关的编排步骤。

---

## 前置条件

- 用户已明确 **目标平台**（如 `juejin`、`csdn`、`segmentfault`）和 **文章标题**（用于在 `publications.json` 中匹配条目）。
- 本机已配置 `git`、`gh`，且对 `git@github.com:hexqi/ai-article-hub.git` 有拉取与推送权限。
- `gh` 已登录 GitHub（`gh auth status` 正常）；未登录时 `gh pr create` 等命令会返回 `401 Bad credentials`。
- `webmcp-cli` 可用，目标平台已在浏览器中登录（若跳转到登录页，暂停并通知用户手动登录）。

---

## 步骤 1：准备 ai-article-hub 仓库与发布分支

### 1.1 定位仓库根目录

按以下顺序判断，**命中即停止**：

| 条件 | 仓库根目录 | 是否 clone |
|------|-----------|-----------|
| 当前工作空间根目录存在 `articles/publications.json` | 工作空间根目录（当前仓库即为 `ai-article-hub`） | 否 |
| 工作空间下存在 `ai-article-hub/` 目录 | `ai-article-hub/` | 否 |
| 以上均不满足 | 在工作空间根目录执行 clone（见 1.2） | 是 |

> **仓库已存在时**：跳过 clone，但仍须执行 **1.3 同步 main**，拉取远端最新 `main` 后再创建发布分支。

### 1.2 Clone（仅当尚无仓库时）

```bash
git clone git@github.com:hexqi/ai-article-hub.git ai-article-hub
```

Clone 完成后，仓库根目录为 `ai-article-hub/`，然后继续执行 1.3。

### 1.3 同步 main（必做）

无论仓库是刚 clone 还是已存在，**都必须**先拉取远端最新 `main`，再基于该分支创建发布分支：

```bash
cd <仓库根目录>
git fetch origin main
git checkout main
git pull origin main
```

> 若远端默认分支为 `master` 而非 `main`，将上述命令中的 `main` 替换为 `master`。切换分支前须确认工作区干净或可安全 stash / 丢弃本地改动。

### 1.4 基于 main 创建发布分支

分支名格式：**`<平台标识>/<时间戳>`**

- **平台标识**：与用户指定的发布平台一致，使用小写（如 `juejin`、`csdn`、`segmentfault`）。
- **时间戳**：UTC+8 当前时刻，格式 `YYYYMMDD-HHmmss`（例如 `20260701-143052`）。

示例分支名：`juejin/20260701-143052`

```bash
cd <仓库根目录>
git checkout -b <平台标识>/<时间戳>
```

> 创建发布分支前须已完成 1.3 的 main 同步；不要在未拉取最新 main 的旧提交上开分支。

---

## 步骤 2：解析 `articles/publications.json` 并定位母稿

### 2.1 读取发布记录

文件路径：`<仓库根目录>/articles/publications.json`。

若文件不存在、JSON 无效，或 `articles` 为空对象 `{}`，则使用以下默认内容作为查找起点（**仅用于匹配标题，不自动写回文件**）：

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

### 2.2 按标题匹配文章

1. 遍历 `articles` 中所有条目。
2. 将条目的 `title` 与用户提供的标题做 **精确匹配**（去除首尾空白后比较）。
3. 命中 **0 条**：停止流程，告知用户未在 `publications.json` 中找到该标题，请确认 Draft PR 是否已创建且 `create-pr` 已写入记录。
4. 命中 **多条**：停止流程，列出冲突条目，请用户指定 `article_file` 或 `article_id`。
5. 命中 **1 条**：记下 `article_file` 及对应 `article_id`（`article_file` 去掉 `articles/` 前缀和 `/article.md` 后缀）。

### 2.3 校验母稿文件

母稿绝对路径：`<仓库根目录>/<article_file>`。

| 情况 | 处理 |
|------|------|
| 文件不存在 | **停止**，提示：「文章不存在，请检查文章是否编写成功。」 |
| 文件存在但内容为空或仅空白 | **停止**，同上 |
| 文件可读且有正文 | 继续；发布时使用该文件的 **原始 Markdown**（不做润色改写，除非用户另有要求） |

### 2.4 可选：检查是否已在目标平台发布

若该条目 `publications` 中已存在目标平台 key 且含有效 `url`，**先询问用户**是否仍要重新发布；默认不覆盖，除非用户明确确认。

## 步骤 3：发布到目标平台

根据平台标识阅读并执行对应子指南：

| 平台 key | 子指南 |
|----------|--------|
| `juejin` | [publish-article-in-juejin.md](./publish-article-in-juejin.md) |
| `csdn` | [publish-article-in-csdn.md](./publish-article-in-csdn.md) |
| `segmentfault` | [publish-article-in-segmentfault.md](./publish-article-in-segmentfault.md) |
| `oschina` | [publish-article-in-oschina.md](./publish-article-in-oschina.md) |

### 通用要求

1. 发布前阅读 [publish-article.md](./publish-article.md) 中的质量与避坑准则。
2. 文章 **标题** 使用 `publications.json` 条目中匹配的 `title`（与母稿 front matter 不一致时以 `publications.json` 为准，除非用户指定）。
3. 文章 **正文** 使用步骤 2 命中的母稿 `article_file`，**发布前须去掉 YAML Front Matter**（`---` 块），只把 Markdown 正文写入平台；**不修改母稿**。推荐先用共用脚本生成临时 `body.md`（见下方「正文预处理」），再传给平台工具。`juejin` / `csdn` / `oschina` 的 `create_article` 用 `@base64file:` 或 `-f` 传入去 frontmatter 后的正文（`content` 为 Base64）；`segmentfault` 的 `segmentfault_publish_article` 须传**去 frontmatter 后的原始 Markdown**（长文用 `-f`），勿用 `@base64file:`。
4. 严格遵守 `webmcp-cli state` → 领域工具 → `page-agent-tool` 的调用顺序（见主 Skill）。
5. **仅在平台确认发布成功并取得文章 URL 后** 进入步骤 4；草稿-only、审核中、无 URL 均视为未成功。

### 正文预处理（必做）

ai-article-hub 母稿 `article.md` 含 YAML Front Matter（如 `schema_version`、`title`、`sources` 等），**不得**原样写入掘金/CSDN/思否正文。发布前先运行：

```bash
node .agents/skills/webmcp-cli-skill/scripts/shared/prepare-publish-body.mjs \
  --file <article_file> \
  --out-dir .cache/publish-body/<article-id>/
```

stdout 返回 JSON，其中 `body_file` 为去 frontmatter 后的临时 `body.md`。后续 `create_article` / `segmentfault_publish_article` 的 `content` **必须**引用该 `body_file`（掘金/CSDN 用 `@base64file:<body_file>`；思否把 `body_file` 正文读入 JSON 的 `content` 字段）。`.cache/` 不得提交 git；**不要**改写母稿 `article.md`。

### 平台发布后须记录

- **`url`**：平台返回的完整文章链接（非草稿箱链接）。
- **`published_date`**：发布成功时刻的 UTC+8 日期，格式 `YYYY-MM-DD`。

---

## 步骤 4：回写 `publications.json` 并提交 PR

### 4.1 更新 JSON

在步骤 2 命中的文章条目下，向 `publications` 写入或更新目标平台记录：

```json
"juejin": {
  "url": "https://juejin.cn/post/7345678901234567890",
  "published_date": "2026-07-01"
},
"csdn": {
  "url": "https://blog.csdn.net/xxx/article/details/123456789",
  "published_date": "2026-06-30"
}
```

编辑约定（与仓库 `articles/README.md` 一致）：

- 平台 key 使用小写（如 `juejin`、`csdn`）。
- 单篇文章内 `publications` 的 key 建议按字典序排列。
- 平台记录字段顺序：`url`、`published_date`。
- 保留该条目已有字段（`article_file`、`title`、`topic_issue`、`source_pr` 及其他平台记录），仅新增或更新本次平台。

### 4.2 确认 `gh` 已认证（提交 PR 前必做）

平台发布成功、准备 `git push` 与 `gh pr create` 之前，先检查 GitHub CLI 登录状态：

```bash
gh auth status
```

| 情况 | 处理 |
|------|------|
| 输出显示已登录且 token 有效 | 继续 4.3 |
| 返回 `401 Bad credentials`、`gh: Bad credentials` 或未登录 | **暂停**，通知用户在本机执行 `gh auth login` 完成认证后，再继续 push 与创建 PR |
| 用户暂时无法登录 | 可先本地 commit 并保留发布 URL；告知用户待 `gh auth login` 后自行 `git push` 与 `gh pr create`，或授权后继续 |

> `publications.json` 的本地修改可在平台发布成功后立即写入；**但不要在 `gh` 未认证时强行执行 `gh pr create` 并声称 PR 已创建**。认证恢复后再创建 PR。

### 4.3 提交并创建 Pull Request

在 **步骤 1 创建的发布分支** 上操作：

```bash
cd <仓库根目录>
git add articles/publications.json
git commit -m "chore(publications): record <平台标识> publish for <文章标题>"
git push -u origin HEAD
gh pr create --title "chore(publications): record <平台标识> publish for <文章标题>" --body-file <pr-body.md>
```

`<pr-body.md>` 必须先写入临时 Markdown 文件，内容至少包含：

```md
## Summary

- 将《<文章标题>》在 <平台名称> 的发布事实写入 `articles/publications.json`
- 平台 URL: <url>
- 发布日期 (UTC+8): <published_date>

## Test plan

- [ ] 核对 `article_file` 与母稿路径一致
- [ ] 核对平台 URL 可访问
- [ ] 合入后 `publications.json` 格式与字段约定正确
```

### 4.4 通知用户

流程结束时向用户报告：

1. 发布平台、文章标题、平台文章 URL。
2. 已创建的 PR 链接。
3. **请维护者审核并合入 PR**，合入后发布记录即纳入主分支。

---

## 停止条件

出现以下任一情况时 **立即停止**，不提交 PR、不写入虚假 URL：

- 无法 clone、无法同步 main、无法 checkout / 创建分支（权限、网络、冲突）。
- `publications.json` 中找不到标题或母稿文件缺失/为空。
- 平台发布未成功或未拿到可访问的文章 URL。
- 用户未确认却要覆盖已有平台发布记录。
- `gh` 未认证（`401 Bad credentials`）：暂停创建 PR，提示用户执行 `gh auth login` 后再继续。

---

## 流程总览

```
用户指定平台 + 标题
        ↓
定位仓库（已存在则跳过 clone，但必须拉取最新 main）
        ↓
git fetch / checkout main / pull → 切分支 <平台>/<时间戳>
        ↓
读 publications.json → 按 title 匹配 article_file → 校验母稿
        ↓
按平台子指南正式发布 → 取得文章 url
        ↓
更新 publications.json → 确认 gh auth → commit → push → gh pr create
        ↓
提醒用户合入 PR
```
