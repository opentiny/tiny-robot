# article-hub CLI 参考文档

`article-hub` 是 AI 文章生成流水线的确定性流程原语，不是 `gh` 命令的便利封装。CLI 固定状态、校验、安全和幂等规则；Skill 负责调研、写作、润色和流程编排。

所有命令的 stdout 仅输出机器可解析的 JSON，人类可读的错误信息输出到 stderr。命令边界见 [`cli-boundary-design.md`](./cli-boundary-design.md)。

## 安装与运行

```sh
# 构建
pnpm install
pnpm run build

# 仓库内固定入口
node scripts/article-hub-launcher.mjs <command> [options]
```

**环境要求**：Node.js ≥ 20.0.0，pnpm 10.x

不要依赖裸 `article-hub`、全局安装或调度进程的 `PATH`。launcher 固定使用当前仓库构建的 `dist/cli.js`，并保留调用方 `cwd`；从隔离 worktree 执行时，应调用主仓库 launcher 的绝对路径。

---

## 全局选项

| 选项 | 说明 |
|------|------|
| `--dry-run` | 试运行模式，不执行实际副作用操作。可放在命令行任意位置。 |

---

## 命令一览

| 命令 | 说明 |
|------|------|
| [`inspect-issue`](#inspect-issue) | Primitive：解析 Issue fixture，提取结构化事实并校验固定写作计划批准 |
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

输入可直接使用 `gh issue view --json number,title,body,author,labels,comments` 的导出结果；评论级 `authorAssociation` 和 GraphQL 字符串 `id` 会被保留并用于授权判定。REST API 形态的 `user`、数字 `id` 和 `author_association` 也受支持。

`commands[]` 保留每条评论的 `comment_id`、`body` 和标准化 `actor`，并输出以下判定：

- `explicit_ai_request`：评论首个非空位置是否以独立 `/ai` 前缀开头；正文中引用 `/ai` 或 `/ai请重试` 不匹配。
- `fixed_approval`：逐字匹配 `/ai 批准写作计划` 时为 `"approve-writing-plan"`，其他评论为 `null`。
- `approval_authorized`：固定写作计划批准是否通过权限和 bot 校验。

CLI 不解释 Review、状态查询、暂停、恢复、重试或写作计划修改意图。Agent 读取所有 `actor.authorized: true` 的非 bot 新评论并自行 triage；`explicit_ai_request` 只表示评论是否显式发出控制请求，不是 Review 意见的入口条件。明确 Review 意见无需 `/ai` 前缀，状态 mutation 仍由 `update-status` 校验。

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

写作计划批准，仅含 `approve` 子命令。

#### `plan approve`

校验逐字固定批准命令与批准元数据，返回无 Hash 的不可变批准快照；不写回任何文件。

```sh
article-hub plan approve \
  --plan-body-file <path> \
  --command "/ai 批准写作计划" \
  --approver <approver> \
  --comment-id <id> \
  --approved-at <timestamp> \
  [--plan-comment-id <id>] \
  [--plan-label <label>]
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--plan-body-file` | ✅ | 非空计划评论正文文件路径（临时输入，不入 git） |
| `--command` | ✅ | 批准命令原文，必须逐字等于 `/ai 批准写作计划` |
| `--approver` | ✅ | 审批者标识 |
| `--comment-id` | ✅ | 批准评论 ID（正整数） |
| `--approved-at` | ✅ | 带 `Z` 或时区 offset 的 ISO 批准时间戳 |
| `--plan-comment-id` | ❌ | 被批准计划评论 ID（正整数），写入快照便于溯源 |
| `--plan-label` | ❌ | 人类可读计划版本标签 |

---

### `projects`

项目配置管理，包含两个子命令：`list`、`validate`。

#### `projects list`

列出配置文件中的所有项目。输出包含项目展示名、`docs`、`demo`、`deepwiki`、`terminology` 和仓库摘要，供 Agent 获取项目上下文入口。

```sh
article-hub projects list --config <path>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--config` | ✅ | 项目配置文件路径（YAML） |

**输出要点**：

- `projects[].deepwiki.url`：项目 DeepWiki 地址；仅作为调研入口，产品事实仍需回溯到源码、官方文档或人工确认资料。

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

状态文件必须显式提供 mutation intent：

```json
{
  "labels": ["阶段：写作", "AI：等待人工"],
  "intent": "pause"
}
```

输出中的 mutation 决策固定放在 `decision` 下，调用方读取
`decision.mutation_allowed`、`decision.blocked_reason`、`decision.labels_to_remove`
和 `decision.labels_to_add`。

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

文章 Front Matter schema 为 `article-hub.article.v2`。必须包含 `approval_snapshot` 对象，记录批准快照引用和审计字段：`url`、`approver`、`plan_comment_id`、`approval_comment_id`。文章契约只记录批准快照引用；完整计划和批准时间保存在 Issue 批准快照评论中。

---

### `create-pr`

为生成的文章创建 Pull Request。命令会同步维护 `articles/publications.json`：创建或更新文章条目，保留已有平台发布记录；dry-run 只输出 mutation plan，不写文件。

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

输出中的 `publications_record` 包含发布记录文件路径、文章 ID 和本次是否已写入文件。新建 Draft PR 时不写 `source_pr`，因为 PR 编号要等 GitHub 创建成功后才可得；更新已有 Draft PR 时写入已有 PR 编号。

---

### `update-status`

更新 Issue 的状态标签和评论。

```sh
article-hub update-status \
  --issue-file <path> \
  --repository <owner/repo> \
  --intent <intent> \
  [--phase <phase>] \
  [--ai-state <state>] \
  [--expected-head-sha <sha>] \
  [--current-head-sha <sha>] \
  [--comment <text> | --comment-file <path>]
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `--issue-file` | ✅ | Issue JSON 文件路径 |
| `--repository` | ✅ | 目标仓库（格式：`owner/repo`） |
| `--intent` | ✅ | 显式状态 mutation 意图 |
| `--phase` | ❌ | 目标阶段；内容和 lifecycle 迁移需要 |
| `--ai-state` | ❌ | 目标 AI 工作状态；目标为活跃阶段时需要 |
| `--expected-head-sha` | ❌ | 调用方预期 Head SHA |
| `--current-head-sha` | ❌ | 当前 Head SHA |
| `--comment` | ❌ | 附加评论内容 |
| `--comment-file` | ❌ | 从 UTF-8 文件读取附加评论；适合多行 Markdown，不能与 `--comment` 同时使用 |

`--intent` 只接受以下值：

- `content-transition`
- `lifecycle-transition`
- `pause`
- `resume`
- `retry`

`pause`、`resume` 和 `retry` 不接受目标 `--phase` 或 `--ai-state`。

`--phase` 只接受以下值：

- `阶段：选题`
- `阶段：策划`
- `阶段：写作`
- `阶段：审核`
- `阶段：待发布`
- `阶段：已发布`
- `阶段：已终止`

`--ai-state` 只接受以下值：

- `AI：等待执行`
- `AI：处理中`
- `AI：等待人工`
- `AI：失败`

人工暂停信号使用独立标签 `AI执行：人工暂停`，不属于 `--ai-state`。

状态值必须精确匹配；传入其他值时返回 `INVALID_STATE`，退出码为 `2`。

输出中的 mutation 决策固定放在 `decision` 下，形状与 `state decide` 一致。
`mutation_plan.operations` 只描述实际会执行的 GitHub 操作；当
`decision.mutation_allowed` 为 `false` 时，`operations` 必须为空。

标签更新成功但附加评论失败时返回 `PARTIAL_MUTATION`。错误 envelope 的 `error.details.completed_operations` 列出已完成操作，`pending_operations` 列出可重试评论；调用方不得重复手工修改标签。

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
当存在恢复操作时必须使用 `--dry-run` 查看计划；非 dry-run 会返回 `RECONCILE_APPLY_UNSUPPORTED`，避免调用方误认为恢复已执行。没有恢复操作时，非 dry-run 仍可成功返回空计划。

```sh
article-hub --dry-run reconcile --state-file <path>
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

### 错误码

| 错误码 | 说明 |
|--------|------|
| `UNKNOWN_COMMAND` | 未知命令或子命令 |
| `UNKNOWN_OPTION` | 传入了未知的 `--` 选项 |
| `UNEXPECTED_ARGUMENT` | 传入了多余的位置参数 |
| `MISSING_ARGUMENT` | 缺少必要参数、参数值或参数值无效 |
| `MISSING_ISSUE_FILE` | Issue 文件缺少必要字段 |
| `ISSUE_FILE_NOT_FOUND` | Issue 文件不存在 |
| `ARTICLE_FILE_NOT_FOUND` | 文章文件不存在 |
| `INVALID_JSON` | 输入文件不是有效 JSON |
| `PLAN_FILE_NOT_FOUND` | 写作计划正文文件不存在 |
| `STATE_FILE_NOT_FOUND` | 状态文件不存在 |
| `PROJECT_CONFIG_NOT_FOUND` | 项目配置文件不存在 |
| `INVALID_STATE` | 状态值无效 |
| `INVALID_PROJECT_CONFIG` | 项目配置格式、结构或字段无效 |
| `UNKNOWN_PROJECT` | 项目未配置在 allowlist 中 |
| `UNSAFE_PATH` | 路径或路径相关参数不满足安全约束 |
| `COMMENT_FILE_NOT_FOUND` | `--comment-file` 指向的文件不存在或不可读 |
| `PARTIAL_MUTATION` | 状态 mutation 部分成功，按 `error.details.pending_operations` 恢复 |
| `ARTICLE_VALIDATION_FAILED` | 文章内容或 Front Matter 校验失败 |
| `CONFIRMATION_REQUIRED` | 写操作缺少显式确认，例如 `setup` 未传 `--yes` |
| `RECONCILE_APPLY_UNSUPPORTED` | `reconcile` 发现恢复计划，但当前命令不执行修复操作 |
| `GIT_COMMAND_FAILED` | Git 命令执行失败或结果不符合预期 |
| `GITHUB_COMMAND_FAILED` | GitHub CLI 命令执行失败 |

---

## 退出码

| 退出码 | 含义 |
|--------|------|
| `0` | 执行成功 |
| `2` | 参数/命令错误 |
| 其他 | 运行时错误（由具体错误类型决定） |
