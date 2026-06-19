import { createHash } from "node:crypto";

import { ArticleHubError } from "../infrastructure/errors.js";
import { parseAiCommand } from "./command-parser.js";

export type PlanApprovalReason =
  | "INVALID_APPROVAL_COMMAND"
  | "PLAN_VERSION_MISMATCH"
  | "PLAN_HASH_MISMATCH"
  | "MISSING_APPROVER"
  | "MISSING_APPROVAL_COMMENT_ID"
  | "MISSING_APPROVED_AT"
  | "INVALID_APPROVED_AT";

export interface PlanDigest {
  planVersion: number;
  planHash: string;
  planHashPrefix: string;
  semanticPayload: unknown;
  canonicalSemanticJson: string;
}

export interface PlanComparison {
  semanticChanged: boolean;
  suggestedPlanVersion: number;
  previous: PlanDigest;
  current: PlanDigest;
}

export interface ApproveWritingPlanInput {
  plan: unknown;
  command: string;
  approver: string;
  commentId?: number;
  approvedAt: string;
}

export interface WritingPlanApprovalSnapshot {
  plan_version: number;
  plan_hash: string;
  plan_hash_prefix: string;
  approval_command: string;
  approver: string;
  approval_comment_id: number;
  approved_at: string;
  article_date: string;
  canonical_semantic_payload_hash: string;
  canonical_semantic_payload: unknown;
}

export type WritingPlanApprovalResult =
  | {
      valid: true;
      snapshot: WritingPlanApprovalSnapshot;
    }
  | {
      valid: false;
      reason: PlanApprovalReason;
    };

const excludedSemanticKeys = new Set([
  "created_at",
  "updated_at",
  "generated_at",
  "display_markdown",
  "display",
  "hash",
  "hash_prefix",
  "plan_hash",
  "plan_hash_prefix",
  "plan_version"
]);

/**
 * 生成写作计划的语义摘要和 SHA-256 Hash。
 *
 * `plan_version` 由批准命令单独校验；排除它可避免仅补写版本号导致内容 Hash 改变。
 */
export function createPlanDigest(plan: unknown): PlanDigest {
  const planVersion = readPlanVersion(plan);
  const semanticPayload = normalizeSemanticPayload(plan);
  const canonicalSemanticJson = canonicalJson(semanticPayload);
  const planHash = createHash("sha256").update(canonicalSemanticJson).digest("hex");

  return {
    planVersion,
    planHash,
    planHashPrefix: planHash.slice(0, 8),
    semanticPayload,
    canonicalSemanticJson
  };
}

/**
 * 比较两个写作计划的语义内容，并给出下一版计划号建议。
 */
export function compareWritingPlans(previous: unknown, current: unknown): PlanComparison {
  const previousDigest = createPlanDigest(previous);
  const currentDigest = createPlanDigest(current);
  const semanticChanged = previousDigest.planHash !== currentDigest.planHash;

  return {
    semanticChanged,
    suggestedPlanVersion: semanticChanged
      ? previousDigest.planVersion + 1
      : previousDigest.planVersion,
    previous: previousDigest,
    current: currentDigest
  };
}

/**
 * 校验固定写作计划批准命令，并生成不可变批准快照。
 */
export function approveWritingPlan(input: ApproveWritingPlanInput): WritingPlanApprovalResult {
  const parsed = parseAiCommand(input.command);

  if (parsed?.kind !== "approve-writing-plan") {
    return { valid: false, reason: "INVALID_APPROVAL_COMMAND" };
  }

  const digest = createPlanDigest(input.plan);

  if (parsed.planVersion !== digest.planVersion) {
    return { valid: false, reason: "PLAN_VERSION_MISMATCH" };
  }

  if (parsed.hashPrefix !== digest.planHashPrefix) {
    return { valid: false, reason: "PLAN_HASH_MISMATCH" };
  }

  if (!input.approver) {
    return { valid: false, reason: "MISSING_APPROVER" };
  }

  if (typeof input.commentId !== "number" || !Number.isSafeInteger(input.commentId)) {
    return { valid: false, reason: "MISSING_APPROVAL_COMMENT_ID" };
  }

  if (!input.approvedAt) {
    return { valid: false, reason: "MISSING_APPROVED_AT" };
  }

  const approvedDate = new Date(input.approvedAt);

  if (Number.isNaN(approvedDate.getTime())) {
    return { valid: false, reason: "INVALID_APPROVED_AT" };
  }

  return {
    valid: true,
    snapshot: {
      plan_version: digest.planVersion,
      plan_hash: digest.planHash,
      plan_hash_prefix: digest.planHashPrefix,
      approval_command: input.command,
      approver: input.approver,
      approval_comment_id: input.commentId,
      approved_at: input.approvedAt,
      article_date: toShanghaiDate(approvedDate),
      canonical_semantic_payload_hash: digest.planHash,
      canonical_semantic_payload: deepClone(digest.semanticPayload)
    }
  };
}

function readPlanVersion(plan: unknown): number {
  if (plan === null || typeof plan !== "object") {
    throw new ArticleHubError("INVALID_PLAN", "写作计划必须是 JSON object");
  }

  const version = (plan as { plan_version?: unknown }).plan_version;

  if (!Number.isSafeInteger(version) || (version as number) < 1) {
    throw new ArticleHubError("INVALID_PLAN", "写作计划缺少有效 plan_version");
  }

  return version as number;
}

function normalizeSemanticPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeSemanticPayload(item));
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !excludedSemanticKeys.has(key))
      .sort(([left], [right]) => left.localeCompare(right));

    return Object.fromEntries(
      entries.map(([key, entryValue]) => [key, normalizeSemanticPayload(entryValue)])
    );
  }

  return value;
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(value);
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toShanghaiDate(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}
