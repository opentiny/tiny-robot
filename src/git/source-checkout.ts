import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { promisify } from "node:util";

import {
  ProjectConfigEntry,
  ProjectRepositoryConfig,
  safeCheckoutPath
} from "../domain/project-config.js";
import { ArticleHubError } from "../infrastructure/errors.js";

const execFileAsync = promisify(execFile);

export interface SourceManifestEntry {
  name: string;
  repo: string;
  requested_ref: string;
  resolved_commit: string;
  checkout_path: string;
  fixed: boolean;
  role: string;
  source_type: string;
  verified: boolean;
}

export interface SourceCheckoutResult {
  mutation_plan: {
    operations: SourceCheckoutOperation[];
  };
  source_manifest: {
    schema_version: "article-hub.source-manifest";
    project_id: string;
    sources: SourceManifestEntry[];
  };
}

export interface SourceCheckoutOperation {
  kind: "clone-or-fetch";
  repo: string;
  url: string;
  requested_ref: string;
  checkout_path: string;
}

/**
 * 生成或执行源码 checkout，所有 Git 调用均使用 `execFile` 避免 shell 注入。
 */
export async function checkoutProjectSources(options: {
  project: ProjectConfigEntry;
  cacheDir: string;
  dryRun: boolean;
}): Promise<SourceCheckoutResult> {
  const operations = options.project.repositories.map((repository) => ({
    kind: "clone-or-fetch" as const,
    repo: repository.name,
    url: repository.url,
    requested_ref: requestedRef(repository),
    checkout_path: safeCheckoutPath(options.cacheDir, repository)
  }));

  if (options.dryRun) {
    return {
      mutation_plan: {
        operations
      },
      source_manifest: {
        schema_version: "article-hub.source-manifest",
        project_id: options.project.project_id,
        sources: []
      }
    };
  }

  const sources: SourceManifestEntry[] = [];

  await mkdir(options.cacheDir, { recursive: true });

  for (const repository of options.project.repositories) {
    const checkoutPath = safeCheckoutPath(options.cacheDir, repository);
    const ref = requestedRef(repository);

    await cloneOrFetch(repository.url, checkoutPath);
    const resolvedCommit = await resolveCommit(checkoutPath, ref);
    await runGit(checkoutPath, ["checkout", "--detach", resolvedCommit]);
    const actualHead = await runGit(checkoutPath, ["rev-parse", "HEAD"]);

    if (actualHead !== resolvedCommit) {
      throw new ArticleHubError(
        "GIT_COMMAND_FAILED",
        `checkout 后 HEAD 与目标 Commit 不一致：${repository.name}`
      );
    }

    if (repository.required_commit && repository.required_commit !== resolvedCommit) {
      throw new ArticleHubError(
        "GIT_COMMAND_FAILED",
        `resolved commit 与 required_commit 不一致：${repository.name}`
      );
    }

    sources.push({
      name: repository.name,
      repo: repository.url,
      requested_ref: ref,
      resolved_commit: resolvedCommit,
      checkout_path: checkoutPath,
      fixed: true,
      role: repository.role,
      source_type: repository.source_type,
      verified: true
    });
  }

  return {
    mutation_plan: {
      operations
    },
    source_manifest: {
      schema_version: "article-hub.source-manifest",
      project_id: options.project.project_id,
      sources
    }
  };
}

function requestedRef(repository: ProjectRepositoryConfig): string {
  return repository.ref ?? repository.default_ref ?? "";
}

async function cloneOrFetch(url: string, checkoutPath: string): Promise<void> {
  try {
    await runGit(checkoutPath, ["rev-parse", "--git-dir"]);
    await runGit(checkoutPath, ["remote", "set-url", "origin", url]);
    await runGit(checkoutPath, ["fetch", "--prune", "origin"]);
  } catch {
    await mkdir(checkoutPath, { recursive: true });
    await runGit(undefined, ["clone", "--no-checkout", url, checkoutPath]);
    await runGit(checkoutPath, ["fetch", "--prune", "origin"]);
  }
}

async function resolveCommit(checkoutPath: string, ref: string): Promise<string> {
  if (/^[0-9a-f]{40}$/.test(ref)) {
    return runGit(checkoutPath, ["rev-parse", "--verify", `${ref}^{commit}`]);
  }

  try {
    return await runGit(checkoutPath, ["rev-parse", "--verify", `origin/${ref}^{commit}`]);
  } catch {
    return runGit(checkoutPath, ["rev-parse", "--verify", `${ref}^{commit}`]);
  }
}

async function runGit(cwd: string | undefined, args: string[]): Promise<string> {
  try {
    const result = await execFileAsync("git", args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 10
    });

    return result.stdout.trim();
  } catch (error) {
    const nodeError = error as { stderr?: string; message?: string };
    const message = nodeError.stderr?.trim() || nodeError.message || "Git 命令执行失败";

    throw new ArticleHubError("GIT_COMMAND_FAILED", message);
  }
}
