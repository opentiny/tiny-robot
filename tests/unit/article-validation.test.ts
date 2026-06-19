import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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
const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

function writeVariant(name: string, transform: (content: string) => string): string {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "article validation "));
  const target = path.join(tmp, `${name}.md`);
  writeFileSync(target, transform(readFileSync(validArticlePath, "utf8")), "utf8");
  return target;
}

function writeArticleWithAssets(
  name: string,
  transform: (content: string) => string,
  assets: Record<string, string | Buffer>
): string {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "article validation "));
  const target = path.join(tmp, "article.md");

  for (const [assetPath, content] of Object.entries(assets)) {
    const targetAsset = path.join(tmp, assetPath);
    mkdirSync(path.dirname(targetAsset), { recursive: true });
    writeFileSync(targetAsset, content);
  }

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

  test("Front Matter 残留占位符会阻断", async () => {
    const articleFile = writeVariant("frontmatter-placeholder", (content) =>
      content.replace("summary: 用一个可复现示例说明 WebMCP SDK 的阶段 A 写作链路。", "summary: TODO")
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("文章包含阻断占位符：TODO");
  });

  test.each([
    [
      "schema_version",
      (content: string) =>
        content.replace("schema_version: article-hub.article.v1", "schema_version: article-hub.article.v0"),
      "Front Matter schema_version 必须是 article-hub.article.v1"
    ],
    [
      "summary 类型",
      (content: string) =>
        content.replace("summary: 用一个可复现示例说明 WebMCP SDK 的阶段 A 写作链路。", "summary: 12"),
      "Front Matter summary 必须是非空字符串"
    ],
    [
      "approved_plan.hash 长度",
      (content: string) => content.replace("hash: ab12cd34", "hash: ab12"),
      "approved_plan.hash 长度不能小于 8"
    ]
  ])("Front Matter schema 约束会阻断 %s 漂移", async (_, transform, message) => {
    const articleFile = writeVariant("frontmatter-schema-drift", transform);

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain(message);
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

  test("带 1-3 个前导空格的 fenced code block 也必须标注语言", async () => {
    const articleFile = writeVariant("indented-code-without-language", (content) =>
      content.replace("```ts", "  ```").replace("\n```\n", "\n  ```\n")
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

  test("图片 alt 不能为空", async () => {
    const articleFile = writeVariant(
      "empty-image-alt",
      (content) => `${content}\n\n![](https://example.com/demo.png)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("图片 alt 必须是非空且包含中文");
  });

  test("图片 alt 必须包含中文", async () => {
    const articleFile = writeVariant(
      "non-chinese-image-alt",
      (content) => `${content}\n\n![Demo screenshot](https://example.com/demo.png)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("图片 alt 必须是非空且包含中文");
  });

  test("缺失本地图片文件会阻断", async () => {
    const articleFile = writeVariant(
      "missing-local-image",
      (content) => `${content}\n\n![中文截图](assets/images/missing.png)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("本地图片文件不存在：assets/images/missing.png");
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
    expect(issueMessages(result)).toContain(`本地图片路径必须相对文章目录且不能穿越：${imagePath}`);
  });

  test("正文不得直接引用 Mermaid 源文件", async () => {
    const articleFile = writeArticleWithAssets(
      "markdown-references-mmd",
      (content) => `${content}\n\n![中文流程图](assets/diagrams/flow.mmd)\n`,
      {
        "assets/diagrams/flow.mmd": "graph TD\nA-->B\n",
        "assets/diagrams/flow.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>",
        "assets/diagrams/flow.png": validPng
      }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("正文图片必须引用 PNG，不能直接引用 .mmd：assets/diagrams/flow.mmd");
  });

  test("正文不得直接引用 SVG 图片", async () => {
    const articleFile = writeArticleWithAssets(
      "markdown-references-svg",
      (content) => `${content}\n\n![中文流程图](assets/diagrams/flow.svg)\n`,
      {
        "assets/diagrams/flow.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"
      }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("正文图片必须引用 PNG，不能直接引用 .svg：assets/diagrams/flow.svg");
  });

  test("Mermaid 源文件缺少同名 SVG 会阻断", async () => {
    const articleFile = writeArticleWithAssets(
      "mmd-without-svg",
      (content) => content,
      {
        "assets/diagrams/flow.mmd": "graph TD\nA-->B\n",
        "assets/diagrams/flow.png": validPng
      }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("Mermaid 源文件缺少同名 SVG：assets/diagrams/flow.svg");
  });

  test("Mermaid 源文件缺少同名 PNG 会阻断", async () => {
    const articleFile = writeArticleWithAssets(
      "mmd-without-png",
      (content) => content,
      {
        "assets/diagrams/flow.mmd": "graph TD\nA-->B\n",
        "assets/diagrams/flow.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"
      }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("Mermaid 源文件缺少同名 PNG：assets/diagrams/flow.png");
  });

  test("坏 PNG 会阻断", async () => {
    const articleFile = writeArticleWithAssets(
      "bad-png",
      (content) => `${content}\n\n![中文截图](assets/images/bad.png)\n`,
      { "assets/images/bad.png": Buffer.from("not a png") }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("PNG 图片无法解码或尺寸无效：assets/images/bad.png");
  });

  test("PNG 路径指向目录时以阻断问题返回", async () => {
    const articleFile = writeArticleWithAssets(
      "png-directory",
      (content) => `${content}\n\n![中文截图](assets/images/demo.png)\n`,
      {}
    );
    mkdirSync(path.join(path.dirname(articleFile), "assets/images/demo.png"), { recursive: true });

    await expect(validateArticleFile({ articleFile, configPath, dryRun: false })).resolves.toMatchObject({
      valid: false,
      blocking_issues: [{ message: "PNG 图片无法解码或尺寸无效：assets/images/demo.png" }]
    });
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
});
