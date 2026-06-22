import { copyFile, mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  expectErrorEnvelope,
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";

const configPath = path.join(repositoryRoot, "config/projects.yml");
const validArticleFixture = path.join(
  repositoryRoot,
  "tests/fixtures/articles/valid-article.md"
);

interface CreatePrOutput {
  mutation_plan: {
    operations: Array<{ kind: string }>;
  };
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
    const result = runArticleHubCli([
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

    const output = expectSuccessfulEnvelope<CreatePrOutput>(
      result,
      "article-hub.create-pr",
      {
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
      }
    );
    expect(output.mutation_plan.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "validate-article" }),
        expect.objectContaining({ kind: "git-add" }),
        expect.objectContaining({ kind: "gh-pr-create-or-update" })
      ])
    );
  });

  test("dry-run rejects unsafe slug before planning a GitHub mutation", async () => {
    const { articleFile } = await createArticleFixture();
    const result = runArticleHubCli([
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

    expectErrorEnvelope(result, "UNSAFE_PATH", 2);
  });
});
