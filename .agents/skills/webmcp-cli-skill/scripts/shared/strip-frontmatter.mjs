/** 与 article-validation.ts 中 parseArticle 使用的 Front Matter 边界一致。 */
const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * 去掉 ai-article-hub 母稿开头的 YAML Front Matter，保留 Markdown 正文。
 * @param {string} body 完整 article.md 文本
 * @returns {{ body: string, stripped: boolean, malformed: boolean }}
 */
export function stripFrontMatter(body) {
  if (!body.startsWith('---')) {
    return { body, stripped: false, malformed: false };
  }

  const match = FRONT_MATTER_RE.exec(body);
  if (!match) {
    return { body, stripped: false, malformed: true };
  }

  return { body: match[2].replace(/^\s+/, ''), stripped: true, malformed: false };
}
