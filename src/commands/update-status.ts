import { readFile } from "node:fs/promises";

import { decideStateMutation } from "../domain/state-machine.js";
import { ArticleHubError } from "../infrastructure/errors.js";
import { runCommand } from "../infrastructure/process.js";
import { readStateMutationIntent } from "./state-input.js";

interface IssueDocument {
  number?: unknown;
  labels?: unknown;
}

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

/**
 * 根据显式 intent 规划并按需执行 Issue 状态 mutation。
 *
 * @param options Issue fixture、仓库、显式 intent、目标状态和 dry-run 标记。
 * @returns 版本化决策 envelope 与可审计 GitHub operation plan。
 * @throws ArticleHubError 当输入无效、远端状态读取失败或 GitHub mutation 失败时抛出。
 */
export async function updateIssueStatus(options: UpdateIssueStatusOptions): Promise<unknown> {
  const issue = await readIssueDocument(options.issueFile);
  const issueNumber = readIssueNumber(issue.number);
  const currentLabels = normalizeLabels(issue.labels);
  const intent = readStateMutationIntent(
    {
      intent: options.intent,
      phase: options.phase,
      aiState: options.aiState
    },
    new Set(["content-transition", "lifecycle-transition", "pause", "resume", "retry"])
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
  const operations =
    decision.mutationAllowed && hasLabelMutation
      ? buildStatusOperations({
          issueNumber,
          repository: options.repository,
          labelsToRemove: decision.labelsToRemove,
          labelsToAdd: decision.labelsToAdd,
          comment: operationComment
        })
      : [];

  if (!options.dryRun && decision.mutationAllowed && hasLabelMutation) {
    await applyStatusOperations({
      issueNumber,
      repository: options.repository,
      labelsToRemove: decision.labelsToRemove,
      labelsToAdd: decision.labelsToAdd,
      comment: operationComment
    });
  }

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
}

async function readIssueDocument(issueFile: string): Promise<IssueDocument> {
  const raw = await readFile(issueFile, "utf8");

  try {
    return JSON.parse(raw) as IssueDocument;
  } catch {
    throw new ArticleHubError("INVALID_JSON", `Issue 文件不是有效 JSON：${issueFile}`);
  }
}

function readIssueNumber(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    throw new ArticleHubError("MISSING_ISSUE_FILE", "Issue fixture 缺少 number");
  }

  return value as number;
}

function normalizeLabels(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((label) => {
    if (typeof label === "string") {
      return [label];
    }

    if (label !== null && typeof label === "object" && "name" in label) {
      const name = (label as { name?: unknown }).name;
      return typeof name === "string" ? [name] : [];
    }

    return [];
  });
}

function buildStatusOperations(options: {
  issueNumber: number;
  repository: string;
  labelsToRemove: string[];
  labelsToAdd: string[];
  comment?: string;
}) {
  const operations = [];

  if (options.labelsToRemove.length > 0 || options.labelsToAdd.length > 0) {
    operations.push({
      kind: "gh-issue-edit-labels",
      issue_number: options.issueNumber,
      repository: options.repository,
      remove: options.labelsToRemove,
      add: options.labelsToAdd
    });
  }

  if (options.comment) {
    operations.push({
      kind: "gh-issue-comment",
      issue_number: options.issueNumber,
      repository: options.repository,
      body: options.comment
    });
  }

  return operations;
}

async function applyStatusOperations(options: {
  issueNumber: number;
  repository: string;
  labelsToRemove: string[];
  labelsToAdd: string[];
  comment?: string;
}): Promise<void> {
  const editArgs = ["issue", "edit", String(options.issueNumber), "--repo", options.repository];

  for (const label of options.labelsToRemove) {
    editArgs.push("--remove-label", label);
  }

  for (const label of options.labelsToAdd) {
    editArgs.push("--add-label", label);
  }

  if (options.labelsToRemove.length > 0 || options.labelsToAdd.length > 0) {
    await runCommand("gh", editArgs, { errorCode: "GITHUB_COMMAND_FAILED" });
  }

  if (options.comment) {
    await runCommand(
      "gh",
      [
        "issue",
        "comment",
        String(options.issueNumber),
        "--repo",
        options.repository,
        "--body",
        options.comment
      ],
      { errorCode: "GITHUB_COMMAND_FAILED" }
    );
  }
}
