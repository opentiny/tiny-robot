#!/usr/bin/env node
/**
 * 扫描 Markdown 图片引用，将异常项标记为 ![alt](__SEGMENTFAULT_IMG_N__)，并写出 markers.json。
 *
 * 用法：
 *   node mark.mjs --file draft.md --article-dir <文章目录> --out-dir <输出目录>
 *   node mark.mjs --file draft.md --broken-urls broken-urls.json --out-dir <输出目录>
 *
 * stdout: JSON { ok, marked_file, markers_file, marker_count } 或 { ok:false, code, errors }
 */

import fs from 'node:fs';
import path from 'node:path';

const MIME_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

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
 * @param {string} filePath
 * @returns {string}
 */
function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * 去掉 YAML Front Matter（若存在）。
 * @param {string} body
 * @returns {string}
 */
function stripFrontMatter(body) {
  if (!body.startsWith('---')) return body;
  const end = body.indexOf('\n---', 3);
  if (end === -1) return body;
  return body.slice(end + 4).replace(/^\s+/, '');
}

/**
 * 从 Markdown 图片目标中取出纯 URL/路径（去掉可选 title）。
 * @param {string} rawPath
 * @returns {string}
 */
function normalizeImageDest(rawPath) {
  let t = String(rawPath).trim();
  const withTitle = t.match(/^<?([^>\s]+)>?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*$/);
  if (withTitle) t = withTitle[1];
  else t = t.split(/\s+/)[0] || t;
  return t.replace(/^<|>$/g, '').trim();
}

/**
 * 将路径解析到 articleDir 下；含 `..` 时返回 null。
 * @param {string} articleDir
 * @param {string} rawPath
 * @returns {string | null}
 */
function resolveLocalPath(articleDir, rawPath) {
  const trimmed = normalizeImageDest(rawPath);
  const noQuery = trimmed.split(/[?#]/)[0];
  const rel = noQuery.replace(/^\.\//, '').split(/[/\\]/).filter((s) => s && s !== '.');
  if (rel.some((s) => s === '..')) return null;
  return path.join(articleDir, ...rel);
}

/**
 * @param {string} p
 * @returns {boolean}
 */
function isHttpUrl(p) {
  const s = p.trim();
  return /^https?:\/\//i.test(s) || s.startsWith('//');
}

/**
 * @param {string} p
 * @returns {boolean}
 */
function isDataUri(p) {
  return p.trim().startsWith('data:');
}

/**
 * @param {unknown} raw
 * @returns {Set<string>}
 */
function loadBrokenUrlSet(raw) {
  const set = new Set();
  if (raw == null) return set;
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string') set.add(item);
      else if (item && typeof item === 'object') {
        const o = /** @type {{ src?: string, resolved_src?: string }} */ (item);
        if (o.src) set.add(String(o.src));
        if (o.resolved_src) set.add(String(o.resolved_src));
      }
    }
    return set;
  }
  if (typeof raw === 'object' && raw !== null && 'broken' in raw) {
    return loadBrokenUrlSet(/** @type {{ broken: unknown }} */ (raw).broken);
  }
  return set;
}

/**
 * 精确匹配，或按文件名（basename）匹配；避免短字符串 substring 误伤。
 * @param {string} p
 * @param {Set<string>} brokenSet
 * @returns {boolean}
 */
function matchesBrokenSet(p, brokenSet) {
  if (brokenSet.has(p)) return true;
  const base = path.basename(p.split(/[?#]/)[0]);
  if (!base) return false;
  for (const b of brokenSet) {
    if (b === p) return true;
    const bBase = path.basename(String(b).split(/[?#]/)[0]);
    if (bBase && bBase === base) return true;
  }
  return false;
}

/**
 * @param {string} articleDir
 * @param {string} original
 * @returns {string | null}
 */
function guessLocalFromBasename(articleDir, original) {
  const base = path.basename(original.split(/[?#]/)[0]);
  if (!base || base.includes('__SEGMENTFAULT_IMG_')) return null;
  const candidate = path.join(articleDir, 'assets', base);
  return fs.existsSync(candidate) ? candidate : null;
}

/**
 * 屏蔽 fenced code block，避免示例中的 ![]() 被误标记。
 * @param {string} body
 * @param {(segment: string, inCode: boolean) => string} mapSegment
 * @returns {string}
 */
function mapOutsideCodeFences(body, mapSegment) {
  const parts = body.split(/(^```[\w-]*[^\n]*\n[\s\S]*?^```\s*$)/gm);
  return parts
    .map((part) => {
      const inCode = /^```/.test(part);
      return mapSegment(part, inCode);
    })
    .join('');
}

function printHelp() {
  console.error(`Usage:
  node mark.mjs --file <markdown> --out-dir <dir> [--article-dir <dir>] [--broken-urls <json>]
  node mark.mjs --markdown <text> --out-dir <dir> ...`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const outDir = typeof args['out-dir'] === 'string' ? args['out-dir'] : '';
  if (!outDir) {
    console.log(JSON.stringify({ ok: false, code: 'missing-out-dir', errors: ['--out-dir required'] }));
    process.exit(1);
  }

  let body = '';
  if (typeof args.file === 'string') {
    body = readText(path.resolve(args.file));
  } else if (typeof args.markdown === 'string') {
    body = args.markdown;
  } else {
    console.log(JSON.stringify({ ok: false, code: 'missing-input', errors: ['--file or --markdown required'] }));
    process.exit(1);
  }

  body = stripFrontMatter(body);

  /** @type {Set<string>} */
  let brokenSet = new Set();
  if (typeof args['broken-urls'] === 'string') {
    const raw = JSON.parse(readText(path.resolve(args['broken-urls'])));
    brokenSet = loadBrokenUrlSet(raw);
  }

  const articleDir =
    typeof args['article-dir'] === 'string' ? path.resolve(args['article-dir']) : '';

  /** @type {Array<{ index: number, alt: string, original: string, placeholder: string, local_path: string | null, reason: string }>} */
  const markers = [];
  /** @type {string[]} */
  const errors = [];

  let markerIndex = 0;

  const marked = mapOutsideCodeFences(body, (segment, inCode) => {
    if (inCode) return segment;
    // 每段使用新 RegExp，避免全局 lastIndex 跨段污染
    return segment.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, rawPath) => {
      const p = normalizeImageDest(rawPath);
      if (p.startsWith('__SEGMENTFAULT_IMG_') && p.endsWith('__')) return full;

      if (!String(alt).trim()) {
        errors.push(`empty-image-alt: ${p}`);
        return full;
      }

      /** @type {string | null} */
      let reason = null;
      if (matchesBrokenSet(p, brokenSet)) reason = 'listed-in-broken-urls';
      else if (isDataUri(p)) reason = 'data-uri';
      else if (!isHttpUrl(p)) reason = 'local-relative-path';

      if (!reason) return full;

      /** @type {string | null} */
      let localPath = null;

      if (articleDir && !isHttpUrl(p) && !isDataUri(p)) {
        const resolved = resolveLocalPath(articleDir, p);
        if (resolved == null) {
          errors.push(`path-traversal: ${p}`);
          return full;
        }
        const ext = path.extname(resolved).toLowerCase();
        if (!MIME_EXT.has(ext)) {
          errors.push(`unsupported-ext: ${p}`);
          return full;
        }
        if (!fs.existsSync(resolved)) {
          errors.push(`missing-local-image: ${p}`);
          return full;
        }
        localPath = resolved;
      } else if (articleDir) {
        localPath = guessLocalFromBasename(articleDir, p);
      }

      const placeholder = `__SEGMENTFAULT_IMG_${markerIndex}__`;
      markers.push({
        index: markerIndex,
        alt: String(alt),
        original: p,
        placeholder,
        local_path: localPath,
        reason,
      });
      markerIndex += 1;
      return `![${alt}](${placeholder})`;
    });
  });

  if (errors.length) {
    console.log(JSON.stringify({ ok: false, code: 'mark-validation-failed', errors }, null, 2));
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const markedFile = path.join(outDir, 'marked.md');
  const markersFile = path.join(outDir, 'markers.json');
  fs.writeFileSync(markedFile, marked, 'utf8');
  fs.writeFileSync(
    markersFile,
    JSON.stringify({ schema_version: 'segmentfault-image-markers.v1', markers }, null, 2),
    'utf8',
  );

  console.log(
    JSON.stringify({
      ok: true,
      marked_file: markedFile,
      markers_file: markersFile,
      marker_count: markers.length,
    }),
  );
}

main();
