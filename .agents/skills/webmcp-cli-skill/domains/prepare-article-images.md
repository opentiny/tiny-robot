# 发布前图片校验与处理

本指南面向 AI Agent，在将 `ai-article-hub` 母稿发布到外部平台**之前**，校验 Markdown 中的图片引用是否正确，并生成供平台编辑器**上传替换**所需的发布副本与图片清单。

> 编排入口见 [publish-from-article-hub.md](./publish-from-article-hub.md) 步骤 2.5；平台侧操作仍遵守 [publish-article.md](./publish-article.md) 与各平台子指南。

---

## 为什么必须处理图片

`ai-article-hub` 母稿中的图片通常使用**相对文章目录**的路径，例如：

```markdown
![Network 面板截图](./assets/network-panel-post-chat-completions.png)
```

外部平台（掘金、CSDN、思否等）无法解析仓库内的相对路径。若直接把母稿 `article.md` 传给 `create_article`，正文里的图片会**全部失效**（显示为裂图或占位符）。

### 禁止使用 `data:` URI 内联

掘金、CSDN、思否等 Markdown 编辑器**不会渲染** `![alt](data:image/png;base64,...)` 形式的内联图片。把本地图片转成 Base64 内联后填入编辑器，预览区仍显示裂图。

**正确做法**：填入正文时，由 `create_article` 等工具（或平台子指南中的兜底步骤）**触发编辑器自带的图片上传能力**（例如掘金工具栏的「上传图片」按钮），将本地文件上传到平台 CDN，再把正文中的 `![alt](./assets/...)` **替换为平台返回的 `https://` URL**。

发布前必须：

1. 确认每个本地图片路径可解析且文件存在。
2. 生成 `.publish/article-body.md`（去掉 Front Matter，**保留** `![alt](相对路径)`，不做 Base64 内联）。
3. 生成 `.publish/images-manifest.json`，列出每张待上传图片的 Markdown 路径、绝对路径、alt 与 MIME。
4. 外部 `https://` 图片保持原 URL，不上传、不替换。

> **不要修改母稿 `article.md`**。处理结果写入临时发布目录，发布完成后可删除。

---

## 步骤 1：运行 article-hub 校验

在仓库根目录执行（需已 `pnpm run build`）：

```bash
node dist/cli.js validate article \
  --article-file <article_file> \
  --config config/projects.yml
```

| 结果 | 处理 |
|------|------|
| `ok: true`，无 `missing-local-image` / `invalid-local-image` / `empty-image-alt` | 继续步骤 2 |
| 存在上述阻断码 | **停止发布**，向用户报告 `blocking_issues`，提示先修复母稿或补全 `assets/` 文件 |
| CLI 不可用 | 改用手动步骤 2 的扫描逻辑兜底，但**不得跳过**文件存在性检查 |

---

## 步骤 2：扫描正文中的图片引用

从母稿中**去掉 YAML Front Matter**（首个 `---` 到第二个 `---` 之间的块），只对正文做扫描。

提取所有 Markdown 图片语法 `![alt](path)`，忽略：

- 代码块内的 `![]()`（包括 ` ```mermaid ` 块）
- HTML `<img>` 标签（若存在，单独记录并提示用户确认平台是否支持）

对每个 `path` 分类：

| 类型 | 判定 | 处理 |
|------|------|------|
| 外部 URL | 以 `http://`、`https://` 或 `//` 开头 | 原样保留，不写入 manifest |
| 本地相对路径 | 其他路径 | 解析为绝对路径并校验文件，写入 manifest |
| 空 alt | `alt` 为空或仅空白 | **停止**，报告 `empty-image-alt` |

### 本地路径解析规则

- 文章目录 = `article.md` 所在目录。
- 去掉路径中的 `./` 前缀，按 `/` 分段拼接，**禁止** `..` 穿越（与 `article-hub` 校验一致）。
- 支持扩展名：`.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.svg`。
- 文件必须存在且可读；大小建议 ≤ 5 MB（过大时警告用户，必要时压缩后再发布）。

---

## 步骤 3：生成发布副本与图片清单

将处理后的正文与 manifest 写入临时目录，推荐路径：

```text
<文章目录>/.publish/article-body.md
<文章目录>/.publish/images-manifest.json
```

命名约定：放在文章目录下的 `.publish/` 子目录，避免污染母稿与 Git 跟踪（该目录不应提交）。

### `article-body.md`

- 正文去掉 Front Matter 后的 Markdown。
- **保留**本地图片的原始相对路径，例如 `![alt](./assets/foo.png)`。
- **禁止**改写为 `data:` URI。

### `images-manifest.json`

每张待上传的本地图片一条记录，供 `create_article` 在填入正文后按序上传并替换：

```json
{
  "schema_version": "webmcp-cli.images-manifest.v1",
  "article_dir": "/absolute/path/to/articles/<project>/<slug>",
  "images": [
    {
      "markdown_path": "./assets/network-panel-post-chat-completions.png",
      "absolute_path": "/absolute/path/to/articles/<project>/<slug>/assets/network-panel-post-chat-completions.png",
      "alt": "Network 面板截图",
      "mime": "image/png"
    }
  ]
}
```

字段说明：

| 字段 | 说明 |
|------|------|
| `markdown_path` | 正文中 `![]()` 里出现的原始路径，用于上传完成后在编辑器内查找并替换 |
| `absolute_path` | 本机可读的图片绝对路径，供上传工具读取文件 |
| `alt` | 保留 alt，替换 URL 时不改 alt |
| `mime` | 按扩展名映射：`png` → `image/png`，`jpg/jpeg` → `image/jpeg`，`gif` → `image/gif`，`webp` → `image/webp`，`svg` → `image/svg+xml` |

### 一键处理脚本（Node.js）

在仓库根目录执行（将 `ARTICLE_FILE` 替换为实际路径）：

```bash
node --input-type=module -e "
import fs from 'node:fs';
import path from 'node:path';

const articleFile = process.env.ARTICLE_FILE ?? 'articles/example/article.md';
const absArticle = path.resolve(articleFile);
const articleDir = path.dirname(absArticle);
let body = fs.readFileSync(absArticle, 'utf8');

if (body.startsWith('---')) {
  const end = body.indexOf('\n---', 3);
  if (end !== -1) body = body.slice(end + 4).replace(/^\s+/, '');
}

const mimeByExt = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml'
};

const imageRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
const errors = [];
const images = [];

for (const match of body.matchAll(imageRe)) {
  const alt = match[1];
  const rawPath = match[2].trim();
  if (/^https?:\/\//i.test(rawPath) || rawPath.startsWith('//')) continue;
  if (rawPath.startsWith('data:')) {
    errors.push('data uri not allowed in publish body: ' + rawPath.slice(0, 40));
    continue;
  }
  if (!alt.trim()) { errors.push('empty alt: ' + rawPath); continue; }

  const rel = rawPath.replace(/^\.\//, '').split('/').filter(s => s && s !== '.');
  if (rel.some(s => s === '..')) { errors.push('path traversal: ' + rawPath); continue; }

  const abs = path.join(articleDir, ...rel);
  if (!fs.existsSync(abs)) { errors.push('missing: ' + rawPath); continue; }

  const ext = path.extname(abs).toLowerCase();
  const mime = mimeByExt[ext];
  if (!mime) { errors.push('unsupported ext: ' + rawPath); continue; }

  images.push({
    markdown_path: rawPath,
    absolute_path: abs,
    alt: alt.trim(),
    mime
  });
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

const outDir = path.join(articleDir, '.publish');
fs.mkdirSync(outDir, { recursive: true });
const publishFile = path.join(outDir, 'article-body.md');
const manifestFile = path.join(outDir, 'images-manifest.json');
fs.writeFileSync(publishFile, body, 'utf8');
fs.writeFileSync(manifestFile, JSON.stringify({
  schema_version: 'webmcp-cli.images-manifest.v1',
  article_dir: articleDir,
  images
}, null, 2), 'utf8');
console.log(JSON.stringify({
  ok: true,
  publish_file: publishFile,
  manifest_file: manifestFile,
  images_to_upload: images.length
}));
"
```

PowerShell 示例（先设置环境变量）：

```powershell
$env:ARTICLE_FILE = "articles/tiny-robot/2026-07-01-tinyrobot-ai-service-communication/article.md"
node --input-type=module -e "<同上脚本>"
```

脚本输出 `ok: true` 后，后续平台发布**必须**使用 `publish_file` 与 `manifest_file`，而非原始 `article.md`。

---

## 步骤 4：发布前自检清单

进入 [publish-from-article-hub.md](./publish-from-article-hub.md) 步骤 3 之前，确认：

- [ ] `article-hub validate article` 通过，或手动扫描无缺失/非法路径
- [ ] `.publish/article-body.md` 已生成，**不含** `data:` URI
- [ ] `.publish/images-manifest.json` 已生成，且 `images` 条数与正文中本地 `![]()` 数量一致
- [ ] 每个 `![...](...)` 的 alt 非空
- [ ] Mermaid 源码块（` ```mermaid `）仍保留在发布正文中（平台若不支持，需人工确认或改用 PNG 引用——见下节）

### Mermaid 与图表

- 母稿中 ` ```mermaid ` 代码块**不是**图片引用，本流程不会自动转换。
- 若文章同时有 `assets/*.png` 配图，按 manifest 在平台侧上传 PNG/GIF 即可。
- 若正文**仅**依赖 Mermaid 且目标平台不渲染 Mermaid，**停止发布**，提示用户先将 `.mmd` 导出为 PNG 并在母稿中引用 PNG 后再发布。

---

## 步骤 5：传给平台工具并触发上传

各平台 `create_article` 调用时，传入发布正文并**显式开启图片上传**：

```bash
webmcp-cli run create_article -t TAB_ID '{
  "title":"文章标题",
  "content":"@base64file:./articles/<project>/<slug>/.publish/article-body.md",
  "upload_images": true,
  "images_manifest": "@file:./articles/<project>/<slug>/.publish/images-manifest.json"
}'
```

`@base64file:` / `@file:` 路径相对于执行 `webmcp-cli run` 时的当前工作目录；建议使用绝对路径或先 `cd` 到仓库根目录。

### 工具侧预期行为（填入 MD 时）

`create_article` 在将 Markdown 写入编辑器后，对 manifest 中每张图片依次：

1. 定位编辑器工具栏的**图片上传**入口（掘金为「上传图片」/图片按钮；CSDN 为 Markdown 工具栏图片上传）。
2. 读取 `absolute_path` 对应文件，经平台上传接口提交。
3. 等待平台返回 CDN URL（通常为 `https://` 且域名含平台标识）。
4. 在编辑器正文中，将 `![alt](markdown_path)` 替换为 `![alt](平台CDN_URL)`。
5. 全部替换完成后返回 `images_uploaded` 计数；任一张失败则报错并停止。

上传完成后，**必须**调用平台提供的读取工具（如掘金的 `get_article_info`）或预览区确认：正文中不应再残留 `./assets/`、`data:` 等本地或内联路径。

各平台细节见：

| 平台 | 文档 |
|------|------|
| 掘金 | [publish-article-in-juejin.md](./publish-article-in-juejin.md) |
| CSDN | [publish-article-in-csdn.md](./publish-article-in-csdn.md) |
| 思否 | [publish-article-in-segmentfault.md](./publish-article-in-segmentfault.md) |
| 开源中国 | [publish-article-in-oschina.md](./publish-article-in-oschina.md) |

---

## 停止条件

以下情况**不得进入平台发布**：

- 任一本地图片文件不存在、路径非法或 alt 为空
- 图片处理脚本报错（`ok: false`）
- 发布副本中含有 `data:` URI（应重新生成，勿内联 Base64）
- `upload_images: true` 后，编辑器正文中仍残留本地相对路径或 `data:` URI
- 用户明确要求跳过图片上传且未确认接受裂图风险

---

## 流程位置

```
校验母稿 (2.3)
        ↓
【本指南】validate + 扫描 + 生成 article-body.md + images-manifest.json
        ↓
平台 create_article（upload_images: true，上传并替换 CDN URL）
        ↓
回写 publications.json
```
