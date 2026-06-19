import { readFile } from "node:fs/promises";

import { parse } from "yaml";

import { loadProjectConfig } from "./project-config.js";
import { ArticleHubError } from "../infrastructure/errors.js";

/**
 * 单条文章校验问题；`field` 指向 Front Matter 或 Markdown 契约字段。
 */
export interface ArticleValidationIssue {
  field?: string;
  message: string;
}

/**
 * `validate article` 命令的稳定 JSON envelope。
 */
export interface ArticleValidationResult {
  ok: true;
  schema_version: "article-hub.validate-article.v1";
  valid: boolean;
  blocking_issues: ArticleValidationIssue[];
  warnings: ArticleValidationIssue[];
  dry_run: boolean;
}

/**
 * 文章校验入口参数；`dryRun` 只影响输出标记，不改变只读校验行为。
 */
export interface ValidateArticleFileOptions {
  articleFile: string;
  configPath: string;
  dryRun: boolean;
}

const requiredFrontMatterFields = [
  "schema_version",
  "title",
  "summary",
  "project",
  "article_type",
  "style_profile",
  "sources",
  "approved_plan",
  "article_date"
] as const;
const allowedArticleTypes = new Set(["release", "practical-guide", "source-analysis", "case-study"]);
const allowedStyleProfiles = new Set([
  "official-balanced",
  "developer-friendly",
  "release-promotional",
  "technical-deep-dive"
]);
const placeholderPatterns = [
  { token: "TODO", pattern: /\bTODO\b/i },
  { token: "TBD", pattern: /\bTBD\b/i },
  { token: "待补充", pattern: /待补充/ },
  { token: "lorem ipsum", pattern: /lorem ipsum/i }
];

/**
 * 校验阶段 A 文章的 Front Matter 与 Markdown 基础契约。
 * 该函数只返回阻断项和 warning，不执行 Git、GitHub、图片解码或 Mermaid 派生产物校验。
 *
 * @param options 文章路径、项目配置路径和 dry-run 标记。
 * @returns 版本化校验 envelope；文章不合法时通过 `valid=false` 和阻断项表达。
 * @throws ArticleHubError 当文章文件或项目配置不存在、项目配置无效时抛出。
 */
export async function validateArticleFile(
  options: ValidateArticleFileOptions
): Promise<ArticleValidationResult> {
  const blockingIssues: ArticleValidationIssue[] = [];
  const warnings: ArticleValidationIssue[] = [];
  const projectConfig = await loadProjectConfig(options.configPath);
  const markdown = await readArticleFile(options.articleFile);
  const parsed = parseArticle(markdown, blockingIssues);

  if (parsed) {
    validateFrontMatter(parsed.frontMatter, projectConfig.projects.map((project) => project.project_id), blockingIssues);
    validateHeading(parsed.body, parsed.frontMatter, blockingIssues);
    validateCodeFences(parsed.body, blockingIssues);
    validatePlaceholders(parsed.body, blockingIssues);
  }

  return {
    ok: true,
    schema_version: "article-hub.validate-article.v1",
    valid: blockingIssues.length === 0,
    blocking_issues: blockingIssues,
    warnings,
    dry_run: options.dryRun
  };
}

async function readArticleFile(articleFile: string): Promise<string> {
  try {
    return await readFile(articleFile, "utf8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      throw new ArticleHubError("ARTICLE_FILE_NOT_FOUND", `文章文件不存在：${articleFile}`);
    }

    throw error;
  }
}

function parseArticle(
  markdown: string,
  blockingIssues: ArticleValidationIssue[]
): { frontMatter: Record<string, unknown>; body: string } | undefined {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(markdown);

  if (!match) {
    blockingIssues.push({ message: "Markdown 文件必须包含 YAML Front Matter" });
    return undefined;
  }

  try {
    const parsed = parse(match[1]) as unknown;

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      blockingIssues.push({ message: "Front Matter 必须是 YAML object" });
      return undefined;
    }

    return {
      frontMatter: parsed as Record<string, unknown>,
      body: match[2]
    };
  } catch {
    blockingIssues.push({ message: "Front Matter 不是有效 YAML" });
    return undefined;
  }
}

function validateFrontMatter(
  frontMatter: Record<string, unknown>,
  allowedProjects: string[],
  blockingIssues: ArticleValidationIssue[]
): void {
  for (const field of requiredFrontMatterFields) {
    if (isMissing(frontMatter[field])) {
      blockingIssues.push({
        field,
        message: `Front Matter 缺少必填字段：${field}`
      });
    }
  }

  validateKnownProject(frontMatter.project, allowedProjects, blockingIssues);
  validateEnum(frontMatter.article_type, allowedArticleTypes, "article_type", blockingIssues);
  validateEnum(frontMatter.style_profile, allowedStyleProfiles, "style_profile", blockingIssues);
  validateApprovedPlan(frontMatter.approved_plan, blockingIssues);
  validateSources(frontMatter.sources, blockingIssues);
}

function validateKnownProject(
  project: unknown,
  allowedProjects: string[],
  blockingIssues: ArticleValidationIssue[]
): void {
  if (typeof project !== "string" || project.length === 0) {
    return;
  }

  if (!allowedProjects.includes(project)) {
    blockingIssues.push({
      field: "project",
      message: `Front Matter project 不在阶段 A 项目白名单中：${project}`
    });
  }
}

function validateEnum(
  value: unknown,
  allowedValues: Set<string>,
  field: string,
  blockingIssues: ArticleValidationIssue[]
): void {
  if (typeof value !== "string" || value.length === 0) {
    return;
  }

  if (!allowedValues.has(value)) {
    blockingIssues.push({
      field,
      message: `Front Matter ${field} 不受支持：${value}`
    });
  }
}

function validateApprovedPlan(
  approvedPlan: unknown,
  blockingIssues: ArticleValidationIssue[]
): void {
  if (approvedPlan === null || typeof approvedPlan !== "object" || Array.isArray(approvedPlan)) {
    if (!isMissing(approvedPlan)) {
      blockingIssues.push({
        field: "approved_plan",
        message: "approved_plan 必须是 object"
      });
    }

    return;
  }

  const plan = approvedPlan as Record<string, unknown>;

  if (isMissing(plan.version)) {
    blockingIssues.push({
      field: "approved_plan.version",
      message: "approved_plan 缺少 version"
    });
  }

  if (isMissing(plan.hash)) {
    blockingIssues.push({
      field: "approved_plan.hash",
      message: "approved_plan 缺少 hash"
    });
  }
}

function validateSources(
  sources: unknown,
  blockingIssues: ArticleValidationIssue[]
): void {
  if (!Array.isArray(sources) || sources.length === 0) {
    blockingIssues.push({
      field: "sources",
      message: "Front Matter sources 至少包含一项"
    });
    return;
  }

  sources.forEach((source, index) => {
    if (source === null || typeof source !== "object" || Array.isArray(source)) {
      blockingIssues.push({
        field: `sources[${index}]`,
        message: `sources[${index}] 必须是 object`
      });
      return;
    }

    const item = source as Record<string, unknown>;

    if (!hasAnyString(item, ["id", "name", "repository", "url"])) {
      blockingIssues.push({
        field: `sources[${index}]`,
        message: `sources[${index}] 缺少来源标识`
      });
    }

    if (!hasAnyString(item, ["commit", "hash", "content_hash", "resolved_commit"])) {
      blockingIssues.push({
        field: `sources[${index}]`,
        message: `sources[${index}] 缺少 commit/hash 稳定定位字段`
      });
    }
  });
}

function validateHeading(
  body: string,
  frontMatter: Record<string, unknown>,
  blockingIssues: ArticleValidationIssue[]
): void {
  const firstHeading = body.match(/^#\s+(.+?)\s*$/m)?.[1];

  if (!firstHeading) {
    blockingIssues.push({ message: "正文必须包含第一个 H1" });
    return;
  }

  if (typeof frontMatter.title === "string" && frontMatter.title !== firstHeading) {
    blockingIssues.push({
      field: "title",
      message: "Front Matter title 必须等于正文第一个 H1"
    });
  }
}

function validateCodeFences(body: string, blockingIssues: ArticleValidationIssue[]): void {
  let openFence: { marker: "`" | "~"; length: number } | undefined;

  for (const line of body.split(/\r?\n/)) {
    const fence = /^(`{3,}|~{3,})(.*)$/.exec(line);

    if (!fence) {
      continue;
    }

    const marker = fence[1][0] as "`" | "~";
    const length = fence[1].length;

    if (!openFence) {
      if (fence[2].trim().length === 0) {
        blockingIssues.push({ message: "fenced code block 必须标注语言" });
      }

      openFence = { marker, length };
      continue;
    }

    if (marker === openFence.marker && length >= openFence.length) {
      openFence = undefined;
    }
  }
}

function validatePlaceholders(body: string, blockingIssues: ArticleValidationIssue[]): void {
  for (const placeholder of placeholderPatterns) {
    if (placeholder.pattern.test(body)) {
      blockingIssues.push({ message: `文章包含阻断占位符：${placeholder.token}` });
    }
  }
}

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function hasAnyString(source: Record<string, unknown>, fields: string[]): boolean {
  return fields.some((field) => typeof source[field] === "string" && source[field].length > 0);
}
