import { describe, expect, test } from "vitest";

import { approveWritingPlan } from "../../src/domain/plan.js";

const planBody =
  "## 写作计划（第 2 版）\n\n目标：介绍 webmcp-sdk 五分钟接入流程";

describe("writing plan approval", () => {
  test("精确批准命令产出无 Hash 快照", () => {
    const result = approveWritingPlan({
      planBody,
      command: "/ai 批准写作计划",
      approver: "maintainer",
      commentId: 1001,
      approvedAt: "2026-06-18T20:30:00+08:00",
      planCommentId: 900,
      planLabel: "第 2 版",
    });

    expect(result.valid).toBe(true);
    if (!result.valid) {
      throw new Error("approval should be valid");
    }

    expect(result.snapshot).toEqual({
      approved_plan: planBody,
      approval_command: "/ai 批准写作计划",
      approver: "maintainer",
      approval_comment_id: 1001,
      plan_comment_id: 900,
      plan_label: "第 2 版",
      approved_at: "2026-06-18T20:30:00+08:00",
      article_date: "2026-06-18",
    });
  });

  test("缺省可选参数时 plan_comment_id 与 plan_label 为 null", () => {
    const result = approveWritingPlan({
      planBody,
      command: "/ai 批准写作计划",
      approver: "maintainer",
      commentId: 1001,
      approvedAt: "2026-06-18T20:30:00+08:00",
    });

    expect(result.valid).toBe(true);
    if (!result.valid) {
      throw new Error("approval should be valid");
    }
    expect(result.snapshot.plan_comment_id).toBeNull();
    expect(result.snapshot.plan_label).toBeNull();
  });

  test.each([
    {
      name: "非批准命令",
      command: "/ai 状态",
      expectedReason: "INVALID_APPROVAL_COMMAND",
    },
    {
      name: "携带参数的旧命令",
      command: "/ai 批准写作计划 2 a1b2c3d4",
      expectedReason: "INVALID_APPROVAL_COMMAND",
    },
  ])("$name 时拒绝并返回稳定 reason", ({ command, expectedReason }) => {
    const result = approveWritingPlan({
      planBody,
      command,
      approver: "maintainer",
      commentId: 1001,
      approvedAt: "2026-06-18T20:30:00+08:00",
    });

    expect(result).toEqual({ valid: false, reason: expectedReason });
  });

  test.each([
    {
      approver: "",
      commentId: 1001,
      approvedAt: "2026-06-18T20:30:00+08:00",
      expectedReason: "MISSING_APPROVER",
    },
    {
      approver: "maintainer",
      commentId: undefined,
      approvedAt: "2026-06-18T20:30:00+08:00",
      expectedReason: "MISSING_APPROVAL_COMMENT_ID",
    },
    {
      approver: "maintainer",
      commentId: 1001,
      approvedAt: "",
      expectedReason: "MISSING_APPROVED_AT",
    },
    {
      approver: "maintainer",
      commentId: 1001,
      approvedAt: "not-a-date",
      expectedReason: "INVALID_APPROVED_AT",
    },
  ])("批准元数据缺失或非法时拒绝：$expectedReason", (meta) => {
    const result = approveWritingPlan({
      planBody,
      command: "/ai 批准写作计划",
      approver: meta.approver,
      commentId: meta.commentId,
      approvedAt: meta.approvedAt,
    });

    expect(result).toEqual({ valid: false, reason: meta.expectedReason });
  });
});
