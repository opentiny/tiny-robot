/**
 * 判断评论是否在首个非空位置显式使用 `/ai` 向 Agent 发起请求。
 *
 * @param body Issue 评论原文。
 * @returns 评论以独立 `/ai` 前缀开头时返回 true，否则返回 false。
 */
export function isExplicitAiRequest(body: string): boolean {
  return /^\/ai(?:\s|$)/u.test(body.trimStart());
}

/**
 * 判断评论是否为固定写作计划批准命令。
 *
 * @param body Issue 或 PR 评论原文。
 * @returns 逐字等于 `/ai 批准写作计划` 时返回 true，否则返回 false。
 */
export function isFixedWritingPlanApproval(body: string): boolean {
  return body === "/ai 批准写作计划";
}
