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

  test("暂停处理中任务时退回等待执行", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：处理中"],
      intent: { kind: "pause" }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToRemove).toEqual(expect.arrayContaining(["AI：处理中"]));
    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining(["AI：等待执行", "AI执行：人工暂停"])
    );
  });

  test("恢复只移除人工暂停信号", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：等待人工", "AI执行：人工暂停"],
      intent: { kind: "resume" }
    });

    expect(decision).toMatchObject({
      mutationAllowed: true,
      blockedReason: null,
      labelsToRemove: ["AI执行：人工暂停"],
      labelsToAdd: []
    });
  });

  test("恢复拒绝仍标记为处理中的暂停状态", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：处理中", "AI执行：人工暂停"],
      intent: { kind: "resume" }
    });

    expect(decision).toMatchObject({
      mutationAllowed: false,
      blockedReason: "INVALID_CURRENT_STATE"
    });
  });

  test("重复恢复返回成功 no-op", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：等待人工"],
      intent: { kind: "resume" }
    });

    expect(decision).toMatchObject({
      mutationAllowed: true,
      blockedReason: null,
      labelsToRemove: [],
      labelsToAdd: []
    });
  });

  test("人工暂停优先阻断内容状态推进", () => {
    const decision = decideStateMutation({
      labels: ["阶段：策划", "AI：等待人工", "AI执行：人工暂停"],
      intent: {
        kind: "content-transition",
        targetPhase: "阶段：写作",
        targetAiStatus: "AI：等待执行"
      }
    });

    expect(decision).toMatchObject({
      mutationAllowed: false,
      blockedReason: "AI_PAUSED",
      labelsToRemove: [],
      labelsToAdd: []
    });
  });

  test("人工暂停优先于 Head SHA mismatch", () => {
    const decision = decideStateMutation({
      labels: ["阶段：审核", "AI：等待人工", "AI执行：人工暂停"],
      intent: {
        kind: "content-transition",
        targetPhase: "阶段：审核",
        targetAiStatus: "AI：等待执行"
      },
      expectedHeadSha: "a".repeat(40),
      currentHeadSha: "b".repeat(40)
    });

    expect(decision).toMatchObject({
      mutationAllowed: false,
      blockedReason: "AI_PAUSED"
    });
  });

  test("批准写作计划时从策划进入写作等待执行", () => {
    const decision = decideStateMutation({
      labels: ["阶段：策划", "AI：等待人工"],
      intent: {
        kind: "content-transition",
        targetPhase: "阶段：写作",
        targetAiStatus: "AI：等待执行"
      }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToRemove).toEqual(
      expect.arrayContaining(["阶段：策划", "AI：等待人工"])
    );
    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining(["阶段：写作", "AI：等待执行"])
    );
  });

  test("批准选题时从选题进入策划等待执行", () => {
    const decision = decideStateMutation({
      labels: ["阶段：选题", "AI：等待人工"],
      intent: {
        kind: "content-transition",
        targetPhase: "阶段：策划",
        targetAiStatus: "AI：等待执行"
      }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining(["阶段：策划", "AI：等待执行"])
    );
  });

  test("执行器认领时允许同阶段进入处理中", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：等待执行"],
      intent: {
        kind: "content-transition",
        targetPhase: "阶段：写作",
        targetAiStatus: "AI：处理中"
      }
    });

    expect(decision).toMatchObject({
      mutationAllowed: true,
      blockedReason: null,
      labelsToRemove: ["AI：等待执行"],
      labelsToAdd: ["AI：处理中"]
    });
  });

  test("内容 intent 拒绝未列出的阶段边", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：等待人工"],
      intent: {
        kind: "content-transition",
        targetPhase: "阶段：选题",
        targetAiStatus: "AI：等待人工"
      }
    });

    expect(decision).toMatchObject({
      mutationAllowed: false,
      blockedReason: "INVALID_TRANSITION"
    });
  });

  test("暂停期间仍允许合并进入待发布并清理 AI 状态", () => {
    const decision = decideStateMutation({
      labels: ["阶段：审核", "AI：等待人工", "AI执行：人工暂停"],
      intent: {
        kind: "lifecycle-transition",
        targetPhase: "阶段：待发布"
      }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToRemove).toEqual(
      expect.arrayContaining(["阶段：审核", "AI：等待人工", "AI执行：人工暂停"])
    );
    expect(decision.labelsToAdd).toEqual(["阶段：待发布"]);
  });

  test("暂停期间回到写作阶段时保持人工暂停", () => {
    const decision = decideStateMutation({
      labels: ["阶段：审核", "AI：等待人工", "AI执行：人工暂停"],
      intent: {
        kind: "lifecycle-transition",
        targetPhase: "阶段：写作",
        targetAiStatus: "AI：等待人工"
      }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToAdd).toEqual(expect.arrayContaining(["阶段：写作"]));
    expect(decision.labelsToRemove).not.toContain("AI执行：人工暂停");
  });

  test("Ready for review 时从写作进入审核", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：等待人工"],
      intent: {
        kind: "lifecycle-transition",
        targetPhase: "阶段：审核",
        targetAiStatus: "AI：等待人工"
      }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToAdd).toContain("阶段：审核");
  });

  test("活跃阶段可以进入已终止并清理 AI 状态", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：等待人工"],
      intent: {
        kind: "lifecycle-transition",
        targetPhase: "阶段：已终止"
      }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToAdd).toEqual(["阶段：已终止"]);
    expect(decision.labelsToRemove).toEqual(
      expect.arrayContaining(["阶段：写作", "AI：等待人工"])
    );
  });

  test("发布完成时从待发布进入已发布", () => {
    const decision = decideStateMutation({
      labels: ["阶段：待发布"],
      intent: {
        kind: "lifecycle-transition",
        targetPhase: "阶段：已发布"
      }
    });

    expect(decision).toMatchObject({
      mutationAllowed: true,
      blockedReason: null,
      labelsToRemove: ["阶段：待发布"],
      labelsToAdd: ["阶段：已发布"]
    });
  });

  test("已终止 Issue reopen 后回到策划等待人工", () => {
    const decision = decideStateMutation({
      labels: ["阶段：已终止"],
      intent: {
        kind: "lifecycle-transition",
        targetPhase: "阶段：策划",
        targetAiStatus: "AI：等待人工"
      }
    });

    expect(decision.mutationAllowed).toBe(true);
    expect(decision.labelsToAdd).toEqual(
      expect.arrayContaining(["阶段：策划", "AI：等待人工"])
    );
  });

  test("重试只把失败状态改为等待执行", () => {
    const allowedDecision = decideStateMutation({
      labels: ["阶段：审核", "AI：失败"],
      intent: { kind: "retry" }
    });
    const rejectedDecision = decideStateMutation({
      labels: ["阶段：审核", "AI：等待人工"],
      intent: { kind: "retry" }
    });

    expect(allowedDecision).toMatchObject({
      mutationAllowed: true,
      blockedReason: null,
      labelsToRemove: ["AI：失败"],
      labelsToAdd: ["AI：等待执行"]
    });
    expect(rejectedDecision).toMatchObject({
      mutationAllowed: false,
      blockedReason: "INVALID_TRANSITION"
    });
  });

  test("人工暂停时重试保持阻断", () => {
    const decision = decideStateMutation({
      labels: ["阶段：审核", "AI：失败", "AI执行：人工暂停"],
      intent: { kind: "retry" }
    });

    expect(decision).toMatchObject({
      mutationAllowed: false,
      blockedReason: "AI_PAUSED"
    });
  });

  test("活跃阶段存在多个 AI 工作状态时拒绝 mutation", () => {
    const decision = decideStateMutation({
      labels: ["阶段：写作", "AI：处理中", "AI：等待人工"],
      intent: { kind: "pause" }
    });

    expect(decision).toMatchObject({
      mutationAllowed: false,
      blockedReason: "INVALID_CURRENT_STATE",
      labelsToRemove: [],
      labelsToAdd: []
    });
  });

  test("合法活跃状态 reconcile 返回 no-op", () => {
    const decision = decideStateMutation({
      labels: ["阶段：策划", "AI：等待人工"],
      intent: { kind: "reconcile" }
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
