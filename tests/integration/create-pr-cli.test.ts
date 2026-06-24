import { copyFile, mkdir, mkdtemp, writeFile } from "node:fs/promises";
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
  article: {
    file: string;
  };
  pull_request: {
    body_file: string;
  };
  mutation_plan: {
    operations: Array<{ kind: string; path?: string }>;
  };
}

async function createArticleFixture(articleFileName = "article.md") {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-create-pr-"));
  const articleDir = path.join(
    root,
    "articles/webmcp-sdk/2026-06-19-webmcp-sdk-practice"
  );
  const articleFile = path.join(articleDir, articleFileName);
  const bodyFile = path.join(root, "pr-body.md");

  await mkdir(articleDir, { recursive: true });
  await copyFile(validArticleFixture, articleFile);
  await writeFile(bodyFile, "# WebMCP SDK 实践指南\n");

  return { articleDir, articleFile, bodyFile };
}

describe("article-hub create-pr CLI", () => {
  test("dry-run validates article and prints the branch/PR mutation plan", async () => {
    const { articleDir, articleFile, bodyFile } = await createArticleFixture();
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
      "WebMCP SDK 实践指南",
      "--body-file",
      bodyFile
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
          title: "WebMCP SDK 实践指南",
          body_file: bodyFile
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

  test("dry-run reports the validated article file in the mutation plan", async () => {
    const { articleFile, bodyFile } = await createArticleFixture("not-article.md");
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
      "WebMCP SDK 实践指南",
      "--body-file",
      bodyFile
    ]);

    const output = expectSuccessfulEnvelope<CreatePrOutput>(
      result,
      "article-hub.create-pr"
    );
    const validateArticleOperation = output.mutation_plan.operations.find(
      (operation) => operation.kind === "validate-article"
    );

    expect(output.article.file).toBe(articleFile);
    expect(validateArticleOperation).toMatchObject({
      kind: "validate-article",
      path: articleFile
    });
  });

  test("dry-run rejects unsafe slug before planning a GitHub mutation", async () => {
    const { articleFile, bodyFile } = await createArticleFixture();
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
      "WebMCP SDK 实践指南",
      "--body-file",
      bodyFile
    ]);

    expectErrorEnvelope(result, "UNSAFE_PATH", 2);
  });
});
