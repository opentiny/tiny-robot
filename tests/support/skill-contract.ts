import { readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";

import { parse as parseYaml } from "yaml";

/**
 * Skill 契约违规代码，用于让测试稳定断言结构问题而不是完整文案。
 */
export type SkillContractViolationCode =
  | "missing-entry"
  | "invalid-frontmatter"
  | "name-mismatch"
  | "external-reference"
  | "escaped-reference"
  | "missing-reference"
  | "nested-skill"
  | "orphan-reference";

/**
 * Skill 契约违规项。
 */
export interface SkillContractViolation {
  code: SkillContractViolationCode;
  path: string;
  message: string;
}

/**
 * 检查 Skill 是否满足独立加载所需的入口、文件和引用契约。
 *
 * @param skillRoot Skill 根目录。
 * @returns 检出的全部契约违规项；合法时返回空数组。
 */
export async function inspectSkillContract(
  skillRoot: string
): Promise<SkillContractViolation[]> {
  const entryPath = path.join(skillRoot, "SKILL.md");
  let entry: string;
  try {
    entry = await readFile(entryPath, "utf8");
  } catch (error) {
    if (isNodeError(error, "ENOENT")) {
      return [
        {
          code: "missing-entry",
          path: "SKILL.md",
          message: "缺少 Skill 入口文件。"
        }
      ];
    }

    throw error;
  }

  const frontMatter = parseEntryFrontMatter(entry);

  if (!frontMatter.ok) {
    return [
      {
        code: "invalid-frontmatter",
        path: "SKILL.md",
        message: "SKILL.md Front Matter 无法解析。"
      }
    ];
  }

  if (frontMatter.name !== path.basename(skillRoot)) {
    return [
      {
        code: "name-mismatch",
        path: "SKILL.md",
        message: "Front Matter name 必须与 Skill 目录名一致。"
      }
    ];
  }

  const violations: SkillContractViolation[] = [];
  const rootRealPath = await realpath(skillRoot);
  const context: ReferenceGraphContext = {
    referencedPaths: new Set<string>(),
    rootRealPath,
    skillRoot,
    violations,
    visitedRealPaths: new Set<string>()
  };
  await visitMarkdownFile(context, entryPath, entry);
  await inspectNestedSkills(context, entryPath);
  await inspectOrphanReferences(context);

  return sortViolations(violations);
}

interface ReferenceGraphContext {
  referencedPaths: Set<string>;
  rootRealPath: string;
  skillRoot: string;
  violations: SkillContractViolation[];
  visitedRealPaths: Set<string>;
}

type ParsedFrontMatter =
  | {
      ok: true;
      name: string;
    }
  | {
      ok: false;
    };

function parseEntryFrontMatter(contents: string): ParsedFrontMatter {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return { ok: false };
  }

  let metadata: unknown;
  try {
    metadata = parseYaml(match[1]);
  } catch {
    return { ok: false };
  }

  if (!isRecord(metadata) || typeof metadata.name !== "string") {
    return { ok: false };
  }

  if (
    metadata.name.trim() === "" ||
    typeof metadata.description !== "string" ||
    metadata.description.trim() === ""
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    name: metadata.name
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown, code: string): error is NodeJS.ErrnoException {
  return isRecord(error) && error.code === code;
}

async function visitMarkdownFile(
  context: ReferenceGraphContext,
  filePath: string,
  contents?: string
): Promise<void> {
  const fileRealPath = await realpath(filePath);
  if (context.visitedRealPaths.has(fileRealPath)) {
    return;
  }

  context.visitedRealPaths.add(fileRealPath);
  const markdown = contents ?? (await readFile(filePath, "utf8"));

  for (const target of extractMarkdownReferences(markdown)) {
    await inspectReference(context, filePath, target);
  }
}

async function inspectReference(
  context: ReferenceGraphContext,
  sourcePath: string,
  target: string
): Promise<void> {
  // 解析单个 Markdown reference：记录确定性违规，合法本地文件继续递归遍历。
  if (isRemoteMarkdownReference(target)) {
    addViolation(context.violations, {
      code: "external-reference",
      path: target,
      message: "运行所需 Markdown reference 必须是本地文件。"
    });
    return;
  }

  if (hasScheme(target)) {
    return;
  }

  const referencePath = stripFragment(target);
  const candidatePath = path.resolve(path.dirname(sourcePath), referencePath);

  // 先检查规范化路径，避免相对路径穿越在 stat 前落到根目录外。
  if (!isInsidePath(context.skillRoot, candidatePath)) {
    addViolation(context.violations, {
      code: "escaped-reference",
      path: normalizeReferencePath(referencePath),
      message: "本地 Markdown reference 不能逃出 Skill 根目录。"
    });
      return;
  }

  context.referencedPaths.add(displayPath(context.skillRoot, candidatePath));
  const fileStat = await stat(candidatePath).catch(() => undefined);

  if (!fileStat?.isFile()) {
    addViolation(context.violations, {
      code: "missing-reference",
      path: displayPath(context.skillRoot, candidatePath),
      message: "本地 Markdown reference 不存在。"
    });
    return;
  }

  // 文件存在后再核验真实路径，避免 symlink 将根内路径转到根外。
  const targetRealPath = await realpath(candidatePath);
  if (!isInsidePath(context.rootRealPath, targetRealPath)) {
    addViolation(context.violations, {
      code: "escaped-reference",
      path: displayPath(context.skillRoot, candidatePath),
      message: "本地 Markdown reference 的真实路径不能逃出 Skill 根目录。"
    });
    return;
  }

  await visitMarkdownFile(context, candidatePath);
}

async function inspectOrphanReferences(
  context: ReferenceGraphContext
): Promise<void> {
  const referenceFiles = await collectMarkdownFiles(
    path.join(context.skillRoot, "references")
  );

  for (const referenceFile of referenceFiles) {
    const referencePath = displayPath(context.skillRoot, referenceFile);
    if (context.referencedPaths.has(referencePath)) {
      continue;
    }

    const referenceRealPath = await realpath(referenceFile).catch(() => undefined);
    if (referenceRealPath && context.visitedRealPaths.has(referenceRealPath)) {
      continue;
    }

    addViolation(context.violations, {
      code: "orphan-reference",
      path: referencePath,
      message: "references 目录下的 Markdown 必须能从 SKILL.md 到达。"
    });
  }
}

async function inspectNestedSkills(
  context: ReferenceGraphContext,
  entryPath: string
): Promise<void> {
  const skillEntryFiles = await collectSkillEntryFiles(context.skillRoot);

  for (const skillEntryFile of skillEntryFiles) {
    if (path.resolve(skillEntryFile) === path.resolve(entryPath)) {
      continue;
    }

    addViolation(context.violations, {
      code: "nested-skill",
      path: displayPath(context.skillRoot, skillEntryFile),
      message: "Skill 根目录下不能嵌套另一个 SKILL.md。"
    });
  }
}

async function collectMarkdownFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true }).catch(
    (error: unknown) => {
      if (isNodeError(error, "ENOENT")) {
        return [];
      }

      throw error;
    }
  );
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(entryPath)));
      continue;
    }

    if (
      (entry.isFile() || entry.isSymbolicLink()) &&
      entry.name.endsWith(".md")
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

async function collectSkillEntryFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSkillEntryFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name === "SKILL.md") {
      files.push(entryPath);
    }
  }

  return files;
}

function extractMarkdownReferences(contents: string): string[] {
  const references: string[] = [];
  const inlineLinkPattern = /(?<!!)\[[^\]]+\]\(([^)\s]+)\)/g;
  // 先移除代码区域，避免示例中的伪链接被误判为运行依赖。
  const markdown = stripMarkdownCode(contents);
  let match: RegExpExecArray | null;

  while ((match = inlineLinkPattern.exec(markdown)) !== null) {
    const target = cleanReferenceTarget(match[1]);
    if (isMarkdownReference(target)) {
      references.push(target);
    }
  }

  const definitionPattern = /^\s{0,3}\[[^\]]+\]:\s*(\S+)/gm;
  while ((match = definitionPattern.exec(markdown)) !== null) {
    const target = cleanReferenceTarget(match[1]);
    if (isMarkdownReference(target)) {
      references.push(target);
    }
  }

  return references;
}

function stripMarkdownCode(contents: string): string {
  const lines = contents.split(/\r?\n/);
  let fenced = false;

  return lines
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return "";
      }

      return fenced ? "" : line.replace(/`[^`\n]*`/g, "");
    })
    .join("\n");
}

function cleanReferenceTarget(target: string): string {
  return target.replace(/^<|>$/g, "");
}

function isMarkdownReference(target: string): boolean {
  return stripFragment(target).endsWith(".md");
}

function isRemoteMarkdownReference(target: string): boolean {
  return /^(https?:)?\/\//.test(target) && isMarkdownReference(target);
}

function hasScheme(target: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(target);
}

function stripFragment(target: string): string {
  return target.split("#", 1)[0];
}

function displayPath(skillRoot: string, filePath: string): string {
  return path.relative(skillRoot, filePath).split(path.sep).join("/");
}

function isInsidePath(parentPath: string, childPath: string): boolean {
  const relativePath = path.relative(parentPath, childPath);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function normalizeReferencePath(referencePath: string): string {
  return referencePath.split(path.sep).join("/");
}

function addViolation(
  violations: SkillContractViolation[],
  violation: SkillContractViolation
): void {
  const exists = violations.some(
    (item) => item.code === violation.code && item.path === violation.path
  );
  if (!exists) {
    violations.push(violation);
  }
}

function sortViolations(
  violations: SkillContractViolation[]
): SkillContractViolation[] {
  return [...violations].sort((left, right) => {
    const pathOrder = left.path.localeCompare(right.path);

    return pathOrder === 0 ? left.code.localeCompare(right.code) : pathOrder;
  });
}
