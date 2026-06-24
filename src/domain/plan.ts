import { parseAiCommand } from "./command-parser.js";

export type PlanApprovalReason =
  | "INVALID_APPROVAL_COMMAND"
  | "MISSING_PLAN_BODY"
  | "MISSING_APPROVER"
  | "MISSING_APPROVAL_COMMENT_ID"
  | "INVALID_PLAN_COMMENT_ID"
  | "MISSING_APPROVED_AT"
  | "INVALID_APPROVED_AT";

/** `approveWritingPlan` 的入参。`planBody` 是被批准计划评论的正文原文。 */
export interface ApproveWritingPlanInput {
  planBody: string;
  command: string;
  approver: string;
  commentId?: number;
  approvedAt: string;
  planCommentId?: number;
  planLabel?: string;
}

/** 不可变批准快照，冻结被批准计划全文与审计元数据；不含任何 Hash 或版本字段。 */
export interface WritingPlanApprovalSnapshot {
  approved_plan: string;
  approval_command: string;
  approver: string;
  approval_comment_id: number;
  plan_comment_id: number | null;
  plan_label: string | null;
  approved_at: string;
  article_date: string;
}

export type WritingPlanApprovalResult =
  | { valid: true; snapshot: WritingPlanApprovalSnapshot }
  | { valid: false; reason: PlanApprovalReason };

/**
 * 校验固定写作计划批准命令，并生成不可变批准快照。
 *
 * 不再计算计划语义 Hash 或校验版本号；防漂移由「快照冻结被批准计划全文、生成只读快照」
 * 在流程上保证。命令必须逐字等于 `/ai 批准写作计划`。
 *
 * @param input 计划正文、批准命令原文与批准元数据。
 * @returns 校验通过时返回不可变快照；否则返回稳定 reason。
 */
export function approveWritingPlan(
  input: ApproveWritingPlanInput,
): WritingPlanApprovalResult {
  const parsed = parseAiCommand(input.command);

  if (parsed?.kind !== "approve-writing-plan") {
    return { valid: false, reason: "INVALID_APPROVAL_COMMAND" };
  }

  if (input.planBody.trim().length === 0) {
    return { valid: false, reason: "MISSING_PLAN_BODY" };
  }

  if (!input.approver) {
    return { valid: false, reason: "MISSING_APPROVER" };
  }

  if (
    typeof input.commentId !== "number" ||
    !isPositiveSafeInteger(input.commentId)
  ) {
    return { valid: false, reason: "MISSING_APPROVAL_COMMENT_ID" };
  }

  if (
    input.planCommentId !== undefined &&
    !isPositiveSafeInteger(input.planCommentId)
  ) {
    return { valid: false, reason: "INVALID_PLAN_COMMENT_ID" };
  }

  if (!input.approvedAt) {
    return { valid: false, reason: "MISSING_APPROVED_AT" };
  }

  if (!isZonedIsoDateTime(input.approvedAt)) {
    return { valid: false, reason: "INVALID_APPROVED_AT" };
  }

  const approvedDate = new Date(input.approvedAt);

  if (Number.isNaN(approvedDate.getTime())) {
    return { valid: false, reason: "INVALID_APPROVED_AT" };
  }

  return {
    valid: true,
    snapshot: {
      approved_plan: input.planBody,
      approval_command: input.command,
      approver: input.approver,
      approval_comment_id: input.commentId,
      plan_comment_id:
        typeof input.planCommentId === "number" ? input.planCommentId : null,
      plan_label: input.planLabel ?? null,
      approved_at: input.approvedAt,
      article_date: toShanghaiDate(approvedDate),
    },
  };
}

function isPositiveSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function isZonedIsoDateTime(value: string): boolean {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(
      value,
    );

  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);

  if (hour > 23 || minute > 59 || second > 59) {
    return false;
  }

  if (zone !== "Z") {
    const zoneHour = Number(zone.slice(1, 3));
    const zoneMinute = Number(zone.slice(4, 6));

    if (zoneHour > 23 || zoneMinute > 59) {
      return false;
    }
  }

  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  return (
    calendarDate.getUTCFullYear() === year &&
    calendarDate.getUTCMonth() === month - 1 &&
    calendarDate.getUTCDate() === day
  );
}

/** 按 `Asia/Shanghai` 时区把批准时间映射为 `YYYY-MM-DD` 文章日期。 */
function toShanghaiDate(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}
