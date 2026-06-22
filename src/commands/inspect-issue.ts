import { readFile } from "node:fs/promises";

import { parseAiCommand } from "../domain/command-parser.js";
import { ArticleHubError } from "../infrastructure/errors.js";

interface IssueActor {
  login?: unknown;
  type?: unknown;
  association?: unknown;
}

interface IssueComment {
  id?: unknown;
  body?: unknown;
  author?: IssueActor;
  user?: IssueActor;
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

export interface InspectIssueOptions {
  issueFile: string;
  dryRun: boolean;
}

const authorizedAssociations = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

/**
 * 读取本地 Issue JSON fixture，提取只读事实和可识别固定命令。
 *
 * 该命令不执行任何 mutation；`actionable` 仅表示命令在权限和 bot 过滤后可进入后续处理器。
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
      const actor = normalizeActor(comment.author ?? comment.user);
      const parsed = typeof comment.body === "string" ? parseAiCommand(comment.body) : null;
      const wireParsed =
        parsed?.kind === "approve-writing-plan"
          ? {
              kind: parsed.kind,
              plan_version: parsed.planVersion,
              hash_prefix: parsed.hashPrefix
            }
          : null;

      return {
        source: "comment",
        comment_id: typeof comment.id === "number" ? comment.id : null,
        actor,
        body: typeof comment.body === "string" ? comment.body : "",
        parsed: wireParsed,
        actionable: wireParsed !== null && actor.authorized
      };
    })
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

function normalizeActor(value: IssueActor | undefined) {
  const login = typeof value?.login === "string" ? value.login : "";
  const type = typeof value?.type === "string" ? value.type : "User";
  const association = typeof value?.association === "string" ? value.association : "NONE";
  const bot = type === "Bot" || login.endsWith("[bot]");

  return {
    login,
    type,
    association,
    authorized: !bot && authorizedAssociations.has(association),
    bot
  };
}
