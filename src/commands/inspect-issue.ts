import { readFile } from "node:fs/promises";

import { parseAiCommand, type ParsedAiCommand } from "../domain/command-parser.js";
import { ArticleHubError } from "../infrastructure/errors.js";

interface IssueActor {
  login?: unknown;
  type?: unknown;
  association?: unknown;
  is_bot?: unknown;
  isBot?: unknown;
}

interface IssueComment {
  id?: unknown;
  body?: unknown;
  author?: IssueActor;
  user?: IssueActor;
  authorAssociation?: unknown;
  author_association?: unknown;
}

interface IssueDocument {
  number?: unknown;
  title?: unknown;
  body?: unknown;
  author?: IssueActor;
  user?: IssueActor;
  labels?: unknown;
  comments?: unknown;
}

/** inspect-issue command 的文件输入和 dry-run 标记。 */
export interface InspectIssueOptions {
  issueFile: string;
  dryRun: boolean;
}

const authorizedAssociations = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

/**
 * 读取 Issue fixture，输出标签事实和经过权限、bot 过滤的固定命令。
 *
 * @param options Issue 文件路径和 dry-run 标记。
 * @returns 版本化 Issue 事实与命令 envelope。
 * @throws ArticleHubError 当 Issue 文件缺失或 JSON 无效时抛出。
 */
export async function inspectIssue(options: InspectIssueOptions): Promise<unknown> {
  const document = await readIssueDocument(options.issueFile);
  const comments = normalizeComments(document.comments);

  return {
    ok: true,
    schema_version: "article-hub.inspect-issue",
    dry_run: options.dryRun,
    issue: {
      number: typeof document.number === "number" ? document.number : null,
      title: typeof document.title === "string" ? document.title : "",
      author: normalizeActor(document.author ?? document.user),
      labels: normalizeLabels(document.labels),
      comment_count: comments.length
    },
    commands: comments.map((comment) => {
      const actor = normalizeCommentActor(comment);
      const parsed = typeof comment.body === "string" ? parseAiCommand(comment.body) : null;
      const wireParsed = toWireCommand(parsed);

      return {
        source: "comment",
        comment_id: normalizeCommentId(comment.id),
        actor,
        body: typeof comment.body === "string" ? comment.body : "",
        parsed: wireParsed,
        actionable: wireParsed !== null && actor.authorized
      };
    })
  };
}

function toWireCommand(parsed: ParsedAiCommand | null) {
  if (!parsed) {
    return null;
  }

  return {
    kind: parsed.kind,
  };
}

async function readIssueDocument(issueFile: string): Promise<IssueDocument> {
  let raw: string;

  try {
    raw = await readFile(issueFile, "utf8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      throw new ArticleHubError("ISSUE_FILE_NOT_FOUND", `Issue 文件不存在：${issueFile}`);
    }

    throw error;
  }

  try {
    return JSON.parse(raw) as IssueDocument;
  } catch {
    throw new ArticleHubError("INVALID_JSON", `Issue 文件不是有效 JSON：${issueFile}`);
  }
}

function normalizeComments(value: unknown): IssueComment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is IssueComment => item !== null && typeof item === "object");
}

function normalizeCommentActor(comment: IssueComment) {
  return normalizeActor(
    comment.author ?? comment.user,
    comment.authorAssociation ?? comment.author_association
  );
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

function normalizeActor(value: IssueActor | undefined, associationFallback?: unknown) {
  const login = typeof value?.login === "string" ? value.login : "";
  const type = typeof value?.type === "string" ? value.type : "User";
  const associationSource =
    typeof value?.association === "string" ? value.association : associationFallback;
  const association = typeof associationSource === "string" ? associationSource : "NONE";
  const bot = value?.is_bot === true || value?.isBot === true || type === "Bot" || login.endsWith("[bot]");

  return {
    login,
    type,
    association,
    authorized: !bot && authorizedAssociations.has(association),
    bot
  };
}

function normalizeCommentId(value: unknown) {
  return typeof value === "number" || typeof value === "string" ? value : null;
}
