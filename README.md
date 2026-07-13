# ai-article-hub

OpenTiny AI 文章生成流水线的本地输出库。它将选题 Issue、资料快照、写作计划、文章母稿、Draft PR 和 Review 修订串联成一套可审计的内部维护流程。

本仓库当前交付形态是本地人工驱动流程：Agent 负责调研、写作和润色；`article-hub` CLI 负责确定性的解析、校验、安全 guard 和受控 Git/GitHub mutation。未来 GitHub Workflow 的设计已保留在文档中，但不属于当前交付范围。

## 当前能力

- 支持项目：`webmcp-sdk`、`genui-sdk`、`tiny-robot`，配置来源见 [`config/projects.yml`](./config/projects.yml)。
- 支持文章类型：`release`、`practical-guide`、`source-analysis`、`case-study`。
- 支持本地 Skill：`generate-opentiny-article` 负责从已批准写作计划生成初稿和 Draft PR，并在创建 Draft PR 前调用初稿优化；`polish-opentiny-article` 负责初稿优化和 Draft PR 修改时的正文处理。
- 支持确定性 CLI：`article-hub` 输出机器可解析 JSON，固定状态、批准快照生成、文章校验、项目配置校验和受控 mutation plan。

## 快速开始

前置条件：

- Node.js `>=20.0.0`
- pnpm `>=10 <11`
- GitHub CLI，并已完成 `gh auth status`

```sh
corepack enable
corepack prepare pnpm@10 --activate
pnpm install --no-lockfile
pnpm run build
node scripts/article-hub-launcher.mjs doctor --root . --config config/projects.yml
pnpm test
```

常用本地检查：

```sh
node scripts/article-hub-launcher.mjs --dry-run inspect-issue --issue-file tests/fixtures/issue-minimal.json
node scripts/article-hub-launcher.mjs validate article --article-file tests/fixtures/articles/valid-article.md --config config/projects.yml
```

## 核心工作流

1. 维护者通过文章选题 Issue 提供项目、文章类型、目标和候选资料；文风由 AI 在写作计划中推荐，人工批准前确认或改选。
2. Agent 读取 Issue 原始事实，调用 `article-hub inspect-issue` 和 `projects validate` 做确定性解析与项目 allowlist 校验。
3. Agent 调研公开资料，生成写作计划、资料快照和素材缺口，并把计划评论发布到 Issue。
4. 维护者用固定命令批准写作计划：`/ai 批准写作计划`，Agent 随后生成批准快照。
5. Agent 调用 `generate-opentiny-article` 生成文章母稿，并在创建 Draft PR 前调用 `polish-opentiny-article` 做初稿全文优化。
6. `article-hub validate article` 通过后，流程创建或更新 Draft PR，并把 Issue 状态更新为等待人工 Review。
7. 后续初审、Review、`Request changes` 或 `/ai` 修改要求由 `polish-opentiny-article` 按授权范围处理，并再次执行文章校验；人工确认后不默认追加全文润色。

完整需求见 [`docs/article-generation-requirements.md`](./docs/article-generation-requirements.md)，未来 Workflow 边界见 [`docs/article-generation-workflow-design.md`](./docs/article-generation-workflow-design.md)。

## 仓库结构

| 路径 | 用途 |
| --- | --- |
| [`src/`](./src/) | `article-hub` CLI 源码，包含 commands、domain 和 infrastructure。 |
| [`.agents/skills/`](./.agents/skills/) | Codex 项目级 Skill，随仓库自动发现。 |
| [`.claude/skills/`](./.claude/skills/) | Claude Code 项目级 Skill，随仓库自动发现。 |
| [`config/`](./config/) | 项目 allowlist、源码仓库和文档入口配置。 |
| [`docs/`](./docs/) | 需求、CLI 边界、CLI 参考和未来 Workflow 设计。 |
| [`articles/`](./articles/) | 文章母稿目录，格式为 `articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md`。 |
| [`materials/`](./materials/) | Issue 来源快照、文章归档素材和 dry-run 证据。 |
| [`references/`](./references/) | OpenTiny 品牌、术语和写作规范引用。 |
| [`tests/`](./tests/) | CLI、domain、Skill contract 和集成测试。 |

## CLI 入口

构建后统一通过仓库内 launcher 运行，不要求全局安装 `article-hub`：

```sh
node scripts/article-hub-launcher.mjs <command> [options]
```

launcher 从主仓库定位 `dist/cli.js`，保留调用方 `cwd`，因此可从带空格路径或隔离 worktree 调用。构建产物缺失时返回稳定错误码 `CLI_NOT_BUILT`。

命令分为三类：

- Primitives：`inspect-issue`、`plan approve`、`state decide`、`validate article`、`projects list`、`projects validate`
- Adapters：`checkout-sources`、`create-pr`、`update-status`
- Diagnostics：`doctor`、`setup`、`reconcile`

CLI stdout 只输出 JSON；人类可读错误输出到 stderr。详细参数见 [`docs/cli-reference.md`](./docs/cli-reference.md)，命令准入和 Skill 分工见 [`docs/cli-boundary-design.md`](./docs/cli-boundary-design.md)。

## 验证与 CI

本地常规验证：

```sh
pnpm test
pnpm run build
```

CI 配置见 [`.github/workflows/article-ci.yml`](./.github/workflows/article-ci.yml)，当前在 Ubuntu、macOS 和 Windows 上使用 Node.js 20 执行依赖安装、测试和构建。

测试重点保护公开行为：CLI exit code、JSON envelope、稳定错误码、`--dry-run` 不执行副作用、文章校验的结构化 `blocking_issues[].code`，以及 Skill 独立加载契约。测试不绑定内部私有函数、自然语言文案或实现调用顺序。
