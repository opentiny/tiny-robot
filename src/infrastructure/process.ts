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
 */
export async function runCommand(
  program: string,
  args: string[],
  options: {
    cwd?: string;
    errorCode?: "GIT_COMMAND_FAILED" | "GITHUB_COMMAND_FAILED";
  } = {}
): Promise<string> {
  try {
    const result = await execFileAsync(program, args, {
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
