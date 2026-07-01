import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { upsertPublicationArticleRecord } from "../../src/domain/publications.js";
import { ArticleHubError } from "../../src/infrastructure/errors.js";

async function createTempRoot() {
  return mkdtemp(path.join(tmpdir(), "article-hub-publications-"));
}

async function writeArticleFile(articleFile: string) {
  await mkdir(path.dirname(articleFile), { recursive: true });
  await writeFile(articleFile, "---\ntitle: fixture\n---\n# fixture\n", "utf8");
}

describe("publications record", () => {
  test("为文章路径初始化发布记录条目", async () => {
    const root = await createTempRoot();
    const articleFile = path.join(
      root,
      "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md"
    );

    await writeArticleFile(articleFile);
    const result = await upsertPublicationArticleRecord({
      root,
      articleFile,
      title: "WebMCP SDK 实践指南",
      topicIssue: 12,
      dryRun: false
    });

    expect(result).toEqual({
      file: path.join(root, "articles/publications.json"),
      article_id: "webmcp-sdk/2026-06-19-webmcp-guide",
      record: {
        article_file: "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md",
        title: "WebMCP SDK 实践指南",
        topic_issue: 12,
        publications: {}
      },
      written: true
    });

    const rawDocument = await readFile(result.file, "utf8");

    expect(rawDocument.endsWith("\n")).toBe(true);
    expect(JSON.parse(rawDocument)).toEqual({
      schema_version: "article-hub.publications.v1",
      articles: {
        "webmcp-sdk/2026-06-19-webmcp-guide": {
          article_file: "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md",
          title: "WebMCP SDK 实践指南",
          topic_issue: 12,
          publications: {}
        }
      }
    });
  });

  test("dry-run 返回将写入的条目但不创建文件", async () => {
    const root = await createTempRoot();
    const articleFile = path.join(
      root,
      "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md"
    );

    await writeArticleFile(articleFile);
    const result = await upsertPublicationArticleRecord({
      root,
      articleFile,
      title: "WebMCP SDK 实践指南",
      topicIssue: 12,
      dryRun: true
    });

    expect(result).toMatchObject({
      article_id: "webmcp-sdk/2026-06-19-webmcp-guide",
      written: false
    });
    await expect(readFile(result.file, "utf8")).rejects.toMatchObject({
      code: "ENOENT"
    });
  });

  test("更新文章元数据时保留已有平台发布记录", async () => {
    const root = await createTempRoot();
    const publicationFile = path.join(root, "articles/publications.json");
    const articleFile = path.join(
      root,
      "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md"
    );

    await writeArticleFile(articleFile);
    await mkdir(path.dirname(publicationFile), { recursive: true });
    await writeFile(
      publicationFile,
      `${JSON.stringify(
        {
          schema_version: "article-hub.publications.v1",
          articles: {
            "webmcp-sdk/2026-06-19-webmcp-guide": {
              article_file: "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md",
              title: "旧标题",
              topic_issue: 12,
              source_pr: 34,
              publications: {
                juejin: {
                  url: "https://juejin.cn/post/example",
                  published_date: "2026-06-30"
                }
              }
            }
          }
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const result = await upsertPublicationArticleRecord({
      root,
      articleFile,
      title: "WebMCP SDK 新标题",
      topicIssue: 12,
      dryRun: false
    });

    expect(result.record).toEqual({
      article_file: "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md",
      title: "WebMCP SDK 新标题",
      topic_issue: 12,
      source_pr: 34,
      publications: {
        juejin: {
          url: "https://juejin.cn/post/example",
          published_date: "2026-06-30"
        }
      }
    });
  });

  test("拒绝非文章母稿路径", async () => {
    const root = await createTempRoot();
    const articleFile = path.join(root, "materials/webmcp-sdk/article.md");

    await writeArticleFile(articleFile);

    await expect(
      upsertPublicationArticleRecord({
        root,
        articleFile,
        title: "WebMCP SDK 实践指南",
        topicIssue: 12,
        dryRun: false
      })
    ).rejects.toMatchObject({
      code: "UNSAFE_PATH",
      exitCode: 2
    } satisfies Partial<ArticleHubError>);
  });

  test("发布记录 JSON 损坏时返回稳定错误码", async () => {
    const root = await createTempRoot();
    const publicationFile = path.join(root, "articles/publications.json");
    const articleFile = path.join(
      root,
      "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md"
    );

    await writeArticleFile(articleFile);
    await mkdir(path.dirname(publicationFile), { recursive: true });
    await writeFile(publicationFile, "{", "utf8");

    await expect(
      upsertPublicationArticleRecord({
        root,
        articleFile,
        title: "WebMCP SDK 实践指南",
        topicIssue: 12,
        dryRun: false
      })
    ).rejects.toMatchObject({
      code: "INVALID_JSON",
      exitCode: 2
    } satisfies Partial<ArticleHubError>);
  });

  test("发布记录 articles 字段损坏时返回稳定错误码", async () => {
    const root = await createTempRoot();
    const publicationFile = path.join(root, "articles/publications.json");
    const articleFile = path.join(
      root,
      "articles/webmcp-sdk/2026-06-19-webmcp-guide/article.md"
    );

    await writeArticleFile(articleFile);
    await mkdir(path.dirname(publicationFile), { recursive: true });
    await writeFile(
      publicationFile,
      `${JSON.stringify(
        {
          schema_version: "article-hub.publications.v1",
          articles: []
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    await expect(
      upsertPublicationArticleRecord({
        root,
        articleFile,
        title: "WebMCP SDK 实践指南",
        topicIssue: 12,
        dryRun: false
      })
    ).rejects.toMatchObject({
      code: "INVALID_JSON",
      exitCode: 2
    } satisfies Partial<ArticleHubError>);
  });
});
