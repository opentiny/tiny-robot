# GitHub 评论安全发布适配器实施计划

本能力已落地：`article-hub comment publish` 提供文件输入、`gh --body-file` 发布与稳定创建结果；`update-status --comment-file`、巡检 prompt 与双份项目级 Skill 复用该 contract。

## 范围

- In: `comment publish` CLI、从当前 Git worktree 推导 `github.com` repository、PR/Issue 评论发布与结果映射、稳定 JSON/error contract、`update-status --comment-file`、prompt/Skill/CLI 文档与测试。
- Out: 远端正文比对、基于正文摘要的幂等 / 重试、调度器层硬禁止、GitHub Enterprise Server。

## 任务清单

- [x] 建立 `comment publish` vertical slice：合法 PR/Issue dry-run 从 `cwd` 的 `origin` 推导 repository，输出 `article-hub.comment.publish` 与 mutation operation，不调用 fake `gh`。
- [x] 正文文件本地 guard：拒绝 `-`、目录、缺失文件、无效 UTF-8、仅空白；成功路径只通过 `--body-file` 传递路径。
- [x] 当前仓库 guard：非 Git worktree、`origin` 缺失/歧义、非 `github.com` 返回 `CURRENT_REPOSITORY_INVALID`。
- [x] 真实发布与 URL 映射：成功返回 `delivery.status: "created"` 与 comment ID/URL；失败路径固定 `mutation_state` / `retry_safe`。
- [x] 独立 `comment publish` 类型预检：REST Issue 资源的 `pull_request` 与 `--target` 匹配；类型错误返回 `COMMENT_TARGET_MISMATCH`；预检失败不启动评论 mutation。
- [x] `GH_REPO` / `GH_HOST` 不能改写目标；内部调用显式绑定推导仓库与 `github.com`。
- [x] `update-status --comment-file` 复用共享发布模块；调用序列为 view → edit → comment。
- [x] 部分成功：发布未知时标签进入 `completed_operations`、评论进入 `unknown_operations`；URL 无效时二者均进入 `completed_operations` 并带 `result_error`。
- [x] `body.line_count` 供人工检查；`delivery` 与 operation 只携带创建结果与路径字段。
- [x] 日常发布路径直接真实 publish；`--dry-run` 为可选诊断。
- [x] Issue/PR/发布巡检 prompt、本地调度文档、四份 Skill、`README`/`usage`/`cli-reference`/`cli-boundary` 使用受控 adapter。
- [x] 设计文档描述当前 contract。

## 验证

```sh
pnpm test
pnpm run build
```

## 边界

- 附加评论使用 `--comment-file`。
- `comment publish` 与 `update-status` 的目标仓库由当前 worktree 的 `origin` 推导。
- `create-pr --repository` 保持既有 contract。
- 不实施 Codex、Claude 或调度器层的命令硬禁止。
