import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
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
const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
}

function writeArticleWithLocalPng(): string {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "article validation cli "));
  const assetPath = path.join(tmp, "assets/images/demo.png");
  mkdirSync(path.dirname(assetPath), { recursive: true });
  writeFileSync(assetPath, validPng);

  const target = path.join(tmp, "article.md");
  writeFileSync(
    target,
    `${readFileSync(articleFile, "utf8")}\n\n![中文截图](assets/images/demo.png)\n`,
    "utf8"
  );

  return target;
}

function writeArticleWithLocalLink(): string {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "article validation cli "));
  const linkedFile = path.join(tmp, "docs/guide.md");
  mkdirSync(path.dirname(linkedFile), { recursive: true });
  writeFileSync(linkedFile, "# 使用说明\n", "utf8");

  const target = path.join(tmp, "article.md");
  writeFileSync(
    target,
    `${readFileSync(articleFile, "utf8")}\n\n[使用说明][guide]\n\n[guide]: docs/guide.md\n`,
    "utf8"
  );

  return target;
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

  test("validate article CLI 接受合法本地 PNG 图片引用", () => {
    const result = runCli([
      "--dry-run",
      "validate",
      "article",
      "--article-file",
      writeArticleWithLocalPng(),
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

  test("validate article CLI 保持 envelope 并接受合法本地 reference link", () => {
    const result = runCli([
      "--dry-run",
      "validate",
      "article",
      "--article-file",
      writeArticleWithLocalLink(),
      "--config",
      configPath
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      schema_version: "article-hub.validate-article.v1",
      valid: true,
      blocking_issues: [],
      warnings: [],
      dry_run: true
    });
  });
});
