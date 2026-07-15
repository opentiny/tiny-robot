import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { ArticleHubError } from "./errors.js";
import {
  type ResolvedGithubRepository,
  resolveCurrentGithubRepository
} from "./github-repository.js";
import { runCommand } from "./process.js";

/** 评论目标类型，仅接受精确 `pr` / `issue`。 */
export type CommentTargetKind = "pr" | "issue";

/** 评论 mutation 的稳定状态枚举。 */
export type CommentMutationState =
  | "not_started"
  | "unknown"
  | "created";

/**
 * 本地校验后的评论正文描述。
 */
export interface CommentBodyDescriptor {
  file: string;
  lineCount: number;
}

/** 评论创建成功后的 delivery 结果。 */
export interface CommentDelivery {
  status: "created";
  comment_id: number;
  comment_url: string;
}

/**
 * 评论 mutation plan 中的单条 operation。
 */
export interface CommentMutationOperation {
  kind: "gh-pr-comment" | "gh-issue-comment";
  repository: string;
  number: number;
  body_file: string;
}

export interface CommentTarget {
  kind: CommentTargetKind;
  number: number;
  repository: string;
}

export interface PublishCommentOptions {
  target: CommentTargetKind;
  number: number;
  bodyFile: string;
  dryRun: boolean;
  cwd?: string;
  /** 已推导的仓库；省略时从 cwd 重新推导。 */
  repository?: ResolvedGithubRepository;
}

export interface PublishCommentResult {
  ok: true;
  schema_version: "article-hub.comment.publish";
  dry_run: boolean;
  target: CommentTarget;
  body: {
    file: string;
    line_count: number;
  };
  delivery: CommentDelivery | null;
  mutation_plan: {
    operations: CommentMutationOperation[];
  };
}

/**
 * 校验评论正文文件：存在、普通文件、严格 UTF-8、非空白；并计算行数供人工检查。
 *
 * @param bodyFile 调用方提供的正文路径；`-` 与空字符串非法。
 * @returns 绝对路径与行数。
 * @throws ArticleHubError `COMMENT_FILE_NOT_FOUND` 或 `INVALID_COMMENT_FILE`。
 */
export async function loadCommentBodyFile(bodyFile: string): Promise<CommentBodyDescriptor> {
  if (bodyFile.trim().length === 0 || bodyFile === "-") {
    throw invalidCommentFile(
      bodyFile === "-"
        ? "正文文件不能使用 stdin（-）"
        : "正文文件路径不能为空"
    );
  }

  const absolutePath = path.resolve(bodyFile);

  let fileStat;

  try {
    fileStat = await stat(absolutePath);
  } catch {
    throw commentFileNotFound(bodyFile);
  }

  if (!fileStat.isFile()) {
    throw invalidCommentFile(`正文路径不是普通文件：${bodyFile}`);
  }

  let buffer: Buffer;

  try {
    buffer = await readFile(absolutePath);
  } catch {
    throw commentFileNotFound(bodyFile);
  }

  let rawText: string;

  try {
    rawText = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    throw invalidCommentFile("正文文件不是有效 UTF-8");
  }

  if (rawText.trim().length === 0) {
    throw invalidCommentFile("正文文件不能只包含空白");
  }

  return {
    file: absolutePath,
    lineCount: countBodyLines(rawText)
  };
}

/**
 * 正文文件本地 guard 失败的稳定 details：mutation 尚未开始，可安全重试。
 */
function bodyFileGuardDetails(): Record<string, unknown> {
  return {
    stage: "body-file",
    mutation_state: "not_started",
    retry_safe: true
  };
}

function invalidCommentFile(message: string): ArticleHubError {
  return new ArticleHubError("INVALID_COMMENT_FILE", message, 2, bodyFileGuardDetails());
}

function commentFileNotFound(bodyFile: string): ArticleHubError {
  return new ArticleHubError(
    "COMMENT_FILE_NOT_FOUND",
    `正文文件不存在或不可读：${bodyFile}`,
    2,
    bodyFileGuardDetails()
  );
}

/**
 * 统计正文行数，仅用于人工检查；不参与幂等或远端比对。
 * 统一把 CRLF/CR 视为换行，并忽略最多一个文件末尾换行。
 */
function countBodyLines(raw: string): number {
  const withLf = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const content = withLf.endsWith("\n") ? withLf.slice(0, -1) : withLf;

  if (content.length === 0) {
    return 0;
  }

  return content.split("\n").length;
}

/**
 * 发布 Issue/PR 会话评论：本地 guard → 类型预检 → `--body-file` mutation。
 *
 * @param options 目标类型、编号、正文文件与 dry-run 标记。
 * @returns `article-hub.comment.publish` envelope。
 * @throws ArticleHubError 本地 guard、目标类型不匹配、GitHub 命令失败或结果无效时抛出。
 */
export async function publishComment(
  options: PublishCommentOptions
): Promise<PublishCommentResult> {
  const body = await loadCommentBodyFile(options.bodyFile);
  const resolved =
    options.repository ??
    (await resolveCurrentGithubRepository({ cwd: options.cwd }));
  const target: CommentTarget = {
    kind: options.target,
    number: options.number,
    repository: resolved.repository
  };
  const operation = buildCommentOperation({
    target: options.target,
    number: options.number,
    repository: resolved.repository,
    body
  });

  if (options.dryRun) {
    return {
      ok: true,
      schema_version: "article-hub.comment.publish",
      dry_run: true,
      target,
      body: publicBody(body),
      delivery: null,
      mutation_plan: {
        operations: [operation]
      }
    };
  }

  await assertCommentTargetKindMatches({
    target: options.target,
    number: options.number,
    repository: resolved
  });

  const delivery = await publishCommentBody({
    target: options.target,
    number: options.number,
    repository: resolved,
    body
  });

  return {
    ok: true,
    schema_version: "article-hub.comment.publish",
    dry_run: false,
    target,
    body: publicBody(body),
    delivery,
    mutation_plan: {
      operations: [operation]
    }
  };
}

/**
 * 执行 `gh ... comment --body-file` 并把成功返回的 URL 映射为 delivery。
 * 不包含目标类型预检；调用方若需要类型检查应自行保证或先调用独立 publish。
 *
 * @throws ArticleHubError 发布失败或成功结果无效时带稳定 `mutation_state` / `retry_safe`。
 */
export async function publishCommentBody(options: {
  target: CommentTargetKind;
  number: number;
  repository: ResolvedGithubRepository;
  body: CommentBodyDescriptor;
}): Promise<CommentDelivery> {
  const { target, number, repository, body } = options;
  const commandKind = target === "pr" ? "pr" : "issue";
  let stdout: string;

  try {
    stdout = await runCommand(
      "gh",
      [
        commandKind,
        "comment",
        String(number),
        "--repo",
        repository.repoWithHost,
        "--body-file",
        body.file
      ],
      { errorCode: "GITHUB_COMMAND_FAILED" }
    );
  } catch (error) {
    throw githubPublishFailed(error, {
      stage: "publish",
      mutationState: "unknown",
      retrySafe: false,
      target,
      number,
      repository: repository.repository,
      commentId: null,
      commentUrl: null
    });
  }

  const parsedUrl = parseCommentUrl(stdout, {
    target,
    number,
    repository: repository.repository
  });

  if (!parsedUrl) {
    throw new ArticleHubError(
      "COMMENT_RESULT_INVALID",
      "评论发布后未返回有效 comment URL",
      1,
      commentFailureDetails({
        stage: "publish-result",
        mutationState: "created",
        retrySafe: false,
        target,
        number,
        repository: repository.repository,
        commentId: null,
        commentUrl: null
      })
    );
  }

  return {
    status: "created",
    comment_id: parsedUrl.commentId,
    comment_url: parsedUrl.commentUrl
  };
}

/**
 * 构造 mutation plan 中的评论 operation。
 */
export function buildCommentOperation(options: {
  target: CommentTargetKind;
  number: number;
  repository: string;
  body: CommentBodyDescriptor;
}): CommentMutationOperation {
  return {
    kind: options.target === "pr" ? "gh-pr-comment" : "gh-issue-comment",
    repository: options.repository,
    number: options.number,
    body_file: options.body.file
  };
}

function publicBody(body: CommentBodyDescriptor) {
  return {
    file: body.file,
    line_count: body.lineCount
  };
}

/**
 * 真实 mutation 前校验远端对象是 Issue 还是 PR，与 `--target` 一致。
 */
async function assertCommentTargetKindMatches(options: {
  target: CommentTargetKind;
  number: number;
  repository: ResolvedGithubRepository;
}): Promise<void> {
  const { target, number, repository } = options;
  let raw: string;

  try {
    raw = await runCommand(
      "gh",
      [
        "api",
        "--hostname",
        "github.com",
        `repos/${repository.repository}/issues/${number}`
      ],
      { errorCode: "GITHUB_COMMAND_FAILED" }
    );
  } catch (error) {
    throw githubPublishFailed(error, {
      stage: "target-preflight",
      mutationState: "not_started",
      retrySafe: true,
      target,
      number,
      repository: repository.repository,
      commentId: null,
      commentUrl: null
    });
  }

  let document: unknown;

  try {
    document = JSON.parse(raw);
  } catch {
    throw new ArticleHubError(
      "GITHUB_COMMAND_FAILED",
      "目标预检结果不是有效 JSON",
      1,
      commentFailureDetails({
        stage: "target-preflight",
        mutationState: "not_started",
        retrySafe: true,
        target,
        number,
        repository: repository.repository,
        commentId: null,
        commentUrl: null
      })
    );
  }

  if (document === null || typeof document !== "object" || Array.isArray(document)) {
    throw new ArticleHubError(
      "GITHUB_COMMAND_FAILED",
      "目标预检结果必须是 JSON object",
      1,
      commentFailureDetails({
        stage: "target-preflight",
        mutationState: "not_started",
        retrySafe: true,
        target,
        number,
        repository: repository.repository,
        commentId: null,
        commentUrl: null
      })
    );
  }

  const record = document as Record<string, unknown>;
  const hasPullRequest =
    record.pull_request !== null &&
    typeof record.pull_request === "object" &&
    !Array.isArray(record.pull_request);

  // PR 的 Issue 资源带 object 类型 pull_request；纯 Issue 不得包含该字段。
  if (target === "pr" && !hasPullRequest) {
    throw new ArticleHubError(
      "COMMENT_TARGET_MISMATCH",
      "目标是 Issue，与 --target pr 不匹配",
      2,
      commentFailureDetails({
        stage: "target-preflight",
        mutationState: "not_started",
        retrySafe: true,
        target,
        number,
        repository: repository.repository,
        commentId: null,
        commentUrl: null
      })
    );
  }

  if (target === "issue" && hasPullRequest) {
    throw new ArticleHubError(
      "COMMENT_TARGET_MISMATCH",
      "目标是 Pull Request，与 --target issue 不匹配",
      2,
      commentFailureDetails({
        stage: "target-preflight",
        mutationState: "not_started",
        retrySafe: true,
        target,
        number,
        repository: repository.repository,
        commentId: null,
        commentUrl: null
      })
    );
  }
}

/**
 * 从 `gh pr|issue comment` stdout 解析并校验评论 URL。
 */
export function parseCommentUrl(
  stdout: string,
  options: { target: CommentTargetKind; number: number; repository: string }
): { commentId: number; commentUrl: string } | null {
  const match = /https:\/\/github\.com\/[^\s#]+#issuecomment-(\d+)/i.exec(stdout.trim());

  if (!match) {
    return null;
  }

  const commentUrl = match[0];
  const commentId = Number(match[1]);

  if (!Number.isSafeInteger(commentId) || commentId <= 0) {
    return null;
  }

  if (
    !urlsMatchCommentTarget(commentUrl, {
      target: options.target,
      number: options.number,
      repository: { repository: options.repository },
      commentId
    })
  ) {
    return null;
  }

  return { commentId, commentUrl };
}

function urlsMatchCommentTarget(
  url: string,
  options: {
    target: CommentTargetKind;
    number: number;
    repository: ResolvedGithubRepository | { repository: string };
    commentId?: number;
  }
): boolean {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "github.com") {
    return false;
  }

  const [owner, name, resource, numberText] = parsed.pathname.replace(/^\/+/, "").split("/");
  const expected = options.repository.repository.toLowerCase().split("/");

  if (
    !owner ||
    !name ||
    owner.toLowerCase() !== expected[0] ||
    name.toLowerCase() !== expected[1]
  ) {
    return false;
  }

  const expectedResource = options.target === "pr" ? "pull" : "issues";

  if (resource !== expectedResource || Number(numberText) !== options.number) {
    return false;
  }

  const fragmentMatch = /^issuecomment-(\d+)$/.exec(parsed.hash.replace(/^#/, ""));

  if (!fragmentMatch) {
    return false;
  }

  if (options.commentId !== undefined && Number(fragmentMatch[1]) !== options.commentId) {
    return false;
  }

  return true;
}

function githubPublishFailed(
  error: unknown,
  options: {
    stage: string;
    mutationState: CommentMutationState;
    retrySafe: boolean;
    target: CommentTargetKind;
    number: number;
    repository: string;
    commentId: number | null;
    commentUrl: string | null;
  }
): ArticleHubError {
  if (error instanceof ArticleHubError && error.code === "GITHUB_COMMAND_FAILED") {
    return new ArticleHubError(
      "GITHUB_COMMAND_FAILED",
      error.message,
      1,
      commentFailureDetails(options)
    );
  }

  return new ArticleHubError(
    "GITHUB_COMMAND_FAILED",
    error instanceof Error ? error.message : "GitHub 命令失败",
    1,
    commentFailureDetails(options)
  );
}

function commentFailureDetails(options: {
  stage: string;
  mutationState: CommentMutationState;
  retrySafe: boolean;
  target: CommentTargetKind;
  number: number;
  repository: string;
  commentId: number | null;
  commentUrl: string | null;
}): Record<string, unknown> {
  return {
    stage: options.stage,
    mutation_state: options.mutationState,
    retry_safe: options.retrySafe,
    target: {
      kind: options.target,
      number: options.number,
      repository: options.repository
    },
    comment_id: options.commentId,
    comment_url: options.commentUrl
  };
}
