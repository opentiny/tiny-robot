export type ErrorCode =
  | "UNKNOWN_COMMAND"
  | "UNKNOWN_OPTION"
  | "UNEXPECTED_ARGUMENT"
  | "MISSING_ARGUMENT"
  | "MISSING_ISSUE_FILE"
  | "ISSUE_FILE_NOT_FOUND"
  | "ARTICLE_FILE_NOT_FOUND"
  | "INVALID_JSON"
  | "PLAN_FILE_NOT_FOUND"
  | "STATE_FILE_NOT_FOUND"
  | "PROJECT_CONFIG_NOT_FOUND"
  | "INVALID_PLAN"
  | "INVALID_STATE"
  | "INVALID_PROJECT_CONFIG"
  | "UNKNOWN_PROJECT"
  | "UNSAFE_PATH"
  | "GIT_COMMAND_FAILED";

/**
 * CLI 可预期错误，携带稳定错误码和进程退出码。
 */
export class ArticleHubError extends Error {
  readonly code: ErrorCode;
  readonly exitCode: number;

  constructor(code: ErrorCode, message: string, exitCode = 1) {
    super(message);
    this.name = "ArticleHubError";
    this.code = code;
    this.exitCode = exitCode;
  }
}

/**
 * 将未知异常收敛为稳定错误 envelope 可使用的错误对象。
 */
export function toArticleHubError(error: unknown): ArticleHubError {
  if (error instanceof ArticleHubError) {
    return error;
  }

  if (error instanceof Error) {
    return new ArticleHubError("UNKNOWN_COMMAND", error.message, 1);
  }

  return new ArticleHubError("UNKNOWN_COMMAND", "未知错误", 1);
}
