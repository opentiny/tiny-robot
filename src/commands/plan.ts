import { readFile } from "node:fs/promises";

import {
  approveWritingPlan,
  compareWritingPlans,
  createPlanDigest
} from "../domain/plan.js";
import { ArticleHubError } from "../infrastructure/errors.js";

export interface PlanCommandContext {
  dryRun: boolean;
}

/**
 * 计算本地写作计划 Hash，供 Skill 展示和批准命令校验使用。
 */
export async function hashPlan(options: {
  planFile: string;
  dryRun: boolean;
}): Promise<unknown> {
  const plan = await readPlanJson(options.planFile);
  const digest = createPlanDigest(plan);

  return {
    ok: true,
    schema_version: "article-hub.plan.hash.v1",
    dry_run: options.dryRun,
    plan_version: digest.planVersion,
    plan_hash: digest.planHash,
    plan_hash_prefix: digest.planHashPrefix,
    canonical_semantic_payload_hash: digest.planHash
  };
}

/**
 * 比较两个写作计划文件，判断是否需要增加 `plan_version`。
 */
export async function comparePlanFiles(options: {
  previousFile: string;
  currentFile: string;
  dryRun: boolean;
}): Promise<unknown> {
  const previous = await readPlanJson(options.previousFile);
  const current = await readPlanJson(options.currentFile);
  const comparison = compareWritingPlans(previous, current);

  return {
    ok: true,
    schema_version: "article-hub.plan.compare.v1",
    dry_run: options.dryRun,
    semantic_changed: comparison.semanticChanged,
    suggested_plan_version: comparison.suggestedPlanVersion,
    previous: toWireDigest(comparison.previous),
    current: toWireDigest(comparison.current)
  };
}

/**
 * 校验本地批准命令，并在有效时返回不可变批准快照。
 */
export async function approvePlanFile(options: {
  planFile: string;
  command: string;
  approver: string;
  commentId?: number;
  approvedAt: string;
  dryRun: boolean;
}): Promise<unknown> {
  const plan = await readPlanJson(options.planFile);
  const result = approveWritingPlan({
    plan,
    command: options.command,
    approver: options.approver,
    commentId: options.commentId,
    approvedAt: options.approvedAt
  });

  return {
    ok: true,
    schema_version: "article-hub.plan.approve.v1",
    dry_run: options.dryRun,
    ...wireApprovalResult(result)
  };
}

async function readPlanJson(planFile: string): Promise<unknown> {
  let raw: string;

  try {
    raw = await readFile(planFile, "utf8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      throw new ArticleHubError("PLAN_FILE_NOT_FOUND", `写作计划文件不存在：${planFile}`);
    }

    throw error;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new ArticleHubError("INVALID_JSON", `写作计划文件不是有效 JSON：${planFile}`);
  }
}

function toWireDigest(digest: ReturnType<typeof createPlanDigest>) {
  return {
    plan_version: digest.planVersion,
    plan_hash: digest.planHash,
    plan_hash_prefix: digest.planHashPrefix,
    canonical_semantic_payload_hash: digest.planHash
  };
}

function wireApprovalResult(result: ReturnType<typeof approveWritingPlan>) {
  if (!result.valid) {
    return {
      valid: false,
      reason: result.reason
    };
  }

  return {
    valid: true,
    snapshot: result.snapshot
  };
}
