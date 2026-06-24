# article-hub CLI 边界设计

## 目标

`article-hub` 是文章流水线的确定性流程原语，不是 `gh` 命令的便利封装。CLI 负责固定状态、校验、安全和幂等规则；Skill 负责调研、写作、润色和流程编排。

该边界的判断标准是删除测试：如果删除某个 CLI 能力后，复杂度会扩散到多个 Skill、Workflow 或人工步骤，它应该留在 CLI；如果删除后只是少写一层参数转发，它不应该进入 CLI。

## 命令分类

### Primitives

Primitives 是只读或近似只读的确定性流程原语：

- `inspect-issue`
- `plan approve`
- `state decide`
- `validate article`
- `projects list`
- `projects validate`

要求：

- 输入来自本地 fixture、配置或文件。
- 输出版本化 JSON envelope。
- stdout 只输出机器可解析 JSON。
- 错误路径返回稳定错误码。
- 不调用 GitHub mutation。
- 不让 LLM 判断批准、状态、权限或 schema 规则。

### Adapters

Adapters 是带受控副作用的流程适配器：

- `checkout-sources`
- `create-pr`
- `update-status`

要求：

- 必须支持 `--dry-run`。
- dry-run 必须输出 `mutation_plan.operations`。
- 真实执行前必须完成本地 guard，例如输入安全、文章校验、暂停状态和幂等判断。
- 只包装带业务规则的副作用，不包装单纯 `gh` 参数转发。

### Diagnostics

Diagnostics 用于本地健康检查、骨架初始化和可唯一推导的恢复计划：

- `doctor`
- `setup`
- `reconcile`

要求：

- 不扩张成通用运维工具。
- 只处理本地环境或 GitHub 事实可唯一推导的恢复。
- 无法唯一判断时交回 Skill 或人工处理。

## Skill 与 CLI 分工

Skill 负责：

- 用 `gh issue view`、`gh pr view` 等普通命令读取 GitHub 原始事实。
- 将原始事实保存为本地 fixture。
- 调用 CLI 获取确定性判断。
- 根据结果执行调研、写作、润色、人工沟通和流程编排。

CLI 负责：

- 解析固定 `/ai` 命令。
- 过滤 bot 和未授权评论。
- 校验写作计划固定批准命令并生成批准快照。
- 校验文章、项目配置、路径和素材契约。
- 决定状态 mutation 是否允许。
- 生成或执行受控 Git/GitHub mutation。

Skill 不重复实现 CLI 已经固定的规则。CLI 也不新增仅等价于 `gh` 参数转发的命令。

## 新命令准入标准

新增 CLI 命令必须至少满足以下一项：

- 固定跨 Skill 或 Workflow 复用的业务不变量。
- 生成稳定 JSON contract，供自动化消费。
- 在执行 Git/GitHub 写操作前做本地 guard。
- 提供幂等 mutation plan。
- 消除 LLM 反复解释同一规则的风险。

以下能力不进入 CLI：

- 单纯读取 Issue、PR、评论或文件列表。
- 单纯追加评论。
- 单纯展示 GitHub CLI 的输出。
- 只为迁移期兼容存在的命令。

## 测试准则

测试使用 TDD vertical slice：一次只新增一个行为测试，确认失败后再写最小实现。

测试应该验证公开行为：

- CLI JSON envelope、`schema_version`、稳定错误码和退出码。
- `decision.mutation_allowed`、`decision.blocked_reason`、`decision.labels_to_add` 等结构化字段。
- `mutation_plan.operations` 是否表达必要副作用。
- 文章校验问题的稳定 `code` 和 `field`。
- 批准快照、状态、权限、安全路径等长期契约。

测试不验证：

- 迁移过程。
- 文件是否移动到某个目录。
- 私有函数、内部调用次数或调用顺序。
- 人类可读错误文案的完整中文句子。
- Skill 文档段落的精确措辞。

`message` 字段只服务人类阅读；测试可以确认它存在且非空，但不能依赖语言、词语或句式。
