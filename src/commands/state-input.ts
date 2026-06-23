import {
  AI_INACTIVE_PHASES,
  isAiStatusLabel,
  isMutationIntentKind,
  isPhaseLabel,
  type AiStatusLabel,
  type MutationIntentKind,
  type PhaseLabel,
  type StateMutationIntent
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

  return targetAiStatus ? { kind, targetPhase, targetAiStatus } : { kind, targetPhase };
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
