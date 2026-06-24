import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { runCommand } from "../../src/infrastructure/process.js";

const originalGhCommand = process.env.ARTICLE_HUB_GH_COMMAND;

afterEach(() => {
  if (originalGhCommand === undefined) {
    delete process.env.ARTICLE_HUB_GH_COMMAND;
    return;
  }

  process.env.ARTICLE_HUB_GH_COMMAND = originalGhCommand;
});

describe("runCommand", () => {
  test("外部命令可通过显式前缀替换为 Node 脚本 shim", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-hub-command-"));
    const scriptPath = path.join(root, "fake-gh.mjs");

    await writeFile(
      scriptPath,
      [
        "const args = process.argv.slice(2);",
        "process.stdout.write(JSON.stringify({ args }));"
      ].join("\n"),
      "utf8"
    );

    process.env.ARTICLE_HUB_GH_COMMAND = JSON.stringify([process.execPath, scriptPath]);

    const output = await runCommand("gh", ["issue", "view", "51"]);

    expect(JSON.parse(output)).toEqual({
      args: ["issue", "view", "51"]
    });
  });
});
