import path from "node:path";

import { describe, expect, test } from "vitest";

import { inspectSkillContract } from "../support/skill-contract.js";
import { repositoryRoot } from "../support/cli.js";
const skillRoot = path.join(
  repositoryRoot,
  "skills/polish-opentiny-article"
);

describe("polish OpenTiny article skill", () => {
  test("真实 Skill 满足独立加载契约", async () => {
    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
  });
});
