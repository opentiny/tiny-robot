import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, test, vi } from "vitest";

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
const temporaryDirectories = new Set<string>();

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

function writeVariant(name: string, transform: (content: string) => string): string {
  const tmp = createTemporaryDirectory();
  const target = path.join(tmp, `${name}.md`);
  writeFileSync(target, transform(readFileSync(validArticlePath, "utf8")), "utf8");
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
      schema_version: "article-hub.validate-article",
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
      content.replace("summary: 用一个可复现示例说明 WebMCP SDK 的本地写作链路。\n", "")
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("Front Matter 缺少必填字段：summary");
  });

  test("Front Matter 残留占位符会阻断", async () => {
    const articleFile = writeVariant("frontmatter-placeholder", (content) =>
      content.replace("summary: 用一个可复现示例说明 WebMCP SDK 的本地写作链路。", "summary: TODO")
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("文章包含阻断占位符：TODO");
  });

  test.each([
    [
      "schema_version",
      (content: string) =>
        content.replace("schema_version: article-hub.article", "schema_version: article-hub.article.v0"),
      "Front Matter schema_version 必须是 article-hub.article"
    ],
    [
      "summary 类型",
      (content: string) =>
        content.replace("summary: 用一个可复现示例说明 WebMCP SDK 的本地写作链路。", "summary: 12"),
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
    ["project", "unknown-project", "Front Matter project 不在项目 allowlist 中：unknown-project"],
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

  test("标准 HTML 展示标签在Markdown 边界内通过", async () => {
    const articleFile = writeVariant(
      "standard-html",
      (content) =>
        `${content}\n\n<details><summary>适用场景</summary><p>用于说明本地流程的人工验收边界。</p></details>\n\n<kbd>Ctrl</kbd> + <kbd>K</kbd>\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("script HTML 标签会被Markdown 边界阻断", async () => {
    const articleFile = writeVariant(
      "script-html",
      (content) => `${content}\n\n<script>alert("xss")</script>\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("HTML 标签不允许使用：script");
  });

  test.each([
    [
      "事件属性",
      '<span onclick="alert(1)">官方链接</span>',
      "HTML 属性不允许使用事件 handler：span.onclick"
    ],
    [
      "可执行 URL",
      '<q cite="javascript:alert(1)">官方链接</q>',
      "HTML 属性不允许使用可执行 URL：q.cite"
    ]
  ])("不安全 HTML %s 会被Markdown 边界阻断", async (_, markdown, message) => {
    const articleFile = writeVariant(
      "unsafe-html-attribute",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain(message);
  });

  test.each([
    [
      "事件属性",
      '<span title="1 > 0" onclick="alert(1)">正文</span>',
      "HTML 属性不允许使用事件 handler：span.onclick"
    ],
    [
      "可执行 URL",
      '<q title="1 > 0" cite="javascript:alert(1)">正文</q>',
      "HTML 属性不允许使用可执行 URL：q.cite"
    ]
  ])("quoted attribute 中的 > 不会跳过后续不安全 HTML %s", async (_, markdown, message) => {
    const articleFile = writeVariant(
      "html-quoted-greater-than",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain(message);
  });

  test("raw HTML 属性中的 backtick 不会形成 code span", async () => {
    const articleFile = writeVariant(
      "backtick-in-html-attribute",
      (content) =>
        `${content}\n\n<span title="\`" onclick="alert(1)" data-x="\`">正文</span>\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain(
      "HTML 属性不允许使用事件 handler：span.onclick"
    );
  });

  test("非法 backtick fence opener 不会遮蔽后续 script", async () => {
    const articleFile = writeVariant(
      "invalid-backtick-fence-opener",
      (content) =>
        `${content}\n\n\`\`\`md\`x\n<script>globalThis.__probe = 1</script>\n\`\`\`\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("HTML 标签不允许使用：script");
  });

  test("已识别的 forbidden tag 前缀在畸形输入中 fail closed", async () => {
    const articleFile = writeVariant(
      "malformed-forbidden-tag",
      (content) => `${content}\n\n<script <span>globalThis.__probe = 1\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("HTML 标签不允许使用：script");
  });

  test("普通小于号文本不会被当作畸形 HTML 标签", async () => {
    const articleFile = writeVariant(
      "plain-less-than-text",
      (content) => `${content}\n\n版本 1 < 2，script 只是普通文本。\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test.each([
    ["hex reference", '<q cite="jav&#x61;script:alert(1)">正文</q>'],
    ["decimal reference", '<q cite="java&#115;cript:alert(1)">正文</q>'],
    ["named colon reference", '<q cite="javascript&colon;alert(1)">正文</q>'],
    ["named tab reference", '<q cite="java&Tab;script:alert(1)">正文</q>'],
    ["named newline reference", '<q cite="java&NewLine;script:alert(1)">正文</q>']
  ])("URL 属性中的 HTML character reference 会先解码：%s", async (_, markdown) => {
    const articleFile = writeVariant(
      "html-url-character-reference",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("HTML 属性不允许使用可执行 URL：q.cite");
  });

  test("URL query 中的 named character reference 保持合法", async () => {
    const articleFile = writeVariant(
      "safe-html-url-character-reference",
      (content) =>
        `${content}\n\n<q cite="https://example.com/docs?a=1&amp;b=2">正文</q>\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test.each([
    ["import leading comment", 'import /*comment*/ Notice from "./Notice.mdx";'],
    ["export leading comment", "export /*comment*/ default 1;"],
    [
      "multiline import comments",
      'import /* first\nsecond */ {\n  Notice\n} /* before from */ from "./Notice.mdx";'
    ],
    [
      "keyword inside block comment",
      'import /* first\nexport\n*/ Notice from "./Notice.mdx";'
    ],
    [
      "blank line inside block comment",
      'import /* first\n\nsecond */ Notice from "./Notice.mdx";'
    ],
    ["multiline export comments", "export /* first */\n/* second */ default 1;"]
  ])("合法 comment 位置中的 %s 仍按 MDX ESM 阻断", async (_, markdown) => {
    const articleFile = writeVariant(
      "mdx-esm-comments",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("正文禁止 MDX ESM import/export");
  });

  test.each([
    ["MDX import", 'import Notice from "./Notice.mdx";'],
    ["MDX export", "export const metadata = { title: 'Demo' };"],
    ["MDX named export", 'export { Notice } from "./Notice.mdx";'],
    ["MDX async function export", "export async function loadData() {}"],
    ["MDX namespace export", 'export * as Docs from "./docs.mdx";'],
    ["MDX multiline import", 'import {\n  Notice\n} from "./Notice.mdx";'],
    ["MDX multiline export", 'export {\n  Notice\n} from "./Notice.mdx";']
  ])("%s 会被Markdown 边界阻断", async (_, markdown) => {
    const articleFile = writeVariant(
      "mdx-esm",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("正文禁止 MDX ESM import/export");
  });

  test.each([
    ["export default", "import broken\nexport default 1;"],
    ["export function", "import broken\nexport function demo() {}"]
  ])("malformed MDX import 不会遮蔽后续 %s", async (_, markdown) => {
    const articleFile = writeVariant(
      "malformed-import-before-export",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("正文禁止 MDX ESM import/export");
  });

  test(
    "大量无终止符的 malformed MDX import 保持有界扫描",
    async () => {
      const malformedImports = Array.from(
        { length: 6_000 },
        (_, index) => `import broken${index}`
      ).join("\n");
      const articleFile = writeVariant(
        "many-malformed-mdx-imports",
        (content) => `${content}\n\n${malformedImports}\n`
      );

      const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

      expect(result.valid).toBe(true);
    },
    1_000
  );

  test.each([
    ["PascalCase component", "<Alert>只适用于官网渲染。</Alert>", "Alert"],
    ["namespace component", "<Docs.Alert>只适用于官网渲染。</Docs.Alert>", "Docs.Alert"],
    ["underscore component", "<_Alert />", "_Alert"],
    ["dollar component", "<$Alert />", "$Alert"],
    ["Unicode component", "<提示 />", "提示"],
    ["astral Unicode component", "<𐐀Alert />", "𐐀Alert"]
  ])("%s 会被Markdown 边界阻断", async (_, markdown, componentName) => {
    const articleFile = writeVariant(
      "mdx-custom-component",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain(`正文禁止 MDX/JSX 自定义组件：${componentName}`);
  });

  test.each([
    ["URI autolink", "<https://example.com/docs>"],
    ["email autolink", "<docs@example.com>"]
  ])("合法 CommonMark %s 不会被当作 JSX 或 HTML", async (_, markdown) => {
    const articleFile = writeVariant(
      "commonmark-autolink",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("可执行 URI autolink 仍会被 Markdown 边界阻断", async () => {
    const articleFile = writeVariant(
      "executable-uri-autolink",
      (content) => `${content}\n\n<javascript:alert(1)>\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("自动链接不允许使用可执行 URL");
  });

  test("autolink 与相邻 JSX component 按各自语法分类", async () => {
    const articleFile = writeVariant(
      "autolink-next-to-jsx",
      (content) => `${content}\n\n<https://example.com/docs> <_Alert />\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toEqual(["正文禁止 MDX/JSX 自定义组件：_Alert"]);
  });

  test("unquoted attribute value 中的斜杠不会拆出伪事件属性", async () => {
    const articleFile = writeVariant(
      "unquoted-attribute-slash",
      (content) => `${content}\n\n<q cite=https://example.com/onload=docs>正文</q>\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test.each([
    ["普通结束标签", "<span data-x=value onclick=alert(1)>正文</span>"],
    ["self-closing marker", "<span data-x=value onload=alert(1) />"]
  ])("真正的 unquoted %s 事件属性仍会阻断", async (_, markdown) => {
    const articleFile = writeVariant(
      "unquoted-event-attribute",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result).some((message) => message.includes("事件 handler"))).toBe(
      true
    );
  });

  test("JSX fragment 会被Markdown 边界阻断", async () => {
    const articleFile = writeVariant(
      "jsx-fragment",
      (content) => `${content}\n\n<><span>官网专属片段</span></>\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("正文禁止 MDX/JSX fragment");
  });

  test("JSX 表达式属性会被Markdown 边界阻断", async () => {
    const articleFile = writeVariant(
      "jsx-expression-attribute",
      (content) => `${content}\n\n<span data-version={version}>版本说明</span>\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("HTML/JSX 属性不允许使用表达式：span.data-version");
  });

  test.each([
    ["HTML 标签体内 JSX 表达式", "<span>{version}</span>"],
    ["独立 JSX 表达式", "{version}"],
    ["多行 JSX 表达式", "{\n  version\n}"]
  ])("%s 会被Markdown 边界阻断", async (_, markdown) => {
    const articleFile = writeVariant(
      "jsx-body-expression",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(false);
    expect(issueMessages(result)).toContain("正文禁止 MDX/JSX 表达式");
  });

  test("code 中的 MDX 和 script 示例不会触发Markdown 边界", async () => {
    const articleFile = writeVariant(
      "markdown-boundary-in-code",
      (content) =>
        `${content}\n\n\`<Alert>示例</Alert>\`\n\n\`\`\`mdx\nimport Alert from "./Alert.mdx";\n<script>alert("xss")</script>\n<Docs.Alert />\n\`\`\`\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("code span 中带 backtick 的 raw HTML 示例继续豁免", async () => {
    const articleFile = writeVariant(
      "raw-html-with-backtick-in-code-span",
      (content) =>
        `${content}\n\n\`\`<span title="\`" onclick="alert(1)">示例</span>\`\`\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("http(s) 外链通过且不发起网络请求", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const articleFile = writeVariant(
      "external-links",
      (content) => `${content}\n\n[HTTP](http://example.com/a) [HTTPS](https://example.com/b)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  test.each([
    ["protocol-relative URL", "//example.com/docs"],
    ["同页 anchor", "#section"]
  ])("合法%s链接通过", async (_, target) => {
    const articleFile = writeVariant(
      "allowed-link-target",
      (content) => `${content}\n\n[文档](${target})\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("存在的本地文件链接通过并忽略 query 与 fragment", async () => {
    const articleFile = writeArticleWithAssets(
      "local-link",
      (content) => `${content}\n\n[本地文档](docs/guide.md?mode=raw#usage)\n`,
      { "docs/guide.md": "# 使用说明\n" }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("缺失的本地文件链接会阻断", async () => {
    const articleFile = writeVariant(
      "missing-local-link",
      (content) => `${content}\n\n[本地文档](docs/missing.md)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("本地链接文件不存在：docs/missing.md");
  });

  test.each([
    ["POSIX 绝对路径", "/tmp/secret.md"],
    ["Windows 绝对路径", "C:/secret.md"],
    ["file URL", "file:///tmp/secret.md"],
    ["file scheme", "file:secret.md"],
    ["原始路径穿越", "../secret.md"],
    ["嵌套路径穿越", "docs/../secret.md"],
    ["decode 后路径穿越", "%2e%2e/secret.md"]
  ])("本地链接拒绝%s", async (_, target) => {
    const articleFile = writeVariant(
      "unsafe-local-link",
      (content) => `${content}\n\n[本地文档](${target})\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain(
      `本地链接路径必须相对文章目录且不能穿越：${target}`
    );
  });

  test("malformed percent-encoding 以阻断问题返回", async () => {
    const articleFile = writeVariant(
      "malformed-percent-encoding",
      (content) => `${content}\n\n[本地文档](docs/%ZZ.md)\n`
    );

    await expect(
      validateArticleFile({ articleFile, configPath, dryRun: false })
    ).resolves.toMatchObject({
      valid: false,
      blocking_issues: [{ message: "本地链接 percent-encoding 无效：docs/%ZZ.md" }]
    });
  });

  test.each([
    ["query", "docs/guide.md?x=%ZZ"],
    ["fragment", "docs/guide.md#%ZZ"]
  ])("%s 中的 malformed percent-encoding 以阻断问题返回", async (_, target) => {
    const articleFile = writeArticleWithAssets(
      "malformed-percent-encoding-suffix",
      (content) => `${content}\n\n[本地文档](${target})\n`,
      { "docs/guide.md": "# 使用说明\n" }
    );

    await expect(
      validateArticleFile({ articleFile, configPath, dryRun: false })
    ).resolves.toMatchObject({
      valid: false,
      blocking_issues: [{ message: `本地链接 percent-encoding 无效：${target}` }]
    });
  });

  test("本地链接目标必须是可读取文件", async () => {
    const articleFile = writeArticleWithAssets(
      "local-link-directory",
      (content) => `${content}\n\n[本地文档](docs/guide)\n`,
      {}
    );
    mkdirSync(path.join(path.dirname(articleFile), "docs/guide"), { recursive: true });

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("本地链接文件不存在：docs/guide");
  });

  test("本地链接拒绝指向文章目录外文件的 symlink", async () => {
    const outsideDirectory = createTemporaryDirectory("article validation outside ");
    const outsideFile = path.join(outsideDirectory, "outside.md");
    writeFileSync(outsideFile, "# 外部文件\n", "utf8");
    const articleFile = writeArticleWithAssets(
      "external-link-symlink",
      (content) => `${content}\n\n[本地文档](docs/guide.md)\n`,
      {}
    );
    const symlinkPath = path.join(path.dirname(articleFile), "docs/guide.md");
    mkdirSync(path.dirname(symlinkPath), { recursive: true });
    symlinkSync(outsideFile, symlinkPath, "file");

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("本地链接文件不存在：docs/guide.md");
  });

  test("本地链接允许指向文章目录内文件的 symlink", async () => {
    const articleFile = writeArticleWithAssets(
      "internal-link-symlink",
      (content) => `${content}\n\n[本地文档](docs/guide-link.md)\n`,
      { "docs/guide.md": "# 使用说明\n" }
    );
    symlinkSync("guide.md", path.join(path.dirname(articleFile), "docs/guide-link.md"), "file");

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test.each([
    ["full reference", "[参考资料][guide]"],
    ["collapsed reference", "[guide][]"]
  ])("已定义的%s链接通过", async (_, reference) => {
    const articleFile = writeArticleWithAssets(
      "defined-reference-link",
      (content) => `${content}\n\n${reference}\n\n[guide]: docs/guide.md\n`,
      { "docs/guide.md": "# 使用说明\n" }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("reference id 按大小写与连续空白归一化", async () => {
    const articleFile = writeArticleWithAssets(
      "normalized-reference-link",
      (content) => `${content}\n\n[参考资料][Guide   Doc]\n\n[guide doc]: docs/guide.md\n`,
      { "docs/guide.md": "# 使用说明\n" }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
  });

  test("escaped reference label 的定义与引用使用相同 normalization", async () => {
    const articleFile = writeArticleWithAssets(
      "escaped-reference-label",
      (content) => `${content}\n\n[引用][a\\]b]\n\n[a\\]b]: docs/guide.md\n`,
      { "docs/guide.md": "# 使用说明\n" }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("未定义的 reference link 会阻断", async () => {
    const articleFile = writeVariant(
      "undefined-reference-link",
      (content) => `${content}\n\n[参考资料][missing]\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("未定义的 reference link：missing");
  });

  test.each([
    ["脚注引用", "正文结论[^1]。"],
    ["脚注定义", "[^note]: 参考资料"]
  ])("正文禁止学术式%s", async (_, markdown) => {
    const articleFile = writeVariant(
      "academic-footnote",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("正文禁止学术式脚注");
  });

  test("fenced code block 中的链接和脚注示例不会触发校验", async () => {
    const articleFile = writeVariant(
      "links-in-code-fence",
      (content) =>
        `${content}\n\n\`\`\`md\n[缺失文件](missing.md)\n[参考][missing]\n正文[^1]\n[^1]: 示例\n\`\`\`\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test.each([
    ["单 backtick", "`[链接](missing.md) [参考][missing] [^1] ![中文图](missing.png)`"],
    [
      "多 backtick",
      "``[链接](missing-2.md) [参考][missing-2] [^2] ![中文图](missing-2.png)``"
    ]
  ])("%s code span 中的 Markdown 示例不会触发校验", async (_, markdown) => {
    const articleFile = writeVariant(
      "markdown-in-code-span",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("escaped backtick 不会遮蔽真实链接", async () => {
    const articleFile = writeVariant(
      "escaped-backtick-around-link",
      (content) => `${content}\n\n\\\`[真实链接](missing.md)\\\`\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("本地链接文件不存在：missing.md");
  });

  test.each([
    ["reviewer case", "\\``[真实链接](missing.md)`"],
    ["更长 run", "\\```[真实链接](missing.md)``"]
  ])("escaped 多 backtick 的剩余%s 仍可组成 code span", async (_, markdown) => {
    const articleFile = writeVariant(
      "escaped-backtick-prefix-in-run",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(result.valid).toBe(true);
    expect(result.blocking_issues).toEqual([]);
  });

  test("escaped 多 backtick 的剩余 run 仅按实际长度配对", async () => {
    const markdown = "\\```[真实链接](missing.md)`";
    const articleFile = writeVariant(
      "mismatched-run-after-escaped-backtick",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("本地链接文件不存在：missing.md");
  });

  test.each([
    ["链接", "[未闭合\n[真实链接](missing.md)", "本地链接文件不存在：missing.md"],
    ["图片", "![未闭合\n![中文图](missing.png)", "本地图片文件不存在：missing.png"]
  ])("未闭合%s bracket 不会跳过后续真实资源", async (_, markdown, expectedIssue) => {
    const articleFile = writeVariant(
      "unclosed-bracket-before-resource",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain(expectedIssue);
  });

  test.each([
    [
      "链接",
      "[普通外层 [真实链接](missing.md)]",
      "本地链接文件不存在：missing.md"
    ],
    [
      "图片",
      "![普通外层 ![中文图](missing.png)]",
      "本地图片文件不存在：missing.png"
    ]
  ])("无 suffix 的普通外层%s bracket 不会跳过内部资源", async (_, markdown, expectedIssue) => {
    const articleFile = writeVariant(
      "plain-outer-bracket-around-resource",
      (content) => `${content}\n\n${markdown}\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toEqual([expectedIssue]);
  });

  test("图片语法不会重复作为普通链接校验", async () => {
    const articleFile = writeVariant(
      "image-not-link",
      (content) => `${content}\n\n![中文截图](assets/images/missing.png)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toEqual(["本地图片文件不存在：assets/images/missing.png"]);
  });

  test(
    "大量未闭合 bracket 不会重复扫描或产生链接问题",
    async () => {
      const articleFile = writeVariant(
        "many-unclosed-brackets",
        (content) => `${content}\n\n${"[".repeat(30_000)}\n`
      );

      const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

      expect(result.valid).toBe(true);
      expect(issueMessages(result).filter((message) => /链接|reference/.test(message))).toEqual([]);
    },
    10_000
  );

  test(
    "大量 malformed destination 保持有界并校验后续真实资源",
    async () => {
      const articleFile = writeVariant(
        "many-malformed-destinations",
        (content) =>
          `${content}\n\n${"[x](".repeat(30_000)}[真实链接](missing.md) ![中文图](missing.png)\n`
      );

      const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

      expect(issueMessages(result)).toContain("本地链接文件不存在：missing.md");
      expect(issueMessages(result)).toContain("本地图片文件不存在：missing.png");
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

    expect(issueMessages(result)).toContain("本地图片文件不存在：assets/images/demo.png");
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
      blocking_issues: [{ message: "本地图片文件不存在：assets/images/demo.png" }]
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

  test("带尾随文本的 fence 行不会关闭代码块", async () => {
    const articleFile = writeVariant(
      "non-closing-fence",
      (content) =>
        `${content}\n\n\`\`\`md\n\`\`\`not-close\n![中文示例](ignored.png)\n\`\`\`\n![中文正文图](assets/images/real.png)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("本地图片文件不存在：assets/images/real.png");
    expect(issueMessages(result)).not.toContain("本地图片文件不存在：ignored.png");
  });

  test("angle-bracket destination 支持包含空格的本地路径", async () => {
    const articleFile = writeVariant(
      "angle-image-destination",
      (content) => `${content}\n\n![中文截图](<assets/images/my image.png>)\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("本地图片文件不存在：assets/images/my image.png");
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

    expect(issueMessages(result)).toContain(`本地图片文件不存在：${expectedPath}`);
  });

  test("file URL 不能绕过本地图片路径限制", async () => {
    const imagePath = "file:///tmp/demo.png";
    const articleFile = writeVariant(
      "file-url-image",
      (content) => `${content}\n\n![中文截图](${imagePath})\n`
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain(`本地图片路径必须相对文章目录且不能穿越：${imagePath}`);
  });

  test("普通图片路径指向目录时按文件不存在阻断", async () => {
    const articleFile = writeArticleWithAssets(
      "image-directory",
      (content) => `${content}\n\n![中文截图](assets/images/demo.jpg)\n`,
      {}
    );
    mkdirSync(path.join(path.dirname(articleFile), "assets/images/demo.jpg"), { recursive: true });

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("本地图片文件不存在：assets/images/demo.jpg");
  });

  test.each(["svg", "png"])("diagram %s 目录不能冒充同名文件", async (extension) => {
    const companionAssets =
      extension === "svg"
        ? { "assets/diagrams/flow.mmd": "graph TD\nA-->B\n", "assets/diagrams/flow.png": validPng }
        : {
            "assets/diagrams/flow.mmd": "graph TD\nA-->B\n",
            "assets/diagrams/flow.svg": '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
          };
    const articleFile = writeArticleWithAssets("diagram-directory", (content) => content, companionAssets);
    mkdirSync(path.join(path.dirname(articleFile), `assets/diagrams/flow.${extension}`), { recursive: true });

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain(
      `Mermaid 源文件缺少同名 ${extension.toUpperCase()}：assets/diagrams/flow.${extension}`
    );
  });

  test("IHDR chunk 长度不是 13 的 PNG 会阻断", async () => {
    const malformedPng = Buffer.alloc(33);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(malformedPng);
    malformedPng.writeUInt32BE(1, 8);
    malformedPng.write("IHDR", 12, "ascii");
    malformedPng.writeUInt32BE(1, 16);
    malformedPng.writeUInt32BE(1, 20);
    const articleFile = writeArticleWithAssets(
      "invalid-ihdr-length",
      (content) => `${content}\n\n![中文截图](assets/images/malformed.png)\n`,
      { "assets/images/malformed.png": malformedPng }
    );

    const result = await validateArticleFile({ articleFile, configPath, dryRun: false });

    expect(issueMessages(result)).toContain("PNG 图片无法解码或尺寸无效：assets/images/malformed.png");
  });
});
