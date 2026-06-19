export type PhaseLabel =
  | "阶段：选题"
  | "阶段：策划"
  | "阶段：写作"
  | "阶段：审核"
  | "阶段：待发布"
  | "阶段：已发布"
  | "阶段：已终止";

export type AiStatusLabel =
  | "AI：等待执行"
  | "AI：处理中"
  | "AI：等待人工"
  | "AI：失败"
  | "AI：已暂停";

export type BlockedReason = "AI_PAUSED" | "HEAD_SHA_MISMATCH";

export interface StateMutationInput {
  labels: string[];
  expectedHeadSha?: string | null;
  currentHeadSha?: string | null;
}

export interface StateMutationDecision {
  mutationAllowed: boolean;
  blockedReason: BlockedReason | null;
  labelsToRemove: string[];
  labelsToAdd: string[];
}

const aiStatusLabels = new Set<AiStatusLabel>([
  "AI：等待执行",
  "AI：处理中",
  "AI：等待人工",
  "AI：失败",
  "AI：已暂停"
]);

const terminalPhaseLabels = new Set<PhaseLabel>([
  "阶段：待发布",
  "阶段：已发布",
  "阶段：已终止"
]);

/**
 * 根据 Issue 标签和 Head SHA 输入，返回本地 mutation 决策。
 *
 * 该函数只生成确定性 mutation plan；真实 GitHub 标签写入由后续命令负责。
 */
export function decideStateMutation(input: StateMutationInput): StateMutationDecision {
  if (input.labels.includes("AI：已暂停")) {
    return blocked("AI_PAUSED");
  }

  if (
    input.expectedHeadSha &&
    input.currentHeadSha &&
    input.expectedHeadSha !== input.currentHeadSha
  ) {
    return blocked("HEAD_SHA_MISMATCH");
  }

  const phase = input.labels.find((label): label is PhaseLabel =>
    terminalPhaseLabels.has(label as PhaseLabel)
  );

  return {
    mutationAllowed: true,
    blockedReason: null,
    labelsToRemove: phase
      ? input.labels.filter((label): label is AiStatusLabel =>
          aiStatusLabels.has(label as AiStatusLabel)
        )
      : [],
    labelsToAdd: []
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
