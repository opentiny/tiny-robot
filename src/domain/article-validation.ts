import { constants } from "node:fs";
import { access, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

import { parse } from "yaml";

import { loadProjectConfig } from "./project-config.js";
import { ArticleHubError } from "../infrastructure/errors.js";

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

/**
 * 构造文章校验 message 的上下文；字段按错误码按需使用。
 */
export interface ArticleValidationIssueMessageContext {
  field?: string;
  frontMatterProblem?: "object" | "yaml";
  stringRequirement?: "string" | "non-empty-string";
  expectedSchemaVersion?: string;
  value?: string;
  sourceIndex?: number;
  imagePath?: string;
}

function defineArticleValidationIssueMessages<
  Messages extends Record<string, (context: ArticleValidationIssueMessageContext) => string>
>(messages: Messages): Messages {
  return messages;
}

/**
 * 文章校验错误码与 message 的集中定义；调用方应依赖错误码而不是 `message` 文案。
 */
export const articleValidationIssueMessages = defineArticleValidationIssueMessages({
  "missing-frontmatter": () => "Markdown 文件必须包含 YAML Front Matter",
  "invalid-frontmatter": ({ frontMatterProblem }) =>
    frontMatterProblem === "yaml" ? "Front Matter 不是有效 YAML" : "Front Matter 必须是 YAML object",
  "missing-required-frontmatter-field": ({ field }) => `Front Matter 缺少必填字段：${field}`,
  "invalid-schema-version": ({ expectedSchemaVersion }) =>
    `Front Matter schema_version 必须是 ${expectedSchemaVersion}`,
  "invalid-frontmatter-string": ({ field, stringRequirement }) =>
    `Front Matter ${field} 必须是${stringRequirement === "string" ? "" : "非空"}字符串`,
  "unknown-project": ({ value }) => `Front Matter project 不在项目 allowlist 中：${value}`,
  "unsupported-frontmatter-enum": ({ field, value }) => `Front Matter ${field} 不受支持：${value}`,
  "invalid-approved-plan": () => "approved_plan 必须是非空字符串",
  "missing-sources": () => "Front Matter sources 至少包含一项",
  "invalid-source": ({ sourceIndex }) => `sources[${sourceIndex}] 必须是 object`,
  "missing-source-identity": ({ sourceIndex }) => `sources[${sourceIndex}] 缺少来源标识`,
  "missing-source-revision": ({ sourceIndex }) =>
    `sources[${sourceIndex}] 缺少 commit/hash 稳定定位字段`,
  "invalid-local-image": ({ imagePath }) => `本地图片路径必须相对文章目录且不能穿越：${imagePath}`,
  "missing-local-image": ({ imagePath }) => `本地图片文件不存在：${imagePath}`,
  "empty-image-alt": () => "图片 alt 必须非空"
});

/**
 * 文章校验问题的稳定机器码；调用方应依赖该字段而不是 `message` 文案。
 */
export type ArticleValidationIssueCode = keyof typeof articleValidationIssueMessages;

/**
 * 单条文章校验问题；`code` 是稳定机器码，`field` 指向 Front Matter 或 Markdown 契约字段。
 */
export interface ArticleValidationIssue {
  code: ArticleValidationIssueCode;
  field?: string;
  message: string;
}

function createArticleValidationIssue(
  code: ArticleValidationIssueCode,
  context: ArticleValidationIssueMessageContext = {}
): ArticleValidationIssue {
  const issue: ArticleValidationIssue = {
    code,
    message: articleValidationIssueMessages[code](context)
  };

  if (context.field !== undefined) {
    issue.field = context.field;
  }

  return issue;
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

interface ParsedMarkdownValue {
  value: string;
  endIndex: number;
}

interface ParsedBracketValue extends ParsedMarkdownValue {
  closed: boolean;
}

interface MarkdownScanContext {
  closingBracketByOpeningIndex: Map<number, number>;
  closingParenthesisByOpeningIndex: Map<number, number>;
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
    const bodyWithoutFencedCodeBlocks = removeFencedCodeBlocks(parsed.body);
    const bodyWithoutCode = removeInlineCodeSpans(bodyWithoutFencedCodeBlocks);
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
): { frontMatter: Record<string, unknown>; body: string } | undefined {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(markdown);

  if (!match) {
    blockingIssues.push(createArticleValidationIssue("missing-frontmatter"));
    return undefined;
  }

  try {
    const parsed = parse(match[1]) as unknown;

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      blockingIssues.push(
        createArticleValidationIssue("invalid-frontmatter", {
          frontMatterProblem: "object"
        })
      );
      return undefined;
    }

    return {
      frontMatter: parsed as Record<string, unknown>,
      body: match[2]
    };
  } catch {
    blockingIssues.push(
      createArticleValidationIssue("invalid-frontmatter", {
        frontMatterProblem: "yaml"
      })
    );
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
      blockingIssues.push(
        createArticleValidationIssue("missing-required-frontmatter-field", { field })
      );
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
    blockingIssues.push(
      createArticleValidationIssue("invalid-schema-version", {
        expectedSchemaVersion: articleSchemaVersion,
        field: "schema_version"
      })
    );
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
    blockingIssues.push(
      createArticleValidationIssue("invalid-frontmatter-string", {
        field,
        stringRequirement: "non-empty-string"
      })
    );
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
    blockingIssues.push(
      createArticleValidationIssue("invalid-frontmatter-string", {
        field: "project",
        stringRequirement: "string"
      })
    );
    return;
  }

  if (project.length === 0) {
    return;
  }

  if (!allowedProjects.includes(project)) {
    blockingIssues.push(
      createArticleValidationIssue("unknown-project", {
        field: "project",
        value: project
      })
    );
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
    blockingIssues.push(
      createArticleValidationIssue("invalid-frontmatter-string", {
        field,
        stringRequirement: "string"
      })
    );
    return;
  }

  if (value.length === 0) {
    return;
  }

  if (!allowedValues.has(value)) {
    blockingIssues.push(
      createArticleValidationIssue("unsupported-frontmatter-enum", { field, value })
    );
  }
}

function validateApprovedPlan(
  approvedPlan: unknown,
  blockingIssues: ArticleValidationIssue[]
): void {
  if (isMissing(approvedPlan)) {
    return;
  }

  if (typeof approvedPlan !== "string") {
    blockingIssues.push(
      createArticleValidationIssue("invalid-approved-plan", { field: "approved_plan" })
    );
  }
}

function validateSources(
  sources: unknown,
  blockingIssues: ArticleValidationIssue[]
): void {
  if (!Array.isArray(sources) || sources.length === 0) {
    blockingIssues.push(createArticleValidationIssue("missing-sources", { field: "sources" }));
    return;
  }

  sources.forEach((source, index) => {
    if (source === null || typeof source !== "object" || Array.isArray(source)) {
      blockingIssues.push(
        createArticleValidationIssue("invalid-source", {
          field: `sources[${index}]`,
          sourceIndex: index
        })
      );
      return;
    }

    const item = source as Record<string, unknown>;

    if (!hasAnyString(item, ["id", "name", "repository", "url"])) {
      blockingIssues.push(
        createArticleValidationIssue("missing-source-identity", {
          field: `sources[${index}]`,
          sourceIndex: index
        })
      );
    }

    if (!hasAnyString(item, ["commit", "hash", "content_hash", "resolved_commit"])) {
      blockingIssues.push(
        createArticleValidationIssue("missing-source-revision", {
          field: `sources[${index}]`,
          sourceIndex: index
        })
      );
    }
  });
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

async function validateArticleAssets(
  articleFile: string,
  body: string,
  blockingIssues: ArticleValidationIssue[]
): Promise<void> {
  const articleDirectory = path.dirname(articleFile);

  await validateMarkdownImages(articleDirectory, body, blockingIssues);
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
      blockingIssues.push(
        createArticleValidationIssue("invalid-local-image", { imagePath: image.path })
      );
      continue;
    }

    const absolutePath = path.join(articleDirectory, ...localPath.value.split("/"));

    if (!(await isReadableFileWithin(articleDirectory, absolutePath))) {
      blockingIssues.push(
        createArticleValidationIssue("missing-local-image", { imagePath: image.path })
      );
      continue;
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
  if (alt.length === 0) {
    blockingIssues.push(createArticleValidationIssue("empty-image-alt"));
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

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function hasAnyString(source: Record<string, unknown>, fields: string[]): boolean {
  return fields.some((field) => typeof source[field] === "string" && source[field].length > 0);
}
