# polish-opentiny-article 评测脚手架

用于回归这个 skill 的两类能力：**保真（不动受保护内容、不编造事实）**与**自然度（去模板腔/空话/营销腔/表演性表达）**。

## 文件

- `evals.json`：3 个真实场景的测试 prompt + 期望产出 + 断言。
- `fixtures/theme-config-draft/article.md`：故意塞满目标问题（空泛开场、营销腔、无源结论、表演性表达、拔高收尾）与受保护内容（Front Matter、代码块、`setGlobalConfig`、版本 `3.20.0`、URL、已有日期与数据）的草稿。已通过 `article-hub validate article`。

## 断言分两类

- **确定性（可脚本核验）**：对比"输入 fixture"与"skill 产出"——Front Matter/代码块/版本/URL/已有数据逐字未变、`sources` 未新增、产出仍通过 `validate article`、无新增数字/机构。
- **定性（需 grader 或人工）**：模板腔/营销腔/拔高/表演性表达是否被恰当处理、是否未编造、主题与结论强度是否未漂移。主观写作质量以人工评审为主。

## 运行（baseline vs skill 对比，参考 skill-creator 方法论）

skill 改动前后各跑一遍同一组 prompt，对比保真与自然度：

1. **baseline**：用改动前的 skill 版本（或快照 `git stash`/`git worktree`）对 fixture 跑 `evals.json` 里的 prompt，产出存到 `workspace/iteration-N/eval-<id>/old_skill/outputs/`。
2. **with_skill**：用当前版本同样跑一遍，存到 `.../with_skill/outputs/`。
3. **确定性核验**：对每个产出运行
   ```sh
   node dist/cli.js validate article \
     --article-file <产出 article.md> --config config/projects.yml
   ```
   并 `diff` 产出与 fixture 的 Front Matter、代码块、关键串（`3.20.0`、URL、1.2%/0.4%）。
4. **定性评审**：人工或 grader 子代理按 `evals.json` 的 qualitative 断言打分。

> 这是主观 skill：确定性断言保证"没改坏受保护内容/没编造"，自然度仍需人看。修改 skill 后建议至少重跑一次本目录的 3 个场景。
