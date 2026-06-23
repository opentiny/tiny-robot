/** 带计划版本和 Hash 前缀的写作计划批准命令。 */
export interface ApproveWritingPlanCommand {
  kind: "approve-writing-plan";
  planVersion: number;
  hashPrefix: string;
}

/** 无附加参数的固定 `/ai` 命令。 */
export interface SimpleAiCommand {
  kind: "status" | "approve-topic" | "pause" | "resume" | "retry";
}

/** 固定 `/ai` 命令解析结果。 */
export type ParsedAiCommand = ApproveWritingPlanCommand | SimpleAiCommand;

const approveWritingPlanPattern = /^\/ai 批准写作计划 ([1-9]\d*) ([0-9a-f]{8})$/;
const exactCommands = new Map<string, SimpleAiCommand["kind"]>([
  ["/ai 状态", "status"],
  ["/ai 批准选题", "approve-topic"],
  ["/ai 暂停", "pause"],
  ["/ai 恢复", "resume"],
  ["/ai 重试", "retry"]
]);

/**
 * 解析流程支持的固定 `/ai` 命令。
 *
 * @param body Issue 或 PR 评论原文。
 * @returns 精确匹配的结构化命令；其他输入返回 null。
 */
export function parseAiCommand(body: string): ParsedAiCommand | null {
  const exactKind = exactCommands.get(body);

  if (exactKind) {
    return { kind: exactKind };
  }

  const match = approveWritingPlanPattern.exec(body);

  if (!match) {
    return null;
  }

  const planVersion = Number(match[1]);

  if (!Number.isSafeInteger(planVersion)) {
    return null;
  }

  return {
    kind: "approve-writing-plan",
    planVersion,
    hashPrefix: match[2]
  };
}
