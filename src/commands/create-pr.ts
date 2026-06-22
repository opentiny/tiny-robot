import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "yaml";

import { validateArticleFile } from "../domain/article-validation.js";
import { ArticleHubError } from "../infrastructure/errors.js";
import { runCommand } from "../infrastructure/process.js";

interface ArticleFrontMatter {
  project?: unknown;
}

interface PrOperation {
  kind: string;
  [key: string]: unknown;
}

// slug 会进入分支名，限制为小写字母、数字和连字符，且必须以字母或数字开头。
const safeSlugPattern = /^[a-z0-9][a-z0-9-]*$/;
// repository 会传给 GitHub CLI，要求为 owner/name 形式，且两段仅允许仓库名常见安全字符。
const safeRepositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
// base 是远端分支引用，允许斜杠分层，但排除空白、shell 元字符和反斜杠路径。
const safeBasePattern = /^[A-Za-z0-9._/-]+$/;

/**
 * 校验文章产物并创建或更新对应 Draft PR。
 *
 * @param options 文章路径、目标 Issue、仓库和 PR 元数据。
 * @returns 版本化 mutation plan；dry-run 时不执行 Git 或 GitHub 写操作。
 * @throws ArticleHubError 当文章无效、路径不安全或 Git/GitHub 命令失败时抛出。
 */
export async function createPullRequest(options: {
  articleFile: string;
  configPath: string;
  issueNumber: number;
  repository: string;
  base: string;
  slug: string;
  title: string;
  bodyFile: string;
  dryRun: boolean;
}): Promise<unknown> {
  assertSafeCreatePrInput(options);

  const validation = await validateArticleFile({
    articleFile: options.articleFile,
    configPath: options.configPath,
    dryRun: options.dryRun
  });

  if (!validation.valid) {
    throw new ArticleHubError(
      "ARTICLE_VALIDATION_FAILED",
      validation.blocking_issues[0]?.message ?? "文章校验失败"
    );
  }

  const frontMatter = await readArticleFrontMatter(options.articleFile);
  const project = readRequiredString(frontMatter.project, "project");
  const title = options.title;
  const articleDirectory = path.dirname(options.articleFile);
  const branch = `article/${options.issueNumber}-${project}-${options.slug}`;
  const operations = plannedCreatePrOperations({
    articleDirectory,
    branch,
    repository: options.repository,
    base: options.base,
    title,
    bodyFile: options.bodyFile
  });

  if (!options.dryRun) {
    await applyCreatePrOperations({
      articleDirectory,
      branch,
      repository: options.repository,
      base: options.base,
      title,
      bodyFile: options.bodyFile
    });
  }

  return {
    ok: true,
    schema_version: "article-hub.create-pr",
    dry_run: options.dryRun,
    valid: true,
    draft: true,
    branch,
    article: {
      file: options.articleFile,
      directory: articleDirectory,
      project,
      title
    },
    pull_request: {
      repository: options.repository,
      base: options.base,
      title,
      body_file: options.bodyFile
    },
    validation: {
      blocking_issues: validation.blocking_issues,
      warnings: validation.warnings
    },
    mutation_plan: {
      operations
    }
  };
}

function assertSafeCreatePrInput(options: {
  issueNumber: number;
  repository: string;
  base: string;
  slug: string;
  title: string;
  bodyFile: string;
}): void {
  if (!Number.isSafeInteger(options.issueNumber) || options.issueNumber <= 0) {
    throw new ArticleHubError("MISSING_ARGUMENT", "参数值必须是正整数：--issue-number", 2);
  }

  if (!safeRepositoryPattern.test(options.repository)) {
    throw new ArticleHubError("UNSAFE_PATH", `GitHub 仓库名不安全：${options.repository}`, 2);
  }

  if (!safeBasePattern.test(options.base)) {
    throw new ArticleHubError("UNSAFE_PATH", `base 分支名不安全：${options.base}`, 2);
  }

  if (!safeSlugPattern.test(options.slug)) {
    throw new ArticleHubError("UNSAFE_PATH", `文章 slug 不安全：${options.slug}`, 2);
  }

  if (options.title.trim().length === 0) {
    throw new ArticleHubError("MISSING_ARGUMENT", "参数值不能为空：--title", 2);
  }

  if (options.bodyFile.trim().length === 0) {
    throw new ArticleHubError("MISSING_ARGUMENT", "参数值不能为空：--body-file", 2);
  }
}

async function readArticleFrontMatter(articleFile: string): Promise<ArticleFrontMatter> {
  const markdown = await readFile(articleFile, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(markdown);

  if (!match) {
    throw new ArticleHubError("ARTICLE_VALIDATION_FAILED", "Markdown 文件缺少 Front Matter");
  }

  const parsed = parse(match[1]) as unknown;

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ArticleHubError("ARTICLE_VALIDATION_FAILED", "Front Matter 必须是 YAML object");
  }

  return parsed as ArticleFrontMatter;
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ArticleHubError("ARTICLE_VALIDATION_FAILED", `Front Matter 字段无效：${fieldName}`);
  }

  return value;
}

function plannedCreatePrOperations(options: {
  articleDirectory: string;
  branch: string;
  repository: string;
  base: string;
  title: string;
  bodyFile: string;
}): PrOperation[] {
  return [
    {
      kind: "validate-article",
      path: path.join(options.articleDirectory, "article.md")
    },
    {
      kind: "git-add",
      path: options.articleDirectory
    },
    {
      kind: "git-commit",
      message: `article: update ${options.title}`
    },
    {
      kind: "git-push",
      branch: options.branch
    },
    {
      kind: "gh-pr-create-or-update",
      repository: options.repository,
      base: options.base,
      branch: options.branch,
      draft: true,
      body_file: options.bodyFile
    }
  ];
}

async function applyCreatePrOperations(options: {
  articleDirectory: string;
  branch: string;
  repository: string;
  base: string;
  title: string;
  bodyFile: string;
}): Promise<void> {
  await runCommand("git", ["checkout", "-B", options.branch]);
  await runCommand("git", ["add", options.articleDirectory]);
  const stagedFiles = await runCommand("git", [
    "diff",
    "--cached",
    "--name-only",
    "--",
    options.articleDirectory
  ]);

  if (stagedFiles.length > 0) {
    await runCommand("git", [
      "commit",
      "-m",
      `article: update ${options.title}`,
      "--",
      options.articleDirectory
    ]);
  }

  await runCommand("git", ["push", "-u", "origin", `HEAD:${options.branch}`]);

  const existingPr = await findExistingPullRequest(options.repository, options.branch);

  if (existingPr) {
    await runCommand(
      "gh",
      [
        "pr",
        "edit",
        String(existingPr.number),
        "--repo",
        options.repository,
        "--title",
        options.title,
        "--body-file",
        options.bodyFile
      ],
      { errorCode: "GITHUB_COMMAND_FAILED" }
    );
    return;
  }

  await runCommand(
    "gh",
    [
      "pr",
      "create",
      "--repo",
      options.repository,
      "--draft",
      "--base",
      options.base,
      "--head",
      options.branch,
      "--title",
      options.title,
      "--body-file",
      options.bodyFile
    ],
    { errorCode: "GITHUB_COMMAND_FAILED" }
  );
}

async function findExistingPullRequest(
  repository: string,
  branch: string
): Promise<{ number: number } | null> {
  const raw = await runCommand(
    "gh",
    ["pr", "list", "--repo", repository, "--head", branch, "--json", "number", "--limit", "1"],
    { errorCode: "GITHUB_COMMAND_FAILED" }
  );
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return null;
  }

  const first = parsed[0] as { number?: unknown };

  return typeof first.number === "number" ? { number: first.number } : null;
}
