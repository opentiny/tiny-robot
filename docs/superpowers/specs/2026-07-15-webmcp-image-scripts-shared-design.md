# webmcp 平台图片脚本抽共用设计

日期：2026-07-15  
范围：`.agents/skills/webmcp-cli-skill/scripts/`  
状态：已确认（方案 A）

## 背景

掘金 / CSDN / 思否三套裂图修复脚本高度重复：`mark` → `prepare-upload` → `upload-*` → `replace` → `check-page` / `wrap-check-page`。差异主要集中在：

- 占位符前缀（`__CSDN_IMG_` / `__JUEJIN_IMG_` / `__SEGMENTFAULT_IMG_`）
- 上传实现（掘金 ImageX vs CSDN/思否 editor）
- `check-page.js` 的 DOM 选择器与平台特有裂图判定

目标：抽公共核心，平台目录只留差异，方便维护；对外调用与文档命令尽量不变。

## 非目标

- 不引入统一 CLI（`--platform`）
- 不改根目录 `scripts/`（`article-hub-launcher.mjs`）
- 不合并上传实现或重写 `check-page.js` 业务规则
- 不改发布流程步骤顺序

## 目录结构

```
.agents/skills/webmcp-cli-skill/scripts/
  shared/
    parse-args.mjs
    mark.mjs
    prepare-upload.mjs
    replace.mjs
    wrap-check-page.mjs
  csdn-images/
    platform.mjs
    mark.mjs                 # 薄壳
    prepare-upload.mjs
    replace.mjs
    wrap-check-page.mjs
    upload-editor.mjs        # 平台专有，保留
    check-page.js            # 平台专有，保留
  juejin-images/
    …同上，upload 为 upload-imagex.mjs
  segmentfault-images/
    …同上，upload 为 upload-editor.mjs
```

## 平台配置

每平台 `platform.mjs` 至少导出：

| 字段 | 含义 | 示例 |
| --- | --- | --- |
| `id` | 平台标识 | `csdn` / `juejin` / `segmentfault` |
| `placeholderPrefix` | 占位符前缀 | `__CSDN_IMG_` |

缓存目录惯例 `.cache/<platform>-images/` 仅文档与调用示例使用；共用脚本不硬编码该路径。

## 模块职责

### `shared/parse-args.mjs`

抽出三处重复的 `parseArgs`，供入口与 shared 主逻辑复用。

### `shared/mark.mjs`

接收 `placeholderPrefix`（及既有 CLI 参数：`--file`、`--article-dir`、`--broken-urls`、`--out-dir`）。  
以三平台中更完整的实现为基线合并（如 CSDN 版已用常量前缀），消除硬编码差异。  
stdout JSON 契约与现有成功/失败字段保持一致。

### `shared/prepare-upload.mjs`

读取 `markers.json`、产出 base64 payload。平台差异仅在文档推荐的下一步上传脚本；`execute_javascript_hint` 若需保留兼容，由平台薄壳传入文案或 hint builder，避免 shared 硬编码平台名。

### `shared/replace.mjs`

按 `placeholderPrefix` 构造正则，将 `__<PREFIX>N__` 替换为 CDN URL。JSON 契约不变。

### `shared/wrap-check-page.mjs`

读取同目录（调用方传入）的 `check-page.js`，包装为 `executeJavascript` 参数 JSON。平台入口传入本平台 `check-page.js` 路径。

### 平台薄壳

各平台 `mark.mjs` / `prepare-upload.mjs` / `replace.mjs` / `wrap-check-page.mjs` 仅：

1. 导入 `platform.mjs` 与对应 `shared/*`
2. 转发 `process.argv`
3. 传入平台配置

体积目标：约 20～40 行/文件。

### 平台专有（不抽）

- `upload-editor.mjs`（CSDN / 思否）
- `upload-imagex.mjs`（掘金）
- `check-page.js`（选择器与裂图规则）

## 调用兼容

文档命令继续为：

```text
node SCRIPTS/mark.mjs ...
node SCRIPTS/prepare-upload.mjs ...
node SCRIPTS/replace.mjs ...
node SCRIPTS/wrap-check-page.mjs ...
node SCRIPTS/upload-*.mjs ...
```

其中 `SCRIPTS` 仍指向 `scripts/<platform>-images/`。

必须保持：

- CLI 参数名与必填项
- stdout 仅 JSON；成功/失败稳定字段（`ok`、`code`、既有结构化键）
- 占位符字面量不变（避免已有 `marked.md` / 半成品缓存失效）

行为对齐原则：以三平台中更完整、已线上验证的一版为准合并进 shared，禁止在抽共用时回退功能。

## 文档变更

最小更新：

- `domains/fix-*-article-images.md`
- `domains/publish-article-in-*.md`（脚本目录说明处）
- `SKILL.md`（脚本路径表旁一句说明）

内容：注明共用逻辑在 `scripts/shared/`，平台差异在各自目录；**命令示例路径不改**。

## 测试与验证

- 对三平台分别用最小 fixture（或现有 `.cache` 样例）跑 `mark` → `replace`，确认占位符前缀与 JSON 输出正确。
- 跑仓库内相关 Skill contract / 脚本引用测试（若有）。
- 人工 spot-check：`wrap-check-page` 产出的 script 仍为对应平台 `check-page.js` 内容。

## 实现顺序建议

1. 新增 `shared/` 与各平台 `platform.mjs`
2. 迁 `replace`（差异最小）→ `prepare-upload` → `mark` → `wrap-check-page`
3. 平台入口改为薄壳并删除重复实现
4. 更新 domain / SKILL 说明
5. 验证三平台脚本 CLI 与契约
