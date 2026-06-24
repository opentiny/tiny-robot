import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, test } from "vitest";
import { parse as parseYaml } from "yaml";

import { inspectSkillContract } from "../support/skill-contract.js";
import { repositoryRoot } from "../support/cli.js";
const skillRoot = path.join(
  repositoryRoot,
  ".agents/skills/generate-opentiny-article"
);

describe("generate OpenTiny article skill", () => {
  test("真实 Skill 满足独立加载契约", async () => {
    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
  });

  test("文章 Issue Form 使用等待人工的初始状态", async () => {
    const raw = await readFile(
      path.join(repositoryRoot, ".github/ISSUE_TEMPLATE/article.yml"),
      "utf8"
    );
    const template = parseYaml(raw) as { labels?: string[] };

    expect(template.labels).toEqual(expect.arrayContaining(["阶段：选题", "AI：等待人工"]));
  });
});
