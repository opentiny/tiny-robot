import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import { ArticleHubError } from "../infrastructure/errors.js";

const publicationsSchemaVersion = "article-hub.publications.v1";

/**
 * 单篇文章在发布记录文件中的索引条目。
 */
export interface PublicationArticleRecord {
  article_file: string;
  title: string;
  topic_issue: number;
  source_pr?: number;
  publications: Record<string, unknown>;
}

/**
 * 写入或预览文章发布记录所需的输入。
 */
export interface UpsertPublicationArticleRecordOptions {
  root: string;
  articleFile: string;
  title: string;
  topicIssue: number;
  sourcePr?: number;
  dryRun: boolean;
}

/**
 * 写入或预览文章发布记录后的稳定结果。
 */
export interface UpsertPublicationArticleRecordResult {
  file: string;
  article_id: string;
  record: PublicationArticleRecord;
  written: boolean;
}

interface PublicationsDocument {
  schema_version: typeof publicationsSchemaVersion;
  articles: Record<string, PublicationArticleRecord>;
}

/**
 * 为 Draft PR 阶段的文章创建或更新发布记录条目。
 *
 * @param options 仓库根目录、文章路径、标题、Issue 编号和 dry-run 标记。
 * @returns 发布记录文件路径、文章 ID、将写入的条目和是否已写文件。
 * @throws ArticleHubError 当文章路径不属于文章母稿目录或文件 JSON 无效时抛出。
 */
export async function upsertPublicationArticleRecord(
  options: UpsertPublicationArticleRecordOptions
): Promise<UpsertPublicationArticleRecordResult> {
  const publicationFile = path.join(options.root, "articles/publications.json");
  const articleFile = await toRelativeArticleFile(options.root, options.articleFile);
  const articleId = articleFile.replace(/^articles\//, "").replace(/\/article\.md$/, "");
  const document = await readPublicationsDocument(publicationFile);
  const existing = document.articles[articleId];
  const record = orderPublicationArticleRecord({
    article_file: articleFile,
    title: options.title,
    topic_issue: options.topicIssue,
    source_pr: options.sourcePr ?? existing?.source_pr,
    publications: existing?.publications ?? {}
  });

  document.articles[articleId] = record;

  if (!options.dryRun) {
    await mkdir(path.dirname(publicationFile), { recursive: true });
    await writeFile(publicationFile, JSON.stringify(document, null, 2) + "\n", "utf8");
  }

  return {
    file: publicationFile,
    article_id: articleId,
    record,
    written: !options.dryRun
  };
}

async function toRelativeArticleFile(root: string, articleFile: string): Promise<string> {
  const [realRoot, realArticleFile] = await Promise.all([realpath(root), realpath(articleFile)]);
  const relativePath = path.relative(realRoot, realArticleFile).split(path.sep).join("/");

  if (
    relativePath.startsWith("../") ||
    relativePath === ".." ||
    path.isAbsolute(relativePath) ||
    !/^articles\/[^/]+\/[^/]+\/article\.md$/.test(relativePath)
  ) {
    throw new ArticleHubError(
      "UNSAFE_PATH",
      "文章路径必须位于 articles/<project>/<date-slug>/article.md：" + articleFile,
      2
    );
  }

  return relativePath;
}

async function readPublicationsDocument(publicationFile: string): Promise<PublicationsDocument> {
  const raw = await readFile(publicationFile, "utf8").catch((error: unknown) => {
    const nodeError = error as { code?: string };

    if (nodeError.code === "ENOENT") {
      return "";
    }

    throw error;
  });

  if (raw.trim().length === 0) {
    return {
      schema_version: publicationsSchemaVersion,
      articles: {}
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new ArticleHubError("INVALID_JSON", "发布记录文件不是合法 JSON", 2);
  }

  if (!isRecord(parsed)) {
    throw new ArticleHubError("INVALID_JSON", "发布记录文件必须是 JSON object", 2);
  }

  if (parsed.articles !== undefined && !isRecord(parsed.articles)) {
    throw new ArticleHubError("INVALID_JSON", "发布记录 articles 字段必须是 JSON object", 2);
  }

  return {
    schema_version: publicationsSchemaVersion,
    articles: parsed.articles ? (parsed.articles as Record<string, PublicationArticleRecord>) : {}
  };
}

function orderPublicationArticleRecord(
  record: PublicationArticleRecord
): PublicationArticleRecord {
  const ordered: PublicationArticleRecord = {
    article_file: record.article_file,
    title: record.title,
    topic_issue: record.topic_issue,
    publications: record.publications
  };

  if (typeof record.source_pr === "number") {
    return {
      article_file: ordered.article_file,
      title: ordered.title,
      topic_issue: ordered.topic_issue,
      source_pr: record.source_pr,
      publications: ordered.publications
    };
  }

  return ordered;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
