import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const excludedPathSegments = new Set([".git", "node_modules", "dist"]);
const textFileExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".md",
  ".mjs",
  ".scss",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml"
]);
const extensionlessTextFiles = new Set(["INSTALL"]);
const numberedSchemaPattern = new RegExp(
  ["\\b", "v", "1", "\\b|\\bV", "1", "\\b|v", "1", "_|_v", "1", "|v", "1", "-|/v", "1"].join("")
);
const stageCodePattern = new RegExp(
  [
    "阶段",
    "A|阶段",
    " A|Phase",
    " A|phase",
    " A|Phase",
    "-A|phase",
    "-a"
  ].join("")
);
const earlyReleasePattern = new RegExp(["首", "版|第一", "阶段|阶段", "一"].join(""));
const futureStagePattern = new RegExp(
  ["Phase", " B|phase", " B|阶段", " B|阶段", "B"].join("")
);
const forbiddenPatterns = [
  { label: "numbered-schema", pattern: numberedSchemaPattern },
  {
    label: "stage-a",
    pattern: stageCodePattern
  },
  { label: "early-release", pattern: earlyReleasePattern },
  { label: "future-stage", pattern: futureStagePattern }
] as const;

/**
 * 扫描仓库文本文件，防止临时路线图术语重新进入源码与文档。
 *
 * @param root 待扫描目录。
 * @returns 可安全按 UTF-8 读取的文本文件列表。
 */
async function listTextFiles(root: string): Promise<string[]> {
  const entries = await readdir(root);
  const files: string[] = [];

  for (const entry of entries) {
    if (excludedPathSegments.has(entry)) {
      continue;
    }

    const fullPath = path.join(root, entry);
    const fileStat = await stat(fullPath);

    if (fileStat.isDirectory()) {
      files.push(...(await listTextFiles(fullPath)));
      continue;
    }

    if (isTextFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function isTextFile(filePath: string): boolean {
  const extension = path.extname(filePath);

  return (
    textFileExtensions.has(extension) ||
    extensionlessTextFiles.has(path.basename(filePath))
  );
}

describe("repository terminology guard", () => {
  test("does not expose intermediate stage terms", async () => {
    const files = await listTextFiles(repositoryRoot);
    const violations: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf8");
      const relativePath = path.relative(repositoryRoot, file);

      for (const { label, pattern } of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push(`${relativePath}: ${label}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
