import { readFile } from "node:fs/promises";

import { decideStateMutation } from "../domain/state-machine.js";
import { ArticleHubError } from "../infrastructure/errors.js";
import {
  type CommentBodyDescriptor,
  type CommentDelivery,
  type CommentMutationOperation,
  buildCommentOperation,
  loadCommentBodyFile,
  publishCommentBody
} from "../infrastructure/github-comment.js";
import {
  type ResolvedGithubRepository,
  resolveCurrentGithubRepository
} from "../infrastructure/github-repository.js";
import { runCommand } from "../infrastructure/process.js";
import { readStateMutationIntent } from "./state-input.js";

interface IssueDocument {
  number?: unknown;
  labels?: unknown;
}

/** update-status command 的输入参数。 */
export interface UpdateIssueStatusOptions {
  issueFile: string;
  intent: string;
  phase?: string;
  aiState?: string;
  expectedHeadSha?: string;
  currentHeadSha?: string;
  /** 状态评论正文文件路径。 */
  commentFile?: string;
  dryRun: boolean;
  cwd?: string;
}

type LabelOperation = {
  kind: "gh-issue-edit-labels";
  issue_number: number;
  repository: string;
  remove: string[];
  add: string[];
};

type StatusOperation = LabelOperation | CommentMutationOperation;

/**
 * 根据显式 intent 规划并按需执行 Issue 状态 mutation。
 *
 * 评论路径复用安全发布模块：标签 mutation 前完成仓库推导与正文文件 guard。
 * 真实路径先读取最新 Issue 标签，再按需执行标签 mutation 与评论发布。
 *
 * @param options Issue fixture、显式 intent、目标状态、可选 comment-file 和 dry-run。
 * @returns 版本化决策 envelope、`comment_delivery` 与可审计 GitHub operation plan。
 * @throws ArticleHubError 当输入无效、远端状态读取失败或 GitHub mutation 失败时抛出。
 */
export async function updateIssueStatus(options: UpdateIssueStatusOptions): Promise<unknown> {
  const issue = await readIssueDocument(options.issueFile);
  const issueNumber = readIssueNumber(issue.number);
  const intent = readStateMutationIntent(
    {
      intent: options.intent,
      phase: options.phase,
      aiState: options.aiState
    },
    new Set(["content-transition", "lifecycle-transition", "pause", "resume", "retry"])
  );

  // 在任何远端读取前完成当前仓库推导与评论文件本地 guard。
  const repository = await resolveCurrentGithubRepository({ cwd: options.cwd });
  const commentBody =
    options.commentFile === undefined
      ? undefined
      : await loadCommentBodyFile(options.commentFile);

  const fixtureLabels = normalizeLabels(issue.labels);
  const currentLabels = options.dryRun
    ? fixtureLabels
    : await readLatestIssueLabels(issueNumber, repository);
  const decision = decideStateMutation({
    labels: currentLabels,
    intent,
    expectedHeadSha: options.expectedHeadSha,
    currentHeadSha: options.currentHeadSha
  });
  const hasLabelMutation =
    decision.labelsToRemove.length > 0 || decision.labelsToAdd.length > 0;
  const shouldPublishComment =
    decision.mutationAllowed && hasLabelMutation && commentBody !== undefined;
  const operations =
    decision.mutationAllowed && hasLabelMutation
      ? buildStatusOperations({
          issueNumber,
          repository: repository.repository,
          labelsToRemove: decision.labelsToRemove,
          labelsToAdd: decision.labelsToAdd,
          commentBody: shouldPublishComment ? commentBody : undefined
        })
      : [];

  let commentDelivery: CommentDelivery | null = null;

  if (!options.dryRun && decision.mutationAllowed && hasLabelMutation) {
    commentDelivery = await applyStatusOperations({
      issueNumber,
      repository,
      labelsToRemove: decision.labelsToRemove,
      labelsToAdd: decision.labelsToAdd,
      commentBody: shouldPublishComment ? commentBody : undefined
    });
  }

  return {
    ok: true,
    schema_version: "article-hub.update-status",
    dry_run: options.dryRun,
    issue: {
      number: issueNumber
    },
    decision: {
      mutation_allowed: decision.mutationAllowed,
      blocked_reason: decision.blockedReason,
      labels_to_remove: decision.labelsToRemove,
      labels_to_add: decision.labelsToAdd
    },
    comment_delivery: commentDelivery,
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

async function readLatestIssueLabels(
  issueNumber: number,
  repository: ResolvedGithubRepository
): Promise<string[]> {
  const raw = await runCommand(
    "gh",
    [
      "issue",
      "view",
      String(issueNumber),
      "--repo",
      repository.repoWithHost,
      "--json",
      "number,labels"
    ],
    { errorCode: "GITHUB_COMMAND_FAILED" }
  );

  try {
    const document = JSON.parse(raw) as IssueDocument;

    return normalizeLabels(document.labels);
  } catch {
    throw new ArticleHubError("GITHUB_COMMAND_FAILED", "GitHub Issue 输出不是有效 JSON");
  }
}

function buildStatusOperations(options: {
  issueNumber: number;
  repository: string;
  labelsToRemove: string[];
  labelsToAdd: string[];
  commentBody?: CommentBodyDescriptor;
}): StatusOperation[] {
  const operations: StatusOperation[] = [];

  if (options.labelsToRemove.length > 0 || options.labelsToAdd.length > 0) {
    operations.push({
      kind: "gh-issue-edit-labels",
      issue_number: options.issueNumber,
      repository: options.repository,
      remove: options.labelsToRemove,
      add: options.labelsToAdd
    });
  }

  if (options.commentBody) {
    operations.push(
      buildCommentOperation({
        target: "issue",
        number: options.issueNumber,
        repository: options.repository,
        body: options.commentBody
      })
    );
  }

  return operations;
}

async function applyStatusOperations(options: {
  issueNumber: number;
  repository: ResolvedGithubRepository;
  labelsToRemove: string[];
  labelsToAdd: string[];
  commentBody?: CommentBodyDescriptor;
}): Promise<CommentDelivery | null> {
  // update-status 始终面向 Issue；标签已通过 `gh issue view` 读取。
  const editArgs = [
    "issue",
    "edit",
    String(options.issueNumber),
    "--repo",
    options.repository.repoWithHost
  ];

  for (const label of options.labelsToRemove) {
    editArgs.push("--remove-label", label);
  }

  for (const label of options.labelsToAdd) {
    editArgs.push("--add-label", label);
  }

  if (options.labelsToRemove.length > 0 || options.labelsToAdd.length > 0) {
    await runCommand("gh", editArgs, { errorCode: "GITHUB_COMMAND_FAILED" });
  }

  if (!options.commentBody) {
    return null;
  }

  try {
    return await publishCommentBody({
      target: "issue",
      number: options.issueNumber,
      repository: options.repository,
      body: options.commentBody
    });
  } catch (error) {
    throw mapCommentPartialMutation(error, options);
  }
}

/** 将标签更新后的评论发布失败映射为 PARTIAL_MUTATION。 */
function mapCommentPartialMutation(
  error: unknown,
  options: {
    issueNumber: number;
    repository: ResolvedGithubRepository;
    labelsToRemove: string[];
    labelsToAdd: string[];
    commentBody?: CommentBodyDescriptor;
  }
): ArticleHubError {
  const labelOperation: LabelOperation = {
    kind: "gh-issue-edit-labels",
    issue_number: options.issueNumber,
    repository: options.repository.repository,
    remove: options.labelsToRemove,
    add: options.labelsToAdd
  };
  const commentOperation = options.commentBody
    ? buildCommentOperation({
        target: "issue",
        number: options.issueNumber,
        repository: options.repository.repository,
        body: options.commentBody
      })
    : undefined;

  if (!(error instanceof ArticleHubError)) {
    return new ArticleHubError(
      "PARTIAL_MUTATION",
      error instanceof Error ? error.message : "状态标签已更新，但评论发布失败",
      1,
      {
        mutation_state: "unknown",
        completed_operations: [labelOperation],
        unknown_operations: commentOperation ? [commentOperation] : [],
        retry_safe: false
      }
    );
  }

  const mutationState =
    typeof error.details?.mutation_state === "string"
      ? error.details.mutation_state
      : "unknown";
  const commentId =
    typeof error.details?.comment_id === "number" ? error.details.comment_id : null;
  const commentUrl =
    typeof error.details?.comment_url === "string" ? error.details.comment_url : null;

  if (mutationState === "created" && commentOperation) {
    return new ArticleHubError(
      "PARTIAL_MUTATION",
      error.message,
      1,
      {
        mutation_state: "created",
        completed_operations: [
          labelOperation,
          {
            ...commentOperation,
            comment_id: commentId,
            comment_url: commentUrl,
            result_error: error.message
          }
        ],
        unknown_operations: [],
        retry_safe: false,
        result_error: error.message,
        comment_id: commentId,
        comment_url: commentUrl
      }
    );
  }

  return new ArticleHubError(
    "PARTIAL_MUTATION",
    error.message,
    1,
    {
      mutation_state: "unknown",
      completed_operations: [labelOperation],
      unknown_operations: commentOperation
        ? [
            {
              ...commentOperation,
              comment_id: commentId,
              comment_url: commentUrl
            }
          ]
        : [],
      retry_safe: false
    }
  );
}
