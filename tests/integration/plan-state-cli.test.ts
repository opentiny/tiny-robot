import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";

const currentPlanPath = path.join(repositoryRoot, "tests/fixtures/plan-current.json");
const reorderedPlanPath = path.join(
  repositoryRoot,
  "tests/fixtures/plan-current-reordered.json"
);
const semanticChangePlanPath = path.join(
  repositoryRoot,
  "tests/fixtures/plan-semantic-change.json"
);
const pausedStatePath = path.join(repositoryRoot, "tests/fixtures/state-paused.json");

interface PlanHashOutput {
  plan_hash: string;
  plan_hash_prefix: string;
}

interface PlanApprovalOutput {
  valid: boolean;
  reason?: string;
  snapshot?: {
    plan_version: number;
    plan_hash_prefix: string;
    approver: string;
    approval_comment_id: number;
    article_date: string;
  };
}

describe("article-hub plan/state CLI", () => {
  test("plan hash 输出当前计划版本和稳定 Hash", () => {
    const first = runArticleHubCli([
      "--dry-run",
      "plan",
      "hash",
      "--plan-file",
      currentPlanPath
    ]);
    const second = runArticleHubCli(["plan", "hash", "--plan-file", reorderedPlanPath]);

    const firstOutput = expectSuccessfulEnvelope<PlanHashOutput>(
      first,
      "article-hub.plan.hash",
      {
        dry_run: true,
        plan_version: 2
      }
    );
    const secondOutput = expectSuccessfulEnvelope<PlanHashOutput>(
      second,
      "article-hub.plan.hash"
    );
    expect(secondOutput.plan_hash).toBe(firstOutput.plan_hash);
    expect(secondOutput.plan_hash_prefix).toBe(firstOutput.plan_hash_prefix);
  });

  test("plan compare 区分展示变化和语义变化", () => {
    const displayOnly = runArticleHubCli([
      "plan",
      "compare",
      "--previous",
      currentPlanPath,
      "--current",
      reorderedPlanPath
    ]);
    const semantic = runArticleHubCli([
      "plan",
      "compare",
      "--previous",
      currentPlanPath,
      "--current",
      semanticChangePlanPath
    ]);

    expectSuccessfulEnvelope(displayOnly, "article-hub.plan.compare", {
      semantic_changed: false,
      suggested_plan_version: 2
    });
    expectSuccessfulEnvelope(semantic, "article-hub.plan.compare", {
      semantic_changed: true,
      suggested_plan_version: 3
    });
  });

  test("plan approve 接受当前版本与 Hash", () => {
    const hash = runArticleHubCli(["plan", "hash", "--plan-file", currentPlanPath]);
    const hashOutput = expectSuccessfulEnvelope<PlanHashOutput>(
      hash,
      "article-hub.plan.hash"
    );
    const approved = runArticleHubCli([
      "plan",
      "approve",
      "--plan-file",
      currentPlanPath,
      "--command",
      `/ai 批准写作计划 2 ${hashOutput.plan_hash_prefix}`,
      "--approver",
      "maintainer",
      "--comment-id",
      "1001",
      "--approved-at",
      "2026-06-18T20:30:00+08:00"
    ]);

    expectSuccessfulEnvelope<PlanApprovalOutput>(
      approved,
      "article-hub.plan.approve",
      {
        valid: true,
        snapshot: {
          plan_version: 2,
          plan_hash_prefix: hashOutput.plan_hash_prefix,
          approver: "maintainer",
          approval_comment_id: 1001,
          article_date: "2026-06-18"
        }
      }
    );
  });

  test("plan approve 拒绝 Hash mismatch", () => {
    const rejected = runArticleHubCli([
      "plan",
      "approve",
      "--plan-file",
      currentPlanPath,
      "--command",
      "/ai 批准写作计划 2 deadbeef",
      "--approver",
      "maintainer",
      "--comment-id",
      "1001",
      "--approved-at",
      "2026-06-18T20:30:00+08:00"
    ]);

    expectSuccessfulEnvelope<PlanApprovalOutput>(
      rejected,
      "article-hub.plan.approve",
      {
        valid: false,
        reason: "PLAN_HASH_MISMATCH"
      }
    );
  });

  test("state decide 读取状态文件并输出阻断决策", () => {
    const paused = runArticleHubCli(["state", "decide", "--state-file", pausedStatePath]);

    expectSuccessfulEnvelope(paused, "article-hub.state.decide", {
      decision: {
        mutation_allowed: false,
        blocked_reason: "AI_PAUSED",
        labels_to_remove: [],
        labels_to_add: []
      }
    });
  });
});
