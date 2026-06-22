import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const requiredFiles = [
  "INSTALL.md",
  "skills/generate-opentiny-article/SKILL.md",
  "skills/polish-opentiny-article/SKILL.md",
  ".github/workflows/article-ci.yml",
  ".github/ISSUE_TEMPLATE/article.yml",
  ".github/pull_request_template.md"
];

const requiredDirectories = [
  "articles",
  "materials/article-archive",
  "materials/issue-sources",
  "references/brand",
  "references/terminology",
  "scripts"
];

describe("Phase A repository structure", () => {
  test.each(requiredFiles)("contains %s", async (relativePath) => {
    const fileStat = await stat(path.join(repositoryRoot, relativePath));

    expect(fileStat.isFile()).toBe(true);
  });

  test.each(requiredDirectories)("contains %s", async (relativePath) => {
    const directoryStat = await stat(path.join(repositoryRoot, relativePath));

    expect(directoryStat.isDirectory()).toBe(true);
  });
});
