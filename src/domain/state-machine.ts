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

/** 不再承载 AI 工作的业务阶段集合。 */
export const AI_INACTIVE_PHASES = new Set<PhaseLabel>([
  "阶段：待发布",
  "阶段：已发布",
  "阶段：已终止"
]);

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

interface CurrentState {
  phase: PhaseLabel;
  aiStatus: AiStatusLabel | null;
  paused: boolean;
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

/**
 * 判断字符串是否为已知 mutation intent。
 *
 * @param value 待判断的 intent。
 * @returns 已知 intent 返回 true。
 */
export function isMutationIntentKind(value: string): value is MutationIntentKind {
  return mutationIntentKinds.has(value);
}

/**
 * 根据当前标签、mutation intent 和可选 Head SHA 生成确定性标签计划。
 *
 * @param input 当前标签、显式 intent 与可选 Head SHA guard。
 * @returns 是否允许 mutation、稳定阻断码及幂等标签增删计划。
 */
export function decideStateMutation(input: StateMutationInput): StateMutationDecision {
  const current = readCurrentState(input.labels, input.intent);

  if (!current) {
    return blocked("INVALID_CURRENT_STATE");
  }

  if (input.intent.kind === "pause") {
    if (AI_INACTIVE_PHASES.has(current.phase)) {
      return blocked("INVALID_TRANSITION");
    }

    if (current.paused) {
      return allowed();
    }

    if (current.aiStatus === "AI：处理中") {
      return allowed(["AI：处理中"], ["AI：等待执行", MANUAL_PAUSE_LABEL]);
    }

    return allowed([], [MANUAL_PAUSE_LABEL]);
  }

  if (input.intent.kind === "resume") {
    if (AI_INACTIVE_PHASES.has(current.phase)) {
      return blocked("INVALID_TRANSITION");
    }

    if (!current.paused) {
      return allowed();
    }

    if (current.aiStatus === "AI：处理中") {
      return blocked("INVALID_CURRENT_STATE");
    }

    return allowed([MANUAL_PAUSE_LABEL]);
  }

  if (input.intent.kind === "reconcile" && AI_INACTIVE_PHASES.has(current.phase)) {
    return allowed(
      input.labels.filter((label) => label.startsWith("AI：") || label === MANUAL_PAUSE_LABEL)
    );
  }

  if (
    current.paused &&
    (input.intent.kind === "content-transition" || input.intent.kind === "retry")
  ) {
    return blocked("AI_PAUSED");
  }

  if (
    input.intent.kind === "content-transition" &&
    input.expectedHeadSha &&
    input.currentHeadSha &&
    input.expectedHeadSha !== input.currentHeadSha
  ) {
    return blocked("HEAD_SHA_MISMATCH");
  }

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

  return blocked("INVALID_TRANSITION");
}

function isAllowedContentTransition(current: PhaseLabel, target: PhaseLabel): boolean {
  return (
    current === target ||
    (current === "阶段：选题" && target === "阶段：策划") ||
    (current === "阶段：策划" && target === "阶段：写作")
  );
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

function readCurrentState(labels: string[], intent: StateMutationIntent): CurrentState | null {
  const phases = labels.filter(isPhaseLabel);
  const unknownPhase = labels.some((label) => label.startsWith("阶段：") && !isPhaseLabel(label));

  if (phases.length !== 1 || unknownPhase) {
    return null;
  }

  const phase = phases[0];
  const aiStatuses = labels.filter(isAiStatusLabel);
  const unknownAi = labels.some((label) => label.startsWith("AI：") && !isAiStatusLabel(label));
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

function allowed(labelsToRemove: string[] = [], labelsToAdd: string[] = []): StateMutationDecision {
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
