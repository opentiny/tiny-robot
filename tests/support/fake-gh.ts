import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/** fake `gh` 的子进程环境和结构化调用记录。 */
export interface FakeGh {
  env: NodeJS.ProcessEnv;
  readCalls(): Promise<string[][]>;
}

/**
 * 创建只支持 Issue 读取和调用记录的 fake `gh` 外部边界。
 *
 * @param issue GitHub `issue view --json number,labels` 的返回值。
 * @returns 可注入 CLI 子进程的环境变量和结构化调用读取函数。
 */
export async function createFakeGh(issue: unknown): Promise<FakeGh> {
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-fake-gh-"));
  const scriptPath = path.join(root, "fake-gh.mjs");
  const issuePath = path.join(root, "issue.json");
  const logPath = path.join(root, "calls.jsonl");

  await writeFile(issuePath, JSON.stringify(issue), "utf8");
  await writeFile(
    scriptPath,
    [
      'import { appendFileSync, readFileSync } from "node:fs";',
      "const args = process.argv.slice(2);",
      'appendFileSync(process.env.FAKE_GH_LOG, `${JSON.stringify(args)}\\n`);',
      'if (args[0] === "issue" && args[1] === "view") {',
      '  process.stdout.write(readFileSync(process.env.FAKE_GH_ISSUE, "utf8"));',
      "  process.exit(0);",
      "}",
      "process.exit(0);"
    ].join("\n"),
    "utf8"
  );

  return {
    env: {
      ARTICLE_HUB_GH_COMMAND: JSON.stringify([process.execPath, scriptPath]),
      FAKE_GH_ISSUE: issuePath,
      FAKE_GH_LOG: logPath
    },
    async readCalls() {
      const raw = await readFile(logPath, "utf8").catch(() => "");

      return raw
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line) as string[]);
    }
  };
}
