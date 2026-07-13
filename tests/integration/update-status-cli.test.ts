import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  expectErrorEnvelope,
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";
import { createFakeGh } from "../support/fake-gh.js";

const issueFixture = path.join(repositoryRoot, "tests/fixtures/issue-minimal.json");

interface UpdateStatusOutput {
  decision: {
    mutation_allowed: boolean;
    blocked_reason: string | null;
    labels_to_remove: string[];
    labels_to_add: string[];
  };
  mutation_plan: {
    operations: Array<{ kind: string }>;
  };
}

interface StateDecisionOutput {
  decision: {
    mutation_allowed: boolean;
    blocked_reason: string | null;
    labels_to_remove: string[];
    labels_to_add: string[];
  };
}

interface UpdateStatusDecisionOutput {
  decision: {
    mutation_allowed: boolean;
    blocked_reason: string | null;
    labels_to_remove: string[];
    labels_to_add: string[];
  };
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

async function writeState(labels: string[]) {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-state-"));
  const stateFile = path.join(root, "state.json");

  await writeFile(
    stateFile,
    JSON.stringify({
      labels,
      intent: "pause"
    })
  );

  return stateFile;
}

describe("article-hub update-status CLI", () => {
  test("dry-run computes phase and AI label changes from an issue fixture", () => {
    const result = runArticleHubCli([
      "--dry-run",
      "update-status",
      "--issue-file",
      issueFixture,
      "--repository",
      "hexqi/ai-article-hub",
      "--intent",
      "content-transition",
      "--phase",
      "阶段：写作",
      "--ai-state",
      "AI：处理中",
      "--comment",
      "写作计划已批准，开始生成初稿。"
    ]);

    const output = expectSuccessfulEnvelope<UpdateStatusOutput>(
      result,
      "article-hub.update-status",
      {
        dry_run: true,
        issue: {
          number: 42
        }
      }
    );
    expect(output.decision.mutation_allowed).toBe(true);
    expect(new Set(output.decision.labels_to_remove)).toEqual(
      new Set(["阶段：策划", "AI：等待人工"])
    );
    expect(new Set(output.decision.labels_to_add)).toEqual(
      new Set(["阶段：写作", "AI：处理中"])
    );
    expect(output.mutation_plan.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "gh-issue-edit-labels" }),
        expect.objectContaining({ kind: "gh-issue-comment" })
      ])
    );
  });

  test("dry-run 阻断暂停期间的内容 mutation 且不规划 comment", async () => {
    const issueFile = await writeIssue(["阶段：写作", "AI：等待人工", "AI执行：人工暂停"]);
    const result = runArticleHubCli([
      "--dry-run",
      "update-status",
      "--issue-file",
      issueFile,
      "--repository",
      "hexqi/ai-article-hub",
      "--intent",
      "content-transition",
      "--phase",
      "阶段：审核",
      "--ai-state",
      "AI：等待人工",
      "--comment",
      "blocked fixture comment"
    ]);

    expectSuccessfulEnvelope(result, "article-hub.update-status", {
      decision: {
        mutation_allowed: false,
        blocked_reason: "AI_PAUSED",
        labels_to_remove: [],
        labels_to_add: []
      },
      mutation_plan: {
        operations: []
      }
    });
  });

  test("重复 pause 不规划标签或评论 operation", async () => {
    const issueFile = await writeIssue(["阶段：写作", "AI：等待人工", "AI执行：人工暂停"]);
    const result = runArticleHubCli([
      "--dry-run",
      "update-status",
      "--issue-file",
      issueFile,
      "--repository",
      "hexqi/ai-article-hub",
      "--intent",
      "pause",
      "--comment",
      "must remain a no-op"
    ]);

    expectSuccessfulEnvelope(result, "article-hub.update-status", {
      decision: {
        mutation_allowed: true,
        blocked_reason: null,
        labels_to_remove: [],
        labels_to_add: []
      },
      mutation_plan: {
        operations: []
      }
    });
  });

  test("state decide 与 update-status dry-run 共享同一状态决策", async () => {
    const labels = ["阶段：写作", "AI：等待人工"];
    const stateFile = await writeState(labels);
    const issueFile = await writeIssue(labels);
    const stateResult = runArticleHubCli(["state", "decide", "--state-file", stateFile]);
    const updateResult = runArticleHubCli([
      "--dry-run",
      "update-status",
      "--issue-file",
      issueFile,
      "--repository",
      "hexqi/ai-article-hub",
      "--intent",
      "pause"
    ]);
    const stateOutput = expectSuccessfulEnvelope<StateDecisionOutput>(
      stateResult,
      "article-hub.state.decide"
    );
    const updateOutput = expectSuccessfulEnvelope<UpdateStatusDecisionOutput>(
      updateResult,
      "article-hub.update-status"
    );

    expect(updateOutput.decision).toMatchObject({
      mutation_allowed: stateOutput.decision.mutation_allowed,
      blocked_reason: stateOutput.decision.blocked_reason
    });
    expect(new Set(updateOutput.decision.labels_to_remove)).toEqual(
      new Set(stateOutput.decision.labels_to_remove)
    );
    expect(new Set(updateOutput.decision.labels_to_add)).toEqual(
      new Set(stateOutput.decision.labels_to_add)
    );
    expect(updateOutput).not.toHaveProperty("mutation_allowed");
    expect(updateOutput).not.toHaveProperty("blocked_reason");
    expect(updateOutput).not.toHaveProperty("labels_to_remove");
    expect(updateOutput).not.toHaveProperty("labels_to_add");
  });

  test("非 dry-run 先校验 intent，非法目标状态不读取远端标签", async () => {
    const issueFile = await writeIssue(["阶段：写作", "AI：等待人工"]);
    const fakeGh = await createFakeGh({
      number: 51,
      labels: [{ name: "阶段：写作" }, { name: "AI：等待人工" }]
    });
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--repository",
        "hexqi/ai-article-hub",
        "--intent",
        "pause",
        "--phase",
        "阶段：审核"
      ],
      { env: fakeGh.env }
    );

    expectErrorEnvelope(result, "INVALID_STATE", 2);
    await expect(fakeGh.readCalls()).resolves.toEqual([]);
  });

  test("非 dry-run 使用最新 GitHub 标签重新检查暂停", async () => {
    const issueFile = await writeIssue(["阶段：写作", "AI：等待人工"]);
    const fakeGh = await createFakeGh({
      number: 51,
      labels: [
        { name: "阶段：写作" },
        { name: "AI：等待人工" },
        { name: "AI执行：人工暂停" }
      ]
    });
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--repository",
        "hexqi/ai-article-hub",
        "--intent",
        "content-transition",
        "--phase",
        "阶段：审核",
        "--ai-state",
        "AI：等待人工",
        "--comment",
        "must not be posted"
      ],
      { env: fakeGh.env }
    );

    expectSuccessfulEnvelope(result, "article-hub.update-status", {
      decision: {
        mutation_allowed: false,
        blocked_reason: "AI_PAUSED"
      },
      mutation_plan: {
        operations: []
      }
    });
    const calls = await fakeGh.readCalls();

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual(
      expect.arrayContaining(["issue", "view", "51", "number,labels"])
    );
    expect(calls.flat()).not.toContain("edit");
    expect(calls.flat()).not.toContain("comment");
  });

  test("非 dry-run 从文件读取多行状态评论", async () => {
    const issueFile = await writeIssue(["阶段：写作", "AI：处理中"]);
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-status-comment-"));
    const commentFile = path.join(root, "comment.md");
    const comment = "## 状态回执\n\n保留 `$(command)` 与 ! 字符。\n";
    const fakeGh = await createFakeGh({
      number: 51,
      labels: [{ name: "阶段：写作" }, { name: "AI：处理中" }]
    });

    await writeFile(commentFile, comment);
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--repository",
        "hexqi/ai-article-hub",
        "--intent",
        "content-transition",
        "--phase",
        "阶段：写作",
        "--ai-state",
        "AI：等待人工",
        "--comment-file",
        commentFile
      ],
      { env: fakeGh.env }
    );

    expectSuccessfulEnvelope(result, "article-hub.update-status");
    const calls = await fakeGh.readCalls();
    const commentCall = calls.find((call) => call[0] === "issue" && call[1] === "comment");

    expect(commentCall).toEqual(expect.arrayContaining(["--body", comment]));
  });

  test("标签已更新但评论失败时返回可恢复的部分成功结果", async () => {
    const issueFile = await writeIssue(["阶段：写作", "AI：处理中"]);
    const fakeGh = await createFakeGh(
      {
        number: 51,
        labels: [{ name: "阶段：写作" }, { name: "AI：处理中" }]
      },
      { failIssueComment: true }
    );
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--repository",
        "hexqi/ai-article-hub",
        "--intent",
        "content-transition",
        "--phase",
        "阶段：写作",
        "--ai-state",
        "AI：等待人工",
        "--comment",
        "等待人工"
      ],
      { env: fakeGh.env }
    );
    const output = expectErrorEnvelope<{
      error: {
        code: string;
        details: {
          completed_operations: Array<{ kind: string }>;
          pending_operations: Array<{ kind: string }>;
        };
      };
    }>(result, "PARTIAL_MUTATION", 1);

    expect(output.error.details.completed_operations).toEqual([
      expect.objectContaining({ kind: "gh-issue-edit-labels" })
    ]);
    expect(output.error.details.pending_operations).toEqual([
      expect.objectContaining({ kind: "gh-issue-comment" })
    ]);
  });
});
