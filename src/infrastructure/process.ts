import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { ArticleHubError } from "./errors.js";

const execFileAsync = promisify(execFile);

/**
 * 执行外部命令并返回 stdout；失败时转换为稳定 CLI 错误码。
 *
 * @param program 可执行文件名。
 * @param args 传给可执行文件的参数列表。
 * @param options 执行目录和错误类型。
 * @returns 去掉首尾空白的 stdout。
 * @throws ArticleHubError 当子进程非零退出或无法启动时抛出。
 *
 * 测试进程可用 `ARTICLE_HUB_<PROGRAM>_COMMAND` 注入 JSON 字符串数组，
 * 第一个元素是可执行文件，后续元素会作为固定参数前缀。
 */
export async function runCommand(
  program: string,
  args: string[],
  options: {
    cwd?: string;
    errorCode?: "GIT_COMMAND_FAILED" | "GITHUB_COMMAND_FAILED";
  } = {}
): Promise<string> {
  const command = resolveCommand(program, args, options.errorCode ?? "GIT_COMMAND_FAILED");

  try {
    const result = await execFileAsync(command.program, command.args, {
      cwd: options.cwd,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 10
    });

    return result.stdout.trim();
  } catch (error) {
    const nodeError = error as { stderr?: string; message?: string };
    const message = nodeError.stderr?.trim() || nodeError.message || `${program} 命令执行失败`;

    throw new ArticleHubError(options.errorCode ?? "GIT_COMMAND_FAILED", message);
  }
}

function resolveCommand(
  program: string,
  args: string[],
  errorCode: "GIT_COMMAND_FAILED" | "GITHUB_COMMAND_FAILED"
): { program: string; args: string[] } {
  const overrideName = `ARTICLE_HUB_${program
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")}_COMMAND`;
  const rawOverride = process.env[overrideName];

  if (!rawOverride) {
    return { program, args };
  }

  let override: unknown;

  try {
    override = JSON.parse(rawOverride);
  } catch {
    throw new ArticleHubError(errorCode, `${overrideName} 必须是 JSON 字符串数组`);
  }

  if (
    !Array.isArray(override) ||
    override.length === 0 ||
    override.some((item) => typeof item !== "string" || item.length === 0)
  ) {
    throw new ArticleHubError(errorCode, `${overrideName} 必须是非空字符串数组`);
  }

  const [overrideProgram, ...overrideArgs] = override;

  return {
    program: overrideProgram,
    args: [...overrideArgs, ...args]
  };
}
