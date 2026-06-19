#!/usr/bin/env node
import { inspectIssue } from "./commands/inspect-issue.js";
import { ArticleHubError, toArticleHubError } from "./infrastructure/errors.js";
import { serializeJson } from "./infrastructure/json-output.js";

interface CliContext {
  dryRun: boolean;
}

interface ParsedCli {
  command: string;
  args: string[];
  context: CliContext;
}

/**
 * 执行 `article-hub` CLI，确保 stdout 只输出机器可解析 JSON。
 */
export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    const parsed = parseCli(argv);

    if (parsed.command === "inspect-issue") {
      const issueFile = readRequiredOption(parsed.args, "--issue-file");
      assertNoUnexpectedArgs(parsed.args, new Set(["--issue-file"]));
      const envelope = await inspectIssue({
        issueFile,
        dryRun: parsed.context.dryRun
      });

      process.stdout.write(serializeJson(envelope));
      return 0;
    }

    throw new ArticleHubError("UNKNOWN_COMMAND", `未知命令：${parsed.command}`, 2);
  } catch (error) {
    const cliError = toArticleHubError(error);

    process.stderr.write(`article-hub ${cliError.code}: ${cliError.message}\n`);
    process.stdout.write(
      serializeJson({
        ok: false,
        schema_version: "article-hub.error.v1",
        error: {
          code: cliError.code,
          message: cliError.message
        }
      })
    );

    return cliError.exitCode;
  }
}

function parseCli(argv: string[]): ParsedCli {
  const args = [...argv];
  const dryRunIndex = args.indexOf("--dry-run");
  const dryRun = dryRunIndex !== -1;

  if (dryRun) {
    args.splice(dryRunIndex, 1);
  }

  const command = args.shift();

  if (!command) {
    throw new ArticleHubError("UNKNOWN_COMMAND", "缺少命令", 2);
  }

  return {
    command,
    args,
    context: {
      dryRun
    }
  };
}

function readRequiredOption(args: string[], optionName: string): string {
  const optionIndex = args.indexOf(optionName);

  if (optionIndex === -1 || optionIndex === args.length - 1) {
    throw new ArticleHubError("MISSING_ARGUMENT", `缺少参数：${optionName}`, 2);
  }

  const value = args[optionIndex + 1];

  if (!value || value.startsWith("--")) {
    throw new ArticleHubError("MISSING_ARGUMENT", `缺少参数值：${optionName}`, 2);
  }

  return value;
}

function assertNoUnexpectedArgs(args: string[], knownOptions: Set<string>): void {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (knownOptions.has(arg)) {
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new ArticleHubError("UNKNOWN_OPTION", `未知参数：${arg}`, 2);
    }

    throw new ArticleHubError("UNEXPECTED_ARGUMENT", `多余参数：${arg}`, 2);
  }
}

main().then((exitCode) => {
  process.exitCode = exitCode;
});
