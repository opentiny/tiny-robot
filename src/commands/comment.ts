import {
  type CommentTargetKind,
  publishComment
} from "../infrastructure/github-comment.js";
import { ArticleHubError } from "../infrastructure/errors.js";

/** `comment publish` 命令输入。 */
export interface PublishCommentCommandOptions {
  target: string;
  number: number;
  bodyFile: string;
  dryRun: boolean;
  cwd?: string;
}

/**
 * 执行 `comment publish`：文件正文 + 当前仓库推导 + 可选真实发布。
 *
 * @param options CLI 已解析的 target/number/body-file 与 dry-run。
 * @returns `article-hub.comment.publish` envelope。
 * @throws ArticleHubError 参数、仓库、文件或 GitHub 边界失败时抛出。
 */
export async function publishCommentCommand(
  options: PublishCommentCommandOptions
): Promise<unknown> {
  const target = parseTarget(options.target);

  if (!Number.isSafeInteger(options.number) || options.number <= 0) {
    throw commentLocalArgumentError("参数值必须是正整数：--number");
  }

  return publishComment({
    target,
    number: options.number,
    bodyFile: options.bodyFile,
    dryRun: options.dryRun,
    cwd: options.cwd
  });
}

function parseTarget(value: string): CommentTargetKind {
  if (value === "pr" || value === "issue") {
    return value;
  }

  throw commentLocalArgumentError("参数值必须是 pr 或 issue：--target");
}

/**
 * comment publish 本地参数 guard：mutation 未开始，调用方可修正后重试。
 */
function commentLocalArgumentError(message: string): ArticleHubError {
  return new ArticleHubError("MISSING_ARGUMENT", message, 2, {
    stage: "argument",
    mutation_state: "not_started",
    retry_safe: true
  });
}
