/**
 * 扫描 Markdown 图片引用，将异常项标记为平台占位符，并写出 markers.json。
 *
 * 用法（由各平台薄壳入口调用）：
 *   node mark.mjs --file draft.md --article-dir <文章目录> --out-dir <输出目录>
 *   node mark.mjs --file draft.md --broken-urls broken-urls.json --out-dir <输出目录>
 *
 * stdout: JSON { ok, marked_file, markers_file, marker_count } 或 { ok:false, code, errors }
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from './parse-args.mjs';
import { stripFrontMatter } from './strip-frontmatter.mjs';

const MIME_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

/**
 * @param {string} filePath
 * @returns {string}
 */
function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * 从 Markdown 图片目标中取出纯 URL/路径（去掉可选 title）。
 * 支持 `path`、`<path>`、`path "title"`。
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
 * 是否为 CSDN「外链转存失败」占位 URL（img-home + origin_url）。
 * 此类 URL 虽属 csdnimg.cn，但不能当作正文配图 CDN。
 * @param {string} p
 * @returns {boolean}
 */
function isCsdnTransferFailureUrl(p) {
  const s = String(p || '').trim();
  if (!s) return false;
  try {
    const u = new URL(s, 'https://editor.csdn.net/');
    if (/^img-home\./i.test(u.hostname) && u.searchParams.has('origin_url')) return true;
  } catch {
    /* ignore */
  }
  return /img-home\.csdnimg\.cn/i.test(s) && /[?&]origin_url=/i.test(s);
}

/**
 * alt 是否已被 CSDN 改成转存失败提示文案。
 * @param {string} alt
 * @returns {boolean}
 */
function isTransferFailureAlt(alt) {
  return /外链图片转存失败|建议将图片保存下来直接上传/.test(String(alt || ''));
}

/**
 * 从占位 URL 的 origin_url 取出原稿相对路径（如 assets/foo.png）。
 * @param {string} p
 * @returns {string | null}
 */
function extractOriginAssetPath(p) {
  try {
    const u = new URL(String(p).trim(), 'https://editor.csdn.net/');
    const origin = u.searchParams.get('origin_url');
    if (!origin) return null;
    return decodeURIComponent(origin).replace(/^\.\//, '').trim() || null;
  } catch {
    const m = String(p).match(/[?&]origin_url=([^&]+)/i);
    if (!m) return null;
    try {
      return decodeURIComponent(m[1]).replace(/^\.\//, '').trim() || null;
    } catch {
      return null;
    }
  }
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
 * @param {string} placeholderPrefix
 * @returns {string | null}
 */
function guessLocalFromBasename(articleDir, original, placeholderPrefix) {
  const fromOrigin = extractOriginAssetPath(original);
  if (fromOrigin) {
    const resolved = resolveLocalPath(articleDir, fromOrigin);
    if (resolved && fs.existsSync(resolved)) return resolved;
  }
  const base = path.basename(original.split(/[?#]/)[0]);
  if (!base || base.includes(placeholderPrefix)) return null;
  const candidate = path.join(articleDir, 'assets', base);
  return fs.existsSync(candidate) ? candidate : null;
}

/**
 * 转存失败时从路径猜一个可读 alt。
 * @param {string} localOrRelative
 * @returns {string}
 */
function altFromPath(localOrRelative) {
  const base = path.basename(String(localOrRelative).split(/[?#]/)[0]);
  return base.replace(/\.[a-z0-9]+$/i, '') || base;
}

/**
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

/**
 * 按平台配置扫描并标记异常图片引用。
 * @param {string[]} argv
 * @param {{ placeholderPrefix: string, markersSchemaVersion: string }} platform
 * @returns {void}
 */
export function runMark(argv, platform) {
  const PLACEHOLDER_PREFIX = platform.placeholderPrefix;
  const args = parseArgs(argv);
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

  body = stripFrontMatter(body).body;

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
    return segment.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, rawPath) => {
      const p = normalizeImageDest(rawPath);
      if (p.startsWith(PLACEHOLDER_PREFIX) && p.endsWith('__')) return full;

      if (!String(alt).trim()) {
        errors.push(`empty-image-alt: ${p}`);
        return full;
      }

      /** @type {string | null} */
      let reason = null;
      if (matchesBrokenSet(p, brokenSet)) reason = 'listed-in-broken-urls';
      else if (isDataUri(p)) reason = 'data-uri';
      else if (!isHttpUrl(p)) reason = 'local-relative-path';
      else if (isCsdnTransferFailureUrl(p) || isTransferFailureAlt(alt)) {
        reason = 'csdn-transfer-failure-placeholder';
      }

      if (!reason) return full;

      /** @type {string | null} */
      let localPath = null;
      let outAlt = String(alt);

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
        localPath = guessLocalFromBasename(articleDir, p, PLACEHOLDER_PREFIX);
        // 占位 URL 的 basename 是平台图文件名，必须靠 origin_url 才能映射本地
        if (!localPath && reason === 'csdn-transfer-failure-placeholder') {
          const originRel = extractOriginAssetPath(p);
          if (originRel) {
            const resolved = resolveLocalPath(articleDir, originRel);
            if (resolved && fs.existsSync(resolved)) localPath = resolved;
          }
        }
        if (isTransferFailureAlt(outAlt)) {
          const originRel = extractOriginAssetPath(p);
          outAlt = altFromPath(localPath || originRel || p);
        }
      }

      const placeholder = `${PLACEHOLDER_PREFIX}${markerIndex}__`;
      markers.push({
        index: markerIndex,
        alt: outAlt,
        original: p,
        placeholder,
        local_path: localPath,
        reason,
      });
      markerIndex += 1;
      return `![${outAlt}](${placeholder})`;
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
    JSON.stringify({ schema_version: platform.markersSchemaVersion, markers }, null, 2),
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
