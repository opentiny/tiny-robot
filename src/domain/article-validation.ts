import { constants } from "node:fs";
import { access, readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

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
  schema_version: "article-hub.validate-article";
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
const articleSchemaVersion = "article-hub.article";
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
const chineseTextPattern = /[\u3400-\u9fff]/;
const allowedHtmlTags = new Set([
  "abbr",
  "b",
  "br",
  "caption",
  "cite",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "i",
  "ins",
  "kbd",
  "mark",
  "p",
  "q",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u"
]);
const forbiddenHtmlTags = new Set([
  "base",
  "button",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "meta",
  "object",
  "script",
  "style",
  "textarea"
]);
const executableUrlAttributes = new Set(["action", "cite", "formaction", "href", "src", "xlink:href"]);

interface ParsedMarkdownValue {
  value: string;
  endIndex: number;
}

interface ParsedBracketValue extends ParsedMarkdownValue {
  closed: boolean;
}

interface MarkdownLink {
  target?: string;
  referenceId?: string;
}

interface MarkdownScanContext {
  closingBracketByOpeningIndex: Map<number, number>;
  closingParenthesisByOpeningIndex: Map<number, number>;
}

interface HtmlTagScanResult {
  tagName: string;
  attributeSource: string;
  closingTag: boolean;
  endIndex: number;
}

interface HtmlTagPrefix {
  tagName: string;
  closingTag: boolean;
  attributeStart: number;
}

interface MarkdownAutolink {
  value: string;
  email: boolean;
  endIndex: number;
}

interface MarkdownFence {
  marker: "`" | "~";
  length: number;
  trailing: string;
}

type LocalPathResult =
  | { value: string }
  | { error: "empty" | "malformed-percent-encoding" | "unsafe" };

/**
 * 校验文章的 Front Matter、Markdown 与本地素材契约。
 * 该函数只读取文章目录内文件，不执行 Git、GitHub、外链下载或派生产物生成。
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
    validatePlaceholders(parsed.frontMatterSource, blockingIssues);
    validatePlaceholders(parsed.body, blockingIssues);
    const bodyWithoutFencedCodeBlocks = removeFencedCodeBlocks(parsed.body);
    const bodyWithoutCode = removeInlineCodeSpans(bodyWithoutFencedCodeBlocks);
    validateMarkdownBoundary(bodyWithoutCode, blockingIssues);
    await validateMarkdownLinks(options.articleFile, bodyWithoutCode, blockingIssues);
    await validateArticleAssets(options.articleFile, bodyWithoutCode, blockingIssues);
  }

  return {
    ok: true,
    schema_version: "article-hub.validate-article",
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
): { frontMatter: Record<string, unknown>; frontMatterSource: string; body: string } | undefined {
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
      frontMatterSource: match[1],
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

  validateSchemaVersion(frontMatter.schema_version, blockingIssues);
  validateNonEmptyString(frontMatter.title, "title", blockingIssues);
  validateNonEmptyString(frontMatter.summary, "summary", blockingIssues);
  validateNonEmptyString(frontMatter.article_date, "article_date", blockingIssues);
  validateKnownProject(frontMatter.project, allowedProjects, blockingIssues);
  validateEnum(frontMatter.article_type, allowedArticleTypes, "article_type", blockingIssues);
  validateEnum(frontMatter.style_profile, allowedStyleProfiles, "style_profile", blockingIssues);
  validateApprovedPlan(frontMatter.approved_plan, blockingIssues);
  validateSources(frontMatter.sources, blockingIssues);
}

function validateSchemaVersion(
  schemaVersion: unknown,
  blockingIssues: ArticleValidationIssue[]
): void {
  if (isMissing(schemaVersion)) {
    return;
  }

  if (schemaVersion !== articleSchemaVersion) {
    blockingIssues.push({
      field: "schema_version",
      message: `Front Matter schema_version 必须是 ${articleSchemaVersion}`
    });
  }
}

function validateNonEmptyString(
  value: unknown,
  field: string,
  blockingIssues: ArticleValidationIssue[]
): void {
  if (isMissing(value)) {
    return;
  }

  if (typeof value !== "string" || value.length === 0) {
    blockingIssues.push({
      field,
      message: `Front Matter ${field} 必须是非空字符串`
    });
  }
}

function validateKnownProject(
  project: unknown,
  allowedProjects: string[],
  blockingIssues: ArticleValidationIssue[]
): void {
  if (isMissing(project)) {
    return;
  }

  if (typeof project !== "string") {
    blockingIssues.push({
      field: "project",
      message: "Front Matter project 必须是字符串"
    });
    return;
  }

  if (project.length === 0) {
    return;
  }

  if (!allowedProjects.includes(project)) {
    blockingIssues.push({
      field: "project",
      message: `Front Matter project 不在项目 allowlist 中：${project}`
    });
  }
}

function validateEnum(
  value: unknown,
  allowedValues: Set<string>,
  field: string,
  blockingIssues: ArticleValidationIssue[]
): void {
  if (isMissing(value)) {
    return;
  }

  if (typeof value !== "string") {
    blockingIssues.push({
      field,
      message: `Front Matter ${field} 必须是字符串`
    });
    return;
  }

  if (value.length === 0) {
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
  } else if (!isIntegerOrString(plan.version)) {
    blockingIssues.push({
      field: "approved_plan.version",
      message: "approved_plan.version 必须是整数或字符串"
    });
  }

  if (isMissing(plan.hash)) {
    blockingIssues.push({
      field: "approved_plan.hash",
      message: "approved_plan 缺少 hash"
    });
  } else if (typeof plan.hash !== "string") {
    blockingIssues.push({
      field: "approved_plan.hash",
      message: "approved_plan.hash 必须是字符串"
    });
  } else if (plan.hash.length < 8) {
    blockingIssues.push({
      field: "approved_plan.hash",
      message: "approved_plan.hash 长度不能小于 8"
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
    const fence = readMarkdownFence(line);

    if (!fence) {
      continue;
    }

    if (!openFence) {
      if (!canOpenMarkdownFence(fence)) {
        continue;
      }

      if (fence.trailing.trim().length === 0) {
        blockingIssues.push({ message: "fenced code block 必须标注语言" });
      }

      openFence = { marker: fence.marker, length: fence.length };
      continue;
    }

    if (
      fence.marker === openFence.marker &&
      fence.length >= openFence.length &&
      fence.trailing.trim().length === 0
    ) {
      openFence = undefined;
    }
  }
}

function readMarkdownFence(line: string): MarkdownFence | undefined {
  const match = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);

  if (!match) {
    return undefined;
  }

  return {
    marker: match[2][0] as "`" | "~",
    length: match[2].length,
    trailing: match[3]
  };
}

function canOpenMarkdownFence(fence: MarkdownFence): boolean {
  // CommonMark 禁止 backtick fence 的 info string 再包含 backtick，否则该行只是普通文本。
  return fence.marker === "~" || !fence.trailing.includes("`");
}

function validatePlaceholders(body: string, blockingIssues: ArticleValidationIssue[]): void {
  for (const placeholder of placeholderPatterns) {
    if (placeholder.pattern.test(body)) {
      blockingIssues.push({ message: `文章包含阻断占位符：${placeholder.token}` });
    }
  }
}

function validateMarkdownBoundary(
  body: string,
  blockingIssues: ArticleValidationIssue[]
): void {
  validateMdxEsm(body, blockingIssues);
  validateAutolinks(body, blockingIssues);
  validateMdxFragments(body, blockingIssues);
  validateMdxJsxExpressions(body, blockingIssues);
  validateHtmlTags(body, blockingIssues);
}

function validateAutolinks(body: string, blockingIssues: ArticleValidationIssue[]): void {
  for (let index = 0; index < body.length; index += 1) {
    if (body[index] !== "<" || isEscaped(body, index)) {
      continue;
    }

    const autolink = readMarkdownAutolink(body, index);

    if (!autolink) {
      continue;
    }

    if (!autolink.email && isExecutableHtmlUrl(autolink.value)) {
      blockingIssues.push({ message: "自动链接不允许使用可执行 URL" });
    }

    index = autolink.endIndex;
  }
}

function validateMdxEsm(body: string, blockingIssues: ArticleValidationIssue[]): void {
  const lines = body.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim();

    if (!/^(?:import|export)\b/.test(trimmedLine)) {
      continue;
    }

    const statement = collectMdxEsmStatement(lines, index);

    if (isMdxEsmStatement(statement.value)) {
      blockingIssues.push({ message: "正文禁止 MDX ESM import/export" });
    }

    index = statement.endIndex;
  }
}

function collectMdxEsmStatement(
  lines: string[],
  startIndex: number
): { value: string; endIndex: number } {
  const parts: string[] = [];
  let endIndex = startIndex;
  let inBlockComment = false;

  for (let index = startIndex; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim();

    if (trimmedLine.length === 0 && !inBlockComment) {
      break;
    }

    const startsInBlockComment = inBlockComment;
    const scannedLine = scanMdxEsmLine(lines[index], inBlockComment);
    const trimmedCode = scannedLine.value.trim();

    if (
      index > startIndex &&
      !startsInBlockComment &&
      /^(?:import|export)\b/.test(trimmedCode)
    ) {
      break;
    }

    parts.push(trimmedLine);
    endIndex = index;
    inBlockComment = scannedLine.inBlockComment;

    if (
      !inBlockComment &&
      (/[;}]\s*;?$/.test(trimmedCode) || /["']\s*;?$/.test(trimmedCode))
    ) {
      break;
    }
  }

  return { value: parts.join("\n").trim(), endIndex };
}

function scanMdxEsmLine(
  line: string,
  startsInBlockComment: boolean
): { value: string; inBlockComment: boolean } {
  // 为 statement collector 提供线性词法视图，避免 comment 内容伪造新候选或终止符。
  let value = "";
  let inBlockComment = startsInBlockComment;
  let quote: "\"" | "'" | "`" | undefined;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (inBlockComment) {
      if (character === "*" && line[index + 1] === "/") {
        inBlockComment = false;
        value += " ";
        index += 1;
      }

      continue;
    }

    if (quote) {
      value += character;

      if (character === "\\") {
        value += line[index + 1] ?? "";
        index += 1;
      } else if (character === quote) {
        quote = undefined;
      }

      continue;
    }

    if (character === "\"" || character === "'" || character === "`") {
      quote = character;
      value += character;
    } else if (character === "/" && line[index + 1] === "*") {
      inBlockComment = true;
      value += " ";
      index += 1;
    } else if (character === "/" && line[index + 1] === "/") {
      break;
    } else {
      value += character;
    }
  }

  return { value, inBlockComment };
}

function isMdxEsmStatement(statement: string): boolean {
  const normalizedStatement = stripMdxEsmComments(statement)
    .replace(/\s+/g, " ")
    .trim();

  return (
    /^import\s+(?:type\s+)?(?:[\w*{}\s,$]+from\s+)?["'][^"']+["']\s*;?$/.test(
      normalizedStatement
    ) ||
    /^export\s+(?:default\b|async\s+function\b|(?:const|let|var|function|class)\b|\{[^}]*\}(?:\s+from\s+["'][^"']+["'])?|\*\s+(?:as\s+[A-Za-z_$][\w$]*\s+)?from\s+["'][^"']+["'])/.test(
      normalizedStatement
    )
  );
}

function stripMdxEsmComments(statement: string): string {
  // 只移除字符串外的 JS comment，保留换行与字符串内容供后续 ESM 形态判断。
  let result = "";
  let quote: "\"" | "'" | "`" | undefined;

  for (let index = 0; index < statement.length; index += 1) {
    const character = statement[index];

    if (quote) {
      result += character;

      if (character === "\\") {
        result += statement[index + 1] ?? "";
        index += 1;
      } else if (character === quote) {
        quote = undefined;
      }

      continue;
    }

    if (character === "\"" || character === "'" || character === "`") {
      quote = character;
      result += character;
      continue;
    }

    if (character === "/" && statement[index + 1] === "*") {
      const commentEnd = statement.indexOf("*/", index + 2);

      // 未闭合 comment 不能吞掉后续独立 ESM 候选，保留换行以维持语句边界。
      if (commentEnd === -1) {
        return `${result} ${statement.slice(index).replace(/[^\r\n]/g, " ")}`;
      }

      result += " ";
      index = commentEnd + 1;
      continue;
    }

    if (character === "/" && statement[index + 1] === "/") {
      const lineEnd = statement.indexOf("\n", index + 2);

      if (lineEnd === -1) {
        return result;
      }

      result += "\n";
      index = lineEnd;
      continue;
    }

    result += character;
  }

  return result;
}

function validateMdxFragments(body: string, blockingIssues: ArticleValidationIssue[]): void {
  const reportedMessages = new Set<string>();

  for (let index = 0; index < body.length; index += 1) {
    if (body[index] !== "<" || isEscaped(body, index)) {
      continue;
    }

    if (body[index + 1] === ">" || (body[index + 1] === "/" && body[index + 2] === ">")) {
      pushUniqueIssue(reportedMessages, blockingIssues, "正文禁止 MDX/JSX fragment");
      return;
    }
  }
}

function validateMdxJsxExpressions(
  body: string,
  blockingIssues: ArticleValidationIssue[]
): void {
  const reportedMessages = new Set<string>();
  const bodyWithoutHtmlTags = removeHtmlTags(body);
  const closingBraceByOpeningIndex = createBraceScanContext(bodyWithoutHtmlTags);

  for (let index = 0; index < bodyWithoutHtmlTags.length; index += 1) {
    if (bodyWithoutHtmlTags[index] !== "{" || isEscaped(bodyWithoutHtmlTags, index)) {
      continue;
    }

    const endIndex = closingBraceByOpeningIndex.get(index);

    if (
      endIndex !== undefined &&
      bodyWithoutHtmlTags.slice(index + 1, endIndex).trim().length > 0
    ) {
      pushUniqueIssue(reportedMessages, blockingIssues, "正文禁止 MDX/JSX 表达式");
      index = endIndex;
    }
  }
}

function createBraceScanContext(body: string): Map<number, number> {
  const braceStack: number[] = [];
  const closingBraceByOpeningIndex = new Map<number, number>();

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];

    if (character === "{" && !isEscaped(body, index)) {
      braceStack.push(index);
      continue;
    }

    if (character === "}" && !isEscaped(body, index) && braceStack.length > 0) {
      closingBraceByOpeningIndex.set(braceStack.pop()!, index);
    }
  }

  return closingBraceByOpeningIndex;
}

function validateHtmlTags(body: string, blockingIssues: ArticleValidationIssue[]): void {
  // 单遍分类 autolink、HTML 与 JSX；forbidden tag 仅凭可信前缀即可 fail closed。
  const reportedMessages = new Set<string>();

  for (let index = 0; index < body.length; index += 1) {
    if (body[index] !== "<" || isEscaped(body, index)) {
      continue;
    }

    const autolink = readMarkdownAutolink(body, index);

    if (autolink) {
      index = autolink.endIndex;
      continue;
    }

    const prefix = readHtmlTagPrefix(body, index);

    if (!prefix) {
      continue;
    }

    const tagName = prefix.tagName;
    const tagKey = tagName.toLowerCase();
    const tag = readHtmlTag(body, index, prefix);

    if (forbiddenHtmlTags.has(tagKey)) {
      // 浏览器可把后续畸形内容继续吸收到 raw text tag 中，已识别前缀后必须 fail closed。
      pushUniqueIssue(reportedMessages, blockingIssues, `HTML 标签不允许使用：${tagKey}`);

      if (tag) {
        index = tag.endIndex;
      }

      continue;
    }

    if (!tag) {
      continue;
    }

    if (isMdxComponentTag(tagName)) {
      pushUniqueIssue(
        reportedMessages,
        blockingIssues,
        `正文禁止 MDX/JSX 自定义组件：${tagName}`
      );
      index = tag.endIndex;
      continue;
    }

    if (!allowedHtmlTags.has(tagKey)) {
      pushUniqueIssue(
        reportedMessages,
        blockingIssues,
        `HTML 标签不在当前 Markdown allowlist：${tagName}`
      );
      index = tag.endIndex;
      continue;
    }

    if (!tag.closingTag) {
      validateHtmlAttributes(tagKey, tag.attributeSource, reportedMessages, blockingIssues);
    }

    index = tag.endIndex;
  }
}

function removeHtmlTags(body: string): string {
  let result = "";
  let cursor = 0;

  for (let index = 0; index < body.length; index += 1) {
    if (body[index] !== "<" || isEscaped(body, index)) {
      continue;
    }

    const tag = readHtmlTag(body, index);

    if (!tag) {
      continue;
    }

    result += body.slice(cursor, index);
    result += body.slice(index, tag.endIndex + 1).replace(/[^\r\n]/g, " ");
    cursor = tag.endIndex + 1;
    index = tag.endIndex;
  }

  return result + body.slice(cursor);
}

function readHtmlTag(
  body: string,
  startIndex: number,
  knownPrefix = readHtmlTagPrefix(body, startIndex)
): HtmlTagScanResult | undefined {
  if (readMarkdownAutolink(body, startIndex) || !knownPrefix) {
    return undefined;
  }

  const tagEnd = findHtmlTagEnd(body, knownPrefix.attributeStart);

  if (tagEnd === undefined) {
    return undefined;
  }

  return {
    tagName: knownPrefix.tagName,
    attributeSource: body.slice(knownPrefix.attributeStart, tagEnd),
    closingTag: knownPrefix.closingTag,
    endIndex: tagEnd
  };
}

function readHtmlTagPrefix(body: string, startIndex: number): HtmlTagPrefix | undefined {
  let index = startIndex + 1;
  const closingTag = body[index] === "/";

  if (closingTag) {
    index += 1;
  }

  const identifierStartLength = readJsxIdentifierCodeUnitLength(body, index, true);

  if (identifierStartLength === 0) {
    return undefined;
  }

  const tagStart = index;
  index += identifierStartLength;

  while (index < body.length) {
    const identifierPartLength = readJsxIdentifierCodeUnitLength(body, index, false);

    if (identifierPartLength === 0) {
      break;
    }

    index += identifierPartLength;
  }

  return {
    tagName: body.slice(tagStart, index),
    closingTag,
    attributeStart: index
  };
}

function readJsxIdentifierCodeUnitLength(
  source: string,
  index: number,
  identifierStart: boolean
): number {
  const codePoint = source.codePointAt(index);

  if (codePoint === undefined) {
    return 0;
  }

  const character = String.fromCodePoint(codePoint);
  const pattern = identifierStart
    ? /^[$_\p{ID_Start}]$/u
    : /^[$\u200c\u200d\p{ID_Continue}.:-]$/u;

  return pattern.test(character) ? character.length : 0;
}

function readMarkdownAutolink(
  body: string,
  startIndex: number
): MarkdownAutolink | undefined {
  let endIndex = startIndex + 1;

  while (endIndex < body.length && body[endIndex] !== ">") {
    const codePoint = body.charCodeAt(endIndex);

    if (body[endIndex] === "<" || codePoint <= 0x20 || codePoint === 0x7f) {
      return undefined;
    }

    endIndex += 1;
  }

  if (body[endIndex] !== ">") {
    return undefined;
  }

  const value = body.slice(startIndex + 1, endIndex);

  if (/^[A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>]*$/.test(value)) {
    return { value, email: false, endIndex };
  }

  if (
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/.test(
      value
    )
  ) {
    return { value, email: true, endIndex };
  }

  return undefined;
}

function findHtmlTagEnd(body: string, startIndex: number): number | undefined {
  let quote: "\"" | "'" | undefined;

  for (let index = startIndex; index < body.length; index += 1) {
    const character = body[index];

    if (quote) {
      if (character === quote) {
        quote = undefined;
      }

      continue;
    }

    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }

    if (character === ">") {
      return index;
    }

    if (character === "<") {
      return undefined;
    }
  }

  return undefined;
}

function validateHtmlAttributes(
  tagName: string,
  attributeSource: string,
  reportedMessages: Set<string>,
  blockingIssues: ArticleValidationIssue[]
): void {
  let index = 0;

  while (index < attributeSource.length) {
    while (index < attributeSource.length && /[\s/]/.test(attributeSource[index])) {
      index += 1;
    }

    if (index >= attributeSource.length) {
      return;
    }

    if (attributeSource[index] === "{") {
      pushUniqueIssue(
        reportedMessages,
        blockingIssues,
        `HTML/JSX 属性不允许使用表达式：${tagName}`
      );
      index += 1;
      continue;
    }

    const attributeStart = index;

    while (index < attributeSource.length && !/[\s=/]/.test(attributeSource[index])) {
      index += 1;
    }

    const attributeName = attributeSource.slice(attributeStart, index);

    if (attributeName.length === 0) {
      index += 1;
      continue;
    }

    while (index < attributeSource.length && /\s/.test(attributeSource[index])) {
      index += 1;
    }

    let value = "";
    let expressionValue = false;

    if (attributeSource[index] === "=") {
      index += 1;

      while (index < attributeSource.length && /\s/.test(attributeSource[index])) {
        index += 1;
      }

      const parsedValue = readHtmlAttributeValue(attributeSource, index);
      value = parsedValue.value;
      expressionValue = parsedValue.expression;
      index = parsedValue.endIndex;
    }

    const attributeKey = attributeName.toLowerCase();

    if (attributeKey.startsWith("on")) {
      pushUniqueIssue(
        reportedMessages,
        blockingIssues,
        `HTML 属性不允许使用事件 handler：${tagName}.${attributeKey}`
      );
    }

    if (expressionValue) {
      pushUniqueIssue(
        reportedMessages,
        blockingIssues,
        `HTML/JSX 属性不允许使用表达式：${tagName}.${attributeName}`
      );
    }

    if (executableUrlAttributes.has(attributeKey) && isExecutableHtmlUrl(value)) {
      pushUniqueIssue(
        reportedMessages,
        blockingIssues,
        `HTML 属性不允许使用可执行 URL：${tagName}.${attributeKey}`
      );
    }
  }
}

function readHtmlAttributeValue(
  source: string,
  startIndex: number
): { value: string; endIndex: number; expression: boolean } {
  if (source[startIndex] === "{" || source[startIndex] === undefined) {
    const endIndex = source.indexOf("}", startIndex + 1);
    return {
      value: source.slice(startIndex, endIndex === -1 ? source.length : endIndex + 1),
      endIndex: endIndex === -1 ? source.length : endIndex + 1,
      expression: source[startIndex] === "{"
    };
  }

  if (source[startIndex] === "\"" || source[startIndex] === "'") {
    const quote = source[startIndex];
    let index = startIndex + 1;

    while (index < source.length && source[index] !== quote) {
      index += 1;
    }

    return {
      value: source.slice(startIndex + 1, index),
      endIndex: index < source.length ? index + 1 : index,
      expression: false
    };
  }

  let index = startIndex;

  while (index < source.length && !/\s/.test(source[index])) {
    index += 1;
  }

  const value = source.slice(startIndex, index);

  return { value, endIndex: index, expression: value.startsWith("{") };
}

function isMdxComponentTag(tagName: string): boolean {
  return !/^[a-z]/.test(tagName) || tagName.includes(".") || tagName.includes(":");
}

function isExecutableHtmlUrl(value: string): boolean {
  const normalizedValue = decodeHtmlNumericCharacterReferences(value)
    .trim()
    .replace(/[\u0000-\u0020]+/g, "")
    .toLowerCase();

  return [
    "javascript:",
    "vbscript:",
    "data:text/html",
    "data:application/xhtml+xml"
  ].some(
    (prefix) =>
      normalizedValue.startsWith(prefix) ||
      canNamedCharacterReferencesFormPrefix(normalizedValue, prefix)
  );
}

function decodeHtmlNumericCharacterReferences(value: string): string {
  return value.replace(/&#(?:x([0-9a-fA-F]+)|([0-9]+));?/g, (match, hex, decimal) => {
    const codePoint = Number.parseInt(hex ?? decimal, hex ? 16 : 10);

    if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
      return match;
    }

    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return match;
    }
  });
}

function canNamedCharacterReferencesFormPrefix(value: string, prefix: string): boolean {
  // 将 named reference 视为 0-2 个未知码点，保守判断是否可能还原危险 URL 前缀。
  let states = new Set([0]);

  for (let index = 0; index < value.length && states.size > 0; index += 1) {
    if (states.has(prefix.length)) {
      return true;
    }

    if (value[index] === "&" && /[A-Za-z]/.test(value[index + 1] ?? "")) {
      let referenceEnd = index + 2;

      while (/[A-Za-z0-9]/.test(value[referenceEnd] ?? "")) {
        referenceEnd += 1;
      }

      if (value[referenceEnd] === ";") {
        referenceEnd += 1;
      }

      const nextStates = new Set<number>();

      // HTML5 named reference 最多解码为两个码点；空白码点归一化后也可能等价于零字符。
      for (const state of states) {
        for (let decodedLength = 0; decodedLength <= 2; decodedLength += 1) {
          nextStates.add(Math.min(prefix.length, state + decodedLength));
        }
      }

      states = nextStates;
      index = referenceEnd - 1;
      continue;
    }

    const nextStates = new Set<number>();

    for (const state of states) {
      if (state < prefix.length && value[index] === prefix[state]) {
        nextStates.add(state + 1);
      }
    }

    states = nextStates;
  }

  return states.has(prefix.length);
}

function pushUniqueIssue(
  reportedMessages: Set<string>,
  blockingIssues: ArticleValidationIssue[],
  message: string
): void {
  if (!reportedMessages.has(message)) {
    reportedMessages.add(message);
    blockingIssues.push({ message });
  }
}

async function validateMarkdownLinks(
  articleFile: string,
  body: string,
  blockingIssues: ArticleValidationIssue[]
): Promise<void> {
  if (/\[\^[^\]\r\n]+\]/.test(body)) {
    blockingIssues.push({ message: "正文禁止学术式脚注" });
  }

  const definitions = findReferenceDefinitions(body);

  for (const link of findMarkdownLinks(body)) {
    if (link.referenceId !== undefined) {
      const normalizedId = normalizeReferenceId(link.referenceId);
      const target = definitions.get(normalizedId);

      if (target === undefined) {
        blockingIssues.push({ message: `未定义的 reference link：${link.referenceId}` });
        continue;
      }

      await validateLinkTarget(articleFile, target, blockingIssues);
      continue;
    }

    await validateLinkTarget(articleFile, link.target ?? "", blockingIssues);
  }
}

function findReferenceDefinitions(body: string): Map<string, string> {
  const definitions = new Map<string, string>();

  for (const line of body.split(/\r?\n/)) {
    const labelStart = /^ {0,3}\[/.exec(line)?.[0].length;

    if (labelStart === undefined) {
      continue;
    }

    const label = parseBracketValue(line, labelStart - 1);

    if (!label.closed || line[label.endIndex + 1] !== ":" || label.value.startsWith("^")) {
      continue;
    }

    const wrappedDestination = `(${line.slice(label.endIndex + 2)})`;
    const destination = parseMarkdownDestination(wrappedDestination, 1);

    if (!destination) {
      continue;
    }

    const id = normalizeReferenceId(label.value);

    // GFM 使用首次出现的定义，后续重复定义不能静默改变既有引用目标。
    if (!definitions.has(id)) {
      definitions.set(id, destination.value.trim());
    }
  }

  return definitions;
}

function findMarkdownLinks(body: string): MarkdownLink[] {
  // 仅扫描 inline、full reference 与 collapsed reference，输出目标或 reference id 供后续统一校验。
  const links: MarkdownLink[] = [];
  const context = createMarkdownScanContext(body);

  for (let index = 0; index < body.length; index += 1) {
    if (body[index] !== "[" || isEscaped(body, index)) {
      continue;
    }

    const previousIndex = index - 1;

    // 图片由素材校验器负责，避免同一 destination 同时产生图片与普通链接问题。
    if (body[previousIndex] === "!" && !isEscaped(body, previousIndex)) {
      continue;
    }

    const labelEndIndex = context.closingBracketByOpeningIndex.get(index);

    if (labelEndIndex === undefined) {
      continue;
    }

    const suffixIndex = labelEndIndex + 1;

    if (body[suffixIndex] === "(") {
      const destination = parseMarkdownDestination(body, suffixIndex + 1, context);

      if (destination) {
        links.push({ target: destination.value.trim() });
        index = destination.endIndex;
      }

      continue;
    }

    if (body[suffixIndex] !== "[") {
      continue;
    }

    const referenceEndIndex = context.closingBracketByOpeningIndex.get(suffixIndex);

    if (referenceEndIndex === undefined) {
      continue;
    }

    const label = parseBracketValue(body, index, labelEndIndex);
    const reference = parseBracketValue(body, suffixIndex, referenceEndIndex);

    links.push({
      referenceId: (reference.value.length === 0 ? label.value : reference.value).trim()
    });
    index = reference.endIndex;
  }

  return links;
}

function normalizeReferenceId(id: string): string {
  return id.trim().replace(/\s+/g, " ").toLowerCase();
}

async function validateLinkTarget(
  articleFile: string,
  target: string,
  blockingIssues: ArticleValidationIssue[]
): Promise<void> {
  if (isExternalPath(target) || target.startsWith("#")) {
    return;
  }

  const localPath = normalizeLocalPath(target);

  if ("error" in localPath) {
    blockingIssues.push({
      message:
        localPath.error === "malformed-percent-encoding"
          ? `本地链接 percent-encoding 无效：${target}`
          : `本地链接路径必须相对文章目录且不能穿越：${target}`
    });
    return;
  }

  const absolutePath = path.join(path.dirname(articleFile), ...localPath.value.split("/"));

  if (!(await isReadableFileWithin(path.dirname(articleFile), absolutePath))) {
    blockingIssues.push({ message: `本地链接文件不存在：${target}` });
  }
}

async function validateArticleAssets(
  articleFile: string,
  body: string,
  blockingIssues: ArticleValidationIssue[]
): Promise<void> {
  const articleDirectory = path.dirname(articleFile);

  await validateMarkdownImages(articleDirectory, body, blockingIssues);
  await validateDiagramDerivatives(articleDirectory, blockingIssues);
}

async function validateMarkdownImages(
  articleDirectory: string,
  body: string,
  blockingIssues: ArticleValidationIssue[]
): Promise<void> {
  for (const image of findMarkdownImages(body)) {
    validateImageAlt(image.alt, blockingIssues);

    if (isExternalPath(image.path)) {
      continue;
    }

    const localPath = normalizeLocalPath(image.path);

    if ("error" in localPath) {
      blockingIssues.push({
        message: `本地图片路径必须相对文章目录且不能穿越：${image.path}`
      });
      continue;
    }

    const extension = path.posix.extname(localPath.value).toLowerCase();

    if (extension === ".mmd" || extension === ".svg") {
      blockingIssues.push({
        message: `正文图片必须引用 PNG，不能直接引用 ${extension}：${image.path}`
      });
    }

    const absolutePath = path.join(articleDirectory, ...localPath.value.split("/"));

    if (!(await isReadableFileWithin(articleDirectory, absolutePath))) {
      blockingIssues.push({ message: `本地图片文件不存在：${image.path}` });
      continue;
    }

    if (extension === ".png") {
      await validatePngDimensions(absolutePath, image.path, blockingIssues);
    }
  }
}

function findMarkdownImages(body: string): Array<{ alt: string; path: string }> {
  const images: Array<{ alt: string; path: string }> = [];
  const context = createMarkdownScanContext(body);

  for (let index = 0; index < body.length - 1; index += 1) {
    if (body[index] !== "!" || body[index + 1] !== "[" || isEscaped(body, index)) {
      continue;
    }

    const altEndIndex = context.closingBracketByOpeningIndex.get(index + 1);

    if (altEndIndex === undefined) {
      continue;
    }

    if (body[altEndIndex + 1] !== "(") {
      continue;
    }

    const alt = parseBracketValue(body, index + 1, altEndIndex);
    const destination = parseMarkdownDestination(body, altEndIndex + 2, context);

    if (!destination) {
      continue;
    }

    images.push({ alt: alt.value.trim(), path: destination.value.trim() });
    index = destination.endIndex;
  }

  return images;
}

function parseBracketValue(
  markdown: string,
  startIndex: number,
  knownEndIndex = markdown.length - 1
): ParsedBracketValue {
  let depth = 0;
  let value = "";

  for (let index = startIndex + 1; index <= knownEndIndex; index += 1) {
    const character = markdown[index];

    if (character === "\\" && isAsciiPunctuation(markdown[index + 1])) {
      value += markdown[index + 1];
      index += 1;
    } else if (character === "[") {
      depth += 1;
      value += character;
    } else if (character === "]" && depth > 0) {
      depth -= 1;
      value += character;
    } else if (character === "]") {
      return { value, endIndex: index, closed: true };
    } else {
      value += character;
    }
  }

  return { value, endIndex: markdown.length - 1, closed: false };
}

function parseMarkdownDestination(
  markdown: string,
  startIndex: number,
  context?: MarkdownScanContext
): ParsedMarkdownValue | undefined {
  const destinationStart = skipMarkdownWhitespace(markdown, startIndex);

  if (markdown[destinationStart] === "<") {
    return parseAngleDestination(markdown, destinationStart + 1);
  }

  return parseBareDestination(
    markdown,
    destinationStart,
    context?.closingParenthesisByOpeningIndex
  );
}

function parseAngleDestination(markdown: string, startIndex: number): ParsedMarkdownValue | undefined {
  let value = "";

  for (let index = startIndex; index < markdown.length; index += 1) {
    const character = markdown[index];

    if (character === "\n" || character === "\r" || character === "<") {
      return undefined;
    }

    if (character === "\\" && isAsciiPunctuation(markdown[index + 1])) {
      value += markdown[index + 1];
      index += 1;
    } else if (character === ">") {
      return finishMarkdownDestination(markdown, index + 1, value);
    } else {
      value += character;
    }
  }

  return undefined;
}

function parseBareDestination(
  markdown: string,
  startIndex: number,
  closingParenthesisByOpeningIndex?: Map<number, number>
): ParsedMarkdownValue | undefined {
  let depth = 0;
  let value = "";

  for (let index = startIndex; index < markdown.length; index += 1) {
    const character = markdown[index];

    if (character === "\\" && isAsciiPunctuation(markdown[index + 1])) {
      value += markdown[index + 1];
      index += 1;
    } else if (character === "(") {
      if (
        closingParenthesisByOpeningIndex &&
        !closingParenthesisByOpeningIndex.has(index)
      ) {
        // 当前 bare destination 已进入无法闭合的嵌套括号，继续扫描只会重复处理同一后缀。
        return undefined;
      }

      depth += 1;
      value += character;
    } else if (character === ")" && depth > 0) {
      depth -= 1;
      value += character;
    } else if (character === ")") {
      return { value, endIndex: index };
    } else if (/\s/.test(character) && depth === 0) {
      return finishMarkdownDestination(markdown, index, value);
    } else {
      value += character;
    }
  }

  return undefined;
}

function finishMarkdownDestination(
  markdown: string,
  startIndex: number,
  value: string
): ParsedMarkdownValue | undefined {
  let index = skipMarkdownWhitespace(markdown, startIndex);

  if (markdown[index] === ")") {
    return { value, endIndex: index };
  }

  const titleEnd = markdown[index] === "(" ? ")" : markdown[index];

  if (titleEnd !== "\"" && titleEnd !== "'" && titleEnd !== ")") {
    return undefined;
  }

  for (index += 1; index < markdown.length; index += 1) {
    if (markdown[index] === "\\" && isAsciiPunctuation(markdown[index + 1])) {
      index += 1;
    } else if (markdown[index] === titleEnd) {
      index = skipMarkdownWhitespace(markdown, index + 1);
      return markdown[index] === ")" ? { value, endIndex: index } : undefined;
    }
  }

  return undefined;
}

function skipMarkdownWhitespace(markdown: string, startIndex: number): number {
  let index = startIndex;

  while (index < markdown.length && /\s/.test(markdown[index])) {
    index += 1;
  }

  return index;
}

function isEscaped(markdown: string, index: number): boolean {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && markdown[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function isAsciiPunctuation(character: string | undefined): boolean {
  if (!character) {
    return false;
  }

  const code = character.charCodeAt(0);
  return (
    (code >= 0x21 && code <= 0x2f) ||
    (code >= 0x3a && code <= 0x40) ||
    (code >= 0x5b && code <= 0x60) ||
    (code >= 0x7b && code <= 0x7e)
  );
}

function createMarkdownScanContext(markdown: string): MarkdownScanContext {
  // 预先配对 delimiter，扫描器可常数时间判断闭合状态且不必跳过后续 opener。
  const bracketStack: number[] = [];
  const parenthesisStack: number[] = [];
  const closingBracketByOpeningIndex = new Map<number, number>();
  const closingParenthesisByOpeningIndex = new Map<number, number>();

  for (let index = 0; index < markdown.length; index += 1) {
    const character = markdown[index];

    if (character !== "[" && character !== "]" && character !== "(" && character !== ")") {
      continue;
    }

    if (isEscaped(markdown, index)) {
      continue;
    }

    if (character === "[") {
      bracketStack.push(index);
    } else if (character === "]" && bracketStack.length > 0) {
      closingBracketByOpeningIndex.set(bracketStack.pop()!, index);
    } else if (character === "(") {
      parenthesisStack.push(index);
    } else if (character === ")" && parenthesisStack.length > 0) {
      closingParenthesisByOpeningIndex.set(parenthesisStack.pop()!, index);
    }
  }

  return { closingBracketByOpeningIndex, closingParenthesisByOpeningIndex };
}

function removeFencedCodeBlocks(body: string): string {
  let openFence: { marker: "`" | "~"; length: number } | undefined;
  const lines: string[] = [];

  for (const line of body.split(/\r?\n/)) {
    const fence = readMarkdownFence(line);

    if (!fence) {
      lines.push(openFence ? "" : line);
      continue;
    }

    if (!openFence) {
      if (!canOpenMarkdownFence(fence)) {
        lines.push(line);
        continue;
      }

      openFence = { marker: fence.marker, length: fence.length };
      lines.push("");
      continue;
    }

    if (
      fence.marker === openFence.marker &&
      fence.length >= openFence.length &&
      fence.trailing.trim().length === 0
    ) {
      openFence = undefined;
    }

    // 代码块中的 Markdown 语法是示例文本，不能作为正文内容参与校验。
    lines.push("");
  }

  return lines.join("\n");
}

function removeInlineCodeSpans(body: string): string {
  // 先建立 backtick run 的同长度后继，再遮蔽可闭合 span，避免逐 opener 重扫正文。
  const runs: Array<{ start: number; length: number; nextSameLength?: number }> = [];

  for (let index = 0; index < body.length; index += 1) {
    if (body[index] === "<" && !isEscaped(body, index)) {
      const autolink = readMarkdownAutolink(body, index);
      const htmlTag = autolink ? undefined : readHtmlTag(body, index);
      const tokenEnd = autolink?.endIndex ?? htmlTag?.endIndex;

      if (tokenEnd !== undefined) {
        // Inline HTML 与 autolink 的 token 优先于 code span，内部 backtick 不能充当 delimiter。
        index = tokenEnd;
        continue;
      }
    }

    if (body[index] !== "`") {
      continue;
    }

    const start = index;

    while (index + 1 < body.length && body[index + 1] === "`") {
      index += 1;
    }

    // 反斜杠只转义首个 backtick，剩余部分仍按连续 run 参与同长度配对。
    const delimiterStart = isEscaped(body, start) ? start + 1 : start;

    if (delimiterStart > index) {
      continue;
    }

    runs.push({ start: delimiterStart, length: index - delimiterStart + 1 });
  }

  const nextRunByLength = new Map<number, number>();
  for (let index = runs.length - 1; index >= 0; index -= 1) {
    runs[index].nextSameLength = nextRunByLength.get(runs[index].length);
    nextRunByLength.set(runs[index].length, index);
  }

  const ranges: Array<{ start: number; end: number }> = [];
  for (let index = 0; index < runs.length; index += 1) {
    const closingIndex = runs[index].nextSameLength;

    if (closingIndex === undefined) {
      continue;
    }

    const closingRun = runs[closingIndex];
    ranges.push({ start: runs[index].start, end: closingRun.start + closingRun.length });
    index = closingIndex;
  }

  let result = "";
  let cursor = 0;

  for (const range of ranges) {
    result += body.slice(cursor, range.start);
    result += body.slice(range.start, range.end).replace(/[^\r\n]/g, " ");
    cursor = range.end;
  }

  return result + body.slice(cursor);
}

function validateImageAlt(alt: string, blockingIssues: ArticleValidationIssue[]): void {
  if (alt.length === 0 || !chineseTextPattern.test(alt)) {
    blockingIssues.push({ message: "图片 alt 必须是非空且包含中文" });
  }
}

function isExternalPath(imagePath: string): boolean {
  return /^https?:\/\//i.test(imagePath) || imagePath.startsWith("//");
}

function normalizeLocalPath(target: string): LocalPathResult {
  try {
    decodeURIComponent(target);
  } catch {
    // query 与 fragment 不参与文件定位，但完整 target 仍必须满足 percent-encoding 语法。
    return { error: "malformed-percent-encoding" };
  }

  const [pathWithoutHash] = target.split("#", 1);
  const [pathWithoutQuery] = pathWithoutHash.split("?", 1);

  if (pathWithoutQuery.length === 0) {
    return { error: "empty" };
  }

  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(pathWithoutQuery);
  } catch {
    return { error: "malformed-percent-encoding" };
  }

  if (
    /^[a-z][a-z0-9+.-]*:/i.test(decodedPath) ||
    decodedPath.startsWith("/") ||
    path.win32.isAbsolute(decodedPath) ||
    decodedPath.split(/[\\/]+/).includes("..")
  ) {
    return { error: "unsafe" };
  }

  const normalizedPath = path.posix.normalize(decodedPath.replace(/\\/g, "/"));

  if (normalizedPath === "." || normalizedPath.startsWith("../")) {
    return { error: "unsafe" };
  }

  return { value: normalizedPath };
}

async function isReadableFileWithin(rootDirectory: string, targetPath: string): Promise<boolean> {
  try {
    const [realRoot, realTarget] = await Promise.all([realpath(rootDirectory), realpath(targetPath)]);
    const relative = path.relative(realRoot, realTarget);

    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      return false;
    }

    const targetStat = await stat(realTarget);

    if (!targetStat.isFile()) {
      return false;
    }

    await access(realTarget, constants.R_OK);
    return true;
  } catch {
    // 文件系统失败由调用方转换为 blocking issue，避免泄漏底层异常。
    return false;
  }
}

async function validateDiagramDerivatives(
  articleDirectory: string,
  blockingIssues: ArticleValidationIssue[]
): Promise<void> {
  const diagramsDirectory = path.join(articleDirectory, "assets", "diagrams");
  let entries: string[];

  try {
    entries = await readdir(diagramsDirectory);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      return;
    }

    throw error;
  }

  for (const entryName of entries) {
    if (path.extname(entryName) !== ".mmd") {
      continue;
    }

    const baseName = entryName.slice(0, -".mmd".length);
    const svgPath = `assets/diagrams/${baseName}.svg`;
    const pngPath = `assets/diagrams/${baseName}.png`;

    if (
      !(await isReadableFileWithin(
        articleDirectory,
        path.join(diagramsDirectory, `${baseName}.svg`)
      ))
    ) {
      blockingIssues.push({ message: `Mermaid 源文件缺少同名 SVG：${svgPath}` });
    }

    const absolutePngPath = path.join(diagramsDirectory, `${baseName}.png`);

    if (!(await isReadableFileWithin(articleDirectory, absolutePngPath))) {
      blockingIssues.push({ message: `Mermaid 源文件缺少同名 PNG：${pngPath}` });
      continue;
    }

    await validatePngDimensions(absolutePngPath, pngPath, blockingIssues);
  }
}

async function validatePngDimensions(
  pngPath: string,
  displayPath: string,
  blockingIssues: ArticleValidationIssue[]
): Promise<void> {
  let png: Buffer;

  try {
    png = await readFile(pngPath);
  } catch {
    blockingIssues.push({ message: `PNG 图片无法解码或尺寸无效：${displayPath}` });
    return;
  }

  const validHeader =
    png.length >= 33 &&
    png[0] === 0x89 &&
    png[1] === 0x50 &&
    png[2] === 0x4e &&
    png[3] === 0x47 &&
    png[4] === 0x0d &&
    png[5] === 0x0a &&
    png[6] === 0x1a &&
    png[7] === 0x0a &&
    png.readUInt32BE(8) === 13 &&
    png.toString("ascii", 12, 16) === "IHDR";

  if (!validHeader) {
    blockingIssues.push({ message: `PNG 图片无法解码或尺寸无效：${displayPath}` });
    return;
  }

  // PNG 宽高位于固定长度的 IHDR 数据头；不满足最小 chunk 结构时不能读取尺寸。
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);

  if (width === 0 || height === 0) {
    blockingIssues.push({ message: `PNG 图片无法解码或尺寸无效：${displayPath}` });
  }
}

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function hasAnyString(source: Record<string, unknown>, fields: string[]): boolean {
  return fields.some((field) => typeof source[field] === "string" && source[field].length > 0);
}

function isIntegerOrString(value: unknown): boolean {
  return typeof value === "string" || (typeof value === "number" && Number.isInteger(value));
}
