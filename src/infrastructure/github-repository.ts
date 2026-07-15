import { ArticleHubError } from "./errors.js";
import { runCommand } from "./process.js";

/** 当前仓库推导失败时的稳定 reason。 */
export type RepositoryResolutionReason =
  | "not_git_repository"
  | "origin_missing"
  | "origin_ambiguous"
  | "unsupported_origin"
  | "invalid_origin"
  | "unsafe_repository";

/**
 * 从当前 Git worktree 的单一 `github.com` origin 推导出的仓库标识。
 */
export interface ResolvedGithubRepository {
  /** `owner/repo` 形式，用于 JSON contract 与 mutation plan。 */
  repository: string;
  owner: string;
  name: string;
  /** `github.com/owner/repo`，用于 `gh --repo`。 */
  repoWithHost: string;
}

const SAFE_NAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

/**
 * 从调用进程 cwd 所属 Git worktree 的 `origin` 推导唯一 `github.com` 仓库。
 *
 * dry-run 与真实 mutation 共用此 guard；失败时不访问 GitHub。
 *
 * @param options 可选工作目录，默认 `process.cwd()`。
 * @returns 规范化后的 owner/repo 与带 host 的 gh 目标。
 * @throws ArticleHubError 当 cwd 不在 Git worktree、origin 缺失/歧义、
 *   host 不受支持或 owner/repo 不安全时，错误码为 `CURRENT_REPOSITORY_INVALID`。
 */
export async function resolveCurrentGithubRepository(
  options: { cwd?: string } = {}
): Promise<ResolvedGithubRepository> {
  const cwd = options.cwd ?? process.cwd();

  try {
    await runCommand("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      errorCode: "GIT_COMMAND_FAILED"
    });
  } catch {
    throw currentRepositoryInvalid("not_git_repository", "当前目录不在 Git worktree 内");
  }

  let rawOrigin: string;

  try {
    rawOrigin = await runCommand("git", ["remote", "get-url", "--all", "origin"], {
      cwd,
      errorCode: "GIT_COMMAND_FAILED"
    });
  } catch {
    throw currentRepositoryInvalid("origin_missing", "缺少 origin remote");
  }

  const urls = rawOrigin
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (urls.length === 0) {
    throw currentRepositoryInvalid("origin_missing", "缺少 origin remote");
  }

  // 规范化后去重；多个不同 URL 视为歧义，避免静默选错目标。
  const uniqueNormalized = [...new Set(urls.map(normalizeRemoteUrlKey))];

  if (uniqueNormalized.length > 1) {
    throw currentRepositoryInvalid("origin_ambiguous", "origin 存在多个不同的 URL");
  }

  return parseGithubRemoteUrl(urls[0]);
}

/**
 * 将 remote URL 解析为安全的 github.com owner/repo。
 *
 * 支持常见 HTTPS / SSH 形式；不回显完整 URL 到错误 details。
 */
function parseGithubRemoteUrl(url: string): ResolvedGithubRepository {
  const trimmed = url.trim();
  let pathPart: string | undefined;
  let host: string | undefined;

  const httpsMatch = /^https:\/\/([^/]+)\/(.+?)$/i.exec(trimmed);
  if (httpsMatch) {
    host = httpsMatch[1].toLowerCase();
    pathPart = httpsMatch[2];
  }

  const sshUriMatch = /^ssh:\/\/(?:git@)?([^/]+)\/(.+?)$/i.exec(trimmed);
  if (!pathPart && sshUriMatch) {
    host = sshUriMatch[1].toLowerCase();
    pathPart = sshUriMatch[2];
  }

  const scpMatch = /^(?:git@)?([^:]+):(.+?)$/i.exec(trimmed);
  if (!pathPart && scpMatch && !trimmed.includes("://")) {
    host = scpMatch[1].toLowerCase();
    pathPart = scpMatch[2];
  }

  if (!host || !pathPart) {
    throw currentRepositoryInvalid("invalid_origin", "无法解析 origin remote URL");
  }

  if (host !== "github.com") {
    throw currentRepositoryInvalid("unsupported_origin", "origin 不是 github.com");
  }

  const cleaned = pathPart.replace(/\/+$/, "").replace(/\.git$/i, "");
  const segments = cleaned.split("/").filter((segment) => segment.length > 0);

  if (segments.length !== 2) {
    throw currentRepositoryInvalid("invalid_origin", "无法从 origin 解析 owner/repo");
  }

  const [owner, name] = segments;

  if (
    !SAFE_NAME_PATTERN.test(owner) ||
    !SAFE_NAME_PATTERN.test(name) ||
    owner === "." ||
    owner === ".." ||
    name === "." ||
    name === ".."
  ) {
    throw currentRepositoryInvalid("unsafe_repository", "owner 或 repository 名称不安全");
  }

  return {
    owner,
    name,
    repository: `${owner}/${name}`,
    repoWithHost: `github.com/${owner}/${name}`
  };
}

/**
 * 用于 origin URL 去重的规范化键；不用于最终解析结果。
 */
function normalizeRemoteUrlKey(url: string): string {
  return url.trim().replace(/\/+$/, "").replace(/\.git$/i, "").toLowerCase();
}

function currentRepositoryInvalid(
  reason: RepositoryResolutionReason,
  message: string
): ArticleHubError {
  return new ArticleHubError("CURRENT_REPOSITORY_INVALID", message, 2, {
    stage: "repository-resolution",
    mutation_state: "not_started",
    retry_safe: true,
    reason
  });
}
