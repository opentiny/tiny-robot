import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, test } from "vitest";
import { parse as parseYaml } from "yaml";

import { inspectSkillContract } from "../support/skill-contract.js";
import { repositoryRoot } from "../support/cli.js";

const skillRoots = [
  path.join(repositoryRoot, ".agents/skills/generate-opentiny-article"),
  path.join(repositoryRoot, ".claude/skills/generate-opentiny-article")
];

describe("generate OpenTiny article skill", () => {
  test("真实 Skill 满足独立加载契约", async () => {
    for (const skillRoot of skillRoots) {
      await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
    }
  });

  test("文章 Issue Form 使用等待人工的初始状态", async () => {
    const raw = await readFile(
      path.join(repositoryRoot, ".github/ISSUE_TEMPLATE/article.yml"),
      "utf8"
    );
    const template = parseYaml(raw) as { labels?: string[] };

    expect(template.labels).toEqual(expect.arrayContaining(["阶段：选题", "AI：等待人工"]));
  });

  test("评论 mutation 唯一入口为 comment publish，状态回执使用 comment-file", async () => {
    for (const skillRoot of skillRoots) {
      const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");
      // 兼容 Windows checkout 的 CRLF，避免 ```sh\n 字面量匹配失败
      const shellBlocks = [...skill.matchAll(/```sh\r?\n([\s\S]*?)```/g)].map(
        (match) => match[1]
      );

      expect(skill).toContain("comment publish");
      expect(skill).toContain("--comment-file");
      expect(shellBlocks.some((block) => block.includes("comment publish"))).toBe(
        true
      );

      for (const block of shellBlocks) {
        expect(block).not.toMatch(/^\s*gh issue comment\b/m);
        expect(block).not.toMatch(/^\s*gh pr comment\b/m);

        if (block.includes("update-status")) {
          expect(block).not.toContain("--repository");
          expect(block).not.toMatch(/--comment\s+"/);
          expect(block).toContain("--comment-file");
        }

        if (block.includes("comment publish")) {
          expect(block).not.toContain("--repository");
        }
      }
    }
  });
});
