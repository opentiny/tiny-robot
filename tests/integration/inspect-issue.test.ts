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

interface InspectIssueOutput {
  issue: {
    number: number;
    labels: string[];
  };
  commands: Array<{
    comment_id: number | null;
    actor: {
      login: string;
      authorized: boolean;
      bot: boolean;
    };
    parsed: {
      kind: string;
      plan_version: number;
      hash_prefix: string;
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
      parsed: {
        kind: "approve-writing-plan",
        plan_version: 2,
        hash_prefix: "a1b2c3d4"
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

  test("非批准命令不可执行", () => {
    const output = inspectFixtureIssue();
    const command = output.commands.find((item) => item.comment_id === 1005);

    expect(command).toMatchObject({
      parsed: null,
      actionable: false
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
