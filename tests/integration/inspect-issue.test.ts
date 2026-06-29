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
    actor: {
      login: string;
      authorized: boolean;
      bot: boolean;
    };
    parsed: {
      kind: string;
    } | null;
    actionable: boolean;
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

  test("授权 maintainer 的批准命令可执行", () => {
    const output = inspectFixtureIssue();
    const command = output.commands.find(
      (item) => item.actor.login === "maintainer" && item.parsed !== null
    );

    expect(command).toMatchObject({
      actor: {
        authorized: true,
        bot: false
      },
      actionable: true
    });
    expect(command?.parsed).toEqual({ kind: "approve-writing-plan" });
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
      parsed: {
        kind: "approve-writing-plan"
      },
      actionable: true
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
      parsed: {
        kind: "approve-writing-plan"
      },
      actionable: true
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
      parsed: {
        kind: "approve-writing-plan"
      },
      actionable: false
    });
  });

  test("非固定命令不可执行", () => {
    const output = inspectFixtureIssue();
    const command = output.commands.find((item) => item.comment_id === 1004);

    expect(command).toMatchObject({
      parsed: null,
      actionable: false
    });
  });

  test("授权固定控制命令输出结构化 kind", () => {
    const output = inspectFixtureIssue();
    const command = output.commands.find((item) => item.parsed?.kind === "pause");

    expect(command).toMatchObject({
      actor: {
        authorized: true,
        bot: false
      },
      parsed: {
        kind: "pause"
      },
      actionable: true
    });
  });

  test("actionable 的控制命令不等价于写作计划批准", () => {
    const output = inspectFixtureIssue();
    const command = output.commands.find((item) => item.parsed?.kind === "status");

    expect(command).toMatchObject({
      parsed: {
        kind: "status"
      },
      actionable: true
    });
    expect(command?.parsed).not.toEqual({ kind: "approve-writing-plan" });
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
