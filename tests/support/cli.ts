import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect } from "vitest";

/**
 * 测试进程中的仓库根目录。
 */
export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const cliPath = path.join(repositoryRoot, "src/cli.ts");

/**
 * CLI 子进程执行结果的最小结构。
 */
export interface CliResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/**
 * 通过真实 Node 进程调用 article-hub CLI，覆盖参数解析和 stdout/stderr 序列化。
 *
 * @param args CLI 参数，不包含 Node、tsx 和入口文件。
 * @param options 可选工作目录；默认使用仓库根目录。
 * @returns 子进程执行结果，stdout/stderr 已按 UTF-8 解码。
 */
export function runArticleHubCli(
  args: string[],
  options: { cwd?: string } = {}
): CliResult {
  return spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: options.cwd ?? repositoryRoot,
    encoding: "utf8"
  });
}

/**
 * 解析 CLI stdout 中的 JSON envelope。
 *
 * @param result CLI 执行结果。
 * @returns 解析后的 JSON 值。
 * @throws SyntaxError 当 stdout 不是合法 JSON 时抛出。
 */
export function parseJsonStdout<T = Record<string, unknown>>(result: CliResult): T {
  return JSON.parse(result.stdout) as T;
}

/**
 * 断言 CLI 成功返回指定 schema 的稳定 envelope。
 *
 * @param result CLI 执行结果。
 * @param schemaVersion 期望的 `schema_version`。
 * @param partial 额外需要匹配的公开字段。
 * @returns 解析后的 JSON envelope，供测试继续断言关键行为。
 */
export function expectSuccessfulEnvelope<T = Record<string, unknown>>(
  result: CliResult,
  schemaVersion: string,
  partial: Record<string, unknown> = {}
): T {
  expect(result.status).toBe(0);
  expect(result.stderr).toBe("");

  const output = parseJsonStdout<T>(result);

  expect(output).toMatchObject({
    ok: true,
    schema_version: schemaVersion,
    ...partial
  });

  return output;
}

/**
 * 断言 CLI 失败时返回指定错误码的稳定 envelope。
 *
 * @param result CLI 执行结果。
 * @param code 期望的稳定错误码。
 * @param status 期望的进程退出码。
 * @returns 解析后的 JSON envelope，供测试继续断言关键行为。
 */
export function expectErrorEnvelope<T = Record<string, unknown>>(
  result: CliResult,
  code: string,
  status: number
): T {
  expect(result.status).toBe(status);

  const output = parseJsonStdout<T>(result);

  expect(output).toMatchObject({
    ok: false,
    schema_version: "article-hub.error",
    error: {
      code
    }
  });

  return output;
}
