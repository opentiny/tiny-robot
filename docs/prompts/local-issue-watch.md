# 本地文章 Issue 巡检任务

你正在 ai-article-hub 仓库中执行本地文章 Issue 定时巡检。请只做本轮巡检，不要实现 GitHub Workflow，不要创建常驻服务。

## 范围

- 只处理打开的文章 Issue。
- 候选 Issue 必须带有以下任一相关标签：阶段：选题、阶段：策划、AI：等待执行、AI：失败、AI：等待人工。
- 每轮最多处理 3 个候选 Issue。
- PR 已存在的 Issue 不再执行生成类动作，只做状态提示，并把后续修改交给 PR 巡检。

## 共用安全规则

- 每个候选 Issue 先读取 Issue 正文、标签、评论和关联 PR。
- 处理前检查 `.cache/article-hub/scheduled-runs/<issue-number>.json`。
- 同一 Issue 有未完成运行标记时跳过。
- 运行标记已过期时不要删除、不要抢占，只报告“疑似遗留运行”，并要求人工确认。
- Issue 含 `AI执行：人工暂停` 时立即停止处理该 Issue。
- 所有状态标签只能通过 `article-hub update-status` 修改，不能手工拼标签。
- 需要写作计划批准时，只接受 `inspect-issue` 输出中 `actionable: true` 且 `parsed.kind` 为 `approve-writing-plan` 的固定命令。
- `/ai 同意`、`同意`、`开始写吧`、自然语言批准或带参数的 `/ai 批准写作计划` 都不算批准。
- `/ai 批准选题` 不作为本地定时巡检触发条件；当前使用说明从写作计划审核开始。

## 处理流程

1. 使用 `gh` 读取候选 Issue 原始事实，并用 `article-hub inspect-issue` 解析标签、权限和固定 `/ai` 命令。
2. 如果发现 `/ai 暂停`、`/ai 恢复` 或 `/ai 重试`，分别通过 `article-hub update-status` 的 `pause`、`resume`、`retry` intent 处理；不要手工改标签。
3. 如果发现 `/ai 批准选题`：
   - 不进入生成流程。
   - 评论说明：当前本地巡检从写作计划审核开始，不消费 `/ai 批准选题`，请按使用说明让 Agent 生成或更新写作计划。
   - 保持或更新为 `阶段：策划` + `AI：等待人工`。
   - 继续下一个候选 Issue。
4. 如果 Issue 已有关联 Draft PR 或文章 PR：
   - 不调用 `generate-opentiny-article`。
   - 如果 Issue 又出现新的写作计划意见或批准命令，评论说明“该文章已进入 PR 阶段，请到关联 PR 提修改意见”。
   - 关联 PR 仍是 Draft 时，用 `article-hub update-status` 保持或更新为 `阶段：写作` + `AI：等待人工`。
   - 关联 PR 已 Ready for review 时，先执行本地 Ready for review 检查；通过后才用 `article-hub update-status` 保持或更新为 `阶段：审核` + `AI：等待人工`。
   - Ready for review 检查失败但 PR 未转回 Draft 时，保持 `阶段：审核` + `AI：等待人工`，并评论说明缺哪些检查项，请人工处理或 Convert to draft。
   - 继续下一个候选 Issue。
5. 如果没有新事实、新评论、新 review 意见、固定批准命令或状态命令，不重复评论。
6. 如果有新 Issue 信息或写作计划 review 意见：
   - 读取 `README`、`usage`、`docs`、`skills` 和 `config/projects.yml`。
   - 检查相似 Issue、已有文章和 `materials/article-archive`。
   - 生成或更新“当前写作计划评论”，完整计划必须进入 Issue 评论。
   - 写清计划版本、推荐标题、目标读者、来源快照、建议大纲、截图/GIF 素材需求、素材缺口、人工验收项。
   - 给出固定批准命令：`/ai 批准写作计划`。
   - 通过 `article-hub update-status` 把 Issue 设为 `阶段：策划` + `AI：等待人工`。
7. 如果发现 `/ai 同意`、`同意`、`开始写吧` 等近似批准：
   - 只回复一次提醒：当前流程只接受逐字固定命令 `/ai 批准写作计划`。
   - 保持或更新为 `阶段：策划` + `AI：等待人工`。
   - 不生成文章，不创建 PR。
8. 如果发现授权用户发出的固定 `/ai 批准写作计划`：
   - 先创建本地运行标记。
   - 如果 Issue 当前仍是 `阶段：选题`，先用 `article-hub update-status` 做 `选题→策划`。
   - 使用 `article-hub update-status` 做 `策划→写作`，把 Issue 改为 `阶段：写作` + `AI：处理中`。
   - 巡检本身不重新实现生成流程；进入已批准写作计划到 Draft PR 的既有流程，按 `generate-opentiny-article` 的步骤处理该 Issue。
   - 创建或更新 Draft PR 前运行 `git status --short`，确认没有运行缓存和临时文件进入工作区。
   - Draft PR 创建成功后，使用 `article-hub update-status` 改为 `阶段：写作` + `AI：等待人工`，并评论 Draft PR 链接和待人工处理项。
9. 如果遇到意见冲突、缺来源、截图/GIF 需确认、代码事实需维护者确认或 Head SHA 不一致：
   - 停止处理该 Issue。
   - 用 `article-hub update-status` 改为当前阶段 + `AI：等待人工`。
   - 评论写清：停在哪一步、缺什么信息、需要谁决定。
10. 如果环境、权限、命令或 GitHub 写操作失败：
    - 停止处理该 Issue。
    - 用 `article-hub update-status` 改为当前阶段 + `AI：失败`。
    - 评论写清失败命令、错误摘要和建议处理方式。
11. 正常完成或失败状态已回写后，删除本地运行标记；过期标记不要删除。

## 本轮输出

本轮结束时，请输出：

- 本轮检查的 Issue 数量。
- 已处理的 Issue。
- 跳过的 Issue 和原因。
- 需要人工处理的 Issue。
- 失败项。
