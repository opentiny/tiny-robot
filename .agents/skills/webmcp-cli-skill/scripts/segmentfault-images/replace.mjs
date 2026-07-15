#!/usr/bin/env node
/**
 * 将 marked.md 中的 __SEGMENTFAULT_IMG_N__ 占位符替换为思否 CDN URL。
 *
 * 用法：
 *   node replace.mjs --marked marked.md --replacements replacements.json --out fixed.md
 *
 * replacements.json 形如: { "0": "https://image-static.segmentfault.com/...", "1": "https://..." }
 * stdout: JSON { ok, fixed_file, replaced_count, unresolved }
 */

import fs from 'node:fs';
import path from 'node:path';

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

/**
 * @param {string} url
 * @returns {boolean}
 */
function looksLikeHttpUrl(url) {
  return /^https?:\/\//i.test(String(url).trim());
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.error('Usage: node replace.mjs --marked <file> --replacements <json> --out <file>');
    process.exit(0);
  }

  if (typeof args.marked !== 'string' || typeof args.replacements !== 'string' || typeof args.out !== 'string') {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'missing-args',
        errors: ['--marked, --replacements and --out required'],
      }),
    );
    process.exit(1);
  }

  const markedPath = path.resolve(args.marked);
  const replacementsPath = path.resolve(args.replacements);
  const outPath = path.resolve(args.out);

  if (!fs.existsSync(markedPath)) {
    console.log(JSON.stringify({ ok: false, code: 'marked-not-found', errors: [markedPath] }));
    process.exit(1);
  }
  if (!fs.existsSync(replacementsPath)) {
    console.log(JSON.stringify({ ok: false, code: 'replacements-not-found', errors: [replacementsPath] }));
    process.exit(1);
  }

  let marked = fs.readFileSync(markedPath, 'utf8');
  /** @type {Record<string, string>} */
  const replacements = JSON.parse(fs.readFileSync(replacementsPath, 'utf8'));

  /** @type {string[]} */
  const unresolved = [];
  let replacedCount = 0;

  const placeholderRe = /__SEGMENTFAULT_IMG_(\d+)__/g;
  const found = new Set();
  for (const m of marked.matchAll(placeholderRe)) {
    found.add(m[1]);
  }

  for (const key of found) {
    const url = replacements[key] ?? replacements[Number(key)];
    if (!url || !looksLikeHttpUrl(url)) {
      unresolved.push(key);
      continue;
    }
  }

  marked = marked.replace(placeholderRe, (full, num) => {
    const url = replacements[num] ?? replacements[Number(num)];
    if (!url || !looksLikeHttpUrl(url)) return full;
    replacedCount += 1;
    return String(url).trim();
  });

  // 仍残留的占位符
  const still = [...marked.matchAll(/__SEGMENTFAULT_IMG_(\d+)__/g)].map((m) => m[1]);
  const unresolvedFinal = [...new Set([...unresolved, ...still])];

  if (unresolvedFinal.length) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'unresolved-placeholders',
        replaced_count: replacedCount,
        unresolved: unresolvedFinal,
        errors: unresolvedFinal.map((k) => `missing or invalid url for __SEGMENTFAULT_IMG_${k}__`),
      }),
    );
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, marked, 'utf8');

  console.log(
    JSON.stringify({
      ok: true,
      fixed_file: outPath,
      replaced_count: replacedCount,
      unresolved: [],
    }),
  );
}

main();
