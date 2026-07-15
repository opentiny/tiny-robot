import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

import {
  expectErrorEnvelope,
  expectSuccessfulEnvelope,
  runArticleHubCli
} from "../support/cli.js";
import {
  buildIssueResource,
  createFakeGh,
  FAKE_DEFAULT_REPOSITORY
} from "../support/fake-gh.js";

const execFileAsync = promisify(execFile);

interface UpdateStatusOutput {
  decision: {
    mutation_allowed: boolean;
    blocked_reason: string | null;
    labels_to_remove: string[];
    labels_to_add: string[];
  };
  comment_delivery: null | {
    status: string;
    comment_id: number;
    comment_url: string;
  };
  mutation_plan: {
    operations: Array<Record<string, unknown>>;
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

async function createGitWorktree(
  originUrl = `https://github.com/${FAKE_DEFAULT_REPOSITORY}.git`
): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-status-repo-"));
  await execFileAsync("git", ["init"], { cwd: root });
  await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: root });
  await execFileAsync("git", ["config", "user.name", "Test"], { cwd: root });
  await execFileAsync("git", ["remote", "add", "origin", originUrl], { cwd: root });
  return root;
}

async function writeIssue(labels: string[], directory?: string) {
  const root = directory ?? (await mkdtemp(path.join(tmpdir(), "article-hub-status-")));
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
  test("dry-run 从当前 worktree 推导 repository 并规划 comment-file", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(
      ["阶段：策划", "AI：等待人工"],
      repo
    );
    const commentFile = path.join(repo, "comment.md");
    await writeFile(commentFile, "写作计划已批准，开始生成初稿。\n");

    const result = runArticleHubCli(
      [
        "--dry-run",
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "content-transition",
        "--phase",
        "阶段：写作",
        "--ai-state",
        "AI：处理中",
        "--comment-file",
        commentFile
      ],
      { cwd: repo }
    );

    const output = expectSuccessfulEnvelope<UpdateStatusOutput>(
      result,
      "article-hub.update-status",
      {
        dry_run: true,
        issue: {
          number: 51
        },
        comment_delivery: null
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
        expect.objectContaining({
          kind: "gh-issue-edit-labels",
          repository: FAKE_DEFAULT_REPOSITORY
        }),
        expect.objectContaining({
          kind: "gh-issue-comment",
          repository: FAKE_DEFAULT_REPOSITORY,
          body_file: path.resolve(commentFile)
        })
      ])
    );
    expect(output.mutation_plan.operations.find((op) => op.kind === "gh-issue-comment")).not.toHaveProperty(
      "body"
    );
  });

  test("传入 --repository 在远端读取前返回 UNKNOWN_OPTION", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(["阶段：写作", "AI：等待人工"], repo);
    const fakeGh = await createFakeGh({
      issueView: {
        number: 51,
        labels: [{ name: "阶段：写作" }, { name: "AI：等待人工" }]
      }
    });

    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--repository",
        FAKE_DEFAULT_REPOSITORY,
        "--intent",
        "pause"
      ],
      { cwd: repo, env: fakeGh.env }
    );

    expectErrorEnvelope(result, "UNKNOWN_OPTION", 2);
    await expect(fakeGh.readCalls()).resolves.toEqual([]);
  });

  test("传入 --comment 在远端读取前返回 UNKNOWN_OPTION", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(["阶段：写作", "AI：等待人工"], repo);
    const fakeGh = await createFakeGh();

    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "pause",
        "--comment",
        "inline"
      ],
      { cwd: repo, env: fakeGh.env }
    );

    expectErrorEnvelope(result, "UNKNOWN_OPTION", 2);
    await expect(fakeGh.readCalls()).resolves.toEqual([]);
  });

  test("dry-run 阻断暂停期间的内容 mutation 且不规划 comment", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(
      ["阶段：写作", "AI：等待人工", "AI执行：人工暂停"],
      repo
    );
    const commentFile = path.join(repo, "blocked.md");
    await writeFile(commentFile, "blocked fixture comment\n");

    const result = runArticleHubCli(
      [
        "--dry-run",
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "content-transition",
        "--phase",
        "阶段：审核",
        "--ai-state",
        "AI：等待人工",
        "--comment-file",
        commentFile
      ],
      { cwd: repo }
    );

    expectSuccessfulEnvelope(result, "article-hub.update-status", {
      decision: {
        mutation_allowed: false,
        blocked_reason: "AI_PAUSED",
        labels_to_remove: [],
        labels_to_add: []
      },
      comment_delivery: null,
      mutation_plan: {
        operations: []
      }
    });
  });

  test("重复 pause 不规划标签或评论 operation", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(
      ["阶段：写作", "AI：等待人工", "AI执行：人工暂停"],
      repo
    );
    const commentFile = path.join(repo, "noop.md");
    await writeFile(commentFile, "must remain a no-op\n");

    const result = runArticleHubCli(
      [
        "--dry-run",
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "pause",
        "--comment-file",
        commentFile
      ],
      { cwd: repo }
    );

    expectSuccessfulEnvelope(result, "article-hub.update-status", {
      decision: {
        mutation_allowed: true,
        blocked_reason: null,
        labels_to_remove: [],
        labels_to_add: []
      },
      comment_delivery: null,
      mutation_plan: {
        operations: []
      }
    });
  });

  test("state decide 与 update-status dry-run 共享同一状态决策", async () => {
    const labels = ["阶段：写作", "AI：等待人工"];
    const stateFile = await writeState(labels);
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(labels, repo);
    const stateResult = runArticleHubCli(["state", "decide", "--state-file", stateFile]);
    const updateResult = runArticleHubCli(
      [
        "--dry-run",
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "pause"
      ],
      { cwd: repo }
    );
    const stateOutput = expectSuccessfulEnvelope<StateDecisionOutput>(
      stateResult,
      "article-hub.state.decide"
    );
    const updateOutput = expectSuccessfulEnvelope<UpdateStatusOutput>(
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
    expect(updateOutput.comment_delivery).toBeNull();
  });

  test("非 dry-run 先校验 intent，非法目标状态不读取远端标签", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(["阶段：写作", "AI：等待人工"], repo);
    const fakeGh = await createFakeGh({
      issueView: {
        number: 51,
        labels: [{ name: "阶段：写作" }, { name: "AI：等待人工" }]
      }
    });
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "pause",
        "--phase",
        "阶段：审核"
      ],
      { cwd: repo, env: fakeGh.env }
    );

    expectErrorEnvelope(result, "INVALID_STATE", 2);
    await expect(fakeGh.readCalls()).resolves.toEqual([]);
  });

  test("非 dry-run 使用最新 GitHub 标签重新检查暂停", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(["阶段：写作", "AI：等待人工"], repo);
    const commentFile = path.join(repo, "must-not.md");
    await writeFile(commentFile, "must not be posted\n");
    const fakeGh = await createFakeGh({
      issueView: {
        number: 51,
        labels: [
          { name: "阶段：写作" },
          { name: "AI：等待人工" },
          { name: "AI执行：人工暂停" }
        ]
      },
      issueResources: {
        "51": buildIssueResource(51)
      }
    });
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "content-transition",
        "--phase",
        "阶段：审核",
        "--ai-state",
        "AI：等待人工",
        "--comment-file",
        commentFile
      ],
      { cwd: repo, env: fakeGh.env }
    );

    expectSuccessfulEnvelope(result, "article-hub.update-status", {
      decision: {
        mutation_allowed: false,
        blocked_reason: "AI_PAUSED"
      },
      comment_delivery: null,
      mutation_plan: {
        operations: []
      }
    });
    const calls = await fakeGh.readCalls();

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual(
      expect.arrayContaining(["issue", "view", "51", "number,labels"])
    );
    expect(calls[0]).toEqual(
      expect.arrayContaining(["--repo", `github.com/${FAKE_DEFAULT_REPOSITORY}`])
    );
    expect(calls.flat()).not.toContain("edit");
    expect(calls.flat()).not.toContain("comment");
  });

  test("非 dry-run 从文件发布多行状态评论并返回 created comment_delivery", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(["阶段：写作", "AI：处理中"], repo);
    const commentFile = path.join(repo, "comment.md");
    const comment = "## 状态回执\n\n保留 `$(command)` 与 ! 字符。\n";
    const fakeGh = await createFakeGh({
      issueView: {
        number: 51,
        labels: [{ name: "阶段：写作" }, { name: "AI：处理中" }]
      },
      issueResources: {
        "51": buildIssueResource(51)
      }
    });

    await writeFile(commentFile, comment);
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "content-transition",
        "--phase",
        "阶段：写作",
        "--ai-state",
        "AI：等待人工",
        "--comment-file",
        commentFile
      ],
      { cwd: repo, env: fakeGh.env }
    );

    const output = expectSuccessfulEnvelope<UpdateStatusOutput>(
      result,
      "article-hub.update-status"
    );
    expect(output.comment_delivery).toEqual({
      status: "created",
      comment_id: 9001,
      comment_url: expect.stringContaining("#issuecomment-9001")
    });

    const calls = await fakeGh.readCalls();
    const commentCall = calls.find((call) => call[0] === "issue" && call[1] === "comment");

    expect(commentCall).toEqual(
      expect.arrayContaining([
        "--body-file",
        path.resolve(commentFile),
        "--repo",
        `github.com/${FAKE_DEFAULT_REPOSITORY}`
      ])
    );
    expect(commentCall).not.toContain("--body");
    expect(commentCall?.join(" ")).not.toContain("$(command)");

    // 调用序列：view 标签 → issue edit → issue comment。
    const stageIndexes = {
      view: calls.findIndex((call) => call[0] === "issue" && call[1] === "view"),
      edit: calls.findIndex((call) => call[0] === "issue" && call[1] === "edit"),
      comment: calls.findIndex((call) => call[0] === "issue" && call[1] === "comment")
    };

    expect(stageIndexes.view).toBeGreaterThanOrEqual(0);
    expect(stageIndexes.edit).toBeGreaterThan(stageIndexes.view);
    expect(stageIndexes.comment).toBeGreaterThan(stageIndexes.edit);
    expect(calls.some((call) => call[0] === "api")).toBe(false);
    expect(
      calls.some(
        (call) =>
          call[0] === "api" &&
          call.some((arg) => /\/issues\/comments\//.test(arg))
      )
    ).toBe(false);
  });

  test("标签已更新但评论发布未知时返回 unknown_operations", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(["阶段：写作", "AI：处理中"], repo);
    const commentFile = path.join(repo, "wait.md");
    await writeFile(commentFile, "等待人工\n");
    const fakeGh = await createFakeGh({
      issueView: {
        number: 51,
        labels: [{ name: "阶段：写作" }, { name: "AI：处理中" }]
      },
      issueResources: {
        "51": buildIssueResource(51)
      },
      failIssueComment: true
    });
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "content-transition",
        "--phase",
        "阶段：写作",
        "--ai-state",
        "AI：等待人工",
        "--comment-file",
        commentFile
      ],
      { cwd: repo, env: fakeGh.env }
    );
    const output = expectErrorEnvelope<{
      error: {
        code: string;
        details: {
          mutation_state: string;
          retry_safe: boolean;
          completed_operations: Array<{ kind: string }>;
          unknown_operations: Array<{ kind: string }>;
        };
      };
    }>(result, "PARTIAL_MUTATION", 1);

    expect(output.error.details).toMatchObject({
      mutation_state: "unknown",
      retry_safe: false
    });
    expect(output.error.details.completed_operations).toEqual([
      expect.objectContaining({ kind: "gh-issue-edit-labels" })
    ]);
    expect(output.error.details.unknown_operations).toEqual([
      expect.objectContaining({ kind: "gh-issue-comment" })
    ]);
  });

  test("标签与评论已创建但评论结果无效时返回 created", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(["阶段：写作", "AI：处理中"], repo);
    const commentFile = path.join(repo, "wait.md");
    await writeFile(commentFile, "等待人工\n");
    const fakeGh = await createFakeGh({
      issueView: {
        number: 51,
        labels: [{ name: "阶段：写作" }, { name: "AI：处理中" }]
      },
      issueResources: {
        "51": buildIssueResource(51)
      },
      omitCommentUrl: true
    });
    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "content-transition",
        "--phase",
        "阶段：写作",
        "--ai-state",
        "AI：等待人工",
        "--comment-file",
        commentFile
      ],
      { cwd: repo, env: fakeGh.env }
    );
    const output = expectErrorEnvelope<{
      error: {
        details: {
          mutation_state: string;
          retry_safe: boolean;
          result_error: string;
          completed_operations: Array<Record<string, unknown>>;
          unknown_operations: Array<unknown>;
        };
      };
    }>(result, "PARTIAL_MUTATION", 1);

    expect(output.error.details).toMatchObject({
      mutation_state: "created",
      retry_safe: false
    });
    expect(output.error.details.unknown_operations).toEqual([]);
    expect(output.error.details.completed_operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "gh-issue-edit-labels" }),
        expect.objectContaining({
          kind: "gh-issue-comment",
          result_error: expect.any(String)
        })
      ])
    );
  });

  test("评论文件本地无效时不修改标签", async () => {
    const repo = await createGitWorktree();
    const issueFile = await writeIssue(["阶段：写作", "AI：处理中"], repo);
    const fakeGh = await createFakeGh({
      issueView: {
        number: 51,
        labels: [{ name: "阶段：写作" }, { name: "AI：处理中" }]
      },
      issueResources: {
        "51": buildIssueResource(51)
      }
    });

    const result = runArticleHubCli(
      [
        "update-status",
        "--issue-file",
        issueFile,
        "--intent",
        "content-transition",
        "--phase",
        "阶段：写作",
        "--ai-state",
        "AI：等待人工",
        "--comment-file",
        path.join(repo, "missing-comment.md")
      ],
      { cwd: repo, env: fakeGh.env }
    );

    expectErrorEnvelope(result, "COMMENT_FILE_NOT_FOUND", 2);
    await expect(fakeGh.readCalls()).resolves.toEqual([]);
  });
});
