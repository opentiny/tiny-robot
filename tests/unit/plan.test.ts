import { describe, expect, test } from "vitest";

import {
  approveWritingPlan,
  compareWritingPlans,
  createPlanDigest
} from "../../src/domain/plan.js";

const basePlan = {
  plan_version: 2,
  created_at: "2026-06-18T10:00:00+08:00",
  display_markdown: "展示文本",
  project: "webmcp-sdk",
  goal: "介绍 webmcp-sdk 五分钟接入流程",
  outline: [
    {
      title: "五分钟接入",
      points: ["安装", "初始化", "验证"]
    }
  ]
};

describe("writing plan digest", () => {
  test("对象 key 顺序不同但语义相同，Hash 保持一致", () => {
    const first = createPlanDigest(basePlan);
    const second = createPlanDigest({
      outline: [
        {
          points: ["安装", "初始化", "验证"],
          title: "五分钟接入"
        }
      ],
      goal: "介绍 webmcp-sdk 五分钟接入流程",
      project: "webmcp-sdk",
      plan_version: 2
    });

    expect(second.planHash).toBe(first.planHash);
    expect(second.planHashPrefix).toBe(first.planHash.slice(0, 8));
  });

  test("展示字段、时间戳和历史 Hash 不参与 Hash", () => {
    const first = createPlanDigest(basePlan);
    const displayOnlyPlan = {
      ...basePlan,
      created_at: "2026-06-19T12:00:00+08:00",
      updated_at: "2026-06-19T13:00:00+08:00",
      display_markdown: "# 只改展示格式",
      hash: "ignored",
      hash_prefix: "ignored",
      plan_hash: "ignored",
      plan_hash_prefix: "ignored"
    };
    const second = createPlanDigest(displayOnlyPlan);

    expect(second.planHash).toBe(first.planHash);
    expect(compareWritingPlans(basePlan, displayOnlyPlan)).toMatchObject({
      semanticChanged: false,
      suggestedPlanVersion: 2
    });
  });

  test("语义字段变化会改变 Hash，并建议当前版本加一", () => {
    const current = {
      ...basePlan,
      goal: "解析 webmcp-sdk 初始化链路"
    };

    const comparison = compareWritingPlans(basePlan, current);

    expect(comparison.semanticChanged).toBe(true);
    expect(comparison.suggestedPlanVersion).toBe(3);
    expect(comparison.previous.planHash).not.toBe(comparison.current.planHash);
  });
});

describe("writing plan approval", () => {
  test("当前版本和正确 8 位 Hash 批准有效，并生成不可变快照", () => {
    const digest = createPlanDigest(basePlan);
    const result = approveWritingPlan({
      plan: basePlan,
      command: `/ai 批准写作计划 2 ${digest.planHashPrefix}`,
      approver: "maintainer",
      commentId: 1001,
      approvedAt: "2026-06-18T20:30:00+08:00"
    });

    expect(result.valid).toBe(true);
    if (!result.valid) {
      throw new Error("approval should be valid");
    }

    expect(result.snapshot).toMatchObject({
      plan_version: 2,
      plan_hash: digest.planHash,
      plan_hash_prefix: digest.planHashPrefix,
      approval_command: `/ai 批准写作计划 2 ${digest.planHashPrefix}`,
      approver: "maintainer",
      approval_comment_id: 1001,
      approved_at: "2026-06-18T20:30:00+08:00",
      article_date: "2026-06-18"
    });

    basePlan.goal = "后续 mutation 不应影响快照";

    expect(result.snapshot.canonical_semantic_payload).toMatchObject({
      goal: "介绍 webmcp-sdk 五分钟接入流程"
    });
  });

  test.each([
    {
      name: "非批准命令",
      command: "/ai 状态",
      expectedReason: "INVALID_APPROVAL_COMMAND"
    },
    {
      name: "过期版本",
      command: "/ai 批准写作计划 1 a1b2c3d4",
      expectedReason: "PLAN_VERSION_MISMATCH"
    },
    {
      name: "Hash 不匹配",
      command: "/ai 批准写作计划 2 deadbeef",
      expectedReason: "PLAN_HASH_MISMATCH"
    }
  ])("$name 时拒绝并返回稳定 reason", ({ command, expectedReason }) => {
    const result = approveWritingPlan({
      plan: basePlan,
      command,
      approver: "maintainer",
      commentId: 1001,
      approvedAt: "2026-06-18T20:30:00+08:00"
    });

    expect(result).toEqual({
      valid: false,
      reason: expectedReason
    });
  });

  test.each([
    {
      approver: "",
      commentId: 1001,
      approvedAt: "2026-06-18T20:30:00+08:00",
      expectedReason: "MISSING_APPROVER"
    },
    {
      approver: "maintainer",
      commentId: undefined,
      approvedAt: "2026-06-18T20:30:00+08:00",
      expectedReason: "MISSING_APPROVAL_COMMENT_ID"
    },
    {
      approver: "maintainer",
      commentId: 1001,
      approvedAt: "",
      expectedReason: "MISSING_APPROVED_AT"
    }
  ])("批准元数据缺失时拒绝：$expectedReason", (metadata) => {
    const digest = createPlanDigest(basePlan);
    const result = approveWritingPlan({
      plan: basePlan,
      command: `/ai 批准写作计划 2 ${digest.planHashPrefix}`,
      approver: metadata.approver,
      commentId: metadata.commentId,
      approvedAt: metadata.approvedAt
    });

    expect(result).toEqual({
      valid: false,
      reason: metadata.expectedReason
    });
  });
});
