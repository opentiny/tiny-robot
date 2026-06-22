import { mkdir, mkdtemp, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  expectErrorEnvelope,
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";

const configPath = path.join(repositoryRoot, "config/projects.yml");

interface DoctorOutput {
  checks: Array<{ name: string }>;
}

interface ReconcileOutput {
  mutation_plan: {
    operations: Array<{ kind: string; branch?: string }>;
  };
}

describe("article-hub maintenance CLI", () => {
  test("doctor dry-run reports required local structure checks", () => {
    const result = runArticleHubCli([
      "--dry-run",
      "doctor",
      "--root",
      repositoryRoot,
      "--config",
      configPath
    ]);

    const output = expectSuccessfulEnvelope<DoctorOutput>(
      result,
      "article-hub.doctor",
      {
        dry_run: true,
        root: repositoryRoot
      }
    );
    expect(output.checks.map((check) => check.name)).toEqual(
      expect.arrayContaining(["node-version", "project-config", "skills"])
    );
  });

  test("setup requires --yes for writes and creates the local skeleton", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-setup-"));
    const dryRun = runArticleHubCli(["--dry-run", "setup", "--root", root]);

    expectSuccessfulEnvelope(dryRun, "article-hub.setup", {
      dry_run: true,
      applied: false
    });

    await expect(stat(path.join(root, "articles"))).rejects.toMatchObject({
      code: "ENOENT"
    });

    const blocked = runArticleHubCli(["setup", "--root", root]);

    expectErrorEnvelope(blocked, "CONFIRMATION_REQUIRED", 2);

    const applied = runArticleHubCli(["setup", "--root", root, "--yes"]);

    expectSuccessfulEnvelope(applied, "article-hub.setup", {
      applied: true
    });
    const articlesStat = await stat(path.join(root, "articles"));
    expect(articlesStat.isDirectory()).toBe(true);
    const materialsReadmeStat = await stat(path.join(root, "materials/README.md"));
    expect(materialsReadmeStat.isFile()).toBe(true);
  });

  test("reconcile dry-run plans recovery for branch-created PR-missing state", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-reconcile-"));
    const stateFile = path.join(root, "reconcile.json");

    await mkdir(root, { recursive: true });
    await writeJson(stateFile, {
      issue_number: 12,
      repository: "hexqi/ai-article-hub",
      branch: "article/12-webmcp-sdk-webmcp-sdk-practice",
      branch_exists: true,
      draft_pr_exists: false,
      labels: ["阶段：写作", "AI：处理中"]
    });

    const result = runArticleHubCli([
      "--dry-run",
      "reconcile",
      "--state-file",
      stateFile
    ]);

    const output = expectSuccessfulEnvelope<ReconcileOutput>(
      result,
      "article-hub.reconcile",
      {
        dry_run: true,
        recovery_required: true
      }
    );
    expect(output.mutation_plan.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "gh-pr-create",
          branch: "article/12-webmcp-sdk-webmcp-sdk-practice"
        }),
        expect.objectContaining({
          kind: "gh-issue-comment"
        })
      ])
    );
  });
});

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
