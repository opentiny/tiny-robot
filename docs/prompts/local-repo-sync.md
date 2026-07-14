# 本地仓库同步巡检

你正在 `ai-article-hub` 主仓库执行一轮代码同步。本轮只更新跟踪分支并按需构建；不处理 Issue、PR、文章或外部发布。

## 目标与完成标准

- 工作目录：主仓库绝对路径，记为 `scheduler_root`。
- 跟踪分支：默认 `main`；定时任务另有指定时用该分支，记为 `<track_branch>`。
- 远程：仅 `origin`。
- 完成标准：本地已与 `origin/<track_branch>` 对齐（或确认无新提交）；需要时完成 install/build/doctor；写入运行记录并输出摘要。

```text
<article_hub> = node "<scheduler_root>/scripts/article-hub-launcher.mjs"
运行记录 = <scheduler_root>/.cache/article-hub/scheduled-runs/system/repo-sync.json
业务标记目录 = <scheduler_root>/.cache/article-hub/scheduled-runs/
```

## 安全边界

1. 只允许 `git fetch` 与 `git merge --ff-only`。
2. 工作区不干净、当前不在 `<track_branch>`、本地领先或与远端分叉时停止。
3. 禁止 `reset`、`rebase`、`stash`、`clean`、普通 merge、`push`，以及改 remote / credential。
4. 不处理 Issue/PR/文章/发布；不用全局 `article-hub`，不用 `npm install`。

## 执行步骤

按顺序执行。命令失败或触发安全边界时停止，并按「失败处理」收尾。

### 1. 环境、路径与分支

```bash
node --version
corepack pnpm --version
git --version
git rev-parse --show-toplevel
git rev-parse --abbrev-ref HEAD
```

要求：Node.js ≥ 20；`show-toplevel` 等于 `scheduler_root`；当前分支等于 `<track_branch>`。否则 `failed_environment` 或 `blocked_local_state`。

### 2. 运行标记与工作区

运行标记用于避免已知任务重叠，不提供跨进程强互斥。

1. 检查业务标记目录中除 `system/` 外的 `*.json`，以及 `repo-sync.json`。
2. 存在 `status: "running"` 且未过 `expires_at` → `skipped_busy`，不改仓库。
3. 存在已过期的 `running` 标记 → `blocked_local_state`，提示人工检查；不删除、不抢占。
4. 通过后写 `repo-sync.json`：`status: "running"`，`expires_at` 为开始后 30 分钟。
5. `git status --porcelain` 非空 → `blocked_local_state`。

### 3. 获取上游

```bash
git fetch origin <track_branch>
git rev-parse HEAD
git rev-parse origin/<track_branch>
git rev-list --left-right --count HEAD...origin/<track_branch>
```

`A B` 中 `A` 为本地独有提交数，`B` 为远端独有提交数。

| A | B | 动作 |
| --- | --- | --- |
| 0 | 0 | 无更新，进入构建条件 |
| 0 | >0 | 进入步骤 4 |
| >0 | 任意 | `blocked_local_state` |

`fetch` 失败 → `failed_sync`。

### 4. Fast-forward

仅当远端领先时：

```bash
git merge --ff-only origin/<track_branch>
```

记录 `before_sha` / `after_sha`。失败 → `failed_sync`。

### 5. 依赖与构建

满足「构建条件」时依次执行：

```bash
corepack pnpm install --no-lockfile
corepack pnpm run build
<article_hub> doctor --root "<scheduler_root>" --config "<scheduler_root>/config/projects.yml"
```

使用当前机器 npm registry。构建因依赖缺失失败时，允许再 install 一次并重试 build 一次。install/build/doctor 失败 → `failed_build`。doctor 须退出码 0 且含 `ok: true`。

### 6. 收尾

再跑 `git status --porcelain`；若出现应提交的源码/配置改动 → `blocked_local_state`。更新 `repo-sync.json` 与本轮输出。

## 构建条件

满足任一条件则 install/build/doctor：

- 本轮执行了 fast-forward；
- `node_modules` 或 `dist/cli.js` 不存在；
- 上一次 `outcome` 为 `failed_build`。

否则不重复构建。无更新且无需构建 → `already_up_to_date`；更新且构建成功 → `updated`。

## 失败处理

停止后续步骤；不处理 Issue/PR/发布。更新 `repo-sync.json`：`status` 为 `failed` 或 `blocked`，填写 `outcome`、`failed_command`、`exit_code`、`error_summary`，并在任务输出中报告。

| `outcome` | 何时使用 |
| --- | --- |
| `updated` | 已 ff 更新并完成构建 |
| `already_up_to_date` | 无新提交且无需修复构建 |
| `skipped_busy` | 发现活动运行标记 |
| `blocked_local_state` | 脏工作区、错误分支、领先/分叉、过期标记、同步后异常脏文件 |
| `failed_environment` | node/pnpm/git/路径检查失败 |
| `failed_sync` | fetch 或 ff-only 失败 |
| `failed_build` | install、build 或 doctor 失败 |

具体原因写入 `error_summary`。

## 运行记录与输出

路径：`运行记录`（不提交 git）。

```json
{
  "task": "repo-sync",
  "status": "running",
  "outcome": null,
  "started_at": "<iso8601>",
  "finished_at": null,
  "expires_at": "<iso8601>",
  "track_branch": "main",
  "before_sha": null,
  "after_sha": null,
  "failed_command": null,
  "exit_code": null,
  "error_summary": null
}
```

结束时设 `finished_at` 与 `outcome`，`status` 为 `completed` / `failed` / `blocked`。

成功示例：

```text
repo-sync outcome: updated
branch: main
before_sha: abc1234
after_sha: def5678
error_summary:
```

阻断示例：

```text
repo-sync outcome: blocked_local_state
branch: main
before_sha: abc1234
after_sha: abc1234
error_summary: git status --porcelain is not empty; refuse to sync
```
