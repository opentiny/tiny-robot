import { describe, expect, test } from "vitest";

import { decideStateMutation } from "../../src/domain/state-machine.js";

describe("decideStateMutation", () => {
  test("人工暂停保留等待人工状态并增加暂停信号", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：等待人工"],
      intent: { kind: "pause" }
    });

    expect(decision).toMatchObject({
      mutationAllowed: true,
      blockedReason: null,
      labelsToRemove: [],
      labelsToAdd: ["AI执行：人工暂停"]
    });
  });

  test("重复暂停返回成功 no-op", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：等待人工", "AI执行：人工暂停"],
      intent: { kind: "pause" }
    });

    expect(decision).toMatchObject({
      mutationAllowed: true,
      blockedReason: null,
      labelsToRemove: [],
      labelsToAdd: []
    });
  });

  test("终止或完成状态必须清理 AI 活动状态", () => {
    const decision = decideStateMutation({
      labels: ["阶段：已终止", "AI：处理中", "AI：旧状态", "AI：等待人工", "其他"],
      intent: { kind: "reconcile" }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToRemove).toHaveLength(3);
    expect(decision.labelsToRemove).toEqual(
      expect.arrayContaining(["AI：处理中", "AI：旧状态", "AI：等待人工"])
    );
    expect(decision.labelsToAdd).toEqual([]);
  });

  test("Head SHA 不一致时阻断 mutation", () => {
    expect(
      decideStateMutation({
        labels: ["阶段：审核", "AI：处理中"],
        intent: {
          kind: "content-transition",
          targetPhase: "阶段：审核",
          targetAiStatus: "AI：等待人工"
        },
        expectedHeadSha: "a".repeat(40),
        currentHeadSha: "b".repeat(40)
      })
    ).toMatchObject({
      mutationAllowed: false,
      blockedReason: "HEAD_SHA_MISMATCH"
    });
  });
});
