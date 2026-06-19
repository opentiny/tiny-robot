import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const cliPath = path.join(repositoryRoot, "src/cli.ts");
const fixtureConfigPath = path.join(repositoryRoot, "tests/fixtures/projects-valid.yml");

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
}

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8"
  }).trim();
}

function createLocalRepositoryFixture() {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "article hub git fixture "));
  const source = path.join(tmp, "remote source");
  const remote = path.join(tmp, "remote.git");

  execFileSync("git", ["init", source]);
  git(source, ["config", "user.name", "Fixture"]);
  git(source, ["config", "user.email", "fixture@example.com"]);
  writeFileSync(path.join(source, "README.md"), "# fixture\n", "utf8");
  git(source, ["add", "README.md"]);
  git(source, ["commit", "-m", "first"]);
  const firstCommit = git(source, ["rev-parse", "HEAD"]);
  writeFileSync(path.join(source, "README.md"), "# fixture\n\nsecond\n", "utf8");
  git(source, ["commit", "-am", "second"]);
  const secondCommit = git(source, ["rev-parse", "HEAD"]);
  const defaultBranch = git(source, ["branch", "--show-current"]);
  execFileSync("git", ["clone", "--bare", source, remote]);

  const config = path.join(tmp, "projects.yml");
  writeFileSync(
    config,
    [
      "schema_version: article-hub.projects.v1",
      "projects:",
      "  - project_id: webmcp-sdk",
      "    display_name: WebMCP SDK",
      "    docs:",
      "      site_url: null",
      "      source_path: docs/",
      "    demo:",
      "      url: null",
      "    deepwiki:",
      "      url: null",
      "    terminology:",
      "      source: null",
      "    repositories:",
      "      - name: webmcp-sdk",
      `        url: ${JSON.stringify(remote)}`,
      `        default_ref: ${defaultBranch}`,
      "        role: primary-source",
      "        source_type: source",
      "      - name: fixed-source",
      `        url: ${JSON.stringify(remote)}`,
      `        ref: ${firstCommit}`,
      `        required_commit: ${firstCommit}`,
      "        role: comparison-source",
      "        source_type: source",
      ""
    ].join("\n"),
    "utf8"
  );

  return {
    tmp,
    config,
    remote,
    defaultBranch,
    firstCommit,
    secondCommit
  };
}

describe("checkout-sources CLI", () => {
  test("projects list/validate 输出稳定 JSON envelope", () => {
    const listed = runCli(["projects", "list", "--config", fixtureConfigPath]);
    const validated = runCli(["projects", "validate", "--config", fixtureConfigPath]);

    expect(listed.status).toBe(0);
    expect(validated.status).toBe(0);
    expect(listed.stderr).toBe("");
    expect(validated.stderr).toBe("");
    expect(JSON.parse(listed.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.projects.list.v1",
      projects: [
        { project_id: "webmcp-sdk" },
        { project_id: "genui-sdk" },
        { project_id: "tiny-robot" }
      ]
    });
    expect(JSON.parse(validated.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.projects.validate.v1",
      valid: true
    });
  });

  test("checkout-sources dry-run 不创建缓存目录，只输出 mutation plan", () => {
    const cacheDir = path.join(os.tmpdir(), "article hub dry run cache");
    rmSync(cacheDir, { force: true, recursive: true });

    const result = runCli([
      "--dry-run",
      "checkout-sources",
      "--config",
      fixtureConfigPath,
      "--project",
      "webmcp-sdk",
      "--cache-dir",
      cacheDir
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    const output = JSON.parse(result.stdout);

    expect(output).toMatchObject({
      ok: true,
      schema_version: "article-hub.checkout-sources.v1",
      dry_run: true
    });
    expect(output.mutation_plan.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "clone-or-fetch",
          repo: "webmcp-sdk"
        })
      ])
    );
    expect(existsSync(cacheDir)).toBe(false);
  });

  test("本地 git fixture checkout 到固定 Commit，并把浮动 ref resolve 成 Commit", () => {
    const fixture = createLocalRepositoryFixture();
    const cacheDir = path.join(fixture.tmp, "cache with spaces");

    const first = runCli([
      "checkout-sources",
      "--config",
      fixture.config,
      "--project",
      "webmcp-sdk",
      "--cache-dir",
      cacheDir
    ]);
    const second = runCli([
      "checkout-sources",
      "--config",
      fixture.config,
      "--project",
      "webmcp-sdk",
      "--cache-dir",
      cacheDir
    ]);

    expect(first.status).toBe(0);
    expect(second.status).toBe(0);
    const output = JSON.parse(first.stdout);
    const repeated = JSON.parse(second.stdout);

    expect(output.source_manifest.sources).toEqual([
      expect.objectContaining({
        repo: fixture.remote,
        requested_ref: fixture.defaultBranch,
        resolved_commit: fixture.secondCommit,
        fixed: true,
        source_type: "source",
        verified: true
      }),
      expect.objectContaining({
        repo: fixture.remote,
        requested_ref: fixture.firstCommit,
        resolved_commit: fixture.firstCommit,
        fixed: true,
        source_type: "source",
        verified: true
      })
    ]);
    expect(output.source_manifest.sources[0].checkout_path).toBe(
      path.join(cacheDir, "local", "webmcp-sdk")
    );
    expect(repeated.source_manifest.sources).toEqual(output.source_manifest.sources);
  });
});
