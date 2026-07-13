import { describe, expect, test } from "vitest";

import { isFixedWritingPlanApproval } from "../../src/domain/command-parser.js";

describe("isFixedWritingPlanApproval", () => {
  test("逐字匹配固定写作计划批准", () => {
    expect(isFixedWritingPlanApproval("/ai 批准写作计划")).toBe(true);
  });

  test.each([
    "请开始写作",
    "/ai 批准选题",
    "/ai 状态",
    "/ai 暂停",
    "/ai 恢复",
    "/ai 重试",
    "/ai 请重试"
  ])(
    "其他显式请求和自然语言评论不构成固定写作计划批准：%s",
    (body) => {
      expect(isFixedWritingPlanApproval(body)).toBe(false);
    }
  );

  test.each([
    "/ai 批准写作计划 2 a1b2c3d4",
    "/ai 批准写作计划 ",
    " /ai 批准写作计划",
    "我批准 /ai 批准写作计划",
  ])("拒绝携带参数或近似的批准命令：%s", (body) => {
    expect(isFixedWritingPlanApproval(body)).toBe(false);
  });
});
