# article-hub CLI 参考文档

`article-hub` 是 AI 文章生成流水线的确定性流程原语，不是 `gh` 命令的便利封装。CLI 固定状态、校验、安全和幂等规则；Skill 负责调研、写作、润色和流程编排。

所有命令的 stdout 仅输出机器可解析的 JSON，人类可读的错误信息输出到 stderr。命令边界见 [`cli-boundary-design.md`](./cli-boundary-design.md)。

## 安装与运行

```sh
# 构建
pnpm install
pnpm run build

# 直接运行
node dist/cli.js <command> [options]

# 或通过 package.json bin 入口
npx article-hub <command> [options]
```

**环境要求**：Node.js ≥ 20.0.0，pnpm 10.34.1+

---

## 全局选项

| 选项 | 说明 |
|------|------|
| `--dry-run` | 试运行模式，不执行实际副作用操作。可放在命令行任意位置。 |

---

## 命令一览

| 命令 | 说明 |
|------|------|
| [`inspect-issue`](#inspect-issue) | Primitive：解析 Issue fixture，提取结构化事实和固定命令 |
| [`plan hash`](#plan-hash) | Primitive：计算计划文件的语义 Hash |
| [`plan compare`](#plan-compare) | Primitive：对比两个计划文件的语义差异 |
| [`plan approve`](#plan-approve) | Primitive：校验审批命令并返回审批快照 |
| [`projects list`](#projects-list) | Primitive：列出配置中的所有项目 |
| [`projects validate`](#projects-validate) | Primitive：校验项目配置的合法性 |
| [`state decide`](#state-decide) | Primitive：根据状态 fixture 决策下一步 mutation |
| [`validate article`](#validate-article) | Primitive：校验文章文件的格式与内容 |
| [`checkout-sources`](#checkout-sources) | Adapter：拉取项目源码到本地缓存 |
| [`create-pr`](#create-pr) | Adapter：校验文章后创建或更新 Draft PR |
| [`update-status`](#update-status) | Adapter：按状态规则更新 Issue 标签和评论 |
| [`doctor`](#doctor) | Diagnostic：检查本地环境健康状态 |
| [`setup`](#setup) | Diagnostic：初始化本地环境 |
| [`reconcile`](#reconcile) | Diagnostic：根据状态文件生成恢复计划 |

---

## 命令详解

### `inspect-issue`

解析 Issue JSON 文件，提取结构化信息。

```sh
article-hub inspect-issue --issue-file <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--issue-file` | ✅ | Issue JSON 文件路径 |

**示例**：

```sh
article-hub inspect-issue --issue-file tests/fixtures/issue-minimal.json
article-hub --dry-run inspect-issue --issue-file tests/fixtures/issue-minimal.json
```

---

### `plan`

计划文件管理，包含三个子命令：`hash`、`compare`、`approve`。

#### `plan hash`

计算计划文件的哈希值。

```sh
article-hub plan hash --plan-file <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--plan-file` | ✅ | 计划文件路径 |

#### `plan compare`

对比两个计划文件的差异。

```sh
article-hub plan compare --previous <path> --current <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--previous` | ✅ | 旧版计划文件路径 |
| `--current` | ✅ | 新版计划文件路径 |

#### `plan approve`

校验审批命令和计划文件，返回审批结果与审批快照；命令不会写回计划文件。

```sh
article-hub plan approve \
  --plan-file <path> \
  --command <command> \
  --approver <approver> \
  --comment-id <id> \
  --approved-at <timestamp>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--plan-file` | ✅ | 计划文件路径 |
| `--command` | ✅ | 审批触发的命令 |
| `--approver` | ✅ | 审批者标识 |
| `--comment-id` | ✅ | 关联评论 ID（整数） |
| `--approved-at` | ✅ | 审批时间戳 |

---

### `projects`

项目配置管理，包含两个子命令：`list`、`validate`。

#### `projects list`

列出配置文件中的所有项目。

```sh
article-hub projects list --config <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--config` | ✅ | 项目配置文件路径（YAML） |

#### `projects validate`

校验项目配置文件的合法性。

```sh
article-hub projects validate --config <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--config` | ✅ | 项目配置文件路径（YAML） |

**示例**：

```sh
article-hub projects validate --config config/projects.yml
```

---

### `checkout-sources`

拉取指定项目的源码到本地缓存目录。

```sh
article-hub checkout-sources \
  --config <path> \
  --project <project-id> \
  --cache-dir <dir>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--config` | ✅ | 项目配置文件路径 |
| `--project` | ✅ | 项目 ID |
| `--cache-dir` | ✅ | 本地缓存目录路径 |

---

### `state decide`

根据状态文件判断流水线的下一步操作。

```sh
article-hub state decide --state-file <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--state-file` | ✅ | 状态文件路径 |

---

### `validate article`

校验文章文件的格式与内容是否符合规范。

```sh
article-hub validate article --article-file <path> --config <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--article-file` | ✅ | 文章文件路径 |
| `--config` | ✅ | 项目配置文件路径 |

校验失败时，`blocking_issues` 中每一项都包含稳定 `code` 和人类可读 `message`；调用方应依赖 `code`、`field` 等结构化字段，不依赖 `message` 的具体语言或句式。

---

### `create-pr`

为生成的文章创建 Pull Request。

```sh
article-hub create-pr \
  --article-file <path> \
  --config <path> \
  --issue-number <number> \
  --repository <owner/repo> \
  --base <branch> \
  --slug <slug> \
  --title <title> \
  --body-file <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--article-file` | ✅ | 文章文件路径 |
| `--config` | ✅ | 项目配置文件路径 |
| `--issue-number` | ✅ | 关联的 Issue 编号（整数） |
| `--repository` | ✅ | 目标仓库（格式：`owner/repo`） |
| `--base` | ✅ | PR 的基础分支 |
| `--slug` | ✅ | 文章 slug |
| `--title` | ✅ | PR 标题 |
| `--body-file` | ✅ | PR 描述 Markdown 文件路径；调用方负责根据 `.github/pull_request_template.md` 生成完整内容 |

---

### `update-status`

更新 Issue 的状态标签和评论。

```sh
article-hub update-status \
  --issue-file <path> \
  --repository <owner/repo> \
  --phase <phase> \
  [--ai-state <state>] \
  [--comment <text>]
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--issue-file` | ✅ | Issue JSON 文件路径 |
| `--repository` | ✅ | 目标仓库（格式：`owner/repo`） |
| `--phase` | ✅ | 当前阶段标识 |
| `--ai-state` | ❌ | AI 处理状态 |
| `--comment` | ❌ | 附加评论内容 |

---

### `doctor`

检查本地环境是否满足运行条件。

```sh
article-hub doctor [--root <dir>] [--config <path>]
```

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `--root` | ❌ | `process.cwd()` | 项目根目录 |
| `--config` | ❌ | `config/projects.yml` | 项目配置文件路径 |

**示例**：

```sh
article-hub doctor
article-hub doctor --root /path/to/project --config config/projects.yml
```

---

### `setup`

初始化本地环境，创建必要的目录骨架和 README 文件。实际写入必须传入 `--yes`；缺少 `--yes` 时会返回 `CONFIRMATION_REQUIRED`。

```sh
article-hub setup [--root <dir>] [--yes]
```

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `--root` | ❌ | `process.cwd()` | 项目根目录 |
| `--yes` | ❌ | `false` | 允许实际写入；不提供时非 dry-run 会失败 |

**示例**：

```sh
article-hub --dry-run setup --root /path/to/project
article-hub setup --root /path/to/project --yes
```

---

### `reconcile`

根据状态文件生成对账和恢复计划。当前命令只输出 `mutation_plan`，不直接执行 GitHub 或本地修复操作。

```sh
article-hub reconcile --state-file <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--state-file` | ✅ | 状态文件路径 |

---

## 输出格式

所有命令成功时通过 stdout 输出 JSON，格式如下：

```json
{
  "ok": true,
  "schema_version": "article-hub.<command>",
  "dry_run": false
}
```

失败时输出错误 JSON，同时在 stderr 打印人类可读的错误信息：

```json
{
  "ok": false,
  "schema_version": "article-hub.error",
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### 常见错误码

| 错误码 | 说明 |
|--------|------|
| `UNKNOWN_COMMAND` | 未知命令或子命令 |
| `MISSING_ARGUMENT` | 缺少必要参数或参数值 |
| `UNKNOWN_OPTION` | 传入了未知的 `--` 选项 |
| `UNEXPECTED_ARGUMENT` | 传入了多余的位置参数 |
| `CONFIRMATION_REQUIRED` | 写操作缺少显式确认，例如 `setup` 未传 `--yes` |

---

## 退出码

| 退出码 | 含义 |
|--------|------|
| `0` | 执行成功 |
| `2` | 参数/命令错误 |
| 其他 | 运行时错误（由具体错误类型决定） |
