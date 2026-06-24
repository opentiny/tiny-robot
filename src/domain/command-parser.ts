/** 无附加参数的固定 `/ai` 命令。 */
export interface SimpleAiCommand {
  kind:
    | "status"
    | "approve-topic"
    | "approve-writing-plan"
    | "pause"
    | "resume"
    | "retry";
}

/** 固定 `/ai` 命令解析结果。 */
export type ParsedAiCommand = SimpleAiCommand;

const exactCommands = new Map<string, SimpleAiCommand["kind"]>([
  ["/ai 状态", "status"],
  ["/ai 批准选题", "approve-topic"],
  ["/ai 批准写作计划", "approve-writing-plan"],
  ["/ai 暂停", "pause"],
  ["/ai 恢复", "resume"],
  ["/ai 重试", "retry"],
]);

/**
 * 解析流程支持的固定 `/ai` 命令。
 *
 * 批准写作计划已去参数化：只接受逐字精确的 `/ai 批准写作计划`，不再携带版本号或 Hash 前缀。
 *
 * @param body Issue 或 PR 评论原文。
 * @returns 精确匹配的结构化命令；其他输入返回 null。
 */
export function parseAiCommand(body: string): ParsedAiCommand | null {
  const exactKind = exactCommands.get(body);

  if (exactKind) {
    return { kind: exactKind };
  }

  return null;
}
