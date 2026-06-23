import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { inspectSkillContract } from "../support/skill-contract.js";
import {
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";
const skillRoot = path.join(
  repositoryRoot,
  "skills/polish-opentiny-article"
);

interface UpdateStatusOutput {
  mutation_plan: {
    operations: Array<{ kind: string }>;
  };
}

async function writeIssue(labels: string[]) {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-polish-status-"));
  const issueFile = path.join(root, "issue.json");

  await writeFile(
    issueFile,
    JSON.stringify(
      {
        number: 52,
        title: "Review 修订 fixture",
        labels
      },
      null,
      2
    )
  );

  return issueFile;
}

describe("polish OpenTiny article skill", () => {
  test("真实 Skill 满足独立加载契约", async () => {
    await expect(inspectSkillContract(skillRoot)).resolves.toEqual([]);
  });

  test("真实 Skill 的 Review 修订回写命令可回到等待人工", async () => {
    const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");
    const intent = skill.match(/article-hub update-status[\s\S]*?--intent\s+([^\s\\]+)/)?.[1];
    const issueFile = await writeIssue(["阶段：审核", "AI：处理中"]);

    expect(intent).toBeTruthy();
    const output = expectSuccessfulEnvelope<UpdateStatusOutput>(
      runArticleHubCli([
        "--dry-run",
        "update-status",
        "--issue-file",
        issueFile,
        "--repository",
        "hexqi/ai-article-hub",
        "--intent",
        intent ?? "",
        "--phase",
        "阶段：审核",
        "--ai-state",
        "AI：等待人工",
        "--comment",
        "已处理本轮修改意见，请重新 Review。"
      ]),
      "article-hub.update-status",
      {
        mutation_allowed: true,
        blocked_reason: null,
        labels_to_remove: ["AI：处理中"],
        labels_to_add: ["AI：等待人工"]
      }
    );

    expect(output.mutation_plan.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "gh-issue-edit-labels" }),
        expect.objectContaining({ kind: "gh-issue-comment" })
      ])
    );
  });
});
