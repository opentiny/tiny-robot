#!/usr/bin/env node
/**
 * 将 check-page.js 包装为 page-agent-tool executeJavascript 的 -f 参数 JSON。
 *
 * 用法：
 *   node wrap-check-page.mjs [--out .cache/csdn-images/check-page-args.json]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {string[]} argv
 * @returns {Record<string, string | boolean>}
 */
function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a.startsWith('--') && i + 1 < argv.length) {
      out[a.slice(2)] = argv[++i];
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.error('Usage: node wrap-check-page.mjs [--out <check-page-args.json>]');
    process.exit(0);
  }

  const scriptPath = path.join(__dirname, 'check-page.js');
  const script = fs.readFileSync(scriptPath, 'utf8');
  const payload = {
    action: 'executeJavascript',
    script,
  };

  if (typeof args.out === 'string') {
    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8');
    console.log(JSON.stringify({ ok: true, out_file: outPath, script_bytes: Buffer.byteLength(script) }));
    return;
  }

  console.log(JSON.stringify(payload));
}

main();
