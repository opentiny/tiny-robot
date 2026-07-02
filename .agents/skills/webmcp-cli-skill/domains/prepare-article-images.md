# 发布前图片校验与处理

本指南面向 AI Agent，在将 `ai-article-hub` 母稿发布到外部平台**之前**，校验 Markdown 中的图片引用是否正确，并将本地相对路径转换为平台可识别的内联图片，再交给各平台 `create_article` 等工具。

> 编排入口见 [publish-from-article-hub.md](./publish-from-article-hub.md) 步骤 2.5；平台侧操作仍遵守 [publish-article.md](./publish-article.md) 与各平台子指南。

---

## 为什么必须处理图片

`ai-article-hub` 母稿中的图片通常使用**相对文章目录**的路径，例如：

```markdown
![Network 面板截图](./assets/network-panel-post-chat-completions.png)
```

外部平台（掘金、CSDN、思否等）无法解析仓库内的相对路径。若直接把母稿 `article.md` 传给 `create_article`，正文里的图片会**全部失效**（显示为裂图或占位符）。

发布前必须：

1. 确认每个本地图片路径可解析且文件存在。
2. 生成一份**仅用于发布**的正文副本，将本地图片替换为 `data:` URI（Base64 内联）。
3. 外部 `https://` 图片保持原 URL，不做改写。

> **不要修改母稿 `article.md`**。处理结果写入临时发布文件，发布完成后可删除。

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
| 外部 URL | 以 `http://`、`https://` 或 `//` 开头 | 原样保留 |
| 本地相对路径 | 其他路径 | 解析为绝对路径并校验文件 |
| 空 alt | `alt` 为空或仅空白 | **停止**，报告 `empty-image-alt` |

### 本地路径解析规则

- 文章目录 = `article.md` 所在目录。
- 去掉路径中的 `./` 前缀，按 `/` 分段拼接，**禁止** `..` 穿越（与 `article-hub` 校验一致）。
- 支持扩展名：`.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.svg`。
- 文件必须存在且可读；大小建议 ≤ 5 MB（过大时警告用户，必要时压缩后再发布）。

---

## 步骤 3：生成发布用 Markdown

将处理后的正文写入临时文件，推荐路径：

```text
<文章目录>/.publish/article-body.md
```

命名约定：放在文章目录下的 `.publish/` 子目录，避免污染母稿与 Git 跟踪（该目录不应提交）。

### 本地图片 → data URI

对每个本地图片：

1. 读取二进制内容。
2. 按扩展名确定 MIME：`png` → `image/png`，`jpg/jpeg` → `image/jpeg`，`gif` → `image/gif`，`webp` → `image/webp`，`svg` → `image/svg+xml`。
3. 替换正文中的 `![alt](原相对路径)` 为 `![alt](data:<mime>;base64,<编码>)`。
4. **保留 alt 文本不变**。

### 一键处理脚本（Node.js）

在仓库根目录或文章目录执行（将 `ARTICLE_FILE` 替换为实际路径）：

```bash
node --input-type=module -e "
import fs from 'node:fs';
import path from 'node:path';

const articleFile = process.env.ARTICLE_FILE ?? 'articles/example/article.md';
const absArticle = path.resolve(articleFile);
const articleDir = path.dirname(absArticle);
let body = fs.readFileSync(absArticle, 'utf8');

// 去掉 Front Matter
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

body = body.replace(imageRe, (full, alt, rawPath) => {
  const p = rawPath.trim();
  if (/^https?:\/\//i.test(p) || p.startsWith('//')) return full;
  if (!alt.trim()) { errors.push('empty alt: ' + p); return full; }

  const rel = p.replace(/^\.\//, '').split('/').filter(s => s && s !== '.');
  if (rel.some(s => s === '..')) { errors.push('path traversal: ' + p); return full; }

  const abs = path.join(articleDir, ...rel);
  if (!fs.existsSync(abs)) { errors.push('missing: ' + p); return full; }

  const ext = path.extname(abs).toLowerCase();
  const mime = mimeByExt[ext];
  if (!mime) { errors.push('unsupported ext: ' + p); return full; }

  const b64 = fs.readFileSync(abs).toString('base64');
  return \`![\${alt}](data:\${mime};base64,\${b64})\`;
});

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

const outDir = path.join(articleDir, '.publish');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'article-body.md');
fs.writeFileSync(outFile, body, 'utf8');
console.log(JSON.stringify({ ok: true, publish_file: outFile, images_inlined: (body.match(/data:image/g) ?? []).length }));
"
```

PowerShell 示例（先设置环境变量）：

```powershell
$env:ARTICLE_FILE = "articles/tiny-robot/2026-07-01-tinyrobot-ai-service-communication/article.md"
node --input-type=module -e "<同上脚本>"
```

脚本输出 `ok: true` 且给出 `publish_file` 后，后续平台发布**必须**使用 `publish_file`，而非原始 `article.md`。

---

## 步骤 4：发布前自检清单

进入 [publish-from-article-hub.md](./publish-from-article-hub.md) 步骤 3 之前，确认：

- [ ] `article-hub validate article` 通过，或手动扫描无缺失/非法路径
- [ ] 临时发布文件已生成，且正文不含 `./assets/` 等本地相对路径（外部 URL 除外）
- [ ] 每个 `![...](...)` 的 alt 非空
- [ ] Mermaid 源码块（` ```mermaid `）仍保留在发布正文中（平台若不支持，需人工确认或改用 PNG 引用——见下节）

### Mermaid 与图表

- 母稿中 ` ```mermaid ` 代码块**不是**图片引用，本流程不会自动转换。
- 若文章同时有 `assets/*.png` 配图，按上述流程内联 PNG/GIF 即可。
- 若正文**仅**依赖 Mermaid 且目标平台不渲染 Mermaid，**停止发布**，提示用户先将 `.mmd` 导出为 PNG 并在母稿中引用 PNG 后再发布。

---

## 步骤 5：传给平台工具

各平台 `create_article` / `segmentfault_publish_article` 的 `content` 参数，改用发布副本：

```bash
webmcp-cli run create_article -t TAB_ID \
  '{"title":"文章标题","content":"@base64file:./articles/<project>/<slug>/.publish/article-body.md"}'
```

路径相对于执行 `webmcp-cli run` 时的当前工作目录；建议使用绝对路径或先 `cd` 到仓库根目录。

---

## 停止条件

以下情况**不得进入平台发布**：

- 任一本地图片文件不存在、路径非法或 alt 为空
- 图片处理脚本报错（`ok: false`）
- 发布副本中仍残留 `./assets/`、`../` 等本地相对图片路径
- 用户明确要求使用母稿原文发布且未确认接受裂图风险

---

## 流程位置

```
校验母稿 (2.3)
        ↓
【本指南】validate + 扫描 + 生成 .publish/article-body.md
        ↓
平台 webmcp-cli 发布 (步骤 3)
        ↓
回写 publications.json
```
