import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const cliPath = path.join(repositoryRoot, "src/cli.ts");
const issueFixture = path.join(repositoryRoot, "tests/fixtures/issue-minimal.json");

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
}

async function writeIssue(labels: string[]) {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-status-"));
  const issueFile = path.join(root, "issue.json");

  await writeFile(
    issueFile,
    JSON.stringify(
      {
        number: 51,
        title: "状态更新 fixture",
        labels
      },
      null,
      2
    )
  );

  return issueFile;
}

describe("article-hub update-status CLI", () => {
  test("dry-run computes phase and AI label changes from an issue fixture", () => {
    const result = runCli([
      "--dry-run",
      "update-status",
      "--issue-file",
      issueFixture,
      "--repository",
      "hexqi/ai-article-hub",
      "--phase",
      "阶段：写作",
      "--ai-state",
      "AI：处理中",
      "--comment",
      "写作计划已批准，开始生成初稿。"
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");

    const output = JSON.parse(result.stdout);

    expect(output).toMatchObject({
      ok: true,
      schema_version: "article-hub.update-status.v1",
      dry_run: true,
      issue: {
        number: 42
      },
      mutation_allowed: true,
      labels_to_remove: ["阶段：策划", "AI：等待人工"],
      labels_to_add: ["阶段：写作", "AI：处理中"]
    });
    expect(output.mutation_plan.operations.map((operation: { kind: string }) => operation.kind)).toEqual([
      "gh-issue-edit-labels",
      "gh-issue-comment"
    ]);
  });

  test("dry-run refuses content mutations while AI is paused", async () => {
    const issueFile = await writeIssue(["阶段：写作", "AI：已暂停"]);
    const result = runCli([
      "--dry-run",
      "update-status",
      "--issue-file",
      issueFile,
      "--repository",
      "hexqi/ai-article-hub",
      "--phase",
      "阶段：审核",
      "--ai-state",
      "AI：等待人工"
    ]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: true,
      mutation_allowed: false,
      blocked_reason: "AI_PAUSED",
      labels_to_remove: [],
      labels_to_add: [],
      mutation_plan: {
        operations: []
      }
    });
  });
});
