import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
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

interface CommentPublishOutput {
  dry_run: boolean;
  target: {
    kind: string;
    number: number;
    repository: string;
  };
  body: {
    file: string;
    line_count: number;
  };
  delivery: null | {
    status: string;
    comment_id: number;
    comment_url: string;
  };
  mutation_plan: {
    operations: Array<Record<string, unknown>>;
  };
}

async function createGitWorktree(options: {
  originUrls?: string[];
  remoteName?: string;
} = {}): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-comment-repo-"));
  await execFileAsync("git", ["init"], { cwd: root });
  await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: root });
  await execFileAsync("git", ["config", "user.name", "Test"], { cwd: root });

  const urls = options.originUrls ?? [`https://github.com/${FAKE_DEFAULT_REPOSITORY}.git`];
  const remoteName = options.remoteName ?? "origin";

  for (const url of urls) {
    try {
      await execFileAsync("git", ["remote", "add", remoteName, url], { cwd: root });
    } catch {
      await execFileAsync("git", ["remote", "set-url", "--add", remoteName, url], {
        cwd: root
      });
    }
  }

  return root;
}

async function writeBodyFile(
  directory: string,
  content: string,
  name = "body.md"
): Promise<string> {
  const file = path.join(directory, name);
  await writeFile(file, content);
  return file;
}

function expectedLines(content: string): number {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const withoutTrailing = normalized.endsWith("\n")
    ? normalized.slice(0, -1)
    : normalized;

  return withoutTrailing.length === 0 ? 0 : withoutTrailing.split("\n").length;
}

describe("article-hub comment publish CLI", () => {
  test("PR dry-run 从当前 worktree origin 推导 repository 且不调用 gh", async () => {
    const repo = await createGitWorktree();
    const body = "## 巡检回执\n\n处理完成。\n";
    const bodyFile = await writeBodyFile(repo, body);

    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "123",
        "--body-file",
        bodyFile
      ],
      { cwd: repo }
    );

    const output = expectSuccessfulEnvelope<CommentPublishOutput>(
      result,
      "article-hub.comment.publish",
      {
        dry_run: true,
        delivery: null,
        target: {
          kind: "pr",
          number: 123,
          repository: FAKE_DEFAULT_REPOSITORY
        }
      }
    );

    expect(output.body).toEqual({
      file: path.resolve(bodyFile),
      line_count: expectedLines(body)
    });
    expect(output.mutation_plan.operations).toEqual([
      {
        kind: "gh-pr-comment",
        repository: FAKE_DEFAULT_REPOSITORY,
        number: 123,
        body_file: path.resolve(bodyFile)
      }
    ]);
    expect(JSON.stringify(output)).not.toContain("处理完成");
  });

  test("Issue dry-run 输出 gh-issue-comment operation", async () => {
    const repo = await createGitWorktree({
      originUrls: [`git@github.com:${FAKE_DEFAULT_REPOSITORY}.git`]
    });
    const body = "写作计划摘要\n";
    const bodyFile = await writeBodyFile(repo, body);

    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "issue",
        "--number",
        "51",
        "--body-file",
        bodyFile
      ],
      { cwd: repo }
    );

    const output = expectSuccessfulEnvelope<CommentPublishOutput>(
      result,
      "article-hub.comment.publish",
      {
        dry_run: true,
        target: {
          kind: "issue",
          number: 51,
          repository: FAKE_DEFAULT_REPOSITORY
        }
      }
    );

    expect(output.mutation_plan.operations[0]).toMatchObject({
      kind: "gh-issue-comment",
      repository: FAKE_DEFAULT_REPOSITORY,
      number: 51
    });
  });

  test("子目录 cwd 仍推导同一 repository", async () => {
    const repo = await createGitWorktree();
    const nested = path.join(repo, "docs", "nested");
    await mkdir(nested, { recursive: true });
    const bodyFile = await writeBodyFile(nested, "nested body\n");

    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile
      ],
      { cwd: nested }
    );

    expectSuccessfulEnvelope(result, "article-hub.comment.publish", {
      target: {
        repository: FAKE_DEFAULT_REPOSITORY
      }
    });
  });

  test("目录作为正文文件返回 INVALID_COMMENT_FILE 且 retry_safe", async () => {
    const repo = await createGitWorktree();
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        repo
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          stage: string;
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "INVALID_COMMENT_FILE", 2);

    expect(output.error.details).toMatchObject({
      stage: "body-file",
      mutation_state: "not_started",
      retry_safe: true
    });
  });

  test("stdin - 返回 INVALID_COMMENT_FILE 且 retry_safe", async () => {
    const repo = await createGitWorktree();
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        "-"
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          stage: string;
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "INVALID_COMMENT_FILE", 2);

    expect(output.error.details).toMatchObject({
      stage: "body-file",
      mutation_state: "not_started",
      retry_safe: true
    });
  });

  test("空白正文返回 INVALID_COMMENT_FILE 且 retry_safe", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "  \n\t\n");
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          stage: string;
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "INVALID_COMMENT_FILE", 2);

    expect(output.error.details).toMatchObject({
      stage: "body-file",
      mutation_state: "not_started",
      retry_safe: true
    });
  });

  test("无效 UTF-8 返回 INVALID_COMMENT_FILE 且 retry_safe", async () => {
    const repo = await createGitWorktree();
    const bodyFile = path.join(repo, "invalid.md");
    await writeFile(bodyFile, Buffer.from([0xff, 0xfe, 0xfd]));

    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          stage: string;
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "INVALID_COMMENT_FILE", 2);

    expect(output.error.details).toMatchObject({
      stage: "body-file",
      mutation_state: "not_started",
      retry_safe: true
    });
  });

  test("缺失正文文件返回 COMMENT_FILE_NOT_FOUND 且 retry_safe", async () => {
    const repo = await createGitWorktree();
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        path.join(repo, "missing.md")
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          stage: string;
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "COMMENT_FILE_NOT_FOUND", 2);

    expect(output.error.details).toMatchObject({
      stage: "body-file",
      mutation_state: "not_started",
      retry_safe: true
    });
  });

  test("非法 target 返回 MISSING_ARGUMENT 且 retry_safe", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "PR",
        "--number",
        "1",
        "--body-file",
        bodyFile
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          stage: string;
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "MISSING_ARGUMENT", 2);

    expect(output.error.details).toMatchObject({
      stage: "argument",
      mutation_state: "not_started",
      retry_safe: true
    });
  });

  test("非法 number 返回 MISSING_ARGUMENT 且 retry_safe", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "0",
        "--body-file",
        bodyFile
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          stage: string;
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "MISSING_ARGUMENT", 2);

    expect(output.error.details).toMatchObject({
      stage: "argument",
      mutation_state: "not_started",
      retry_safe: true
    });
  });

  test("传入 --repository 返回 UNKNOWN_OPTION 且不访问 gh", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const fakeGh = await createFakeGh();
    const result = runArticleHubCli(
      [
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile,
        "--repository",
        "other/repo"
      ],
      { cwd: repo, env: fakeGh.env }
    );

    expectErrorEnvelope(result, "UNKNOWN_OPTION", 2);
    await expect(fakeGh.readCalls()).resolves.toEqual([]);
  });

  test("传入 --body 返回 UNKNOWN_OPTION", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile,
        "--body",
        "inline"
      ],
      { cwd: repo }
    );

    expectErrorEnvelope(result, "UNKNOWN_OPTION", 2);
  });

  test("cwd 不在 Git worktree 返回 CURRENT_REPOSITORY_INVALID", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-not-git-"));
    const bodyFile = await writeBodyFile(root, "ok\n");
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile
      ],
      { cwd: root }
    );

    const output = expectErrorEnvelope<{
      error: { details: { reason: string; mutation_state: string; retry_safe: boolean } };
    }>(result, "CURRENT_REPOSITORY_INVALID", 2);

    expect(output.error.details).toMatchObject({
      reason: "not_git_repository",
      mutation_state: "not_started",
      retry_safe: true
    });
  });

  test("origin 缺失返回 CURRENT_REPOSITORY_INVALID", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-no-origin-"));
    await execFileAsync("git", ["init"], { cwd: root });
    const bodyFile = await writeBodyFile(root, "ok\n");
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile
      ],
      { cwd: root }
    );

    const output = expectErrorEnvelope<{
      error: { details: { reason: string } };
    }>(result, "CURRENT_REPOSITORY_INVALID", 2);

    expect(output.error.details.reason).toBe("origin_missing");
  });

  test("多个不同 origin URL 返回 CURRENT_REPOSITORY_INVALID", async () => {
    const repo = await createGitWorktree({
      originUrls: [
        `https://github.com/${FAKE_DEFAULT_REPOSITORY}.git`,
        "https://github.com/other/ai-article-hub.git"
      ]
    });
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: { details: { reason: string } };
    }>(result, "CURRENT_REPOSITORY_INVALID", 2);

    expect(output.error.details.reason).toBe("origin_ambiguous");
  });

  test("非 github.com remote 返回 CURRENT_REPOSITORY_INVALID", async () => {
    const repo = await createGitWorktree({
      originUrls: [`https://gitlab.com/${FAKE_DEFAULT_REPOSITORY}.git`]
    });
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const result = runArticleHubCli(
      [
        "--dry-run",
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "1",
        "--body-file",
        bodyFile
      ],
      { cwd: repo }
    );

    const output = expectErrorEnvelope<{
      error: { details: { reason: string } };
    }>(result, "CURRENT_REPOSITORY_INVALID", 2);

    expect(output.error.details.reason).toBe("unsupported_origin");
  });

  test("真实 PR 发布成功后直接返回 created delivery", async () => {
    const repo = await createGitWorktree();
    const body =
      '## AI 巡检处理回执\n\n保留 "quotes"、`code`、$(command)、! 与 <!-- html -->。\n\n- item\n';
    const bodyFile = await writeBodyFile(repo, body);
    const fakeGh = await createFakeGh({
      repository: FAKE_DEFAULT_REPOSITORY,
      issueResources: {
        "123": buildIssueResource(123, { pullRequest: true })
      }
    });

    const result = runArticleHubCli(
      [
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "123",
        "--body-file",
        bodyFile
      ],
      {
        cwd: repo,
        env: {
          ...fakeGh.env,
          GH_REPO: "other/override",
          GH_HOST: "example.com"
        }
      }
    );

    const output = expectSuccessfulEnvelope<CommentPublishOutput>(
      result,
      "article-hub.comment.publish",
      {
        dry_run: false,
        target: {
          kind: "pr",
          number: 123,
          repository: FAKE_DEFAULT_REPOSITORY
        }
      }
    );

    expect(output.delivery).toEqual({
      status: "created",
      comment_id: 9001,
      comment_url: expect.stringContaining("#issuecomment-9001")
    });
    expect(output.body.line_count).toBe(expectedLines(body));

    const calls = await fakeGh.readCalls();
    const commentCall = calls.find((call) => call[0] === "pr" && call[1] === "comment");
    const apiCalls = calls.filter((call) => call[0] === "api");

    expect(commentCall).toEqual(
      expect.arrayContaining([
        "pr",
        "comment",
        "123",
        "--repo",
        `github.com/${FAKE_DEFAULT_REPOSITORY}`,
        "--body-file",
        path.resolve(bodyFile)
      ])
    );
    expect(commentCall).not.toContain("--body");
    expect(commentCall?.join(" ")).not.toContain("$(command)");
    expect(apiCalls.every((call) => call.includes("--hostname") && call.includes("github.com"))).toBe(
      true
    );
    expect(JSON.stringify(output)).not.toContain("$(command)");
    expect(result.stderr).not.toContain("$(command)");
  });

  test("target=pr 指向纯 Issue 在 mutation 前返回 COMMENT_TARGET_MISMATCH", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const fakeGh = await createFakeGh({
      issueResources: {
        "10": buildIssueResource(10, { pullRequest: false })
      }
    });

    const result = runArticleHubCli(
      [
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "10",
        "--body-file",
        bodyFile
      ],
      { cwd: repo, env: fakeGh.env }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          mutation_state: string;
          retry_safe: boolean;
          stage: string;
        };
      };
    }>(result, "COMMENT_TARGET_MISMATCH", 2);

    expect(output.error.details).toMatchObject({
      mutation_state: "not_started",
      retry_safe: true,
      stage: "target-preflight"
    });

    const calls = await fakeGh.readCalls();
    expect(calls.some((call) => call.includes("comment"))).toBe(false);
  });

  test("target=issue 指向 PR 在 mutation 前返回 COMMENT_TARGET_MISMATCH", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const fakeGh = await createFakeGh({
      issueResources: {
        "10": buildIssueResource(10, { pullRequest: true })
      }
    });

    const result = runArticleHubCli(
      [
        "comment",
        "publish",
        "--target",
        "issue",
        "--number",
        "10",
        "--body-file",
        bodyFile
      ],
      { cwd: repo, env: fakeGh.env }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          mutation_state: string;
          retry_safe: boolean;
          stage: string;
        };
      };
    }>(result, "COMMENT_TARGET_MISMATCH", 2);

    expect(output.error.details).toMatchObject({
      mutation_state: "not_started",
      retry_safe: true,
      stage: "target-preflight"
    });

    const calls = await fakeGh.readCalls();
    expect(calls.some((call) => call.includes("comment"))).toBe(false);
  });

  test("目标预检失败返回 GITHUB_COMMAND_FAILED 且 mutation 未开始", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const fakeGh = await createFakeGh({
      failTargetPreflight: true,
      issueResources: {
        "10": buildIssueResource(10, { pullRequest: true })
      }
    });

    const result = runArticleHubCli(
      [
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "10",
        "--body-file",
        bodyFile
      ],
      { cwd: repo, env: fakeGh.env }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          stage: string;
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "GITHUB_COMMAND_FAILED", 1);

    expect(output.error.details).toMatchObject({
      stage: "target-preflight",
      mutation_state: "not_started",
      retry_safe: true
    });

    const calls = await fakeGh.readCalls();
    expect(calls.some((call) => call.includes("comment"))).toBe(false);
  });

  test("发布命令非零退出返回 mutation_state=unknown", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const fakeGh = await createFakeGh({
      failPrComment: true,
      issueResources: {
        "10": buildIssueResource(10, { pullRequest: true })
      }
    });

    const result = runArticleHubCli(
      [
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "10",
        "--body-file",
        bodyFile
      ],
      { cwd: repo, env: fakeGh.env }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "GITHUB_COMMAND_FAILED", 1);

    expect(output.error.details).toMatchObject({
      mutation_state: "unknown",
      retry_safe: false
    });
  });

  test("发布成功但 URL 无效返回 COMMENT_RESULT_INVALID created", async () => {
    const repo = await createGitWorktree();
    const bodyFile = await writeBodyFile(repo, "ok\n");
    const fakeGh = await createFakeGh({
      omitCommentUrl: true,
      issueResources: {
        "10": buildIssueResource(10, { pullRequest: true })
      }
    });

    const result = runArticleHubCli(
      [
        "comment",
        "publish",
        "--target",
        "pr",
        "--number",
        "10",
        "--body-file",
        bodyFile
      ],
      { cwd: repo, env: fakeGh.env }
    );

    const output = expectErrorEnvelope<{
      error: {
        details: {
          mutation_state: string;
          retry_safe: boolean;
        };
      };
    }>(result, "COMMENT_RESULT_INVALID", 1);

    expect(output.error.details).toMatchObject({
      mutation_state: "created",
      retry_safe: false
    });
  });

  test("CRLF 与末尾换行按统一规则统计 body.line_count", async () => {
    const repo = await createGitWorktree();
    const body = "line1\r\nline2\r\n";
    const bodyFile = await writeBodyFile(repo, body);
    const fakeGh = await createFakeGh({
      issueResources: {
        "5": buildIssueResource(5, { pullRequest: false })
      }
    });

    const result = runArticleHubCli(
      [
        "comment",
        "publish",
        "--target",
        "issue",
        "--number",
        "5",
        "--body-file",
        bodyFile
      ],
      { cwd: repo, env: fakeGh.env }
    );

    const output = expectSuccessfulEnvelope<CommentPublishOutput>(
      result,
      "article-hub.comment.publish"
    );

    expect(output.delivery?.status).toBe("created");
    expect(output.body.line_count).toBe(2);
  });
});
