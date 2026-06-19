import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const cliPath = path.join(repositoryRoot, "src/cli.ts");
const articleFile = path.join(repositoryRoot, "tests/fixtures/articles/valid-article.md");
const configPath = path.join(repositoryRoot, "tests/fixtures/projects-valid.yml");

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
}

describe("validate article CLI", () => {
  test("validate article 输出稳定 JSON envelope 并保留 dry_run 标记", () => {
    const result = runCli([
      "--dry-run",
      "validate",
      "article",
      "--article-file",
      articleFile,
      "--config",
      configPath
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: true,
      schema_version: "article-hub.validate-article.v1",
      valid: true,
      blocking_issues: [],
      warnings: [],
      dry_run: true
    });
  });
});
