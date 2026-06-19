import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { validateArticleFile } from "../../src/domain/article-validation.js";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const validArticlePath = path.join(repositoryRoot, "tests/fixtures/articles/valid-article.md");
const configPath = path.join(repositoryRoot, "tests/fixtures/projects-valid.yml");

function writeVariant(name: string, transform: (content: string) => string): string {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "article validation "));
  const target = path.join(tmp, `${name}.md`);
  writeFileSync(target, transform(readFileSync(validArticlePath, "utf8")), "utf8");
  return target;
}

function issueMessages(result: Awaited<ReturnType<typeof validateArticleFile>>): string[] {
  return result.blocking_issues.map((issue) => issue.message);
}

describe("article validation", () => {
  test("合法文章 fixture 通过基础 Front Matter 和 Markdown 校验", async () => {
    const result = await validateArticleFile({
      articleFile: validArticlePath,
      configPath,
      dryRun: false
    });

    expect(result).toMatchObject({
      ok: true,
      schema_version: "article-hub.validate-article.v1",
      valid: true,
      blocking_issues: [],
      dry_run: false
    });
  });

  test("Front Matter 标题必须等于正文第一个 H1", async () => {
    const articleFile = writeVariant("title-mismatch", (content) =>
      content.replace("# WebMCP SDK 实践指南", "# 不一致标题")
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("Front Matter title 必须等于正文第一个 H1");
  });

  test("缺少必填 Front Matter 字段会阻断", async () => {
    const articleFile = writeVariant("missing-summary", (content) =>
      content.replace("summary: 用一个可复现示例说明 WebMCP SDK 的阶段 A 写作链路。\n", "")
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("Front Matter 缺少必填字段：summary");
  });

  test("缺少 YAML Front Matter 会阻断", async () => {
    const articleFile = writeVariant("missing-frontmatter", () => "# WebMCP SDK 实践指南\n");

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("Markdown 文件必须包含 YAML Front Matter");
  });

  test("approved_plan 必须包含版本和 Hash", async () => {
    const articleFile = writeVariant("invalid-approved-plan", (content) =>
      content.replace("approved_plan:\n  version: 2\n  hash: ab12cd34", "approved_plan: invalid")
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("approved_plan 必须是 object");
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
    expect(issueMessages(result)).toContain("sources[0] 缺少 commit/hash 稳定定位字段");
  });

  test.each([
    ["project", "unknown-project", "Front Matter project 不在阶段 A 项目白名单中：unknown-project"],
    ["article_type", "hot-take", "Front Matter article_type 不受支持：hot-take"],
    ["style_profile", "casual", "Front Matter style_profile 不受支持：casual"]
  ])("%s 未知值会阻断", async (field, value, message) => {
    const articleFile = writeVariant(`unknown-${field}`, (content) =>
      content.replace(new RegExp(`${field}: .+`), `${field}: ${value}`)
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain(message);
  });

  test("fenced code block 必须标注语言", async () => {
    const articleFile = writeVariant("code-without-language", (content) =>
      content.replace("```ts", "```")
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("fenced code block 必须标注语言");
  });

  test("波浪线 fenced code block 也必须标注语言", async () => {
    const articleFile = writeVariant(
      "tilde-code-without-language",
      (content) => `${content}\n\n~~~\nconst missing = true;\n~~~\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("fenced code block 必须标注语言");
  });

  test("正文残留占位符会阻断", async () => {
    const articleFile = writeVariant("placeholder", (content) =>
      `${content}\n\nTODO: 补一段案例。\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("文章包含阻断占位符：TODO");
  });
});
