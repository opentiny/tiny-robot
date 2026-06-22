import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const cliPath = path.join(repositoryRoot, "src/cli.ts");
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
const terminalStatePath = path.join(repositoryRoot, "tests/fixtures/state-terminal.json");
const headMismatchStatePath = path.join(
  repositoryRoot,
  "tests/fixtures/state-head-mismatch.json"
);

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
}

describe("article-hub plan/state CLI", () => {
  test("plan hash 输出当前计划版本和稳定 Hash", () => {
    const first = runCli(["--dry-run", "plan", "hash", "--plan-file", currentPlanPath]);
    const second = runCli(["plan", "hash", "--plan-file", reorderedPlanPath]);

    expect(first.status).toBe(0);
    expect(second.status).toBe(0);
    expect(first.stderr).toBe("");
    expect(second.stderr).toBe("");

    const firstOutput = JSON.parse(first.stdout);
    const secondOutput = JSON.parse(second.stdout);

    expect(firstOutput).toMatchObject({
      ok: true,
      schema_version: "article-hub.plan.hash",
      dry_run: true,
      plan_version: 2
    });
    expect(secondOutput.plan_hash).toBe(firstOutput.plan_hash);
    expect(secondOutput.plan_hash_prefix).toBe(firstOutput.plan_hash_prefix);
  });

  test("plan compare 区分展示变化和语义变化", () => {
    const displayOnly = runCli([
      "plan",
      "compare",
      "--previous",
      currentPlanPath,
      "--current",
      reorderedPlanPath
    ]);
    const semantic = runCli([
      "plan",
      "compare",
      "--previous",
      currentPlanPath,
      "--current",
      semanticChangePlanPath
    ]);

    expect(displayOnly.status).toBe(0);
    expect(semantic.status).toBe(0);

    expect(JSON.parse(displayOnly.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.plan.compare",
      semantic_changed: false,
      suggested_plan_version: 2
    });
    expect(JSON.parse(semantic.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.plan.compare",
      semantic_changed: true,
      suggested_plan_version: 3
    });
  });

  test("plan approve 接受当前版本与 Hash，并拒绝 Hash mismatch", () => {
    const hash = runCli(["plan", "hash", "--plan-file", currentPlanPath]);
    const hashOutput = JSON.parse(hash.stdout);
    const approved = runCli([
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
    const rejected = runCli([
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

    expect(approved.status).toBe(0);
    expect(rejected.status).toBe(0);
    expect(JSON.parse(approved.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.plan.approve",
      valid: true,
      snapshot: {
        plan_version: 2,
        plan_hash_prefix: hashOutput.plan_hash_prefix,
        approver: "maintainer",
        approval_comment_id: 1001,
        article_date: "2026-06-18"
      }
    });
    expect(JSON.parse(rejected.stdout)).toMatchObject({
      ok: true,
      valid: false,
      reason: "PLAN_HASH_MISMATCH"
    });
  });

  test("state decide 输出暂停、终止清理和 Head SHA guard 决策", () => {
    const paused = runCli(["state", "decide", "--state-file", pausedStatePath]);
    const terminal = runCli(["state", "decide", "--state-file", terminalStatePath]);
    const headMismatch = runCli([
      "state",
      "decide",
      "--state-file",
      headMismatchStatePath
    ]);

    expect(JSON.parse(paused.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.state.decide",
      decision: {
        mutation_allowed: false,
        blocked_reason: "AI_PAUSED"
      }
    });
    expect(JSON.parse(terminal.stdout)).toMatchObject({
      ok: true,
      decision: {
        mutation_allowed: true,
        blocked_reason: null,
        labels_to_remove: ["AI：处理中", "AI：等待人工"]
      }
    });
    expect(JSON.parse(headMismatch.stdout)).toMatchObject({
      ok: true,
      decision: {
        mutation_allowed: false,
        blocked_reason: "HEAD_SHA_MISMATCH"
      }
    });
  });
});
