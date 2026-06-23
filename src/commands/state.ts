import { readFile } from "node:fs/promises";

import { decideStateMutation } from "../domain/state-machine.js";
import { ArticleHubError } from "../infrastructure/errors.js";
import { readStateMutationIntent } from "./state-input.js";

interface StateFileDocument {
  labels?: unknown;
  intent?: unknown;
  phase?: unknown;
  ai_state?: unknown;
  expected_head_sha?: unknown;
  current_head_sha?: unknown;
}

/**
 * 读取状态 fixture，并通过 domain Module 输出确定性 mutation 决策。
 *
 * @param options 状态文件路径和 dry-run 标记。
 * @returns 版本化状态决策 envelope。
 * @throws ArticleHubError 当状态文件缺失、JSON 无效或 intent 字段无效时抛出。
 */
export async function decideState(options: {
  stateFile: string;
  dryRun: boolean;
}): Promise<unknown> {
  const state = await readStateFile(options.stateFile);
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
  const decision = decideStateMutation({
    labels: normalizeLabels(state.labels),
    intent,
    expectedHeadSha:
      typeof state.expected_head_sha === "string" ? state.expected_head_sha : null,
    currentHeadSha: typeof state.current_head_sha === "string" ? state.current_head_sha : null
  });

  return {
    ok: true,
    schema_version: "article-hub.state.decide",
    dry_run: options.dryRun,
    decision: {
      mutation_allowed: decision.mutationAllowed,
      blocked_reason: decision.blockedReason,
      labels_to_remove: decision.labelsToRemove,
      labels_to_add: decision.labelsToAdd
    }
  };
}

async function readStateFile(stateFile: string): Promise<StateFileDocument> {
  let raw: string;

  try {
    raw = await readFile(stateFile, "utf8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      throw new ArticleHubError("STATE_FILE_NOT_FOUND", `状态文件不存在：${stateFile}`);
    }

    throw error;
  }

  try {
    return JSON.parse(raw) as StateFileDocument;
  } catch {
    throw new ArticleHubError("INVALID_JSON", `状态文件不是有效 JSON：${stateFile}`);
  }
}

function normalizeLabels(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((label): label is string => typeof label === "string");
}
