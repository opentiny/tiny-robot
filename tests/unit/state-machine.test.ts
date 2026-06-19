import { describe, expect, test } from "vitest";

import { decideStateMutation } from "../../src/domain/state-machine.js";

describe("decideStateMutation", () => {
  test("AI：已暂停 时阻断任何 mutation", () => {
    expect(
      decideStateMutation({
        labels: ["阶段：写作", "AI：已暂停"],
        expectedHeadSha: "a".repeat(40),
        currentHeadSha: "a".repeat(40)
      })
    ).toEqual({
      mutationAllowed: false,
      blockedReason: "AI_PAUSED",
      labelsToRemove: [],
      labelsToAdd: []
    });
  });

  test("终止或完成状态必须清理 AI 活动状态", () => {
    expect(
      decideStateMutation({
        labels: ["阶段：已终止", "AI：处理中", "AI：旧状态", "AI：等待人工", "其他"],
        expectedHeadSha: "a".repeat(40),
        currentHeadSha: "a".repeat(40)
      })
    ).toEqual({
      mutationAllowed: true,
      blockedReason: null,
      labelsToRemove: ["AI：处理中", "AI：旧状态", "AI：等待人工"],
      labelsToAdd: []
    });
  });

  test("Head SHA 不一致时阻断 mutation", () => {
    expect(
      decideStateMutation({
        labels: ["阶段：审核", "AI：处理中"],
        expectedHeadSha: "a".repeat(40),
        currentHeadSha: "b".repeat(40)
      })
    ).toMatchObject({
      mutationAllowed: false,
      blockedReason: "HEAD_SHA_MISMATCH"
    });
  });
});
