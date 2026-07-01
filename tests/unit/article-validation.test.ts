import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

import {
  articleValidationIssueMessages,
  validateArticleFile
} from "../../src/domain/article-validation.js";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const validArticlePath = path.join(repositoryRoot, "tests/fixtures/articles/valid-article.md");
const configPath = path.join(repositoryRoot, "tests/fixtures/projects-valid.yml");
const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);
const temporaryDirectories = new Set<string>();
const validApprovalSnapshot = [
  "approval_snapshot:",
  "  url: https://github.com/example/article-workspace/issues/12#issuecomment-1001",
  "  approver: maintainer-a",
  "  plan_comment_id: 1000",
  "  approval_comment_id: 1001"
].join("\n");

afterEach(() => {
  for (const directory of temporaryDirectories) {
    rmSync(directory, { recursive: true, force: true });
  }

  temporaryDirectories.clear();
});

function createTemporaryDirectory(prefix = "article validation "): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryDirectories.add(directory);
  return directory;
}

function readArticleFixture(): string {
  return readFileSync(validArticlePath, "utf8").replace(/\r\n/g, "\n");
}

function writeVariant(name: string, transform: (content: string) => string): string {
  const tmp = createTemporaryDirectory();
  const target = path.join(tmp, `${name}.md`);
  const source = readArticleFixture();
  const transformed = transform(source);

  if (transformed === source) {
    throw new Error(`文章变体 ${name} 未修改 fixture`);
  }

  writeFileSync(target, transformed, "utf8");
  return target;
}

function writeArticleWithAssets(
  name: string,
  transform: (content: string) => string,
  assets: Record<string, string | Buffer>
): string {
  const tmp = createTemporaryDirectory();
  const target = path.join(tmp, "article.md");

  for (const [assetPath, content] of Object.entries(assets)) {
    const targetAsset = path.join(tmp, assetPath);
    mkdirSync(path.dirname(targetAsset), { recursive: true });
    writeFileSync(targetAsset, content);
  }

  writeFileSync(target, transform(readArticleFixture()), "utf8");
  return target;
}

function replaceApprovalSnapshot(content: string, replacement: string): string {
  return content.replace(validApprovalSnapshot, replacement);
}

function issueCodes(result: Awaited<ReturnType<typeof validateArticleFile>>): string[] {
  return result.blocking_issues.map((issue) => issue.code);
}

function expectBlockingIssue(
  result: Awaited<ReturnType<typeof validateArticleFile>>,
  code: string,
  field?: string
): void {
  expect(result.blocking_issues).toContainEqual(
    expect.objectContaining({
      code,
      ...(field ? { field } : {})
    })
  );
}

describe("article validation", () => {
  test("错误码对应 message 在集中定义表中可查看", () => {
    expect(articleValidationIssueMessages["missing-frontmatter"]({})).toBe(
      "Markdown 文件必须包含 YAML Front Matter"
    );
    expect(
      articleValidationIssueMessages["missing-required-frontmatter-field"]({
        field: "summary"
      })
    ).toBe("Front Matter 缺少必填字段：summary");
  });

  test("合法文章 fixture 通过基础 Front Matter 和 Markdown 校验", async () => {
    const result = await validateArticleFile({
      articleFile: validArticlePath,
      configPath,
      dryRun: false
    });

    expect(result).toMatchObject({
      ok: true,
      schema_version: "article-hub.validate-article",
      valid: true,
      blocking_issues: [],
      dry_run: false
    });
  });

  test("缺少必填 Front Matter 字段会阻断", async () => {
    const articleFile = writeVariant("missing-summary", (content) =>
      content.replace("summary: 用一个可复现示例说明 WebMCP SDK 的本地写作链路。\n", "")
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "missing-required-frontmatter-field", "summary");
  });

  test.each([
    [
      "schema_version",
      (content: string) =>
        content.replace(
          "schema_version: article-hub.article.v2",
          "schema_version: article-hub.article.invalid"
        ),
      "invalid-schema-version",
      "schema_version"
    ],
    [
      "summary 类型",
      (content: string) =>
        content.replace("summary: 用一个可复现示例说明 WebMCP SDK 的本地写作链路。", "summary: 12"),
      "invalid-frontmatter-string",
      "summary"
    ],
    [
      "approval_snapshot 缺失",
      (content: string) => content.replace(`${validApprovalSnapshot}\n`, ""),
      "missing-required-frontmatter-field",
      "approval_snapshot"
    ]
  ])("Front Matter schema 约束会阻断 %s 漂移", async (_, transform, code, field) => {
    const articleFile = writeVariant("frontmatter-schema-drift", transform);

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expectBlockingIssue(result, code, field);
  });

  test("缺少 YAML Front Matter 会阻断", async () => {
    const articleFile = writeVariant("missing-frontmatter", () => "# WebMCP SDK 实践指南\n");

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "missing-frontmatter");
  });

  test("approval_snapshot 必须是对象", async () => {
    const articleFile = writeVariant("invalid-approval-snapshot", (content) =>
      replaceApprovalSnapshot(
        content,
        'approval_snapshot: "https://github.com/example/article-workspace/issues/12#issuecomment-1001"'
      )
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "invalid-approval-snapshot", "approval_snapshot");
  });

  test("approval_snapshot 缺少审计字段会阻断", async () => {
    const articleFile = writeVariant("approval-snapshot-without-url", (content) =>
      replaceApprovalSnapshot(
        content,
        [
          "approval_snapshot:",
          "  approver: maintainer-a",
          "  plan_comment_id: 1000",
          "  approval_comment_id: 1001"
        ].join("\n")
      )
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "invalid-approval-snapshot", "approval_snapshot");
  });

  test("approval_snapshot 的 comment id 必须是正整数", async () => {
    const articleFile = writeVariant("approval-snapshot-with-invalid-comment-id", (content) =>
      content.replace("  plan_comment_id: 1000", "  plan_comment_id: 0")
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "invalid-approval-snapshot", "approval_snapshot");
  });

  test("sources 每项必须包含来源标识和稳定定位字段", async () => {
    const articleFile = writeVariant("source-without-commit", (content) =>
      content.replace(
        "commit: 0123456789abcdef0123456789abcdef01234567",
        "note: 缺少稳定定位字段"
      )
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "missing-source-revision", "sources[0]");
  });

  test.each([
    ["project", "unknown-project", "unknown-project"],
    ["article_type", "hot-take", "unsupported-frontmatter-enum"],
    ["style_profile", "casual", "unsupported-frontmatter-enum"]
  ])("%s 未知值会阻断", async (field, value, code) => {
    const articleFile = writeVariant(`unknown-${field}`, (content) =>
      content.replace(new RegExp(`${field}: .+`), `${field}: ${value}`)
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expectBlockingIssue(result, code, field);
  });

  test("fenced code block 中的图片语法不会触发素材校验", async () => {
    const articleFile = writeVariant(
      "image-in-code-fence",
      (content) => `${content}\n\n\`\`\`md\n![Demo screenshot](missing.png)\n\`\`\`\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test.each([
    ["单 backtick", "`![中文图](missing.png)`"],
    ["多 backtick", "``![中文图](missing-2.png)``"]
  ])("%s code span 中的图片示例不会触发素材校验", async (_, markdown) => {
    const articleFile = writeVariant(
      "image-in-code-span",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("未闭合图片 bracket 不会跳过后续真实图片", async () => {
    const articleFile = writeVariant(
      "unclosed-bracket-before-image",
      (content) => `${content}\n\n![未闭合\n![中文图](missing.png)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expectBlockingIssue(result, "missing-local-image");
  });

  test("无 suffix 的普通外层图片 bracket 不会跳过内部图片", async () => {
    const articleFile = writeVariant(
      "plain-outer-bracket-around-image",
      (content) => `${content}\n\n![普通外层 ![中文图](missing.png)]\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueCodes(result)).toEqual(["missing-local-image"]);
  });

  test(
    "大量未闭合 bracket 不会重复扫描",
    async () => {
      const articleFile = writeVariant(
        "many-unclosed-brackets",
        (content) => `${content}\n\n${"[".repeat(30_000)}\n`
      );

      const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

      expect(result.valid).toBe(true);
      expect(result.blocking_issues).toEqual([]);
    },
    10_000
  );

  test(
    "大量 malformed destination 保持有界并校验后续图片",
    async () => {
      const articleFile = writeVariant(
        "many-malformed-destinations",
        (content) =>
          `${content}\n\n${"[x](".repeat(30_000)}![中文图](missing.png)\n`
      );

      const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

      expectBlockingIssue(result, "missing-local-image");
    },
    10_000
  );

  test("合法本地 PNG 图片通过校验", async () => {
    const articleFile = writeArticleWithAssets(
      "valid-local-png",
      (content) => `${content}\n\n![中文截图](assets/images/demo.png)\n`,
      { "assets/images/demo.png": validPng }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("本地图片拒绝指向文章目录外文件的 symlink", async () => {
    const outsideDirectory = createTemporaryDirectory("article validation outside ");
    const outsideFile = path.join(outsideDirectory, "outside.png");
    writeFileSync(outsideFile, validPng);
    const articleFile = writeArticleWithAssets(
      "external-image-symlink",
      (content) => `${content}\n\n![中文截图](assets/images/demo.png)\n`,
      {}
    );
    const symlinkPath = path.join(path.dirname(articleFile), "assets/images/demo.png");
    mkdirSync(path.dirname(symlinkPath), { recursive: true });
    symlinkSync(outsideFile, symlinkPath, "file");

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expectBlockingIssue(result, "missing-local-image");
  });

  test("图片 alt 不能为空", async () => {
    const articleFile = writeVariant(
      "empty-image-alt",
      (content) => `${content}\n\n![](https://example.com/demo.png)\n`
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "empty-image-alt");
  });

  test("非空图片 alt 通过校验", async () => {
    const articleFile = writeVariant(
      "non-chinese-image-alt",
      (content) => `${content}\n\n![Demo screenshot](https://example.com/demo.png)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("缺失本地图片文件会阻断", async () => {
    const articleFile = writeVariant(
      "missing-local-image",
      (content) => `${content}\n\n![中文截图](assets/images/missing.png)\n`
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "missing-local-image");
  });

  test.each([
    ["绝对路径", "/tmp/demo.png"],
    ["路径穿越", "../demo.png"]
  ])("本地图片禁止%s", async (_, imagePath) => {
    const articleFile = writeVariant(
      "unsafe-local-image-path",
      (content) => `${content}\n\n![中文截图](${imagePath})\n`
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

  expect(result.valid).toBe(false);
    expectBlockingIssue(result, "invalid-local-image");
  });

  test("本地 SVG 图片存在时通过图片引用校验", async () => {
    const articleFile = writeArticleWithAssets(
      "markdown-references-svg",
      (content) => `${content}\n\n![中文流程图](assets/diagrams/flow.svg)\n`,
      {
        "assets/diagrams/flow.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"
      }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("PNG 路径指向目录时以阻断问题返回", async () => {
    const articleFile = writeArticleWithAssets(
      "png-directory",
      (content) => `${content}\n\n![中文截图](assets/images/demo.png)\n`,
      {}
    );
    mkdirSync(path.join(path.dirname(articleFile), "assets/images/demo.png"), { recursive: true });

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expectBlockingIssue(result, "missing-local-image");
  });

  test("带尾随文本的 fence 行不会关闭代码块", async () => {
    const articleFile = writeVariant(
      "non-closing-fence",
      (content) =>
        `${content}\n\n\`\`\`md\n\`\`\`not-close\n![中文示例](ignored.png)\n\`\`\`\n![中文正文图](assets/images/real.png)\n`
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueCodes(result)).toEqual(["missing-local-image"]);
  });

  test("angle-bracket destination 支持包含空格的本地路径", async () => {
    const articleFile = writeVariant(
      "angle-image-destination",
      (content) => `${content}\n\n![中文截图](<assets/images/my image.png>)\n`
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expectBlockingIssue(result, "missing-local-image");
  });

  test.each([
    ["平衡括号", "assets/images/demo(1).png", "assets/images/demo(1).png"],
    ["反斜杠转义", "assets/images/demo\\(2\\).png", "assets/images/demo(2).png"]
  ])("图片 destination 支持%s", async (_, markdownPath, expectedPath) => {
    const articleFile = writeVariant(
      "structured-image-destination",
      (content) => `${content}\n\n![中文截图](${markdownPath})\n`
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expectBlockingIssue(result, "missing-local-image");
  });

  test("file URL 不能绕过本地图片路径限制", async () => {
    const imagePath = "file:///tmp/demo.png";
    const articleFile = writeVariant(
      "file-url-image",
      (content) => `${content}\n\n![中文截图](${imagePath})\n`
    );

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expectBlockingIssue(result, "invalid-local-image");
  });

  test("普通图片路径指向目录时按文件不存在阻断", async () => {
    const articleFile = writeArticleWithAssets(
      "image-directory",
      (content) => `${content}\n\n![中文截图](assets/images/demo.jpg)\n`,
      {}
    );
    mkdirSync(path.join(path.dirname(articleFile), "assets/images/demo.jpg"), { recursive: true });

  const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expectBlockingIssue(result, "missing-local-image");
  });

});
