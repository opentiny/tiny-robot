import { mkdir, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const cliPath = path.join(repositoryRoot, "src/cli.ts");
const configPath = path.join(repositoryRoot, "config/projects.yml");

function runCli(args: string[], cwd = repositoryRoot) {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd,
    encoding: "utf8"
  });
}

describe("article-hub maintenance CLI", () => {
  test("doctor dry-run reports required local structure checks", () => {
    const result = runCli([
      "--dry-run",
      "doctor",
      "--root",
      repositoryRoot,
      "--config",
      configPath
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");

    const output = JSON.parse(result.stdout);

    expect(output).toMatchObject({
      ok: true,
      schema_version: "article-hub.doctor",
      dry_run: true,
      root: repositoryRoot
    });
    expect(output.checks.map((check: { name: string }) => check.name)).toEqual([
      "node-version",
      "package-lock",
      "project-config",
      "skills",
      "install-doc",
      "github-ci",
      "github-issue-form",
      "github-pr-template"
    ]);
  });

  test("setup requires --yes for writes and creates the local skeleton", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-setup-"));
    const dryRun = runCli(["--dry-run", "setup", "--root", root]);

    expect(dryRun.status).toBe(0);
    expect(JSON.parse(dryRun.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.setup",
      dry_run: true,
      applied: false
    });

    await expect(stat(path.join(root, "articles"))).rejects.toMatchObject({ code: "ENOENT" });

    const blocked = runCli(["setup", "--root", root]);

    expect(blocked.status).toBe(2);
    expect(JSON.parse(blocked.stdout)).toMatchObject({
      ok: false,
      error: {
        code: "CONFIRMATION_REQUIRED"
      }
    });

    const applied = runCli(["setup", "--root", root, "--yes"]);

    expect(applied.status).toBe(0);
    expect(JSON.parse(applied.stdout)).toMatchObject({
      ok: true,
      applied: true
    });
    const articlesStat = await stat(path.join(root, "articles"));
    expect(articlesStat.isDirectory()).toBe(true);
    await expect(readFile(path.join(root, "materials/README.md"), "utf8")).resolves.toContain(
      "materials"
    );
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

    const result = runCli(["--dry-run", "reconcile", "--state-file", stateFile]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.reconcile",
      dry_run: true,
      recovery_required: true,
      mutation_plan: {
        operations: [
          {
            kind: "gh-pr-create",
            branch: "article/12-webmcp-sdk-webmcp-sdk-practice"
          },
          {
            kind: "gh-issue-comment"
          }
        ]
      }
    });
  });
});

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
