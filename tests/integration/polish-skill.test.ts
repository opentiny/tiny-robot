import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { inspectSkillContract } from "../support/skill-contract.js";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const skillRoot = path.join(
  repositoryRoot,
  "skills/polish-opentiny-article"
);

describe("polish OpenTiny article skill", () => {
  test("真实 Skill 满足独立加载契约", async () => {
    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
  });

  test("保留调用方依赖的输入场景、Head SHA 保护和文章校验命令", async () => {
    const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");

    for (const scope of ["初稿全文优化", "/ai 全文润色", "Review 局部修订"]) {
      expect(skill).toContain(scope);
    }

    expect(skill).toContain("Head SHA");
    expect(skill).toContain("article-hub validate article");
  });
});
