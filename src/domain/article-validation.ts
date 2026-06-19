import { readdir, readFile, stat } from "node:fs/promises";
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
const articleSchemaVersion = "article-hub.article.v1";
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

interface ParsedMarkdownValue {
  value: string;
  endIndex: number;
}

/**
 * 校验阶段 A 文章的 Front Matter、Markdown 与本地素材契约。
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
    await validateArticleAssets(options.articleFile, parsed.body, blockingIssues);
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
    const fence = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);

    if (!fence) {
      continue;
    }

    const marker = fence[2][0] as "`" | "~";
    const length = fence[2].length;

    if (!openFence) {
      if (fence[3].trim().length === 0) {
        blockingIssues.push({ message: "fenced code block 必须标注语言" });
      }

      openFence = { marker, length };
      continue;
    }

    if (marker === openFence.marker && length >= openFence.length && fence[3].trim().length === 0) {
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
  for (const image of findMarkdownImages(removeFencedCodeBlocks(body))) {
    validateImageAlt(image.alt, blockingIssues);

    if (isExternalPath(image.path)) {
      continue;
    }

    const localPath = normalizeLocalAssetPath(image.path);

    if (!localPath) {
      blockingIssues.push({
        message: `本地图片路径必须相对文章目录且不能穿越：${image.path}`
      });
      continue;
    }

    const extension = path.posix.extname(localPath).toLowerCase();

    if (extension === ".mmd" || extension === ".svg") {
      blockingIssues.push({
        message: `正文图片必须引用 PNG，不能直接引用 ${extension}：${image.path}`
      });
    }

    const absolutePath = path.join(articleDirectory, ...localPath.split("/"));

    if (!(await fileExists(absolutePath))) {
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

  for (let index = 0; index < body.length - 1; index += 1) {
    if (body[index] !== "!" || body[index + 1] !== "[" || isEscaped(body, index)) {
      continue;
    }

    const alt = parseBracketValue(body, index + 1);

    if (!alt || body[alt.endIndex + 1] !== "(") {
      continue;
    }

    const destination = parseImageDestination(body, alt.endIndex + 2);

    if (!destination) {
      continue;
    }

    images.push({ alt: alt.value.trim(), path: destination.value.trim() });
    index = destination.endIndex;
  }

  return images;
}

function parseBracketValue(markdown: string, startIndex: number): ParsedMarkdownValue | undefined {
  let depth = 0;
  let value = "";

  for (let index = startIndex + 1; index < markdown.length; index += 1) {
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
      return { value, endIndex: index };
    } else {
      value += character;
    }
  }

  return undefined;
}

function parseImageDestination(markdown: string, startIndex: number): ParsedMarkdownValue | undefined {
  const destinationStart = skipMarkdownWhitespace(markdown, startIndex);

  if (markdown[destinationStart] === "<") {
    return parseAngleDestination(markdown, destinationStart + 1);
  }

  return parseBareDestination(markdown, destinationStart);
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
      return finishImageDestination(markdown, index + 1, value);
    } else {
      value += character;
    }
  }

  return undefined;
}

function parseBareDestination(markdown: string, startIndex: number): ParsedMarkdownValue | undefined {
  let depth = 0;
  let value = "";

  for (let index = startIndex; index < markdown.length; index += 1) {
    const character = markdown[index];

    if (character === "\\" && isAsciiPunctuation(markdown[index + 1])) {
      value += markdown[index + 1];
      index += 1;
    } else if (character === "(") {
      depth += 1;
      value += character;
    } else if (character === ")" && depth > 0) {
      depth -= 1;
      value += character;
    } else if (character === ")") {
      return { value, endIndex: index };
    } else if (/\s/.test(character) && depth === 0) {
      return finishImageDestination(markdown, index, value);
    } else {
      value += character;
    }
  }

  return undefined;
}

function finishImageDestination(
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

function removeFencedCodeBlocks(body: string): string {
  let openFence: { marker: "`" | "~"; length: number } | undefined;
  const lines: string[] = [];

  for (const line of body.split(/\r?\n/)) {
    const fence = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);

    if (!fence) {
      lines.push(openFence ? "" : line);
      continue;
    }

    const marker = fence[2][0] as "`" | "~";
    const length = fence[2].length;

    if (!openFence) {
      openFence = { marker, length };
      lines.push("");
      continue;
    }

    if (marker === openFence.marker && length >= openFence.length && fence[3].trim().length === 0) {
      openFence = undefined;
    }

    // 代码块中的图片语法是示例文本，不能作为正文素材引用参与校验。
    lines.push("");
  }

  return lines.join("\n");
}

function validateImageAlt(alt: string, blockingIssues: ArticleValidationIssue[]): void {
  if (alt.length === 0 || !chineseTextPattern.test(alt)) {
    blockingIssues.push({ message: "图片 alt 必须是非空且包含中文" });
  }
}

function isExternalPath(imagePath: string): boolean {
  return /^https?:\/\//i.test(imagePath) || imagePath.startsWith("//");
}

function normalizeLocalAssetPath(imagePath: string): string | undefined {
  const [pathWithoutHash] = imagePath.split("#", 1);
  const [pathWithoutQuery] = pathWithoutHash.split("?", 1);

  if (pathWithoutQuery.length === 0) {
    return undefined;
  }

  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(pathWithoutQuery);
  } catch {
    return undefined;
  }

  if (
    /^[a-z][a-z0-9+.-]*:/i.test(decodedPath) ||
    decodedPath.startsWith("/") ||
    path.win32.isAbsolute(decodedPath) ||
    decodedPath.split(/[\\/]+/).includes("..")
  ) {
    return undefined;
  }

  const normalizedPath = path.posix.normalize(decodedPath.replace(/\\/g, "/"));

  if (normalizedPath === "." || normalizedPath.startsWith("../")) {
    return undefined;
  }

  return normalizedPath;
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

    if (!(await fileExists(path.join(diagramsDirectory, `${baseName}.svg`)))) {
      blockingIssues.push({ message: `Mermaid 源文件缺少同名 SVG：${svgPath}` });
    }

    const absolutePngPath = path.join(diagramsDirectory, `${baseName}.png`);

    if (!(await fileExists(absolutePngPath))) {
      blockingIssues.push({ message: `Mermaid 源文件缺少同名 PNG：${pngPath}` });
      continue;
    }

    await validatePngDimensions(absolutePngPath, pngPath, blockingIssues);
  }
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    return (await stat(targetPath)).isFile();
  } catch {
    // 文件系统失败由调用方转换为素材 blocking issue，避免泄漏底层异常。
    return false;
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
