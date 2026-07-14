# 掘金文章图片检查与修复

本指南面向 AI Agent：在掘金正文页或编辑器中检查图片是否正常显示，对异常图片做标记，经 **ImageX**（或 UI/人工）上传拿到 CDN 链接后替换，再复检直到正常或达到停止条件。

> 发布流程入口见 [publish-article-in-juejin.md](./publish-article-in-juejin.md)。可复用脚本在 `../scripts/juejin-images/`（含 `upload-imagex.mjs`）。

---

## 何时使用

- 已发布到掘金的文章出现裂图、占位失败或相对路径图片。
- `create_article` 写入草稿后、调用 `publish_current_draft` **之前**，`get_article_info` 正文仍含 `./assets/`、非掘金 CDN 图或预览裂图。
- 用户明确要求「检查/修复掘金文章图片」。

## 不做

- 不修改母稿 `article.md`（修复结果只写临时文件与掘金草稿/正文）。
- 不把临时目录、`.cache/` 提交进 git。
- 不把 ImageX `gen_token` 的 STS / Cookie 写入对话日志或仓库。
- 不绕过登录态伪造 Cookie；未登录时停止并提示用户手动登录。

---

## 前置条件

1. 用户已在 webmcp-cli 所用 Chrome Profile 中登录掘金。
2. 已知目标：**文章 URL**（`https://juejin.cn/post/...` 或 `/spost/...`）和/或**编辑器草稿**标签页。
3. 已知母稿路径（用于定位 `assets/`），例如：
   `articles/tiny-robot/2026-07-01-tinyrobot-ai-service-communication/article.md`
4. 本机可运行 `node` 与 `webmcp-cli`。

脚本根目录（相对本 Skill）：

```text
.agents/skills/webmcp-cli-skill/scripts/juejin-images/
```

下文用 `SCRIPTS` 表示该目录的绝对或相对路径；工作目录建议为 `ai-article-hub` 仓库根。

---

## 流程总览

```text
打开正文或编辑器
    ↓
executeJavascript 注入 check-page.js 扫描裂图
    ↓ 有异常
node mark.mjs 标记 Markdown → markers.json + marked.md
    ↓
逐张上传（ImageX 优先 → UI 可选 → 人工）
    ↓
node replace.mjs → fixed.md
    ↓
create_article / 编辑器写回正文
    ↓
再次检查（最多 3 轮）
```

最大自动修复轮次：**3**。仍失败则停止并输出未修复条目。

---

## 步骤 1：打开页面并确认工具

```bash
webmcp-cli tabs open "https://juejin.cn/post/<article_id>"
# 或编辑器：
# webmcp-cli tabs open "https://juejin.cn/editor/drafts/<draft_id>?v=2"
webmcp-cli state
```

记下 `tabid`，后续 `run` 带 `-t <tabid>`。若跳转登录页，**停止**并请用户登录。

---

## 步骤 2：页面检查（裂图扫描）

先用脚本把 `check-page.js` 包装成 `-f` 参数文件（避免手工拼 JSON）：

```bash
node SCRIPTS/wrap-check-page.mjs --out .cache/juejin-images/check-page-args.json
webmcp-cli run page-agent-tool -t TAB_ID -f .cache/juejin-images/check-page-args.json
```

返回 JSON 形如：

```json
{
  "broken": [{ "index": 0, "src": "./assets/foo.png", "resolved_src": "https://juejin.cn/...", "alt": "..." }],
  "ok": [{ "index": 1, "src": "https://p3-juejin.byteimg.com/...", "alt": "..." }],
  "skipped": [{ "index": 2, "reason": "not-complete" }]
}
```

| 判定为 broken | 说明 |
|---------------|------|
| `complete` 且 `naturalWidth/Height === 0` | 裂图 |
| `getAttribute('src')` 为相对路径 / 空 | 平台无法解析（勿用 `img.src`，浏览器会解析成绝对地址） |
| `data:` 且解码失败 | 内联图损坏 |
| `skipped`（`not-complete`） | lazy/未加载完，本轮不算裂图；可滚动后再扫一次 |

合法 CDN（`on_juejin_cdn: true`）包括：`*.byteimg.com`、`*.juejin.cn`（含 `p*-xtjj-private.juejin.cn` 签名 URL）。

仅扫描正文区域（`.article-content` / `.markdown-body` / `.bytemd-preview` 等），减少头像、站点图标误报。

> **编辑器 Markdown 源码视图**里可能没有 `<img>` DOM（正文在 CodeMirror 文本中）。此时 `broken` 可能为空，仍须依赖步骤 3–4 的 Markdown / `assets/` 相对路径标记，不要提前结束。

`broken` 为空且正文无本地相对路径 → **结束**，报告图片正常。

将完整 `broken` 数组写入临时文件（例如 `.cache/juejin-images/broken-urls.json`）供 `mark.mjs` 使用；`mark.mjs` 会读取其中的 `src` 与 `resolved_src`，并按 **精确匹配或 basename** 对齐母稿图片。

---

## 步骤 3：取出待修复 Markdown

**编辑器页优先：**

```bash
webmcp-cli run get_article_info -t TAB_ID
```

把标题与正文落到临时文件（不要改母稿）：

```text
.cache/juejin-images/<slug>/draft.md
```

**仅有正文页时：** 打开对应草稿编辑器后再 `get_article_info`；无法打开草稿则停止并转人工。

---

## 步骤 4：标记异常图片（每次调用）

```bash
node SCRIPTS/mark.mjs \
  --file .cache/juejin-images/<slug>/draft.md \
  --article-dir articles/<project>/<slug> \
  --broken-urls .cache/juejin-images/broken-urls.json \
  --out-dir .cache/juejin-images/<slug>
```

成功时 stdout 示例：

```json
{
  "ok": true,
  "marked_file": ".cache/juejin-images/<slug>/marked.md",
  "markers_file": ".cache/juejin-images/<slug>/markers.json",
  "marker_count": 2
}
```

标记约定：异常图变为 `![alt](__JUEJIN_IMG_N__)`，`markers.json` 记录 `index`、`alt`、`original`、`local_path`（能解析到 `assets/` 时）。

`mark.mjs` 也会把「本地相对路径图片」标为异常（即使页面尚未裂开）。路径相对 `--article-dir`，禁止 `..` 穿越。

---

## 步骤 5：上传图片（每次调用，按降级顺序）

对 `markers.json` 中每个条目（`index = 0 .. N-1`）执行：

### 5.0 准备上传 payload

```bash
node SCRIPTS/prepare-upload.mjs \
  --markers .cache/juejin-images/<slug>/markers.json \
  --index 0 \
  --out .cache/juejin-images/<slug>/upload-0.json
```

指定 `--out` 时：完整 `base64` 只写入该文件；**stdout 仅元数据**（避免大图撑爆上下文）。

无 `local_path` 或文件不存在 → 该 marker **停止自动上传**，列入人工项。

### 5.1 优先：ImageX 同源上传（`upload-imagex.mjs`）

掘金编辑器实际上传是 ImageX 五步（`gen_token` → `ApplyImageUpload` → 二进制 POST → `CommitImageUpload` → `get_img_url`），**不是**单次 FormData 打固定 upload URL。

须在**已登录**的掘金编辑器标签页执行（`credentials: 'include'` 带 Cookie）：

```bash
node SCRIPTS/upload-imagex.mjs \
  --upload-json .cache/juejin-images/<slug>/upload-0.json \
  --out .cache/juejin-images/<slug>/upload-run-0.json \
  --poll-out .cache/juejin-images/<slug>/poll.json

webmcp-cli run page-agent-tool -t TAB_ID -f .cache/juejin-images/<slug>/upload-run-0.json
# 轮询直到返回含 ok / cdn_url（或 ok:false）的 JSON；中间态为字符串 pending
webmcp-cli run page-agent-tool -t TAB_ID -f .cache/juejin-images/<slug>/poll.json
```

| 注意 | 说明 |
|------|------|
| Promise | `page-agent-tool` 的 `executeJavascript` **不 await** async；上传脚本同步返回 `started`，结果写入 `window.__juejinImgUpload` |
| PowerShell | 长脚本 / base64 必须用 `-f` 参数文件，禁止内联拼 JSON |
| 机密 | `gen_token` 返回的 STS **不得**写入对话日志 / git；`upload-imagex.mjs` stdout 只有元数据 |
| CDN 形态 | 常见 `https://p*-juejin.byteimg.com/...` 或 `https://p*-xtjj-private.juejin.cn/...`（带签名 query）；二者均可写入 `replacements.json` |

写入 `.cache/juejin-images/<slug>/replacements.json`：

```json
{
  "0": "https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/....awebp?policy=..."
}
```

### 5.2 可选：编辑器 UI「上传图片」

ImageX 失败时可试：

1. 确认当前标签为掘金**编辑器**（`/editor/drafts/`）。
2. `searchTree` 查工具栏「图片」相关控件（无障碍树未必叫「上传图片」）。
3. 文件选择器可用则选 `local_path`；成功后从预览 / `get_article_info` 取 CDN URL。

### 5.3 再失败：人工

同一 marker 自动路径失败 **2 次**后：

- 向用户报告 `index`、`alt`、`local_path`。
- 请用户在编辑器手动上传，把 CDN URL 填入 `replacements.json`。
- **只再执行步骤 6 的 `replace.mjs`**，不要循环盲点 UI。

---

## 步骤 6：替换占位符（每次调用）

```bash
node SCRIPTS/replace.mjs \
  --marked .cache/juejin-images/<slug>/marked.md \
  --replacements .cache/juejin-images/<slug>/replacements.json \
  --out .cache/juejin-images/<slug>/fixed.md
```

成功示例：

```json
{
  "ok": true,
  "fixed_file": ".cache/juejin-images/<slug>/fixed.md",
  "replaced_count": 2,
  "unresolved": []
}
```

`unresolved` 非空 → 补全 `replacements.json` 后重跑本步骤，不要发布。

---

## 步骤 7：写回掘金草稿并复检

```bash
webmcp-cli run create_article -t TAB_ID -f ./create-args.json
```

`create-args.json` 中 `title` 用原稿标题，`content` 使用 `@base64file:` 指向 `fixed.md`（勿指向母稿）。`-f` JSON 与 `@base64file:` 路径相对 **该 JSON 文件所在目录**。

> `create_article` 可能报「CodeMirror 填写失败」但仍写入成功：务必再用 `get_article_info` 核对 `contentLength` 与图片 URL，勿仅凭工具报错判定失败。

然后：

1. `get_article_info` 确认占位符已消失、图片为掘金 CDN（`byteimg` 或 `*.juejin.cn`）。
2. 打开正文预览或文章 URL，再次注入 `check-page.js`（有 `<img>` DOM 时）。
3. 仍有 `broken` 且轮次 &lt; 3 → 从步骤 3 重跑；轮次 ≥ 3 → **停止**并列出残留项。

若本次是「发布前」修复：复检通过后再按 [publish-article-in-juejin.md](./publish-article-in-juejin.md) 调用 `publish_current_draft`。

若是「已发布文章」修复：写回草稿后需用户确认是否「更新」已发文章（掘金后台「更新」按钮）；指南不强制自动点发布，避免误覆盖。

---

## 异常判定速查

| 场景 | 处理 |
|------|------|
| 登录页 / 验证码 | 停止，转人工 |
| 本地 `assets` 缺失 | 停止该 marker，报告路径 |
| 路径含 `..` | `mark.mjs` 报错，禁止穿越 |
| ImageX / UI 均失败 | 人工上传后只跑 `replace.mjs` |
| 3 轮复检仍裂图 | 停止，输出 `markers` / `broken` 快照 |

---

## Agent 调用清单（每轮）

1. [ ] `state` + 登录态确认  
2. [ ] `wrap-check-page.mjs` → `page-agent-tool -f` 扫描 → `broken-urls.json`（编辑器无 img 时勿因 empty broken 跳过）  
3. [ ] `get_article_info` → `draft.md`  
4. [ ] `mark.mjs` → `marked.md` + `markers.json`  
5. [ ] 对每个 index：`prepare-upload.mjs --out` → `upload-imagex.mjs` → 轮询 `__juejinImgUpload` → 写入 `replacements.json`  
6. [ ] `replace.mjs` → `fixed.md`  
7. [ ] `create_article` 写回 → `get_article_info` 复核 → 再检查  

脚本 stdout 只解析 JSON 的 `ok` / 结构化字段；人类可读说明在 stderr。
