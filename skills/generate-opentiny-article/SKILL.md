---
name: generate-opentiny-article
description: 从已批准的 OpenTiny 文章 Issue 本地生成初稿、校验产物并创建 Draft PR。只覆盖 Phase A 本地人工驱动流程。
---

# Generate OpenTiny Article

## 适用范围

使用本 Skill 将一个已批准的文章 Issue 转成可人工 Review 的 Draft PR。流程由本地 Agent 驱动，不监听 GitHub 事件，不实现 Phase B Workflow 自动化、热点发现、发布平台适配或外部发布。

## 前置条件

- 已按仓库 `INSTALL.md` 安装本 Skill。
- 本仓库依赖已安装并通过 `npm test`、`npm run build`。
- `gh auth status` 可访问目标仓库。
- Issue 处于 `阶段：策划`，且维护者明确批准当前写作计划。

## 流程

1. 读取 Issue fixture 或 GitHub Issue 内容，运行：

   ```sh
   article-hub inspect-issue --issue-file <issue.json>
   article-hub projects validate --config config/projects.yml
   ```

2. 校验项目属于 `config/projects.yml` 中的 Phase A 白名单，并 checkout 来源：

   ```sh
   article-hub checkout-sources --config config/projects.yml --project <project-id> --cache-dir <cache-dir>
   ```

3. 生成或更新写作计划，计算 Hash：

   ```sh
   article-hub plan hash --plan-file <plan.json>
   ```

4. 等待人工使用固定命令批准当前版本：

   ```text
   /ai 批准写作计划 <plan_version> <hash-prefix>
   ```

5. 批准后生成不可变批准快照：

   ```sh
   article-hub plan approve --plan-file <plan.json> --command "<command>" --approver <login> --comment-id <id> --approved-at <iso-time>
   ```

6. 在隔离 Git worktree 中创建文章目录：

   ```text
   articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md
   ```

   素材放在同目录 `assets/` 下；Mermaid 必须保存 `.mmd + .svg + .png`，正文只引用 PNG。

7. 写作后先润色，再执行确定性校验：

   ```sh
   article-hub validate article --article-file <article.md> --config config/projects.yml
   ```

8. 校验通过后创建或更新 Draft PR：

   ```sh
   article-hub create-pr \
     --article-file <article.md> \
     --config config/projects.yml \
     --issue-number <number> \
     --repository hexqi/ai-article-hub \
     --base main \
     --slug <slug> \
     --title "<final-title>"
   ```

9. 更新 Issue 状态：

   ```sh
   article-hub update-status \
     --issue-file <issue.json> \
     --repository hexqi/ai-article-hub \
     --phase "阶段：写作" \
     --ai-state "AI：等待人工" \
     --comment "初稿已生成，Draft PR 已创建。"
   ```

## 写作约束

- 不根据普通自然语言猜测批准意图。
- 不生成空 Draft PR；只有文章校验通过后才创建 PR。
- 不把只存在于单台机器的资料写成正式来源。
- 不写 MDX、自定义组件、脚本或平台专属发布字段。
- 遇到 `AI：已暂停` 立即停止，不提交新 Commit。

## 输出

- `articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md`
- 就近素材目录 `assets/`
- Draft PR 链接
- Issue 状态更新摘要
