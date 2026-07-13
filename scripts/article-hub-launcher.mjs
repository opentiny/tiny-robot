#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const launcherDir = path.dirname(fileURLToPath(import.meta.url));
const cliEntry = path.resolve(launcherDir, "../dist/cli.js");

if (!existsSync(cliEntry)) {
  const message = `CLI 构建产物不存在：${cliEntry}。请在仓库根目录运行 pnpm install 和 pnpm run build。`;

  process.stderr.write(`article-hub CLI_NOT_BUILT: ${message}\n`);
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: false,
        schema_version: "article-hub.launcher.error",
        error: {
          code: "CLI_NOT_BUILT",
          message
        }
      },
      null,
      2
    )}\n`
  );
  process.exit(127);
}

const result = spawnSync(process.execPath, [cliEntry, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit"
});

if (result.error) {
  process.stderr.write(`article-hub LAUNCH_FAILED: ${result.error.message}\n`);
  process.exit(1);
}

process.exit(result.status ?? 1);
