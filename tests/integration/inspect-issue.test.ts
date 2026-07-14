import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  expectErrorEnvelope,
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";

const fixturePath = path.join(repositoryRoot, "tests/fixtures/issue-minimal.json");
const ghIssueViewFixturePath = path.join(
  repositoryRoot,
  "tests/fixtures/issue-gh-view.json"
);
const restIssueFixturePath = path.join(repositoryRoot, "tests/fixtures/issue-rest.json");

interface InspectIssueOutput {
  issue: {
    number: number;
    labels: string[];
  };
  commands: Array<{
    comment_id: number | string | null;
    body: string;
    explicit_ai_request: boolean;
    actor: {
      login: string;
      authorized: boolean;
      bot: boolean;
    };
    fixed_approval: "approve-writing-plan" | null;
    approval_authorized: boolean;
  }>;
}

function inspectFixtureIssue(): InspectIssueOutput {
  const result = runArticleHubCli([
    "--dry-run",
    "inspect-issue",
    "--issue-file",
    fixturePath
  ]);

  return expectSuccessfulEnvelope<InspectIssueOutput>(
    result,
    "article-hub.inspect-issue",
    {
      dry_run: true,
      issue: {
        number: 42,
        labels: expect.arrayContaining(["阶段：策划", "AI：等待人工"])
      }
    }
  );
}

describe("article-hub inspect-issue", () => {
  test("读取本地 Issue fixture 并输出稳定 JSON envelope", () => {
    inspectFixtureIssue();
  });

  test("授权 maintainer 的固定写作计划批准通过权限检查", () => {
    const output = inspectFixtureIssue();
    const command = output.commands.find(
      (item) => item.actor.login === "maintainer" && item.fixed_approval !== null
    );

    expect(command).toMatchObject({
      actor: {
        authorized: true,
        bot: false
      },
      fixed_approval: "approve-writing-plan",
      approval_authorized: true
    });
  });

  test("gh issue view 原始评论字段中的协作者批准命令可执行", () => {
    const result = runArticleHubCli([
      "--dry-run",
      "inspect-issue",
      "--issue-file",
      ghIssueViewFixturePath
    ]);
    const output = expectSuccessfulEnvelope<InspectIssueOutput>(
      result,
      "article-hub.inspect-issue",
      {
        dry_run: true,
        issue: {
          number: 31,
          labels: expect.arrayContaining(["阶段：策划", "AI：等待人工"])
        }
      }
    );
    const command = output.commands.find(
      (item) => item.actor.login === "collaborator-approver"
    );

    expect(command).toMatchObject({
      comment_id: "IC_kwDOS5dhx88AAAABHo5Ggw",
      actor: {
        authorized: true,
        bot: false
      },
      fixed_approval: "approve-writing-plan",
      approval_authorized: true
    });
  });

  test("REST 评论字段中的协作者批准命令可执行", () => {
    const result = runArticleHubCli([
      "--dry-run",
      "inspect-issue",
      "--issue-file",
      restIssueFixturePath
    ]);
    const output = expectSuccessfulEnvelope<InspectIssueOutput>(
      result,
      "article-hub.inspect-issue",
      {
        dry_run: true,
        issue: {
          number: 34,
          labels: expect.arrayContaining(["阶段：策划"])
        }
      }
    );
    const command = output.commands.find(
      (item) => item.actor.login === "collaborator-approver"
    );

    expect(command).toMatchObject({
      comment_id: 4807607939,
      actor: {
        authorized: true,
        bot: false
      },
      fixed_approval: "approve-writing-plan",
      approval_authorized: true
    });
  });

  test.each([
    { login: "external-user", bot: false },
    { login: "automation[bot]", bot: true }
  ])("未授权或 bot 评论不可执行：$login", ({ login, bot }) => {
    const output = inspectFixtureIssue();
    const command = output.commands.find((item) => item.actor.login === login);

    expect(command).toMatchObject({
      actor: {
        authorized: false,
        bot
      },
      fixed_approval: "approve-writing-plan",
      approval_authorized: false
    });
  });

  test("非固定命令不可执行", () => {
    const output = inspectFixtureIssue();
    const command = output.commands.find((item) => item.comment_id === 1004);

    expect(command).toMatchObject({
      fixed_approval: null,
      approval_authorized: false
    });
  });

  test("自然语言评论保留原文但不由 CLI 解释意图", () => {
    const output = inspectFixtureIssue();
    const request = output.commands.find((item) => item.comment_id === 1007);

    expect(request).toMatchObject({
      body: "/ai 请重试\n\n写作计划内容丢失了，请重新上传。",
      explicit_ai_request: true,
      fixed_approval: null,
      approval_authorized: false
    });
  });

  test("非 /ai 的授权 Review 评论保留原文并交给 Agent 判断", () => {
    const output = inspectFixtureIssue();
    const review = output.commands.find((item) => item.comment_id === 1010);

    expect(review).toMatchObject({
      body: "建议把第二节改成先讲使用场景，再介绍 API。",
      explicit_ai_request: false,
      actor: {
        authorized: true,
        bot: false
      },
      fixed_approval: null,
      approval_authorized: false
    });
  });

  test("只有独立的 /ai 前缀才标记为显式请求", () => {
    const output = inspectFixtureIssue();
    const request = output.commands.find((item) => item.comment_id === 1008);

    expect(request).toMatchObject({
      body: "/ai请重试",
      explicit_ai_request: false,
      fixed_approval: null,
      approval_authorized: false
    });
  });

  test.each([
    { commentId: 1005, body: "/ai 状态" },
    { commentId: 1006, body: "/ai 暂停" }
  ])("控制请求保留原文但不由 CLI 解释：$body", ({ commentId, body }) => {
    const output = inspectFixtureIssue();
    const command = output.commands.find((item) => item.comment_id === commentId);

    expect(command).toMatchObject({
      body,
      actor: {
        authorized: true,
        bot: false
      },
      fixed_approval: null,
      approval_authorized: false
    });
  });

  test("批准选题作为普通显式请求交给 Agent 判断", () => {
    const output = inspectFixtureIssue();
    const request = output.commands.find((item) => item.comment_id === 1009);

    expect(request).toMatchObject({
      body: "/ai 批准选题",
      explicit_ai_request: true,
      fixed_approval: null,
      approval_authorized: false
    });
  });

  test("无效 JSON 产生稳定错误 envelope 且 stdout 不混入日志", () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), "article-hub-test-"));
    const invalidJsonPath = path.join(tempDir, "invalid.json");
    writeFileSync(invalidJsonPath, "{ invalid json", "utf8");

    try {
      const result = runArticleHubCli([
        "inspect-issue",
        "--issue-file",
        invalidJsonPath
      ]);

      expectErrorEnvelope(result, "INVALID_JSON", 1);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("缺失 Issue 文件产生稳定错误 envelope", () => {
    const result = runArticleHubCli([
      "inspect-issue",
      "--issue-file",
      path.join(repositoryRoot, "tests/fixtures/missing.json")
    ]);

    expectErrorEnvelope(result, "ISSUE_FILE_NOT_FOUND", 1);
  });

  test("未知 option 必须 fail closed", () => {
    const result = runArticleHubCli([
      "inspect-issue",
      "--issue-file",
      fixturePath,
      "--unexpected-option"
    ]);

    expectErrorEnvelope(result, "UNKNOWN_OPTION", 2);
  });

  test("多余 positional 参数必须 fail closed", () => {
    const result = runArticleHubCli(["inspect-issue", "--issue-file", fixturePath, "extra"]);

    expectErrorEnvelope(result, "UNEXPECTED_ARGUMENT", 2);
  });
});
