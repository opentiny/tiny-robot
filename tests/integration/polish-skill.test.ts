import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { inspectSkillContract } from "../support/skill-contract.js";
import { repositoryRoot } from "../support/cli.js";

const skillRoots = [
  path.join(repositoryRoot, ".agents/skills/polish-opentiny-article"),
  path.join(repositoryRoot, ".claude/skills/polish-opentiny-article")
];

describe("polish OpenTiny article skill", () => {
  test("真实 Skill 满足独立加载契约", async () => {
    for (const skillRoot of skillRoots) {
      await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
    }
  });

  test("状态回执统一使用 --comment-file，目标仓库由 origin 推导", async () => {
    for (const skillRoot of skillRoots) {
      const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");
      // 兼容 Windows checkout 的 CRLF，避免 ```sh\n 字面量匹配失败
      const shellBlocks = [...skill.matchAll(/```sh\r?\n([\s\S]*?)```/g)].map(
        (match) => match[1]
      );
      const statusBlocks = shellBlocks.filter((block) =>
        block.includes("update-status")
      );

      expect(statusBlocks.length).toBeGreaterThan(0);

      for (const block of statusBlocks) {
        expect(block).toContain("--comment-file");
        expect(block).not.toContain("--repository");
        expect(block).not.toMatch(/--comment\s+"/);
      }
    }
  });
});
