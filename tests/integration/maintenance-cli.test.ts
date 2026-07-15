import { mkdir, mkdtemp, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  expectErrorEnvelope,
  expectSuccessfulEnvelope,
  parseJsonStdout,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";
import { createFakeGh, FAKE_DEFAULT_REPOSITORY } from "../support/fake-gh.js";

const configPath = path.join(repositoryRoot, "config/projects.yml");

interface DoctorOutput {
  ok: boolean;
  checks: Array<{ name: string; ok: boolean }>;
}

interface ReconcileOutput {
  mutation_plan: {
    operations: Array<{ kind: string; branch?: string }>;
  };
}

function createHealthyDoctorEnv(fakeGhEnv: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const fakeCommand = fakeGhEnv.ARTICLE_HUB_GH_COMMAND;

  return {
    ...fakeGhEnv,
    // Windows 环境变量大小写不敏感但保留原键名，两个常见写法必须使用同一值。
    ComSpec: "cmd.exe",
    COMSPEC: "cmd.exe",
    ARTICLE_HUB_COREPACK_COMMAND: fakeCommand,
    ARTICLE_HUB_CMD_EXE_COMMAND: fakeCommand
  };
}

describe("article-hub maintenance CLI", () => {
  test("doctor 在必需环境项缺失时返回失败", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-doctor-"));
    const fakeGh = await createFakeGh({});
    const result = runArticleHubCli(
      ["doctor", "--root", root, "--config", configPath],
      { env: createHealthyDoctorEnv(fakeGh.env) }
    );
    const output = parseJsonStdout<DoctorOutput>(result);

    expect(result.status).toBe(2);
    expect(output).toMatchObject({
      ok: false,
      schema_version: "article-hub.doctor"
    });
    expect(output.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "launcher", ok: false }),
        expect.objectContaining({ name: "agent-skills", ok: false })
      ])
    );
  });

  test("doctor dry-run reports required local structure checks", async () => {
    const fakeGh = await createFakeGh({});
    const result = runArticleHubCli(
      ["--dry-run", "doctor", "--root", repositoryRoot, "--config", configPath],
      { env: createHealthyDoctorEnv(fakeGh.env) }
    );

    const output = expectSuccessfulEnvelope<DoctorOutput>(
      result,
      "article-hub.doctor",
      {
        dry_run: true,
        root: repositoryRoot
      }
    );
    expect(output.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "node-version", ok: true }),
        expect.objectContaining({ name: "pnpm-version", ok: true }),
        expect.objectContaining({ name: "project-config", ok: true }),
        expect.objectContaining({ name: "agent-skills", ok: true }),
        expect.objectContaining({ name: "claude-skills", ok: true }),
        expect.objectContaining({ name: "launcher", ok: true }),
        expect.objectContaining({ name: "github-auth", ok: true })
      ])
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
      repository: FAKE_DEFAULT_REPOSITORY,
      branch: "article/12-webmcp-sdk-webmcp-sdk-practice",
      branch_exists: true,
      draft_pr_exists: false,
      labels: ["阶段：写作", "AI：处理中"]
    });

    const fakeGh = await createFakeGh({ number: 12, labels: [] });
    const result = runArticleHubCli(
      ["--dry-run", "reconcile", "--state-file", stateFile],
      { env: fakeGh.env }
    );

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
    await expect(fakeGh.readCalls()).resolves.toEqual([]);
  });

  test("reconcile 非 dry-run 遇到恢复计划时失败", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-reconcile-"));
    const stateFile = path.join(root, "reconcile.json");

    await mkdir(root, { recursive: true });
    await writeJson(stateFile, {
      issue_number: 12,
      repository: FAKE_DEFAULT_REPOSITORY,
      branch: "article/12-webmcp-sdk-webmcp-sdk-practice",
      branch_exists: true,
      draft_pr_exists: false,
      labels: ["阶段：写作", "AI：处理中"]
    });

    const result = runArticleHubCli(["reconcile", "--state-file", stateFile]);

    expectErrorEnvelope(result, "RECONCILE_APPLY_UNSUPPORTED", 2);
  });

  test("reconcile 非 dry-run 无恢复计划时成功", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-reconcile-"));
    const stateFile = path.join(root, "reconcile.json");

    await mkdir(root, { recursive: true });
    await writeJson(stateFile, {
      issue_number: 12,
      repository: FAKE_DEFAULT_REPOSITORY,
      branch: "article/12-webmcp-sdk-webmcp-sdk-practice",
      branch_exists: true,
      draft_pr_exists: true,
      labels: ["阶段：写作", "AI：处理中"]
    });

    const result = runArticleHubCli(["reconcile", "--state-file", stateFile]);

    expectSuccessfulEnvelope(result, "article-hub.reconcile", {
      dry_run: false,
      recovery_required: false,
      mutation_plan: {
        operations: []
      }
    });
  });
});

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
