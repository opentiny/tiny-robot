# CSDN 文章图片检查与修复

本指南面向 AI Agent：在 CSDN 正文页或 Markdown 编辑器中检查图片是否正常显示，对异常图片做标记，经编辑器图床上传拿到 CDN 链接后替换，再复检直到正常或达到停止条件。

> 流程对齐 [fix-juejin-article-images.md](./fix-juejin-article-images.md)；发布入口见 [publish-article-in-csdn.md](./publish-article-in-csdn.md)。可复用脚本在 `../scripts/csdn-images/`。

---

## 何时使用

- 已发布到 CSDN 的文章出现裂图、占位失败或相对路径图片。
- `create_article` 写入草稿后、调用 `publish_current_draft` **之前**，正文仍含 `./assets/`、`img-home...origin_url=` 转存失败占位、非正文 CDN 图或预览裂图。
- **每次发布含本地图片的文章时**，本流程作为发布前必做步骤调用。
- 用户明确要求「检查/修复 CSDN 文章图片」。

## 不做

- 不修改母稿 `article.md`（修复结果只写临时文件与 CSDN 草稿/正文）。
- 不把临时目录、`.cache/` 提交进 git。
- 不绕过登录态伪造 Cookie；未登录时停止并提示用户手动登录。

---

## 前置条件

1. 用户已在 webmcp-cli 所用 Chrome Profile 中登录 CSDN。
2. 已知目标：**文章 URL**（`https://blog.csdn.net/.../article/details/...`）和/或编辑器标签页 `https://editor.csdn.net/md/`。
3. 已知母稿路径（用于定位 `assets/`）。
4. 本机可运行 `node` 与 `webmcp-cli`。

脚本根目录：

```text
.agents/skills/webmcp-cli-skill/scripts/csdn-images/
```

共用逻辑在 `../scripts/shared/`；本目录保留平台入口、`upload-*` 与 `check-page.js`。

下文用 `SCRIPTS` 表示该目录；工作目录建议为 `ai-article-hub` 仓库根。

---

## 流程总览

```text
打开正文或编辑器
    ↓
executeJavascript 注入 check-page.js 扫描裂图
    ↓ 有异常（或 Markdown 含 ./assets/ / img-home origin_url）
node mark.mjs 标记 → markers.json + marked.md
    ↓
逐张上传（优先 csdn.upload.uploadImg → file input → --upload-url → UI → 人工）
    ↓
node replace.mjs → fixed.md
    ↓
create_article 写回正文
    ↓
再次检查（最多 3 轮）
```

最大自动修复轮次：**3**。

---

## 步骤 1：打开页面并确认工具

```bash
webmcp-cli tabs open "https://editor.csdn.net/md/"
# 或已发文章：
# webmcp-cli tabs open "https://blog.csdn.net/<user>/article/details/<id>"
webmcp-cli state
```

记下 `tabid`。若跳转登录页，**停止**并请用户登录。注意「模版库」弹窗可能遮挡编辑器。

> 当前环境可能没有注入 `get_article_info`（仅有 `create_article` / `page-agent-tool` 等）。取草稿正文时优先 `get_article_info`；不可用则用 `page-agent-tool` `executeJavascript` 读 `.editor__inner` / CodeMirror。

---

## 步骤 2：页面检查（裂图扫描）

```bash
node SCRIPTS/wrap-check-page.mjs --out .cache/csdn-images/check-page-args.json
webmcp-cli run page-agent-tool -t TAB_ID -f .cache/csdn-images/check-page-args.json
```

返回示例：

```json
{
  "broken": [{ "index": 0, "src": "https://img-home.csdnimg.cn/...?origin_url=assets%2Ffoo.png", "reason": "csdn-transfer-failure-placeholder", "alt": "..." }],
  "ok": [{ "index": 1, "src": "https://i-blog.csdnimg.cn/direct/....png", "alt": "...", "on_csdn_cdn": true }],
  "skipped": [{ "index": 2, "reason": "not-complete" }]
}
```

| 判定为 broken | 说明 |
|---------------|------|
| `complete` 且宽高为 0 | 裂图 |
| `getAttribute('src')` 为相对路径 / 空 | 平台无法解析 |
| `data:` 解码失败 | 内联损坏 |
| `img-home.csdnimg.cn?...origin_url=` | **外链转存失败占位**（有宽高也算 broken） |
| alt 含「外链图片转存失败」 | 同上 |
| `skipped` | lazy/未加载完；可滚动后再扫 |

合法正文 CDN（`on_csdn_cdn: true`）：`i-blog.csdnimg.cn`、`img-blog.csdnimg.cn` 等。**不要**把 `img-home.csdnimg.cn` 占位当成已修好。

> **Markdown 源码视图**可能没有 `<img>` DOM。此时 `broken` 可能为空，仍须用步骤 3–4 根据 `./assets/` 或 `origin_url=` 标记，不要提前结束。

将完整 `broken` 数组写入 `.cache/csdn-images/broken-urls.json`。

---

## 步骤 3：取出待修复 Markdown

```bash
webmcp-cli run get_article_info -t TAB_ID
```

若工具不存在，用 `executeJavascript` 读编辑器正文（`.editor__inner` / CodeMirror / textarea），写入：

```text
.cache/csdn-images/<slug>/draft.md
```

也可在已知母稿且尚未被平台改写时，直接用去 frontmatter 的临时 `body.md` 做标记（由 `scripts/shared/prepare-publish-body.mjs` 生成；须与编辑器内容一致）。

仅有已发文章页时：打开编辑器再取草稿；无法打开则转人工。

---

## 步骤 4：标记异常图片（每次发布/修复时调用）

```bash
node SCRIPTS/mark.mjs \
  --file .cache/csdn-images/<slug>/draft.md \
  --article-dir articles/<project>/<slug> \
  --broken-urls .cache/csdn-images/broken-urls.json \
  --out-dir .cache/csdn-images/<slug>
```

成功示例：

```json
{
  "ok": true,
  "marked_file": ".cache/csdn-images/<slug>/marked.md",
  "markers_file": ".cache/csdn-images/<slug>/markers.json",
  "marker_count": 2
}
```

标记约定：

- 异常图变为 `![alt](__CSDN_IMG_N__)`。
- 跳过 fenced code block 内的示例图片。
- 相对路径相对 `--article-dir`，禁止 `..` 穿越。
- `img-home...?origin_url=assets%2Ffoo.png` 会按 `origin_url` 映射到本地 `assets/foo.png`；若 alt 已是转存失败文案，会用文件名恢复可读 alt。

---

## 步骤 5：上传图片（每次调用）

对每个 marker index：

### 5.0 准备 payload

```bash
node SCRIPTS/prepare-upload.mjs \
  --markers .cache/csdn-images/<slug>/markers.json \
  --index 0 \
  --out .cache/csdn-images/<slug>/upload-0.json
```

`--out` 时 stdout 仅元数据；完整 base64 在 out 文件。无 `local_path` → 人工项。

### 5.1 优先：编辑器上传脚本（`upload-editor.mjs`）

须在 **已登录** 的 `editor.csdn.net/md/` 标签页执行：

```bash
node SCRIPTS/upload-editor.mjs \
  --upload-json .cache/csdn-images/<slug>/upload-0.json \
  --out .cache/csdn-images/<slug>/upload-run-0.json \
  --poll-out .cache/csdn-images/<slug>/poll.json

webmcp-cli run page-agent-tool -t TAB_ID -f .cache/csdn-images/<slug>/upload-run-0.json
# 轮询直到返回含 ok / cdn_url（或 ok:false）；中间态 status=pending
webmcp-cli run page-agent-tool -t TAB_ID -f .cache/csdn-images/<slug>/poll.json
```

| 说明 | |
|------|--|
| **默认优先** | 调用页面已注入的 `window.csdn.upload.uploadImg`（`appName: direct_blog`），返回 `i-blog.csdnimg.cn/direct/...` |
| file input | 仅当 `accept` 含 image；**禁止**落到 `#import-markdown-file-input`（`.md`） |
| `--upload-url` | Network 里确认的上传接口；`FormData` + `credentials:'include'` |
| `--poll-out` | 可省略，默认写到与 `--out` 同目录的 `poll.json` |
| Promise | `executeJavascript` **不 await**；结果在 `window.__csdnImgUpload` |
| PowerShell | 必须 `-f`，禁止内联大 JSON |
| CDN | 以 `i-blog.*` / `img-blog.*` 等为准；勿把 `img-home` / `avatar.csdn.net` 当正文图 |

把 `cdn_url` 写入 `.cache/csdn-images/<slug>/replacements.json`：

```json
{
  "0": "https://i-blog.csdnimg.cn/direct/........png"
}
```

### 5.2 可选：编辑器 UI

`searchTree` 查「图片」「上传」等工具栏控件；文件选择器选 `local_path`；从预览或 MD 源码取 CDN URL。

### 5.3 人工

同一 marker 自动失败 **2 次**后：报告 `index` / `alt` / `local_path`，用户粘贴 CDN URL 进 `replacements.json`，只再跑 `replace.mjs`。

---

## 步骤 6：替换占位符（每次调用）

```bash
node SCRIPTS/replace.mjs \
  --marked .cache/csdn-images/<slug>/marked.md \
  --replacements .cache/csdn-images/<slug>/replacements.json \
  --out .cache/csdn-images/<slug>/fixed.md
```

`unresolved` 非空 → 补全后再跑，不要发布。

---

## 步骤 7：写回草稿并复检

```bash
webmcp-cli run create_article -t TAB_ID -f ./create-args.json
```

`content` 使用 `@base64file:` 指向 `fixed.md`（勿指向母稿）。`-f` JSON 与 `@base64file:` 路径相对 **该 JSON 文件所在目录**。优先用 `-f`（PowerShell 友好）。

然后：

1. `get_article_info`（或 `executeJavascript` 读 `.editor__inner`）确认无 `__CSDN_IMG_` 占位、图片为 `i-blog` / `img-blog` 等正文 CDN，且无「外链图片转存失败」。
2. 预览或打开文章 URL，再跑 `wrap-check-page.mjs`。
3. 仍有 `broken` 且轮次 &lt; 3 → 从步骤 3 重跑；否则停止并列出残留项。

发布前修复通过后，再按 [publish-article-in-csdn.md](./publish-article-in-csdn.md) 调用 `publish_current_draft`。

已发文章修复：写回后需用户确认是否「更新」已发文，指南不强制自动覆盖。

---

## 异常判定速查

| 场景 | 处理 |
|------|------|
| 登录页 / 验证码 / 模版库遮挡 | 停止或先关闭弹窗 |
| 本地 `assets` 缺失 | 停止该 marker |
| 路径含 `..` | `mark.mjs` 报错 |
| 注入「导入 Markdown」file input 超时 | 已修复：SDK 优先；勿再依赖该 input |
| `check-page` 报 ok 但 MD 含 `origin_url=` | 以 Markdown / mark 为准，勿信预览宽高 |
| `fix_broken_images` 报告均正常 | 可能有假阳性；仍须按 `assets/` / `origin_url` / 转存失败文案走本流程 |
| SDK / file input / fetch / UI 均失败 | 人工后只跑 `replace.mjs` |
| 3 轮仍裂图 | 停止并输出快照 |

---

## Agent 调用清单（每轮 / 每次发布含图文章）

1. [ ] `state` + 登录态确认  
2. [ ] `wrap-check-page.mjs` → 扫描 → `broken-urls.json`（编辑器无 img 时勿因 empty broken 跳过）  
3. [ ] `get_article_info`（或 JS 读 `.editor__inner`）→ `draft.md`  
4. [ ] `mark.mjs` → `marked.md` + `markers.json`（含 `origin_url` 映射）  
5. [ ] 每个 index：`prepare-upload.mjs --out` → `upload-editor.mjs`（SDK 优先）→ 轮询 `__csdnImgUpload` → `replacements.json`  
6. [ ] `replace.mjs` → `fixed.md`  
7. [ ] `create_article` 写回 → 复核正文 CDN → 再检查 →（通过后）`publish_current_draft`  

脚本 stdout 只解析 JSON 的 `ok` / 结构化字段；人类可读说明在 stderr。
