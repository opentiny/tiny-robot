---
name: polish-opentiny-article
description: 当需要优化 OpenTiny 对外技术文章时使用：包括 `generate-opentiny-article` 生成初稿后的全文优化、Draft PR 初审或 Review 中的 `/ai 全文润色`、Request changes、PR `/ai` 指令和局部修改要求；人工确认或 Approve 后不要默认触发，若再次触发则视为新一轮修改。
---

# Polish OpenTiny Article

## 目标

只优化 OpenTiny 对外技术文章。先保护事实、术语和人工内容，再让正文更具体、克制、连贯并可直接 Review。本 Skill 不是运营和技术确认后的默认收尾步骤。

不得为了让文章更自然而新增事实、数据、来源、用户反馈、产品能力、个人经历或因果关系——这类补全会在 Review 或发布后被证伪，损害对外文章的可信度。

## 必读资料

每次执行先读[文章保护边界](./references/article-guardrails.md)，并据其开头的“可改 / 逐字保留 / 触发停止”速查表确定本轮边界；再读[风格指南](./references/style-guide.md)和[文章反模式](./references/anti-patterns.md)。

[改写示例](./references/examples.md)是判断改写力度的校准锚点：初稿全文优化和 `/ai 全文润色` 应一并读取，Review 局部修订在边界难以判断时再读取。

任一文件缺失时停止，并报告项目级 Skill 不完整。

## 输入场景

### 初稿全文优化

由 `generate-opentiny-article` 在正文生成后、创建 Draft PR 前调用。可以处理全部正文自然语言、删除纯空话、合并重复句，并在同一章节内轻量调整句序。

不得改变文章主题、大纲意图或章节职责。

若识别出 polish 无权修复的结构性问题——逐模块/逐文件平推、通篇无主线、每节只复述文档——停止润色，不交付润色后的正文，改为交付下面这张固定形状的问题报告（逐条填写，不代写正文），并要求回到 `generate-opentiny-article` 第 6 步重定主线后重写，再回到润色：

| 结构病 | 位置（章节/标题） | polish 无权修复的原因 | 建议回到 generate 第 6 步的动作 |
| --- | --- | --- | --- |

句面优化掩盖不了结构病，带病润色会使 generate 流程继续执行 validate 并创建 PR。

本场景只交付润色后的正文；`validate article`、`create-pr`、`update-status` 由 `generate-opentiny-article` 流程统一收尾，polish 不重复执行。

### `/ai 全文润色`

在 Draft PR 初审或 Review 中由人工明确提出时使用，作为一轮全文修改处理。处理全部正文，但不主动重排章节，不覆盖人工提交后形成的事实、观点和表达边界。整句删除可能影响判断或节奏时，保留原文并说明风险。

如果运营和技术已经确认通过，`/ai 全文润色` 会产生新改动，必须在回复中说明需要重新确认；涉及事实表述时请核心技术维护者复核。

### Review 局部修订

只消费以下人工明确提出的修改要求：

- GitHub Review 中的 `Request changes`
- PR 中的 `/ai` 指令
- PR 评论、行级评论或 Review 线程中的明确可执行修改意见

默认只修改评论指向的行、段落或受影响章节，不顺手优化相邻章节。Issue 控制请求不属于本 Skill，polish 不消费，由调用方按原任务处理；PR Review、行级评论、PR 评论和 `Request changes` 中，能评论即视为已授权。`Approve`、人工说“通过”或“确认”不触发修改。

处理一轮 Issue 评论或 PR Review 时，先按 [评论归类与回贴细则](./references/review-triage.md) 枚举本轮全部评论、逐条归类、逐条处理并回贴结果，不要把多条异质评论合并成一团笼统处理。处理边界按是否触及受保护内容判定，**不按评论者身份区分**——运营也可能提出触及事实的意见，技术也可能只提表达意见，凡触及版本、API、兼容性、性能、安全、代码等受保护事实，无论谁提出都回固定来源核验。

目标短语属于无来源评价，且删除后句意完整时，直接删除目标短语，不用推断出的功能或效果补位。

## 执行流程

1. 读取文章、已批准写作计划、来源快照、修改意见和当前 Head SHA。
2. 确定本轮属于初稿全文优化、全文修改还是 Review 局部修订。属于 Review 局部修订或处理一轮评论时，先按评论归类与回贴细则枚举本轮全部评论并逐条归类；意图模糊、无法确定改法的评论，先按停止条件澄清，不带着猜测进入改写。
3. 按文章保护边界标记不可修改内容和本轮允许范围；无法可靠划分时缩小范围，不猜测。属于初稿全文优化时，进入句面优化前先判定结构病（逐模块/逐文件平推、通篇无主线、每节只复述文档）：命中则按上文「初稿全文优化」的硬约束停止润色、交问题报告打回 `generate-opentiny-article` 第 6 步，不进入下一步。
4. 按风格指南和文章反模式优化正文：
   - 删除不承载信息的提示层、空话和拔高收尾。
   - 将抽象包装改为原文已有的主体、动作、条件和结果。
   - 统一语域，避免公告腔、自媒体腔、聊天腔和技术说明混杂。
   - 保留必要转场、技术术语和长文节奏。
5. 保真回读：核对事实、数字、条件、时间线、责任主体、因果关系、结论强度和受保护内容。其中涉及版本、API、兼容性或性能结论时，回到已固定来源核验；无法确认时保留原文并请求人工判断，无需改写时逐字保留该事实句。
6. 自然度回读：只清理残留空开场、空总结、营销腔、无源判断和表演性技术表达，不开启第二轮全文重写。
7. 按“校验与更新”执行文章校验与收尾。

## 停止条件

出现以下任一情况时停止，不提交或覆盖远端更新：

- 当前 Head SHA 与开始处理时不一致。
- 修改意见与固定来源或受保护内容冲突。
- 本轮修改要求模糊到无法确定具体改法。满足以下任一条件即视为必须澄清的模糊评论：①评论只表达不满或感受、没有指向具体位置或期望（如“这个不行”“需要改改”“感觉怪怪的”）；②指出了问题但没给方向，且存在多个互斥的合理改法（如“这段太啰嗦”——删、合并还是换表达，结果差异大）；③要求与受保护内容相关但没提供新的一级来源；④同一处多条评论意见互相冲突。澄清动作：不改稿、不提交，向人工逐条输出「这条评论：<原文摘录> / 不确定的点：<列出可能改法及差异> / 请确认：<二选一或补充信息的具体问题>」，人工给出明确方向后再按新一轮局部修订处理。宁可多问一次也不替作者拍板；澄清不等于先改一版再问，更不允许为补足模糊意图新增来源外事实。
- 无法区分正文与代码、引用或人工区域。
- 本轮修改要求涉及版本、API、兼容性或性能结论，但缺少支撑该结论的来源。
- 修改会越过本轮授权章节。
- 必读资料缺失。
- 润色后文章校验仍报阻断码，且无法在不改动受保护内容的前提下消除。

停止时说明冲突、受影响位置和需要人工决定的问题。

## 红线自检

下面是高频的自我合理化，出现任一念头即对照右列纠正：

| 出现的念头 | 事实 |
|---|---|
| “写得更具体一点，补个数字/案例/用户反馈更有说服力” | “更具体”不是新增来源外事实的理由；缺料时降低结论强度，或保留原文并请人工提供来源。 |
| “这句删了更顺，但可能动到判断” | 整句删除可能影响判断或节奏时，保留原文并说明风险，不替作者拍板。 |
| “顺手把相邻段也优化了” | 只动本轮授权范围；Review 只改评论指向处。 |
| “把套话换成另一组顺口的说法” | 不用新口头禅替换旧套话，改成具体的主体、动作、条件、结果。 |
| “改一下措辞让结论更肯定” | 不把推测写成结论，不用更肯定的措辞掩盖不确定性。 |
| “校验没过，改下 Front Matter/代码让它过” | polish 不改受保护内容；校验失败先回退排查，不靠改受保护内容凑过校验。 |
| “结构是流水账，但我只动句子先润一版” | 逐模块平推/无主线是结构病，polish 无权重排章节；停止润色、不交付润色正文，交问题报告并打回 generate 第 6 步重定主线，不带病润色放行。 |
| “评论没说清，但我大概猜到想要什么，先改了再说” | 模糊评论先按停止条件澄清，不猜一个改法盲目执行；只表达感受、无明确方向或存在多个互斥改法时，停下来逐条列出可能改法让人工二选一。 |

## 校验与更新

启动时把主仓库绝对路径记为 `scheduler_root`，并把 `node "<scheduler_root>/scripts/article-hub-launcher.mjs"` 记为 `<article_hub>`。本文命令示例中的 `<article_hub>` 必须替换成这条完整命令；禁止运行裸 `article-hub` 或依赖全局安装。即使当前 `cwd` 是隔离 worktree，也始终使用主仓库 launcher，调用进程的 `cwd` 保持在 worktree。

普通 PR、Review 和 Issue 读取使用 `gh` 获取原始事实；确定性判断和受控 Git/GitHub mutation 使用 `article-hub`。Issue 控制请求不属于本 Skill，polish 不消费，由调用方按原任务处理；PR Review、行级评论、PR 评论和 `Request changes` 中，能评论即视为已授权。遇到文章校验、暂停保护、状态标签互斥或路径安全判断时，必须调用 `article-hub`；不得在 Skill、临时脚本或自然语言推理中重写这些规则。

收尾归属：`/ai 全文润色` 与 Review 局部修订两个独立入口，由 polish 自己执行下面的校验与更新；作为 `generate-opentiny-article` 子步的初稿全文优化只交付润色后的正文，校验、Draft PR 和 Issue 状态由 generate 流程统一收尾。人工确认后再次触发全文润色时，按新一轮修改处理，并在回复中写明需要重新确认。

执行文章校验后：通过则进入更新；若出现阻断码，由于 polish 只改正文、本不应引入阻断码，先回退到改动前对比定位，确认是否误改了 Front Matter、代码、图片路径等受保护内容；无法在不改动受保护内容的前提下消除时，按停止条件停止。校验消费稳定的 `blocking_issues[].code`，不依赖 message 文案。

执行文章校验：

```sh
<article_hub> validate article \
  --article-file <article.md> \
  --config config/projects.yml
```

更新 Draft PR：

```sh
<article_hub> create-pr \
  --article-file <article.md> \
  --config config/projects.yml \
  --issue-number <number> \
  --repository hexqi/ai-article-hub \
  --base main \
  --slug <slug> \
  --title "<final-title>" \
  --body-file <pr-body.md>
```

如需回写 Issue 状态，先读取 PR Draft 状态和关联 Issue 当前阶段，再选择目标阶段：

- Draft PR 或关联 Issue 仍是 `阶段：写作`：回到 `阶段：写作 + AI：等待人工`。
- Ready PR 或关联 Issue 已是 `阶段：审核`：回到 `阶段：审核 + AI：等待人工`。
- PR 已 Convert to draft 但 Issue 仍是 `阶段：审核`：用 `lifecycle-transition` 退回 `阶段：写作 + AI：等待人工`。

Ready PR 的普通 Review 修订：

```sh
<article_hub> update-status \
  --issue-file <issue.json> \
  --repository hexqi/ai-article-hub \
  --intent content-transition \
  --phase "阶段：审核" \
  --ai-state "AI：等待人工" \
  --comment "已处理本轮修改意见，请重新 Review。"
```

Draft PR 初审或补素材修改：

```sh
<article_hub> update-status \
  --issue-file <issue.json> \
  --repository hexqi/ai-article-hub \
  --intent content-transition \
  --phase "阶段：写作" \
  --ai-state "AI：等待人工" \
  --comment "已处理本轮 Draft PR 初审意见，请继续初审或确认 Ready for review。"
```

PR 已 Convert to draft 时：

```sh
<article_hub> update-status \
  --issue-file <issue.json> \
  --repository hexqi/ai-article-hub \
  --intent lifecycle-transition \
  --phase "阶段：写作" \
  --ai-state "AI：等待人工" \
  --comment "PR 已转回 Draft，本轮修改已处理，请继续初审。"
```

## 完成门槛

- `<article_hub> validate article` 通过。
- 保真回读和自然度回读均已完成。
- 事实和术语已根据固定来源复核。
- 只修改了本轮授权范围。
- 未保留内部 prompt、事实占位内容或未经确认的结论。
- 人工验收项位于 PR body 的 `## 人工验收` 区，不在 `article.md` 正文；polish 不向正文写入或保留 `- [ ] 人工核对代码片段` 等代码核对类验收项（文章含代码片段时，该项由 generate 流程写入 PR body）。
