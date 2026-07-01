import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  writeFile
} from "node:fs/promises";
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
  publications_record: {
    file: string;
    article_id: string;
    written: boolean;
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

  return { root, articleDir, articleFile, bodyFile };
}

async function createFakeCommand(kind: "git" | "gh") {
  const root = await mkdtemp(path.join(tmpdir(), `article-hub-fake-${kind}-`));
  const scriptPath = path.join(root, `fake-${kind}.mjs`);
  const logPath = path.join(root, "calls.jsonl");

  await writeFile(
    scriptPath,
    [
      'import { appendFileSync } from "node:fs";',
      `const kind = ${JSON.stringify(kind)};`,
      "const args = process.argv.slice(2);",
      'appendFileSync(process.env.FAKE_COMMAND_LOG, `${JSON.stringify({ kind, args })}\\n`);',
      'if (kind === "git" && args[0] === "diff") {',
      '  process.stdout.write("articles/webmcp-sdk/2026-06-19-webmcp-sdk-practice/article.md\\narticles/publications.json\\n");',
      "  process.exit(0);",
      "}",
      'if (kind === "gh" && args[0] === "pr" && args[1] === "list") {',
      '  process.stdout.write(process.env.FAKE_GH_PR_LIST_JSON ?? "[]");',
      "  process.exit(0);",
      "}",
      "process.exit(0);"
    ].join("\n"),
    "utf8"
  );

  return {
    command: JSON.stringify([process.execPath, scriptPath]),
    logPath
  };
}

async function readCommandCalls(logPath: string) {
  const raw = await readFile(logPath, "utf8");

  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { kind: "git" | "gh"; args: string[] });
}

describe("article-hub create-pr CLI", () => {
  test("dry-run validates article and prints the branch/PR mutation plan", async () => {
    const { root, articleDir, articleFile, bodyFile } = await createArticleFixture();
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
    ], { cwd: root });

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
        publications_record: {
          article_id: "webmcp-sdk/2026-06-19-webmcp-sdk-practice",
          written: false
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
        expect.objectContaining({
          kind: "update-publications-record",
          path: output.publications_record.file,
          article_id: "webmcp-sdk/2026-06-19-webmcp-sdk-practice"
        }),
        expect.objectContaining({ kind: "git-add" }),
        expect.objectContaining({ kind: "gh-pr-create-or-update" })
      ])
    );
    expect(output.publications_record.file.endsWith(path.join("articles", "publications.json")))
      .toBe(true);
    await expect(readFile(output.publications_record.file, "utf8")).rejects.toMatchObject({
      code: "ENOENT"
    });
  });

  test("dry-run reports the validated article file in the mutation plan", async () => {
    const { root, articleFile, bodyFile } = await createArticleFixture();
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
    ], { cwd: root });

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

  test("writes publications record and stages it when creating the Draft PR", async () => {
    const { root, articleDir, articleFile, bodyFile } = await createArticleFixture();
    const fakeGit = await createFakeCommand("git");
    const fakeGh = await createFakeCommand("gh");
    const result = runArticleHubCli(
      [
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
      ],
      {
        cwd: root,
        env: {
          ARTICLE_HUB_GIT_COMMAND: fakeGit.command,
          ARTICLE_HUB_GH_COMMAND: fakeGh.command,
          FAKE_COMMAND_LOG: fakeGit.logPath
        }
      }
    );

    const output = expectSuccessfulEnvelope<CreatePrOutput>(
      result,
      "article-hub.create-pr",
      {
        dry_run: false,
        publications_record: {
          article_id: "webmcp-sdk/2026-06-19-webmcp-sdk-practice",
          written: true
        }
      }
    );
    const publicationDocument = JSON.parse(
      await readFile(output.publications_record.file, "utf8")
    ) as {
      articles: Record<string, unknown>;
    };
    const gitCalls = await readCommandCalls(fakeGit.logPath);
    const gitAddCall = gitCalls.find(
      (call) => call.kind === "git" && call.args[0] === "add"
    );

    expect(output.publications_record.written).toBe(true);
    expect(publicationDocument.articles).toMatchObject({
      "webmcp-sdk/2026-06-19-webmcp-sdk-practice": {
        article_file: "articles/webmcp-sdk/2026-06-19-webmcp-sdk-practice/article.md",
        title: "WebMCP SDK 实践指南",
        topic_issue: 12,
        publications: {}
      }
    });
    expect(gitAddCall?.args).toEqual(["add", articleDir, output.publications_record.file]);
  });

  test("updates source_pr when the Draft PR already exists", async () => {
    const { root, articleFile, bodyFile } = await createArticleFixture();
    const fakeGit = await createFakeCommand("git");
    const fakeGh = await createFakeCommand("gh");
    const result = runArticleHubCli(
      [
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
      ],
      {
        cwd: root,
        env: {
          ARTICLE_HUB_GIT_COMMAND: fakeGit.command,
          ARTICLE_HUB_GH_COMMAND: fakeGh.command,
          FAKE_COMMAND_LOG: fakeGit.logPath,
          FAKE_GH_PR_LIST_JSON: JSON.stringify([{ number: 34 }])
        }
      }
    );

    const output = expectSuccessfulEnvelope<CreatePrOutput>(result, "article-hub.create-pr", {
      dry_run: false
    });
    const publicationDocument = JSON.parse(
      await readFile(output.publications_record.file, "utf8")
    ) as {
      articles: Record<string, unknown>;
    };

    expect(publicationDocument.articles).toMatchObject({
      "webmcp-sdk/2026-06-19-webmcp-sdk-practice": {
        article_file: "articles/webmcp-sdk/2026-06-19-webmcp-sdk-practice/article.md",
        title: "WebMCP SDK 实践指南",
        topic_issue: 12,
        source_pr: 34,
        publications: {}
      }
    });
  });

  test("dry-run rejects unsafe slug before planning a GitHub mutation", async () => {
    const { root, articleFile, bodyFile } = await createArticleFixture();
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
    ], { cwd: root });

    expectErrorEnvelope(result, "UNSAFE_PATH", 2);
  });
});
