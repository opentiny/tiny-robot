import {
  type ArticleValidationResult,
  validateArticleFile
} from "../domain/article-validation.js";

/**
 * `validate article` CLI 参数，路径由 CLI 层解析后传入。
 */
export interface ValidateArticleCommandOptions {
  articleFile: string;
  configPath: string;
  dryRun: boolean;
}

/**
 * 执行文章校验命令，保持 CLI 层只做参数适配。
 *
 * @param options CLI 解析后的文章路径、配置路径和 dry-run 标记。
 * @returns 版本化校验 envelope，供 CLI 原样序列化为 JSON。
 * @throws ArticleHubError 当底层文件读取或项目配置校验失败时抛出。
 */
export async function validateArticle(
  options: ValidateArticleCommandOptions
): Promise<ArticleValidationResult> {
  return validateArticleFile(options);
}
