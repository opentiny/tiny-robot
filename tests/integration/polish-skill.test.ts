import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const skillRoot = path.join(
  repositoryRoot,
  "skills/polish-opentiny-article"
);

const requiredFiles = [
  "SKILL.md",
  "references/article-guardrails.md",
  "references/style-guide.md",
  "references/anti-patterns.md",
  "references/examples.md"
];

const forbiddenPaths = [
  "LICENSE.shuorenhua",
  "references/opentiny-article-guardrails.md",
  "references/shuorenhua"
];

describe("polish OpenTiny article skill", () => {
  test.each(requiredFiles)("contains %s", async (relativePath) => {
    const fileStat = await stat(path.join(skillRoot, relativePath));

    expect(fileStat.isFile()).toBe(true);
  });

  test.each(forbiddenPaths)("does not contain %s", async (relativePath) => {
    await expect(stat(path.join(skillRoot, relativePath))).rejects.toMatchObject(
      {
        code: "ENOENT"
      }
    );
  });

  test("uses only local article optimization references", async () => {
    const contents = await Promise.all(
      requiredFiles.map((relativePath) =>
        readFile(path.join(skillRoot, relativePath), "utf8")
      )
    );
    const combined = contents.join("\n");

    for (const forbiddenTerm of [
      "shuorenhua",
      "MrGeDiao",
      "MIT License",
      "0d214c8f0b44ce5e2c923b38ee00ea5356f91a60",
      "public-writing",
      "Tier"
    ]) {
      expect(combined).not.toContain(forbiddenTerm);
    }
  });

  test("links every local reference from the skill entry", async () => {
    const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");

    for (const referencePath of [
      "./references/article-guardrails.md",
      "./references/style-guide.md",
      "./references/anti-patterns.md",
      "./references/examples.md"
    ]) {
      expect(skill).toContain(referencePath);
      const resolvedPath = path.resolve(skillRoot, referencePath);
      const fileStat = await stat(resolvedPath);

      expect(fileStat.isFile()).toBe(true);
    }
  });

  test("defines scopes, protection rules and validation", async () => {
    const [skill, guardrails] = await Promise.all([
      readFile(path.join(skillRoot, "SKILL.md"), "utf8"),
      readFile(
        path.join(skillRoot, "references/article-guardrails.md"),
        "utf8"
      )
    ]);

    for (const scope of ["初稿全文优化", "/ai 全文润色", "Review 局部修订"]) {
      expect(skill).toContain(scope);
    }

    expect(skill).toContain("Head SHA");
    expect(skill).toContain("article-hub validate article");

    for (const protectedContent of [
      "YAML Front Matter",
      "代码块",
      "行内代码",
      "API",
      "版本号",
      "Commit SHA",
      "链接目标",
      "Mermaid",
      "SVG",
      "不新增事实"
    ]) {
      expect(guardrails).toContain(protectedContent);
    }
  });

  test("preserves untouched facts and removes unsupported claims without replacement", async () => {
    const [skill, guardrails, antiPatterns] = await Promise.all([
      readFile(path.join(skillRoot, "SKILL.md"), "utf8"),
      readFile(
        path.join(skillRoot, "references/article-guardrails.md"),
        "utf8"
      ),
      readFile(
        path.join(skillRoot, "references/anti-patterns.md"),
        "utf8"
      )
    ]);

    expect(skill).toContain(
      "逐字保留该事实句，并继续处理其他授权内容"
    );
    expect(skill).toContain(
      "直接删除目标短语，不用推断出的功能或效果补位"
    );
    expect(guardrails).toContain(
      "删除无来源评价时，只保留同句中已有的事实"
    );
    expect(antiPatterns).toContain(
      "不将被删除的评价改写成新的功能、效果或结论"
    );
  });
});
