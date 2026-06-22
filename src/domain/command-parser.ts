export interface ApproveWritingPlanCommand {
  kind: "approve-writing-plan";
  planVersion: number;
  hashPrefix: string;
}

export type ParsedAiCommand = ApproveWritingPlanCommand;

const approveWritingPlanPattern = /^\/ai 批准写作计划 ([1-9]\d*) ([0-9a-f]{8})$/;

/**
 * 解析当前流程支持的固定 `/ai` 命令。
 *
 * 目前只识别写作计划批准命令；普通自然语言、额外空白、bot 近似指令和其他 `/ai`
 * 命令均返回 `null`，避免 CLI 猜测用户意图。
 */
export function parseAiCommand(body: string): ParsedAiCommand | null {
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
