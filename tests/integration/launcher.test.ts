import { copyFile, mkdir, mkdtemp, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, test } from "vitest";

import { parseJsonStdout, repositoryRoot } from "../support/cli.js";

describe("article-hub launcher", () => {
  test("构建产物缺失时返回稳定错误", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-launcher-"));
    const scriptsDir = path.join(root, "scripts");
    const launcher = path.join(scriptsDir, "article-hub-launcher.mjs");

    await mkdir(scriptsDir, { recursive: true });
    await copyFile(path.join(repositoryRoot, "scripts/article-hub-launcher.mjs"), launcher);

    const result = spawnSync(process.execPath, [launcher, "projects", "validate"], {
      cwd: root,
      encoding: "utf8"
    });

    expect(result.status).toBe(127);
    expect(result.stderr).toContain("CLI_NOT_BUILT");
    expect(parseJsonStdout(result)).toMatchObject({
      ok: false,
      schema_version: "article-hub.launcher.error",
      error: {
        code: "CLI_NOT_BUILT"
      }
    });
  });

  test("从带空格的工作目录透传参数和 cwd", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article hub launcher-"));
    const scriptsDir = path.join(root, "scripts");
    const distDir = path.join(root, "dist");
    const worktree = path.join(root, "work tree");
    const launcher = path.join(scriptsDir, "article-hub-launcher.mjs");

    await mkdir(scriptsDir, { recursive: true });
    await mkdir(distDir, { recursive: true });
    await mkdir(worktree, { recursive: true });
    await copyFile(path.join(repositoryRoot, "scripts/article-hub-launcher.mjs"), launcher);
    await writeFile(
      path.join(distDir, "cli.js"),
      "process.stdout.write(JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }));\n"
    );

    const result = spawnSync(process.execPath, [launcher, "update-status", "参数 含空格"], {
      cwd: worktree,
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    const output = parseJsonStdout<{ args: string[]; cwd: string }>(result);

    expect(output.args).toEqual(["update-status", "参数 含空格"]);
    expect(await realpath(output.cwd)).toBe(await realpath(worktree));
  });
});
