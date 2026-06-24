import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import {
  expectSuccessfulEnvelope,
  repositoryRoot,
  runArticleHubCli
} from "../support/cli.js";

const articleFile = path.join(repositoryRoot, "tests/fixtures/articles/valid-article.md");
const configPath = path.join(repositoryRoot, "tests/fixtures/projects-valid.yml");
const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);
const temporaryDirectories = new Set<string>();

afterEach(() => {
  for (const directory of temporaryDirectories) {
    rmSync(directory, { recursive: true, force: true });
  }

  temporaryDirectories.clear();
});

function createTemporaryDirectory(): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), "article validation cli "));
  temporaryDirectories.add(directory);
  return directory;
}

function writeArticleWithLocalPng(): string {
  const tmp = createTemporaryDirectory();
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
  const tmp = createTemporaryDirectory();
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
    const result = runArticleHubCli([
      "--dry-run",
      "validate",
      "article",
      "--article-file",
      articleFile,
      "--config",
      configPath
    ]);

    expectSuccessfulEnvelope(result, "article-hub.validate-article", {
      valid: true,
      blocking_issues: [],
      warnings: [],
      dry_run: true
    });
  });

  test("validate article CLI 接受合法本地 PNG 图片引用", () => {
    const result = runArticleHubCli([
      "--dry-run",
      "validate",
      "article",
      "--article-file",
      writeArticleWithLocalPng(),
      "--config",
      configPath
    ]);

    expectSuccessfulEnvelope(result, "article-hub.validate-article", {
      valid: true,
      blocking_issues: [],
      warnings: [],
      dry_run: true
    });
  });

  test("validate article CLI 保持 envelope 并接受合法本地 reference link", () => {
    const result = runArticleHubCli([
      "--dry-run",
      "validate",
      "article",
      "--article-file",
      writeArticleWithLocalLink(),
      "--config",
      configPath
    ]);

    expectSuccessfulEnvelope(result, "article-hub.validate-article", {
      valid: true,
      blocking_issues: [],
      warnings: [],
      dry_run: true
    });
  });
});
