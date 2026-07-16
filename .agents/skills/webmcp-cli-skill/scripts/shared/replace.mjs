/**
 * 将 marked.md 中的平台占位符替换为 CDN URL。
 *
 * replacements.json 形如: { "0": "https://...", "1": "https://..." }
 * stdout: JSON { ok, fixed_file, replaced_count, unresolved } 或失败 { ok, code, errors, ... }
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from './parse-args.mjs';

/** @param {string} s @returns {string} */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function looksLikeHttpUrl(url) {
  return /^https?:\/\//i.test(String(url).trim());
}

/**
 * 按 `platform.placeholderPrefix` 替换 marked 文件中的占位符并写出结果。
 * @param {string[]} argv
 * @param {{ placeholderPrefix: string }} platform
 * @returns {void}
 */
export function runReplace(argv, platform) {
  const args = parseArgs(argv);
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

  const prefix = platform.placeholderPrefix;
  const placeholderRe = new RegExp(`${escapeRegExp(prefix)}(\\d+)__`, 'g');
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

  const still = [...marked.matchAll(new RegExp(`${escapeRegExp(prefix)}(\\d+)__`, 'g'))].map((m) => m[1]);
  const unresolvedFinal = [...new Set([...unresolved, ...still])];

  if (unresolvedFinal.length) {
    console.log(
      JSON.stringify({
        ok: false,
        code: 'unresolved-placeholders',
        replaced_count: replacedCount,
        unresolved: unresolvedFinal,
        errors: unresolvedFinal.map((k) => `missing or invalid url for ${prefix}${k}__`),
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
