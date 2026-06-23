# 状态 Mutation 单一规则源 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将阶段、AI 工作状态、人工暂停、恢复、重试和 lifecycle mutation 收敛到一个 domain 规则源，并让 `state decide`、`update-status`、Skill 与文档使用同一状态模型。

**Architecture:** 深化 `src/domain/state-machine.ts` 为纯函数状态 Module；新增 `src/commands/state-input.ts`，只负责把 JSON/CLI wire 输入转换为 domain intent。`state.ts` 与 `update-status.ts` 保持薄 Adapter；非 dry-run 的 `update-status` 在写入前通过 `gh issue view` 读取最新标签并重新决策。

**Tech Stack:** TypeScript ESM、Node.js 20、Vitest、GitHub CLI `gh`、YAML Issue Form、Markdown Skill。

---

## 实施前提

- 不为旧 `AI：已暂停` 编写生产兼容、migration test 或墓碑测试。
- 不精确匹配人类可读 message、中文句子、列表顺序或完整 fixture 快照。
- 状态标签、intent、`schema_version`、错误码和 `blocked_reason` 是稳定机器协议，可以精确断言。
- 每个任务只推进一个纵向行为；当前 RED → GREEN 完成后才进入下一任务。
- 每次 commit 前运行该任务列出的定向测试；最终任务再运行全部测试和 build。

## 文件职责

### 新建

- `src/commands/state-input.ts`：把 fixture/CLI 字段校验并转换成 `StateMutationIntent`；不包含阶段边、暂停和标签互斥规则。
- `tests/support/fake-gh.ts`：创建跨平台 fake `gh` 可执行文件，只替换外部 GitHub CLI 边界并记录调用。

### 修改

- `src/domain/state-machine.ts`：唯一状态标签目录、合法阶段边、状态不变量、guard 顺序和标签 mutation plan。
- `src/commands/state.ts`：读取状态 fixture、调用共享 wire Adapter 和 domain Module、输出 envelope。
- `src/commands/update-status.ts`：读取 Issue、调用 domain Module、生成/执行 GitHub operation。
- `src/cli.ts`：解析 `update-status --intent` 及可选目标状态、Head SHA 参数。
- `src/domain/command-parser.ts`：识别完整固定 `/ai` 命令集合。
- `src/commands/inspect-issue.ts`：将新增命令映射成稳定 wire 输出。
- `tests/unit/state-machine.test.ts`：通过导出 domain Interface 验证状态行为。
- `tests/unit/command-parser.test.ts`：验证支持的命令类型和少量代表性拒绝。
- `tests/integration/plan-state-cli.test.ts`：验证 `state decide` wire contract。
- `tests/integration/update-status-cli.test.ts`：验证 dry-run 一致性、阻断无副作用和非 dry-run 最新标签复检。
- `tests/integration/inspect-issue.test.ts`：验证新增命令的授权和结构化输出。
- `tests/support/cli.ts`：允许为真实 CLI 子进程传入受控环境变量。
- `tests/fixtures/state-*.json`：加入显式 intent 和目标字段，切换到新暂停标签。
- `.github/ISSUE_TEMPLATE/article.yml`：初始状态改成 `阶段：选题 + AI：等待人工`。
- `skills/generate-opentiny-article/SKILL.md`、`skills/polish-opentiny-article/SKILL.md`：使用新暂停信号和显式 update-status intent。
- `skills/generate-opentiny-article/evals/**`：paused fixture 保留 AI 工作状态并增加人工暂停信号，断言聚焦停止效果。
- `AGENTS.md`、`usage.md`、`docs/cli-reference.md`、`docs/article-generation-requirements.md`、`docs/article-generation-workflow-design.md`：同步状态模型、CLI contract 和停止条件。

## 目标 domain Interface

后续任务统一使用以下公开类型和命名，不另造平行接口：

```ts
/** 文章业务阶段标签目录。 */
export const PHASE_LABELS = [
  "阶段：选题",
  "阶段：策划",
  "阶段：写作",
  "阶段：审核",
  "阶段：待发布",
  "阶段：已发布",
  "阶段：已终止"
] as const;

/** 文章业务阶段标签。 */
export type PhaseLabel = (typeof PHASE_LABELS)[number];

/** 活跃阶段允许的 AI 工作状态标签目录。 */
export const AI_STATUS_LABELS = [
  "AI：等待执行",
  "AI：处理中",
  "AI：等待人工",
  "AI：失败"
] as const;

/** 活跃阶段的 AI 工作状态标签。 */
export type AiStatusLabel = (typeof AI_STATUS_LABELS)[number];

/** 人工显式暂停 AI 执行的独立控制信号。 */
export const MANUAL_PAUSE_LABEL = "AI执行：人工暂停" as const;

/** 状态 mutation 的业务意图类型。 */
export type MutationIntentKind =
  | "content-transition"
  | "lifecycle-transition"
  | "pause"
  | "resume"
  | "retry"
  | "reconcile";

/** 状态 Module 接受的显式 mutation intent。 */
export type StateMutationIntent =
  | {
      kind: "content-transition";
      targetPhase: PhaseLabel;
      targetAiStatus: AiStatusLabel;
    }
  | {
      kind: "lifecycle-transition";
      targetPhase: PhaseLabel;
      targetAiStatus?: AiStatusLabel;
    }
  | { kind: "pause" }
  | { kind: "resume" }
  | { kind: "retry" }
  | { kind: "reconcile" };

/** 状态 mutation 被业务规则阻断时的稳定原因。 */
export type BlockedReason =
  | "AI_PAUSED"
  | "HEAD_SHA_MISMATCH"
  | "INVALID_CURRENT_STATE"
  | "INVALID_TRANSITION";

/** 状态 mutation 决策所需的当前事实和显式意图。 */
export interface StateMutationInput {
  labels: string[];
  intent: StateMutationIntent;
  expectedHeadSha?: string | null;
  currentHeadSha?: string | null;
}

/** 状态 mutation 的确定性标签计划。 */
export interface StateMutationDecision {
  mutationAllowed: boolean;
  blockedReason: BlockedReason | null;
  labelsToRemove: string[];
  labelsToAdd: string[];
}
```

### Task 0: 人工清理 Gate

**Files:**

- Verify only: GitHub repository labels and open/closed Issues

- [ ] **Step 1: 列出旧暂停标签的全部使用位置**

Run:

```bash
gh issue list \
  --repo hexqi/ai-article-hub \
  --state all \
  --label "AI：已暂停" \
  --limit 1000 \
  --json number,title,url,labels
```

Expected: 输出 `[]`。若非空，停止代码实施，由维护者按设计规格第 10 节逐项选择 AI 工作状态；不要自动推断或批量改写。

- [ ] **Step 2: 确认旧标签已从仓库标签目录删除**

Run:

```bash
gh label list --repo hexqi/ai-article-hub --limit 1000 --json name
```

Expected: 结果中不存在 `AI：已暂停`，并存在 `AI执行：人工暂停`。若仓库尚未创建新标签或尚未删除旧标签，交由维护者完成后再继续。

### Task 1: Pause Tracer Bullet

**Files:**

- Modify: `tests/unit/state-machine.test.ts`
- Modify: `src/domain/state-machine.ts`

- [ ] **Step 1: 用新 pause 行为替换旧暂停测试**

保留 Head SHA 和 inactive cleanup 的既有测试，但给输入加入显式 intent；删除旧
`AI：已暂停` 测试。新增：

```ts
test("人工暂停保留等待人工状态并增加暂停信号", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：等待人工"],
    intent: { kind: "pause" }
  });

  expect(decision).toMatchObject({
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: [],
    labelsToAdd: ["AI执行：人工暂停"]
  });
});
```

将既有 inactive cleanup 输入改成：

```ts
{
  labels: ["阶段：已终止", "AI：处理中", "AI：旧状态", "AI：等待人工", "其他"],
  intent: { kind: "reconcile" }
}
```

同时把该测试的标签断言改为集合语义，避免绑定顺序：

```ts
expect(decision.mutationAllowed).toBe(true);
expect(decision.labelsToRemove).toHaveLength(3);
expect(decision.labelsToRemove).toEqual(
  expect.arrayContaining(["AI：处理中", "AI：旧状态", "AI：等待人工"])
);
expect(decision.labelsToAdd).toEqual([]);
```

将既有 Head SHA 输入改成：

```ts
{
  labels: ["阶段：审核", "AI：处理中"],
  intent: {
    kind: "content-transition",
    targetPhase: "阶段：审核",
    targetAiStatus: "AI：等待人工"
  },
  expectedHeadSha: "a".repeat(40),
  currentHeadSha: "b".repeat(40)
}
```

- [ ] **Step 2: 运行定向测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: FAIL；新输入的 `intent` 尚未驱动暂停标签计划。

- [ ] **Step 3: 建立状态目录、显式 intent 和最小 pause 实现**

在 `src/domain/state-machine.ts` 中用“目标 domain Interface”替换旧类型，并加入：

```ts
/** 不再承载 AI 工作的业务阶段集合。 */
export const AI_INACTIVE_PHASES = new Set<PhaseLabel>([
  "阶段：待发布",
  "阶段：已发布",
  "阶段：已终止"
]);

/**
 * 判断字符串是否为已知业务阶段标签。
 *
 * @param value 待判断的标签。
 * @returns 已知阶段标签返回 true。
 */
export function isPhaseLabel(value: string): value is PhaseLabel {
  return PHASE_LABELS.includes(value as PhaseLabel);
}

/**
 * 判断字符串是否为已知 AI 工作状态。
 *
 * @param value 待判断的标签。
 * @returns 已知 AI 工作状态返回 true。
 */
export function isAiStatusLabel(value: string): value is AiStatusLabel {
  return AI_STATUS_LABELS.includes(value as AiStatusLabel);
}

const mutationIntentKinds = new Set<string>([
  "content-transition",
  "lifecycle-transition",
  "pause",
  "resume",
  "retry",
  "reconcile"
]);

/**
 * 判断字符串是否为已知 mutation intent。
 *
 * @param value 待判断的 intent。
 * @returns 已知 intent 返回 true。
 */
export function isMutationIntentKind(value: string): value is MutationIntentKind {
  return mutationIntentKinds.has(value);
}
```

加入当前状态读取：

```ts
interface CurrentState {
  phase: PhaseLabel;
  aiStatus: AiStatusLabel | null;
  paused: boolean;
}

function readCurrentState(
  labels: string[],
  intent: StateMutationIntent
): CurrentState | null {
  const phases = labels.filter(isPhaseLabel);
  const unknownPhase = labels.some(
    (label) => label.startsWith("阶段：") && !isPhaseLabel(label)
  );

  if (phases.length !== 1 || unknownPhase) {
    return null;
  }

  const phase = phases[0];
  const aiStatuses = labels.filter(isAiStatusLabel);
  const unknownAi = labels.some(
    (label) => label.startsWith("AI：") && !isAiStatusLabel(label)
  );
  const inactiveCleanup =
    AI_INACTIVE_PHASES.has(phase) &&
    (intent.kind === "reconcile" || intent.kind === "lifecycle-transition");

  if (!AI_INACTIVE_PHASES.has(phase)) {
    if (aiStatuses.length !== 1 || unknownAi) {
      return null;
    }
  } else if (!inactiveCleanup && (aiStatuses.length > 0 || unknownAi)) {
    return null;
  }

  return {
    phase,
    aiStatus: aiStatuses.length === 1 ? aiStatuses[0] : null,
    paused: labels.includes(MANUAL_PAUSE_LABEL)
  };
}
```

将主函数改成最小可用分派：

```ts
/**
 * 根据当前标签、mutation intent 和可选 Head SHA 生成确定性标签计划。
 *
 * @param input 当前标签、显式 intent 与可选 Head SHA guard。
 * @returns 是否允许 mutation、稳定阻断码及幂等标签增删计划。
 */
export function decideStateMutation(
  input: StateMutationInput
): StateMutationDecision {
  const current = readCurrentState(input.labels, input.intent);

  if (!current) {
    return blocked("INVALID_CURRENT_STATE");
  }

  if (input.intent.kind === "pause") {
    if (AI_INACTIVE_PHASES.has(current.phase)) {
      return blocked("INVALID_TRANSITION");
    }

    return allowed([], [MANUAL_PAUSE_LABEL]);
  }

  if (input.intent.kind === "reconcile" && AI_INACTIVE_PHASES.has(current.phase)) {
    return allowed(
      input.labels.filter(
        (label) =>
          label.startsWith("AI：") || label === MANUAL_PAUSE_LABEL
      )
    );
  }

  if (
    input.intent.kind === "content-transition" &&
    input.expectedHeadSha &&
    input.currentHeadSha &&
    input.expectedHeadSha !== input.currentHeadSha
  ) {
    return blocked("HEAD_SHA_MISMATCH");
  }

  return blocked("INVALID_TRANSITION");
}

function allowed(
  labelsToRemove: string[] = [],
  labelsToAdd: string[] = []
): StateMutationDecision {
  return {
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove,
    labelsToAdd
  };
}

function blocked(reason: BlockedReason): StateMutationDecision {
  return {
    mutationAllowed: false,
    blockedReason: reason,
    labelsToRemove: [],
    labelsToAdd: []
  };
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 5: 写重复暂停 no-op 失败测试**

```ts
test("重复暂停返回成功 no-op", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：等待人工", "AI执行：人工暂停"],
    intent: { kind: "pause" }
  });

  expect(decision).toMatchObject({
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: [],
    labelsToAdd: []
  });
});
```

- [ ] **Step 6: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "重复暂停返回成功 no-op"
```

Expected: FAIL，当前实现会重复规划暂停标签。

- [ ] **Step 7: 在 pause 分支中加入幂等判断**

```ts
if (current.paused) {
  return allowed();
}
```

该判断放在 inactive phase 校验之后、AI 状态转换之前。

- [ ] **Step 8: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 9: Commit**

```bash
git add src/domain/state-machine.ts tests/unit/state-machine.test.ts
git commit -m "feat: add manual pause state intent"
```

### Task 2: Resume

**Files:**

- Modify: `tests/unit/state-machine.test.ts`
- Modify: `src/domain/state-machine.ts`

- [ ] **Step 1: 写 resume 失败测试**

```ts
test("恢复只移除人工暂停信号", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：等待人工", "AI执行：人工暂停"],
    intent: { kind: "resume" }
  });

  expect(decision).toMatchObject({
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: ["AI执行：人工暂停"],
    labelsToAdd: []
  });
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "恢复只移除人工暂停信号"
```

Expected: FAIL，`resume` 尚未实现。

- [ ] **Step 3: 写最小 resume 分支**

在 `pause` 分支之后加入：

```ts
if (input.intent.kind === "resume") {
  if (AI_INACTIVE_PHASES.has(current.phase)) {
    return blocked("INVALID_TRANSITION");
  }

  return allowed([MANUAL_PAUSE_LABEL]);
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 5: 写暂停中的处理中状态不可恢复测试**

```ts
test("恢复拒绝仍标记为处理中的暂停状态", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：处理中", "AI执行：人工暂停"],
    intent: { kind: "resume" }
  });

  expect(decision).toMatchObject({
    mutationAllowed: false,
    blockedReason: "INVALID_CURRENT_STATE"
  });
});
```

- [ ] **Step 6: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "恢复拒绝仍标记为处理中的暂停状态"
```

Expected: FAIL，当前实现会直接移除暂停信号。

- [ ] **Step 7: 在 resume 分支加入处理中校验**

```ts
if (current.aiStatus === "AI：处理中") {
  return blocked("INVALID_CURRENT_STATE");
}
```

- [ ] **Step 8: 写重复恢复 no-op 失败测试**

```ts
test("重复恢复返回成功 no-op", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：等待人工"],
    intent: { kind: "resume" }
  });

  expect(decision).toMatchObject({
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: [],
    labelsToAdd: []
  });
});
```

- [ ] **Step 9: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "重复恢复返回成功 no-op"
```

Expected: FAIL，当前实现会规划移除不存在的暂停标签。

- [ ] **Step 10: 在 resume 分支加入幂等判断**

```ts
if (!current.paused) {
  return allowed();
}
```

该判断放在 inactive phase 校验之后、处理中校验之前。

- [ ] **Step 11: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 12: Commit**

```bash
git add src/domain/state-machine.ts tests/unit/state-machine.test.ts
git commit -m "feat: resume manually paused work"
```

### Task 3: Pause Processing Work Safely

**Files:**

- Modify: `tests/unit/state-machine.test.ts`
- Modify: `src/domain/state-machine.ts`

- [ ] **Step 1: 写处理中暂停失败测试**

```ts
test("暂停处理中任务时退回等待执行", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：处理中"],
    intent: { kind: "pause" }
  });

  expect(decision.mutationAllowed).toBe(true);
  expect(decision.labelsToRemove).toEqual(
    expect.arrayContaining(["AI：处理中"])
  );
  expect(decision.labelsToAdd).toEqual(
    expect.arrayContaining(["AI：等待执行", "AI执行：人工暂停"])
  );
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "暂停处理中任务时退回等待执行"
```

Expected: FAIL，当前实现只增加暂停标签。

- [ ] **Step 3: 扩展 pause 分支**

将 pause 分支的最终 return 改成：

```ts
if (current.aiStatus === "AI：处理中") {
  return allowed(
    ["AI：处理中"],
    ["AI：等待执行", MANUAL_PAUSE_LABEL]
  );
}

return allowed([], [MANUAL_PAUSE_LABEL]);
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/domain/state-machine.ts tests/unit/state-machine.test.ts
git commit -m "feat: release processing claim on pause"
```

### Task 4: Content Transition and Pause Guard

**Files:**

- Modify: `tests/unit/state-machine.test.ts`
- Modify: `src/domain/state-machine.ts`

- [ ] **Step 1: 写暂停阻断内容推进测试**

```ts
test("人工暂停优先阻断内容状态推进", () => {
  const decision = decideStateMutation({
    labels: ["阶段：策划", "AI：等待人工", "AI执行：人工暂停"],
    intent: {
      kind: "content-transition",
      targetPhase: "阶段：写作",
      targetAiStatus: "AI：等待执行"
    }
  });

  expect(decision).toMatchObject({
    mutationAllowed: false,
    blockedReason: "AI_PAUSED",
    labelsToRemove: [],
    labelsToAdd: []
  });
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "人工暂停优先阻断内容状态推进"
```

Expected: FAIL，当前返回 `INVALID_TRANSITION`。

- [ ] **Step 3: 在 Head SHA guard 前加入 pause guard**

```ts
if (
  current.paused &&
  (input.intent.kind === "content-transition" ||
    input.intent.kind === "retry")
) {
  return blocked("AI_PAUSED");
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 5: 写允许 content transition 的失败测试**

```ts
test("批准写作计划时从策划进入写作等待执行", () => {
  const decision = decideStateMutation({
    labels: ["阶段：策划", "AI：等待人工"],
    intent: {
      kind: "content-transition",
      targetPhase: "阶段：写作",
      targetAiStatus: "AI：等待执行"
    }
  });

  expect(decision.mutationAllowed).toBe(true);
  expect(decision.labelsToRemove).toEqual(
    expect.arrayContaining(["阶段：策划", "AI：等待人工"])
  );
  expect(decision.labelsToAdd).toEqual(
    expect.arrayContaining(["阶段：写作", "AI：等待执行"])
  );
});
```

- [ ] **Step 6: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "批准写作计划时从策划进入写作等待执行"
```

Expected: FAIL，content transition 尚未生成标签计划。

- [ ] **Step 7: 加入阶段边和通用目标状态规划**

```ts
function isAllowedContentTransition(
  current: PhaseLabel,
  target: PhaseLabel
): boolean {
  return current === "阶段：策划" && target === "阶段：写作";
}

function planTargetState(
  labels: string[],
  targetPhase: PhaseLabel,
  targetAiStatus: AiStatusLabel | null,
  keepPause: boolean
): StateMutationDecision {
  const labelsToRemove = labels.filter((label) => {
    if (isPhaseLabel(label)) {
      return label !== targetPhase;
    }

    if (label.startsWith("AI：")) {
      return label !== targetAiStatus;
    }

    return label === MANUAL_PAUSE_LABEL && !keepPause;
  });
  const targets = [
    targetPhase,
    ...(targetAiStatus ? [targetAiStatus] : []),
    ...(keepPause ? [MANUAL_PAUSE_LABEL] : [])
  ];
  const labelsToAdd = targets.filter((label) => !labels.includes(label));

  return allowed(labelsToRemove, labelsToAdd);
}
```

在 Head SHA guard 后加入：

```ts
if (input.intent.kind === "content-transition") {
  if (
    AI_INACTIVE_PHASES.has(input.intent.targetPhase) ||
    !isAllowedContentTransition(current.phase, input.intent.targetPhase)
  ) {
    return blocked("INVALID_TRANSITION");
  }

  return planTargetState(
    input.labels,
    input.intent.targetPhase,
    input.intent.targetAiStatus,
    false
  );
}
```

- [ ] **Step 8: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 9: 写选题批准阶段边的失败测试**

```ts
test("批准选题时从选题进入策划等待执行", () => {
  const decision = decideStateMutation({
    labels: ["阶段：选题", "AI：等待人工"],
    intent: {
      kind: "content-transition",
      targetPhase: "阶段：策划",
      targetAiStatus: "AI：等待执行"
    }
  });

  expect(decision.mutationAllowed).toBe(true);
  expect(decision.labelsToAdd).toEqual(
    expect.arrayContaining(["阶段：策划", "AI：等待执行"])
  );
});
```

- [ ] **Step 10: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "批准选题时从选题进入策划等待执行"
```

Expected: FAIL。

- [ ] **Step 11: 加入选题到策划阶段边**

将 `isAllowedContentTransition` 改为：

```ts
return (
  (current === "阶段：选题" && target === "阶段：策划") ||
  (current === "阶段：策划" && target === "阶段：写作")
);
```

- [ ] **Step 12: 写同阶段认领的失败测试**

```ts
test("执行器认领时允许同阶段进入处理中", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：等待执行"],
    intent: {
      kind: "content-transition",
      targetPhase: "阶段：写作",
      targetAiStatus: "AI：处理中"
    }
  });

  expect(decision).toMatchObject({
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: ["AI：等待执行"],
    labelsToAdd: ["AI：处理中"]
  });
});
```

- [ ] **Step 13: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "执行器认领时允许同阶段进入处理中"
```

Expected: FAIL。

- [ ] **Step 14: 加入同阶段 AI 状态转换**

将 `isAllowedContentTransition` 改为最终形式：

```ts
return (
  current === target ||
  (current === "阶段：选题" && target === "阶段：策划") ||
  (current === "阶段：策划" && target === "阶段：写作")
);
```

- [ ] **Step 15: 运行 content transition tests 确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 16: 写未列出阶段边的测试**

```ts
test("内容 intent 拒绝未列出的阶段边", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：等待人工"],
    intent: {
      kind: "content-transition",
      targetPhase: "阶段：选题",
      targetAiStatus: "AI：等待人工"
    }
  });

  expect(decision).toMatchObject({
    mutationAllowed: false,
    blockedReason: "INVALID_TRANSITION"
  });
});
```

- [ ] **Step 17: 运行测试确认已由最小实现覆盖**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "内容 intent 拒绝未列出的阶段边"
```

Expected: PASS；这是新增合法边实现后的边界测试，不为旧行为立墓碑。

- [ ] **Step 18: Commit**

```bash
git add src/domain/state-machine.ts tests/unit/state-machine.test.ts
git commit -m "feat: centralize content state transitions"
```

### Task 5: Lifecycle Transition During Pause

**Files:**

- Modify: `tests/unit/state-machine.test.ts`
- Modify: `src/domain/state-machine.ts`

- [ ] **Step 1: 写暂停期间进入 inactive 阶段的失败测试**

```ts
test("暂停期间仍允许合并进入待发布并清理 AI 状态", () => {
  const decision = decideStateMutation({
    labels: ["阶段：审核", "AI：等待人工", "AI执行：人工暂停"],
    intent: {
      kind: "lifecycle-transition",
      targetPhase: "阶段：待发布"
    }
  });

  expect(decision.mutationAllowed).toBe(true);
  expect(decision.labelsToRemove).toEqual(
    expect.arrayContaining([
      "阶段：审核",
      "AI：等待人工",
      "AI执行：人工暂停"
    ])
  );
  expect(decision.labelsToAdd).toEqual(["阶段：待发布"]);
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "暂停期间仍允许合并进入待发布并清理 AI 状态"
```

Expected: FAIL，lifecycle transition 尚未实现。

- [ ] **Step 3: 加入明确 lifecycle 阶段边**

```ts
function isAllowedLifecycleTransition(
  current: PhaseLabel,
  target: PhaseLabel
): boolean {
  return current === "阶段：审核" && target === "阶段：待发布";
}
```

加入 lifecycle 分支：

```ts
if (input.intent.kind === "lifecycle-transition") {
  if (!isAllowedLifecycleTransition(current.phase, input.intent.targetPhase)) {
    return blocked("INVALID_TRANSITION");
  }

  if (AI_INACTIVE_PHASES.has(input.intent.targetPhase)) {
    return planTargetState(input.labels, input.intent.targetPhase, null, false);
  }

  if (!input.intent.targetAiStatus) {
    return blocked("INVALID_TRANSITION");
  }

  return planTargetState(
    input.labels,
    input.intent.targetPhase,
    input.intent.targetAiStatus,
    current.paused
  );
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 5: 写 active lifecycle 保留暂停信号的失败测试**

```ts
test("暂停期间回到写作阶段时保持人工暂停", () => {
  const decision = decideStateMutation({
    labels: ["阶段：审核", "AI：等待人工", "AI执行：人工暂停"],
    intent: {
      kind: "lifecycle-transition",
      targetPhase: "阶段：写作",
      targetAiStatus: "AI：等待人工"
    }
  });

  expect(decision.mutationAllowed).toBe(true);
  expect(decision.labelsToAdd).toEqual(
    expect.arrayContaining(["阶段：写作"])
  );
  expect(decision.labelsToRemove).not.toContain("AI执行：人工暂停");
});
```

- [ ] **Step 6: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "暂停期间回到写作阶段时保持人工暂停"
```

Expected: FAIL，尚未加入 `审核 → 写作`。

- [ ] **Step 7: 加入审核回写作阶段边**

将 helper 改为：

```ts
return (
  (current === "阶段：审核" && target === "阶段：写作") ||
  (current === "阶段：审核" && target === "阶段：待发布")
);
```

- [ ] **Step 8: 写 Ready for review 阶段边测试**

```ts
test("Ready for review 时从写作进入审核", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：等待人工"],
    intent: {
      kind: "lifecycle-transition",
      targetPhase: "阶段：审核",
      targetAiStatus: "AI：等待人工"
    }
  });

  expect(decision.mutationAllowed).toBe(true);
  expect(decision.labelsToAdd).toContain("阶段：审核");
});
```

- [ ] **Step 9: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "Ready for review 时从写作进入审核"
```

Expected: FAIL。

- [ ] **Step 10: 加入写作到审核阶段边**

在 helper 的返回条件中加入：

```ts
(current === "阶段：写作" && target === "阶段：审核")
```

- [ ] **Step 11: 写活跃阶段终止测试**

```ts
test("活跃阶段可以进入已终止并清理 AI 状态", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：等待人工"],
    intent: {
      kind: "lifecycle-transition",
      targetPhase: "阶段：已终止"
    }
  });

  expect(decision.mutationAllowed).toBe(true);
  expect(decision.labelsToAdd).toEqual(["阶段：已终止"]);
  expect(decision.labelsToRemove).toEqual(
    expect.arrayContaining(["阶段：写作", "AI：等待人工"])
  );
});
```

- [ ] **Step 12: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "活跃阶段可以进入已终止并清理 AI 状态"
```

Expected: FAIL。

- [ ] **Step 13: 加入任一活跃阶段到已终止**

在 helper 顶部加入：

```ts
if (!AI_INACTIVE_PHASES.has(current) && target === "阶段：已终止") {
  return true;
}
```

- [ ] **Step 14: 写待发布到已发布测试**

```ts
test("发布完成时从待发布进入已发布", () => {
  const decision = decideStateMutation({
    labels: ["阶段：待发布"],
    intent: {
      kind: "lifecycle-transition",
      targetPhase: "阶段：已发布"
    }
  });

  expect(decision).toMatchObject({
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: ["阶段：待发布"],
    labelsToAdd: ["阶段：已发布"]
  });
});
```

- [ ] **Step 15: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "发布完成时从待发布进入已发布"
```

Expected: FAIL。

- [ ] **Step 16: 加入待发布到已发布阶段边**

在 helper 返回条件中加入：

```ts
(current === "阶段：待发布" && target === "阶段：已发布")
```

- [ ] **Step 17: 写已终止 reopen 测试**

```ts
test("已终止 Issue reopen 后回到策划等待人工", () => {
  const decision = decideStateMutation({
    labels: ["阶段：已终止"],
    intent: {
      kind: "lifecycle-transition",
      targetPhase: "阶段：策划",
      targetAiStatus: "AI：等待人工"
    }
  });

  expect(decision.mutationAllowed).toBe(true);
  expect(decision.labelsToAdd).toEqual(
    expect.arrayContaining(["阶段：策划", "AI：等待人工"])
  );
});
```

- [ ] **Step 18: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "已终止 Issue reopen 后回到策划等待人工"
```

Expected: FAIL。

- [ ] **Step 19: 加入已终止到策划阶段边**

在 helper 返回条件中加入：

```ts
(current === "阶段：已终止" && target === "阶段：策划")
```

helper 的最终返回条件应完整为：

```ts
if (!AI_INACTIVE_PHASES.has(current) && target === "阶段：已终止") {
  return true;
}

return (
  (current === "阶段：写作" && target === "阶段：审核") ||
  (current === "阶段：审核" && target === "阶段：写作") ||
  (current === "阶段：审核" && target === "阶段：待发布") ||
  (current === "阶段：待发布" && target === "阶段：已发布") ||
  (current === "阶段：已终止" && target === "阶段：策划")
);
```

- [ ] **Step 20: 运行 lifecycle tests 确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 21: Commit**

```bash
git add src/domain/state-machine.ts tests/unit/state-machine.test.ts
git commit -m "feat: allow lifecycle transitions while paused"
```

### Task 6: Retry

**Files:**

- Modify: `tests/unit/state-machine.test.ts`
- Modify: `src/domain/state-machine.ts`

- [ ] **Step 1: 写失败状态重试测试**

```ts
test("重试只把失败状态改为等待执行", () => {
  const allowedDecision = decideStateMutation({
    labels: ["阶段：审核", "AI：失败"],
    intent: { kind: "retry" }
  });
  const rejectedDecision = decideStateMutation({
    labels: ["阶段：审核", "AI：等待人工"],
    intent: { kind: "retry" }
  });

  expect(allowedDecision).toMatchObject({
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: ["AI：失败"],
    labelsToAdd: ["AI：等待执行"]
  });
  expect(rejectedDecision).toMatchObject({
    mutationAllowed: false,
    blockedReason: "INVALID_TRANSITION"
  });
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "重试只把失败状态改为等待执行"
```

Expected: FAIL。

- [ ] **Step 3: 加入 retry 分支**

```ts
if (input.intent.kind === "retry") {
  if (
    AI_INACTIVE_PHASES.has(current.phase) ||
    current.aiStatus !== "AI：失败"
  ) {
    return blocked("INVALID_TRANSITION");
  }

  return allowed(["AI：失败"], ["AI：等待执行"]);
}
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 5: 写暂停优先阻断重试测试**

```ts
test("人工暂停时重试保持阻断", () => {
  const decision = decideStateMutation({
    labels: ["阶段：审核", "AI：失败", "AI执行：人工暂停"],
    intent: { kind: "retry" }
  });

  expect(decision).toMatchObject({
    mutationAllowed: false,
    blockedReason: "AI_PAUSED"
  });
});
```

- [ ] **Step 6: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "人工暂停时重试保持阻断"
```

Expected: PASS，既有 pause guard 已覆盖。

- [ ] **Step 7: Commit**

```bash
git add src/domain/state-machine.ts tests/unit/state-machine.test.ts
git commit -m "feat: add explicit failed-state retry"
```

### Task 7: Guard Priority and Invalid Current State

**Files:**

- Modify: `tests/unit/state-machine.test.ts`
- Modify: `src/domain/state-machine.ts`

- [ ] **Step 1: 写 pause 优先于 Head SHA 的测试**

```ts
test("人工暂停优先于 Head SHA mismatch", () => {
  const decision = decideStateMutation({
    labels: ["阶段：审核", "AI：等待人工", "AI执行：人工暂停"],
    intent: {
      kind: "content-transition",
      targetPhase: "阶段：审核",
      targetAiStatus: "AI：等待执行"
    },
    expectedHeadSha: "a".repeat(40),
    currentHeadSha: "b".repeat(40)
  });

  expect(decision).toMatchObject({
    mutationAllowed: false,
    blockedReason: "AI_PAUSED"
  });
});
```

- [ ] **Step 2: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "人工暂停优先于 Head SHA mismatch"
```

Expected: PASS；若失败，将 pause guard 移到 Head SHA guard 之前，不改变其他分支。

- [ ] **Step 3: 写非法当前状态测试**

```ts
test("活跃阶段存在多个 AI 工作状态时拒绝 mutation", () => {
  const decision = decideStateMutation({
    labels: ["阶段：写作", "AI：处理中", "AI：等待人工"],
    intent: { kind: "pause" }
  });

  expect(decision).toMatchObject({
    mutationAllowed: false,
    blockedReason: "INVALID_CURRENT_STATE",
    labelsToRemove: [],
    labelsToAdd: []
  });
});
```

- [ ] **Step 4: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "活跃阶段存在多个 AI 工作状态时拒绝 mutation"
```

Expected: PASS。

- [ ] **Step 5: 写 reconcile no-op 测试**

```ts
test("合法活跃状态 reconcile 返回 no-op", () => {
  const decision = decideStateMutation({
    labels: ["阶段：策划", "AI：等待人工"],
    intent: { kind: "reconcile" }
  });

  expect(decision).toMatchObject({
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: [],
    labelsToAdd: []
  });
});
```

- [ ] **Step 6: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts -t "合法活跃状态 reconcile 返回 no-op"
```

Expected: FAIL，当前 reconcile 只处理 inactive cleanup。

- [ ] **Step 7: 完成 reconcile 分支**

将 reconcile 分支替换为：

```ts
if (input.intent.kind === "reconcile") {
  if (AI_INACTIVE_PHASES.has(current.phase)) {
    return allowed(
      input.labels.filter(
        (label) =>
          label.startsWith("AI：") || label === MANUAL_PAUSE_LABEL
      )
    );
  }

  return allowed();
}
```

- [ ] **Step 8: 运行 domain 测试确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 9: Commit**

```bash
git add src/domain/state-machine.ts tests/unit/state-machine.test.ts
git commit -m "feat: enforce state invariants and guard priority"
```

### Task 8: Explicit State Fixture Intent

**Files:**

- Create: `src/commands/state-input.ts`
- Modify: `src/commands/state.ts`
- Modify: `tests/fixtures/state-paused.json`
- Modify: `tests/fixtures/state-terminal.json`
- Modify: `tests/fixtures/state-head-mismatch.json`
- Modify: `tests/integration/plan-state-cli.test.ts`

- [ ] **Step 1: 更新 paused fixture 和 CLI 测试**

`tests/fixtures/state-paused.json`：

```json
{
  "labels": ["阶段：写作", "AI：等待人工", "AI执行：人工暂停"],
  "intent": "content-transition",
  "phase": "阶段：审核",
  "ai_state": "AI：等待人工",
  "expected_head_sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "current_head_sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

`tests/fixtures/state-terminal.json`：

```json
{
  "labels": ["阶段：已终止", "AI：处理中", "AI：等待人工", "other-label"],
  "intent": "reconcile",
  "expected_head_sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "current_head_sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

`tests/fixtures/state-head-mismatch.json`：

```json
{
  "labels": ["阶段：审核", "AI：处理中"],
  "intent": "content-transition",
  "phase": "阶段：审核",
  "ai_state": "AI：等待人工",
  "expected_head_sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "current_head_sha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
}
```

将 `state decide` integration test 保持为机器字段断言：

```ts
test("state decide 根据显式 intent 输出阻断决策", () => {
  const paused = runArticleHubCli([
    "state",
    "decide",
    "--state-file",
    pausedStatePath
  ]);

  expectSuccessfulEnvelope(paused, "article-hub.state.decide", {
    decision: {
      mutation_allowed: false,
      blocked_reason: "AI_PAUSED",
      labels_to_remove: [],
      labels_to_add: []
    }
  });
});
```

- [ ] **Step 2: 运行 integration test 确认 RED**

Run:

```bash
pnpm test -- tests/integration/plan-state-cli.test.ts
```

Expected: FAIL，`state.ts` 尚未读取 intent 和目标字段。

- [ ] **Step 3: 新建共享 wire Adapter**

`src/commands/state-input.ts`：

```ts
import {
  type AiStatusLabel,
  type MutationIntentKind,
  type PhaseLabel,
  type StateMutationIntent,
  AI_INACTIVE_PHASES,
  isAiStatusLabel,
  isMutationIntentKind,
  isPhaseLabel
} from "../domain/state-machine.js";
import { ArticleHubError } from "../infrastructure/errors.js";

/** fixture 与 CLI 共用的未信任状态 intent 字段。 */
export interface StateIntentWireInput {
  intent: unknown;
  phase?: unknown;
  aiState?: unknown;
}

/**
 * 将 fixture 或 CLI 的 wire 字段转换为 domain mutation intent。
 *
 * @param input 未信任的 intent、目标阶段和目标 AI 状态。
 * @param allowedKinds 当前 command 允许的 intent 集合。
 * @returns 已校验的 domain intent。
 * @throws ArticleHubError 当 intent 或目标状态缺失、未知或组合无效时抛出。
 */
export function readStateMutationIntent(
  input: StateIntentWireInput,
  allowedKinds: ReadonlySet<MutationIntentKind>
): StateMutationIntent {
  if (
    typeof input.intent !== "string" ||
    !isMutationIntentKind(input.intent) ||
    !allowedKinds.has(input.intent)
  ) {
    throw new ArticleHubError("INVALID_STATE", "未知 mutation intent", 2);
  }

  const kind = input.intent;
  if (kind === "pause" || kind === "resume" || kind === "retry" || kind === "reconcile") {
    if (input.phase !== undefined || input.aiState !== undefined) {
      throw new ArticleHubError("INVALID_STATE", "当前 intent 不接受目标状态", 2);
    }

    return { kind };
  }

  const targetPhase = readPhase(input.phase);
  const targetAiStatus =
    input.aiState === undefined ? undefined : readAiStatus(input.aiState);

  if (!AI_INACTIVE_PHASES.has(targetPhase) && !targetAiStatus) {
    throw new ArticleHubError("INVALID_STATE", "活跃目标阶段缺少 AI 状态", 2);
  }

  if (kind === "content-transition") {
    if (!targetAiStatus) {
      throw new ArticleHubError("INVALID_STATE", "内容状态迁移缺少 AI 状态", 2);
    }

    return { kind, targetPhase, targetAiStatus };
  }

  return targetAiStatus
    ? { kind, targetPhase, targetAiStatus }
    : { kind, targetPhase };
}

function readPhase(value: unknown): PhaseLabel {
  if (typeof value !== "string" || !isPhaseLabel(value)) {
    throw new ArticleHubError("INVALID_STATE", "未知阶段标签", 2);
  }

  return value;
}

function readAiStatus(value: unknown): AiStatusLabel {
  if (typeof value !== "string" || !isAiStatusLabel(value)) {
    throw new ArticleHubError("INVALID_STATE", "未知 AI 状态标签", 2);
  }

  return value;
}
```

- [ ] **Step 4: 让 state command 使用共享 Adapter**

在 `src/commands/state.ts` 加入：

```ts
import { readStateMutationIntent } from "./state-input.js";
```

将 `decideState` 的 JSDoc 更新为：

```ts
/**
 * 读取状态 fixture，并通过 domain Module 输出确定性 mutation 决策。
 *
 * @param options 状态文件路径和 dry-run 标记。
 * @returns 版本化状态决策 envelope。
 * @throws ArticleHubError 当状态文件缺失、JSON 无效或 intent 字段无效时抛出。
 */
```

扩展 `StateFileDocument`：

```ts
interface StateFileDocument {
  labels?: unknown;
  intent?: unknown;
  phase?: unknown;
  ai_state?: unknown;
  expected_head_sha?: unknown;
  current_head_sha?: unknown;
}
```

在 `decideState` 中加入：

```ts
const intent = readStateMutationIntent(
  {
    intent: state.intent,
    phase: state.phase,
    aiState: state.ai_state
  },
  new Set([
    "content-transition",
    "lifecycle-transition",
    "pause",
    "resume",
    "retry",
    "reconcile"
  ])
);
```

并把 domain 调用改为：

```ts
const decision = decideStateMutation({
  labels: normalizeLabels(state.labels),
  intent,
  expectedHeadSha:
    typeof state.expected_head_sha === "string"
      ? state.expected_head_sha
      : null,
  currentHeadSha:
    typeof state.current_head_sha === "string"
      ? state.current_head_sha
      : null
});
```

- [ ] **Step 5: 运行测试确认 GREEN**

Run:

```bash
pnpm test -- tests/integration/plan-state-cli.test.ts tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add src/commands/state-input.ts src/commands/state.ts tests/fixtures/state-paused.json tests/fixtures/state-terminal.json tests/fixtures/state-head-mismatch.json tests/integration/plan-state-cli.test.ts
git commit -m "feat: require explicit state fixture intents"
```

### Task 9: Update Status Dry-run Uses Domain Decisions

**Files:**

- Modify: `src/cli.ts`
- Modify: `src/commands/update-status.ts`
- Modify: `tests/integration/update-status-cli.test.ts`

- [ ] **Step 1: 写 update-status pause dry-run integration test**

使用新暂停标签与显式 intent：

```ts
test("dry-run 阻断暂停期间的内容 mutation 且不规划 comment", async () => {
  const issueFile = await writeIssue([
    "阶段：写作",
    "AI：等待人工",
    "AI执行：人工暂停"
  ]);
  const result = runArticleHubCli([
    "--dry-run",
    "update-status",
    "--issue-file",
    issueFile,
    "--repository",
    "hexqi/ai-article-hub",
    "--intent",
    "content-transition",
    "--phase",
    "阶段：审核",
    "--ai-state",
    "AI：等待人工",
    "--comment",
    "blocked fixture comment"
  ]);

  expectSuccessfulEnvelope(result, "article-hub.update-status", {
    mutation_allowed: false,
    blocked_reason: "AI_PAUSED",
    labels_to_remove: [],
    labels_to_add: [],
    mutation_plan: {
      operations: []
    }
  });
});
```

给现有成功 dry-run 用例增加：

```ts
"--intent",
"content-transition",
```

- [ ] **Step 2: 运行 integration test 确认 RED**

Run:

```bash
pnpm test -- tests/integration/update-status-cli.test.ts
```

Expected: FAIL，CLI 尚不接受 `--intent`，command 仍有独立状态规则。

- [ ] **Step 3: 更新 CLI 参数解析**

将 `update-status` 分支改为读取：

```ts
const issueFile = readRequiredOption(parsed.args, "--issue-file");
const repository = readRequiredOption(parsed.args, "--repository");
const intent = readRequiredOption(parsed.args, "--intent");
const phase = readOptionalOption(parsed.args, "--phase");
const aiState = readOptionalOption(parsed.args, "--ai-state");
const expectedHeadSha = readOptionalOption(parsed.args, "--expected-head-sha");
const currentHeadSha = readOptionalOption(parsed.args, "--current-head-sha");
const comment = readOptionalOption(parsed.args, "--comment");

assertNoUnexpectedArgs(
  parsed.args,
  new Set([
    "--issue-file",
    "--repository",
    "--intent",
    "--phase",
    "--ai-state",
    "--expected-head-sha",
    "--current-head-sha",
    "--comment"
  ])
);
```

调用参数改为：

```ts
const envelope = await updateIssueStatus({
  issueFile,
  repository,
  intent,
  phase,
  aiState,
  expectedHeadSha,
  currentHeadSha,
  comment,
  dryRun: parsed.context.dryRun
});
```

- [ ] **Step 4: 删除 command 中重复状态目录并接入 domain**

将 `src/commands/update-status.ts` 的 domain/command imports 改为：

```ts
import { decideStateMutation } from "../domain/state-machine.js";
import { ArticleHubError } from "../infrastructure/errors.js";
import { runCommand } from "../infrastructure/process.js";
import { readStateMutationIntent } from "./state-input.js";
```

`UpdateIssueStatusOptions`：

```ts
/** update-status command 的输入参数。 */
export interface UpdateIssueStatusOptions {
  issueFile: string;
  repository: string;
  intent: string;
  phase?: string;
  aiState?: string;
  expectedHeadSha?: string;
  currentHeadSha?: string;
  comment?: string;
  dryRun: boolean;
}
```

将 `updateIssueStatus` 的 JSDoc 更新为：

```ts
/**
 * 根据显式 intent 规划并按需执行 Issue 状态 mutation。
 *
 * @param options Issue fixture、仓库、显式 intent、目标状态和 dry-run 标记。
 * @returns 版本化决策 envelope 与可审计 GitHub operation plan。
 * @throws ArticleHubError 当输入无效、远端状态读取失败或 GitHub mutation 失败时抛出。
 */
```

在 `updateIssueStatus` 中使用：

```ts
const intent = readStateMutationIntent(
  {
    intent: options.intent,
    phase: options.phase,
    aiState: options.aiState
  },
  new Set([
    "content-transition",
    "lifecycle-transition",
    "pause",
    "resume",
    "retry"
  ])
);
const decision = decideStateMutation({
  labels: currentLabels,
  intent,
  expectedHeadSha: options.expectedHeadSha,
  currentHeadSha: options.currentHeadSha
});
const hasLabelMutation =
  decision.labelsToRemove.length > 0 || decision.labelsToAdd.length > 0;
const operationComment =
  decision.mutationAllowed && hasLabelMutation ? options.comment : undefined;
const operations = decision.mutationAllowed && hasLabelMutation
  ? buildStatusOperations({
      issueNumber,
      repository: options.repository,
      labelsToRemove: decision.labelsToRemove,
      labelsToAdd: decision.labelsToAdd,
      comment: operationComment
    })
  : [];
```

仅在非 dry-run、允许 mutation 且存在标签变化时调用：

```ts
if (!options.dryRun && decision.mutationAllowed && hasLabelMutation) {
  await applyStatusOperations({
    issueNumber,
    repository: options.repository,
    labelsToRemove: decision.labelsToRemove,
    labelsToAdd: decision.labelsToAdd,
    comment: operationComment
  });
}
```

envelope 使用 domain decision：

```ts
return {
  ok: true,
  schema_version: "article-hub.update-status",
  dry_run: options.dryRun,
  issue: {
    number: issueNumber
  },
  mutation_allowed: decision.mutationAllowed,
  blocked_reason: decision.blockedReason,
  labels_to_remove: decision.labelsToRemove,
  labels_to_add: decision.labelsToAdd,
  mutation_plan: {
    operations
  }
};
```

删除 `update-status.ts` 内部的 `PhaseLabel`、`AiStatusLabel`、标签数组、inactive 集合、
`readPhase`、`readAiState` 和旧暂停分支。

- [ ] **Step 5: 运行 integration 与 domain tests 确认 GREEN**

Run:

```bash
pnpm test -- tests/integration/update-status-cli.test.ts tests/integration/plan-state-cli.test.ts tests/unit/state-machine.test.ts
```

Expected: PASS。

- [ ] **Step 6: 增加重复 pause 的 CLI no-op 测试**

```ts
test("重复 pause 不规划标签或评论 operation", async () => {
  const issueFile = await writeIssue([
    "阶段：写作",
    "AI：等待人工",
    "AI执行：人工暂停"
  ]);
  const result = runArticleHubCli([
    "--dry-run",
    "update-status",
    "--issue-file",
    issueFile,
    "--repository",
    "hexqi/ai-article-hub",
    "--intent",
    "pause",
    "--comment",
    "must remain a no-op"
  ]);

  expectSuccessfulEnvelope(result, "article-hub.update-status", {
    mutation_allowed: true,
    blocked_reason: null,
    labels_to_remove: [],
    labels_to_add: [],
    mutation_plan: {
      operations: []
    }
  });
});
```

- [ ] **Step 7: 运行 no-op integration test 确认 GREEN**

Run:

```bash
pnpm test -- tests/integration/update-status-cli.test.ts -t "重复 pause 不规划标签或评论 operation"
```

Expected: PASS。

- [ ] **Step 8: 增加同输入一致性测试**

在测试文件加入公开输出最小类型：

```ts
interface StateDecisionOutput {
  decision: {
    mutation_allowed: boolean;
    blocked_reason: string | null;
    labels_to_remove: string[];
    labels_to_add: string[];
  };
}

interface UpdateStatusDecisionOutput {
  mutation_allowed: boolean;
  blocked_reason: string | null;
  labels_to_remove: string[];
  labels_to_add: string[];
}
```

加入状态 fixture helper：

```ts
async function writeState(labels: string[]) {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-state-"));
  const stateFile = path.join(root, "state.json");

  await writeFile(
    stateFile,
    JSON.stringify({
      labels,
      intent: "pause"
    })
  );

  return stateFile;
}
```

新增完整测试：

```ts
test("state decide 与 update-status dry-run 共享同一状态决策", async () => {
  const labels = ["阶段：写作", "AI：等待人工"];
  const stateFile = await writeState(labels);
  const issueFile = await writeIssue(labels);
  const stateResult = runArticleHubCli([
    "state",
    "decide",
    "--state-file",
    stateFile
  ]);
  const updateResult = runArticleHubCli([
    "--dry-run",
    "update-status",
    "--issue-file",
    issueFile,
    "--repository",
    "hexqi/ai-article-hub",
    "--intent",
    "pause"
  ]);
  const stateOutput = expectSuccessfulEnvelope<StateDecisionOutput>(
    stateResult,
    "article-hub.state.decide"
  );
  const updateOutput =
    expectSuccessfulEnvelope<UpdateStatusDecisionOutput>(
      updateResult,
      "article-hub.update-status"
    );

  expect(updateOutput).toMatchObject({
    mutation_allowed: stateOutput.decision.mutation_allowed,
    blocked_reason: stateOutput.decision.blocked_reason
  });
  expect(new Set(updateOutput.labels_to_remove)).toEqual(
    new Set(stateOutput.decision.labels_to_remove)
  );
  expect(new Set(updateOutput.labels_to_add)).toEqual(
    new Set(stateOutput.decision.labels_to_add)
  );
});
```

- [ ] **Step 9: 运行一致性测试确认 GREEN**

Run:

```bash
pnpm test -- tests/integration/update-status-cli.test.ts
```

Expected: PASS。

- [ ] **Step 10: Commit**

```bash
git add src/cli.ts src/commands/update-status.ts tests/integration/update-status-cli.test.ts
git commit -m "refactor: route status updates through domain rules"
```

### Task 10: Non-dry-run Rechecks Latest GitHub Labels

**Files:**

- Create: `tests/support/fake-gh.ts`
- Modify: `tests/support/cli.ts`
- Modify: `tests/integration/update-status-cli.test.ts`
- Modify: `src/commands/update-status.ts`

- [ ] **Step 1: 允许 CLI 测试注入外部命令环境**

同步把 `runArticleHubCli` 的 `@param options` 改为“可选工作目录和子进程环境变量”。

将 `runArticleHubCli` options 扩展为：

```ts
export function runArticleHubCli(
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): CliResult {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: options.cwd ?? repositoryRoot,
    env: {
      ...process.env,
      ...options.env
    },
    encoding: "utf8"
  });
}
```

- [ ] **Step 2: 新建跨平台 fake gh helper**

`tests/support/fake-gh.ts`：

```ts
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/** fake `gh` 的子进程环境和结构化调用记录。 */
export interface FakeGh {
  env: NodeJS.ProcessEnv;
  readCalls(): Promise<string[][]>;
}

/**
 * 创建只支持 Issue 读取和调用记录的 fake `gh` 外部边界。
 *
 * @param issue GitHub `issue view --json number,labels` 的返回值。
 * @returns 可注入 CLI 子进程的环境变量和结构化调用读取函数。
 */
export async function createFakeGh(issue: unknown): Promise<FakeGh> {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-fake-gh-"));
  const binDir = path.join(root, "bin");
  const scriptPath = path.join(root, "fake-gh.mjs");
  const issuePath = path.join(root, "issue.json");
  const logPath = path.join(root, "calls.jsonl");

  await mkdir(binDir, { recursive: true });
  await writeFile(issuePath, JSON.stringify(issue), "utf8");
  await writeFile(
    scriptPath,
    [
      'import { appendFileSync, readFileSync } from "node:fs";',
      "const args = process.argv.slice(2);",
      'appendFileSync(process.env.FAKE_GH_LOG, `${JSON.stringify(args)}\\n`);',
      'if (args[0] === "issue" && args[1] === "view") {',
      '  process.stdout.write(readFileSync(process.env.FAKE_GH_ISSUE, "utf8"));',
      "  process.exit(0);",
      "}",
      "process.exit(0);"
    ].join("\n"),
    "utf8"
  );

  const unixPath = path.join(binDir, "gh");
  await writeFile(
    unixPath,
    `#!/bin/sh\nexec "${process.execPath}" "${scriptPath}" "$@"\n`,
    "utf8"
  );
  await chmod(unixPath, 0o755);
  await writeFile(
    path.join(binDir, "gh.cmd"),
    `@"${process.execPath}" "${scriptPath}" %*\r\n`,
    "utf8"
  );

  return {
    env: {
      PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ""}`,
      FAKE_GH_ISSUE: issuePath,
      FAKE_GH_LOG: logPath
    },
    async readCalls() {
      const raw = await readFile(logPath, "utf8").catch(() => "");
      return raw
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line) as string[]);
    }
  };
}
```

- [ ] **Step 3: 写最新远端暂停阻断且无写操作的 integration test**

```ts
test("非 dry-run 使用最新 GitHub 标签重新检查暂停", async () => {
  const issueFile = await writeIssue(["阶段：写作", "AI：等待人工"]);
  const fakeGh = await createFakeGh({
    number: 51,
    labels: [
      { name: "阶段：写作" },
      { name: "AI：等待人工" },
      { name: "AI执行：人工暂停" }
    ]
  });
  const result = runArticleHubCli(
    [
      "update-status",
      "--issue-file",
      issueFile,
      "--repository",
      "hexqi/ai-article-hub",
      "--intent",
      "content-transition",
      "--phase",
      "阶段：审核",
      "--ai-state",
      "AI：等待人工",
      "--comment",
      "must not be posted"
    ],
    { env: fakeGh.env }
  );

  expectSuccessfulEnvelope(result, "article-hub.update-status", {
    mutation_allowed: false,
    blocked_reason: "AI_PAUSED",
    mutation_plan: {
      operations: []
    }
  });
  const calls = await fakeGh.readCalls();
  expect(calls).toHaveLength(1);
  expect(calls[0]).toEqual(
    expect.arrayContaining(["issue", "view", "51", "number,labels"])
  );
  expect(calls.flat()).not.toContain("edit");
  expect(calls.flat()).not.toContain("comment");
});
```

- [ ] **Step 4: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/integration/update-status-cli.test.ts -t "非 dry-run 使用最新 GitHub 标签重新检查暂停"
```

Expected: FAIL，当前 command 先按 fixture 决策并执行 edit/comment。

- [ ] **Step 5: 写入前读取远端标签并重新决策**

在 `updateIssueStatus` 中把标签来源改为：

```ts
const fixtureLabels = normalizeLabels(issue.labels);
const currentLabels = options.dryRun
  ? fixtureLabels
  : await readLatestIssueLabels(issueNumber, options.repository);
```

新增：

```ts
async function readLatestIssueLabels(
  issueNumber: number,
  repository: string
): Promise<string[]> {
  const raw = await runCommand(
    "gh",
    [
      "issue",
      "view",
      String(issueNumber),
      "--repo",
      repository,
      "--json",
      "number,labels"
    ],
    { errorCode: "GITHUB_COMMAND_FAILED" }
  );

  try {
    const document = JSON.parse(raw) as IssueDocument;
    return normalizeLabels(document.labels);
  } catch {
    throw new ArticleHubError(
      "GITHUB_COMMAND_FAILED",
      "GitHub Issue 输出不是有效 JSON"
    );
  }
}
```

确保 comment 仍只在 `decision.mutationAllowed` 时进入 plan 和执行路径。

- [ ] **Step 6: 运行 integration test 确认 GREEN**

Run:

```bash
pnpm test -- tests/integration/update-status-cli.test.ts
```

Expected: PASS；fake `gh` 调用只有一次只读 `issue view`。

- [ ] **Step 7: Commit**

```bash
git add src/commands/update-status.ts tests/support/cli.ts tests/support/fake-gh.ts tests/integration/update-status-cli.test.ts
git commit -m "fix: recheck remote pause before status mutation"
```

### Task 11: Complete Fixed Command Parsing

**Files:**

- Modify: `src/domain/command-parser.ts`
- Modify: `src/commands/inspect-issue.ts`
- Modify: `tests/unit/command-parser.test.ts`
- Modify: `tests/integration/inspect-issue.test.ts`
- Modify: `tests/fixtures/issue-minimal.json`

- [ ] **Step 1: 用命令类型测试替换近似措辞穷举矩阵**

`tests/unit/command-parser.test.ts` 保留批准计划参数测试，新增：

```ts
test.each([
  ["/ai 状态", "status"],
  ["/ai 批准选题", "approve-topic"],
  ["/ai 暂停", "pause"],
  ["/ai 恢复", "resume"],
  ["/ai 重试", "retry"]
])("解析支持的固定命令类型", (body, kind) => {
  expect(parseAiCommand(body)).toMatchObject({ kind });
});

test("拒绝一个代表性的非固定命令", () => {
  expect(parseAiCommand("请开始写作")).toBeNull();
});
```

删除原 `test.each` 的大小写、空格、长度和自然语言穷举矩阵。

- [ ] **Step 2: 运行 unit test 确认 RED**

Run:

```bash
pnpm test -- tests/unit/command-parser.test.ts
```

Expected: FAIL，新增固定命令尚未解析。

- [ ] **Step 3: 扩展公开命令联合类型**

```ts
/** 带计划版本和 Hash 前缀的写作计划批准命令。 */
export interface ApproveWritingPlanCommand {
  kind: "approve-writing-plan";
  planVersion: number;
  hashPrefix: string;
}

/** 无附加参数的固定 `/ai` 命令。 */
export interface SimpleAiCommand {
  kind: "status" | "approve-topic" | "pause" | "resume" | "retry";
}

/** 固定 `/ai` 命令解析结果。 */
export type ParsedAiCommand =
  | ApproveWritingPlanCommand
  | SimpleAiCommand;

const exactCommands = new Map<string, SimpleAiCommand["kind"]>([
  ["/ai 状态", "status"],
  ["/ai 批准选题", "approve-topic"],
  ["/ai 暂停", "pause"],
  ["/ai 恢复", "resume"],
  ["/ai 重试", "retry"]
]);
```

在 regex 前加入：

```ts
const exactKind = exactCommands.get(body);

if (exactKind) {
  return { kind: exactKind };
}
```

将 `parseAiCommand` 的 JSDoc 更新为：

```ts
/**
 * 解析流程支持的固定 `/ai` 命令。
 *
 * @param body Issue 或 PR 评论原文。
 * @returns 精确匹配的结构化命令；其他输入返回 null。
 */
```

- [ ] **Step 4: 运行 unit test 确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/command-parser.test.ts
```

Expected: PASS。

- [ ] **Step 5: 让 inspect-issue 输出所有结构化命令**

将 parser import 改为：

```ts
import {
  parseAiCommand,
  type ParsedAiCommand
} from "../domain/command-parser.js";
```

在 `InspectIssueOptions` 前补充：

```ts
/** inspect-issue command 的文件输入和 dry-run 标记。 */
```

将 `inspectIssue` 的 JSDoc 更新为：

```ts
/**
 * 读取 Issue fixture，输出标签事实和经过权限、bot 过滤的固定命令。
 *
 * @param options Issue 文件路径和 dry-run 标记。
 * @returns 版本化 Issue 事实与命令 envelope。
 * @throws ArticleHubError 当 Issue 文件缺失或 JSON 无效时抛出。
 */
```

在 `inspect-issue.ts` 新增：

```ts
function toWireCommand(parsed: ParsedAiCommand | null) {
  if (!parsed) {
    return null;
  }

  if (parsed.kind === "approve-writing-plan") {
    return {
      kind: parsed.kind,
      plan_version: parsed.planVersion,
      hash_prefix: parsed.hashPrefix
    };
  }

  return {
    kind: parsed.kind
  };
}
```

将原条件映射替换为：

```ts
const wireParsed = toWireCommand(parsed);
```

在 `tests/fixtures/issue-minimal.json` 追加一条授权 `/ai 暂停` 评论，并在
`tests/integration/inspect-issue.test.ts` 增加：

```ts
test("授权固定控制命令输出结构化 kind", () => {
  const output = inspectFixtureIssue();
  const command = output.commands.find(
    (item) => item.parsed?.kind === "pause"
  );

  expect(command).toMatchObject({
    actor: {
      authorized: true,
      bot: false
    },
    parsed: {
      kind: "pause"
    },
    actionable: true
  });
});
```

将测试内 `parsed` 类型改为：

```ts
parsed:
  | {
      kind: string;
      plan_version?: number;
      hash_prefix?: string;
    }
  | null;
```

- [ ] **Step 6: 运行 inspect integration test 确认 GREEN**

Run:

```bash
pnpm test -- tests/unit/command-parser.test.ts tests/integration/inspect-issue.test.ts
```

Expected: PASS。

- [ ] **Step 7: Commit**

```bash
git add src/domain/command-parser.ts src/commands/inspect-issue.ts tests/unit/command-parser.test.ts tests/integration/inspect-issue.test.ts tests/fixtures/issue-minimal.json
git commit -m "feat: parse fixed AI control commands"
```

### Task 12: Templates, Skills, Evals, and Documentation

**Files:**

- Modify: `.github/ISSUE_TEMPLATE/article.yml`
- Modify: `AGENTS.md`
- Modify: `usage.md`
- Modify: `docs/cli-reference.md`
- Modify: `docs/article-generation-requirements.md`
- Modify: `docs/article-generation-workflow-design.md`
- Modify: `skills/generate-opentiny-article/SKILL.md`
- Modify: `skills/polish-opentiny-article/SKILL.md`
- Modify: `skills/generate-opentiny-article/evals/evals.json`
- Modify: `skills/generate-opentiny-article/evals/README.md`
- Modify: `skills/generate-opentiny-article/evals/fixtures/paused-issue/issue.json`
- Modify: `tests/integration/generate-skill.test.ts`

- [ ] **Step 1: 写 Issue Form 初始状态测试**

在 `tests/integration/generate-skill.test.ts` 中新增：

```ts
import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";

test("文章 Issue Form 使用等待人工的初始状态", async () => {
  const raw = await readFile(
    path.join(repositoryRoot, ".github/ISSUE_TEMPLATE/article.yml"),
    "utf8"
  );
  const template = parseYaml(raw) as { labels?: string[] };

  expect(template.labels).toEqual(
    expect.arrayContaining(["阶段：选题", "AI：等待人工"])
  );
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
pnpm test -- tests/integration/generate-skill.test.ts
```

Expected: FAIL，当前模板仍使用 `AI：等待执行`。

- [ ] **Step 3: 更新 Issue Form**

将 `.github/ISSUE_TEMPLATE/article.yml` 的初始标签改为：

```yaml
labels:
  - 阶段：选题
  - AI：等待人工
```

- [ ] **Step 4: 更新 Skill 命令和停止条件**

所有写作流程停止条件改为 `AI执行：人工暂停`。所有 `update-status` 示例显式加入：

```sh
--intent content-transition
```

Review/lifecycle 示例按用途使用：

```sh
--intent lifecycle-transition
```

Skill 不自行推导标签增删；只消费 `inspect-issue`/`state decide` 的结构化结果，并把所有
真实 mutation 交给 `update-status`。

- [ ] **Step 5: 更新 paused eval fixture 和效果断言**

paused fixture 标签改为：

```json
"labels": [
  { "name": "阶段：写作" },
  "AI：等待人工",
  "AI执行：人工暂停"
]
```

`evals.json` 的 paused 场景只要求以下可观察效果：

```json
[
  {
    "kind": "deterministic",
    "text": "停止后未生成文章文件、未调用 create-pr、未新增 commit、未执行状态 mutation"
  },
  {
    "kind": "deterministic",
    "text": "通过 article-hub 的结构化状态结果识别人工暂停"
  }
]
```

删除要求输出固定中文句子的 assertion；`README.md` 同步说明 fixture 同时保留正常 AI
工作状态和独立人工暂停信号。

- [ ] **Step 6: 更新 CLI reference**

`state decide` 文档加入 fixture 字段：

```json
{
  "labels": ["阶段：写作", "AI：等待人工"],
  "intent": "pause"
}
```

`update-status` usage 改为：

```sh
article-hub update-status \
  --issue-file <path> \
  --repository <owner/repo> \
  --intent <intent> \
  [--phase <phase>] \
  [--ai-state <state>] \
  [--expected-head-sha <sha>] \
  [--current-head-sha <sha>] \
  [--comment <text>]
```

文档列出：

```text
content-transition
lifecycle-transition
pause
resume
retry
```

并明确 active 目标要求 phase + AI 状态，pause/resume/retry 不接受目标状态。

- [ ] **Step 7: 同步状态文档**

在 `AGENTS.md`、`usage.md`、requirements 和 future workflow reference 中统一：

```text
业务阶段：阶段：*
AI 工作状态：AI：等待执行 / AI：处理中 / AI：等待人工 / AI：失败
人工暂停信号：AI执行：人工暂停
AI inactive：阶段：待发布 / 阶段：已发布 / 阶段：已终止
业务终态：阶段：已发布 / 阶段：已终止
```

删除把 `AI：已暂停` 当生产状态的描述；workflow 文档仅同步模型，不新增 Workflow、
常驻服务或自动化实现。

- [ ] **Step 8: 运行模板与 Skill contract tests**

Run:

```bash
pnpm test -- tests/integration/generate-skill.test.ts tests/integration/polish-skill.test.ts tests/unit/skill-contract.test.ts
```

Expected: PASS。

- [ ] **Step 9: 检查旧生产标签引用**

Run:

```bash
rg -n "AI：已暂停" AGENTS.md usage.md docs skills .github src tests \
  -g '!docs/superpowers/specs/2026-06-23-state-mutation-design.md' \
  -g '!docs/superpowers/plans/2026-06-23-state-mutation-implementation.md'
```

Expected: 无输出。设计规格与实施计划可以保留旧标签作为问题背景和人工清理说明。

- [ ] **Step 10: Commit**

```bash
git add .github/ISSUE_TEMPLATE/article.yml AGENTS.md usage.md docs/cli-reference.md docs/article-generation-requirements.md docs/article-generation-workflow-design.md skills/generate-opentiny-article/SKILL.md skills/polish-opentiny-article/SKILL.md skills/generate-opentiny-article/evals/evals.json skills/generate-opentiny-article/evals/README.md skills/generate-opentiny-article/evals/fixtures/paused-issue/issue.json tests/integration/generate-skill.test.ts
git commit -m "docs: adopt independent manual pause signal"
```

### Task 13: Final Verification

**Files:**

- Verify: all modified files

- [ ] **Step 1: 运行 domain 与 CLI 重点测试**

Run:

```bash
pnpm test -- tests/unit/state-machine.test.ts tests/unit/command-parser.test.ts tests/integration/plan-state-cli.test.ts tests/integration/update-status-cli.test.ts tests/integration/inspect-issue.test.ts
```

Expected: PASS，0 failures。

- [ ] **Step 2: 运行 Skill contract tests**

Run:

```bash
pnpm test -- tests/integration/generate-skill.test.ts tests/integration/polish-skill.test.ts tests/unit/skill-contract.test.ts
```

Expected: PASS，0 failures。

- [ ] **Step 3: 运行全部测试**

Run:

```bash
pnpm test
```

Expected: PASS，0 failures。

- [ ] **Step 4: 运行 TypeScript build**

Run:

```bash
pnpm run build
```

Expected: exit code `0`。

- [ ] **Step 5: 验证生产规则没有重复实现**

Run:

```bash
rg -n 'PHASE_LABELS|AI_STATUS_LABELS|AI_INACTIVE_PHASES|MANUAL_PAUSE_LABEL' src
```

Expected:

- 标签目录和 inactive 集合只定义于 `src/domain/state-machine.ts`。
- command 文件仅 import domain 类型、守卫或常量，不声明平行标签数组或集合。

- [ ] **Step 6: 验证测试约束**

Run:

```bash
rg -n 'AI：已暂停|LEGACY_PAUSE|migration' tests
```

Expected: 无输出。

人工检查：

- 没有仅证明旧默认行为消失的墓碑测试。
- 没有 migration test。
- 没有人类 message、中文句子或 fixture 全量快照精确断言。
- fake 只替换 `gh` 外部边界，未 mock domain 或 command 内部协作者。

- [ ] **Step 7: 检查最终 diff**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` 无输出；`git status --short` 只包含本计划范围内尚未提交的文件。

- [ ] **Step 8: Commit 最终修正**

若验证阶段产生必要修正：

```bash
git add src tests .github AGENTS.md usage.md docs skills
git commit -m "test: verify unified state mutation flow"
```

若没有修正，不创建空 commit。
