import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";

const fixtureConfigPath = path.join(repositoryRoot, "tests/fixtures/projects-valid.yml");

interface ProjectsListOutput {
  projects: Array<{ project_id: string }>;
}

interface CheckoutSourcesOutput {
  mutation_plan: {
    operations: Array<{ kind: string; repo?: string }>;
  };
  source_manifest: {
    sources: Array<{
      name: string;
      repo: string;
      requested_ref: string;
      resolved_commit: string;
      checkout_path: string;
      fixed: boolean;
      source_type: string;
      verified: boolean;
    }>;
  };
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
      "schema_version: article-hub.projects",
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
    const listed = runArticleHubCli(["projects", "list", "--config", fixtureConfigPath]);
    const validated = runArticleHubCli([
      "projects",
      "validate",
      "--config",
      fixtureConfigPath
    ]);

    const listedOutput = expectSuccessfulEnvelope<ProjectsListOutput>(
      listed,
      "article-hub.projects.list"
    );
    expect(listedOutput.projects).toEqual(
      expect.arrayContaining([expect.objectContaining({ project_id: "webmcp-sdk" })])
    );
    expectSuccessfulEnvelope(validated, "article-hub.projects.validate", {
      valid: true
    });
  });

  test("checkout-sources dry-run 不创建缓存目录，只输出 mutation plan", () => {
    const cacheDir = path.join(os.tmpdir(), "article hub dry run cache");
    rmSync(cacheDir, { force: true, recursive: true });

    const result = runArticleHubCli([
      "--dry-run",
      "checkout-sources",
      "--config",
      fixtureConfigPath,
      "--project",
      "webmcp-sdk",
      "--cache-dir",
      cacheDir
    ]);

    const output = expectSuccessfulEnvelope<CheckoutSourcesOutput>(
      result,
      "article-hub.checkout-sources",
      {
        dry_run: true
      }
    );
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

    const first = runArticleHubCli([
      "checkout-sources",
      "--config",
      fixture.config,
      "--project",
      "webmcp-sdk",
      "--cache-dir",
      cacheDir
    ]);
    const second = runArticleHubCli([
      "checkout-sources",
      "--config",
      fixture.config,
      "--project",
      "webmcp-sdk",
      "--cache-dir",
      cacheDir
    ]);

    const output = expectSuccessfulEnvelope<CheckoutSourcesOutput>(
      first,
      "article-hub.checkout-sources"
    );
    const repeated = expectSuccessfulEnvelope<CheckoutSourcesOutput>(
      second,
      "article-hub.checkout-sources"
    );
    const primarySource = output.source_manifest.sources.find(
      (source) => source.name === "webmcp-sdk"
    );
    const fixedSource = output.source_manifest.sources.find(
      (source) => source.name === "fixed-source"
    );

    expect(primarySource).toMatchObject({
      repo: fixture.remote,
      requested_ref: fixture.defaultBranch,
      resolved_commit: fixture.secondCommit,
      fixed: true,
      source_type: "source",
      verified: true
    });
    expect(fixedSource).toMatchObject({
      repo: fixture.remote,
      requested_ref: fixture.firstCommit,
      resolved_commit: fixture.firstCommit,
      fixed: true,
      source_type: "source",
      verified: true
    });
    expect(primarySource?.checkout_path).toBe(
      path.join(cacheDir, "local", "webmcp-sdk")
    );
    expect(
      repeated.source_manifest.sources.find(
        (source) => source.name === "webmcp-sdk"
      )
    ).toMatchObject({
      resolved_commit: fixture.secondCommit,
      checkout_path: primarySource?.checkout_path
    });
  });
});
