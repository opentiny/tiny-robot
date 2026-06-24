import { readFile } from "node:fs/promises";

import { approveWritingPlan } from "../domain/plan.js";
import { ArticleHubError } from "../infrastructure/errors.js";

/**
 * 校验本地批准命令，并在有效时返回不可变批准快照。
 *
 * @param options 计划正文文件路径（临时输入，不入 git）、批准命令原文与批准元数据。
 * @returns 稳定 `article-hub.plan.approve` envelope。
 * @throws ArticleHubError 当计划正文文件不存在时抛出 `PLAN_FILE_NOT_FOUND`。
 */
export async function approvePlanFile(options: {
  planBodyFile: string;
  command: string;
  approver: string;
  commentId?: number;
  approvedAt: string;
  planCommentId?: number;
  planLabel?: string;
  dryRun: boolean;
}): Promise<unknown> {
  const planBody = await readPlanBody(options.planBodyFile);
  const result = approveWritingPlan({
    planBody,
    command: options.command,
    approver: options.approver,
    commentId: options.commentId,
    approvedAt: options.approvedAt,
    planCommentId: options.planCommentId,
    planLabel: options.planLabel,
  });

  return {
    ok: true,
    schema_version: "article-hub.plan.approve",
    dry_run: options.dryRun,
    ...wireApprovalResult(result),
  };
}

async function readPlanBody(planBodyFile: string): Promise<string> {
  try {
    return await readFile(planBodyFile, "utf8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      throw new ArticleHubError(
        "PLAN_FILE_NOT_FOUND",
        `写作计划正文文件不存在：${planBodyFile}`,
      );
    }

    throw error;
  }
}

function wireApprovalResult(result: ReturnType<typeof approveWritingPlan>) {
  if (!result.valid) {
    return {
      valid: false,
      reason: result.reason,
    };
  }

  return {
    valid: true,
    snapshot: result.snapshot,
  };
}
