import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const cliPath = path.join(repositoryRoot, "src/cli.ts");
const fixturePath = path.join(repositoryRoot, "tests/fixtures/issue-minimal.json");

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
}

describe("article-hub inspect-issue", () => {
  test("读取本地 Issue fixture 并输出稳定 JSON envelope", () => {
    const result = runCli(["--dry-run", "inspect-issue", "--issue-file", fixturePath]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    const output = JSON.parse(result.stdout);
    expect(output).toMatchObject({
      ok: true,
      schema_version: "article-hub.inspect-issue",
      dry_run: true,
      issue: {
        number: 42,
        title: "生成 webmcp-sdk 入门文章",
        author: {
          login: "topic-owner",
          type: "User",
          association: "OWNER"
        },
        labels: ["阶段：策划", "AI：等待人工"],
        comment_count: 5
      }
    });
    expect(output.commands).toEqual([
      {
        source: "comment",
        comment_id: 1001,
        actor: {
          login: "maintainer",
          type: "User",
          association: "MEMBER",
          authorized: true,
          bot: false
        },
        body: "/ai 批准写作计划 2 a1b2c3d4",
        parsed: {
          kind: "approve-writing-plan",
          plan_version: 2,
          hash_prefix: "a1b2c3d4"
        },
        actionable: true
      },
      {
        source: "comment",
        comment_id: 1002,
        actor: {
          login: "external-user",
          type: "User",
          association: "NONE",
          authorized: false,
          bot: false
        },
        body: "/ai 批准写作计划 2 a1b2c3d4",
        parsed: {
          kind: "approve-writing-plan",
          plan_version: 2,
          hash_prefix: "a1b2c3d4"
        },
        actionable: false
      },
      {
        source: "comment",
        comment_id: 1003,
        actor: {
          login: "automation[bot]",
          type: "Bot",
          association: "MEMBER",
          authorized: false,
          bot: true
        },
        body: "/ai 批准写作计划 2 a1b2c3d4",
        parsed: {
          kind: "approve-writing-plan",
          plan_version: 2,
          hash_prefix: "a1b2c3d4"
        },
        actionable: false
      },
      {
        source: "comment",
        comment_id: 1004,
        actor: {
          login: "maintainer",
          type: "User",
          association: "MEMBER",
          authorized: true,
          bot: false
        },
        body: "我觉得可以批准写作计划 2 a1b2c3d4",
        parsed: null,
        actionable: false
      },
      {
        source: "comment",
        comment_id: 1005,
        actor: {
          login: "maintainer",
          type: "User",
          association: "MEMBER",
          authorized: true,
          bot: false
        },
        body: "/ai 状态",
        parsed: null,
        actionable: false
      }
    ]);
  });

  test("无效 JSON 产生稳定错误 envelope 且 stdout 不混入日志", () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), "article-hub-test-"));
    const invalidJsonPath = path.join(tempDir, "invalid.json");
    writeFileSync(invalidJsonPath, "{ invalid json", "utf8");

    try {
      const result = runCli(["inspect-issue", "--issue-file", invalidJsonPath]);

      expect(result.status).toBe(1);
      const output = JSON.parse(result.stdout);
      expect(output).toMatchObject({
        ok: false,
        schema_version: "article-hub.error",
        error: {
          code: "INVALID_JSON"
        }
      });
      expect(result.stderr).toContain("INVALID_JSON");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("缺失 Issue 文件产生稳定错误 envelope", () => {
    const result = runCli([
      "inspect-issue",
      "--issue-file",
      path.join(repositoryRoot, "tests/fixtures/missing.json")
    ]);

    expect(result.status).toBe(1);
    const output = JSON.parse(result.stdout);
    expect(output).toMatchObject({
      ok: false,
      schema_version: "article-hub.error",
      error: {
        code: "ISSUE_FILE_NOT_FOUND"
      }
    });
    expect(result.stderr).toContain("ISSUE_FILE_NOT_FOUND");
  });

  test("未知 option 必须 fail closed", () => {
    const result = runCli([
      "inspect-issue",
      "--issue-file",
      fixturePath,
      "--unexpected-option"
    ]);

    expect(result.status).toBe(2);
    const output = JSON.parse(result.stdout);
    expect(output).toMatchObject({
      ok: false,
      schema_version: "article-hub.error",
      error: {
        code: "UNKNOWN_OPTION"
      }
    });
    expect(result.stderr).toContain("UNKNOWN_OPTION");
  });

  test("多余 positional 参数必须 fail closed", () => {
    const result = runCli(["inspect-issue", "--issue-file", fixturePath, "extra"]);

    expect(result.status).toBe(2);
    const output = JSON.parse(result.stdout);
    expect(output).toMatchObject({
      ok: false,
      schema_version: "article-hub.error",
      error: {
        code: "UNEXPECTED_ARGUMENT"
      }
    });
    expect(result.stderr).toContain("UNEXPECTED_ARGUMENT");
  });
});
