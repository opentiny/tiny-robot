import { readFile } from "node:fs/promises";

import { ArticleHubError } from "../infrastructure/errors.js";
import { runCommand } from "../infrastructure/process.js";

interface IssueDocument {
  number?: unknown;
  labels?: unknown;
}

type PhaseLabel =
  | "阶段：选题"
  | "阶段：策划"
  | "阶段：写作"
  | "阶段：审核"
  | "阶段：待发布"
  | "阶段：已发布"
  | "阶段：已终止";

type AiStatusLabel =
  | "AI：等待执行"
  | "AI：处理中"
  | "AI：等待人工"
  | "AI：失败"
  | "AI：已暂停";

const phaseLabels: PhaseLabel[] = [
  "阶段：选题",
  "阶段：策划",
  "阶段：写作",
  "阶段：审核",
  "阶段：待发布",
  "阶段：已发布",
  "阶段：已终止"
];
const aiStatusLabels: AiStatusLabel[] = [
  "AI：等待执行",
  "AI：处理中",
  "AI：等待人工",
  "AI：失败",
  "AI：已暂停"
];
const terminalPhaseLabels = new Set<PhaseLabel>([
  "阶段：待发布",
  "阶段：已发布",
  "阶段：已终止"
]);

/**
 * 按阶段和 AI 状态更新 Issue 标签，并可追加一条状态评论。
 *
 * @param options Issue fixture、目标仓库、目标标签和 dry-run 标记。
 * @returns 版本化 mutation plan；暂停状态会阻止内容面状态推进。
 * @throws ArticleHubError 当 Issue fixture 无效或 GitHub mutation 失败时抛出。
 */
export async function updateIssueStatus(options: {
  issueFile: string;
  repository: string;
  phase: string;
  aiState?: string;
  comment?: string;
  dryRun: boolean;
}): Promise<unknown> {
  const issue = await readIssueDocument(options.issueFile);
  const issueNumber = readIssueNumber(issue.number);
  const currentLabels = normalizeLabels(issue.labels);
  const phase = readPhase(options.phase);
  const aiState = options.aiState ? readAiState(options.aiState) : undefined;

  if (currentLabels.includes("AI：已暂停") && aiState !== "AI：已暂停") {
    return {
      ok: true,
      schema_version: "article-hub.update-status.v1",
      dry_run: options.dryRun,
      issue: {
        number: issueNumber
      },
      mutation_allowed: false,
      blocked_reason: "AI_PAUSED",
      labels_to_remove: [],
      labels_to_add: [],
      mutation_plan: {
        operations: []
      }
    };
  }

  const labelsToRemove = currentLabels.filter((label) => {
    if (phaseLabels.includes(label as PhaseLabel)) {
      return label !== phase;
    }

    if (aiStatusLabels.includes(label as AiStatusLabel)) {
      return terminalPhaseLabels.has(phase) || label !== aiState;
    }

    return false;
  });
  const targetLabels: string[] = [phase];

  if (!terminalPhaseLabels.has(phase) && aiState) {
    targetLabels.push(aiState);
  }

  const labelsToAdd = targetLabels.filter((label) => !currentLabels.includes(label));
  const operations = buildStatusOperations({
    issueNumber,
    repository: options.repository,
    labelsToRemove,
    labelsToAdd,
    comment: options.comment
  });

  if (!options.dryRun) {
    await applyStatusOperations({
      issueNumber,
      repository: options.repository,
      labelsToRemove,
      labelsToAdd,
      comment: options.comment
    });
  }

  return {
    ok: true,
    schema_version: "article-hub.update-status.v1",
    dry_run: options.dryRun,
    issue: {
      number: issueNumber
    },
    mutation_allowed: true,
    blocked_reason: null,
    labels_to_remove: labelsToRemove,
    labels_to_add: labelsToAdd,
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

function readPhase(value: string): PhaseLabel {
  if (!phaseLabels.includes(value as PhaseLabel)) {
    throw new ArticleHubError("INVALID_STATE", `未知阶段标签：${value}`, 2);
  }

  return value as PhaseLabel;
}

function readAiState(value: string): AiStatusLabel {
  if (!aiStatusLabels.includes(value as AiStatusLabel)) {
    throw new ArticleHubError("INVALID_STATE", `未知 AI 状态标签：${value}`, 2);
  }

  return value as AiStatusLabel;
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
      ["issue", "comment", String(options.issueNumber), "--repo", options.repository, "--body", options.comment],
      { errorCode: "GITHUB_COMMAND_FAILED" }
    );
  }
}
