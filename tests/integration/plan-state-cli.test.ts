import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, test } from "vitest";

import {
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli,
} from "../support/cli.js";

const pausedStatePath = path.join(
  repositoryRoot,
  "tests/fixtures/state-paused.json",
);

interface PlanApprovalOutput {
  valid: boolean;
  reason?: string;
  snapshot?: {
    approved_plan: string;
    approver: string;
    approval_comment_id: number;
    plan_comment_id: number | null;
    plan_label: string | null;
    article_date: string;
  };
}

describe("article-hub plan/state CLI", () => {
  let tempDir: string;
  let planBodyPath: string;

  beforeAll(() => {
    tempDir = mkdtempSync(path.join(tmpdir(), "article-hub-plan-"));
    planBodyPath = path.join(tempDir, "plan-body.md");
    writeFileSync(
      planBodyPath,
      "## 写作计划（第 2 版）\n\n目标：五分钟接入",
      "utf8",
    );
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("plan approve 接受精确命令并产出无 Hash 快照", () => {
    const approved = runArticleHubCli([
      "plan",
      "approve",
      "--plan-body-file",
      planBodyPath,
      "--command",
      "/ai 批准写作计划",
      "--approver",
      "maintainer",
      "--comment-id",
      "1001",
      "--approved-at",
      "2026-06-18T20:30:00+08:00",
    ]);

    const output = expectSuccessfulEnvelope<PlanApprovalOutput>(
      approved,
      "article-hub.plan.approve",
      {
        valid: true,
        snapshot: {
          approver: "maintainer",
          approval_comment_id: 1001,
          plan_comment_id: null,
          plan_label: null,
          article_date: "2026-06-18",
        },
      },
    );

    expect(output.snapshot?.approved_plan).toContain("写作计划");
    expect(output.snapshot).not.toHaveProperty("plan_hash");
    expect(output.snapshot).not.toHaveProperty("plan_version");
  });

  test("plan approve 拒绝携带参数的旧命令", () => {
    const rejected = runArticleHubCli([
      "plan",
      "approve",
      "--plan-body-file",
      planBodyPath,
      "--command",
      "/ai 批准写作计划 2 deadbeef",
      "--approver",
      "maintainer",
      "--comment-id",
      "1001",
      "--approved-at",
      "2026-06-18T20:30:00+08:00",
    ]);

    expectSuccessfulEnvelope<PlanApprovalOutput>(
      rejected,
      "article-hub.plan.approve",
      {
        valid: false,
        reason: "INVALID_APPROVAL_COMMAND",
      },
    );
  });

  test("state decide 读取状态文件并输出阻断决策", () => {
    const paused = runArticleHubCli([
      "state",
      "decide",
      "--state-file",
      pausedStatePath,
    ]);

    expectSuccessfulEnvelope(paused, "article-hub.state.decide", {
      decision: {
        mutation_allowed: false,
        blocked_reason: "AI_PAUSED",
        labels_to_remove: [],
        labels_to_add: [],
      },
    });
  });
});
