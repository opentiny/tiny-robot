import { copyFile, mkdir, mkdtemp } from "node:fs/promises";
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
const configPath = path.join(repositoryRoot, "config/projects.yml");
const validArticleFixture = path.join(
  repositoryRoot,
  "tests/fixtures/articles/valid-article.md"
);

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
}

async function createArticleFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-create-pr-"));
  const articleDir = path.join(
    root,
    "articles/webmcp-sdk/2026-06-19-webmcp-sdk-practice"
  );
  const articleFile = path.join(articleDir, "article.md");

  await mkdir(articleDir, { recursive: true });
  await copyFile(validArticleFixture, articleFile);

  return { articleDir, articleFile };
}

describe("article-hub create-pr CLI", () => {
  test("dry-run validates article and prints the branch/PR mutation plan", async () => {
    const { articleDir, articleFile } = await createArticleFixture();
    const result = runCli([
      "--dry-run",
      "create-pr",
      "--article-file",
      articleFile,
      "--config",
      configPath,
      "--issue-number",
      "12",
      "--repository",
      "hexqi/ai-article-hub",
      "--base",
      "main",
      "--slug",
      "webmcp-sdk-practice",
      "--title",
      "WebMCP SDK 实践指南"
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");

    const output = JSON.parse(result.stdout);

    expect(output).toMatchObject({
      ok: true,
      schema_version: "article-hub.create-pr.v1",
      dry_run: true,
      valid: true,
      branch: "article/12-webmcp-sdk-webmcp-sdk-practice",
      draft: true,
      article: {
        file: articleFile,
        directory: articleDir,
        project: "webmcp-sdk",
        title: "WebMCP SDK 实践指南"
      },
      pull_request: {
        repository: "hexqi/ai-article-hub",
        base: "main",
        title: "WebMCP SDK 实践指南"
      }
    });
    expect(output.mutation_plan.operations.map((operation: { kind: string }) => operation.kind)).toEqual([
      "validate-article",
      "git-add",
      "git-commit",
      "git-push",
      "gh-pr-create-or-update"
    ]);
  });

  test("dry-run rejects unsafe slug before planning a GitHub mutation", async () => {
    const { articleFile } = await createArticleFixture();
    const result = runCli([
      "--dry-run",
      "create-pr",
      "--article-file",
      articleFile,
      "--config",
      configPath,
      "--issue-number",
      "12",
      "--repository",
      "hexqi/ai-article-hub",
      "--base",
      "main",
      "--slug",
      "../escape",
      "--title",
      "WebMCP SDK 实践指南"
    ]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("article-hub UNSAFE_PATH");
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: false,
      error: {
        code: "UNSAFE_PATH"
      }
    });
  });
});
