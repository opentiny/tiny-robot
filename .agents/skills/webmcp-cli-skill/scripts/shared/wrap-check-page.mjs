/**
 * 将 check-page.js 包装为 page-agent-tool executeJavascript 的 -f 参数 JSON。
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from './parse-args.mjs';

/**
 * 读取 check-page.js 并输出 executeJavascript payload JSON。
 * @param {string[]} argv
 * @param {{ checkPagePath: string }} opts
 * @returns {void}
 */
export function runWrapCheckPage(argv, opts) {
  const args = parseArgs(argv);
  if (args.help) {
    console.error('Usage: node wrap-check-page.mjs [--out <check-page-args.json>]');
    process.exit(0);
  }

  const script = fs.readFileSync(opts.checkPagePath, 'utf8');
  const payload = { action: 'executeJavascript', script };

  if (typeof args.out === 'string') {
    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8');
    console.log(
      JSON.stringify({
        ok: true,
        out_file: outPath,
        script_bytes: Buffer.byteLength(script),
      }),
    );
    return;
  }

  console.log(JSON.stringify(payload));
}
